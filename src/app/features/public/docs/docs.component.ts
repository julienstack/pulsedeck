import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { marked } from 'marked';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
    selector: 'app-docs',
    standalone: true,
    imports: [CommonModule, RouterModule, ProgressSpinnerModule, ButtonModule, TagModule],
    template: `
    <div class="min-h-screen bg-[var(--color-bg)] pb-12 font-sans">
        <!-- Sticky Header with Back Button -->
        <div class="border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 sticky top-0 z-50 backdrop-blur-md">
            <div class="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                <a [routerLink]="backLink()" class="flex items-center gap-3 text-[var(--color-text)] hover:opacity-80 transition-opacity no-underline cursor-pointer">
                    <div class="w-8 h-8 rounded-lg bg-linke/20 flex items-center justify-center">
                        <i class="pi pi-book text-linke text-sm"></i>
                    </div>
                    <span class="font-bold text-lg">PulseDeck Docs</span>
                </a>
                
                <a [routerLink]="backLink()" class="px-4 py-2 rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] hover:bg-[var(--color-surface-overlay)] text-sm font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] flex items-center gap-2 transition-all no-underline cursor-pointer">
                    <i class="pi pi-arrow-left text-xs"></i>
                    <span>Zurück</span>
                </a>
            </div>
        </div>

        <div class="p-4 md:p-6 max-w-4xl mx-auto mt-6">
            <!-- Header (Page Title) -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 class="text-3xl md:text-4xl font-extrabold text-[var(--color-text)] mb-2 tracking-tight">
                        Handbuch
                    </h1>
                    <p class="text-[var(--color-text-muted)] text-lg">
                        Anleitungen, Workflows und Hilfe für PulseDeck.
                    </p>
                </div>
                <div>
                     <p-tag value="v0.9.0 Alpha" severity="info" styleClass="!px-3 !py-1" />
                </div>
            </div>

            <!-- Loading -->
            @if (loading()) {
            <div class="flex justify-center items-center py-16">
                <p-progressSpinner strokeWidth="4" ariaLabel="Lade Handbuch..." />
            </div>
            }

            <!-- Error -->
            @if (error()) {
            <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
                <i class="pi pi-exclamation-triangle mr-2"></i>
                {{ error() }}
            </div>
            }

            <!-- Content -->
            @if (!loading() && !error()) {
            <div class="docs-content prose prose-invert prose-sm md:prose-base max-w-none
                bg-[var(--color-surface-card)] rounded-2xl border border-[var(--color-border)] p-8 md:p-12 shadow-sm
                
                [&_h1]:hidden
                
                /* Headings */
                [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[var(--color-text)] [&_h2]:border-b 
                [&_h2]:border-[var(--color-border)] [&_h2]:pb-4 [&_h2]:mb-6 [&_h2]:mt-12 [&_h2:first-of-type]:mt-0
                
                [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-[var(--color-text)] [&_h3]:mt-8 [&_h3]:mb-4
                
                [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-[var(--color-text)] [&_h4]:mt-6 [&_h4]:mb-2
                
                /* Text */
                [&_p]:text-[var(--color-text-muted)] [&_p]:leading-relaxed [&_p]:mb-6
                
                /* Lists */
                [&_ul]:space-y-2 [&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-[var(--color-text-muted)]
                [&_ol]:space-y-2 [&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:text-[var(--color-text-muted)]
                [&_li]:pl-1
                
                /* Special Elements */
                [&_blockquote]:border-l-4 [&_blockquote]:border-linke [&_blockquote]:bg-linke/5 
                [&_blockquote]:pl-6 [&_blockquote]:py-4 [&_blockquote]:rounded-r-lg [&_blockquote]:italic [&_blockquote]:mb-8 [&_blockquote]:text-[var(--color-text-muted)]
                
                [&_hr]:border-[var(--color-border)] [&_hr]:my-12
                
                [&_strong]:text-[var(--color-text)] [&_strong]:font-bold
                
                [&_a]:text-linke [&_a]:font-medium [&_a]:underline [&_a]:decoration-linke/30 [&_a]:underline-offset-2 [&_a]:hover:decoration-linke
                
                /* Images */
                [&_img]:rounded-xl [&_img]:border [&_img]:border-[var(--color-border)] [&_img]:shadow-lg [&_img]:my-8
                "
                [innerHTML]="htmlContent()">
            </div>
            }
            
            <!-- Footer Links (Docs internal) -->
             <div class="mt-12 text-center text-sm text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-8">
                <p>Hast du Fragen, die hier nicht beantwortet werden?</p>
                <div class="flex justify-center gap-4 mt-4">
                     <a [routerLink]="backLink()" class="text-linke hover:underline cursor-pointer">Zur Startseite</a>
                     <span>•</span>
                     <a href="mailto:support@pulsedeck.de" class="text-linke hover:underline">Support kontaktieren</a>
                </div>
            </div>
        </div>
    </div>
    `,
    styles: [`
        :host {
            display: block;
        }
    `]
})
export class DocsComponent implements OnInit {
    private http = inject(HttpClient);
    private sanitizer = inject(DomSanitizer);

    loading = signal(true);
    error = signal<string | null>(null);
    htmlContent = signal<SafeHtml>('');

    private auth = inject(AuthService);

    backLink = computed(() => {
        if (!this.auth.user()) return '/';
        const slug = localStorage.getItem('lastOrgSlug');
        return slug ? `/${slug}/dashboard` : '/organisationen';
    });

    ngOnInit(): void {
        this.loadDocs();
    }

    private async loadDocs(): Promise<void> {
        try {
            const markdown = await this.http
                .get('/DOCS.md', { responseType: 'text' })
                .toPromise();

            if (markdown) {
                const rawHtml = await marked.parse(markdown);
                this.htmlContent.set(
                    this.sanitizer.bypassSecurityTrustHtml(rawHtml)
                );
            }
        } catch (err) {
            console.error('Failed to load docs:', err);
            this.error.set('Handbuch konnte nicht geladen werden.');
        } finally {
            this.loading.set(false);
        }
    }
}
