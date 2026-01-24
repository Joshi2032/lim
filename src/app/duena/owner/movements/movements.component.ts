import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ActivityLog, ActivitySection, ActivityStatus, MovementsService } from '../../../shared/movements/movements.service';
import { FilterChipsComponent, FilterOption } from '../../../shared/filter-chips/filter-chips.component';
import { ActivityCardComponent } from '../../../shared/activity-card/activity-card.component';

@Component({
  selector: 'app-movements',
  standalone: true,
  imports: [CommonModule, FilterChipsComponent, ActivityCardComponent],
  templateUrl: './movements.component.html',
  styleUrl: './movements.component.scss'
})
export class MovementsComponent implements OnInit, OnDestroy {
  activeSection: ActivitySection | 'all' = 'all';
  activeStatus: ActivityStatus | 'all' = 'all';
  searchQuery: string = '';
  activityLog: ActivityLog[] = [];
  private sub?: Subscription;

  sectionOptions: FilterOption[] = [
    { id: 'all', label: 'Todos' },
    { id: 'menu', label: 'Menú' },
    { id: 'mesas', label: 'Mesas' },
    { id: 'cocina', label: 'Cocina' },
    { id: 'clientes', label: 'Clientes' },
    { id: 'entregas', label: 'Entregas' },
    { id: 'usuarios', label: 'Usuarios' }
  ];

  statusOptions: FilterOption[] = [
    { id: 'all', label: 'Todos' },
    { id: 'info', label: 'Info' },
    { id: 'success', label: 'Éxito' },
    { id: 'warning', label: 'Alerta' }
  ];

  constructor(private movements: MovementsService) {}

  ngOnInit() {
    this.movements.seedDemoData();
    this.sub = this.movements.getLogs().subscribe(logs => this.activityLog = logs);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  setSectionFilter(section: any) {
    this.activeSection = section as ActivitySection | 'all';
  }

  setStatusFilter(status: any) {
    this.activeStatus = status as ActivityStatus | 'all';
  }

  onSearch(query: string) {
    this.searchQuery = query.toLowerCase();
  }

  get filteredActivityLog() {
    return this.activityLog
      .filter(a => this.activeSection === 'all' || a.section === this.activeSection)
      .filter(a => this.activeStatus === 'all' || a.status === this.activeStatus)
      .filter(a => {
        if (!this.searchQuery.trim()) return true;
        const q = this.searchQuery;
        return (
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.actor.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q)
        );
      });
  }
}
