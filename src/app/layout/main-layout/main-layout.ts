import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { trigger, style, animate, transition } from '@angular/animations';
import { SidebarLeft } from '../sidebar-left/sidebar-left';
import { SidebarRight } from '../sidebar-right/sidebar-right';
import { FeedbackBadgeComponent } from '../../features/feedback/feedback-badge/feedback-badge.component';
import { ThemeService } from '../../shared/services/theme.service';
import { OrganizationService } from '../../shared/services/organization.service';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    SidebarLeft,
    SidebarRight,
    FeedbackBadgeComponent,
    DrawerModule,
    ButtonModule,
    TooltipModule,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
  animations: [
    trigger('workspaceAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition('* => *', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class MainLayout {
  theme = inject(ThemeService);
  orgService = inject(OrganizationService);

  leftSidebarVisible = signal(false);
  rightSidebarVisible = signal(false);

  /** Desktop: Right sidebar collapsed state (default: expanded) */
  rightSidebarCollapsed = signal(false);

  toggleRightSidebar() {
    this.rightSidebarCollapsed.update(v => !v);
  }
}
