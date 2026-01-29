import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../shared/sidebar/sidebar.component';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { StatsGridComponent, SimpleStatItem } from '../../shared/stats-grid/stats-grid.component';
import { DataTableComponent, DataTableColumn } from '../../shared/data-table/data-table.component';
import { FilterBarComponent, FilterField, FilterOption } from '../../shared/filter-bar/filter-bar.component';
import { MovementsService } from '../../shared/movements/movements.service';
import { SupabaseService, Order as SupabaseOrder } from '../../core/services/supabase.service';
import { RealtimeChannel } from '@supabase/supabase-js';

export type DeliveryStatus = 'pendiente' | 'enCurso' | 'entregada';

export interface Delivery {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  orderNumber: string;
  total: number;
  status: DeliveryStatus;
  notes?: string;
}

@Component({
  selector: 'app-delivery',
  imports: [CommonModule, SidebarComponent, PageHeaderComponent, StatsGridComponent, DataTableComponent, FilterBarComponent],
  templateUrl: './delivery.component.html',
  styleUrl: './delivery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryComponent implements OnInit, OnDestroy {
  @Input() embedded: boolean = false;
  selectedStatus: DeliveryStatus = 'pendiente';
  deliveries: Delivery[] = [];
  cartCount: number = 0;
  private _deliveryStatsMemoized: SimpleStatItem[] | null = null;
  private deliveryOrdersSubscription: RealtimeChannel | null = null;

  deliveryColumns: DataTableColumn[] = [];
  deliveryTableData: any[] = [];
  filterFields: FilterField[] = [];

  statusOptions: FilterOption[] = [
    { value: 'pendiente', label: 'Pendientes' },
    { value: 'enCurso', label: 'En Curso' },
    { value: 'entregada', label: 'Entregadas' }
  ];

  get deliveryStats(): SimpleStatItem[] {
    if (this._deliveryStatsMemoized) return this._deliveryStatsMemoized;
    this._deliveryStatsMemoized = [
      { value: this.getDeliveriesByStatus('pendiente').length, label: 'Pendientes', status: 'pendiente' },
      { value: this.getDeliveriesByStatus('enCurso').length, label: 'En Curso', status: 'enCurso' },
      { value: this.getDeliveriesByStatus('entregada').length, label: 'Entregadas Hoy', status: 'entregada' }
    ];
    return this._deliveryStatsMemoized || [];
  }

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
    { id: 'entregas', label: 'Entregas', icon: '🚚', route: '/entregas', active: true },
    { id: 'pedidos', label: 'Pedidos', icon: '🧾', route: '/pedidos' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { id: 'panel', label: 'Panel de Control', icon: '📈', route: '/panel-control' },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', route: '/usuarios' }
  ];

  constructor(
    private movements: MovementsService,
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initializeTableColumns();
    this.initializeFilters();
    this.loadDeliveries();
    this.subscribeToDeliveryChanges();
  }

  ngOnDestroy() {
    if (this.deliveryOrdersSubscription) {
      this.deliveryOrdersSubscription.unsubscribe();
    }
  }

  async loadDeliveries() {
    try {
      const supabaseOrders = await this.supabase.getOrdersByType('delivery');
      this.deliveries = this.mapSupabaseOrdersToDeliveries(supabaseOrders);
      this.updateTableData();
      this._deliveryStatsMemoized = null;
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error loading delivery orders:', error);
    }
  }

  private subscribeToDeliveryChanges() {
    this.deliveryOrdersSubscription = this.supabase.subscribeToOrders((orders) => {
      const deliveryOrders = orders.filter(o => o.order_type === 'delivery');
      this.deliveries = this.mapSupabaseOrdersToDeliveries(deliveryOrders);
      this.updateTableData();
      this._deliveryStatsMemoized = null;
      this.cdr.markForCheck();
    });
  }

  private mapSupabaseOrdersToDeliveries(supabaseOrders: SupabaseOrder[]): Delivery[] {
    return supabaseOrders.map(so => ({
      id: so.id,
      customerName: so.customer_name,
      phone: so.customer_phone || '',
      address: so.delivery_address || '',
      orderNumber: so.order_number,
      total: so.total_price,
      status: this.mapSupabaseStatusToDelivery(so.status),
      notes: so.notes
    }));
  }

  private mapSupabaseStatusToDelivery(status: SupabaseOrder['status']): DeliveryStatus {
    const statusMap: Record<string, DeliveryStatus> = {
      'pending': 'pendiente',
      'preparing': 'pendiente',
      'ready': 'enCurso',
      'completed': 'entregada',
      'cancelled': 'pendiente'
    };
    return statusMap[status] || 'pendiente';
  }

  private mapDeliveryStatusToSupabase(status: DeliveryStatus): SupabaseOrder['status'] {
    const statusMap: Record<DeliveryStatus, SupabaseOrder['status']> = {
      'pendiente': 'pending',
      'enCurso': 'ready',
      'entregada': 'completed'
    };
    return statusMap[status] || 'pending';
  }

  initializeTableColumns() {
    this.deliveryColumns = [
      { key: 'orderNumber', header: 'Nº Pedido', width: '120px' },
      { key: 'customerName', header: 'Cliente', width: '200px' },
      { key: 'phone', header: 'Teléfono', width: '140px' },
      { key: 'address', header: 'Dirección', width: '300px' },
      { key: 'total', header: 'Total', width: '100px', align: 'right' },
      { key: 'status', header: 'Estado', width: '120px' },
      { key: 'actions', header: 'Acciones', width: '150px', align: 'center' }
    ];
  }

  initializeFilters() {
    this.filterFields = [
      {
        name: 'status',
        label: 'Estado',
        type: 'select',
        options: this.statusOptions
      },
      {
        name: 'search',
        label: 'Buscar',
        type: 'search',
        placeholder: 'Buscar por cliente o dirección...'
      }
    ];
  }

  updateTableData() {
    this.deliveryTableData = this.deliveries.map(delivery => ({
      ...delivery,
      total: `$${delivery.total.toFixed(2)}`,
      statusBadge: {
        text: this.getStatusLabel(delivery.status),
        variant: this.getStatusVariant(delivery.status)
      },
      actions: [
        { label: 'Asignar', action: 'assign', icon: '👤' },
        { label: 'En Curso', action: 'start', icon: '🚚', show: delivery.status === 'pendiente' },
        { label: 'Entregado', action: 'complete', icon: '✅', show: delivery.status === 'enCurso' }
      ]
    }));
  }

  getStatusLabel(status: DeliveryStatus): string {
    const labels: Record<DeliveryStatus, string> = {
      'pendiente': 'Pendiente',
      'enCurso': 'En Curso',
      'entregada': 'Entregada'
    };
    return labels[status] || status;
  }

  getStatusVariant(status: DeliveryStatus): string {
    const variants: Record<DeliveryStatus, string> = {
      'pendiente': 'warning',
      'enCurso': 'info',
      'entregada': 'success'
    };
    return variants[status] || 'default';
  }

  getDeliveriesByStatus(status: DeliveryStatus): Delivery[] {
    return this.deliveries.filter(d => d.status === status);
  }

  onFilterChange(filters: any) {
    console.log('Filters changed:', filters);
    // Implementar lógica de filtrado si es necesario
  }

  onTableAction(event: { action: string; row: any }) {
    const delivery = this.deliveries.find(d => d.id === event.row.id);
    if (!delivery) return;

    switch (event.action) {
      case 'assign':
        this.assignDelivery(delivery);
        break;
      case 'start':
        this.startDelivery(delivery);
        break;
      case 'complete':
        this.completeDelivery(delivery);
        break;
    }
  }

  assignDelivery(delivery: Delivery) {
    console.log('Assign delivery:', delivery);
    // Implementar asignación de repartidor
  }

  async startDelivery(delivery: Delivery) {
    try {
      await this.supabase.updateOrderStatus(delivery.id, 'ready');
      this.movements.log({
        title: 'Entrega iniciada',
        description: `Pedido ${delivery.orderNumber} en camino`,
        section: 'entregas',
        status: 'info',
        actor: this.currentUser.name,
        role: this.currentUser.role
      });
    } catch (error) {
      console.error('Error starting delivery:', error);
    }
  }

  async completeDelivery(delivery: Delivery) {
    try {
      await this.supabase.updateOrderStatus(delivery.id, 'completed');
      this.movements.log({
        title: 'Entrega completada',
        description: `Pedido ${delivery.orderNumber} entregado a ${delivery.customerName}`,
        section: 'entregas',
        status: 'success',
        actor: this.currentUser.name,
        role: this.currentUser.role
      });
    } catch (error) {
      console.error('Error completing delivery:', error);
    }
  }
}
