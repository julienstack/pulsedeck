import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarLeft } from '../sidebar-left/sidebar-left';
import { SidebarRight } from '../sidebar-right/sidebar-right';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SidebarLeft, SidebarRight],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {

}
