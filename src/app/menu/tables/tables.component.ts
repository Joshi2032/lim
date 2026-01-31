import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { MenuItem as SidebarMenuItem, User } from '../../shared/sidebar/sidebar.component';
import { TableCardComponent, Table, TableStatus } from '../table-card/table-card.component';
import { MovementsService } from '../../shared/movements/movements.service';
import { FilterChipsComponent, FilterOption } from '../../shared/filter-chips/filter-chips.component';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { StatsGridComponent, SimpleStatItem } from '../../shared/stats-grid/stats-grid.component';
import { Store } from '@ngrx/store';
import { RestaurantTable as SupabaseTable } from '../../core/services/supabase.service';
import * as TablesActions from '../../store/tables/tables.actions';
import { selectTables } from '../../store/tables/tables.selectors';

interface Filter {
	id: string;
	label: string;
	status?: TableStatus;
	icon?: string;
}

@Component({
  selector: 'app-tables',
  imports: [CommonModule, TableCardComponent, FilterChipsComponent, PageHeaderComponent, StatsGridComponent],
  templateUrl: './tables.component.html',
  styleUrl: './tables.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TablesComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  tables$: Observable<SupabaseTable[]>;
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
    { id: 'recogida', label: 'Recogida', icon: '🛍️', route: '/recogida' },
    { id: 'clientes', label: 'Clientes', icon: '👥', route: '/clientes' },
    { id: 'entregas', label: 'Entregas', icon: '🚚', route: '/entregas' },
    { id: 'pedidos', label: 'Pedidos', icon: '🧾', route: '/pedidos' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { id: 'panel', label: 'Panel de Control', icon: '📈', route: '/panel-control' },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', route: '/usuarios' }
  ];

  constructor(
    private movements: MovementsService,
    private store: Store,
    private cdr: ChangeDetectorRef
  ) {
    this.tables$ = this.store.select(selectTables);
  }

  filters: Filter[] = [
    { id: 'todas', label: 'Todas', icon: '📍' },
    { id: 'disponible', label: 'Disponibles', status: 'disponible' },
    { id: 'ocupada', label: 'Ocupadas', status: 'ocupada' },
    { id: 'reservada', label: 'Reservadas', status: 'reservada' },
    { id: 'limpieza', label: 'Limpieza', status: 'limpieza' }
  ];

  tables: Table[] = [];

  ngOnInit() {
    this.store.dispatch(TablesActions.loadTables());
    this.store.dispatch(TablesActions.subscribeToTables());

    this.subscriptions.add(
      this.tables$.subscribe(tables => {
        this.tables = tables.map(t => this.mapSupabaseTableToLocal(t));
        this.cdr.markForCheck();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // Data loading handled by NgRx store

  private mapSupabaseTableToLocal(supabaseTable: SupabaseTable): Table {
    const statusMap: { [key: string]: TableStatus } = {
      'available': 'disponible',
      'occupied': 'ocupada',
      'reserved': 'reservada',
      'cleaning': 'limpieza'
    };

    return {
      id: supabaseTable.id.toString(),
      name: `Mesa ${supabaseTable.table_number}`,
      capacity: supabaseTable.capacity,
      status: statusMap[supabaseTable.status] || 'disponible'
    };
  }

  private mapLocalStatusToSupabase(localStatus: TableStatus): 'available' | 'occupied' | 'reserved' | 'cleaning' {
    const statusMap: { [key: string]: 'available' | 'occupied' | 'reserved' | 'cleaning' } = {
      'disponible': 'available',
      'ocupada': 'occupied',
      'reservada': 'reserved',
      'limpieza': 'cleaning'
    };

    return statusMap[localStatus] || 'available';
  }

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
  }

  async onTableStatusChange(tableId: string, newStatus: TableStatus): Promise<void> {
    const table = this.tables.find(t => t.id === tableId);
    if (table) {
      const oldStatus = table.status;

      try {
        const supabaseStatus = this.mapLocalStatusToSupabase(newStatus);
        this.store.dispatch(TablesActions.updateTableStatus({ tableId, status: supabaseStatus }));

        this.movements.log({
          title: `Mesa actualizada a ${newStatus}`,
          description: `${table.name} · Cambió de ${oldStatus} a ${newStatus}`,
          section: 'mesas',
          status: 'success',
          actor: this.currentUser.name,
          role: this.currentUser.role
        });
      } catch (error) {
        console.error('❌ Error updating table status:', error);
        alert('Error al actualizar estado de mesa: ' + (error as any).message);
      }
    }
  }
}
