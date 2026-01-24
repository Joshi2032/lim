import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityLog } from '../movements/movements.service';

@Component({
  selector: 'app-activity-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="movement-card" [class]="item.status">
      <div class="movement-main">
        <div class="movement-title">{{ item.title }}</div>
        <div class="movement-description">{{ item.description }}</div>
      </div>
      <div class="movement-meta">
        <span class="badge" [class]="item.section">{{ item.section }}</span>
        <span class="actor">{{ item.actor }} · {{ item.role }}</span>
        <span class="time">{{ item.timestamp | date:'shortTime' }}</span>
      </div>
    </div>
  `,
  styleUrl: './activity-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityCardComponent {
  @Input() item!: ActivityLog;
}
