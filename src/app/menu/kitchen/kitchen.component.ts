import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { MenuItem as SidebarMenuItem, User } from '../../shared/sidebar/sidebar.component';
import { KitchenOrderComponent, Order, OrderStatus } from '../kitchen-order/kitchen-order.component';
import { MovementsService } from '../../shared/movements/movements.service';
import { FilterChipsComponent, FilterOption } from '../../shared/filter-chips/filter-chips.component';
import { PageHeaderComponent, PageAction } from '../../shared/page-header/page-header.component';
import { StatsGridComponent, SimpleStatItem } from '../../shared/stats-grid/stats-grid.component';
import { SupabaseService, Order as SupabaseOrder } from '../../core/services/supabase.service';
import * as OrdersActions from '../../store/orders/orders.actions';
import { selectOrders } from '../../store/orders/orders.selectors';

@Component({
  selector: 'app-kitchen',
  imports: [CommonModule, KitchenOrderComponent, FilterChipsComponent, PageHeaderComponent, StatsGridComponent],
  templateUrl: './kitchen.component.html',
  styleUrl: './kitchen.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KitchenComponent implements OnInit, OnDestroy {
  selectedStatus: 'all' | OrderStatus = 'all';
  statusOptions: FilterOption[] = [
    { id: 'all', label: 'Todos' },
    { id: 'pendiente', label: 'Pendientes' },
    { id: 'preparando', label: 'Preparando' },
    { id: 'listo', label: 'Listos' }
  ];
  orders: Order[] = [];
  cartCount: number = 0;
  private _kitchenStatsMemoized: SimpleStatItem[] | null = null;
  private subscriptions = new Subscription();

  // Observable del store
  orders$: Observable<SupabaseOrder[]>;

  headerAction: PageAction = {
    label: 'Nuevo Pedido',
    icon: '➕'
  };

  get kitchenStats(): SimpleStatItem[] {
    if (this._kitchenStatsMemoized) return this._kitchenStatsMemoized;
    this._kitchenStatsMemoized = [
      { value: this.getOrdersByStatus('pendiente').length, label: 'Pendientes', status: 'pendiente' },
      { value: this.getOrdersByStatus('preparando').length, label: 'Preparando', status: 'preparando' },
      { value: this.getOrdersByStatus('listo').length, label: 'Listos', status: 'listo' }
    ];
    return this._kitchenStatsMemoized || [];
  }

  currentUser: User = {
    name: 'Josue',
    role: 'Dueña',
    initials: 'J'
  };

  sidebarItems: SidebarMenuItem[] = [
    { id: 'menu', label: 'Menú', icon: '🍜', route: '/menu' },
    { id: 'mesas', label: 'Mesas', icon: '🪑', route: '/mesas' },
    { id: 'cocina', label: 'Cocina', icon: '🍳', route: '/cocina', active: true },
    { id: 'recogida', label: 'Recogida', icon: '🛍️', route: '/recogida' },
    { id: 'clientes', label: 'Clientes', icon: '👥', route: '/clientes' },
    { id: 'entregas', label: 'Entregas', icon: '🚚', route: '/entregas' },
    { id: 'pedidos', label: 'Pedidos', icon: '🧾', route: '/pedidos' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { id: 'panel', label: 'Panel de Control', icon: '📈', route: '/panel-control' },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', route: '/usuarios' }
  ];

  constructor(
    private movements: MovementsService,
    private supabase: SupabaseService,
    private store: Store,
    private cdr: ChangeDetectorRef
  ) {
    // Inicializar observable del store
    this.orders$ = this.store.select(selectOrders);
  }

  ngOnInit() {
    // Dispatch para cargar órdenes desde el store
    this.store.dispatch(OrdersActions.loadOrders());

    // Suscribirse a cambios en órdenes
    this.subscriptions.add(
      this.orders$.subscribe(supabaseOrders => {
        this.orders = this.mapSupabaseOrdersToOrders(supabaseOrders);
        this._kitchenStatsMemoized = null;
        this.cdr.markForCheck();
      })
    );

    // Suscribirse a cambios en tiempo real
    this.store.dispatch(OrdersActions.subscribeToOrders());
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // Métodos de carga ahora se manejan desde NgRx store
  // loadKitchenOrders() y subscribeToKitchenOrdersChanges() ya no son necesarios

  private mapSupabaseOrdersToOrders(supabaseOrders: SupabaseOrder[]): Order[] {
    return supabaseOrders.map(so => ({
      id: so.id,
      tableNumber: so.table_number || 0,
      tableName: this.getTableName(so),
      items: [],
      status: this.mapSupabaseStatus(so.status),
      startTime: new Date(so.created_at),
      notes: so.notes || ''
    }));
  }

  private getTableName(order: SupabaseOrder): string {
    if (order.order_type === 'dine-in' && order.table_number) {
      return `Mesa ${order.table_number}`;
    } else if (order.order_type === 'pickup') {
      return `Recogida: ${order.customer_name}`;
    } else if (order.order_type === 'delivery') {
      return `Entrega: ${order.customer_name}`;
    }
    return order.customer_name;
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

  getOrdersByStatus(status: OrderStatus): Order[] {
    return this.orders.filter(order => order.status === status);
  }

  getFilteredOrders(): Order[] {
    if (this.selectedStatus === 'all') {
      // Ordenar por: pendientes → preparando → listos → tiempo descendente (más antiguos primero)
      return [...this.orders].sort((a, b) => {
        const statusOrder: Record<OrderStatus, number> = {
          'pendiente': 1,
          'preparando': 2,
          'listo': 3,
          'servido': 4
        };

        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status];
        }

        return b.startTime.getTime() - a.startTime.getTime();
      });
    }

    return [...this.orders]
      .filter(order => order.status === this.selectedStatus)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  onOrderStatusChange(orderId: string, newStatus: OrderStatus) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      this._kitchenStatsMemoized = null; // Invalidar caché

      // Actualizar en Supabase
      const supabaseStatus = this.mapOrderStatusToSupabase(newStatus);
      this.supabase.updateOrderStatus(orderId, supabaseStatus).catch(error => {
        console.error('Error updating order status:', error);
      });

      this.movements.log({
        title: `Orden ${newStatus === 'listo' ? 'lista' : 'actualizada'}`,
        description: `${order.tableName} · ${order.items.length} ítems ahora ${newStatus}`,
        section: 'cocina',
        status: newStatus === 'listo' ? 'success' : 'info',
        actor: this.currentUser.name,
        role: this.currentUser.role
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

  onStatusFilterChange(statusId: any) {
    this.selectedStatus = statusId as 'all' | OrderStatus;
  }

  trackByOrderId(_index: number, order: Order): string {
    return order.id;
  }
}
