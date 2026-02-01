import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, MenuItem, User } from '../shared/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  template: `
    <div class="app-layout">
      <app-sidebar
        [menuItems]="sidebarItems"
        [currentUser]="currentUser"
        [cartCount]="cartCount">
      </app-sidebar>

      <div class="app-content">
        <router-outlet />
      </div>
    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class MainLayoutComponent {
  cartCount: number = 0;

  currentUser: User = {
    name: 'Josue',
    role: 'Dueña',
    initials: 'J'
  };

  sidebarItems: MenuItem[] = [
    { id: 'menu', label: 'Menú', icon: '🍜', route: '/menu' },
    { id: 'mesas', label: 'Mesas', icon: '🪑', route: '/mesas' },
    { id: 'cocina', label: 'Cocina', icon: '🍳', route: '/cocina' },
    { id: 'recogida', label: 'Recogida', icon: '🛍️', route: '/recogida' },
    { id: 'pedidos', label: 'Pedidos', icon: '🧾', route: '/pedidos' },
    { id: 'panel', label: 'Panel de Control', icon: '📈', route: '/panel-control' }
  ];
}
