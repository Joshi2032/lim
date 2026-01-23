import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatVariant = 'default' | 'red' | 'amber' | 'blue' | 'green' | 'purple';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss'
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value: string | number = '';
  @Input() subtitle = '';
  @Input() trendLabel = '';
  @Input() trendDirection: 'up' | 'down' | '' = '';
  @Input() iconSvg = '';
  @Input() variant: StatVariant = 'default';
}
