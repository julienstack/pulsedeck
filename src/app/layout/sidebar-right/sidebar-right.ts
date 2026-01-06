import { Component } from '@angular/core';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar-right',
  imports: [DatePickerModule, FormsModule],
  templateUrl: './sidebar-right.html',
  styleUrl: './sidebar-right.css',
})
export class SidebarRight {
  date: Date | undefined;
}
