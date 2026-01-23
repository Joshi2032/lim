import { Component } from '@angular/core';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../shared/sidebar/sidebar.component';
import { TableCardComponent, Table, TableStatus } from '../table-card/table-card.component';

interface Filter {
	id: string;
	label: string;
	status?: TableStatus;
	icon?: string;
}

@Component({
  selector: 'app-tables',
  imports: [SidebarComponent, TableCardComponent],
  templateUrl: './tables.component.html',
  styleUrl: './tables.component.scss'
})
export class TablesComponent {
  selectedFilter: string = 'todas';
  cartCount: number = 0;

  currentUser: User = {
    name: 'Josue',
    role: 'Dueña',
    initials: 'J'
  };

  sidebarItems: SidebarMenuItem[] = [
    { id: 'menu', label: 'Menú', icon: '🍜', route: '/menu' },
    { id: 'mesas', label: 'Mesas', icon: '🪑', route: '/mesas', active: true },
    { id: 'cocina', label: 'Cocina', icon: '🍳', route: '/cocina' },
    { id: 'clientes', label: 'Clientes', icon: '👥', route: '/clientes' },
    { id: 'entregas', label: 'Entregas', icon: '🚚', route: '/entregas' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', route: '/usuarios' }
  ];

  filters: Filter[] = [
    { id: 'todas', label: 'Todas', icon: '📍' },
    { id: 'disponible', label: 'Disponibles', status: 'disponible' },
    { id: 'ocupada', label: 'Ocupadas', status: 'ocupada' },
    { id: 'reservada', label: 'Reservadas', status: 'reservada' },
    { id: 'limpieza', label: 'Limpieza', status: 'limpieza' }
  ];

  tables: Table[] = Array.from({ length: 12 }, (_, i) => ({
    id: `table-${i + 1}`,
    name: `Mesa ${i + 1}`,
    capacity: [2, 2, 4, 4, 6, 6, 8, 4, 2, 4, 6, 8][i],
    status: ['disponible', 'disponible', 'disponible', 'disponible', 'disponible', 'disponible', 'disponible', 'disponible', 'disponible', 'disponible', 'disponible', 'disponible'][i] as TableStatus
  }));

  get filteredTables(): Table[] {
    if (this.selectedFilter === 'todas') {
      return this.tables;
    }
    const filter = this.filters.find(f => f.id === this.selectedFilter);
    if (filter && filter.status) {
      return this.tables.filter(t => t.status === filter.status);
    }
    return this.tables;
  }

  onFilterChange(filterId: string) {
    this.selectedFilter = filterId;
  }

  getCountByStatus(status: TableStatus): number {
    return this.tables.filter(t => t.status === status).length;
  }

  handleLogout() {
    console.log('Logout');
  }
}
