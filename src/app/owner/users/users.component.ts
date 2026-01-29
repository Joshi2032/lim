import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../shared/sidebar/sidebar.component';
import { UserCardComponent } from '../../shared/user-card/user-card.component';
import { UserFormComponent, UserFormData, RoleOption } from '../../shared/user-form/user-form.component';
import { PageHeaderComponent, PageAction } from '../../shared/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { MovementsService } from '../../shared/movements/movements.service';
import { SupabaseService } from '../../core/services/supabase.service';

export type UserRole = 'duena' | 'encargado' | 'chef' | 'mesero' | 'cajero' | 'repartidor';

export interface UserEmployee {
	id: string;
	name: string;
	email: string;
	phone?: string;
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
export class UsersComponent implements OnInit {
  private isSubmitting = false;
  @Input() embedded: boolean = false;
  users: UserEmployee[] = [];
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
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  roleStats: RoleStat[] = [
    { id: 'duena', label: 'Dueña', icon: '👑', count: 0 },
    { id: 'encargado', label: 'Encargado', icon: '🛡️', count: 0 },
    { id: 'chef', label: 'Chef', icon: '👨‍🍳', count: 0 },
    { id: 'mesero', label: 'Mesero', icon: '🔧', count: 0 },
    { id: 'cajero', label: 'Cajero', icon: '💼', count: 0 },
    { id: 'repartidor', label: 'Repartidor', icon: '🚚', count: 0 }
  ];

  ngOnInit() {
    this.loadUsersFromSupabase();
    this.updateRoleStats();
  }

  async loadUsersFromSupabase() {
    try {
      console.log('📋 Loading employees from Supabase...');
      const employees = await this.supabase.getEmployees();
      this.users = employees.map(emp => {
        // Map role from employee role to UserRole
        const roleMap: Record<string, UserRole> = {
          'admin': 'duena',
          'chef': 'chef',
          'waiter': 'mesero',
          'delivery': 'repartidor',
          'cashier': 'cajero'
        };

        return {
          id: emp.id,
          name: emp.full_name,
          email: emp.email,
          phone: emp.phone,
          roleId: roleMap[emp.role] || 'mesero',
          initials: this.generateInitials(emp.full_name),
          status: emp.active ? 'activo' : 'inactivo'
        };
      });
      console.log('✅ Employees loaded:', this.users);
      this.cdr.markForCheck();
    } catch (error) {
      console.error('❌ Error loading employees:', error);
      alert('Error al cargar empleados: ' + (error as any).message);
    }
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
      this.updateUserInSupabase(formData);
    } else {
      // Modo creación
      this.createUserInSupabase(formData);
    }
  }

  private async createUserInSupabase(formData: UserFormData) {
    try {
      console.log('📝 Creating employee:', formData.name);

      // Map UserRole to Employee role
      const roleMap: Record<UserRole, string> = {
        'duena': 'admin',
        'chef': 'chef',
        'mesero': 'waiter',
        'repartidor': 'delivery',
        'cajero': 'cashier',
        'encargado': 'admin'
      };

      const newEmployee = {
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        role: roleMap[formData.roleId as UserRole] as 'admin' | 'chef' | 'waiter' | 'delivery' | 'cashier',
        active: true
      };

      const createdEmployee = await this.supabase.createEmployee(newEmployee);

      const newUser: UserEmployee = {
        id: createdEmployee.id,
        name: createdEmployee.full_name,
        email: createdEmployee.email,
        phone: createdEmployee.phone,
        roleId: formData.roleId as UserRole,
        initials: this.generateInitials(createdEmployee.full_name),
        status: createdEmployee.active ? 'activo' : 'inactivo'
      };

      this.users.push(newUser);
      console.log('✅ Employee created:', newUser);
      this.cdr.markForCheck();

      this.movements.log({
        title: 'Usuario creado',
        description: `${formData.name} (${formData.email}) como ${this.getRoleLabel(formData.roleId as UserRole)}`,
        section: 'usuarios',
        status: 'success',
        actor: this.currentUser.name,
        role: this.currentUser.role
      });
    } catch (error) {
      console.error('❌ Error creating employee:', error);
      alert('Error al crear usuario: ' + (error as any).message);
    } finally {
      this.isSubmitting = false;
      this.updateRoleStats();
      this.closeUserForm();
    }
  }

  private async updateUserInSupabase(formData: UserFormData) {
    if (!this.userBeingEdited) return;

    try {
      console.log('✏️ Updating employee:', formData.name);

      // Map UserRole to Employee role
      const roleMap: Record<UserRole, string> = {
        'duena': 'admin',
        'chef': 'chef',
        'mesero': 'waiter',
        'repartidor': 'delivery',
        'cajero': 'cashier',
        'encargado': 'admin'
      };

      const updateData = {
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        role: roleMap[formData.roleId as UserRole] as 'admin' | 'chef' | 'waiter' | 'delivery' | 'cashier'
      };

      await this.supabase.updateEmployee(this.userBeingEdited.id, updateData);

      const userIndex = this.users.findIndex(u => u.id === this.userBeingEdited!.id);
      if (userIndex !== -1) {
        this.users[userIndex] = {
          ...this.users[userIndex],
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          roleId: formData.roleId as UserRole,
          initials: this.generateInitials(formData.name)
        };
      }
      this.cdr.markForCheck();

      console.log('✅ Employee updated');

      this.movements.log({
        title: 'Usuario actualizado',
        description: `${formData.name} ahora es ${this.getRoleLabel(formData.roleId as UserRole)}`,
        section: 'usuarios',
        status: 'success',
        actor: this.currentUser.name,
        role: this.currentUser.role
      });
    } catch (error) {
      console.error('❌ Error updating employee:', error);
      alert('Error al actualizar usuario: ' + (error as any).message);
    } finally {
      this.isSubmitting = false;
      this.updateRoleStats();
      this.closeUserForm();
    }
  }

  private generateInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  async deleteUser(userId: string) {
    if (!confirm('¿Está seguro de que desea eliminar este usuario?')) return;

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    try {
      console.log('🗑️ Deleting employee:', userId);
      await this.supabase.deleteEmployee(userId);

      this.users = this.users.filter(u => u.id !== userId);
      console.log('✅ Employee deleted');

      this.movements.log({
        title: 'Usuario eliminado',
        description: `Usuario con id ${userId} removido`,
        section: 'usuarios',
        status: 'warning',
        actor: this.currentUser.name,
        role: this.currentUser.role
      });
    } catch (error) {
      console.error('❌ Error deleting employee:', error);
      alert('Error al eliminar usuario: ' + (error as any).message);
    } finally {
      this.isSubmitting = false;
      this.updateRoleStats();
    }
  }
}
