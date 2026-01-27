import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { SectionHeaderComponent } from '../section-header/section-header.component';

export interface BarChartData {
  label: string;
  value: number;
  percentage: number;
  subtitle?: string;
  color?: string;
}

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent, SectionHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chart-card">
      @if (title) {
        <app-section-header [title]="title"></app-section-header>
      }

      <div class="chart-container">
        @if (data.length > 0) {
          <div class="bar-chart">
            @for (item of data; track item.label) {
              <div class="bar-item">
                <div class="bar-wrapper" [style.--bar-color]="item.color || '#22c55e'">
                  <div
                    class="bar-fill"
                    [style.height.%]="item.percentage"
                    [title]="item.value | currency: 'MXN'">
                  </div>
                </div>
                <div class="bar-info">
                  <div class="bar-label">{{ item.label }}</div>
                  <div class="bar-value">{{ formatCurrency(item.value) }}</div>
                  @if (item.subtitle) {
                    <div class="bar-subtitle">{{ item.subtitle }}</div>
                  }
                </div>
              </div>
            }
          </div>
        } @else {
          <app-empty-state
            icon="inbox"
            title="No hay datos"
            [description]="emptyMessage">
          </app-empty-state>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .chart-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .chart-container {
      min-height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bar-chart {
      width: 100%;
      display: flex;
      gap: 12px;
      align-items: flex-end;
      justify-content: space-around;
      padding: 20px 0;
    }

    .bar-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      max-width: 100px;
    }

    .bar-wrapper {
      width: 100%;
      height: 250px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px 8px 0 0;
      display: flex;
      align-items: flex-end;
      overflow: hidden;
      position: relative;
    }

    .bar-fill {
      width: 100%;
      background: linear-gradient(180deg, var(--bar-color) 0%, color-mix(in srgb, var(--bar-color) 80%, black) 100%);
      border-radius: 8px 8px 0 0;
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;

      &:hover {
        opacity: 0.9;
      }
    }

    .bar-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      width: 100%;
    }

    .bar-label {
      font-size: 11px;
      color: #9ca3af;
      font-weight: 600;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    .bar-value {
      font-size: 13px;
      font-weight: 700;
      color: var(--bar-color);
      white-space: nowrap;
    }

    .bar-subtitle {
      font-size: 10px;
      color: #6b7280;
      white-space: nowrap;
    }

    @media (max-width: 1024px) {
      .bar-chart {
        overflow-x: auto;
        justify-content: flex-start;
        padding-bottom: 10px;
      }

      .bar-item {
        min-width: 80px;
      }
    }

    @media (max-width: 768px) {
      .bar-wrapper {
        height: 180px;
      }
    }
  `]
})
export class BarChartComponent {
  @Input() data: BarChartData[] = [];
  @Input() title: string = '';
  @Input() emptyMessage: string = 'No hay datos disponibles';

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  }
}
