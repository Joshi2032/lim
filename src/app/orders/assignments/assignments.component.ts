import { Component, OnInit, OnDestroy, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../shared/sidebar/sidebar.component';
import { PageHeaderComponent, PageAction } from '../../shared/page-header/page-header.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { DataTableComponent, DataTableColumn } from '../../shared/data-table/data-table.component';
import * as AssignmentsActions from '../../store/assignments/assignments.actions';
import { selectAssignments } from '../../store/assignments/assignments.selectors';
import { Assignment } from '../../store/assignments/assignments.models';
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
  assignmentsRaw: Assignment[] = [];

  // Observables del store
  customers$: Observable<any[]>;
  orders$: Observable<any[]>;
  deliveryPersons$: Observable<any[]>;
  assignments$: Observable<Assignment[]>;

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
    private store: Store
  ) {
    // Inicializar observables del store
    this.customers$ = this.store.select(selectCustomers);
    this.orders$ = this.store.select(selectOrders);
    this.deliveryPersons$ = this.store.select(selectDeliveryPersons);
    this.assignments$ = this.store.select(selectAssignments);
  }

  ngOnInit() {
    // Dispatch para cargar datos desde el store
    this.store.dispatch(CustomersActions.loadCustomers());
    this.store.dispatch(OrdersActions.loadOrders());
    this.store.dispatch(EmployeesActions.loadEmployees());
    this.store.dispatch(EmployeesActions.loadPositions());
    this.store.dispatch(AssignmentsActions.loadAssignments());
    this.store.dispatch(AssignmentsActions.subscribeToAssignments());

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

    this.subscriptions.add(
      this.assignments$.subscribe(assignments => {
        this.assignmentsRaw = assignments;
        this.updateAssignmentsDisplay();
        this.cdr.markForCheck();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  updateAssignmentsDisplay() {
    this.assignments = this.assignmentsRaw.map(a => ({
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

    const assignmentData = {
      order_id: order.id,
      customer_id: this.assignmentForm.customerId,
      delivery_person_id: this.assignmentForm.deliveryPersonId,
      status: 'pendiente' as const,
      address: (order as any).deliveryAddress || 'Sin dirección',
      notes: this.assignmentForm.notes
    };

    this.store.dispatch(AssignmentsActions.createAssignment({ assignment: assignmentData }));
    this.closeAssignmentModal();
    this.cdr.markForCheck();
  }

  updateStatus(assignmentId: string, newStatus: string) {
    const assignment = this.assignments.find(a => a.id === assignmentId);
    if (assignment) {
      const completedAt = newStatus === 'entregado' ? new Date().toISOString() : null;

      this.store.dispatch(
        AssignmentsActions.updateAssignment({
          assignmentId,
          assignment: {
            status: newStatus as any,
            completed_at: completedAt || undefined
          }
        })
      );
    }
  }

  deleteAssignment(assignmentId: string) {
    const confirmed = confirm('¿Eliminar esta asignación?');
    if (confirmed) {
      this.store.dispatch(AssignmentsActions.deleteAssignment({ assignmentId }));
    }
  }
}
