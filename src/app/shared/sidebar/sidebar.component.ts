import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AvatarComponent } from '../avatar/avatar.component';

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
  imports: [RouterLink, RouterLinkActive, AvatarComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() menuItems: MenuItem[] = [];
  // Globally hidden item ids: remove Dashboard, Usuarios, Clientes, Entregas (now in Pedidos)
  private readonly hiddenIdsDefault: string[] = ['dashboard', 'usuarios', 'clientes', 'entregas'];
  // Optional extension point to hide other ids if needed
  @Input() hiddenIds: string[] = [];
  @Input() currentUser: User | null = null;
  @Input() cartCount: number = 0;

  @Output() logout = new EventEmitter<void>();

  onLogout() {
    this.logout.emit();
  }

  get filteredMenuItems(): MenuItem[] {
    const hideSet = new Set([...
      this.hiddenIdsDefault,
      ...this.hiddenIds
    ]);
    return this.menuItems.filter(item => !hideSet.has(item.id));
  }
}
