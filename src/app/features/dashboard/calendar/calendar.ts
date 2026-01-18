import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EventsService } from '../../../shared/services/events.service';
import { CalendarEvent } from '../../../shared/models/calendar-event.model';
import { AuthService } from '../../../shared/services/auth.service';
import { PermissionsService } from '../../../shared/services/permissions.service';
import { WorkingGroupsService } from '../../../shared/services/working-groups.service';
import { OnboardingService } from '../../../shared/services/onboarding.service';
import {
  EventRegistrationService,
  EventRegistration,
  RegistrationStatus
} from '../../../shared/services/event-registration.service';
import { EventSlotService, EventSlot, CreateSlotData } from '../../../shared/services/event-slot.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TagModule,
    DatePipe,
    DialogModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
    ProgressSpinnerModule,
    MessageModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    InputNumberModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class CalendarComponent implements OnInit {
  private eventsService = inject(EventsService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private onboardingService = inject(OnboardingService);
  public auth = inject(AuthService);
  public permissions = inject(PermissionsService);
  readonly registrationService = inject(EventRegistrationService);
  readonly slotService = inject(EventSlotService);
  readonly workingGroupsService = inject(WorkingGroupsService);
  workingGroups = this.workingGroupsService.workingGroups;

  // Permission-based visibility
  canCreateEvent = this.permissions.canCreateEvents;

  events = this.eventsService.events;
  loading = this.eventsService.loading;
  error = this.eventsService.error;

  dialogVisible = signal(false);
  editMode = signal(false);
  saving = signal(false);

  // Registration
  participantsDialogVisible = signal(false);
  selectedEventForParticipants = signal<CalendarEvent | null>(null);
  participants = signal<EventRegistration[]>([]);
  participantCounts = signal<Map<string, number>>(new Map());

  currentEvent: Partial<CalendarEvent> = this.getEmptyEvent();
  eventDate: Date | null = null;
  tempVisibility = 'public';

  typeOptions = [
    { label: 'Allgemein', value: 'general' },
    { label: 'Persönlich', value: 'personal' },
    { label: 'AG', value: 'ag' },
  ];

  visibilityOptions = [
    { label: 'Öffentlich (Alle)', value: 'public' },
    { label: 'Nur Mitglieder', value: 'member' },
    { label: 'Nur Vorstand', value: 'committee' },
    { label: 'Nur Admin', value: 'admin' },
    { label: 'Nur AG-Mitglieder', value: 'ag-only' },
  ];

  ngOnInit(): void {
    this.eventsService.fetchEvents();
    this.workingGroupsService.fetchWorkingGroups();
    // Track calendar visit for onboarding
    this.onboardingService.trackCalendarVisit();
    // Load user's registrations
    this.registrationService.fetchMyRegistrations();
  }

  getEmptyEvent(): Partial<CalendarEvent> {
    return {
      title: '',
      date: new Date().toISOString().split('T')[0],
      start_time: '19:00',
      end_time: null,
      type: 'general',
      location: '',
      description: null,
      ag_name: null,
      working_group_id: null,
      allowed_roles: ['public', 'member', 'committee', 'admin']
    };
  }

  get sortedEvents() {
    return [...this.events()].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  openNew() {
    this.currentEvent = this.getEmptyEvent();
    this.eventDate = new Date();
    this.tempVisibility = 'public';
    this.editMode.set(false);
    this.dialogVisible.set(true);
  }

  editEvent(event: CalendarEvent) {
    this.currentEvent = { ...event };
    this.eventDate = new Date(event.date);
    // Detect AG-only visibility
    if (event.working_group_id && (!event.allowed_roles || event.allowed_roles.length === 0)) {
      this.tempVisibility = 'ag-only';
    } else {
      this.tempVisibility = this.getVisibilityFromRoles(event.allowed_roles);
    }
    this.editMode.set(true);
    this.dialogVisible.set(true);
  }

  async saveEvent() {
    if (!this.currentEvent.title || !this.currentEvent.location) return;

    if (this.eventDate) {
      this.currentEvent.date = this.eventDate.toISOString().split('T')[0];
    }

    // Handle AG-only visibility
    if (this.tempVisibility === 'ag-only') {
      this.currentEvent.allowed_roles = []; // Empty = relies on AG membership check in RLS
    } else {
      this.currentEvent.allowed_roles = this.getRolesFromVisibility(this.tempVisibility);
    }

    // Set ag_name from selected working group
    if (this.currentEvent.type === 'ag' && this.currentEvent.working_group_id) {
      const selectedGroup = this.workingGroups().find(
        g => g.id === this.currentEvent.working_group_id
      );
      if (selectedGroup) {
        this.currentEvent.ag_name = selectedGroup.name;
      }
    } else {
      this.currentEvent.working_group_id = null;
      this.currentEvent.ag_name = null;
    }

    this.saving.set(true);
    try {
      if (this.editMode() && this.currentEvent.id) {
        await this.eventsService.updateEvent(
          this.currentEvent.id,
          this.currentEvent
        );
        this.messageService.add({
          severity: 'success',
          summary: 'Erfolg',
          detail: 'Termin aktualisiert',
        });
      } else {
        await this.eventsService.addEvent(this.currentEvent as CalendarEvent);
        this.messageService.add({
          severity: 'success',
          summary: 'Erfolg',
          detail: 'Termin erstellt',
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

  confirmDelete(event: CalendarEvent) {
    this.confirmationService.confirm({
      message: `Möchtest du "${event.title}" wirklich löschen?`,
      header: 'Löschen bestätigen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ja, löschen',
      rejectLabel: 'Abbrechen',
      accept: async () => {
        try {
          await this.eventsService.deleteEvent(event.id!);
          this.messageService.add({
            severity: 'success',
            summary: 'Gelöscht',
            detail: 'Termin wurde gelöscht',
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

  parseDate(dateStr: string): Date {
    return new Date(dateStr);
  }

  // --- Helpers ---
  getVisibilityFromRoles(roles: string[] = []): string {
    if (!roles || roles.length === 0) return 'public';
    if (roles.includes('public')) return 'public';
    if (roles.includes('member') && !roles.includes('public')) return 'member';
    if (roles.includes('committee') && !roles.includes('member')) return 'committee';
    if (roles.includes('admin') && !roles.includes('committee')) return 'admin';
    return 'public';
  }

  getRolesFromVisibility(vis: string): string[] {
    switch (vis) {
      case 'public': return ['public', 'member', 'committee', 'admin'];
      case 'member': return ['member', 'committee', 'admin'];
      case 'committee': return ['committee', 'admin'];
      case 'admin': return ['admin'];
      default: return ['public', 'member', 'committee', 'admin'];
    }
  }

  // --- Registration Methods ---

  /**
   * Check if current user is registered for an event
   */
  getMyRegistration(eventId: string): RegistrationStatus | null {
    return this.registrationService.isRegistered(eventId);
  }

  /**
   * Toggle registration for an event
   */
  async toggleRegistration(event: CalendarEvent): Promise<void> {
    if (!event.id) return;

    try {
      const currentStatus = this.getMyRegistration(event.id);

      if (currentStatus === 'confirmed') {
        await this.registrationService.unregister(event.id);
        this.messageService.add({
          severity: 'info',
          summary: 'Abgemeldet',
          detail: `Du hast dich von "${event.title}" abgemeldet.`,
        });
      } else {
        await this.registrationService.register(event.id, 'confirmed');
        this.messageService.add({
          severity: 'success',
          summary: 'Angemeldet',
          detail: `Du hast dich für "${event.title}" angemeldet!`,
        });
      }
    } catch (e) {
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: (e as Error).message,
      });
    }
  }

  /**
   * Open participants dialog for an event
   */
  async openParticipantsDialog(event: CalendarEvent): Promise<void> {
    if (!event.id) return;

    this.selectedEventForParticipants.set(event);
    this.participantsDialogVisible.set(true);

    try {
      const regs = await this.registrationService.getEventRegistrations(event.id);
      this.participants.set(regs);
    } catch (e) {
      console.error('Error loading participants:', e);
    }
  }

  /**
   * Get participant count for display
   */
  getParticipantCount(eventId: string): number {
    return this.participantCounts().get(eventId) ?? 0;
  }

  /**
   * Helper: Get initials from name
   */
  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  /**
   * Helper: Get color from name
   */
  getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 50%)`;
  }

  // --- iCal Export Methods ---

  /**
   * Download iCal file
   */
  downloadICalFile(): void {
    this.eventsService.downloadICalFile();
    this.messageService.add({
      severity: 'info',
      summary: 'Download',
      detail: 'Kalender wird heruntergeladen...',
    });
  }

  /**
   * Copy iCal subscription URL to clipboard
   */
  async copyICalUrl(): Promise<void> {
    const url = this.eventsService.getICalUrl();

    try {
      await navigator.clipboard.writeText(url);
      this.messageService.add({
        severity: 'success',
        summary: 'Kopiert',
        detail: 'Abo-Link in Zwischenablage kopiert!',
      });
    } catch (e) {
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Link konnte nicht kopiert werden.',
      });
    }
  }

  // =========================================================================
  // HELPER SLOTS
  // =========================================================================

  manageSlotsDialogVisible = signal<boolean>(false);
  currentSlots = this.slotService.slots;
  slotsLoading = signal(false);
  newSlotTitle = signal('');
  newSlotMaxHelpers = signal(3);

  async openManageSlots(event: CalendarEvent): Promise<void> {
    this.currentEvent = JSON.parse(JSON.stringify(event)); // Deep copy to avoid reference issues
    this.manageSlotsDialogVisible.set(true);
    if (event.id) {
      await this.slotService.loadSlots(event.id, this.auth.currentMember()?.id);
    }
  }

  async createSlot(): Promise<void> {
    const eventId = this.currentEvent.id;
    const orgId = this.currentEvent.organization_id;

    if (!this.newSlotTitle()) {
      this.messageService.add({ severity: 'warn', summary: 'Fehler', detail: 'Bitte Titel eingeben' });
      return;
    }
    if (!eventId || !orgId) {
      console.error('Validation failed:', { eventId, orgId, title: this.newSlotTitle() });
      this.messageService.add({ severity: 'error', summary: 'Fehler', detail: 'Event-Daten unvollständig' });
      return;
    }

    this.slotsLoading.set(true);
    const data: CreateSlotData = {
      event_id: eventId,
      organization_id: orgId,
      title: this.newSlotTitle(),
      max_helpers: this.newSlotMaxHelpers(),
      sort_order: this.currentSlots().length
    };

    await this.slotService.createSlot(data);
    await this.slotService.loadSlots(eventId, this.auth.currentMember()?.id);

    // Reset form
    this.newSlotTitle.set('');
    this.newSlotMaxHelpers.set(3);
    this.slotsLoading.set(false);
  }

  async deleteSlot(slotId: string): Promise<void> {
    await this.slotService.deleteSlot(slotId);
    if (this.currentEvent.id) {
      await this.slotService.loadSlots(this.currentEvent.id, this.auth.currentMember()?.id);
    }
  }

  async toggleSlotSignup(slot: EventSlot): Promise<void> {
    const memberId = this.auth.currentMember()?.id;
    if (!memberId) return;

    if (slot.is_signed_up) {
      await this.slotService.cancelSignup(slot.id, memberId);
    } else {
      if (!this.slotService.hasCapacity(slot)) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Schicht voll',
          detail: 'Diese Schicht ist bereits voll belegt.'
        });
        return;
      }
      await this.slotService.signUp(slot.id, memberId, slot.organization_id);
    }

    if (this.currentEvent.id) {
      await this.slotService.loadSlots(this.currentEvent.id, memberId);
    }
  }
}
