import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { grantDevAccess } from '../../shared/guards/dev-password.guard';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

@Component({
    selector: 'app-dev-access',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, PasswordModule],
    template: `
        <div class="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex items-center justify-center p-4">
            <div class="max-w-md w-full">
                <div class="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm">
                    <div class="text-center mb-8">
                        <div class="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                            <i class="pi pi-lock text-amber-500 text-3xl"></i>
                        </div>
                        <h1 class="text-2xl font-bold text-white mb-2">Entwicklungszugang</h1>
                        <p class="text-gray-400 text-sm">
                            Diese Anwendung befindet sich in der Entwicklungsphase.
                            Bitte gib das Zugangskennwort ein.
                        </p>
                    </div>

                    <form (ngSubmit)="checkPassword()">
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-300 mb-2">Kennwort</label>
                                <p-password 
                                    [(ngModel)]="password" 
                                    name="password"
                                    [toggleMask]="true"
                                    [feedback]="false"
                                    styleClass="w-full"
                                    inputStyleClass="w-full"
                                    placeholder="Zugangskennwort eingeben">
                                </p-password>
                            </div>

                            @if (error()) {
                                <p class="text-red-400 text-sm text-center">
                                    <i class="pi pi-times-circle mr-1"></i>
                                    Falsches Kennwort
                                </p>
                            }

                            <p-button 
                                type="submit"
                                label="Zugang freischalten" 
                                icon="pi pi-unlock"
                                styleClass="w-full"
                                severity="warn"
                                [raised]="true">
                            </p-button>
                        </div>
                    </form>

                    <div class="mt-8 pt-6 border-t border-gray-700/50 text-center">
                        <p class="text-gray-500 text-xs">
                            <i class="pi pi-info-circle mr-1"></i>
                            Nicht für die öffentliche Nutzung bestimmt
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `,
})
export class DevAccessComponent {
    password = '';
    error = signal(false);

    constructor(private router: Router) { }

    checkPassword() {
        if (grantDevAccess(this.password)) {
            this.router.navigate(['/']);
        } else {
            this.error.set(true);
            setTimeout(() => this.error.set(false), 3000);
        }
    }
}
