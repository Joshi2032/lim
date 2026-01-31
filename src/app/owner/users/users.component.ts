import { Component, OnInit, OnDestroy, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../shared/sidebar/sidebar.component';
import { UserCardComponent } from '../../shared/user-card/user-card.component';
import { UserFormComponent, UserFormData, RoleOption } from '../../shared/user-form/user-form.component';
import { PageHeaderComponent, PageAction } from '../../shared/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { MovementsService } from '../../shared/movements/movements.service';
import { Employee } from '../../core/services/supabase.service';
import { Position as StorePosition } from '../../store/employees/employees.reducer';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import * as EmployeesActions from '../../store/employees/employees.actions';
import { selectEmployees, selectEmployeesLoadingState, selectEmployeesPositions } from '../../store/employees/employees.selectors';

export type UserRole = 'duena' | 'encargado' | 'chef' | 'mesero' | 'cajero' | 'repartidor';

export interface UserEmployee {
	id: string;
	name: string;
	email: string;
	phone?: string;
	positionId: string;
	positionName?: string;
	roleId: UserRole;
	initials: string;
	status: 'activo' | 'inactivo';
}

export interface RoleStat extends RoleOption {
	count: number;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, SidebarComponent, UserCardComponent, UserFormComponent, PageHeaderComponent, EmptyStateComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersComponent implements OnInit, OnDestroy {
  private isSubmitting = false;
  @Input() embedded: boolean = false;
  users: UserEmployee[] = [];
  positions: StorePosition[] = [];
  employees$: Observable<Employee[]>;
  positions$: Observable<StorePosition[]>;
  loading$: Observable<boolean>;
  private subscriptions = new Subscription();
  cartCount: number = 0;
  showUserFormModal: boolean = false;
  userBeingEdited: UserEmployee | null = null;
  headerAction: PageAction = {
    label: 'Nuevo Usuario',
    icon: '+'
  };

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
    { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { id: 'panel', label: 'Panel de Control', icon: '📈', route: '/panel-control' },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', route: '/usuarios', active: true }
  ];

  constructor(
    private movements: MovementsService,
    private cdr: ChangeDetectorRef,
    private store: Store
  ) {
    this.employees$ = this.store.select(selectEmployees);
    this.positions$ = this.store.select(selectEmployeesPositions);
    this.loading$ = this.store.select(selectEmployeesLoadingState);
  }

  roleStats: RoleStat[] = [
    { id: 'duena', label: 'Dueña', icon: '👑', count: 0 },
    { id: 'encargado', label: 'Encargado', icon: '🛡️', count: 0 },
    { id: 'chef', label: 'Chef', icon: '👨‍🍳', count: 0 },
    { id: 'mesero', label: 'Mesero', icon: '🔧', count: 0 },
    { id: 'cajero', label: 'Cajero', icon: '💼', count: 0 },
    { id: 'repartidor', label: 'Repartidor', icon: '🚚', count: 0 }
  ];

  ngOnInit() {
    this.store.dispatch(EmployeesActions.loadEmployees());
    this.store.dispatch(EmployeesActions.loadPositions());

    this.subscriptions.add(
      this.positions$.subscribe(positions => {
        this.positions = positions;
        this.cdr.markForCheck();
      })
    );

    this.subscriptions.add(
      this.employees$.subscribe(employees => {
        this.mapEmployeesToUsers(employees);
        this.updateRoleStats();
        this.cdr.markForCheck();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private mapEmployeesToUsers(employees: Employee[]) {
    const positionToRoleMap: Record<string, UserRole> = {
      'admin': 'duena',
      'chef': 'chef',
      'waiter': 'mesero',
      'delivery': 'repartidor',
      'cashier': 'cajero'
    };

    this.users = employees.map(emp => {
      const fallbackPosition = this.positions.find(p => p.id === emp.position_id);
      const positionName = emp.position?.name || fallbackPosition?.name || '';
      const roleId = positionToRoleMap[positionName] || 'mesero';

      return {
        id: String(emp.id),
        name: emp.full_name,
        email: emp.email,
        phone: emp.phone,
        positionId: emp.position_id,
        positionName: emp.position?.display_name || emp.position?.name || fallbackPosition?.name,
        roleId: roleId,
        initials: this.generateInitials(emp.full_name),
        status: emp.active ? 'activo' : 'inactivo'
      };
    });
  }

  updateRoleStats() {
    // Reinicializar contadores
    this.roleStats.forEach(role => role.count = 0);

    // Contar usuarios por rol
    this.users.forEach(user => {
      const role = this.roleStats.find(r => r.id === user.roleId);
      if (role) {
        role.count++;
      }
    });
  }

  getRoleLabel(roleId: UserRole): string {
    const role = this.roleStats.find(r => r.id === roleId);
    return role ? role.label : '';
  }

  openUserForm(user: UserEmployee | null = null) {
    this.userBeingEdited = user;
    this.showUserFormModal = true;
  }

  closeUserForm() {
    this.showUserFormModal = false;
    this.userBeingEdited = null;
    this.cdr.markForCheck();
  }

  saveUser(formData: UserFormData) {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    if (this.userBeingEdited) {
      // Modo edición
      this.updateUserInStore(formData);
    } else {
      // Modo creación
      this.createUserInStore(formData);
    }
  }

  private createUserInStore(formData: UserFormData) {
    const position = this.getPositionByRole(formData.roleId as UserRole);
    if (!position) {
      alert('Posición no encontrada para el rol seleccionado');
      this.isSubmitting = false;
      return;
    }

    const newEmployee = {
      full_name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      position_id: position.id,
      active: true
    };

    this.store.dispatch(EmployeesActions.createEmployee({ employee: newEmployee }));

    this.movements.log({
      title: 'Usuario creado',
      description: `${formData.name} (${formData.email}) como ${this.getRoleLabel(formData.roleId as UserRole)}`,
      section: 'usuarios',
      status: 'success',
      actor: this.currentUser.name,
      role: this.currentUser.role
    });

    this.isSubmitting = false;
    this.closeUserForm();
  }

  private updateUserInStore(formData: UserFormData) {
    if (!this.userBeingEdited) return;

    const position = this.getPositionByRole(formData.roleId as UserRole);
    if (!position) {
      alert('Posición no encontrada para el rol seleccionado');
      this.isSubmitting = false;
      return;
    }

    const updateData = {
      full_name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      position_id: position.id
    };

    this.store.dispatch(
      EmployeesActions.updateEmployee({ employeeId: this.userBeingEdited.id, employee: updateData })
    );

    this.movements.log({
      title: 'Usuario actualizado',
      description: `${formData.name} ahora es ${this.getRoleLabel(formData.roleId as UserRole)}`,
      section: 'usuarios',
      status: 'success',
      actor: this.currentUser.name,
      role: this.currentUser.role
    });

    this.isSubmitting = false;
    this.closeUserForm();
  }

  private generateInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  deleteUser(userId: string) {
    if (!confirm('¿Está seguro de que desea eliminar este usuario?')) return;

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    this.store.dispatch(EmployeesActions.deleteEmployee({ employeeId: userId }));

    this.movements.log({
      title: 'Usuario eliminado',
      description: `Usuario con id ${userId} removido`,
      section: 'usuarios',
      status: 'warning',
      actor: this.currentUser.name,
      role: this.currentUser.role
    });

    this.isSubmitting = false;
  }

  private getPositionByRole(roleId: UserRole): StorePosition | undefined {
    const positionMap: Record<UserRole, string> = {
      'duena': 'admin',
      'chef': 'chef',
      'mesero': 'waiter',
      'repartidor': 'delivery',
      'cajero': 'cashier',
      'encargado': 'admin'
    };

    const positionName = positionMap[roleId];
    return this.positions.find(p => p.name === positionName);
  }
}
