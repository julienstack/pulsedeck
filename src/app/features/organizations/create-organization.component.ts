import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Services
import { OrganizationService } from '../../shared/services/organization.service';
import { SupabaseService } from '../../shared/services/supabase';

@Component({
    selector: 'app-create-organization',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        CardModule,
        MessageModule,
        ProgressSpinnerModule,
    ],
    template: `
        <div class="min-h-screen bg-[var(--color-surface)] flex items-center justify-center p-4">
            <div class="w-full max-w-md">
                <!-- Header -->
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold text-[var(--color-text)] mb-2">Organisation erstellen</h1>
                    <p class="text-[var(--color-text-muted)]">
                        Erstelle deine Organisation auf PulseDeck
                    </p>
                </div>

                <!-- Loading Session -->
                @if (checkingAuth()) {
                <div class="flex justify-center py-8">
                    <p-progressSpinner strokeWidth="4" />
                </div>
                } @else {
                <!-- Form Card -->
                <div class="bg-[var(--color-surface-card)] rounded-xl border border-[var(--color-border)] p-6 space-y-5">
                    
                    <!-- Organization Name -->
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-[var(--color-text)]">Name</label>
                        <input pInputText [(ngModel)]="name" (ngModelChange)="generateSlug()" 
                            class="w-full" placeholder="z.B. Verein Musterstadt e.V." />
                    </div>

                    <!-- Slug -->
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-[var(--color-text)]">URL-Slug</label>
                        <div class="flex items-center gap-2">
                            <span class="text-sm text-[var(--color-text-muted)]">pulsedeck.de/</span>
                            <input pInputText [(ngModel)]="slug" (blur)="checkSlug()"
                                class="flex-1" placeholder="meine-organisation" />
                        </div>
                        @if (slugAvailable === true) {
                        <p class="text-xs text-teal flex items-center gap-1">
                            <i class="pi pi-check"></i> Verfügbar
                        </p>
                        }
                        @if (slugAvailable === false) {
                        <p class="text-xs text-red-400 flex items-center gap-1">
                            <i class="pi pi-times"></i> Bereits vergeben
                        </p>
                        }
                    </div>

                    <!-- Error Message -->
                    @if (error()) {
                    <p-message severity="error" [text]="error()!" styleClass="w-full" />
                    }

                    <!-- Submit Button -->
                    <p-button label="Organisation erstellen" icon="pi pi-plus" 
                        (click)="createOrganization()"
                        [disabled]="!canSubmit()"
                        [loading]="loading()"
                        styleClass="w-full" severity="danger" />

                    <!-- Free Tier Info -->
                    <div class="pt-4 border-t border-[var(--color-border)]">
                        <div class="flex items-center gap-3 text-sm">
                            <div class="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center">
                                <i class="pi pi-gift text-teal"></i>
                            </div>
                            <div>
                                <p class="text-[var(--color-text)] font-medium">Gratis bis 10 Mitglieder</p>
                                <p class="text-[var(--color-text-muted)] text-xs">
                                    Danach ab 2€/Mitglied/Monat
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                }

                <!-- Back Link -->
                <div class="text-center mt-4">
                    <button (click)="goBack()" 
                        class="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                        <i class="pi pi-arrow-left mr-1"></i> Zurück
                    </button>
                </div>
            </div>
        </div>
    `,
})
export class CreateOrganizationComponent {
    private orgService = inject(OrganizationService);
    private supabase = inject(SupabaseService);
    private router = inject(Router);

    name = '';
    slug = '';
    slugAvailable: boolean | null = null;

    loading = signal(false);
    error = signal<string | null>(null);
    checkingAuth = signal(true);

    constructor() {
        // Wait for session to be ready before checking auth
        effect(() => {
            const user = this.supabase.user();
            const sessionReady = this.supabase.session() !== undefined;

            if (sessionReady) {
                this.checkingAuth.set(false);
                if (!user) {
                    this.router.navigate(['/login']);
                }
            }
        });
    }

    canSubmit(): boolean {
        return (
            this.name.trim().length >= 3 &&
            this.slug.trim().length >= 3 &&
            this.slugAvailable === true &&
            !this.loading()
        );
    }

    generateSlug(): void {
        if (!this.slug || this.slug === this.slugify(this.name.slice(0, -1))) {
            this.slug = this.slugify(this.name);
            this.slugAvailable = null;
        }
    }

    async checkSlug(): Promise<void> {
        if (this.slug.length < 3) {
            this.slugAvailable = null;
            return;
        }
        this.slugAvailable = await this.orgService.isSlugAvailable(this.slug);
    }

    async createOrganization(): Promise<void> {
        if (!this.canSubmit()) return;

        const user = this.supabase.user();
        if (!user) {
            this.error.set('Bitte zuerst einloggen');
            return;
        }

        this.loading.set(true);
        this.error.set(null);

        try {
            const org = await this.orgService.create(
                this.name.trim(),
                this.slug.trim(),
                user.id
            );

            // Navigate to the new organization
            this.router.navigate(['/', org.slug, 'dashboard']);
        } catch (e) {
            this.error.set((e as Error).message);
        }

        this.loading.set(false);
    }

    goBack(): void {
        this.router.navigate(['/']);
    }

    private slugify(text: string): string {
        return text
            .toLowerCase()
            .trim()
            .replace(/[äÄ]/g, 'ae')
            .replace(/[öÖ]/g, 'oe')
            .replace(/[üÜ]/g, 'ue')
            .replace(/ß/g, 'ss')
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
}
