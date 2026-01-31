import { Component, OnInit, OnDestroy, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
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
export class AssignmentsComponent implements OnInit, OnDestroy {
  @Input() embedded: boolean = false;

  assignments: OrderAssignment[] = [];
  customers: any[] = [];
  orders: any[] = [];
  deliveryPersons: any[] = [];

  private subscriptions = new Subscription();

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
    this.subscribeToAssignments();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }  loadData() {
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
    this.supabase.getAssignments()
      .then(assignments => {
        this.assignments = assignments.map(a => ({
          id: a.id,
          customerId: a.customer_id,
          customerName: this.customers.find(c => c.id === a.customer_id)?.name || 'N/A',
          orderId: a.order_id,
          orderNumber: this.orders.find(o => o.id === a.order_id)?.orderNumber || 'N/A',
          deliveryPersonId: a.delivery_person_id,
          deliveryPersonName: this.deliveryPersons.find(d => d.id === a.delivery_person_id)?.name || 'N/A',
          status: a.status as any,
          assignedAt: new Date(a.assigned_at),
          completedAt: a.completed_at ? new Date(a.completed_at) : undefined,
          address: a.address,
          notes: a.notes
        }));
        this.cdr.markForCheck();
        console.log('✅ Asignaciones cargadas:', this.assignments);
      })
      .catch(error => {
        console.error('❌ Error loading assignments:', error);
      });
  }

  private subscribeToAssignments() {
    const subscription = this.supabase.subscribeToAssignments((assignments) => {
      this.assignments = assignments.map(a => ({
        id: a.id,
        customerId: a.customer_id,
        customerName: this.customers.find(c => c.id === a.customer_id)?.name || 'N/A',
        orderId: a.order_id,
        orderNumber: this.orders.find(o => o.id === a.order_id)?.orderNumber || 'N/A',
        deliveryPersonId: a.delivery_person_id,
        deliveryPersonName: this.deliveryPersons.find(d => d.id === a.delivery_person_id)?.name || 'N/A',
        status: a.status as any,
        assignedAt: new Date(a.assigned_at),
        completedAt: a.completed_at ? new Date(a.completed_at) : undefined,
        address: a.address,
        notes: a.notes
      }));
      this.cdr.markForCheck();
      console.log('🔄 Asignaciones actualizadas en tiempo real');
    });

    this.subscriptions.add(subscription);
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

    this.saveAssignmentToSupabase(customer, order, deliveryPerson);
  }

  private async saveAssignmentToSupabase(customer: any, order: any, deliveryPerson: any) {
    try {
      const assignmentData = {
        order_id: order.id,
        customer_id: this.assignmentForm.customerId,
        delivery_person_id: this.assignmentForm.deliveryPersonId,
        status: 'pendiente' as const,
        address: (order as any).deliveryAddress || 'Sin dirección',
        notes: this.assignmentForm.notes
      };

      const savedAssignment = await this.supabase.createAssignment(assignmentData);

      // Agregar a la lista local
      const newAssignment: OrderAssignment = {
        id: savedAssignment.id,
        customerId: this.assignmentForm.customerId,
        customerName: customer.name,
        orderId: this.assignmentForm.orderId,
        orderNumber: order.orderNumber,
        deliveryPersonId: this.assignmentForm.deliveryPersonId,
        deliveryPersonName: deliveryPerson.name,
        status: 'pendiente',
        assignedAt: new Date(savedAssignment.assigned_at),
        address: assignmentData.address,
        notes: this.assignmentForm.notes
      };

      this.assignments = [...this.assignments, newAssignment];
      this.cdr.markForCheck();
      this.closeAssignmentModal();

      console.log('✅ Asignación guardada en BD:', savedAssignment);
    } catch (error) {
      console.error('❌ Error saving assignment:', error);
      alert('Error al guardar la asignación: ' + (error as any).message);
    }
  }

  updateStatus(assignmentId: string, newStatus: string) {
    const assignment = this.assignments.find(a => a.id === assignmentId);
    if (assignment) {
      const completedAt = newStatus === 'entregado' ? new Date().toISOString() : null;

      this.supabase.updateAssignment(assignmentId, {
        status: newStatus,
        completed_at: completedAt || undefined
      })
        .then(() => {
          assignment.status = newStatus as any;
          if (newStatus === 'entregado') {
            assignment.completedAt = new Date();
          }
          this.cdr.markForCheck();
          console.log('✅ Estado de asignación actualizado:', newStatus);
        })
        .catch(error => {
          console.error('❌ Error updating assignment status:', error);
          alert('Error al actualizar estado: ' + (error as any).message);
        });
    }
  }

  deleteAssignment(assignmentId: string) {
    const confirmed = confirm('¿Eliminar esta asignación?');
    if (confirmed) {
      this.supabase.deleteAssignment(assignmentId)
        .then(() => {
          this.assignments = this.assignments.filter(a => a.id !== assignmentId);
          this.cdr.markForCheck();
          console.log('✅ Asignación eliminada');
        })
        .catch(error => {
          console.error('❌ Error deleting assignment:', error);
          alert('Error al eliminar: ' + (error as any).message);
        });
    }
  }
}
