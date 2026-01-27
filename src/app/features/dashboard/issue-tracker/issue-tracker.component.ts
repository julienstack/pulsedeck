import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SupabaseService } from '../../../shared/services/supabase';
import { DatePipe } from '@angular/common';
import { RealtimeChannel } from '@supabase/supabase-js';

@Component({
    selector: 'app-issue-tracker',
    standalone: true,
    imports: [CommonModule, TableModule, TagModule, DatePipe],
    templateUrl: './issue-tracker.component.html',
})
export class IssueTrackerComponent implements OnInit, OnDestroy {
    private supabase = inject(SupabaseService);
    private realtimeChannel: RealtimeChannel | null = null;

    feedbackList = signal<any[]>([]);
    loading = signal<boolean>(true);

    async ngOnInit() {
        await this.loadFeedback();
        this.subscribeToRealtime();
    }

    ngOnDestroy() {
        if (this.realtimeChannel) {
            this.supabase.unsubscribe(this.realtimeChannel);
        }
    }

    private async loadFeedback() {
        this.loading.set(true);
        const { data, error } = await this.supabase.getFeedback();

        if (error) {
            console.error('Error fetching feedback:', error);
        } else {
            this.feedbackList.set(data || []);
        }
        this.loading.set(false);
    }

    private subscribeToRealtime() {
        this.realtimeChannel = this.supabase.subscribeToTable(
            'feedback_submissions',
            (payload: any) => {
                console.log('Realtime update:', payload);
                this.handleRealtimeUpdate(payload);
            }
        );
    }

    private handleRealtimeUpdate(payload: any) {
        const currentList = this.feedbackList();
        const eventType = payload.eventType;
        const newRecord = payload.new;
        const oldRecord = payload.old;

        switch (eventType) {
            case 'INSERT':
                // Add new item at the beginning (sorted by created_at desc)
                this.feedbackList.set([newRecord, ...currentList]);
                break;

            case 'UPDATE':
                // Update existing item
                const updateIndex = currentList.findIndex(
                    item => item.id === newRecord.id
                );
                if (updateIndex !== -1) {
                    const updated = [...currentList];
                    updated[updateIndex] = newRecord;
                    this.feedbackList.set(updated);
                }
                break;

            case 'DELETE':
                // Remove deleted item
                this.feedbackList.set(
                    currentList.filter(item => item.id !== oldRecord.id)
                );
                break;
        }
    }

    getSeverity(status: string) {
        switch (status) {
            case 'new':
                return 'info';
            case 'in_progress':
                return 'warn';
            case 'done':
                return 'success';
            default:
                return 'secondary';
        }
    }

    getStatusLabel(status: string) {
        switch (status) {
            case 'new':
                return 'Neu';
            case 'in_progress':
                return 'In Bearbeitung';
            case 'done':
                return 'Erledigt';
            default:
                return status;
        }
    }

    getSuggestionCount(): number {
        return this.feedbackList().filter(f => f.type === 'suggestion').length;
    }

    getBugCount(): number {
        return this.feedbackList().filter(f => f.type === 'bug').length;
    }
}
