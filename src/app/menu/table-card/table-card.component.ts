import { Component, Input, Output, EventEmitter } from '@angular/core';

export type TableStatus = 'disponible' | 'ocupada' | 'reservada' | 'limpieza';

export interface Table {
	id: string;
	name: string;
	capacity: number;
	status: TableStatus;
}

@Component({
  selector: 'app-table-card',
  imports: [],
  templateUrl: './table-card.component.html',
  styleUrl: './table-card.component.scss'
})
export class TableCardComponent {
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() capacity: number = 2;
  @Input() status: TableStatus = 'disponible';
  @Output() statusChanged = new EventEmitter<TableStatus>();

  private readonly statusCycle: TableStatus[] = ['disponible', 'ocupada', 'reservada', 'limpieza'];

  get statusLabel(): string {
    const labels: Record<TableStatus, string> = {
      disponible: 'Disponible',
      ocupada: 'Ocupada',
      reservada: 'Reservada',
      limpieza: 'Limpieza'
    };
    return labels[this.status] || 'Desconocido';
  }

  onStatusClick(): void {
    const currentIndex = this.statusCycle.indexOf(this.status);
    const nextIndex = (currentIndex + 1) % this.statusCycle.length;
    const newStatus = this.statusCycle[nextIndex];
    this.statusChanged.emit(newStatus);
  }
}
