import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

export interface CustomerListItem {
  id: string;
  initials: string;
  name: string;
  phone: string;
  email?: string;
}

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="customer-list-container">
      @if (customers && customers.length > 0) {
        <div class="customer-list">
          @for (customer of customers; track customer.id) {
            <div
              class="customer-item"
              [class.active]="selectedId === customer.id"
              (click)="selectCustomer(customer)">
              <div class="customer-avatar">{{ customer.initials }}</div>
              <div class="customer-info">
                <div class="customer-name">{{ customer.name }}</div>
                <div class="customer-phone">{{ customer.phone }}</div>
              </div>
            </div>
          }
        </div>
      } @else {
        <app-empty-state
          icon="user"
          title="No hay clientes"
          description="Agrega el primer cliente">
        </app-empty-state>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .customer-list-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .customer-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .customer-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.04);
        border-color: rgba(255, 255, 255, 0.15);
        transform: translateX(4px);
      }

      &.active {
        background: rgba(220, 38, 38, 0.1);
        border-color: rgba(220, 38, 38, 0.3);
      }
    }

    .customer-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
      color: white;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
    }

    .customer-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .customer-name {
      font-size: 14px;
      font-weight: 600;
      color: #f1f5f9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .customer-phone {
      font-size: 12px;
      color: #94a3b8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `]
})
export class CustomerListComponent {
  @Input() customers: CustomerListItem[] = [];
  @Input() selectedId?: string;
  @Output() customerSelected = new EventEmitter<CustomerListItem>();

  selectCustomer(customer: CustomerListItem) {
    this.customerSelected.emit(customer);
  }
}
