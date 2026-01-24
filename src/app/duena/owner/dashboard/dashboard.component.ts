import { Component, OnInit, Input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../../shared/sidebar/sidebar.component';
import { StatCardComponent, StatVariant } from '../../../shared/stat-card/stat-card.component';

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
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, CurrencyPipe, StatCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  @Input() embedded: boolean = false;
  cartCount: number = 0;
  statCards: StatCardData[] = [];
  // Derived groups for layout rows
  get primaryStats(): StatCardData[] { return this.statCards.slice(0, 4); }
  get secondaryStats(): StatCardData[] { return this.statCards.slice(4); }
  topProducts: Product[] = [];
  recentOrders: Order[] = [];
  chartData: ChartData[] = [];
  tooltipVisible = false;
  tooltipX = 0;
  tooltipY = 0;
  tooltipValue = '';
  tooltipDay = '';
  chartContainerRef: any;
  activeTab: 'resumen' | 'movimientos' | 'usuarios' = 'resumen';

  tabs: Array<{id: 'resumen' | 'movimientos' | 'usuarios', label: string, icon: string}> = [
    { id: 'resumen', label: 'Resumen', icon: '📊' },
    { id: 'movimientos', label: 'Movimientos', icon: '🔄' },
    { id: 'usuarios', label: 'Usuarios', icon: '👥' }
  ];

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
    { id: 'panel', label: 'Panel de Control', icon: '📈', route: '/panel-control' },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', route: '/usuarios' }
  ];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.chartData = [
      { day: 'Lun', value: 1000, label: 'Lunes' },
      { day: 'Mar', value: 1500, label: 'Martes' },
      { day: 'Mié', value: 5000, label: 'Miércoles' },
      { day: 'Jue', value: 32000, label: 'Jueves' },
      { day: 'Vie', value: 45000, label: 'Viernes' },
      { day: 'Sáb', value: 50000, label: 'Sábado' },
      { day: 'Dom', value: 35000, label: 'Domingo' }
    ];

    this.statCards = [
      {
        title: 'Ingresos del Día',
        value: '$0',
        subtitle: '',
        trendLabel: '',
        trendDirection: '',
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 7.5C4 6.11929 5.11929 5 6.5 5H17.5C18.8807 5 20 6.11929 20 7.5V8.5C20 9.88071 18.8807 11 17.5 11H6.5C5.11929 11 4 9.88071 4 8.5V7.5Z" fill="currentColor" opacity="0.15"/><path d="M5 12.5C5 11.6716 5.67157 11 6.5 11H17.5C18.3284 11 19 11.6716 19 12.5V13.5C19 14.3284 18.3284 15 17.5 15H6.5C5.67157 15 5 14.3284 5 13.5V12.5Z" fill="currentColor" opacity="0.15"/><path d="M12 3V21M7 7H16C17.1046 7 18 7.89543 18 9C18 10.1046 17.1046 11 16 11H9C7.89543 11 7 11.8954 7 13C7 14.1046 7.89543 15 9 15H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        variant: 'red'
      },
      {
        title: 'Órdenes Hoy',
        value: 0,
        subtitle: '0 activas',
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="5" width="16" height="14" rx="2.5" ry="2.5" stroke="currentColor" stroke-width="2"/><path d="M7 9H17M7 13H13M17 13L15 11M17 13L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
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
        variant: 'blue'
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
        variant: 'default'
      },
      {
        title: 'Entregas en curso',
        value: 0,
        subtitle: '',
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 17C9 18.1046 8.10457 19 7 19C5.89543 19 5 18.1046 5 17C5 15.8954 5.89543 15 7 15C8.10457 15 9 15.8954 9 17Z" stroke="currentColor" stroke-width="2"/><path d="M19 17C19 18.1046 18.1046 19 17 19C15.8954 19 15 18.1046 15 17C15 15.8954 15.8954 15 17 15C18.1046 15 19 15.8954 19 17Z" stroke="currentColor" stroke-width="2"/><path d="M5 17H1V6C1 5.44772 1.44772 5 2 5H14V17M9 17H15M19 17H23V12.5L20 8H14V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        trendLabel: '',
        trendDirection: '',
        variant: 'default'
      },
      {
        title: 'Total cobrado',
        value: '$0',
        subtitle: '',
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        trendLabel: '',
        trendDirection: '',
        variant: 'default'
      }
    ];

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
		const containerRect = svg.getBoundingClientRect();

		const x = event.clientX - containerRect.left;

		const dayZones = [
      { range: [40, 145], day: 'Lun', value: 1000, pointX: 100, label: 'Lunes' },
      { range: [145, 250], day: 'Mar', value: 1500, pointX: 252, label: 'Martes' },
      { range: [250, 355], day: 'Mié', value: 5000, pointX: 405, label: 'Miércoles' },
      { range: [355, 460], day: 'Jue', value: 32000, pointX: 558, label: 'Jueves' },
      { range: [460, 565], day: 'Vie', value: 45000, pointX: 711, label: 'Viernes' },
      { range: [565, 670], day: 'Sáb', value: 50000, pointX: 864, label: 'Sábado' },
      { range: [670, 900], day: 'Dom', value: 35000, pointX: 1017, label: 'Domingo' }
		];

		const zone = dayZones.find(z => x >= z.range[0] && x < z.range[1]);

		if (zone) {
			this.tooltipX = zone.pointX;
			this.tooltipY = 180;
			this.tooltipValue = '$' + zone.value.toLocaleString('es-MX');
			this.tooltipDay = zone.label;
			this.tooltipVisible = true;
		}
	}

  onChartLeave() {
    this.tooltipVisible = false;
  }

  getPointY(day: string): number {
    const dayMap: { [key: string]: number } = {
    'Lunes': 295,
    'Martes': 291,
    'Miércoles': 266,
    'Jueves': 153,
    'Viernes': 105,
    'Sábado': 83,
    'Domingo': 133
    };
    return dayMap[day] || 283;
  }

  setActiveTab(tabId: 'resumen' | 'movimientos' | 'usuarios') {
    this.activeTab = tabId;
  }
}
