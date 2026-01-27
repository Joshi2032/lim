import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../shared/sidebar/sidebar.component';
import { StatVariant } from '../shared/stat-card/stat-card.component';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { MovementsComponent } from './movements/movements.component';
import { ProductsManagementComponent } from './products-management/products-management.component';
import { IncomeReportComponent } from './income-report/income-report.component';

type TabId = 'resumen' | 'movimientos' | 'usuarios' | 'productos' | 'ingresos';

interface TabItem {
  id: TabId;
  label: string;
  icon: string;
}

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

export interface ChartData {
  day: string;
  value: number;
  label: string;
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
  selector: 'app-owner',
  standalone: true,
  imports: [CommonModule, SidebarComponent, DashboardComponent, UsersComponent, MovementsComponent, PageHeaderComponent, ProductsManagementComponent, IncomeReportComponent],
  templateUrl: './owner.component.html',
  styleUrl: './owner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwnerComponent implements OnInit {
  readonly cartCount = 0;
  activeTab: TabId = 'resumen';

  readonly tabs: TabItem[] = [
    { id: 'resumen', label: 'Resumen', icon: '📊' },
    { id: 'movimientos', label: 'Movimientos', icon: '🔄' },
    { id: 'usuarios', label: 'Usuarios', icon: '👥' },
    { id: 'productos', label: 'Productos', icon: '🍽️' },
    { id: 'ingresos', label: 'Ingresos', icon: '💰' }
  ];

  readonly currentUser: User = {
    name: 'Josue',
    role: 'Dueña',
    initials: 'J'
  };

  readonly sidebarItems: SidebarMenuItem[] = [
    { id: 'menu', label: 'Menú', icon: '🍜', route: '/menu' },
    { id: 'mesas', label: 'Mesas', icon: '🪑', route: '/mesas' },
    { id: 'cocina', label: 'Cocina', icon: '🍳', route: '/cocina' },
    { id: 'clientes', label: 'Clientes', icon: '👥', route: '/clientes' },
    { id: 'entregas', label: 'Entregas', icon: '🚚', route: '/entregas' },
    { id: 'pedidos', label: 'Pedidos', icon: '🧾', route: '/pedidos' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { id: 'panel', label: 'Panel de Control', icon: '📈', route: '/panel-control', active: true },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', route: '/usuarios' }
  ];

  statCards: StatCardData[] = [];
  topProducts: Product[] = [];
  recentOrders: Order[] = [];
  chartData: ChartData[] = [];
  tooltipVisible = false;
  tooltipX = 0;
  tooltipY = 0;
  tooltipValue = '';
  tooltipDay = '';

  ngOnInit() {
    this.loadData();
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId as TabId;
  }

  loadData() {
    this.chartData = [
      { day: 'Lun', value: 18000, label: 'Lunes' },
      { day: 'Mar', value: 25000, label: 'Martes' },
      { day: 'Mié', value: 32000, label: 'Miércoles' },
      { day: 'Jue', value: 38000, label: 'Jueves' },
      { day: 'Vie', value: 52000, label: 'Viernes' },
      { day: 'Sáb', value: 45000, label: 'Sábado' },
      { day: 'Dom', value: 41000, label: 'Domingo' }
    ];

    this.statCards = [
      {
        title: 'Ingresos del Día',
        value: '$0',
        subtitle: '',
        trendLabel: '',
        trendDirection: '',
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        variant: 'red'
      },
      {
        title: 'Órdenes Hoy',
        value: 0,
        subtitle: '0 activas',
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="5" width="16" height="14" rx="2.5" ry="2.5" stroke="currentColor" stroke-width="2"/><path d="M7 9H17M7 13H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        trendLabel: '',
        trendDirection: '',
        variant: 'amber'
      },
      {
        title: 'Ticket Promedio',
        value: '$0',
        subtitle: '',
        trendLabel: '',
        trendDirection: '',
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 10L12 14L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/></svg>`,
        variant: 'green'
      },
      {
        title: 'En Cocina',
        value: 0,
        subtitle: 'órdenes activas',
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 4.5C6 3.67157 6.67157 3 7.5 3H16.5C17.3284 3 18 3.67157 18 4.5V7H6V4.5Z" fill="currentColor" opacity="0.15"/><rect x="5" y="7" width="14" height="11" rx="2" stroke="currentColor" stroke-width="2"/><path d="M9 11H15M9 14H12.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        trendLabel: '',
        trendDirection: '',
        variant: 'blue'
      },
      {
        title: 'Pagos procesados',
        value: 0,
        subtitle: '',
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" stroke-width="2"/><path d="M3 10H21" stroke="currentColor" stroke-width="2"/></svg>`,
        trendLabel: '',
        trendDirection: '',
        variant: 'purple'
      },
      {
        title: 'Entregas en curso',
        value: 0,
        subtitle: '',
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 17C9 18.1046 8.10457 19 7 19C5.89543 19 5 18.1046 5 17C5 15.8954 5.89543 15 7 15C8.10457 15 9 15.8954 9 17Z" stroke="currentColor" stroke-width="2"/><path d="M19 17C19 18.1046 18.1046 19 17 19C15.8954 19 15 18.1046 15 17C15 15.8954 15.8954 15 17 15C18.1046 15 19 15.8954 19 17Z" stroke="currentColor" stroke-width="2"/><path d="M5 17H1V6C1 5.44772 1.44772 5 2 5H14V17M9 17H15M19 17H23V12.5L20 8H14V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        trendLabel: '',
        trendDirection: '',
        variant: 'purple'
      },
      {
        title: 'Total cobrado',
        value: '$0',
        subtitle: '',
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3V21M7 7H16C17.1046 7 18 7.89543 18 9C18 10.1046 17.1046 11 16 11H9C7.89543 11 7 11.8954 7 13C7 14.1046 7.89543 15 9 15H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        trendLabel: '',
        trendDirection: '',
        variant: 'amber'
      }
    ];

    this.topProducts = [
      { id: '1', name: 'Dragon Roll', quantity: 34, rank: 1 },
      { id: '2', name: 'Bento Box Deluxe', quantity: 28, rank: 2 },
      { id: '3', name: 'Sake Frío Premium', quantity: 25, rank: 3 },
      { id: '4', name: 'Sashimi Mixto', quantity: 22, rank: 4 },
      { id: '5', name: 'Philadelphia Roll', quantity: 19, rank: 5 }
    ];

    this.recentOrders = [];
  }

  onChartHover(event: MouseEvent, day: string, value: number) {
    const svg = event.currentTarget as SVGElement;
    const containerRect = svg.parentElement?.getBoundingClientRect();

    const x = event.clientX - (containerRect?.left || 0);
    const y = event.clientY - (containerRect?.top || 0);

    const minX = 50;
    const maxX = 530;
    const constrainedX = Math.max(minX, Math.min(maxX, x));

    this.tooltipX = constrainedX;
    this.tooltipY = y - 50;
    this.tooltipValue = '$' + value.toLocaleString();
    this.tooltipDay = day;
    this.tooltipVisible = true;
  }

  onChartMove(event: MouseEvent) {
    const svg = event.currentTarget as SVGElement;
    const containerRect = svg.parentElement?.getBoundingClientRect();

    const x = event.clientX - (containerRect?.left || 0);
    const y = event.clientY - (containerRect?.top || 0);

    const minX = 50;
    const maxX = 530;
    const constrainedX = Math.max(minX, Math.min(maxX, x));

    const dayZones = [
      { range: [50, 100], day: 'Lun', value: 18000, pointX: 70 },
      { range: [100, 160], day: 'Mar', value: 25000, pointX: 130 },
      { range: [160, 220], day: 'Mié', value: 32000, pointX: 190 },
      { range: [220, 280], day: 'Jue', value: 38000, pointX: 250 },
      { range: [280, 340], day: 'Vie', value: 52000, pointX: 310 },
      { range: [340, 400], day: 'Sáb', value: 45000, pointX: 370 },
      { range: [400, 460], day: 'Dom', value: 41000, pointX: 430 }
    ];

    const zone = dayZones.find(z => x >= z.range[0] && x < z.range[1]);

    if (zone) {
      this.tooltipX = zone.pointX;
      this.tooltipY = y - 50;
      this.tooltipValue = '$' + zone.value.toLocaleString();
      this.tooltipDay = zone.day;
      this.tooltipVisible = true;
    }
  }

  onChartLeave() {
    this.tooltipVisible = false;
  }
}
