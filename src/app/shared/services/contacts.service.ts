import { Injectable, inject, signal, OnDestroy, effect } from '@angular/core';
import { SupabaseService } from './supabase';
import { ContactPerson } from '../models/contact-person.model';
import { RealtimeChannel } from '@supabase/supabase-js';
import { OrganizationService } from './organization.service';

/**
 * Service for managing contact persons via Supabase
 * Includes realtime subscriptions for live updates
 */
@Injectable({
    providedIn: 'root',
})
export class ContactsService implements OnDestroy {
    private supabase = inject(SupabaseService);
    private orgService = inject(OrganizationService);
    private readonly TABLE_NAME = 'contacts';
    private realtimeChannel: RealtimeChannel | null = null;

    private _contacts = signal<ContactPerson[]>([]);
    private _loading = signal(false);
    private _error = signal<string | null>(null);

    /** Contacts list (readonly signal) */
    readonly contacts = this._contacts.asReadonly();

    /** Loading state (readonly signal) */
    readonly loading = this._loading.asReadonly();

    /** Error message (readonly signal) */
    readonly error = this._error.asReadonly();

    constructor() {
        // Auto-refresh when organization changes
        effect(() => {
            const orgId = this.orgService.currentOrgId();
            if (orgId) {
                this.fetchContacts();
            } else {
                this._contacts.set([]);
            }
        });
    }

    /**
     * Fetch all contacts from Supabase filtered by organization
     */
    async fetchContacts(): Promise<void> {
        const orgId = this.orgService.currentOrgId();
        if (!orgId) return;

        this._loading.set(true);
        this._error.set(null);

        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .select('*')
            .eq('organization_id', orgId)
            .order('name', { ascending: true });

        if (error) {
            this._error.set(error.message);
            console.error('Error fetching contacts:', error);
        } else {
            this._contacts.set(data ?? []);
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
        const currentOrgId = this.orgService.currentOrgId();
        if (!currentOrgId) return;

        const eventType = payload.eventType;
        const newRecord = payload.new as ContactPerson;
        const oldRecord = payload.old as ContactPerson;

        switch (eventType) {
            case 'INSERT':
                if (newRecord.organization_id === currentOrgId) {
                    this._contacts.update(contacts => {
                        const sorted = [...contacts, newRecord]
                            .sort((a, b) => a.name.localeCompare(b.name));
                        return sorted;
                    });
                }
                break;
            case 'UPDATE':
                if (newRecord.organization_id === currentOrgId) {
                    this._contacts.update(contacts =>
                        contacts.map(c => (c.id === newRecord.id ? newRecord : c))
                    );
                } else {
                    // If updated record no longer belongs to org (or moved), remove it
                    this._contacts.update(contacts =>
                        contacts.filter(c => c.id !== newRecord.id)
                    );
                }
                break;
            case 'DELETE':
                this._contacts.update(contacts =>
                    contacts.filter(c => c.id !== oldRecord.id)
                );
                break;
        }
    }

    ngOnDestroy() {
        if (this.realtimeChannel) {
            this.supabase.unsubscribe(this.realtimeChannel);
        }
    }

    /**
     * Add a new contact
     */
    async addContact(contact: Omit<ContactPerson, 'id' | 'created_at' | 'updated_at'>) {
        const orgId = this.orgService.currentOrgId();
        if (!orgId) throw new Error('No organization selected');

        console.log('Adding contact:', contact);
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .insert({ ...contact, organization_id: orgId })
            .select()
            .single();

        if (error) {
            console.error('Supabase Error:', error);
            throw new Error(error.message);
        }

        console.log('Contact added:', data);
        return data;
    }

    /**
     * Update an existing contact
     */
    async updateContact(id: string, updates: Partial<ContactPerson>) {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    /**
     * Delete a contact
     */
    async deleteContact(id: string) {
        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(error.message);
        }
    }
}
