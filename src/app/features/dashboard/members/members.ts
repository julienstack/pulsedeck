import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
// PrimeNG Imports
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AvatarModule } from 'primeng/avatar';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';

import { MembersService } from '../../../shared/services/members.service';
import { Member } from '../../../shared/models/member.model';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    AvatarModule,
    MessageModule,
    ToastModule,
    FileUploadModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    CheckboxModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './members.html',
  styleUrl: './members.css',
})
export class MembersComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  private membersService = inject(MembersService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public auth = inject(AuthService);

  members = this.membersService.members;
  loading = this.membersService.loading;
  error = this.membersService.error;

  selectedMembers: Member[] = [];
  mobileExpandedRows: Record<string, boolean> = {}; // Mobile-specific expand state

  // Toggle Row using Table API (desktop) or manual state (mobile)
  toggleRow(member: Member) {
    if (this.dt) {
      this.dt.toggleRow(member);
    }
    // Also toggle mobile state
    if (member.id) {
      this.mobileExpandedRows[member.id] = !this.mobileExpandedRows[member.id];
    }
  }

  isRowExpanded(member: Member): boolean {
    // Check mobile state first, then fall back to table
    if (member.id && this.mobileExpandedRows[member.id]) {
      return true;
    }
    return this.dt?.isRowExpanded(member) ?? false;
  }

  // Computed filter for search
  currentSearchTerm = signal('');

  filteredMembers = computed(() => {
    const term = this.currentSearchTerm().toLowerCase();
    let mList = this.members();
    if (term) {
      mList = mList.filter(m =>
        m.name.toLowerCase().includes(term) ||
        m.role?.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term)
      );
    }
    return mList;
  });

  dialogVisible = signal(false);
  editMode = signal(false);
  saving = signal(false);
  invitingMemberId: string | null = null;

  currentMember: Partial<Member> = this.getEmptyMember();

  statusOptions = [
    { label: 'Aktiv', value: 'Active' },
    { label: 'Inaktiv', value: 'Inactive' },
    { label: 'Ausstehend', value: 'Pending' },
  ];

  ngOnInit(): void {
    this.membersService.fetchMembers();

    // Check for addNew query param to auto-open the modal
    this.route.queryParams.subscribe(params => {
      if (params['addNew'] === 'true') {
        // Small delay to ensure component is ready
        setTimeout(() => this.openNew(), 100);
        // Remove the query param from URL
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true,
        });
      }
    });
  }

  getEmptyMember(): Partial<Member> {
    return {
      name: '',
      role: 'Mitglied',
      department: '',
      status: 'Active',
      email: '',
      join_date: new Date().toLocaleDateString('de-DE'),
      avatar_url: '',
      app_role: 'member',
      user_id: '',
      street: '',
      zip_code: '',
      city: '',
      phone: '',
      birthday: ''
    };
  }

  openNew() {
    this.currentMember = this.getEmptyMember();
    this.editMode.set(false);
    this.dialogVisible.set(true);
  }

  editMember(member: Member) {
    this.currentMember = { ...member };
    this.editMode.set(true);
    this.dialogVisible.set(true);
  }

  async saveMember() {
    if (!this.currentMember.name || !this.currentMember.email) return;

    this.saving.set(true);
    try {
      if (this.editMode() && this.currentMember.id) {
        await this.membersService.updateMember(
          this.currentMember.id,
          this.currentMember
        );
        this.messageService.add({
          severity: 'success',
          summary: 'Erfolg',
          detail: 'Mitglied aktualisiert',
        });
      } else {
        await this.membersService.addMember(this.currentMember as Member);
        this.messageService.add({
          severity: 'success',
          summary: 'Erfolg',
          detail: 'Mitglied hinzugefügt',
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

  confirmDelete(member: Member) {
    this.confirmationService.confirm({
      message: `Möchtest du "${member.name}" wirklich löschen?`,
      header: 'Löschen bestätigen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ja, löschen',
      rejectLabel: 'Abbrechen',
      accept: async () => {
        try {
          await this.membersService.deleteMember(member.id!);
          this.messageService.add({
            severity: 'success',
            summary: 'Gelöscht',
            detail: 'Mitglied entfernt',
          });
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

  deleteSelected() {
    if (!this.selectedMembers || !this.selectedMembers.length) return;
    this.confirmationService.confirm({
      message: `Möchtest du ${this.selectedMembers.length} Mitglieder wirklich löschen?`,
      header: 'Löschen bestätigen',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          for (const m of this.selectedMembers) {
            if (m.id) await this.membersService.deleteMember(m.id);
          }
          this.selectedMembers = [];
          this.messageService.add({ severity: 'success', summary: 'Gelöscht', detail: 'Mitglieder entfernt' });
        } catch (e) {
          this.messageService.add({ severity: 'error', summary: 'Fehler', detail: (e as Error).message });
        }
      }
    });
  }

  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    this.currentSearchTerm.set(input.value);
  }

  getStatusLabel(status: string) {
    const labels: Record<string, string> = {
      'Active': 'Aktiv',
      'Inactive': 'Inaktiv',
      'Pending': 'Ausstehend'
    };
    return labels[status] || status;
  }

  getStatusSeverity(status: string) {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'danger';
      case 'Pending':
        return 'warn';
      default:
        return 'info';
    }
  }

  getRoleSeverity(role: string) {
    switch (role) {
      case 'admin': return 'danger';
      case 'committee': return 'contrast';
      case 'member': return 'info';
      default: return 'secondary';
    }
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  }

  async inviteMember(member: Member) {
    if (!member.id || !member.email) return;

    this.invitingMemberId = member.id;
    try {
      const result = await this.membersService.inviteMember(member.id, member.email);
      const isReset = result.type === 'reset';
      this.messageService.add({
        severity: 'success',
        summary: isReset ? 'Link gesendet' : 'Einladung gesendet',
        detail: result.message || (isReset
          ? `Passwort-Reset-Link an ${member.email} gesendet`
          : `Einladung an ${member.email} versendet`),
      });
    } catch (e) {
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: (e as Error).message,
      });
    }
    this.invitingMemberId = null;
  }
}
