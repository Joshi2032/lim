import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../shared/sidebar/sidebar.component';
import { KitchenOrderComponent, Order, OrderStatus } from '../kitchen-order/kitchen-order.component';
import { MovementsService } from '../../shared/movements/movements.service';
import { FilterChipsComponent, FilterOption } from '../../shared/filter-chips/filter-chips.component';
import { PageHeaderComponent, PageAction } from '../../shared/page-header/page-header.component';
import { StatsGridComponent, SimpleStatItem } from '../../shared/stats-grid/stats-grid.component';
import { SupabaseService, Order as SupabaseOrder } from '../../core/services/supabase.service';
import { RealtimeChannel } from '@supabase/supabase-js';

@Component({
  selector: 'app-pickup',
  imports: [CommonModule, SidebarComponent, KitchenOrderComponent, FilterChipsComponent, PageHeaderComponent, StatsGridComponent],
  templateUrl: './pickup.component.html',
  styleUrl: './pickup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PickupComponent implements OnInit, OnDestroy {
  selectedStatus: 'all' | OrderStatus = 'all';
  statusOptions: FilterOption[] = [
    { id: 'all', label: 'Todos' },
    { id: 'pending', label: 'Pendientes' },
    { id: 'preparing', label: 'Preparando' },
    { id: 'ready', label: 'Listos para Recoger' }
  ];
  orders: Order[] = [];
  cartCount: number = 0;
  private _pickupStatsMemoized: SimpleStatItem[] | null = null;
  private pickupOrdersSubscription: RealtimeChannel | null = null;

  headerAction: PageAction = {
    label: 'Nuevo Pedido',
    icon: '➕'
  };

  get pickupStats(): SimpleStatItem[] {
    if (this._pickupStatsMemoized) return this._pickupStatsMemoized;
    this._pickupStatsMemoized = [
      { value: this.getOrdersByStatus('pendiente').length, label: 'Pendientes', status: 'pendiente' },
      { value: this.getOrdersByStatus('preparando').length, label: 'Preparando', status: 'preparando' },
      { value: this.getOrdersByStatus('listo').length, label: 'Listos', status: 'listo' }
    ];
    return this._pickupStatsMemoized || [];
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
    { id: 'recogida', label: 'Recogida', icon: '🛍️', route: '/recogida', active: true },
    { id: 'clientes', label: 'Clientes', icon: '👥', route: '/clientes' },
    { id: 'entregas', label: 'Entregas', icon: '🚚', route: '/entregas' },
    { id: 'pedidos', label: 'Pedidos', icon: '🧾', route: '/pedidos' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { id: 'panel', label: 'Panel de Control', icon: '📈', route: '/panel-control' },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', route: '/usuarios' }
  ];

  constructor(
    private movements: MovementsService,
    private router: Router,
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadPickupOrders();
    this.subscribeToPickupOrdersChanges();
  }

  ngOnDestroy() {
    if (this.pickupOrdersSubscription) {
      this.pickupOrdersSubscription.unsubscribe();
    }
  }

  async loadPickupOrders() {
    try {
      const supabaseOrders = await this.supabase.getOrdersByType('pickup');
      this.orders = this.mapSupabaseOrdersToOrders(supabaseOrders);
      this._pickupStatsMemoized = null; // Invalidar caché
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error loading pickup orders:', error);
    }
  }

  private subscribeToPickupOrdersChanges() {
    this.pickupOrdersSubscription = this.supabase.subscribeToPickupOrders((orders) => {
      this.orders = this.mapSupabaseOrdersToOrders(orders);
      this._pickupStatsMemoized = null; // Invalidar caché
      this.cdr.markForCheck();
    });
  }

  private mapSupabaseOrdersToOrders(supabaseOrders: SupabaseOrder[]): Order[] {
    return supabaseOrders.map(so => ({
      id: so.id,
      tableNumber: 0,
      tableName: `Cliente: ${so.customer_name}`,
      items: [], // Los items vendrían de una query adicional si es necesario
      status: this.mapSupabaseStatus(so.status),
      startTime: new Date(so.created_at),
      notes: so.notes || ''
    }));
  }

  private mapSupabaseStatus(status: SupabaseOrder['status']): OrderStatus {
    const statusMap: Record<string, OrderStatus> = {
      'pending': 'pendiente',
      'preparing': 'preparando',
      'ready': 'listo',
      'completed': 'listo',
      'cancelled': 'pendiente'
    };
    return statusMap[status] || 'pendiente';
  }

  getFilteredOrders(): Order[] {
    if (this.selectedStatus === 'all') {
      return this.orders;
    }
    return this.orders.filter(order => order.status === this.selectedStatus);
  }

  getOrdersByStatus(status: OrderStatus): Order[] {
    return this.orders.filter(order => order.status === status);
  }

  onStatusFilterChange(statusId: string | number) {
    this.selectedStatus = statusId.toString() as 'all' | OrderStatus;
    this._pickupStatsMemoized = null; // Invalidar caché
  }

  onOrderStatusChange(orderId: string, newStatus: OrderStatus) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      this._pickupStatsMemoized = null; // Invalidar caché

      // Update in Supabase
      const supabaseStatus = this.mapOrderStatusToSupabase(newStatus);
      this.supabase.updateOrderStatus(orderId, supabaseStatus).catch(error => {
        console.error('Error updating order status:', error);
      });
    }
  }

  private mapOrderStatusToSupabase(orderStatus: OrderStatus): SupabaseOrder['status'] {
    const statusMap: Record<OrderStatus, SupabaseOrder['status']> = {
      'pendiente': 'pending',
      'preparando': 'preparing',
      'listo': 'ready',
      'servido': 'completed'
    };
    return statusMap[orderStatus] || 'pending';
  }

  trackByOrderId(_index: number, order: Order): string {
    return order.id;
  }

  onHeaderActionClick() {
    this.router.navigate(['/recogida/nuevo']);
  }
}
