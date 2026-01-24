import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SimpleStatItem {
  value: number | string;
  label: string;
  status?: 'pendiente' | 'preparando' | 'listo' | 'disponible' | 'ocupada' | 'reservada' | 'limpieza' | 'enCurso' | 'entregada';
}

@Component({
  selector: 'app-stats-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-grid">
      @for (stat of stats; track stat.label) {
        <div class="stat-card" [ngClass]="stat.status">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      }
    </div>
  `,
  styleUrl: './stats-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatsGridComponent {
  @Input() stats: SimpleStatItem[] = [];
}
