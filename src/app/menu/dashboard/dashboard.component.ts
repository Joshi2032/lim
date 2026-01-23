import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../shared/sidebar/sidebar.component';
import { StatCardComponent, StatVariant } from '../../shared/stat-card/stat-card.component';

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

interface StatCardData {
  title: string;
  value: string | number;
  subtitle?: string;
  trendLabel?: string;
  trendDirection?: 'up' | 'down' | '';
  iconSvg: string;
  variant: StatVariant;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, SidebarComponent, CurrencyPipe, StatCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  cartCount: number = 0;
  statCards: StatCardData[] = [];
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
  this.statCards = [
    {
      title: 'Ingresos del Día',
      value: '$28,450',
      trendLabel: '12% vs ayer',
      trendDirection: 'up',
      iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 1V23M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      variant: 'red'
    },
    {
      title: 'Órdenes Hoy',
      value: 47,
      subtitle: '2 activas',
      iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 11L12 14L22 4M11 20H7C5.89543 20 5 19.1046 5 18V4C5 2.89543 5.89543 2 7 2H17C18.1046 2 19 2.89543 19 4V12.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      trendLabel: '',
      trendDirection: '',
      variant: 'amber'
    },
    {
      title: 'Ticket Promedio',
      value: '$605',
      trendLabel: '15% vs ayer',
      trendDirection: 'up',
      iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9H18M6 13H18M6 5H18C19.1046 5 20 5.89543 20 7V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V7C4 5.89543 4.89543 5 6 5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      variant: 'blue'
    },
    {
      title: 'En Cocina',
      value: 2,
      subtitle: 'órdenes activas',
      iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 5V9C18 12.866 14.866 16 11 16C7.13401 16 4 12.866 4 9V5M6 2H16C17.1046 2 18 2.89543 18 4V5H4V4C4 2.89543 4.89543 2 6 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      trendLabel: '',
      trendDirection: '',
      variant: 'green'
    }
  ];

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
