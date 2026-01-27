import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { SectionHeaderComponent } from '../section-header/section-header.component';

export interface IncomeRecord {
  id: string;
  date: Date;
  orderNumber: string;
  type: 'mesa' | 'entrega';
  items: string[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia';
  customer?: string;
}

@Component({
  selector: 'app-income-table',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent, SectionHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-card">
      <app-section-header title="Detalle de Transacciones"></app-section-header>

      <div class="table-container">
        @if (records.length > 0) {
          <table class="income-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Orden</th>
                <th>Tipo</th>
                <th>Items</th>
                <th>Subtotal</th>
                <th>IVA</th>
                <th>Total</th>
                <th>Pago</th>
                <th>Cliente</th>
              </tr>
            </thead>
            <tbody>
              @for (record of records; track record.id) {
                <tr>
                  <td class="date-col">{{ formatDate(record.date) }}</td>
                  <td class="order-col">{{ record.orderNumber }}</td>
                  <td>
                    <span class="type-badge" [class]="record.type">
                      {{ record.type === 'mesa' ? '🪑 Mesa' : '🚚 Entrega' }}
                    </span>
                  </td>
                  <td class="items-col">
                    <div class="items-list">
                      @for (item of record.items; track item) {
                        <span class="item-tag">{{ item }}</span>
                      }
                    </div>
                  </td>
                  <td class="amount-col">{{ formatCurrency(record.subtotal) }}</td>
                  <td class="amount-col tax">{{ formatCurrency(record.tax) }}</td>
                  <td class="amount-col total">{{ formatCurrency(record.total) }}</td>
                  <td>
                    <span class="payment-badge" [class]="record.paymentMethod">
                      {{ getPaymentMethodLabel(record.paymentMethod) }}
                    </span>
                  </td>
                  <td class="customer-col">{{ record.customer || '-' }}</td>
                </tr>
              }
            </tbody>
          </table>
        } @else {
          <app-empty-state
            icon="search"
            title="No se encontraron transacciones"
            subtitle="Intenta ajustar los filtros">
          </app-empty-state>
        }
      </div>
    </div>
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

    .income-table {
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

    .date-col {
      white-space: nowrap;
      color: #9ca3af;
      font-size: 12px;
    }

    .order-col {
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
    }

    .type-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;

      &.mesa {
        background: rgba(59, 130, 246, 0.15);
        border: 1px solid rgba(59, 130, 246, 0.3);
        color: #3b82f6;
      }

      &.entrega {
        background: rgba(245, 158, 11, 0.15);
        border: 1px solid rgba(245, 158, 11, 0.3);
        color: #f59e0b;
      }
    }

    .items-col {
      max-width: 300px;
    }

    .items-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .item-tag {
      display: inline-block;
      padding: 3px 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      font-size: 11px;
      color: #9ca3af;
      white-space: nowrap;
    }

    .amount-col {
      text-align: right;
      font-weight: 600;
      white-space: nowrap;

      &.tax {
        color: #9ca3af;
        font-weight: 500;
      }

      &.total {
        color: #22c55e;
        font-size: 14px;
      }
    }

    .payment-badge {
      display: inline-flex;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;

      &.efectivo {
        background: rgba(34, 197, 94, 0.15);
        border: 1px solid rgba(34, 197, 94, 0.3);
        color: #22c55e;
      }

      &.tarjeta {
        background: rgba(139, 92, 246, 0.15);
        border: 1px solid rgba(139, 92, 246, 0.3);
        color: #8b5cf6;
      }

      &.transferencia {
        background: rgba(59, 130, 246, 0.15);
        border: 1px solid rgba(59, 130, 246, 0.3);
        color: #3b82f6;
      }
    }

    .customer-col {
      color: #9ca3af;
      font-size: 12px;
    }

    @media (max-width: 768px) {
      .income-table {
        font-size: 12px;

        thead th,
        tbody td {
          padding: 10px 12px;
        }
      }
    }
  `]
})
export class IncomeTableComponent {
  @Input() records: IncomeRecord[] = [];

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  }

  getPaymentMethodLabel(method: 'efectivo' | 'tarjeta' | 'transferencia'): string {
    const labels = {
      efectivo: '💵 Efectivo',
      tarjeta: '💳 Tarjeta',
      transferencia: '🏦 Transferencia'
    };
    return labels[method];
  }
}
