import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
    selector: 'app-impressum',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
        <div class="min-h-screen bg-[var(--color-bg)]">
            <div class="max-w-4xl mx-auto px-6 py-16">
                <a [routerLink]="backLink()" class="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] mb-8 transition-colors">
                    <i class="pi pi-arrow-left"></i>
                    Zurück zur Startseite
                </a>
                
                <h1 class="text-4xl font-bold text-[var(--color-text)] mb-8">Impressum</h1>
                
                <div class="max-w-none space-y-8">
                    <section>
                        <h2 class="text-2xl font-semibold text-[var(--color-text)] mb-4">Angaben gemäß § 5 TMG</h2>
                        <div class="bg-[var(--color-surface-raised)] rounded-xl p-6 border border-[var(--color-border)]">
                            <p class="text-[var(--color-text-muted)]">
                                <strong class="text-[var(--color-text)]">[Vereinsname e.V.]</strong><br>
                                [Straße und Hausnummer]<br>
                                [PLZ] [Stadt]<br>
                                Deutschland
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 class="text-2xl font-semibold text-[var(--color-text)] mb-4">Vertreten durch</h2>
                        <div class="bg-[var(--color-surface-raised)] rounded-xl p-6 border border-[var(--color-border)]">
                            <p class="text-[var(--color-text-muted)]">
                                [Vorname Nachname], Vorsitzende/r<br>
                                [Vorname Nachname], Stellvertretende/r Vorsitzende/r
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 class="text-2xl font-semibold text-[var(--color-text)] mb-4">Kontakt</h2>
                        <div class="bg-[var(--color-surface-raised)] rounded-xl p-6 border border-[var(--color-border)]">
                            <p class="text-[var(--color-text-muted)]">
                                Telefon: [Telefonnummer]<br>
                                E-Mail: <a href="mailto:kontakt@beispiel.de" class="text-linke hover:text-linke-light">[E-Mail-Adresse]</a>
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 class="text-2xl font-semibold text-[var(--color-text)] mb-4">Registereintrag</h2>
                        <div class="bg-[var(--color-surface-raised)] rounded-xl p-6 border border-[var(--color-border)]">
                            <p class="text-[var(--color-text-muted)]">
                                Eintragung im Vereinsregister<br>
                                Registergericht: Amtsgericht [Stadt]<br>
                                Registernummer: VR [Nummer]
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 class="text-2xl font-semibold text-[var(--color-text)] mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
                        <div class="bg-[var(--color-surface-raised)] rounded-xl p-6 border border-[var(--color-border)]">
                            <p class="text-[var(--color-text-muted)]">
                                [Vorname Nachname]<br>
                                [Straße und Hausnummer]<br>
                                [PLZ] [Stadt]
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 class="text-2xl font-semibold text-[var(--color-text)] mb-4">Haftungsausschluss</h2>
                        
                        <h3 class="text-xl font-medium text-[var(--color-text)] mt-6 mb-3">Haftung für Inhalte</h3>
                        <p class="text-[var(--color-text-muted)] leading-relaxed">
                            Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, 
                            Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. 
                            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten 
                            nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als 
                            Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde 
                            Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige 
                            Tätigkeit hinweisen.
                        </p>

                        <h3 class="text-xl font-medium text-[var(--color-text)] mt-6 mb-3">Haftung für Links</h3>
                        <p class="text-[var(--color-text-muted)] leading-relaxed">
                            Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen 
                            Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. 
                            Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der 
                            Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche 
                            Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
                        </p>

                        <h3 class="text-xl font-medium text-[var(--color-text)] mt-6 mb-3">Urheberrecht</h3>
                        <p class="text-[var(--color-text-muted)] leading-relaxed">
                            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen 
                            dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art 
                            der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung 
                            des jeweiligen Autors bzw. Erstellers.
                        </p>
                    </section>
                </div>

                <div class="mt-12 pt-8 border-t border-[var(--color-border)]">
                    <p class="text-[var(--color-text-muted)] text-sm">
                        Zuletzt aktualisiert: Januar 2024
                    </p>
                </div>
            </div>
        </div>
    `,
})
export class ImpressumComponent {
    auth = inject(AuthService);
    backLink = computed(() => {
        if (!this.auth.user()) return '/';
        const slug = localStorage.getItem('lastOrgSlug');
        return slug ? `/${slug}/dashboard` : '/organisationen';
    });
}
