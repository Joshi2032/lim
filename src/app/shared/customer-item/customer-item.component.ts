import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CustomerItemData {
  id: string;
  name: string;
  phone: string;
  initials: string;
  addressCount: number;
}

@Component({
  selector: 'app-customer-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="customer-item"
      [class.active]="active"
      (click)="select.emit()">
      <div class="customer-avatar">
        <span>{{ customer.initials }}</span>
      </div>
      <div class="customer-info">
        <div class="customer-name">{{ customer.name }}</div>
        <div class="customer-phone">{{ customer.phone }}</div>
      </div>
      <div class="customer-badge">
        {{ customer.addressCount }} dir.
      </div>
    </div>
  `,
  styleUrl: './customer-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerItemComponent {
  @Input() customer!: CustomerItemData;
  @Input() active = false;
  @Output() select = new EventEmitter<void>();
}
