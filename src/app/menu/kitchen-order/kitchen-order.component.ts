import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type OrderStatus = 'pendiente' | 'preparando' | 'listo' | 'servido';

export interface OrderItem {
	id: string;
	name: string;
	quantity: number;
}

export interface Order {
	id: string;
	tableNumber: number;
	tableName: string;
	items: OrderItem[];
	status: OrderStatus;
	startTime: Date;
	notes?: string;
}

@Component({
  selector: 'app-kitchen-order',
  imports: [CommonModule],
  templateUrl: './kitchen-order.component.html',
  styleUrl: './kitchen-order.component.scss'
})
export class KitchenOrderComponent implements OnInit, OnDestroy {
  @Input() id: string = '';
  @Input() tableNumber: number = 0;
  @Input() tableName: string = '';
  @Input() items: OrderItem[] = [];
  @Input() status: OrderStatus = 'pendiente';
  @Input() startTime: Date = new Date();
  @Input() notes?: string;

  @Output() statusChange = new EventEmitter<OrderStatus>();

  elapsedTime: number = 0;
  private interval: any;

  ngOnInit() {
    this.updateElapsedTime();
    this.interval = setInterval(() => this.updateElapsedTime(), 60000); // Actualizar cada minuto
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  updateElapsedTime() {
    const now = new Date();
    const diff = now.getTime() - this.startTime.getTime();
    this.elapsedTime = Math.round(diff / 60000); // Convertir a minutos
  }

  onStatusChange(newStatus: OrderStatus) {
    this.statusChange.emit(newStatus);
  }
}
