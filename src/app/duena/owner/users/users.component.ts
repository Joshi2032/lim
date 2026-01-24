import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../../shared/sidebar/sidebar.component';
import { UserCardComponent } from '../../../shared/user-card/user-card.component';

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
  imports: [CommonModule, SidebarComponent, UserCardComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  @Input() embedded: boolean = false;
  users: UserEmployee[] = [];
  cartCount: number = 0;
  showNewUserModal: boolean = false;
  newUserForm!: FormGroup;

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
    this.initializeForm();
  }

  initializeForm() {
    this.newUserForm = new FormBuilder().group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      roleId: ['', [Validators.required]]
    });
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

  openNewUserModal() {
    this.showNewUserModal = true;
    this.newUserForm.reset();
  }

  closeNewUserModal() {
    this.showNewUserModal = false;
    this.newUserForm.reset();
  }

  createUser() {
    if (this.newUserForm.invalid) return;

    const formValue = this.newUserForm.value;
    const newUser: UserEmployee = {
      id: Date.now().toString(),
      name: formValue.name,
      email: formValue.email,
      roleId: formValue.roleId,
      initials: formValue.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
      status: 'activo'
    };

    this.users.push(newUser);
    this.updateRoleStats();
    this.closeNewUserModal();
  }

  editUser(user: UserEmployee) {
    console.log('Editar usuario:', user);
    // TODO: Implementar modal de edición
  }

  deleteUser(userId: string) {
    this.users = this.users.filter(u => u.id !== userId);
    this.updateRoleStats();
  }
}
