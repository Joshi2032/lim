import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface MenuItem {
	id: string;
	label: string;
	icon: string;
	route: string;
	active?: boolean;
}

export interface User {
	name: string;
	role: string;
	initials: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() menuItems: MenuItem[] = [];
  @Input() currentUser: User | null = null;
  @Input() cartCount: number = 0;

  @Output() logout = new EventEmitter<void>();

  onLogout() {
    this.logout.emit();
  }
}
