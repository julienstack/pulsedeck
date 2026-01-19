import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
    selector: 'app-datenschutz',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
        <div class="min-h-screen bg-[var(--color-bg)]">
            <div class="max-w-4xl mx-auto px-6 py-16">
                <a [routerLink]="backLink()" class="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] mb-8 transition-colors">
                    <i class="pi pi-arrow-left"></i>
                    Zurück zur Startseite
                </a>
                
                <h1 class="text-4xl font-bold text-[var(--color-text)] mb-8">Datenschutzerklärung</h1>
                
                <div class="max-w-none space-y-8">
                    
                    <section>
                        <h2 class="text-2xl font-semibold text-[var(--color-text)] mb-4">1. Datenschutz auf einen Blick</h2>
                        
                        <h3 class="text-xl font-medium text-[var(--color-text)] mt-6 mb-3">Allgemeine Hinweise</h3>
                        <p class="text-[var(--color-text-muted)] leading-relaxed">
                            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen 
                            Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit 
                            denen Sie persönlich identifiziert werden können.
                        </p>

                        <h3 class="text-xl font-medium text-[var(--color-text)] mt-6 mb-3">Datenerfassung auf dieser Website</h3>
                        <p class="text-[var(--color-text-muted)] leading-relaxed mb-4">
                            <strong class="text-[var(--color-text)]">Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br>
                            Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten 
                            können Sie dem Impressum dieser Website entnehmen.
                        </p>
                        <p class="text-[var(--color-text-muted)] leading-relaxed">
                            <strong class="text-[var(--color-text)]">Wie erfassen wir Ihre Daten?</strong><br>
                            Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich 
                            z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben. Andere Daten werden automatisch 
                            oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind 
                            vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).
                        </p>
                    </section>

                    <section>
                        <h2 class="text-2xl font-semibold text-[var(--color-text)] mb-4">2. Hosting</h2>
                        <div class="bg-[var(--color-surface-raised)] rounded-xl p-6 border border-[var(--color-border)]">
                            <p class="text-[var(--color-text-muted)] leading-relaxed">
                                Wir hosten die Inhalte unserer Website bei folgendem Anbieter:
                            </p>
                            <p class="text-[var(--color-text-muted)] mt-4">
                                <strong class="text-[var(--color-text)]">Externes Hosting</strong><br>
                                Diese Website wird extern gehostet. Die personenbezogenen Daten, die auf dieser Website 
                                erfasst werden, werden auf den Servern des Hosters gespeichert. Hierbei kann es sich v.a. 
                                um IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten, Kontaktdaten, 
                                Namen, Websitezugriffe und sonstige Daten, die über eine Website generiert werden, handeln.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 class="text-2xl font-semibold text-[var(--color-text)] mb-4">3. Allgemeine Hinweise und Pflichtinformationen</h2>
                        
                        <h3 class="text-xl font-medium text-[var(--color-text)] mt-6 mb-3">Datenschutz</h3>
                        <p class="text-[var(--color-text-muted)] leading-relaxed">
                            Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln 
                            Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften 
                            sowie dieser Datenschutzerklärung.
                        </p>

                        <h3 class="text-xl font-medium text-[var(--color-text)] mt-6 mb-3">Hinweis zur verantwortlichen Stelle</h3>
                        <div class="bg-[var(--color-surface-raised)] rounded-xl p-6 border border-[var(--color-border)] mt-4">
                            <p class="text-[var(--color-text-muted)]">
                                <strong class="text-[var(--color-text)]">[Vereinsname e.V.]</strong><br>
                                [Straße und Hausnummer]<br>
                                [PLZ] [Stadt]<br><br>
                                Telefon: [Telefonnummer]<br>
                                E-Mail: [E-Mail-Adresse]
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 class="text-2xl font-semibold text-[var(--color-text)] mb-4">4. Datenerfassung auf dieser Website</h2>
                        
                        <h3 class="text-xl font-medium text-[var(--color-text)] mt-6 mb-3">Cookies</h3>
                        <p class="text-[var(--color-text-muted)] leading-relaxed">
                            Unsere Internetseiten verwenden so genannte „Cookies". Cookies sind kleine Datenpakete und richten 
                            auf Ihrem Endgerät keinen Schaden an. Sie werden entweder vorübergehend für die Dauer einer Sitzung 
                            (Session-Cookies) oder dauerhaft (permanente Cookies) auf Ihrem Endgerät gespeichert.
                        </p>

                        <h3 class="text-xl font-medium text-[var(--color-text)] mt-6 mb-3">Server-Log-Dateien</h3>
                        <p class="text-[var(--color-text-muted)] leading-relaxed">
                            Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, 
                            die Ihr Browser automatisch an uns übermittelt. Dies sind:
                        </p>
                        <ul class="list-disc list-inside text-[var(--color-text-muted)] mt-4 space-y-2">
                            <li>Browsertyp und Browserversion</li>
                            <li>verwendetes Betriebssystem</li>
                            <li>Referrer URL</li>
                            <li>Hostname des zugreifenden Rechners</li>
                            <li>Uhrzeit der Serveranfrage</li>
                            <li>IP-Adresse</li>
                        </ul>

                        <h3 class="text-xl font-medium text-[var(--color-text)] mt-6 mb-3">Registrierung auf dieser Website</h3>
                        <p class="text-[var(--color-text-muted)] leading-relaxed">
                            Sie können sich auf dieser Website registrieren, um zusätzliche Funktionen auf der Seite zu nutzen. 
                            Die dazu eingegebenen Daten verwenden wir nur zum Zwecke der Nutzung des jeweiligen Angebotes oder 
                            Dienstes, für den Sie sich registriert haben. Die bei der Registrierung abgefragten Pflichtangaben 
                            müssen vollständig angegeben werden. Anderenfalls werden wir die Registrierung ablehnen.
                        </p>
                    </section>

                    <section>
                        <h2 class="text-2xl font-semibold text-[var(--color-text)] mb-4">5. Ihre Rechte</h2>
                        
                        <div class="grid gap-4 mt-6">
                            <div class="bg-[var(--color-surface-raised)] rounded-xl p-5 border border-[var(--color-border)]">
                                <h4 class="text-[var(--color-text)] font-medium mb-2">Recht auf Auskunft</h4>
                                <p class="text-[var(--color-text-muted)] text-sm">
                                    Sie haben das Recht, jederzeit unentgeltlich Auskunft über Herkunft, Empfänger und 
                                    Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten.
                                </p>
                            </div>
                            <div class="bg-[var(--color-surface-raised)] rounded-xl p-5 border border-[var(--color-border)]">
                                <h4 class="text-[var(--color-text)] font-medium mb-2">Recht auf Berichtigung</h4>
                                <p class="text-[var(--color-text-muted)] text-sm">
                                    Sie haben das Recht, die Berichtigung unrichtiger personenbezogener Daten zu verlangen.
                                </p>
                            </div>
                            <div class="bg-[var(--color-surface-raised)] rounded-xl p-5 border border-[var(--color-border)]">
                                <h4 class="text-[var(--color-text)] font-medium mb-2">Recht auf Löschung</h4>
                                <p class="text-[var(--color-text-muted)] text-sm">
                                    Sie haben das Recht, die Löschung Ihrer bei uns gespeicherten personenbezogenen 
                                    Daten zu verlangen, soweit nicht die Verarbeitung zur Ausübung des Rechts auf freie 
                                    Meinungsäußerung und Information erforderlich ist.
                                </p>
                            </div>
                            <div class="bg-[var(--color-surface-raised)] rounded-xl p-5 border border-[var(--color-border)]">
                                <h4 class="text-[var(--color-text)] font-medium mb-2">Recht auf Datenübertragbarkeit</h4>
                                <p class="text-[var(--color-text-muted)] text-sm">
                                    Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung automatisiert 
                                    verarbeiten, in einem gängigen, maschinenlesbaren Format zu erhalten.
                                </p>
                            </div>
                            <div class="bg-[var(--color-surface-raised)] rounded-xl p-5 border border-[var(--color-border)]">
                                <h4 class="text-[var(--color-text)] font-medium mb-2">Widerspruchsrecht</h4>
                                <p class="text-[var(--color-text-muted)] text-sm">
                                    Sie haben jederzeit das Recht, aus Gründen, die sich aus Ihrer besonderen Situation 
                                    ergeben, gegen die Verarbeitung der Sie betreffenden personenbezogenen Daten Widerspruch 
                                    einzulegen.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 class="text-2xl font-semibold text-[var(--color-text)] mb-4">6. Analyse-Tools und Werbung</h2>
                        <div class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
                            <p class="text-amber-500">
                                <i class="pi pi-info-circle mr-2"></i>
                                Diese Website verwendet keine Analyse-Tools oder Werbe-Tracker.
                            </p>
                        </div>
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
export class DatenschutzComponent {
    auth = inject(AuthService);
    backLink = computed(() => {
        if (!this.auth.user()) return '/';
        const slug = localStorage.getItem('lastOrgSlug');
        return slug ? `/${slug}/dashboard` : '/organisationen';
    });
}
