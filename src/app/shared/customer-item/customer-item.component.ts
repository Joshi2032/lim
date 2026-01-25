import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../avatar/avatar.component';
import { BadgeComponent } from '../badge/badge.component';

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
  imports: [CommonModule, AvatarComponent, BadgeComponent],
  template: `
    <div
      class="customer-item"
      [class.active]="active"
      (click)="select.emit()">
      <app-avatar
        [initials]="customer.initials"
        [name]="customer.name"
        size="medium"
        variant="primary">
      </app-avatar>
      <div class="customer-info">
        <div class="customer-name">{{ customer.name }}</div>
        <div class="customer-phone">{{ customer.phone }}</div>
      </div>
      <app-badge variant="default" size="small">
        {{ customer.addressCount }} dir.
      </app-badge>
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
