import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../shared/sidebar/sidebar.component';
import { PageHeaderComponent, PageAction } from '../../shared/page-header/page-header.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { DataTableComponent, DataTableColumn } from '../../shared/data-table/data-table.component';
import { SupabaseService } from '../../core/services/supabase.service';

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

  constructor(
    private cdr: ChangeDetectorRef,
    private supabase: SupabaseService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loadCustomers();
    this.loadOrders();
    this.loadDeliveryPersons();
    this.loadAssignments();
  }

  async loadCustomers() {
    try {
      const supabaseCustomers = await this.supabase.getCustomers();
      this.customers = supabaseCustomers.map(c => ({
        id: c.id.toString(),
        name: c.name,
        phone: c.phone || '',
        email: c.email || ''
      }));
      this.cdr.markForCheck();
    } catch (error) {
      console.error('❌ Error loading customers:', error);
    }
  }

  async loadOrders() {
    try {
      const supabaseOrders = await this.supabase.getOrders();

      // Cargar items para cada pedido
      this.orders = await Promise.all(
        supabaseOrders.map(async (o) => {
          const items = await this.supabase.getOrderItems(o.id);

          // Obtener nombres de los items del menú
          const itemNames = await Promise.all(
            items.map(async (item) => {
              try {
                const menuItem = await this.supabase.getMenuItemById(item.menu_item_id);
                return menuItem ? `${menuItem.name} (x${item.quantity})` : `Item ${item.menu_item_id}`;
              } catch {
                return `Item ${item.menu_item_id}`;
              }
            })
          );

          return {
            id: o.id.toString(),
            orderNumber: `#${o.order_number}`,
            customerName: o.customer_name,
            status: o.status,
            orderType: o.order_type,
            items: itemNames.join(', ') || 'Sin items',
            totalPrice: o.total_price
          };
        })
      );

      this.cdr.markForCheck();
    } catch (error) {
      console.error('❌ Error loading orders:', error);
    }
  }

  async loadDeliveryPersons() {
    try {
      const employees = await this.supabase.getEmployees();
      // Filtrar solo empleados con rol 'delivery'
      this.deliveryPersons = employees
        .filter(e => e.role === 'delivery' && e.active)
        .map(e => ({
          id: e.id,
          name: e.full_name,
          email: e.email,
          phone: e.phone
        }));
      this.cdr.markForCheck();
    } catch (error) {
      console.error('❌ Error loading delivery persons:', error);
    }
  }

  loadAssignments() {
    // TODO: Implement assignment loading from Supabase when assignments table is ready
    this.assignments = [];
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
      orderNumber: order.orderNumber,
      deliveryPersonId: this.assignmentForm.deliveryPersonId,
      deliveryPersonName: deliveryPerson.name,
      status: 'pendiente',
      assignedAt: new Date(),
      address: (order as any).deliveryAddress || 'Sin dirección',
      notes: this.assignmentForm.notes
    };

    console.log('📋 Nueva asignación creada:', newAssignment);
    this.assignments = [...this.assignments, newAssignment];
    console.log('📋 Total asignaciones:', this.assignments.length, this.assignments);
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
