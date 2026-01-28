import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { SupabaseService } from './supabase';
import { WikiDoc } from '../models/wiki-doc.model';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Service for managing wiki documents via Supabase
 * Includes realtime subscriptions for live updates
 */
@Injectable({
    providedIn: 'root',
})
export class WikiService implements OnDestroy {
    private supabase = inject(SupabaseService);
    private readonly TABLE_NAME = 'wiki_docs';
    private realtimeChannel: RealtimeChannel | null = null;

    private _docs = signal<WikiDoc[]>([]);
    private _loading = signal(false);
    private _error = signal<string | null>(null);

    readonly docs = this._docs.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    async fetchDocs(orgId: string): Promise<void> {
        this._loading.set(true);
        this._error.set(null);
        
        console.log('DEBUG: WikiService.fetchDocs called for Org:', orgId);

        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .select('*')
            .eq('organization_id', orgId)
            .order('last_updated', { ascending: false });

        if (error) {
            console.error('DEBUG: Error fetching wiki docs:', error);
            this._error.set(error.message);
        } else {
            console.log('DEBUG: Fetched wiki docs:', data?.length, data);
            this._docs.set(data ?? []);
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
        const newRecord = payload.new as WikiDoc;
        const oldRecord = payload.old as WikiDoc;

        switch (eventType) {
            case 'INSERT':
                this._docs.update(docs => [newRecord, ...docs]);
                break;
            case 'UPDATE':
                this._docs.update(docs =>
                    docs.map(d => (d.id === newRecord.id ? newRecord : d))
                );
                break;
            case 'DELETE':
                this._docs.update(docs =>
                    docs.filter(d => d.id !== oldRecord.id)
                );
                break;
        }
    }

    ngOnDestroy() {
        if (this.realtimeChannel) {
            this.supabase.unsubscribe(this.realtimeChannel);
        }
    }

    async addDoc(doc: Omit<WikiDoc, 'id' | 'created_at' | 'updated_at'>) {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .insert(doc)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async updateDoc(id: string, updates: Partial<WikiDoc>) {
        const { data, error } = await this.supabase
            .from(this.TABLE_NAME)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async deleteDoc(id: string) {
        const { error } = await this.supabase
            .from(this.TABLE_NAME)
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
    }
}
