import { Component, OnInit, Input, TemplateRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../shared/sidebar/sidebar.component';
import { StatCardComponent, StatVariant } from '../../shared/stat-card/stat-card.component';
import { SectionHeaderComponent } from '../../shared/section-header/section-header.component';
import { DataTableComponent, DataTableColumn } from '../../shared/data-table/data-table.component';
import { InfoCardsComponent, InfoCard } from '../../shared/info-cards/info-cards.component';
import { TopProductsChartComponent, TopProduct } from '../../shared/top-products-chart/top-products-chart.component';
import { Order as SupabaseOrder, SupabaseService } from '../../core/services/supabase.service';
import * as OrdersActions from '../../store/orders/orders.actions';
import { selectTodayOrders, selectOrdersStats, selectOrdersByStatus, selectOrdersByType } from '../../store/orders/orders.selectors';

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
  imports: [CommonModule, SidebarComponent, StatCardComponent, SectionHeaderComponent, DataTableComponent, InfoCardsComponent, TopProductsChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  @Input() embedded: boolean = false;
  cartCount: number = 0;
  deliveryCount: number = 0;
  statCards: StatCardData[] = [];

  // Observables del store
  todayOrders$: Observable<SupabaseOrder[]>;
  ordersStats$: Observable<any>;
  activeOrders$: Observable<SupabaseOrder[]>;
  kitchenOrders$: Observable<SupabaseOrder[]>;
  deliveryOrders$: Observable<SupabaseOrder[]>;
  // Derived groups for layout rows
  get primaryStats(): StatCardData[] { return this.statCards.slice(0, 4); }
  get secondaryStats(): StatCardData[] { return this.statCards.slice(4); }
  topProducts: Product[] = [];
  recentOrders: Order[] = [];
  chartData: ChartData[] = [];
  chartPoints: Array<{ x: number; y: number; day: string; label: string; value: number }> = [];
  linePath = '';
  areaPath = '';
  yTicks: Array<{ value: number; y: number }> = [];
  chartMaxValue = 0;

// Para tabla de órdenes
  orderColumns: DataTableColumn[] = [];

  // Para productos más vendidos con gráfico visual
  topProductsData: TopProduct[] = [];

  // Para tarjetas de información
  statusCards: InfoCard[] = [];

  private readonly chartXStart = 100;
  private readonly chartXEnd = 1017;
  private readonly chartYBase = 300;
  private readonly chartYTop = 50;
  tooltipVisible = false;
  tooltipX = 0; // HTML position (px)
  tooltipY = 0; // HTML position (px)
  tooltipSvgX = 0; // SVG coord (user units)
  tooltipPointY = 0; // SVG coord (user units)
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
    { id: 'recogida', label: 'Recogida', icon: '🛍️', route: '/recogida' },
    { id: 'clientes', label: 'Clientes', icon: '👥', route: '/clientes' },
    { id: 'entregas', label: 'Entregas', icon: '🚚', route: '/entregas' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/dashboard', active: true },
    { id: 'panel', label: 'Panel de Control', icon: '📈', route: '/panel-control' },
    { id: 'ingresos', label: 'Reportes de Ingresos', icon: '💰', route: '/ingresos' },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', route: '/usuarios' }
  ];

  constructor(
    private store: Store,
    private cdr: ChangeDetectorRef,
    private supabase: SupabaseService
  ) {
    // Inicializar observables del store
    this.todayOrders$ = this.store.select(selectTodayOrders);
    this.ordersStats$ = this.store.select(selectOrdersStats);
    this.activeOrders$ = this.store.select(selectOrdersByStatus('pending'));
    this.kitchenOrders$ = this.store.select(selectOrdersByStatus('preparing'));
    this.deliveryOrders$ = this.store.select(selectOrdersByType('delivery'));
  }

  ngOnInit() {
    this.initializeTableColumns();

    // Dispatch para cargar órdenes
    this.store.dispatch(OrdersActions.loadOrders());

    // Suscribirse a estadísticas para actualizar UI
    this.subscriptions.add(
      this.ordersStats$.subscribe(stats => {
        if (stats) {
          this.updateStatCardsFromStats(stats);
          this.cdr.markForCheck();
        }
      })
    );

    // Suscribirse a órdenes de hoy para la tabla
    this.subscriptions.add(
      this.todayOrders$.subscribe(orders => {
        this.loadRecentOrders(orders);
        this.loadTopProducts(orders);
        this.cdr.markForCheck();
      })
    );

    // Suscribirse a entregas en tiempo real
    this.subscriptions.add(
      this.deliveryOrders$.subscribe(orders => {
        this.deliveryCount = orders.length;
        this.cdr.markForCheck();
      })
    );

    // Suscribirse a cambios en tiempo real
    this.store.dispatch(OrdersActions.subscribeToOrders());
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  updateStatCardsFromStats(stats: any) {
    const { total, pending, preparing, ready, completed, cancelled, revenue, avgTicket } = stats;

    // Contar órdenes activas (no completadas ni canceladas)
    // 'preparing' ya incluye pending + preparing en el selector
    const activeCount = preparing + ready;

    // deliveryCount ya se actualiza desde la suscripción en ngOnInit
    this.updateStatCards(revenue, total, avgTicket, preparing, activeCount, this.deliveryCount);
  }

  updateStatCards(revenue: number, ordersCount: number, avgTicket: number, kitchenCount: number, activeCount: number, deliveryCount: number) {
    this.statCards = [
      {
        title: 'Ingresos del Día',
        value: '$' + revenue.toFixed(2),
        subtitle: '',
        trendLabel: '',
        trendDirection: '',
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 7.5C4 6.11929 5.11929 5 6.5 5H17.5C18.8807 5 20 6.11929 20 7.5V8.5C20 9.88071 18.8807 11 17.5 11H6.5C5.11929 11 4 9.88071 4 8.5V7.5Z" fill="currentColor" opacity="0.15"/><path d="M5 12.5C5 11.6716 5.67157 11 6.5 11H17.5C18.3284 11 19 11.6716 19 12.5V13.5C19 14.3284 18.3284 15 17.5 15H6.5C5.67157 15 5 14.3284 5 13.5V12.5Z" fill="currentColor" opacity="0.15"/><path d="M12 3V21M7 7H16C17.1046 7 18 7.89543 18 9C18 10.1046 17.1046 11 16 11H9C7.89543 11 7 11.8954 7 13C7 14.1046 7.89543 15 9 15H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        variant: 'red'
      },
      {
        title: 'Órdenes Hoy',
        value: ordersCount,
        subtitle: activeCount + ' activas',
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="5" width="16" height="14" rx="2.5" ry="2.5" stroke="currentColor" stroke-width="2"/><path d="M7 9H17M7 13H13M17 13L15 11M17 13L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        trendLabel: '',
        trendDirection: '',
        variant: 'amber'
      },
      {
        title: 'Ticket Promedio',
        value: '$' + avgTicket.toFixed(2),
        subtitle: '',
        trendLabel: '',
        trendDirection: '',
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 10L12 14L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/></svg>`,
        variant: 'blue'
      },
      {
        title: 'En Cocina',
        value: kitchenCount,
        subtitle: 'órdenes activas',
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 4.5C6 3.67157 6.67157 3 7.5 3H16.5C17.3284 3 18 3.67157 18 4.5V7H6V4.5Z" fill="currentColor" opacity="0.15"/><rect x="5" y="7" width="14" height="11" rx="2" stroke="currentColor" stroke-width="2"/><path d="M9 11H15M9 14H12.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        trendLabel: '',
        trendDirection: '',
        variant: 'blue'
      },
      {
        title: 'Pagos procesados',
        value: ordersCount,
        subtitle: '',
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" stroke-width="2"/><path d="M3 10H21" stroke="currentColor" stroke-width="2"/></svg>`,
        trendLabel: '',
        trendDirection: '',
        variant: 'default'
      },
      {
        title: 'Entregas en curso',
        value: deliveryCount,
        subtitle: '',
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 17C9 18.1046 8.10457 19 7 19C5.89543 19 5 18.1046 5 17C5 15.8954 5.89543 15 7 15C8.10457 15 9 15.8954 9 17Z" stroke="currentColor" stroke-width="2"/><path d="M19 17C19 18.1046 18.1046 19 17 19C15.8954 19 15 18.1046 15 17C15 15.8954 15.8954 15 17 15C18.1046 15 19 15.8954 19 17Z" stroke="currentColor" stroke-width="2"/><path d="M5 17H1V6C1 5.44772 1.44772 5 2 5H14V17M9 17H15M19 17H23V12.5L20 8H14V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        trendLabel: '',
        trendDirection: '',
        variant: 'default'
      },
      {
        title: 'Total cobrado',
        value: '$' + revenue.toFixed(2),
        subtitle: '',
        iconSvg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        trendLabel: '',
        trendDirection: '',
        variant: 'default'
      }
    ];

    // Mock chart data
    this.chartData = [
      { day: 'Lun', value: 1000, label: 'Lunes' },
      { day: 'Mar', value: 1500, label: 'Martes' },
      { day: 'Mié', value: 5000, label: 'Miércoles' },
      { day: 'Jue', value: 32000, label: 'Jueves' },
      { day: 'Vie', value: 45000, label: 'Viernes' },
      { day: 'Sáb', value: 50000, label: 'Sábado' },
      { day: 'Dom', value: 35000, label: 'Domingo' }
    ];
    this.updateChartGeometry();
  }

  loadRecentOrders(orders: SupabaseOrder[]) {
    const statusMap: { [key: string]: 'preparando' | 'pendiente' | 'listo' } = {
      'pending': 'pendiente',
      'preparing': 'preparando',
      'ready': 'listo',
      'completed': 'listo',
      'cancelled': 'pendiente'
    };

    const statusLabelMap: { [key: string]: string } = {
      'pending': 'Pendiente',
      'preparing': 'Preparando',
      'ready': 'Listo',
      'completed': 'Completado',
      'cancelled': 'Cancelado'
    };

    this.recentOrders = orders
      .filter(o => o.status !== 'completed' && o.status !== 'cancelled')
      .slice(0, 10)
      .map(o => ({
        id: o.id,
        tableNumber: o.table_number || 0,
        customerName: o.customer_name,
        itemsCount: 0,
        total: o.total_price,
        status: statusMap[o.status] || 'pendiente',
        statusLabel: statusLabelMap[o.status] || 'Pendiente'
      }));
  }

  async loadTopProducts(orders: SupabaseOrder[]) {
    const topAllTime = await this.supabase.getTopProductsAllTime(5);

    this.topProducts = topAllTime.map((p, index) => ({
      id: p.id,
      name: p.name,
      quantity: p.quantity,
      rank: index + 1
    }));

    this.topProductsData = this.topProducts.map(p => ({
      id: p.id,
      rank: p.rank,
      name: p.name,
      quantity: p.quantity
    }));

    const kitchenActiveCount = this.recentOrders.filter(o => o.status === 'preparando' || o.status === 'pendiente').length;

    // Actualizar status cards
    this.statusCards = [
      {
        id: 'orders-today',
        title: 'Órdenes Hoy',
        value: this.recentOrders.length,
        description: 'Órdenes activas',
        icon: '📋',
        color: 'blue',
        badge: '+' + this.recentOrders.length
      },
      {
        id: 'kitchen-active',
        title: 'En Cocina',
        value: kitchenActiveCount,
        description: 'Órdenes activas',
        icon: '🍳',
        color: 'amber'
      },
      {
        id: 'top-product',
        title: 'Top Producto',
        value: this.topProducts[0]?.name || 'N/A',
        description: this.topProducts[0] ? this.topProducts[0].quantity + ' unidades' : '0 unidades',
        icon: '⭐',
        color: 'green'
      },
      {
        id: 'revenue-today',
        title: 'Ingresos Hoy',
        value: '$' + this.recentOrders.reduce((sum, o) => sum + o.total, 0).toLocaleString(),
        description: this.recentOrders.length + ' transacciones',
        icon: '💰',
        color: 'red'
      }
    ];

    this.cdr.markForCheck();
  }

  private initializeTableColumns() {
    this.orderColumns = [
      { key: 'tableNumber', header: 'Mesa', width: '80px', align: 'center' },
      { key: 'customerName', header: 'Cliente', align: 'left' },
      { key: 'itemsCount', header: 'Artículos', width: '100px', align: 'center' },
      { key: 'total', header: 'Total', width: '100px', align: 'right' },
      { key: 'statusLabel', header: 'Estado', width: '120px', align: 'center' }
    ];
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

    this.updateChartGeometry();

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

    // Mapear productos para el gráfico visual
    this.topProductsData = this.topProducts.map(p => ({
      id: p.id,
      rank: p.rank,
      name: p.name,
      quantity: p.quantity
    }));

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

    // Inicializar tarjetas de estado
    this.statusCards = [
      {
        id: 'orders-today',
        title: 'Órdenes Hoy',
        value: this.recentOrders.length,
        description: 'Órdenes activas',
        icon: '📋',
        color: 'blue',
        badge: '+2'
      },
      {
        id: 'kitchen-active',
        title: 'En Cocina',
        value: this.recentOrders.filter(o => o.status === 'preparando').length,
        description: 'Preparando',
        icon: '🍳',
        color: 'amber'
      },
      {
        id: 'top-product',
        title: 'Top Producto',
        value: this.topProducts[0]?.name || 'N/A',
        description: this.topProducts[0]?.quantity + ' unidades',
        icon: '⭐',
        color: 'green'
      },
      {
        id: 'revenue-today',
        title: 'Ingresos Hoy',
        value: '$' + this.recentOrders.reduce((sum, o) => sum + o.total, 0).toLocaleString(),
        description: this.recentOrders.length + ' transacciones',
        icon: '💰',
        color: 'red'
      }
    ];
  }

  onChartHover(event: MouseEvent, day: string, value: number) {
    const svg = event.currentTarget as SVGSVGElement;
    const containerRect = svg.parentElement?.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;
    const scaleX = containerRect ? containerRect.width / viewBox.width : 1;
    const scaleY = containerRect ? containerRect.height / viewBox.height : 1;

    const xClient = event.clientX - (containerRect?.left || 0);
    const yClient = event.clientY - (containerRect?.top || 0);

    const minX = this.chartXStart * scaleX;
    const maxX = this.chartXEnd * scaleX;
    const constrainedX = Math.max(minX, Math.min(maxX, xClient));

    const point = this.chartPoints.find(p => p.label === day);

    this.tooltipSvgX = point?.x ?? constrainedX / scaleX;
    this.tooltipPointY = point?.y ?? yClient / scaleY;
    this.tooltipX = (point?.x ?? constrainedX / scaleX) * scaleX;
    this.tooltipY = (point?.y ?? yClient / scaleY) * scaleY - 40;
    this.tooltipValue = '$' + value.toLocaleString();
    this.tooltipDay = day;
    this.tooltipVisible = true;
  }

  onChartMove(event: MouseEvent) {
		const svg = event.currentTarget as SVGSVGElement;
		const containerRect = svg.getBoundingClientRect();
		const viewBox = svg.viewBox.baseVal;
		const scaleX = containerRect.width / viewBox.width;
		const scaleY = containerRect.height / viewBox.height;

		const x = ((event.clientX - containerRect.left) / containerRect.width) * viewBox.width;

    const zones = this.buildDynamicZones();

    const zone = zones.find(z => x >= z.start && x < z.end);

		if (zone) {
      this.tooltipSvgX = zone.point.x;
      this.tooltipPointY = zone.point.y;
      this.tooltipX = zone.point.x * scaleX;
      this.tooltipY = zone.point.y * scaleY - 40;
      this.tooltipValue = '$' + zone.point.value.toLocaleString('es-MX');
      this.tooltipDay = zone.point.label;
			this.tooltipVisible = true;
    } else {
      this.tooltipVisible = false;
		}
	}

  onChartLeave() {
    this.tooltipVisible = false;
  }

  setActiveTab(tabId: 'resumen' | 'movimientos' | 'usuarios') {
    this.activeTab = tabId;
  }

  private updateChartGeometry() {
    if (!this.chartData.length) {
      this.chartPoints = [];
      this.linePath = '';
      this.areaPath = '';
      return;
    }

    const step = this.chartData.length > 1
      ? (this.chartXEnd - this.chartXStart) / (this.chartData.length - 1)
      : 0;

    const maxValue = Math.max(...this.chartData.map(d => d.value), 1);
    this.chartMaxValue = maxValue;
    const yRange = this.chartYBase - this.chartYTop;
    this.chartPoints = this.chartData.map((d, i) => {
      const x = this.chartXStart + i * step;
      const y = this.chartYBase - (d.value / maxValue) * yRange;
      return { x, y, day: d.day, label: d.label, value: d.value };
    });

    if (this.chartPoints.length === 1) {
      const p = this.chartPoints[0];
      this.linePath = `M ${p.x} ${p.y}`;
      this.areaPath = `M ${p.x} ${p.y} L ${p.x} ${this.chartYBase} Z`;
    } else {
      const lineSegments = this.chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
      this.linePath = lineSegments;

      const first = this.chartPoints[0];
      const last = this.chartPoints[this.chartPoints.length - 1];
      this.areaPath = `${lineSegments} L ${last.x} ${this.chartYBase} L ${first.x} ${this.chartYBase} Z`;
    }

    const tickCount = 4;
    this.yTicks = Array.from({ length: tickCount + 1 }, (_, i) => {
      const value = (maxValue / tickCount) * i;
      const y = this.chartYBase - (value / maxValue) * yRange;
      return { value, y };
    });
  }

  private buildDynamicZones(): Array<{ start: number; end: number; point: { x: number; y: number; value: number; label: string } }> {
    if (this.chartPoints.length === 0) return [];
    const pts = this.chartPoints;
    const zones: Array<{ start: number; end: number; point: { x: number; y: number; value: number; label: string } }> = [];
    for (let i = 0; i < pts.length; i++) {
      const prevMid = i === 0 ? -Infinity : (pts[i - 1].x + pts[i].x) / 2;
      const nextMid = i === pts.length - 1 ? Infinity : (pts[i].x + pts[i + 1].x) / 2;
      zones.push({ start: prevMid, end: nextMid, point: pts[i] });
    }
    return zones;
  }
}
