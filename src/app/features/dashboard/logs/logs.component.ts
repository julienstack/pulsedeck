import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../shared/services/supabase';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DatePipe, JsonPipe } from '@angular/common';

@Component({
    selector: 'app-logs',
    standalone: true,
    imports: [CommonModule, TableModule, TagModule, ButtonModule, DatePipe, JsonPipe],
    templateUrl: './logs.component.html'
})
export class LogsComponent {
    private supabase = inject(SupabaseService);
    private router = inject(Router);

    logs = signal<any[]>([]);
    loading = signal(true);

    // Hardcoded Super Admin ID (Julien)
    private readonly SUPER_ADMIN_ID = '2d8af6a7-507c-4834-aff9-3b00d1ad9c7c';

    constructor() {
        this.checkAccess();
    }

    checkAccess() {
        const user = this.supabase.user() as any;
        if (user?.id !== this.SUPER_ADMIN_ID) {
            // Quietly redirect unauthorized users
            this.router.navigate(['/']);
            return;
        }
        this.fetchLogs();
    }

    async fetchLogs() {
        this.loading.set(true);
        const { data, error } = await this.supabase.client
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100) as any;

        if (error) {
            console.error('Error fetching logs:', error);
        } else {
            this.logs.set(data || []);
        }
        this.loading.set(false);
    }

    getSeverity(op: string): "success" | "info" | "danger" | "secondary" | "warn" | "contrast" | undefined {
        switch (op) {
            case 'INSERT': return 'success';
            case 'UPDATE': return 'info';
            case 'DELETE': return 'danger';
            default: return 'secondary';
        }
    }
}
