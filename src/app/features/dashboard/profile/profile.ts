import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { DatePickerModule } from 'primeng/datepicker';
import { TabsModule } from 'primeng/tabs';

// Services
import { AuthService } from '../../../shared/services/auth.service';
import { MembersService } from '../../../shared/services/members.service';
import { OrganizationService } from '../../../shared/services/organization.service';
import { SkillService, Skill, SkillCategory } from '../../../shared/services/skill.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ButtonModule,
        ChipModule,
        InputTextModule,
        ToastModule,
        DividerModule,
        DatePickerModule,
        TabsModule,
    ],
    providers: [MessageService],
    templateUrl: './profile.html',
    styleUrls: ['./profile.css'],
})
export class ProfileComponent implements OnInit {
    readonly auth = inject(AuthService);
    private readonly members = inject(MembersService);
    private readonly org = inject(OrganizationService);
    readonly skillService = inject(SkillService);
    private readonly messageService = inject(MessageService);

    saving = signal(false);
    birthdayDate: Date | null = null;

    // Form data for profile editing
    formData = {
        phone: '',
        street: '',
        zip_code: '',
        city: '',
    };

    // Skills
    selectedSkillIds = signal<string[]>([]);
    originalSkillIds = signal<string[]>([]);
    categories: SkillCategory[] = ['ability', 'interest', 'availability'];

    hasSkillChanges = computed(() => {
        const current = [...this.selectedSkillIds()].sort();
        const original = [...this.originalSkillIds()].sort();
        return JSON.stringify(current) !== JSON.stringify(original);
    });

    async ngOnInit(): Promise<void> {
        const member = this.auth.currentMember();
        if (member) {
            // Load profile data
            this.formData = {
                phone: member.phone || '',
                street: member.street || '',
                zip_code: member.zip_code || '',
                city: member.city || '',
            };

            if (member.birthday) {
                this.birthdayDate = new Date(member.birthday);
            }

            // Load skills for organization
            const orgId = this.org.currentOrganization()?.id;
            if (orgId) {
                await this.skillService.loadSkills(orgId);
            }

            // Load member's selected skills
            if (member.id) {
                const memberSkills =
                    await this.skillService.getMemberSkillIds(member.id);
                this.selectedSkillIds.set(memberSkills);
                this.originalSkillIds.set([...memberSkills]);
            }
        }
    }

    getInitials(): string {
        const name = this.auth.currentMember()?.name || '';
        return name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    isProfileComplete(): boolean {
        const m = this.auth.currentMember();
        return !!(m?.phone && m?.street && m?.city && m?.birthday);
    }

    async saveProfile(): Promise<void> {
        const member = this.auth.currentMember();
        if (!member?.id) return;

        this.saving.set(true);

        const updates = {
            ...this.formData,
            birthday: this.birthdayDate
                ? this.birthdayDate.toISOString().split('T')[0]
                : undefined,
        };

        const success = await this.members.updateMember(member.id, updates);

        if (success) {
            this.messageService.add({
                severity: 'success',
                summary: 'Gespeichert',
                detail: 'Dein Profil wurde aktualisiert',
            });
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Fehler',
                detail: 'Speichern fehlgeschlagen',
            });
        }

        this.saving.set(false);
    }

    // =========================================================================
    // SKILLS
    // =========================================================================

    getSkillsByCategory(category: SkillCategory): Skill[] {
        return this.skillService.getSkillsByCategory(category);
    }

    getCategoryDescription(category: SkillCategory): string {
        const descriptions: Record<SkillCategory, string> = {
            ability:
                'Welche Fähigkeiten bringst du mit?',
            interest:
                'Für welche Themen interessierst du dich?',
            availability:
                'Wann und wie bist du verfügbar?',
        };
        return descriptions[category];
    }

    isSkillSelected(skillId: string): boolean {
        return this.selectedSkillIds().includes(skillId);
    }

    toggleSkill(skillId: string): void {
        const current = this.selectedSkillIds();
        if (current.includes(skillId)) {
            this.selectedSkillIds.set(current.filter((id) => id !== skillId));
        } else {
            this.selectedSkillIds.set([...current, skillId]);
        }
    }

    getSkillName(skillId: string): string {
        const skill = this.skillService.skills().find((s) => s.id === skillId);
        return skill?.name || '';
    }

    async saveSkills(): Promise<void> {
        const memberId = this.auth.currentMember()?.id;
        if (!memberId) return;

        this.saving.set(true);

        const success = await this.skillService.updateMemberSkills(
            memberId,
            this.selectedSkillIds()
        );

        this.saving.set(false);

        if (success) {
            this.originalSkillIds.set([...this.selectedSkillIds()]);
            this.messageService.add({
                severity: 'success',
                summary: 'Gespeichert',
                detail: 'Deine Fähigkeiten wurden aktualisiert',
            });
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Fehler',
                detail: 'Speichern fehlgeschlagen',
            });
        }
    }
}
