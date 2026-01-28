import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../shared/sidebar/sidebar.component';
import { KitchenOrderComponent, Order, OrderStatus } from '../kitchen-order/kitchen-order.component';
import { MovementsService } from '../../shared/movements/movements.service';
import { FilterChipsComponent, FilterOption } from '../../shared/filter-chips/filter-chips.component';
import { PageHeaderComponent, PageAction } from '../../shared/page-header/page-header.component';
import { StatsGridComponent, SimpleStatItem } from '../../shared/stats-grid/stats-grid.component';

@Component({
  selector: 'app-pickup',
  imports: [CommonModule, SidebarComponent, KitchenOrderComponent, FilterChipsComponent, PageHeaderComponent, StatsGridComponent],
  templateUrl: './pickup.component.html',
  styleUrl: './pickup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PickupComponent implements OnInit {
  selectedStatus: 'all' | OrderStatus = 'all';
  statusOptions: FilterOption[] = [
    { id: 'all', label: 'Todos' },
    { id: 'pendiente', label: 'Pendientes' },
    { id: 'preparando', label: 'Preparando' },
    { id: 'listo', label: 'Listos para Recoger' }
  ];
  orders: Order[] = [];
  cartCount: number = 0;
  private _pickupStatsMemoized: SimpleStatItem[] | null = null;

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
    return this._pickupStatsMemoized;
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

  constructor(private movements: MovementsService, private router: Router) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    // Mock data - En producción vendrá del backend
    const now = new Date();
    const time1 = new Date(now.getTime() - 35 * 60000); // 35 minutos atrás
    const time2 = new Date(now.getTime() - 22 * 60000); // 22 minutos atrás
    const time3 = new Date(now.getTime() - 15 * 60000); // 15 minutos atrás
    const time4 = new Date(now.getTime() - 8 * 60000);  // 8 minutos atrás
    const time5 = new Date(now.getTime() - 3 * 60000);  // 3 minutos atrás

    this.orders = [
      {
        id: 'P-001',
        tableNumber: 0,
        tableName: 'Cliente: María García',
        items: [
          { id: '1', name: 'Sushi Variado (24 pzas)', quantity: 1 },
          { id: '2', name: 'Edamame', quantity: 2 }
        ],
        status: 'listo',
        startTime: time1,
        notes: 'Recoger a las 19:00'
      },
      {
        id: 'P-002',
        tableNumber: 0,
        tableName: 'Cliente: Carlos Ruiz',
        items: [
          { id: '1', name: 'Ramen Tonkotsu', quantity: 2 },
          { id: '2', name: 'Gyoza', quantity: 3 }
        ],
        status: 'preparando',
        startTime: time2,
        notes: 'Sin cebollín'
      },
      {
        id: 'P-003',
        tableNumber: 0,
        tableName: 'Cliente: Ana López',
        items: [
          { id: '1', name: 'California Roll', quantity: 2 },
          { id: '2', name: 'Tempura Mix', quantity: 1 }
        ],
        status: 'pendiente',
        startTime: time3
      },
      {
        id: 'P-004',
        tableNumber: 0,
        tableName: 'Cliente: Pedro Sánchez',
        items: [
          { id: '1', name: 'Nigiri Variado', quantity: 1 },
          { id: '2', name: 'Té Verde', quantity: 2 }
        ],
        status: 'listo',
        startTime: time4,
        notes: 'Cliente en camino'
      },
      {
        id: 'P-005',
        tableNumber: 0,
        tableName: 'Cliente: Laura Martínez',
        items: [
          { id: '1', name: 'Poke Bowl Salmón', quantity: 2 },
          { id: '2', name: 'Mochi Assorted', quantity: 1 }
        ],
        status: 'preparando',
        startTime: time5
      }
    ];
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
    }
  }

  trackByOrderId(_index: number, order: Order): string {
    return order.id;
  }

  onHeaderActionClick() {
    this.router.navigate(['/recogida/nuevo']);
  }
}
