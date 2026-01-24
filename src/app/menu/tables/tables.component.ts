import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../shared/sidebar/sidebar.component';
import { TableCardComponent, Table, TableStatus } from '../table-card/table-card.component';
import { MovementsService } from '../../shared/movements/movements.service';
import { FilterChipsComponent, FilterOption } from '../../shared/filter-chips/filter-chips.component';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { StatsGridComponent, SimpleStatItem } from '../../shared/stats-grid/stats-grid.component';

interface Filter {
	id: string;
	label: string;
	status?: TableStatus;
	icon?: string;
}

@Component({
  selector: 'app-tables',
  imports: [CommonModule, SidebarComponent, TableCardComponent, FilterChipsComponent, PageHeaderComponent, StatsGridComponent],
  templateUrl: './tables.component.html',
  styleUrl: './tables.component.scss'
})
export class TablesComponent {
  selectedFilter: string = 'todas';
  filterOptions: FilterOption[] = [
    { id: 'todas', label: 'Todas' },
    { id: 'disponible', label: 'Disponibles' },
    { id: 'ocupada', label: 'Ocupadas' },
    { id: 'reservada', label: 'Reservadas' },
    { id: 'limpieza', label: 'Limpieza' }
  ];
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
    { id: 'panel', label: 'Panel de Control', icon: '📈', route: '/panel-control' },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', route: '/usuarios' }
  ];

  constructor(private movements: MovementsService) {}

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

  get tableStats(): SimpleStatItem[] {
    return [
      { value: this.getCountByStatus('disponible'), label: 'Disponibles', status: 'disponible' },
      { value: this.getCountByStatus('ocupada'), label: 'Ocupadas', status: 'ocupada' },
      { value: this.getCountByStatus('reservada'), label: 'Reservadas', status: 'reservada' }
    ];
  }

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

  onFilterChange(filterId: any) {
    this.selectedFilter = filterId;

    const label = this.filters.find(f => f.id === filterId)?.label || filterId;
    this.movements.log({
      title: 'Vista de mesas filtrada',
      description: `Filtro aplicado: ${label}`,
      section: 'mesas',
      status: 'info',
      actor: this.currentUser.name,
      role: this.currentUser.role
    });
  }

  getCountByStatus(status: TableStatus): number {
    return this.tables.filter(t => t.status === status).length;
  }

  handleLogout() {
    console.log('Logout');
  }
}
