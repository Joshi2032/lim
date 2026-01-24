import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../../shared/sidebar/sidebar.component';
import { UserCardComponent } from '../../../shared/user-card/user-card.component';
import { UserFormComponent } from './user-form/user-form.component';

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

export interface RoleStat {
	id: UserRole;
	label: string;
	icon: string;
	count: number;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, SidebarComponent, UserCardComponent, UserFormComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  @Input() embedded: boolean = false;
  users: UserEmployee[] = [];
  cartCount: number = 0;
  showUserFormModal: boolean = false;
  userBeingEdited: UserEmployee | null = null;

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
    { id: 'entregas', label: 'Entregas', icon: '🚚', route: '/entregas' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { id: 'panel', label: 'Panel de Control', icon: '📈', route: '/panel-control' },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', route: '/usuarios', active: true }
  ];

  roleStats: RoleStat[] = [
    { id: 'duena', label: 'Dueña', icon: '👑', count: 0 },
    { id: 'encargado', label: 'Encargado', icon: '🛡️', count: 0 },
    { id: 'chef', label: 'Chef', icon: '👨‍🍳', count: 0 },
    { id: 'mesero', label: 'Mesero', icon: '🔧', count: 0 },
    { id: 'cajero', label: 'Cajero', icon: '💼', count: 0 },
    { id: 'repartidor', label: 'Repartidor', icon: '🚚', count: 0 }
  ];

  ngOnInit() {
    this.loadUsers();
    this.updateRoleStats();
  }

  loadUsers() {
    // Mock data - En producción vendrá del backend
    this.users = [
      {
        id: '1',
        name: 'Josue',
        email: 'joshi.c2032@gmail.com',
        phone: '55 1234 5678',
        roleId: 'duena',
        initials: 'J',
        status: 'activo'
      }
    ];
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
  }

  saveUser(formData: { name: string; email: string; password: string; roleId: string }) {
    if (this.userBeingEdited) {
      // Modo edición
      const userIndex = this.users.findIndex(u => u.id === this.userBeingEdited!.id);
      if (userIndex !== -1) {
        this.users[userIndex] = {
          ...this.users[userIndex],
          name: formData.name,
          email: formData.email,
          roleId: formData.roleId as UserRole,
          initials: formData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        };
      }
    } else {
      // Modo creación
      const newUser: UserEmployee = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        roleId: formData.roleId as UserRole,
        initials: formData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        status: 'activo'
      };
      this.users.push(newUser);
    }

    this.updateRoleStats();
    this.closeUserForm();
  }

  deleteUser(userId: string) {
    this.users = this.users.filter(u => u.id !== userId);
    this.updateRoleStats();
  }
}
