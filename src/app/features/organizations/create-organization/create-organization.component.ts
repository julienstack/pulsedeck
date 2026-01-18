import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';

// Services
import { OrganizationService } from '../../../shared/services/organization.service';
import { SupabaseService } from '../../../shared/services/supabase';

@Component({
    selector: 'app-create-organization',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        InputTextModule,
        ButtonModule,
        ToastModule,
        CardModule,
    ],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <div class="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
            <div class="w-full max-w-md">
                <!-- Logo/Header -->
                <div class="text-center mb-8">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linke/10 mb-4">
                        <i class="pi pi-building text-linke text-3xl"></i>
                    </div>
                    <h1 class="text-2xl font-bold text-[var(--color-text)]">Neue Organisation</h1>
                    <p class="text-[var(--color-text-muted)] mt-2">
                        Erstelle deine eigene Organisation und werde Admin
                    </p>
                </div>

                <!-- Form Card -->
                <div class="bg-[var(--color-surface-card)] rounded-xl border border-[var(--color-border)] p-6 shadow-lg">
                    <form (ngSubmit)="createOrganization()" class="space-y-5">
                        <!-- Organization Name -->
                        <div>
                            <label class="block text-sm font-medium text-[var(--color-text)] mb-2">
                                Name der Organisation *
                            </label>
                            <input 
                                type="text" 
                                pInputText 
                                [(ngModel)]="name" 
                                name="name"
                                class="w-full" 
                                placeholder="z.B. Mein Verein e.V."
                                (input)="generateSlug()"
                                required
                            />
                        </div>

                        <!-- Slug -->
                        <div>
                            <label class="block text-sm font-medium text-[var(--color-text)] mb-2">
                                URL-Slug *
                            </label>
                            <div class="flex items-center gap-2">
                                <span class="text-[var(--color-text-muted)] text-sm">lexion.dev/</span>
                                <input 
                                    type="text" 
                                    pInputText 
                                    [(ngModel)]="slug" 
                                    name="slug"
                                    class="flex-1 font-mono" 
                                    placeholder="mein-verein"
                                    (blur)="checkSlugAvailability()"
                                    required
                                />
                            </div>
                            @if (slugStatus() === 'checking') {
                                <p class="text-xs text-[var(--color-text-muted)] mt-1">
                                    <i class="pi pi-spin pi-spinner"></i> Prüfe Verfügbarkeit...
                                </p>
                            } @else if (slugStatus() === 'available') {
                                <p class="text-xs text-green-500 mt-1">
                                    <i class="pi pi-check"></i> Verfügbar
                                </p>
                            } @else if (slugStatus() === 'taken') {
                                <p class="text-xs text-red-500 mt-1">
                                    <i class="pi pi-times"></i> Bereits vergeben
                                </p>
                            }
                        </div>

                        <!-- Info Box -->
                        <div class="bg-[var(--color-surface-ground)] rounded-lg p-4 border border-[var(--color-border)]">
                            <div class="flex items-start gap-3">
                                <i class="pi pi-info-circle text-linke mt-0.5"></i>
                                <div class="text-sm text-[var(--color-text-muted)]">
                                    <p class="font-medium text-[var(--color-text)] mb-1">Was passiert dann?</p>
                                    <ul class="space-y-1">
                                        <li>• Du wirst automatisch Admin</li>
                                        <li>• Du kannst Mitglieder einladen</li>
                                        <li>• Kostenlos bis 10 Mitglieder</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <!-- Submit Button -->
                        <p-button 
                            type="submit"
                            label="Organisation erstellen" 
                            icon="pi pi-check" 
                            [loading]="loading()"
                            [disabled]="!name || !slug || slugStatus() === 'taken' || slugStatus() === 'checking'"
                            styleClass="w-full"
                            [raised]="true"
                        ></p-button>
                    </form>

                    <!-- Back Link -->
                    <div class="text-center mt-6">
                        <a 
                            (click)="goBack()" 
                            class="text-sm text-linke hover:underline cursor-pointer"
                        >
                            ← Zurück
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `,
})
export class CreateOrganizationComponent {
    private readonly orgService = inject(OrganizationService);
    private readonly supabase = inject(SupabaseService);
    private readonly router = inject(Router);
    private readonly messageService = inject(MessageService);

    name = '';
    slug = '';
    loading = signal(false);
    slugStatus = signal<'idle' | 'checking' | 'available' | 'taken'>('idle');

    generateSlug(): void {
        // Auto-generate slug from name
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/[äÄ]/g, 'ae')
            .replace(/[öÖ]/g, 'oe')
            .replace(/[üÜ]/g, 'ue')
            .replace(/ß/g, 'ss')
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        this.slugStatus.set('idle');
    }

    async checkSlugAvailability(): Promise<void> {
        if (!this.slug) {
            this.slugStatus.set('idle');
            return;
        }

        this.slugStatus.set('checking');

        const isAvailable = await this.orgService.isSlugAvailable(this.slug);
        this.slugStatus.set(isAvailable ? 'available' : 'taken');
    }

    async createOrganization(): Promise<void> {
        if (!this.name || !this.slug) return;

        const userId = this.supabase.user()?.id;
        if (!userId) {
            this.messageService.add({
                severity: 'error',
                summary: 'Fehler',
                detail: 'Du musst eingeloggt sein.',
            });
            return;
        }

        this.loading.set(true);

        try {
            const org = await this.orgService.create(this.name, this.slug, userId);

            this.messageService.add({
                severity: 'success',
                summary: 'Organisation erstellt!',
                detail: `${org.name} wurde erfolgreich erstellt.`,
            });

            // Navigate to new organization's dashboard
            setTimeout(() => {
                this.router.navigate(['/', org.slug, 'dashboard']);
            }, 1000);
        } catch (error: any) {
            this.messageService.add({
                severity: 'error',
                summary: 'Fehler',
                detail: error.message || 'Organisation konnte nicht erstellt werden.',
            });
        } finally {
            this.loading.set(false);
        }
    }

    goBack(): void {
        window.history.back();
    }
}
