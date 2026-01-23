import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../shared/sidebar/sidebar.component';
import { KitchenOrderComponent, Order, OrderStatus } from '../kitchen-order/kitchen-order.component';

@Component({
  selector: 'app-kitchen',
  imports: [CommonModule, SidebarComponent, KitchenOrderComponent],
  templateUrl: './kitchen.component.html',
  styleUrl: './kitchen.component.scss'
})
export class KitchenComponent implements OnInit {
  selectedStatus: 'all' | OrderStatus = 'all';
  orders: Order[] = [];
  cartCount: number = 0;

  currentUser: User = {
    name: 'Josue',
    role: 'Dueña',
    initials: 'J'
  };

  sidebarItems: SidebarMenuItem[] = [
    { id: 'menu', label: 'Menú', icon: '🍜', route: '/menu' },
    { id: 'mesas', label: 'Mesas', icon: '🪑', route: '/mesas' },
    { id: 'cocina', label: 'Cocina', icon: '🍳', route: '/cocina', active: true },
    { id: 'clientes', label: 'Clientes', icon: '👥', route: '/clientes' },
    { id: 'entregas', label: 'Entregas', icon: '🚚', route: '/entregas' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', route: '/usuarios' }
  ];

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    // Mock data - En producción vendrá del backend
    const now = new Date();
    const time1 = new Date(now.getTime() - 129 * 60000); // 129 minutos atrás
    const time2 = new Date(now.getTime() - 119 * 60000); // 119 minutos atrás
    const time3 = new Date(now.getTime() - 109 * 60000); // 109 minutos atrás
    const time4 = new Date(now.getTime() - 45 * 60000);  // 45 minutos atrás
    const time5 = new Date(now.getTime() - 25 * 60000);  // 25 minutos atrás

    this.orders = [
      {
        id: '1',
        tableNumber: 9,
        tableName: 'Mesa 9',
        items: [
          { id: '1', name: 'Philadelphia Roll', quantity: 2 },
          { id: '2', name: 'Nigiri de Salmón', quantity: 2 }
        ],
        status: 'pendiente',
        startTime: time1,
        notes: 'Sin picante'
      },
      {
        id: '2',
        tableNumber: 2,
        tableName: 'Mesa 2',
        items: [
          { id: '1', name: 'Tempura', quantity: 1 },
          { id: '2', name: 'Gyoza', quantity: 3 }
        ],
        status: 'preparando',
        startTime: time2
      },
      {
        id: '3',
        tableNumber: 5,
        tableName: 'Mesa 5',
        items: [
          { id: '1', name: 'Ramen Tonkotsu', quantity: 2 },
          { id: '2', name: 'Edamame', quantity: 1 }
        ],
        status: 'listo',
        startTime: time3
      },
      {
        id: '4',
        tableNumber: 12,
        tableName: 'Mesa 12',
        items: [
          { id: '1', name: 'Bibimbap', quantity: 1 }
        ],
        status: 'pendiente',
        startTime: time4,
        notes: 'Alérgico a frutos secos'
      },
      {
        id: '5',
        tableNumber: 7,
        tableName: 'Mesa 7',
        items: [
          { id: '1', name: 'Donburi de Pollo', quantity: 2 },
          { id: '2', name: 'Miso Soup', quantity: 2 }
        ],
        status: 'preparando',
        startTime: time5
      }
    ];
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

      // Si se marca como "servido", podría removerse después de un tiempo
      if (newStatus === 'servido') {
        setTimeout(() => {
          this.orders = this.orders.filter(o => o.id !== orderId);
        }, 3000);
      }
    }
  }
}
