import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkingGroupsService } from '../../../shared/services/working-groups.service';
import { WorkingGroup } from '../../../shared/models/working-group.model';
import { AgRole } from '../../../shared/models/member.model';
import { AuthService } from '../../../shared/services/auth.service';
import {
  PermissionsService,
  AG_ROLE_LABELS,
} from '../../../shared/services/permissions.service';
import { OrganizationService } from '../../../shared/services/organization.service';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ChipModule } from 'primeng/chip';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { RippleModule } from 'primeng/ripple';
import { AccordionModule } from 'primeng/accordion';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-working-groups',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    CardModule,
    TagModule,
    TooltipModule,
    ChipModule,
    AvatarModule,
    AvatarGroupModule,
    MessageModule,
    ToastModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    RippleModule,
    AccordionModule,
    RouterModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './working-groups.html',
  styleUrl: './working-groups.css',
})
export class WorkingGroupsComponent implements OnInit {
  public workingGroupsService = inject(WorkingGroupsService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  public auth = inject(AuthService);
  public permissions = inject(PermissionsService);
  private orgService = inject(OrganizationService);

  groups = this.workingGroupsService.workingGroups;
  loading = this.workingGroupsService.loading;
  error = this.workingGroupsService.error;
  myMemberships = this.workingGroupsService.myMemberships;
  myAgRoles = this.workingGroupsService.myAgRoles;
  agEvents = this.workingGroupsService.agEvents;

  dialogVisible = signal(false);
  editMode = signal(false);
  saving = signal(false);
  currentGroup: WorkingGroup = this.getEmptyGroup();
  tagsInput = ''; // Comma-separated string for tags input
  expandedGroups: Record<string, boolean> = {}; // Custom expand state

  // AG Member Management
  membersDialogVisible = signal(false);
  currentAgForMembers = signal<WorkingGroup | null>(null);
  agMembers = signal<{ member_id: string; name: string; role: AgRole }[]>([]);
  loadingMembers = signal(false);

  // AG Role options
  agRoleOptions = [
    { label: 'Mitglied', value: 'member' },
    { label: 'Admin', value: 'admin' },
    { label: 'Leitung', value: 'lead' },
  ];
  agRoleLabels = AG_ROLE_LABELS;

  // Toggle expand/collapse for a group
  toggleExpand(groupId: string) {
    this.expandedGroups[groupId] = !this.expandedGroups[groupId];
  }

  // Helper to get events for a specific AG
  getAgEvents(groupId: string) {
    return this.agEvents().get(groupId) ?? [];
  }

  contactTypes = [
    { label: 'Discord', value: 'Discord', icon: 'pi pi-comments' },
    { label: 'E-Mail', value: 'Email', icon: 'pi pi-envelope' },
    { label: 'WhatsApp', value: 'WhatsApp', icon: 'pi pi-comment' },
    { label: 'Signal', value: 'Signal', icon: 'pi pi-send' },
  ];


  constructor() {
    // React to organization changes - reload working groups
    effect(() => {
      const currentOrg = this.orgService.currentOrgId();
      if (currentOrg) {
        this.workingGroupsService.fetchWorkingGroups();
      }
    });

    // React to Member changes to load memberships
    effect(() => {
      const member = this.auth.currentMember();
      if (member && member.id) {
        this.workingGroupsService.fetchMyMemberships(member.id);
      }
    });
  }

  ngOnInit(): void {
    this.workingGroupsService.fetchWorkingGroups();
  }

  getEmptyGroup(): WorkingGroup {
    return {
      id: '',
      name: '',
      description: '',
      lead: '',
      members_count: 0,
      next_meeting: '',
      contact_type: 'Discord',
      contact_value: '',
      contact_link: '',
      contact_icon: 'pi pi-comments',
      tags: [],
    };
  }

  getIconForType(contactType: string): string {
    const iconMap: Record<string, string> = {
      'Discord': 'pi pi-comments',
      'Email': 'pi pi-envelope',
      'WhatsApp': 'pi pi-comment',
      'Signal': 'pi pi-send'
    };
    return iconMap[contactType] || 'pi pi-link';
  }

  openNew() {
    this.currentGroup = this.getEmptyGroup();
    this.tagsInput = '';
    this.editMode.set(false);
    this.dialogVisible.set(true);
  }

  editGroup(group: WorkingGroup) {
    this.currentGroup = { ...group };
    this.tagsInput = group.tags?.join(', ') || '';
    this.editMode.set(true);
    this.dialogVisible.set(true);
  }

  async saveGroup() {
    if (!this.currentGroup.name || !this.currentGroup.lead) return;

    // Parse tags from comma-separated input
    this.currentGroup.tags = this.tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    this.saving.set(true);

    // Set icon based on type
    const selectedType = this.contactTypes.find(t => t.value === this.currentGroup.contact_type);
    if (selectedType) {
      this.currentGroup.contact_icon = selectedType.icon;
    }

    try {
      if (this.editMode() && this.currentGroup.id) {
        await this.workingGroupsService.updateWorkingGroup(
          this.currentGroup.id,
          this.currentGroup
        );
        this.messageService.add({
          severity: 'success',
          summary: 'Erfolg',
          detail: 'AG aktualisiert',
        });
      } else {
        const { id, ...newGroup } = this.currentGroup;
        await this.workingGroupsService.addWorkingGroup(newGroup);
        this.messageService.add({
          severity: 'success',
          summary: 'Erfolg',
          detail: 'AG erstellt',
        });
      }
      this.dialogVisible.set(false);
    } catch (e) {
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: (e as Error).message,
      });
    }
    this.saving.set(false);
  }

  confirmDelete(group: WorkingGroup) {
    if (!group.id) return;
    this.confirmationService.confirm({
      message: `Möchtest du die AG "${group.name}" wirklich löschen?`,
      header: 'Löschen bestätigen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ja, löschen',
      rejectLabel: 'Abbrechen',
      accept: async () => {
        try {
          if (group.id) {
            await this.workingGroupsService.deleteWorkingGroup(group.id);
            this.messageService.add({
              severity: 'success',
              summary: 'Gelöscht',
              detail: 'AG wurde gelöscht',
            });
          }
        } catch (e) {
          this.messageService.add({
            severity: 'error',
            summary: 'Fehler',
            detail: (e as Error).message,
          });
        }
      },
    });
  }

  async toggleMembership(group: WorkingGroup) {
    if (!group.id) return;

    if (!this.auth.isLoggedIn()) {
      this.messageService.add({ severity: 'info', summary: 'Login erforderlich', detail: 'Bitte melde dich an, um beizutreten.' });
      return;
    }

    const member = this.auth.currentMember();
    if (!member || !member.id) {
      this.messageService.add({ severity: 'warn', summary: 'Profil fehlt', detail: 'Dein Benutzerkonto ist mit keinem Mitgliedsprofil verknüpft.' });
      return;
    }

    try {
      if (this.myMemberships().has(group.id)) {
        await this.workingGroupsService.leaveGroup(group.id, member.id);
        this.messageService.add({ severity: 'success', summary: 'Verlassen', detail: `Du hast die AG "${group.name}" verlassen.` });
      } else {
        await this.workingGroupsService.joinGroup(group.id, member.id);
        this.messageService.add({ severity: 'success', summary: 'Beigetreten', detail: `Du bist der AG "${group.name}" beigetreten!` });
      }
    } catch (e: any) {
      this.messageService.add({ severity: 'error', summary: 'Fehler', detail: e.message });
    }
  }

  // Helpers for template
  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 50%)`;
  }

  /**
   * Check if current user can edit a specific AG
   */
  canEditAg(groupId: string): boolean {
    return this.permissions.canEditAg(groupId);
  }

  /**
   * Get role label for display
   */
  getRoleLabel(role: AgRole): string {
    return this.agRoleLabels[role];
  }

  /**
   * Get current user's role in an AG
   */
  getMyAgRole(groupId: string): AgRole | null {
    return this.myAgRoles().get(groupId) || null;
  }

  /**
   * Open member management dialog for an AG
   */
  async openMembersDialog(group: WorkingGroup): Promise<void> {
    if (!group.id) return;
    this.currentAgForMembers.set(group);
    this.loadingMembers.set(true);
    this.membersDialogVisible.set(true);

    try {
      const members = await this.workingGroupsService.getAgMembers(group.id);
      this.agMembers.set(members);
    } catch (e) {
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Mitglieder konnten nicht geladen werden',
      });
    }
    this.loadingMembers.set(false);
  }

  /**
   * Update a member's role in the current AG
   */
  async updateMemberRole(
    memberId: string,
    newRole: AgRole
  ): Promise<void> {
    const ag = this.currentAgForMembers();
    if (!ag?.id) return;

    try {
      await this.workingGroupsService.updateMemberRole(
        ag.id,
        memberId,
        newRole
      );
      // Update local state
      this.agMembers.update(members =>
        members.map(m =>
          m.member_id === memberId ? { ...m, role: newRole } : m
        )
      );
      this.messageService.add({
        severity: 'success',
        summary: 'Erfolg',
        detail: 'Rolle aktualisiert',
      });
    } catch (e) {
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: (e as Error).message,
      });
    }
  }
}
