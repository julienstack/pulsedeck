import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { SupabaseService } from './supabase';
import { OrganizationService } from './organization.service';
import { AuthService } from './auth.service';
import { CalendarEvent } from '../models/calendar-event.model';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Service for managing calendar events via Supabase
 * Includes realtime subscriptions for live updates
 */
@Injectable({
    providedIn: 'root',
})
export class EventsService implements OnDestroy {
    private supabase = inject(SupabaseService);
    private org = inject(OrganizationService);
    private auth = inject(AuthService);
    private readonly TABLE_NAME = 'events';
    private realtimeChannel: RealtimeChannel | null = null;

    private _events = signal<CalendarEvent[]>([]);
    private _loading = signal(false);
    private _error = signal<string | null>(null);

    readonly events = this._events.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    async fetchEvents(): Promise<void> {
        this._loading.set(true);
        this._error.set(null);

        const orgId = this.org.currentOrgId();

        let query = this.supabase
            .from(this.TABLE_NAME)
            .select('*')
            .order('date', { ascending: true });

        if (orgId) {
            query = query.eq('organization_id', orgId);
        }

        const { data, error } = await query;

        if (error) {
            this._error.set(error.message);
            console.error('Error fetching events:', error);
        } else {
            this._events.set(data ?? []);
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
        const newRecord = payload.new as CalendarEvent;
        const oldRecord = payload.old as CalendarEvent;

        switch (eventType) {
            case 'INSERT':
                this._events.update(events => {
                    const sorted = [...events, newRecord].sort(
                        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                    );
                    return sorted;
                });
                break;
            case 'UPDATE':
                this._events.update(events =>
                    events.map(e => (e.id === newRecord.id ? newRecord : e))
                );
                break;
            case 'DELETE':
                this._events.update(events =>
                    events.filter(e => e.id !== oldRecord.id)
                );
                break;
        }
    }

    ngOnDestroy() {
        if (this.realtimeChannel) {
            this.supabase.unsubscribe(this.realtimeChannel);
        }
    }

    async addEvent(
        event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>
    ) {
        const orgId = this.org.currentOrgId();
        const eventWithOrg = orgId ? { ...event, organization_id: orgId } : event;

        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .insert(eventWithOrg)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async updateEvent(id: string, updates: Partial<CalendarEvent>) {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        // Realtime will handle the update
        return data;
    }

    async deleteEvent(id: string) {
        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
        // Realtime will handle the update
    }

    /**
     * Get iCal subscription URL
     * @param agId Optional: Filter by working group
     */
    getICalUrl(agId?: string): string {
        const baseUrl = this.supabase.getSupabaseUrl();
        let url = `${baseUrl}/functions/v1/ical-export`;

        const params = new URLSearchParams();

        const member = this.auth.currentMember();
        if (member?.calendar_token) {
            params.set('token', member.calendar_token);
        } else {
            // Fallback to org ID (public events only)
            const orgId = this.org.currentOrgId();
            if (orgId) {
                params.set('org', orgId);
            }
        }

        if (agId) {
            params.set('ag', agId);
        }
        params.set('download', 'false'); // For subscription, not download

        const queryString = params.toString();
        return queryString ? `${url}?${queryString}` : url;
    }

    /**
     * Download iCal file
     * @param agId Optional: Filter by working group
     */
    async downloadICalFile(agId?: string): Promise<void> {
        const baseUrl = this.supabase.getSupabaseUrl();

        const params = new URLSearchParams();
        params.set('download', 'true');

        const member = this.auth.currentMember();
        if (member?.calendar_token) {
            params.set('token', member.calendar_token);
        } else {
            const orgId = this.org.currentOrgId();
            if (orgId) {
                params.set('org', orgId);
            }
        }

        if (agId) {
            params.set('ag', agId);
        }

        const url = `${baseUrl}/functions/v1/ical-export?${params.toString()}`;

        // Open download in new tab
        window.open(url, '_blank');
    }

    /**
     * Get a single event by ID (public access allowed if RLS permits)
     */
    async getEventById(id: string): Promise<CalendarEvent & { organization?: { name: string, slug: string, theme_color: string, logo_url: string } }> {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .select(`
                *,
                organization:organizations (
                    name,
                    slug,
                    theme_color,
                    logo_url
                )
            `)
            .eq('id', id)
            .single();

        if (error) throw new Error(error.message);
        return data as any;
    }
}
