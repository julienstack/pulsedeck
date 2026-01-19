import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../shared/services/auth.service';
import { WorkingGroupsService } from '../../../shared/services/working-groups.service';
import { EventsService } from '../../../shared/services/events.service';
import { OnboardingService } from '../../../shared/services/onboarding.service';
import { StatisticsService } from '../../../shared/services/statistics.service';
import { OrganizationService } from '../../../shared/services/organization.service';
import { CalendarEvent, getEventType } from '../../../shared/models/calendar-event.model';
import { WorkingGroup } from '../../../shared/models/working-group.model';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ProgressBarModule,
    TooltipModule,
  ],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css',
})
export class DashboardHome implements OnInit {
  auth = inject(AuthService);
  workingGroupsService = inject(WorkingGroupsService);
  eventsService = inject(EventsService);
  onboardingService = inject(OnboardingService);
  statsService = inject(StatisticsService);
  orgService = inject(OrganizationService);

  myWorkingGroups: WorkingGroup[] = [];
  myUpcomingEvents: CalendarEvent[] = [];
  isNewMember = false;

  private lastOrgId: string | null = null;

  constructor() {
    // React to organization changes - reload all data
    effect(() => {
      const currentOrgId = this.orgService.currentOrgId();
      if (currentOrgId && currentOrgId !== this.lastOrgId) {
        this.lastOrgId = currentOrgId;
        this.loadAllData();
      }
    });

    // React to membership changes
    effect(() => {
      const memberships = this.workingGroupsService.myMemberships();
      const groups = this.workingGroupsService.workingGroups();
      this.updateMyWorkingGroups(memberships, groups);
    });

    // React to events changes
    effect(() => {
      const events = this.eventsService.events();
      const memberships = this.workingGroupsService.myMemberships();
      this.updateMyUpcomingEvents(events, memberships);
    });

    // Check if new member (less than 30 days)
    effect(() => {
      const member = this.auth.currentMember();
      if (member?.join_date) {
        const joinDate = this.parseGermanDate(member.join_date);
        const daysSinceJoin = this.getDaysSince(joinDate);
        this.isNewMember = daysSinceJoin < 30;
      }
    });
  }

  async ngOnInit(): Promise<void> {
    // Initial load
    await this.loadAllData();
  }

  private async loadAllData(): Promise<void> {
    // Fetch data for current organization
    await Promise.all([
      this.workingGroupsService.fetchWorkingGroups(),
      this.eventsService.fetchEvents(),
      this.statsService.fetchStats(),
    ]);

    // Fetch memberships if logged in
    const member = this.auth.currentMember();
    if (member?.id) {
      await this.workingGroupsService.fetchMyMemberships(member.id);
      await this.onboardingService.fetchProgress();
    }
  }

  private updateMyWorkingGroups(
    memberships: Set<string>,
    groups: WorkingGroup[]
  ): void {
    this.myWorkingGroups = groups.filter(
      g => g.id && memberships.has(g.id)
    );
  }

  private updateMyUpcomingEvents(
    events: CalendarEvent[],
    memberships: Set<string>
  ): void {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    // Construct local YYYY-MM-DD for comparison
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    const localTodayStr = `${year}-${month}-${day}`;

    // Filter future events that belong to my AGs or are general
    this.myUpcomingEvents = events
      .filter(e => {
        // Simple string comparison for dates works for YYYY-MM-DD
        if (e.date < localTodayStr) return false;

        // If today, check time
        if (e.date === localTodayStr) {
          const timeStr = e.end_time || e.start_time;
          if (timeStr) {
            const [h, m] = timeStr.split(':').map((x: any) => parseInt(x, 10));
            if (h < currentHours || (h === currentHours && m < currentMinutes)) {
              return false;
            }
          }
        }

        // Include general events or events from my AGs
        if (!e.working_group_id) return true;
        return memberships.has(e.working_group_id);
      })
      .slice(0, 3);
  }

  /**
   * Parse German date format (dd.mm.yyyy or dd.mm.yy)
   */
  private parseGermanDate(dateStr: string): Date {
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      let year = parseInt(parts[2], 10);
      if (year < 100) {
        year += 2000;
      }
      return new Date(year, parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
    return new Date(dateStr);
  }

  /**
   * Get days since a date
   */
  private getDaysSince(date: Date): number {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Format date for display
   */
  formatEventDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate.getTime() === today.getTime()) {
      return 'Heute';
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (eventDate.getTime() === tomorrow.getTime()) {
      return 'Morgen';
    }

    return date.toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
  }

  /**
   * Get greeting based on time of day
   */
  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Guten Morgen';
    if (hour < 18) return 'Guten Tag';
    return 'Guten Abend';
  }

  /**
   * Get member since text
   */
  getMemberSinceText(): string {
    const member = this.auth.currentMember();
    if (!member?.join_date) return '';

    const joinDate = this.parseGermanDate(member.join_date);
    const days = this.getDaysSince(joinDate);

    if (days < 7) {
      return `Seit ${days} Tag${days === 1 ? '' : 'en'} dabei`;
    }
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `Seit ${weeks} Woche${weeks === 1 ? '' : 'n'} dabei`;
    }
    if (days < 365) {
      const months = Math.floor(days / 30);
      return `Seit ${months} Monat${months === 1 ? '' : 'en'} dabei`;
    }

    const years = Math.floor(days / 365);
    return `Seit ${years} Jahr${years === 1 ? '' : 'en'} dabei`;
  }

  /**
   * Get event type icon
   */
  getEventIcon(event: CalendarEvent): string {
    const type = getEventType(event);
    switch (type) {
      case 'ag':
        return 'pi-users';
      default:
        return 'pi-calendar';
    }
  }

  /**
   * Get event type color
   */
  getEventColor(event: CalendarEvent): string {
    const type = getEventType(event);
    switch (type) {
      case 'ag':
        return 'teal';
      default:
        return 'linke';
    }
  }

  /**
   * Get link for onboarding step
   */
  getStepLink(stepKey: string): string {
    switch (stepKey) {
      case 'profile_complete':
        return '/dashboard/profile';
      case 'joined_ag':
        return '/dashboard/ags';
      case 'visited_wiki':
        return '/dashboard/wiki';
      case 'visited_calendar':
        return '/dashboard/calendar';
      case 'added_task':
        return '/dashboard'; // Tasks are on the main dashboard sidebar
      default:
        return '/dashboard';
    }
  }
}
