import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';

// Services
import { SupabaseService } from '../../../shared/services/supabase';
import { Organization } from '../../../shared/services/organization.service';
import { AuthService, LoginCheckResult } from '../../../shared/services/auth.service';
import { environment } from '../../../../environments/environment';

interface PublicEvent {
    id: string;
    title: string;
    date: string;
    time_start?: string;
    time_end?: string;
    location?: string;
    description?: string;
}

interface PublicWikiArticle {
    id: string;
    title: string;
    category?: string;
    content?: string;
}

interface PublicFeedItem {
    id: string;
    title: string;
    content: string;
    created_at: string;
}

interface WorkingGroup {
    id: string;
    name: string;
    description?: string;
}

interface ContactPerson {
    id: string;
    name: string;
    role: string;
    email: string;
    phone?: string;
    image_url?: string;
}

type LoginStep = 'email' | 'password' | 'invitation-sent' | 'not-found';

@Component({
    selector: 'app-org-public-page',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ButtonModule,
        CardModule,
        ProgressSpinnerModule,
        InputTextModule,
        PasswordModule,
        MessageModule,
        DialogModule,
    ],
    template: `
        <div class="min-h-screen bg-[var(--color-bg)] font-sans pb-10">
            <!-- Loading State -->
            @if (loading()) {
            <div class="fixed inset-0 flex items-center justify-center bg-[var(--color-bg)] z-50">
                <div class="flex flex-col items-center gap-4">
                    <p-progressSpinner ariaLabel="loading" styleClass="w-12 h-12" strokeWidth="4" />
                </div>
            </div>
            }

            @if (org()) {
            
            <!-- Sticky Header -->
            <header class="sticky top-0 z-40 bg-[var(--color-surface-card)]/80 backdrop-blur-xl border-b border-[var(--color-border)] px-4 py-3 mb-6 supports-[backdrop-filter]:bg-[var(--color-surface-card)]/60">
                <div class="max-w-7xl mx-auto flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        @if (org()!.logo_url) {
                        <img [src]="org()!.logo_url" alt="Logo" class="w-8 h-8 object-contain" />
                        }
                        <span class="font-bold text-lg text-[var(--color-text)] tracking-tight">{{ org()!.name }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <a routerLink="/" class="text-sm font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors flex items-center gap-2 mr-2">
                             <i class="pi pi-arrow-left text-xs"></i> PulseDeck
                        </a>
                        <button pButton label="Login" icon="pi pi-sign-in" (click)="navigateToLogin()" size="small" [style]="{background: primaryColor, border: 'none', borderRadius: '12px'}" class="px-4 font-bold md:hidden"></button>
                    </div>
                </div>
            </header>

            <!-- Dashboard Grid -->
            <main class="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadein">
                
                <!-- LEFT COLUMN: Profile & Contacts & Events -->
                <div class="lg:col-span-3 space-y-6">
                    <!-- Org Card -->
                    <div class="p-6 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-sm text-center relative overflow-hidden">
                        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-50" [style.backgroundColor]="primaryColor"></div>
                        
                        <div class="flex justify-center mb-4 mt-2">
                             @if (org()!.logo_url) {
                                <img [src]="org()!.logo_url" class="h-24 w-auto object-contain drop-shadow-xl" />
                             } @else {
                                <div class="w-20 h-20 rounded-2xl bg-[var(--color-surface-ground)] flex items-center justify-center">
                                    <i class="pi pi-building text-3xl text-[var(--color-text-muted)]" [style.color]="primaryColor"></i>
                                </div>
                             }
                        </div>
                        
                        <h1 class="text-xl font-bold text-[var(--color-text)] mb-2">{{ org()!.name }}</h1>
                        
                        @if (org()!.description) {
                            <p class="text-sm text-[var(--color-text-muted)] leading-relaxed mb-6">{{ org()!.description }}</p>
                        }

                        <div class="pt-4 border-t border-[var(--color-border)] flex justify-between items-center text-sm">
                            <span class="text-[var(--color-text-muted)]">Mitglieder</span>
                            <span class="font-bold bg-[var(--color-surface-ground)] px-2 py-1 rounded-md">{{ memberCount() }}</span>
                        </div>
                    </div>

                    <!-- Contacts Widget -->
                    @if (contacts().length > 0) {
                    <div class="p-5 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-sm">
                        <h3 class="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-[var(--color-text-muted)]">
                            <i class="pi pi-users"></i> Ansprechpartner
                        </h3>
                        <div class="space-y-4">
                            @for (c of contacts(); track c.id) {
                                <div class="flex items-center gap-3 group cursor-default">
                                    <img [src]="c.image_url || 'https://www.gravatar.com/avatar?d=mp'" class="w-10 h-10 rounded-full bg-[var(--color-surface-ground)] object-cover border border-[var(--color-border)]" />
                                    <div class="flex-1 min-w-0">
                                        <div class="font-bold text-sm truncate text-[var(--color-text)]">{{ c.name }}</div>
                                        <div class="text-xs text-[var(--color-text-muted)] truncate">{{ c.role }}</div>
                                    </div>
                                    @if(c.email) {
                                        <a [href]="'mailto:' + c.email" class="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface-ground)] hover:bg-[var(--color-primary)] hover:text-white transition-colors text-[var(--color-text-muted)]">
                                            <i class="pi pi-envelope text-xs"></i>
                                        </a>
                                    }
                                </div>
                            }
                        </div>
                    </div>
                    }

                    <!-- Upcoming Events (in Sidebar) -->
                    <div class="p-5 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-sm">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-[var(--color-text-muted)]">
                                <i class="pi pi-calendar text-teal-500"></i> Termine
                            </h3>
                            <button (click)="navigateToLogin()" class="text-xs font-bold text-teal-500 hover:underline">Alle</button>
                        </div>
                        
                        @if (upcomingEvents().length > 0) {
                        <div class="space-y-3">
                            @for (e of upcomingEvents(); track e.id) {
                                <div class="flex gap-3 group">
                                    <div class="flex flex-col items-center content-center justify-center w-12 h-12 rounded-xl bg-[var(--color-surface-ground)] border border-[var(--color-border)] text-center leading-none shrink-0">
                                        <span class="text-[10px] font-bold text-teal-500 uppercase">{{ formatMonth(e.date) }}</span>
                                        <span class="text-lg font-black text-[var(--color-text)]">{{ formatDayShort(e.date) }}</span>
                                    </div>
                                    <div class="min-w-0 pt-0.5">
                                        <div class="font-bold text-sm text-[var(--color-text)] truncate group-hover:text-teal-500 transition-colors">{{ e.title }}</div>
                                        <div class="text-xs text-[var(--color-text-muted)] mt-0.5">{{ e.time_start }} Uhr</div>
                                    </div>
                                </div>
                            }
                        </div>
                        } @else {
                        <div class="text-center py-4 border border-dashed border-[var(--color-border)] rounded-xl opacity-60">
                            <p class="text-xs text-[var(--color-text-muted)]">Keine öffentlichen Termine.</p>
                        </div>
                        }
                    </div>

                </div>

                <!-- CENTER COLUMN: Wiki & News -->
                <div class="lg:col-span-6 space-y-6">
                    
                    <!-- Wiki/Docs (Dominant Position) -->
                    <div>
                         <h3 class="font-bold text-lg mb-4 px-1 flex items-center gap-2">
                            <i class="pi pi-book text-amber-500"></i> Wissen & Infos
                        </h3>

                        @if (wikiArticles().length > 0) {
                        <div class="grid md:grid-cols-2 gap-4">
                            @for (doc of wikiArticles(); track doc.id) {
                            <div (click)="openArticle(doc)" class="flex flex-col p-5 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-amber-500 transition-all cursor-pointer group shadow-sm h-full relative overflow-hidden">
                                <!-- Background decoration -->
                                <div class="absolute right-0 top-0 w-24 h-24 bg-amber-500/5 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-150"></div>

                                <div class="flex items-start justify-between mb-3 relative z-10">
                                    <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                        <i class="pi pi-file-o text-xl"></i>
                                    </div>
                                    @if(doc.category) { <span class="px-2 py-1 rounded bg-[var(--color-surface-ground)] text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{{ doc.category }}</span> }
                                </div>
                                <h3 class="font-bold text-[var(--color-text)] text-lg mb-2 leading-snug group-hover:text-amber-500 transition-colors relative z-10">{{ doc.title }}</h3>
                                <div class="mt-auto pt-4 flex items-center text-xs font-bold text-[var(--color-text-muted)] group-hover:text-amber-500 transition-colors relative z-10">
                                    Lesen <i class="pi pi-arrow-right ml-1 transition-transform group-hover:translate-x-1"></i>
                                </div>
                            </div>
                            }
                        </div>
                        } @else {
                             <div class="p-8 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] border-dashed text-center text-[var(--color-text-muted)]">
                                <i class="pi pi-lock text-4xl mb-2 opacity-50"></i>
                                <p>Interne Dokumente sind nur für eingeloggte Mitglieder sichtbar.</p>
                                <button (click)="navigateToLogin()" class="mt-3 text-xs font-bold text-amber-500 hover:underline">Zum Login &rarr;</button>
                             </div>
                        }
                    </div>

                    <!-- News Feed (Secondary) -->
                    <div>
                        <h3 class="font-bold text-lg mb-4 px-1 flex items-center gap-2">
                            <i class="pi pi-megaphone text-[var(--color-primary)]"></i> Neuigkeiten
                        </h3>
                        
                        @if (feedItems().length > 0) {
                            <div class="space-y-4">
                                @for (item of feedItems(); track item.id) {
                                    <article class="p-5 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-sm hover:border-[var(--color-primary-300)] transition-all cursor-pointer group" (click)="navigateToLogin()">
                                        <div class="flex items-center gap-3 mb-2">
                                            <span class="text-xs font-bold text-[var(--color-text-muted)]">
                                                {{ formatDate(item.created_at) }}
                                            </span>
                                        </div>
                                        <h2 class="text-lg font-bold mb-2 text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">{{ item.title }}</h2>
                                        <div class="text-sm text-[var(--color-text-muted)] leading-relaxed line-clamp-2" [innerHTML]="item.content"></div>
                                    </article>
                                }
                            </div>
                        } @else {
                            <div class="p-8 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] border-dashed text-center text-[var(--color-text-muted)]">
                                <i class="pi pi-inbox text-4xl mb-2 opacity-50"></i>
                                <p>Keine aktuellen Neuigkeiten.</p>
                            </div>
                        }
                    </div>
                </div>

                <!-- RIGHT COLUMN: Actions & Groups -->
                <div class="lg:col-span-3 space-y-6">
                    
                    <!-- Call to Action -->
                    <div class="p-6 rounded-2xl bg-gradient-to-br from-[var(--color-surface-raised)] to-[var(--color-surface-card)] border border-[var(--color-border)] shadow-lg text-center relative overflow-hidden group">
                         <div class="absolute inset-0 opacity-10 bg-[image:linear-gradient(45deg,var(--color-primary)_25%,transparent_25%,transparent_50%,var(--color-primary)_50%,var(--color-primary)_75%,transparent_75%,transparent)] bg-[length:20px_20px]"></div>
                        
                        <h3 class="font-bold text-xl mb-2 text-[var(--color-text)] relative z-10">Willkommen!</h3>
                        <p class="text-sm text-[var(--color-text-muted)] mb-6 relative z-10">Melde dich an, um auf interne Inhalte zuzugreifen.</p>
                        <button (click)="navigateToLogin()" class="w-full py-3 text-white rounded-xl font-bold hover:brightness-110 transition-all shadow-lg active:scale-95 relative z-10 flex items-center justify-center gap-2" [style.background]="primaryColor">
                            <i class="pi pi-sign-in"></i> Login
                        </button>
                    </div>

                    <!-- Working Groups -->
                    @if (workingGroups().length > 0) {
                    <div class="p-5 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-sm">
                        <h3 class="font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-violet text-[var(--color-text-muted)]">
                            <i class="pi pi-briefcase text-violet"></i> Arbeitsgruppen
                        </h3>
                        <div class="space-y-3">
                            @for (wg of workingGroups(); track wg.id) {
                                <div class="p-3 rounded-xl bg-[var(--color-surface-ground)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] transition-colors cursor-pointer group" (click)="navigateToLogin()">
                                    <div class="flex justify-between items-center mb-1">
                                        <div class="font-bold text-sm text-[var(--color-text)]">{{ wg.name }}</div>
                                        <i class="pi pi-arrow-right text-[10px] opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0"></i>
                                    </div>
                                    @if(wg.description) { <div class="text-xs text-[var(--color-text-muted)] line-clamp-2">{{ wg.description }}</div> }
                                </div>
                            }
                        </div>
                    </div>
                    }

                    <!-- Mini Footer -->
                    <div class="text-xs text-[var(--color-text-muted)] text-center space-x-2 opacity-60 mt-6">
                        <a routerLink="/impressum" class="hover:underline">Impressum</a> •
                        <a routerLink="/datenschutz" class="hover:underline">Datenschutz</a>
                    </div>

                </div>

            </main>

            <!-- Public Article Dialog -->
            <p-dialog 
                [header]="selectedArticle()?.title || ''" 
                [(visible)]="articleDialogVisible" 
                [modal]="true" 
                [style]="{width: '90vw', maxWidth: '800px', maxHeight: '90vh'}" 
                [dismissableMask]="true"
                [draggable]="false"
                [resizable]="false">
                
                @if (selectedArticle()) {
                    <div class="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                        <div class="mb-4 flex items-center gap-2">
                             <span class="px-2 py-1 rounded bg-[var(--color-surface-ground)] text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                                {{ selectedArticle()!.category || 'Allgemein' }}
                             </span>
                        </div>
                        <div [innerHTML]="selectedArticle()!.content"></div>
                    </div>
                }
            </p-dialog>
            
            }
        </div>
    `,
})
export class OrgPublicPageComponent implements OnInit {
    private supabase = inject(SupabaseService);
    private auth = inject(AuthService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    slug = signal<string>('');
    org = signal<Organization | null>(null);
    loading = signal(true);

    memberCount = signal(0);
    upcomingEvents = signal<PublicEvent[]>([]);
    wikiArticles = signal<PublicWikiArticle[]>([]);
    feedItems = signal<PublicFeedItem[]>([]);
    workingGroups = signal<WorkingGroup[]>([]);
    contacts = signal<ContactPerson[]>([]);

    // Article Dialog
    selectedArticle = signal<PublicWikiArticle | null>(null);
    articleDialogVisible = false;

    currentYear = new Date().getFullYear();

    get primaryColor(): string {
        return this.org()?.primary_color || '#e3000f';
    }

    async ngOnInit(): Promise<void> {
        const slug = this.route.snapshot.paramMap.get('slug');
        if (!slug) {
            this.loading.set(false);
            return;
        }

        this.slug.set(slug);

        // Wait for auth to be ready before checking login status
        await this.waitForAuthReady();

        // If user is logged in, redirect directly to dashboard
        if (this.auth.isLoggedIn()) {
            this.router.navigate(['/', slug, 'dashboard']);
            return;
        }

        await this.loadOrganization(slug);
    }

    private waitForAuthReady(): Promise<void> {
        return new Promise((resolve) => {
            if (this.supabase.authReady()) {
                resolve();
                return;
            }
            // Poll until ready (max 2 seconds)
            let attempts = 0;
            const interval = setInterval(() => {
                attempts++;
                if (this.supabase.authReady() || attempts > 20) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }

    async loadOrganization(slug: string): Promise<void> {
        this.loading.set(true);

        const { data: org } = await this.supabase.client
            .from('organizations')
            .select('*')
            .eq('slug', slug)
            .single();

        if (!org) {
            this.loading.set(false);
            return;
        }

        this.org.set(org as Organization);

        // Load all public data in parallel
        await Promise.all([
            this.loadMemberCount(org.id),
            this.loadUpcomingEvents(org.id),
            this.loadWikiArticles(org.id),
            this.loadFeedItems(org.id),
            this.loadWorkingGroups(org.id),
            this.loadContacts(org.id),
        ]);

        this.loading.set(false);
    }

    private async loadMemberCount(orgId: string): Promise<void> {
        const { count } = await this.supabase.client
            .from('members')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId);

        this.memberCount.set(count ?? 0);
    }

    private async loadUpcomingEvents(orgId: string): Promise<void> {
        const today = new Date().toISOString().split('T')[0];

        const { data } = await this.supabase.client
            .from('events')
            .select('id, title, date, time_start, time_end, location, description')
            .eq('organization_id', orgId)
            .eq('visibility', 'public')
            .gte('date', today)
            .order('date', { ascending: true })
            .limit(6);

        this.upcomingEvents.set((data as PublicEvent[]) || []);
    }

    private async loadWikiArticles(orgId: string): Promise<void> {
        const { data } = await this.supabase.client
            .from('wiki_docs')
            .select('id, title, content, category')
            .eq('organization_id', orgId)
            .eq('visibility', 'public')
            .order('title', { ascending: true })
            .limit(6);

        this.wikiArticles.set((data as PublicWikiArticle[]) || []);
    }

    private async loadFeedItems(orgId: string): Promise<void> {
        const { data } = await this.supabase.client
            .from('feed_items')
            .select('id, title, content, created_at')
            .eq('organization_id', orgId)
            .eq('visibility', 'public')
            .in('status', ['approved', 'sent'])
            .order('created_at', { ascending: false })
            .limit(3);

        this.feedItems.set((data as PublicFeedItem[]) || []);
    }

    private async loadWorkingGroups(orgId: string): Promise<void> {
        const { data } = await this.supabase.client
            .from('working_groups')
            .select('id, name, description')
            .eq('organization_id', orgId)
            .order('name', { ascending: true });

        this.workingGroups.set((data as WorkingGroup[]) || []);
    }

    private async loadContacts(orgId: string): Promise<void> {
        const { data } = await this.supabase.client
            .from('contacts')
            .select('id, name, role, email, phone, image_url')
            .eq('organization_id', orgId)
            .order('name', { ascending: true })
            .limit(5);

        this.contacts.set((data as ContactPerson[]) || []);
    }

    navigateToLogin() {
        this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
    }

    formatMonth(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString('de-DE', { month: 'short' }).toUpperCase();
    }

    formatDayShort(dateStr: string): string {
        const date = new Date(dateStr);
        return date.getDate().toString();
    }

    formatDay(dateStr: string): string {
        const date = new Date(dateStr);
        return date.getDate().toString();
    }

    formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
    }

    stripHtml(html: string): string {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    }

    openArticle(doc: PublicWikiArticle) {
        this.selectedArticle.set(doc);
        this.articleDialogVisible = true;
    }
}
