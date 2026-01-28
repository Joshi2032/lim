import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../shared/sidebar/sidebar.component';
import { PageHeaderComponent, PageAction } from '../../shared/page-header/page-header.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { DataTableComponent, DataTableColumn } from '../../shared/data-table/data-table.component';

export interface OrderAssignment {
  id: string;
  customerId: string;
  customerName: string;
  orderId: string;
  orderNumber: string;
  deliveryPersonId: string;
  deliveryPersonName: string;
  status: 'pendiente' | 'en-ruta' | 'entregado' | 'cancelado';
  assignedAt: Date;
  completedAt?: Date;
  address?: string;
  notes?: string;
}

@Component({
  selector: 'app-assignments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    PageHeaderComponent,
    ModalComponent,
    DataTableComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './assignments.component.html',
  styleUrl: './assignments.component.scss'
})
export class AssignmentsComponent implements OnInit {
  @Input() embedded: boolean = false;

  assignments: OrderAssignment[] = [];
  customers: any[] = [];
  orders: any[] = [];
  deliveryPersons: any[] = [];

  showAssignmentModal: boolean = false;
  headerAction: PageAction = { label: 'Nueva Asignación', icon: '+' };

  assignmentForm = {
    customerId: '',
    orderId: '',
    deliveryPersonId: '',
    notes: ''
  };

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
    { id: 'recogida', label: 'Recogida', icon: '🛍️', route: '/recogida' },
    { id: 'clientes', label: 'Clientes', icon: '👥', route: '/clientes' },
    { id: 'entregas', label: 'Entregas', icon: '🚚', route: '/entregas' },
    { id: 'pedidos', label: 'Pedidos', icon: '🧾', route: '/pedidos', active: true },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { id: 'panel', label: 'Panel de Control', icon: '📈', route: '/panel-control' },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', route: '/usuarios' }
  ];

  assignmentColumns: DataTableColumn[] = [
    { key: 'customerName', header: 'Cliente', width: '20%' },
    { key: 'orderNumber', header: 'Pedido', width: '15%' },
    { key: 'deliveryPersonName', header: 'Repartidor', width: '20%' },
    { key: 'address', header: 'Dirección', width: '25%' },
    { key: 'status', header: 'Estado', width: '15%' }
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loadCustomers();
    this.loadOrders();
    this.loadDeliveryPersons();
    this.loadAssignments();
  }

  loadCustomers() {
    // Mock data
    this.customers = [
      { id: '1', name: 'Juan Pérez', phone: '55 1234 5678' },
      { id: '2', name: 'María García', phone: '55 2345 6789' },
      { id: '3', name: 'Carlos López', phone: '55 3456 7890' }
    ];
  }

  loadOrders() {
    // Mock data
    this.orders = [
      { id: 'ORD-001', number: '#1001', total: 450, items: 5 },
      { id: 'ORD-002', number: '#1002', total: 650, items: 8 },
      { id: 'ORD-003', number: '#1003', total: 320, items: 3 }
    ];
  }

  loadDeliveryPersons() {
    // Mock data
    this.deliveryPersons = [
      { id: 'DEL-001', name: 'Luis Rodríguez', phone: '55 5555 5555', vehicle: 'Moto' },
      { id: 'DEL-002', name: 'Ana Martínez', phone: '55 6666 6666', vehicle: 'Auto' },
      { id: 'DEL-003', name: 'Roberto Gómez', phone: '55 7777 7777', vehicle: 'Bicicleta' }
    ];
  }

  loadAssignments() {
    this.assignments = [
      {
        id: '1',
        customerId: '1',
        customerName: 'Juan Pérez',
        orderId: 'ORD-001',
        orderNumber: '#1001',
        deliveryPersonId: 'DEL-001',
        deliveryPersonName: 'Luis Rodríguez',
        status: 'en-ruta',
        assignedAt: new Date(),
        address: 'Calle Principal 123, Apto 4B',
        notes: 'Timbrar 2 veces'
      }
    ];
  }

  openAssignmentModal() {
    this.showAssignmentModal = true;
    this.assignmentForm = {
      customerId: '',
      orderId: '',
      deliveryPersonId: '',
      notes: ''
    };
  }

  closeAssignmentModal() {
    this.showAssignmentModal = false;
  }

  saveAssignment() {
    if (!this.assignmentForm.customerId || !this.assignmentForm.orderId || !this.assignmentForm.deliveryPersonId) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    const customer = this.customers.find(c => c.id === this.assignmentForm.customerId);
    const order = this.orders.find(o => o.id === this.assignmentForm.orderId);
    const deliveryPerson = this.deliveryPersons.find(d => d.id === this.assignmentForm.deliveryPersonId);

    if (!customer || !order || !deliveryPerson) {
      alert('Error al obtener los datos');
      return;
    }

    const newAssignment: OrderAssignment = {
      id: Date.now().toString(),
      customerId: this.assignmentForm.customerId,
      customerName: customer.name,
      orderId: this.assignmentForm.orderId,
      orderNumber: order.number,
      deliveryPersonId: this.assignmentForm.deliveryPersonId,
      deliveryPersonName: deliveryPerson.name,
      status: 'pendiente',
      assignedAt: new Date(),
      notes: this.assignmentForm.notes
    };

    this.assignments.unshift(newAssignment);
    this.cdr.markForCheck();
    this.closeAssignmentModal();
  }

  updateStatus(assignmentId: string, newStatus: string) {
    const assignment = this.assignments.find(a => a.id === assignmentId);
    if (assignment) {
      assignment.status = newStatus as any;
      if (newStatus === 'entregado') {
        assignment.completedAt = new Date();
      }
      this.cdr.markForCheck();
    }
  }

  deleteAssignment(assignmentId: string) {
    const confirmed = confirm('¿Eliminar esta asignación?');
    if (confirmed) {
      this.assignments = this.assignments.filter(a => a.id !== assignmentId);
      this.cdr.markForCheck();
    }
  }
}
