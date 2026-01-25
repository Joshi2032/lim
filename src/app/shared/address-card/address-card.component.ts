import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AddressData {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode?: string;
  reference?: string;
  isDefault: boolean;
}

@Component({
  selector: 'app-address-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './address-card.component.html',
  styleUrl: './address-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressCardComponent {
  @Input() address!: AddressData;
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() setDefault = new EventEmitter<void>();
}
