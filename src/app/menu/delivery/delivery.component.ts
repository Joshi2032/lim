import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../shared/sidebar/sidebar.component';
import { DeliveryCardComponent } from '../../shared/delivery-card/delivery-card.component';

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
  imports: [CommonModule, SidebarComponent, DeliveryCardComponent],
  templateUrl: './delivery.component.html',
  styleUrl: './delivery.component.scss'
})
export class DeliveryComponent implements OnInit {
  selectedStatus: DeliveryStatus = 'pendiente';
  deliveries: Delivery[] = [];
  cartCount: number = 0;

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
    { id: 'entregas', label: 'Entregas', icon: '🚚', route: '/entregas', active: true },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { id: 'panel', label: 'Panel de Control', icon: '📈', route: '/panel-control' },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', route: '/usuarios' }
  ];

  ngOnInit() {
    this.loadDeliveries();
  }

  loadDeliveries() {
    // Mock data - En producción vendrá del backend
    this.deliveries = [];
  }

  getDeliveriesByStatus(status: DeliveryStatus): Delivery[] {
    return this.deliveries.filter(delivery => delivery.status === status);
  }

  getFilteredDeliveries(): Delivery[] {
    return this.getDeliveriesByStatus(this.selectedStatus);
  }

  getStatusLabel(status: DeliveryStatus): string {
    const labels: Record<DeliveryStatus, string> = {
      'pendiente': 'Pendiente',
      'enCurso': 'En Curso',
      'entregada': 'Entregada'
    };
    return labels[status];
  }

  updateDeliveryStatus(deliveryId: string, newStatus: DeliveryStatus) {
    const delivery = this.deliveries.find(d => d.id === deliveryId);
    if (delivery) {
      delivery.status = newStatus;
    }
  }
}
