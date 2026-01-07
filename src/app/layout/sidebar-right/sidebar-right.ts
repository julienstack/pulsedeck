import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar-right',
  imports: [RouterLink],
  templateUrl: './sidebar-right.html',
  styleUrl: './sidebar-right.css',
})
export class SidebarRight {
  upcomingEvents = [
    {
      title: 'Vorstandssitzung',
      date: 'Heute',
      time: '19:00 Uhr',
      type: 'meeting',
      icon: 'pi-users',
      color: 'red'
    },
    {
      title: 'Mitgliederversammlung',
      date: '24. Okt',
      time: '18:00 Uhr',
      type: 'event',
      icon: 'pi-star',
      color: 'blue'
    },
    {
      title: 'Sommerfest',
      date: '15. Jul',
      time: '14:00 Uhr',
      type: 'party',
      icon: 'pi-gift',
      color: 'green'
    }
  ];

  tasks = [
    { id: 1, title: 'Protokoll hochladen', done: false },
    { id: 2, title: 'Antrag #42 prüfen', done: true },
    { id: 3, title: 'Raum buchen', done: false }
  ];

  toggleTask(task: any) {
    task.done = !task.done;
  }
}
