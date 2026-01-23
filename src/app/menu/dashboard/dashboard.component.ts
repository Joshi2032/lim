import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../shared/sidebar/sidebar.component';

export interface Product {
	id: string;
	name: string;
	quantity: number;
	rank: number;
}

export interface Order {
	id: string;
	tableNumber: number;
	customerName: string;
	itemsCount: number;
	total: number;
	status: 'preparando' | 'pendiente' | 'listo';
	statusLabel: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, SidebarComponent, CurrencyPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  cartCount: number = 0;
  topProducts: Product[] = [];
  recentOrders: Order[] = [];

  currentUser: User = {
    name: 'Josue',
    role: 'Dueña',
    initials: 'J'
  };

  sidebarItems: SidebarMenuItem[] = [
    { id: 'menu', label: 'Menú', icon: '🍜', route: '/menu' },
    { id: 'mesas', label: 'Mesas', icon: '🪑', route: '/mesas' },
    { id: 'cocina', label: 'Cocina', icon: '🍳', route: '/cocina' },
    { id: 'clientes', label: 'Clientes', icon: '👥', route: '/clientes' },
    { id: 'entregas', label: 'Entregas', icon: '🚚', route: '/entregas' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/dashboard', active: true },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', route: '/usuarios' }
  ];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // Mock data - En producción vendrá del backend
    this.topProducts = [
      { id: '1', name: 'Dragon Roll', quantity: 34, rank: 1 },
      { id: '2', name: 'Bento Box Deluxe', quantity: 28, rank: 2 },
      { id: '3', name: 'Sake Frío Premium', quantity: 25, rank: 3 },
      { id: '4', name: 'Sashimi Mixto', quantity: 22, rank: 4 },
      { id: '5', name: 'Philadelphia Roll', quantity: 19, rank: 5 }
    ];

    this.recentOrders = [
      {
        id: '1',
        tableNumber: 2,
        customerName: 'Carlos',
        itemsCount: 2,
        total: 527,
        status: 'preparando',
        statusLabel: 'Preparando'
      },
      {
        id: '2',
        tableNumber: 5,
        customerName: 'María',
        itemsCount: 3,
        total: 1471,
        status: 'pendiente',
        statusLabel: 'Pendiente'
      }
    ];
  }
}
