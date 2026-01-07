import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';

interface Member {
  id: number;
  name: string;
  role: string;
  department: string;
  status: 'Active' | 'Inactive' | 'Pending';
  email: string;
  joinDate: string;
  avatar?: string;
}

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    AvatarModule,
    MenuModule,
    TooltipModule
  ],
  templateUrl: './members.html',
  styleUrl: './members.css'
})
export class MembersComponent {
  @ViewChild('dt') dt: Table | undefined;

  members: Member[] = [
    { id: 1, name: 'Max Mustermann', role: 'Vorstand', department: 'Management', status: 'Active', email: 'max.mustermann@example.com', joinDate: '15.01.2023' },
    { id: 2, name: 'Erika Musterfrau', role: 'Mitglied', department: 'Marketing', status: 'Active', email: 'erika.musterfrau@example.com', joinDate: '03.03.2023' },
    { id: 3, name: 'John Doe', role: 'Kassierer', department: 'Finanzen', status: 'Inactive', email: 'john.doe@example.com', joinDate: '22.05.2022' },
    { id: 4, name: 'Jane Roe', role: 'Schriftführer', department: 'Verwaltung', status: 'Pending', email: 'jane.roe@example.com', joinDate: '11.08.2024' },
    { id: 5, name: 'Hans Müller', role: 'Mitglied', department: 'Technik', status: 'Active', email: 'hans.mueller@example.com', joinDate: '30.11.2023' },
    { id: 6, name: 'Sarah Schmidt', role: 'Vorstand', department: 'Management', status: 'Active', email: 'sarah.schmidt@example.com', joinDate: '05.02.2023' },
    { id: 7, name: 'Tom Weber', role: 'Mitglied', department: 'Marketing', status: 'Active', email: 'tom.weber@example.com', joinDate: '18.06.2024' },
    { id: 8, name: 'Lisa König', role: 'Mitglied', department: 'Finanzen', status: 'Inactive', email: 'lisa.koenig@example.com', joinDate: '29.09.2022' },
    { id: 9, name: 'Michael Bauer', role: 'Teamleiter', department: 'Technik', status: 'Active', email: 'michael.bauer@example.com', joinDate: '12.12.2021' },
    { id: 10, name: 'Julia Wolf', role: 'Mitglied', department: 'Verwaltung', status: 'Active', email: 'julia.wolf@example.com', joinDate: '01.04.2024' },
    { id: 11, name: 'Peter Koch', role: 'Mitglied', department: 'Technik', status: 'Pending', email: 'peter.koch@example.com', joinDate: '15.08.2024' },
    { id: 12, name: 'Sandra Meyer', role: 'Mitglied', department: 'Marketing', status: 'Active', email: 'sandra.meyer@example.com', joinDate: '20.02.2023' }
  ];

  selectedMembers: Member[] = [];

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

  getStatusLabel(status: string): string {
    switch (status) {
      case 'Active': return 'Aktiv';
      case 'Inactive': return 'Inaktiv';
      case 'Pending': return 'Ausstehend';
      default: return status;
    }
  }

  getStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'info' | undefined {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'danger';
      case 'Pending': return 'warn';
      default: return 'info';
    }
  }

  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    if (this.dt) {
      this.dt.filterGlobal(input.value, 'contains');
    }
  }
}
