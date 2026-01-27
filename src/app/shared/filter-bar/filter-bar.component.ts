import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterOption {
  value: string | number;
  label: string;
}

export interface FilterField {
  name: string;
  label: string;
  type: 'select' | 'date' | 'text' | 'number' | 'search';
  options?: FilterOption[];
  placeholder?: string;
  gridSpan?: number;
}

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="filter-bar">
      <div class="filters-grid">
        @for (field of fields; track field.name) {
          <div class="filter-field" [style.gridColumn]="'span ' + (field.gridSpan || 1)">
            <label>{{ field.label }}</label>

            @switch (field.type) {
              @case ('select') {
                <select
                  [(ngModel)]="filterValues[field.name]"
                  (change)="onFilterChange()"
                  class="filter-input">
                  <option value="">Todos</option>
                  @for (option of field.options; track option.value) {
                    <option [value]="option.value">{{ option.label }}</option>
                  }
                </select>
              }
              @case ('date') {
                <input
                  type="date"
                  [(ngModel)]="filterValues[field.name]"
                  (change)="onFilterChange()"
                  class="filter-input">
              }
              @case ('number') {
                <input
                  type="number"
                  [(ngModel)]="filterValues[field.name]"
                  [placeholder]="field.placeholder || ''"
                  (change)="onFilterChange()"
                  class="filter-input">
              }
              @case ('search') {
                <input
                  type="text"
                  [(ngModel)]="filterValues[field.name]"
                  [placeholder]="field.placeholder || 'Buscar...'"
                  (input)="onFilterChange()"
                  class="filter-input">
              }
              @case ('text') {
                <input
                  type="text"
                  [(ngModel)]="filterValues[field.name]"
                  [placeholder]="field.placeholder || ''"
                  (change)="onFilterChange()"
                  class="filter-input">
              }
            }
          </div>
        }

        @if (showResetButton) {
          <div class="filter-actions">
            <button class="reset-btn" type="button" (click)="resetFilters()">
              ↻ Limpiar
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .filter-bar {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      align-items: end;
    }

    .filter-field {
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

      &::placeholder {
        color: #6b7280;
      }
    }

    select.filter-input {
      cursor: pointer;
    }

    .filter-actions {
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
    }

    .reset-btn {
      padding: 10px 20px;
      background: rgba(220, 38, 38, 0.15);
      border: 1px solid rgba(220, 38, 38, 0.3);
      border-radius: 8px;
      color: #ef4444;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(220, 38, 38, 0.25);
        border-color: rgba(220, 38, 38, 0.5);
        transform: translateY(-2px);
      }
    }

    @media (max-width: 768px) {
      .filters-grid {
        grid-template-columns: 1fr;
      }

      .filter-actions {
        justify-content: flex-start;
      }
    }
  `]
})
export class FilterBarComponent implements OnInit {
  @Input() fields: FilterField[] = [];
  @Input() showResetButton: boolean = true;
  @Output() filterChange = new EventEmitter<Record<string, any>>();

  filterValues: Record<string, any> = {};

  ngOnInit() {
    this.initializeFilters();
  }

  private initializeFilters() {
    this.fields.forEach(field => {
      this.filterValues[field.name] = '';
    });
  }

  onFilterChange() {
    this.filterChange.emit(this.filterValues);
  }

  resetFilters() {
    this.initializeFilters();
    this.filterChange.emit(this.filterValues);
  }
}
