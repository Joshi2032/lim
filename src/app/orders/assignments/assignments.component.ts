import { Component, OnInit, OnDestroy, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../shared/sidebar/sidebar.component';
import { PageHeaderComponent, PageAction } from '../../shared/page-header/page-header.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { DataTableComponent, DataTableColumn } from '../../shared/data-table/data-table.component';
import { SupabaseService } from '../../core/services/supabase.service';
import * as OrdersActions from '../../store/orders/orders.actions';
import * as CustomersActions from '../../store/customers/customers.actions';
import * as EmployeesActions from '../../store/employees/employees.actions';
import { selectOrders } from '../../store/orders/orders.selectors';
import { selectCustomers } from '../../store/customers/customers.selectors';
import { selectDeliveryPersons } from '../../store/employees/employees.selectors';

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

  // Observables del store
  customers$: Observable<any[]>;
  orders$: Observable<any[]>;
  deliveryPersons$: Observable<any[]>;

  // Arrays locales para búsquedas
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
    private supabase: SupabaseService,
    private store: Store
  ) {
    // Inicializar observables del store
    this.customers$ = this.store.select(selectCustomers);
    this.orders$ = this.store.select(selectOrders);
    this.deliveryPersons$ = this.store.select(selectDeliveryPersons);
  }

  ngOnInit() {
    // Dispatch para cargar datos desde el store
    this.store.dispatch(CustomersActions.loadCustomers());
    this.store.dispatch(OrdersActions.loadOrders());
    this.store.dispatch(EmployeesActions.loadEmployees());
    this.store.dispatch(EmployeesActions.loadPositions());

    // Suscribirse a cambios en los datos
    this.subscriptions.add(
      this.customers$.subscribe(customers => {
        this.customers = customers.map(c => ({
          id: c.id.toString(),
          name: c.name,
          phone: c.phone || '',
          email: c.email || ''
        }));
        this.updateAssignmentsDisplay();
        this.cdr.markForCheck();
      })
    );

    this.subscriptions.add(
      this.orders$.subscribe(orders => {
        this.orders = orders.map(o => ({
          id: o.id.toString(),
          orderNumber: `#${o.order_number}`,
          customerName: o.customer_name,
          status: o.status,
          orderType: o.order_type,
          totalPrice: o.total_price
        }));
        this.updateAssignmentsDisplay();
        this.cdr.markForCheck();
      })
    );

    this.subscriptions.add(
      this.deliveryPersons$.subscribe(persons => {
        this.deliveryPersons = persons.map(e => ({
          id: e.id,
          name: e.full_name,
          email: e.email,
          phone: e.phone
        }));
        this.updateAssignmentsDisplay();
        this.cdr.markForCheck();
      })
    );

    // Cargar asignaciones
    this.loadAssignments();
    this.subscribeToAssignments();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  updateAssignmentsDisplay() {
    // Recargar asignaciones si ya se han cargado para actualizar nombres
    if (this.assignments.length > 0) {
      this.loadAssignments();
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
