import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchInputComponent } from '../search-input/search-input.component';
import { SectionHeaderComponent } from '../section-header/section-header.component';

export type PeriodType = 'day' | 'month' | 'year';
export type OrderType = 'mesa' | 'entrega' | 'todos';

@Component({
  selector: 'app-income-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchInputComponent, SectionHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="filters-card">
      <app-section-header title="Filtros"></app-section-header>

      <div class="filters-grid">
        <div class="filter-group">
          <label>Período</label>
          <select [(ngModel)]="periodType" (change)="onPeriodTypeChange()" class="filter-select">
            <option value="day">Por Día</option>
            <option value="month">Por Mes</option>
            <option value="year">Por Año</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Tipo de Orden</label>
          <select [(ngModel)]="orderType" (change)="onOrderTypeChange()" class="filter-select">
            <option value="todos">Todos</option>
            <option value="mesa">Mesa</option>
            <option value="entrega">Entrega</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Fecha Inicio</label>
          <input
            type="date"
            [(ngModel)]="startDate"
            (change)="onDateChange()"
            class="filter-input">
        </div>

        <div class="filter-group">
          <label>Fecha Fin</label>
          <input
            type="date"
            [(ngModel)]="endDate"
            (change)="onDateChange()"
            class="filter-input">
        </div>

        <div class="filter-group search-group">
          <label>Buscar</label>
          <app-search-input
            placeholder="Orden, cliente, producto..."
            [(ngModel)]="searchQuery"
            (search)="onSearch()">
          </app-search-input>
        </div>

        <div class="filter-actions">
          <button class="export-btn" type="button" (click)="onExport()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Exportar CSV
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .filters-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      align-items: end;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 8px;

      label {
        font-size: 12px;
        font-weight: 600;
        color: #9ca3af;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    .search-group {
      grid-column: span 2;

      @media (max-width: 768px) {
        grid-column: span 1;
      }
    }

    .filter-select,
    .filter-input {
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #fff;
      font-size: 14px;
      transition: all 0.2s ease;

      &:focus {
        outline: none;
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(220, 38, 38, 0.5);
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
      }

      &:hover {
        border-color: rgba(255, 255, 255, 0.2);
      }
    }

    .filter-select {
      cursor: pointer;
    }

    .filter-actions {
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
    }

    .export-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 8px;
      color: #22c55e;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      svg {
        width: 16px;
        height: 16px;
      }

      &:hover {
        background: rgba(34, 197, 94, 0.25);
        border-color: rgba(34, 197, 94, 0.5);
        transform: translateY(-2px);
      }
    }

    @media (max-width: 1024px) {
      .filters-grid {
        grid-template-columns: 1fr;
      }

      .search-group {
        grid-column: span 1;
      }
    }
  `]
})
export class IncomeFiltersComponent {
  @Input() periodType: PeriodType = 'day';
  @Input() orderType: OrderType = 'todos';
  @Input() startDate: string = '';
  @Input() endDate: string = '';
  @Input() searchQuery: string = '';

  @Output() periodTypeChange = new EventEmitter<PeriodType>();
  @Output() orderTypeChange = new EventEmitter<OrderType>();
  @Output() dateChange = new EventEmitter<void>();
  @Output() search = new EventEmitter<void>();
  @Output() export = new EventEmitter<void>();

  onPeriodTypeChange() {
    this.periodTypeChange.emit(this.periodType);
  }

  onOrderTypeChange() {
    this.orderTypeChange.emit(this.orderType);
  }

  onDateChange() {
    this.dateChange.emit();
  }

  onSearch() {
    this.search.emit();
  }

  onExport() {
    this.export.emit();
  }
}
