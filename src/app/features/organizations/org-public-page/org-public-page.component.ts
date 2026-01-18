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
        <div class="min-h-screen bg-[var(--color-bg)] font-sans selection:bg-[var(--linke-rot)] selection:text-white pb-20">
            <!-- Loading State -->
            @if (loading()) {
            <div class="fixed inset-0 flex items-center justify-center bg-[var(--color-bg)] z-50">
                <div class="flex flex-col items-center gap-4">
                    <p-progressSpinner ariaLabel="loading" />
                    <span class="text-[var(--color-text-muted)] animate-pulse">Lade Organisation...</span>
                </div>
            </div>
            }

            @if (org()) {
            
            <!-- Hero Section with Animated Background -->
            <section class="relative min-h-[85vh] flex flex-col justify-center items-center overflow-hidden pb-16">
                <!-- Dynamic Background -->
                <div class="absolute inset-0 z-0">
                    <div class="absolute inset-0 bg-[var(--color-surface-ground)]"></div>
                    <div class="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[100px] animate-blob"
                        [style.background]="primaryColor"></div>
                    <div class="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[100px] animate-blob animation-delay-2000"
                        [style.background]="'var(--teal-500)'"></div>
                    
                    <!-- Grid Pattern Overlay -->
                    <div class="absolute inset-0 opacity-[0.03]" 
                        style="background-image: radial-gradient(var(--color-text) 1px, transparent 1px); background-size: 30px 30px;">
                    </div>
                </div>

                <div class="relative z-10 max-w-5xl mx-auto px-6 text-center pt-20 flex-1 flex flex-col justify-center">
                    <!-- Logo Badge -->
                    <div class="inline-flex items-center justify-center p-4 mb-8 bg-[var(--color-surface-card)]/80 backdrop-blur-xl border border-[var(--color-border)] rounded-3xl shadow-2xl animate-fadein-up">
                        @if (org()!.logo_url) {
                        <img [src]="org()!.logo_url" alt="" class="h-16 md:h-20 w-auto object-contain" />
                        } @else {
                        <i class="pi pi-building text-4xl md:text-5xl" [style.color]="primaryColor"></i>
                        }
                    </div>

                    <h1 class="text-4xl md:text-7xl font-extrabold text-[var(--color-text)] tracking-tight mb-6 leading-tight animate-fadein-up animation-delay-100">
                        Willkommen bei <br>
                        <span class="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-text)] to-[var(--color-text-muted)]">
                            {{ org()!.name }}
                        </span>
                    </h1>

                    @if (org()!.description) {
                    <p class="text-lg md:text-2xl text-[var(--color-text-muted)] max-w-3xl mx-auto leading-relaxed mb-10 animate-fadein-up animation-delay-200 line-clamp-3">
                         {{ org()!.description }}
                    </p>
                    }

                    <div class="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadein-up animation-delay-300">
                        <button (click)="showLoginDialog = true"
                            class="px-8 py-4 rounded-xl font-bold text-lg text-white transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] hover:shadow-[0_0_60px_-10px_rgba(0,0,0,0.4)] flex items-center gap-3"
                            [style.background]="primaryColor">
                            <i class="pi pi-sign-in"></i>
                            Mitglieder Login
                        </button>
                    </div>
                </div>

                <!-- Quick Events Ticker (New Feature) -->
                @if (upcomingEvents().length > 0) {
                <div class="relative z-20 w-full max-w-6xl mx-auto px-4 mt-auto animate-fadein-up animation-delay-500">
                    <div class="bg-[var(--color-surface-card)]/90 backdrop-blur-md border border-[var(--color-border)] rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center gap-6">
                        <div class="flex items-center gap-2 text-teal font-bold whitespace-nowrap">
                            <i class="pi pi-calendar animate-pulse"></i>
                            <span class="uppercase tracking-wider text-xs">Nächste Termine:</span>
                        </div>
                        <div class="flex-1 w-full overflow-hidden">
                            <div class="flex gap-6 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                                @for (event of upcomingEvents().slice(0, 3); track event.id) {
                                <div class="flex items-center gap-3 min-w-fit pr-4 border-r last:border-0 border-[var(--color-border)]">
                                    <div class="flex flex-col items-center leading-none">
                                        <span class="text-xs font-bold text-[var(--color-text-muted)]">{{ formatMonth(event.date) }}</span>
                                        <span class="text-lg font-bold text-[var(--color-text)]">{{ formatDayShort(event.date) }}</span>
                                    </div>
                                    <div>
                                        <div class="font-bold text-sm text-[var(--color-text)] truncate max-w-[150px]">{{ event.title }}</div>
                                        <div class="text-xs text-[var(--color-text-muted)]">{{ event.time_start }} Uhr @if(event.location){ • {{ event.location }} }</div>
                                    </div>
                                </div>
                                }
                            </div>
                        </div>
                        <button (click)="showLoginDialog = true" class="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-surface-ground)] hover:bg-[var(--color-surface-overlay)] transition-colors text-[var(--color-text-muted)] hover:text-teal">
                            <i class="pi pi-arrow-right text-xs"></i>
                        </button>
                    </div>
                </div>
                }
            </section>

            <!-- Working Groups & Todos (Renamed to "Mitmach-Möglichkeiten") -->
            @if (workingGroups().length > 0) {
            <section class="py-24 px-6 bg-[var(--color-surface-card)] relative overflow-hidden">
                 <div class="max-w-7xl mx-auto relative z-10">
                    <div class="text-center mb-16">
                        <span class="text-violet font-bold tracking-wider uppercase text-sm mb-2 block animate-pulse">Hier kannst du anfangen</span>
                        <h2 class="text-3xl md:text-5xl font-bold text-[var(--color-text)]">Mach mit! (AGs & Projekte)</h2>
                        <p class="text-[var(--color-text-muted)] mt-4 max-w-2xl mx-auto">
                            Wir suchen immer engagierte Mitglieder. Schau dir unsere Arbeitsgruppen an oder melde dich direkt.
                        </p>
                    </div>

                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        @for (wg of workingGroups(); track wg.id) {
                        <div class="p-8 rounded-3xl bg-[var(--color-surface-ground)] border border-[var(--color-border)] hover:border-violet/50 transition-all hover:shadow-lg group flex flex-col">
                            <div class="flex justify-between items-start mb-6">
                                <div class="w-14 h-14 rounded-2xl bg-violet/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <i class="pi pi-briefcase text-2xl text-violet"></i>
                                </div>
                                <span class="px-2 py-1 rounded-md bg-violet/5 text-violet text-xs font-bold uppercase tracking-wider">Aktiv</span>
                            </div>
                            
                            <h3 class="font-bold text-xl text-[var(--color-text)] mb-3">{{ wg.name }}</h3>
                            @if (wg.description) {
                            <p class="text-[var(--color-text-muted)] text-sm leading-relaxed mb-6">{{ wg.description }}</p>
                            }
                            
                            <div class="mt-auto pt-6 border-t border-[var(--color-border)]/50">
                                <button (click)="showLoginDialog = true" class="w-full py-2 rounded-lg border border-[var(--color-border)] hover:border-violet text-sm font-bold text-[var(--color-text-muted)] hover:text-violet transition-colors flex items-center justify-center gap-2">
                                    <i class="pi pi-plus"></i>
                                    Mitmachen
                                </button>
                            </div>
                        </div>
                        }
                    </div>
                </div>
            </section>
            }
            
            <!-- Unified Content Grid (Wiki, Feed, Contacts) -->
            <section class="py-24 px-6">
                <div class="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
                    
                    <!-- Col 1: Contacts (New!) -->
                    @if (contacts().length > 0) {
                    <div class="lg:col-span-1 space-y-8">
                        <div>
                            <span class="text-[var(--color-text-muted)] uppercase tracking-widest text-xs font-bold mb-4 block">Ansprechpartner</span>
                            <h2 class="text-2xl font-bold text-[var(--color-text)] mb-6">Kontakt</h2>
                            
                            <div class="space-y-4">
                                @for (contact of contacts(); track contact.id) {
                                <div class="flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-text-muted)] transition-colors">
                                    @if (contact.image_url) {
                                    <img [src]="contact.image_url" class="w-12 h-12 rounded-full object-cover" alt="">
                                    } @else {
                                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-surface-raised)] to-[var(--color-surface-overlay)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)] font-bold">
                                        {{ contact.name.charAt(0) }}
                                    </div>
                                    }
                                    <div class="flex-1 min-w-0">
                                        <div class="font-bold text-[var(--color-text)] truncate">{{ contact.name }}</div>
                                        <div class="text-xs text-linke truncate font-medium">{{ contact.role }}</div>
                                        @if (contact.email) {
                                        <div class="text-xs text-[var(--color-text-muted)] truncate mt-0.5 opacity-80">{{ contact.email }}</div>
                                        }
                                    </div>
                                </div>
                                }
                            </div>
                        </div>
                    </div>
                    }

                    <!-- Col 2: News Feed -->
                    @if (feedItems().length > 0) {
                    <div class="lg:col-span-1">
                        <span class="text-[var(--color-text-muted)] uppercase tracking-widest text-xs font-bold mb-4 block">Updates</span>
                        <h2 class="text-2xl font-bold text-[var(--color-text)] mb-6">Aktuelles</h2>
                        
                        <div class="space-y-6">
                            @for (item of feedItems(); track item.id) {
                            <div class="relative pl-6 border-l-2 border-[var(--color-border)] hover:border-cyan-500 transition-colors pb-6 last:pb-0">
                                <div class="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-[var(--color-border)]"></div>
                                <span class="text-xs font-bold text-cyan-500 block mb-1">{{ formatDate(item.created_at) }}</span>
                                <h3 class="font-bold text-[var(--color-text)] text-lg mb-2 leading-tight hover:text-cyan-500 transition-colors cursor-pointer" (click)="showLoginDialog = true">{{ item.title }}</h3>
                                <p class="text-sm text-[var(--color-text-muted)] line-clamp-2">{{ stripHtml(item.content) }}</p>
                            </div>
                            }
                        </div>
                    </div>
                    }
                    
                    <!-- Col 3: Wiki -->
                    @if (wikiArticles().length > 0) {
                    <div class="lg:col-span-1">
                        <span class="text-[var(--color-text-muted)] uppercase tracking-widest text-xs font-bold mb-4 block">Wissen</span>
                        <h2 class="text-2xl font-bold text-[var(--color-text)] mb-6">Wiki & Docs</h2>
                        
                        <div class="grid gap-3">
                            @for (article of wikiArticles(); track article.id) {
                            <div class="group p-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:bg-amber-500 hover:border-amber-500 transition-all cursor-pointer" (click)="showLoginDialog = true">
                                <div class="flex justify-between items-start">
                                    <div class="flex-1">
                                        <h3 class="font-bold text-[var(--color-text)] group-hover:text-white transition-colors text-sm mb-1">{{ article.title }}</h3>
                                        @if(article.category) { <span class="text-[10px] uppercase tracking-wide opacity-50 text-[var(--color-text-muted)] group-hover:text-white/80">{{ article.category }}</span> }
                                    </div>
                                    <i class="pi pi-arrow-right text-[var(--color-text-muted)] group-hover:text-white transform group-hover:translate-x-1 transition-all text-xs mt-1"></i>
                                </div>
                            </div>
                            }
                        </div>
                        
                        <div class="mt-6 p-4 rounded-xl bg-[var(--color-surface-ground)] border border-dashed border-[var(--color-border)] text-center">
                            <p class="text-xs text-[var(--color-text-muted)] mb-3">Login für vollen Zugriff auf alle Dokumente.</p>
                            <button (click)="showLoginDialog = true" class="text-xs font-bold text-amber-500 hover:underline">Zum Wiki &rarr;</button>
                        </div>
                    </div>
                    }

                </div>
            </section>

            <!-- Final CTA Section -->
            <section class="py-24 px-6 relative overflow-hidden bg-[var(--color-surface-card)]">
                <div class="max-w-3xl mx-auto text-center relative z-10">
                    <h2 class="text-4xl md:text-5xl font-extrabold text-[var(--color-text)] mb-6 tracking-tight">
                        Werde Teil von <span [style.color]="primaryColor">{{ org()!.name }}</span>
                    </h2>
                    <p class="text-xl text-[var(--color-text-muted)] mb-10 leading-relaxed">
                        Registriere dich im Mitgliederbereich, knüpfe Kontakte und bleib immer auf dem Laufenden.
                    </p>
                    
                    <button (click)="showLoginDialog = true"
                        class="px-12 py-5 rounded-2xl font-bold text-xl text-white transition-all hover:scale-105 shadow-2xl hover:shadow-[0_20px_40px_-10px_rgba(var(--primary-rgb),0.4)] flex items-center justify-center gap-3 mx-auto"
                        [style.background]="primaryColor">
                        <i class="pi pi-user-plus"></i>
                        Jetzt anmelden
                    </button>
                    
                    <p class="mt-8 text-sm text-[var(--color-text-muted)]">
                        Login nur für bestätigte Mitglieder.
                    </p>
                </div>
            </section>

            <!-- Footer -->
            <footer class="py-12 px-6 border-t border-[var(--color-border)] text-center md:text-left">
                <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div class="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                        @if (org()!.logo_url) {
                        <img [src]="org()!.logo_url" alt="" class="w-6 h-6 object-contain grayscale" />
                        }
                        <span class="font-bold text-[var(--color-text)] tracking-wider text-sm">{{ org()!.name }}</span>
                    </div>
                    <div class="flex gap-8 text-sm font-medium text-[var(--color-text-muted)]">
                        <a href="#" class="hover:text-[var(--color-text)] transition-colors">Impressum</a>
                        <a href="#" class="hover:text-[var(--color-text)] transition-colors">Datenschutz</a>
                        <a routerLink="/" class="hover:text-linke transition-colors">Lexion</a>
                    </div>
                </div>
            </footer>

            }

            <p-dialog [(visible)]="showLoginDialog" [modal]="true" [dismissableMask]="true"
                [style]="{width: '100%', maxWidth: '450px'}" [showHeader]="false"
                [contentStyle]="{'background': 'transparent', 'padding': '0', 'border': 'none'}" [draggable]="false"
                [resizable]="false" (onHide)="closeLoginDialog()">

                <div class="bg-[var(--color-surface-card)] rounded-xl border border-[var(--color-border)] overflow-hidden shadow-2xl relative">
                    <!-- Close Button -->
                    <button (click)="showLoginDialog = false"
                        class="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[var(--color-surface)] hover:bg-[var(--color-surface-overlay)] flex items-center justify-center transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer">
                        <i class="pi pi-times"></i>
                    </button>

                    <!-- Header with Dynamic Gradient -->
                    <div class="h-32 relative overflow-hidden flex items-center justify-center bg-[var(--color-surface-ground)]">
                        <div class="absolute inset-0 opacity-30 animate-blob" [style.background]="primaryColor"></div>
                        <div class="absolute bottom-0 right-0 w-32 h-32 rounded-full opacity-20 blur-2xl bg-teal-500 animate-blob animation-delay-2000"></div>

                        @if (org()!.logo_url) {
                        <img [src]="org()!.logo_url" alt="" class="h-16 w-auto object-contain relative z-10 drop-shadow-xl" />
                        } @else {
                        <i class="pi pi-building text-4xl text-white relative z-10 drop-shadow-xl"></i>
                        }
                    </div>

                    <!-- Content -->
                    <div class="p-8">

                        <div class="text-center mb-8">
                            <h2 class="text-2xl font-bold text-[var(--color-text)] mb-2">Willkommen zurück</h2>
                            <p class="text-sm text-[var(--color-text-muted)]">Melde dich an um fortzufahren</p>
                        </div>

                        <!-- Step 1: Email -->
                        @if (loginStep() === 'email') {
                        <div class="space-y-6 animate-fadein">
                            <div class="space-y-2">
                                <label class="text-xs font-bold uppercase text-[var(--color-text-muted)] tracking-wider ml-1">E-Mail Adresse</label>
                                <span class="p-input-icon-left w-full">
                                    <i class="pi pi-envelope text-[var(--color-text-muted)]"></i>
                                    <input pInputText type="email" [(ngModel)]="loginEmail" (keydown.enter)="checkEmail()"
                                        placeholder="dein.name@beispiel.de"
                                        class="w-full !pl-10 !py-3 !rounded-xl !bg-[var(--color-surface-ground)] !border-[var(--color-border)] focus:!border-linke transition-colors" />
                                </span>
                            </div>

                            <button (click)="checkEmail()" [disabled]="!loginEmail || loginLoading()"
                                class="w-full py-3.5 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                                [style.background]="primaryColor">
                                @if (loginLoading()) {
                                <i class="pi pi-spin pi-spinner"></i>
                                } @else {
                                <span class="flex items-center gap-2">Weiter <i class="pi pi-arrow-right text-xs"></i></span>
                                }
                            </button>

                            @if (loginError()) {
                            <div class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start gap-2">
                                <i class="pi pi-exclamation-circle mt-0.5"></i>
                                <span>{{ loginError() }}</span>
                            </div>
                            }
                        </div>
                        }

                        <!-- Step 2: Password -->
                        @if (loginStep() === 'password') {
                        <div class="space-y-6 animate-fadein">
                             <div class="bg-[var(--color-surface-ground)] p-3 rounded-xl border border-[var(--color-border)] flex items-center justify-between mb-2">
                                <div class="flex items-center gap-3">
                                     <div class="w-8 h-8 rounded-full bg-[var(--color-surface-raised)] flex items-center justify-center text-[var(--color-text)] font-bold text-xs border border-[var(--color-border)]">
                                        {{ foundMember?.email?.charAt(0).toUpperCase() }}
                                     </div>
                                     <div class="flex flex-col">
                                         <span class="text-xs font-bold text-[var(--color-text)]">{{ foundMember?.email }}</span>
                                         <span class="text-[10px] text-[var(--color-text-muted)]">Mitglied</span>
                                     </div>
                                </div>
                                <button (click)="loginStep.set('email')" class="text-xs text-linke hover:underline font-bold">Ändern</button>
                             </div>

                            <div class="space-y-2">
                                <div class="flex justify-between items-center ml-1">
                                    <label class="text-xs font-bold uppercase text-[var(--color-text-muted)] tracking-wider">Passwort</label>
                                    <button (click)="requestPasswordReset()" class="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">Vergessen?</button>
                                </div>
                                <span class="p-input-icon-left w-full">
                                    <i class="pi pi-lock text-[var(--color-text-muted)]"></i>
                                    <input pInputText type="password" [(ngModel)]="loginPassword" (keydown.enter)="doLogin()"
                                        placeholder="••••••••"
                                        class="w-full !pl-10 !py-3 !rounded-xl !bg-[var(--color-surface-ground)] !border-[var(--color-border)] focus:!border-linke transition-colors" />
                                </span>
                            </div>

                            <button (click)="doLogin()" [disabled]="!loginPassword || loginLoading()"
                                class="w-full py-3.5 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                                [style.background]="primaryColor">
                                @if (loginLoading()) {
                                <i class="pi pi-spin pi-spinner"></i>
                                } @else {
                                <span>Anmelden</span>
                                }
                            </button>

                            @if (loginError()) {
                            <div class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start gap-2 animate-shake">
                                <i class="pi pi-exclamation-circle mt-0.5"></i>
                                <span>{{ loginError() }}</span>
                            </div>
                            }
                        </div>
                        }

                        <!-- Step 3: Invitation Sent -->
                        @if (loginStep() === 'invitation-sent') {
                        <div class="text-center space-y-6 py-4 animate-fadein">
                            <div class="w-20 h-20 mx-auto rounded-full bg-green-500/10 flex items-center justify-center ring-4 ring-green-500/5">
                                <i class="pi pi-envelope text-3xl text-green-500"></i>
                            </div>
                            
                            <div class="space-y-2">
                                <h3 class="text-xl font-bold text-[var(--color-text)]">E-Mail gesendet!</h3>
                                <p class="text-sm text-[var(--color-text-muted)]">
                                    Wir haben dir einen Login-Link an <strong class="text-[var(--color-text)]">{{ loginEmail }}</strong> geschickt.
                                </p>
                            </div>

                            <button (click)="closeLoginDialog()"
                                class="w-full py-3.5 rounded-xl font-bold border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-overlay)] transition-all">
                                Schließen
                            </button>
                        </div>
                        }

                        <!-- Step 4: Not Found -->
                        @if (loginStep() === 'not-found') {
                        <div class="text-center space-y-6 py-4 relative z-10 animate-fadein">
                            <div class="w-20 h-20 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center ring-4 ring-amber-500/5">
                                <i class="pi pi-user-minus text-3xl text-amber-500"></i>
                            </div>
                            
                            <div class="space-y-2">
                                <h3 class="text-xl font-bold text-[var(--color-text)]">Unbekannte E-Mail</h3>
                                <p class="text-sm text-[var(--color-text-muted)] max-w-xs mx-auto">
                                    Wir konnten kein Mitglied mit der Adresse <strong class="text-[var(--color-text)]">{{ loginEmail }}</strong> finden.
                                </p>
                            </div>

                            <button (click)="loginStep.set('email')"
                                class="w-full py-3.5 rounded-xl font-bold border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-overlay)] transition-all">
                                Eingabe korrigieren
                            </button>

                            <p class="text-xs text-[var(--color-text-muted)]">
                                Wenn du Mitglied bist und dich nicht anmelden kannst, wende dich bitte an den Vorstand.
                            </p>
                        </div>
                        }
                    </div>
                </div>
            </p-dialog>
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

    // Login dialog
    showLoginDialog = false;
    loginStep = signal<LoginStep>('email');
    loginEmail = '';
    loginPassword = '';
    loginLoading = signal(false);
    loginError = signal<string | null>(null);
    foundMember: any = null;

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

    // Login Flow - Uses AuthService for multi-org support
    async checkEmail(): Promise<void> {
        if (!this.loginEmail) return;

        this.loginLoading.set(true);
        this.loginError.set(null);

        try {
            // Use AuthService to check email (calls send-invitation Edge Function)
            const result = await this.auth.checkEmail(
                this.loginEmail.toLowerCase().trim(),
                this.org()!.id // Pass current org for context, but function checks globally
            );

            this.loginLoading.set(false);

            switch (result.status) {
                case 'connected':
                    // User exists and is connected - show password field
                    this.foundMember = { email: this.loginEmail };
                    this.loginStep.set('password');
                    break;

                case 'invitation_sent':
                    // Invitation email was sent
                    this.loginStep.set('invitation-sent');
                    break;

                case 'not_found':
                    // No member with this email found
                    this.loginStep.set('not-found');
                    break;

                case 'error':
                    // Edge function returned an error
                    this.loginError.set(result.details || result.error || 'Ein Fehler ist aufgetreten.');
                    break;

                default:
                    if (result.error) {
                        this.loginError.set(result.error);
                    }
            }
        } catch (e) {
            this.loginLoading.set(false);
            this.loginError.set('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
            console.error('Login check error:', e);
        }
    }

    async doLogin(): Promise<void> {
        if (!this.loginEmail || !this.loginPassword) return;

        this.loginLoading.set(true);
        this.loginError.set(null);

        const { error } = await this.supabase.client.auth.signInWithPassword({
            email: this.loginEmail,
            password: this.loginPassword,
        });

        this.loginLoading.set(false);

        if (error) {
            if (error.message.includes('Invalid login')) {
                this.loginError.set('Falsches Passwort.');
            } else {
                this.loginError.set(error.message);
            }
            return;
        }

        // Success - navigate to dashboard
        this.showLoginDialog = false;
        this.router.navigate(['/', this.slug(), 'dashboard']);
    }

    async requestPasswordReset(): Promise<void> {
        if (!this.loginEmail) return;

        this.loginLoading.set(true);

        const { error } = await this.supabase.client.auth.resetPasswordForEmail(this.loginEmail, {
            redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
        });

        this.loginLoading.set(false);

        if (!error) {
            this.loginStep.set('invitation-sent');
        }
    }

    closeLoginDialog(): void {
        this.showLoginDialog = false;
        this.loginStep.set('email');
        this.loginEmail = '';
        this.loginPassword = '';
        this.loginError.set(null);
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
}
