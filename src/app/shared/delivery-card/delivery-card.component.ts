import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type DeliveryCardStatus = 'pendiente' | 'enCurso' | 'entregada';

export interface DeliveryCardData {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  orderNumber: string;
  total: number;
  status: DeliveryCardStatus;
  notes?: string;
}

@Component({
  selector: 'app-delivery-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './delivery-card.component.html',
  styleUrl: './delivery-card.component.scss'
})
export class DeliveryCardComponent {
  @Input({ required: true }) delivery!: DeliveryCardData;
  @Input() statusLabel = '';

  @Output() statusChange = new EventEmitter<DeliveryCardStatus>();

  markInCourse() {
    this.statusChange.emit('enCurso');
  }

  markDelivered() {
    this.statusChange.emit('entregada');
  }
}
