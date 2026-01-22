import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { SupabaseService } from './supabase';
import { OrganizationService } from './organization.service';
import { Member } from '../models/member.model';
import { RealtimeChannel } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/**
 * Service for managing members via Supabase
 * Includes realtime subscriptions for live updates
 * Includes invitation and auth user management
 */
@Injectable({
    providedIn: 'root',
})
export class MembersService implements OnDestroy {
    private supabase = inject(SupabaseService);
    private org = inject(OrganizationService);
    private readonly TABLE_NAME = 'members';
    private realtimeChannel: RealtimeChannel | null = null;
    private readonly FUNCTIONS_URL = `${environment.supabase.url}/functions/v1`;

    private _members = signal<Member[]>([]);
    private _loading = signal(false);
    private _error = signal<string | null>(null);

    readonly members = this._members.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    async fetchMembers(): Promise<void> {
        this._loading.set(true);
        this._error.set(null);

        const orgId = this.org.currentOrgId();

        let query = this.supabase
            .from(this.TABLE_NAME)
            .select('*')
            .order('name', { ascending: true });

        // Filter by organization if set
        if (orgId) {
            query = query.eq('organization_id', orgId);
        }

        const { data, error } = await query;

        if (error) {
            this._error.set(error.message);
            console.error('Error fetching members:', error);
        } else {
            this._members.set(data ?? []);
        }

        this._loading.set(false);
        this.subscribeToRealtime();
    }

    private subscribeToRealtime() {
        if (this.realtimeChannel) return;

        this.realtimeChannel = this.supabase.subscribeToTable(
            this.TABLE_NAME,
            (payload: any) => {
                this.handleRealtimeUpdate(payload);
            }
        );
    }

    private handleRealtimeUpdate(payload: any) {
        const eventType = payload.eventType;
        const newRecord = payload.new as Member;
        const oldRecord = payload.old as Member;

        switch (eventType) {
            case 'INSERT':
                this._members.update(members => {
                    if (members.some(m => m.id === newRecord.id)) return members;
                    const sorted = [...members, newRecord]
                        .sort((a, b) => a.name.localeCompare(b.name));
                    return sorted;
                });
                break;
            case 'UPDATE':
                this._members.update(members =>
                    members.map(m => (m.id === newRecord.id ? newRecord : m))
                );
                break;
            case 'DELETE':
                this._members.update(members =>
                    members.filter(m => m.id !== oldRecord.id)
                );
                break;
        }
    }

    ngOnDestroy() {
        if (this.realtimeChannel) {
            this.supabase.unsubscribe(this.realtimeChannel);
        }
    }

    async addMember(member: Omit<Member, 'id' | 'created_at' | 'updated_at'>) {
        // Add organization_id to new members
        const orgId = this.org.currentOrgId();
        const memberWithOrg = orgId ? { ...member, organization_id: orgId } : member;

        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .insert(memberWithOrg)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async importMembers(members: Partial<Member>[]) {
        // 1. Get existing emails to identify updates
        const { data: existingMembers, error: fetchError } = await this.supabase
            .from(this.TABLE_NAME)
            .select('id, email, status, name, join_date');

        if (fetchError) throw new Error(fetchError.message);

        // Map email to full record to access current values
        const emailMap = new Map<string, any>();
        existingMembers?.forEach(m => {
            if (m.email) emailMap.set(m.email.toLowerCase(), m);
        });

        // 2. Prepare Data Splitting (PostgREST requires uniform keys in batch)
        const toUpdate: any[] = [];
        const toInsert: any[] = [];

        members.forEach(m => {
            const email = m.email?.toLowerCase();
            if (email && emailMap.has(email)) {
                // UPDATE: Has ID. 
                // We MUST include existing NOT NULL values (like status) to satisfy "INSERT ... ON CONFLICT" constraints
                const current = emailMap.get(email);
                toUpdate.push({
                    status: current.status, // Pre-fill with existing status so upsert doesn't fail on NOT NULL
                    name: current.name,     // Pre-fill name just in case
                    join_date: current.join_date, // Pre-fill join_date
                    ...m,                   // Overwrite with imported data if present
                    id: current.id
                });
            } else {
                // INSERT: No ID, apply defaults
                toInsert.push({
                    status: 'Active',
                    role: 'Mitglied',
                    join_date: new Date().toLocaleDateString('de-DE'),
                    app_role: 'member',
                    ...m
                });
            }
        });

        const results: any[] = [];

        // 3. Execute Operations
        if (toUpdate.length > 0) {
            const { data, error } = await this.supabase
                .from(this.TABLE_NAME)
                .upsert(toUpdate)
                .select();

            if (error) throw new Error(error.message);
            if (data) results.push(...data);
        }

        if (toInsert.length > 0) {
            const { data, error } = await this.supabase
                .from(this.TABLE_NAME)
                .insert(toInsert)
                .select();

            if (error) throw new Error(error.message);
            if (data) results.push(...data);
        }

        return results;
    }

    async updateMember(id: string, updates: Partial<Member>) {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    /**
     * Delete a member and their associated auth user
     */
    async deleteMember(id: string) {
        // First, get the member to check for user_id
        const member = this._members().find(m => m.id === id);

        // Delete auth user if linked
        if (member?.user_id) {
            await this.deleteAuthUser(member.user_id);
        }

        // Delete member from database
        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
    }

    async deleteMany(ids: string[]) {
        // Get members to delete
        const membersToDelete = this._members().filter(m => ids.includes(m.id!));

        // Delete auth users for any linked members
        for (const member of membersToDelete) {
            if (member.user_id) {
                await this.deleteAuthUser(member.user_id);
            }
        }

        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .delete()
            .in('id', ids);

        if (error) throw new Error(error.message);
    }

    /**
     * Invite a member by sending them an email invitation
     * This creates an auth user and links it to the member
     */
    async inviteMember(memberId: string, email: string): Promise<{ userId?: string; message: string; type?: string }> {
        // Get current session - session() returns a signal, so we call it to get the value
        const currentSession = this.supabase.session();
        if (!currentSession) {
            throw new Error('Nicht angemeldet');
        }

        console.log('Inviting member with session:', currentSession.access_token?.substring(0, 20) + '...');

        const response = await fetch(`${this.FUNCTIONS_URL}/invite-member`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentSession.access_token}`,
                'apikey': environment.supabase.anonKey,
            },
            body: JSON.stringify({
                email,
                memberId,
                // Only send redirectTo for localhost development, 
                // otherwise let the Edge Function use the configured SITE_URL
                ...(window.location.hostname === 'localhost'
                    ? { redirectTo: `${window.location.origin}/auth/callback` }
                    : {}),
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Einladung konnte nicht gesendet werden');
        }

        return result;
    }

    /**
     * Delete an auth user via Edge Function
     */
    private async deleteAuthUser(userId: string): Promise<void> {
        const session = this.supabase.session();
        if (!session) {
            console.warn('Nicht angemeldet, überspringe Auth-User-Löschung');
            return;
        }

        try {
            const response = await fetch(`${this.FUNCTIONS_URL}/delete-auth-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                    'apikey': environment.supabase.anonKey,
                },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) {
                const result = await response.json();
                console.error('Failed to delete auth user:', result.error);
            }
        } catch (e) {
            console.error('Error deleting auth user:', e);
        }
    }

    /**
     * Check if a member has been invited (has user_id)
     */
    isInvited(member: Member): boolean {
        return !!member.user_id;
    }

    /**
     * Check if a member is connected (user_id exists and email_confirmed)
     * For now, just checks if user_id exists
     */
    isConnected(member: Member): boolean {
        return !!member.user_id;
    }
}
