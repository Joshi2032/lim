import { Component, Input } from '@angular/core';

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

  get statusLabel(): string {
    const labels: Record<TableStatus, string> = {
      disponible: 'Disponible',
      ocupada: 'Ocupada',
      reservada: 'Reservada',
      limpieza: 'Limpieza'
    };
    return labels[this.status] || 'Desconocido';
  }
}
