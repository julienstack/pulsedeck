import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Import DatePipe
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  startTime: string;
  endTime?: string;
  type: 'general' | 'personal' | 'ag';
  location: string;
  description?: string;
  agName?: string;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TagModule, DatePipe], // Add DatePipe to imports
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class CalendarComponent {
  events: CalendarEvent[] = [
    {
      id: 1,
      title: 'Vorstandssitzung',
      date: new Date('2025-01-20'),
      startTime: '19:00',
      endTime: '21:00',
      type: 'general',
      location: 'Vereinsheim',
      description: 'Monatliche Vorstandssitzung. Themen: Planung Sommerfest, Budget 2025.'
    },
    {
      id: 2,
      title: 'AG Technik Treffen',
      date: new Date('2025-01-22'),
      startTime: '20:00',
      type: 'ag',
      agName: 'AG Technik',
      location: 'Online (Zoom)',
      description: 'Besprechung der neuen Lichtanlage.'
    },
    {
      id: 3,
      title: 'Personalgespräch',
      date: new Date('2025-01-24'),
      startTime: '10:00',
      endTime: '11:00',
      type: 'personal',
      location: 'Büro Vorsitzender',
      description: 'Jahresgespräch mit dem Abteilungsleiter.'
    },
    {
      id: 4,
      title: 'Sommerfest Planung',
      date: new Date('2025-02-05'),
      startTime: '18:30',
      type: 'ag',
      agName: 'AG Event',
      location: 'Vereinsheim',
      description: 'Erstes Planungstreffen für das große Sommerfest.'
    },
    {
      id: 5,
      title: 'Mitgliederversammlung',
      date: new Date('2025-02-15'),
      startTime: '14:00',
      endTime: '18:00',
      type: 'general',
      location: 'Stadthalle',
      description: 'Jährliche ordentliche Mitgliederversammlung.'
    },
  ];

  get sortedEvents() {
    return this.events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}
