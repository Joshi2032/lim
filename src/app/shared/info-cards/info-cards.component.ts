import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface InfoCard {
  id?: string;
  title: string;
  value: string | number;
  description?: string;
  icon?: string;
  color?: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'pink';
  badge?: string;
  action?: { label: string; callback: () => void };
}

@Component({
  selector: 'app-info-cards',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cards-grid">
      @for (card of cards; track card.id || card.title) {
        <div class="card" [class]="card.color || 'blue'">
          @if (card.badge) {
            <div class="badge">{{ card.badge }}</div>
          }

          <div class="card-header">
            @if (card.icon) {
              <div class="icon">{{ card.icon }}</div>
            }
            <h3>{{ card.title }}</h3>
          </div>

          <div class="card-value">{{ card.value }}</div>

          @if (card.description) {
            <div class="card-description">{{ card.description }}</div>
          }

          @if (card.action) {
            <button class="card-action" (click)="card.action.callback()">
              {{ card.action.label }}
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
    }

    .card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
      position: relative;
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover {
        background: rgba(255, 255, 255, 0.04);
        transform: translateY(-4px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
      }

      &.blue {
        border-left: 4px solid #3b82f6;
        background: rgba(59, 130, 246, 0.05);

        &:hover {
          border-left-color: #60a5fa;
        }
      }

      &.green {
        border-left: 4px solid #22c55e;
        background: rgba(34, 197, 94, 0.05);

        &:hover {
          border-left-color: #4ade80;
        }
      }

      &.red {
        border-left: 4px solid #ef4444;
        background: rgba(239, 68, 68, 0.05);

        &:hover {
          border-left-color: #f87171;
        }
      }

      &.amber {
        border-left: 4px solid #f59e0b;
        background: rgba(245, 158, 11, 0.05);

        &:hover {
          border-left-color: #fbbf24;
        }
      }

      &.purple {
        border-left: 4px solid #a855f7;
        background: rgba(168, 85, 247, 0.05);

        &:hover {
          border-left-color: #c084fc;
        }
      }

      &.pink {
        border-left: 4px solid #ec4899;
        background: rgba(236, 72, 153, 0.05);

        &:hover {
          border-left-color: #f472b6;
        }
      }
    }

    .badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(34, 197, 94, 0.2);
      border: 1px solid rgba(34, 197, 94, 0.4);
      color: #22c55e;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;

      .icon {
        font-size: 24px;
      }

      h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: #f3f4f6;
      }
    }

    .card-value {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 8px;
    }

    .card-description {
      font-size: 13px;
      color: #9ca3af;
      margin-bottom: 12px;
    }

    .card-action {
      width: 100%;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
      }
    }

    @media (max-width: 768px) {
      .cards-grid {
        grid-template-columns: 1fr;
      }

      .card-value {
        font-size: 24px;
      }
    }
  `]
})
export class InfoCardsComponent {
  @Input() cards: InfoCard[] = [];
}
