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
      iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 7.5C4 6.11929 5.11929 5 6.5 5H17.5C18.8807 5 20 6.11929 20 7.5V8.5C20 9.88071 18.8807 11 17.5 11H6.5C5.11929 11 4 9.88071 4 8.5V7.5Z" fill="currentColor" opacity="0.15"/><path d="M5 12.5C5 11.6716 5.67157 11 6.5 11H17.5C18.3284 11 19 11.6716 19 12.5V13.5C19 14.3284 18.3284 15 17.5 15H6.5C5.67157 15 5 14.3284 5 13.5V12.5Z" fill="currentColor" opacity="0.15"/><path d="M12 3V21M7 7H16C17.1046 7 18 7.89543 18 9C18 10.1046 17.1046 11 16 11H9C7.89543 11 7 11.8954 7 13C7 14.1046 7.89543 15 9 15H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      variant: 'red'
    },
    {
      title: 'Órdenes Hoy',
      value: 47,
      subtitle: '2 activas',
      iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="5" width="16" height="14" rx="2.5" ry="2.5" stroke="currentColor" stroke-width="2"/><path d="M7 9H17M7 13H13M17 13L15 11M17 13L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      trendLabel: '',
      trendDirection: '',
      variant: 'amber'
    },
    {
      title: 'Ticket Promedio',
      value: '$605',
      trendLabel: '15% vs ayer',
      trendDirection: 'up',
      iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" stroke-width="2"/><path d="M9 8H15M9 12H15M9 16H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      variant: 'blue'
    },
    {
      title: 'En Cocina',
      value: 2,
      subtitle: 'órdenes activas',
      iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 4.5C6 3.67157 6.67157 3 7.5 3H16.5C17.3284 3 18 3.67157 18 4.5V7H6V4.5Z" fill="currentColor" opacity="0.15"/><rect x="5" y="7" width="14" height="11" rx="2" stroke="currentColor" stroke-width="2"/><path d="M9 11H15M9 14H12.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
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
