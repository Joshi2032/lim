import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { SectionHeaderComponent } from '../section-header/section-header.component';

export interface DataTableColumn {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  template?: any; // Para componentes custom
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent, SectionHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-card">
      @if (title) {
        <app-section-header [title]="title"></app-section-header>
      }

      <div class="table-container">
        @if (data.length > 0) {
          <table class="data-table">
            <thead>
              <tr>
                @for (column of columns; track column.key) {
                  <th [style.width]="column.width || 'auto'" [style.textAlign]="column.align || 'left'">
                    {{ column.header }}
                  </th>
                }
              </tr>
            </thead>
            <tbody>
              @for (row of data; track row.id || $index) {
                <tr>
                  @for (column of columns; track column.key) {
                    <td [style.textAlign]="column.align || 'left'">
                      @if (column.template) {
                        <ng-container [ngTemplateOutlet]="column.template" [ngTemplateOutletContext]="{ $implicit: row, column: column }"></ng-container>
                      } @else {
                        {{ row[column.key] }}
                      }
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        } @else {
          <app-empty-state
            [icon]="emptyIcon"
            [title]="emptyTitle"
            [description]="emptySubtitle">
          </app-empty-state>
        }
      </div>
    </div>

    <ng-template #defaultTemplate let-row let-column="column">
      {{ row[column.key] }}
    </ng-template>
  `,
  styles: [`
    :host {
      display: block;
    }

    .table-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .table-container {
      overflow-x: auto;
      border-radius: 8px;

      &::-webkit-scrollbar {
        height: 8px;
      }

      &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 4px;

        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      }
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;

      thead {
        background: rgba(255, 255, 255, 0.05);
        position: sticky;
        top: 0;
        z-index: 10;

        th {
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          color: #9ca3af;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
          white-space: nowrap;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
      }

      tbody {
        tr {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.2s ease;

          &:hover {
            background: rgba(255, 255, 255, 0.03);
          }

          &:last-child {
            border-bottom: none;
          }
        }

        td {
          padding: 16px;
          color: #e5e7eb;
          vertical-align: top;
        }
      }
    }

    @media (max-width: 768px) {
      .data-table {
        font-size: 12px;

        thead th,
        tbody td {
          padding: 10px 12px;
        }
      }
    }
  `]
})
export class DataTableComponent {
  @Input() data: any[] = [];
  @Input() columns: DataTableColumn[] = [];
  @Input() title: string = '';
  @Input() emptyTitle: string = 'Sin datos';
  @Input() emptySubtitle: string = 'No hay registros para mostrar';
  @Input() emptyIcon: 'user' | 'cart' | 'search' | 'inbox' | 'default' = 'search';

  getColumnTemplate(column: DataTableColumn, row: any) {
    return column.template ? column.template : null;
  }
}
