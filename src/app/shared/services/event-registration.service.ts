import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase';
import { AuthService } from './auth.service';

export type RegistrationStatus = 'confirmed' | 'maybe' | 'cancelled';

export interface EventRegistration {
    id?: string;
    event_id: string;
    member_id: string;
    status: RegistrationStatus;
    registered_at?: string;
    note?: string;
    // Joined
    member?: { id: string; name: string; avatar_url?: string };
}

@Injectable({ providedIn: 'root' })
export class EventRegistrationService {
    private supabase = inject(SupabaseService);
    private auth = inject(AuthService);

    /** Current user's registrations (event_id -> status) */
    myRegistrations = signal<Map<string, RegistrationStatus>>(new Map());

    /** Loading state */
    loading = signal(false);

    /**
     * Fetch all registrations for the current user
     */
    async fetchMyRegistrations(): Promise<void> {
        const memberId = this.auth.currentMember()?.id;
        if (!memberId) {
            this.myRegistrations.set(new Map());
            return;
        }

        const { data, error } = await this.supabase.client
            .from('event_registrations')
            .select('event_id, status')
            .eq('member_id', memberId);

        if (error) {
            console.error('Error fetching registrations:', error);
            return;
        }

        const map = new Map<string, RegistrationStatus>();
        data?.forEach(r => map.set(r.event_id, r.status as RegistrationStatus));
        this.myRegistrations.set(map);
    }

    /**
     * Get registrations for a specific event
     */
    async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
        const { data, error } = await this.supabase.client
            .from('event_registrations')
            .select(`
                *,
                member:members(id, name, avatar_url)
            `)
            .eq('event_id', eventId)
            .in('status', ['confirmed', 'maybe'])
            .order('registered_at', { ascending: true });

        if (error) throw new Error(error.message);
        return data as EventRegistration[];
    }

    /**
     * Get count of confirmed registrations for an event
     */
    async getRegistrationCount(eventId: string): Promise<number> {
        const { count, error } = await this.supabase.client
            .from('event_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', eventId)
            .eq('status', 'confirmed');

        if (error) throw new Error(error.message);
        return count ?? 0;
    }

    /**
     * Register current user for an event
     */
    async register(
        eventId: string,
        status: RegistrationStatus = 'confirmed',
        note?: string
    ): Promise<void> {
        const memberId = this.auth.currentMember()?.id;
        if (!memberId) throw new Error('Nicht eingeloggt');

        this.loading.set(true);

        const { error } = await this.supabase.client
            .from('event_registrations')
            .upsert({
                event_id: eventId,
                member_id: memberId,
                status,
                note,
                registered_at: new Date().toISOString(),
            }, { onConflict: 'event_id,member_id' });

        this.loading.set(false);

        if (error) throw new Error(error.message);

        // Update local state
        this.myRegistrations.update(map => {
            const newMap = new Map(map);
            newMap.set(eventId, status);
            return newMap;
        });
    }

    /**
     * Cancel registration for current user
     */
    async unregister(eventId: string): Promise<void> {
        const memberId = this.auth.currentMember()?.id;
        if (!memberId) throw new Error('Nicht eingeloggt');

        this.loading.set(true);

        const { error } = await this.supabase.client
            .from('event_registrations')
            .delete()
            .eq('event_id', eventId)
            .eq('member_id', memberId);

        this.loading.set(false);

        if (error) throw new Error(error.message);

        // Update local state
        this.myRegistrations.update(map => {
            const newMap = new Map(map);
            newMap.delete(eventId);
            return newMap;
        });
    }

    /**
     * Check if current user is registered for an event
     */
    isRegistered(eventId: string): RegistrationStatus | null {
        return this.myRegistrations().get(eventId) ?? null;
    }

    /**
     * Get registration status label
     */
    getStatusLabel(status: RegistrationStatus): string {
        const labels: Record<RegistrationStatus, string> = {
            confirmed: 'Zugesagt',
            maybe: 'Vielleicht',
            cancelled: 'Abgesagt',
        };
        return labels[status];
    }
    /**
     * Get confirmed registrations for multiple events (for list view bubbles)
     */
    async getRegistrationsSummary(eventIds: string[]): Promise<Map<string, { count: number, avatars: { name: string, avatar_url?: string }[] }>> {
        if (!eventIds.length) return new Map();

        const { data, error } = await this.supabase.client
            .from('event_registrations')
            .select(`
                event_id,
                member:members(name, avatar_url)
            `)
            .in('event_id', eventIds)
            .eq('status', 'confirmed')
            .order('registered_at', { ascending: true });

        if (error) {
            console.error('Error loading summaries:', error);
            return new Map();
        }

        const map = new Map<string, { count: number, avatars: any[] }>();

        // Initialize
        eventIds.forEach(id => map.set(id, { count: 0, avatars: [] }));

        data?.forEach((row: any) => {
            const entry = map.get(row.event_id);
            if (entry) {
                entry.count++;
                if (entry.avatars.length < 5) {
                    entry.avatars.push(row.member);
                }
            }
        });

        return map;
    }
}
