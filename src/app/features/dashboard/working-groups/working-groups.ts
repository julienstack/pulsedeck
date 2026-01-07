import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { CardModule } from 'primeng/card';

interface WorkingGroup {
  id: number;
  name: string;
  description: string;
  lead: string;
  membersCount: number;
  nextMeeting: string;
  contact: {
    type: 'Signal' | 'Discord' | 'WhatsApp' | 'Email';
    value: string;
    link?: string;
    icon: string;
  };
  tags: string[];
}

@Component({
  selector: 'app-working-groups',
  standalone: true,
  imports: [CommonModule, ButtonModule, AccordionModule, TagModule, AvatarModule, CardModule],
  templateUrl: './working-groups.html',
  styleUrl: './working-groups.css'
})
export class WorkingGroupsComponent {
  ags: WorkingGroup[] = [
    {
      id: 1,
      name: 'AG Technik & IT',
      description: 'Wir kümmern uns um die Server-Infrastruktur, das WLAN im Vereinsheim und entwickeln interne Tools wie dieses Dashboard.',
      lead: 'Alex T.',
      membersCount: 8,
      nextMeeting: 'Mo, 20:00 Uhr',
      contact: {
        type: 'Discord',
        value: '#tech-talk',
        link: 'https://discord.gg/example',
        icon: 'pi-discord'
      },
      tags: ['IT', 'Infrastructure', 'Coding']
    },
    {
      id: 2,
      name: 'AG Social Media',
      description: 'Content Creation für Instagram, TikTok und LinkedIn. Wir sorgen für Reichweite und gutes Image.',
      lead: 'Maria S.',
      membersCount: 12,
      nextMeeting: 'Mi, 18:30 Uhr',
      contact: {
        type: 'Signal',
        value: 'Invite Link',
        link: 'https://signal.group/example',
        icon: 'pi-comment'
      },
      tags: ['Marketing', 'Design', 'Public Relations']
    },
    {
      id: 3,
      name: 'AG Veranstaltungen',
      description: 'Planung und Durchführung von Sommerfest, Weihnachtsfeier und monatlichen Meetups.',
      lead: 'Jonas B.',
      membersCount: 15,
      nextMeeting: 'Do, 19:00 Uhr',
      contact: {
        type: 'WhatsApp',
        value: 'Gruppe Events',
        link: 'https://chat.whatsapp.com/example',
        icon: 'pi-whatsapp'
      },
      tags: ['Events', 'Orga', 'Party']
    },
    {
      id: 4,
      name: 'AG Nachhaltigkeit',
      description: 'Erarbeitung von Konzepten für einen grüneren Verein und Organisation von Müllsammel-Aktionen.',
      lead: 'Lena M.',
      membersCount: 6,
      nextMeeting: '1. Di im Monat',
      contact: {
        type: 'Email',
        value: 'nachhaltigkeit@verein.de',
        link: 'mailto:nachhaltigkeit@verein.de',
        icon: 'pi-envelope'
      },
      tags: ['Green', 'Umwelt', 'Impact']
    }
  ];

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getAvatarColor(name: string): string {
    const colors = [
      '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }
}
