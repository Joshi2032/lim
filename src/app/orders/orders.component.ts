import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../shared/sidebar/sidebar.component';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';
import { CustomersComponent } from './customers/customers.component';
import { DeliveryComponent } from './delivery/delivery.component';
import { AssignmentsComponent } from './assignments/assignments.component';

type TabId = 'clientes' | 'entregas' | 'asignaciones';

interface TabItem {
  id: TabId;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, SidebarComponent, PageHeaderComponent, CustomersComponent, DeliveryComponent, AssignmentsComponent],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersComponent {
  activeTab: TabId = 'clientes';

  readonly tabs: TabItem[] = [
    { id: 'clientes', label: 'Clientes', icon: '👥' },
    { id: 'entregas', label: 'Entregas', icon: '🚚' },
    { id: 'asignaciones', label: 'Asignaciones', icon: '📋' }
  ];

  readonly currentUser: User = {
    name: 'Josue',
    role: 'Dueña',
    initials: 'J'
  };

  readonly cartCount = 0;

  readonly sidebarItems: SidebarMenuItem[] = [
    { id: 'menu', label: 'Menú', icon: '🍜', route: '/menu' },
    { id: 'mesas', label: 'Mesas', icon: '🪑', route: '/mesas' },
    { id: 'cocina', label: 'Cocina', icon: '🍳', route: '/cocina' },
    { id: 'clientes', label: 'Clientes', icon: '👥', route: '/clientes' },
    { id: 'entregas', label: 'Entregas', icon: '🚚', route: '/entregas' },
    { id: 'pedidos', label: 'Pedidos', icon: '🧾', route: '/pedidos', active: true },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { id: 'panel', label: 'Panel de Control', icon: '📈', route: '/panel-control' },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', route: '/usuarios' }
  ];

  setActiveTab(tabId: string): void {
    this.activeTab = tabId as TabId;
  }
}
