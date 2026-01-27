import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../shared/sidebar/sidebar.component';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { StatsGridComponent, SimpleStatItem } from '../../shared/stats-grid/stats-grid.component';
import { DataTableComponent, DataTableColumn } from '../../shared/data-table/data-table.component';
import { FilterBarComponent, FilterField, FilterOption } from '../../shared/filter-bar/filter-bar.component';
import { MovementsService } from '../../shared/movements/movements.service';

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
  styleUrl: './delivery.component.scss'
})
export class DeliveryComponent implements OnInit {
  @Input() embedded: boolean = false;
  selectedStatus: DeliveryStatus = 'pendiente';
  deliveries: Delivery[] = [];
  cartCount: number = 0;

  // Para tabla de entregas
  deliveryColumns: DataTableColumn[] = [];
  deliveryTableData: any[] = [];

  // Para filtros
  filterFields: FilterField[] = [];

  statusOptions: FilterOption[] = [
    { value: 'pendiente', label: 'Pendientes' },
    { value: 'enCurso', label: 'En Curso' },
    { value: 'entregada', label: 'Entregadas' }
  ];

  get deliveryStats(): SimpleStatItem[] {
    return [
      { value: this.getDeliveriesByStatus('pendiente').length, label: 'Pendientes', status: 'pendiente' },
      { value: this.getDeliveriesByStatus('enCurso').length, label: 'En Curso', status: 'enCurso' },
      { value: this.getDeliveriesByStatus('entregada').length, label: 'Entregadas Hoy', status: 'entregada' }
    ];
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
    { id: 'clientes', label: 'Clientes', icon: '👥', route: '/clientes' },
    { id: 'entregas', label: 'Entregas', icon: '🚚', route: '/entregas', active: true },
    { id: 'pedidos', label: 'Pedidos', icon: '🧾', route: '/pedidos' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { id: 'panel', label: 'Panel de Control', icon: '📈', route: '/panel-control' },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', route: '/usuarios' }
  ];

  constructor(private movements: MovementsService) {}

  ngOnInit() {
    this.initializeTableColumns();
    this.initializeFilters();
    this.loadDeliveries();
  }

  private initializeTableColumns() {
    this.deliveryColumns = [
      { key: 'orderNumber', header: 'Orden', width: '100px', align: 'center' },
      { key: 'customerName', header: 'Cliente', align: 'left' },
      { key: 'phone', header: 'Teléfono', width: '140px', align: 'center' },
      { key: 'address', header: 'Dirección', align: 'left' },
      { key: 'total', header: 'Total', width: '100px', align: 'right' },
      { key: 'status', header: 'Estado', width: '120px', align: 'center' }
    ];
  }

  private initializeFilters() {
    this.filterFields = [
      {
        name: 'status',
        label: 'Estado',
        type: 'select',
        options: this.statusOptions,
        gridSpan: 2
      },
      {
        name: 'search',
        label: 'Buscar',
        type: 'search',
        placeholder: 'Cliente, teléfono u orden',
        gridSpan: 2
      }
    ];
  }

  loadDeliveries() {
    // Mock data - En producción vendrá del backend
    this.deliveries = [];
    this.updateTableData();
  }

  private updateTableData() {
    this.deliveryTableData = this.deliveries.map(d => ({
      ...d,
      status: this.getStatusLabel(d.status)
    }));
  }

  onFilterChange(filters: Record<string, any>) {
    let filtered = this.deliveries;

    if (filters['status'] && filters['status'] !== '') {
      filtered = filtered.filter(d => d.status === filters['status']);
    }

    if (filters['search'] && filters['search'].trim()) {
      const search = filters['search'].toLowerCase();
      filtered = filtered.filter(d =>
        d.customerName.toLowerCase().includes(search) ||
        d.phone.includes(search) ||
        d.orderNumber.includes(search)
      );
    }

    this.deliveryTableData = filtered.map(d => ({
      ...d,
      status: this.getStatusLabel(d.status)
    }));
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

      this.movements.log({
        title: `Entrega ${this.getStatusLabel(newStatus)}`,
        description: `${delivery.customerName} · Pedido ${delivery.orderNumber} ahora ${this.getStatusLabel(newStatus)}`,
        section: 'entregas',
        status: newStatus === 'entregada' ? 'success' : 'info',
        actor: this.currentUser.name,
        role: this.currentUser.role
      });
    }
  }

  onStatusFilterChange(statusId: any) {
    this.selectedStatus = statusId as DeliveryStatus;
  }
}
