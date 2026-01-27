import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHeaderComponent } from '../section-header/section-header.component';

@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [CommonModule, SectionHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chart-card">
      @if (title) {
        <app-section-header [title]="title"></app-section-header>
      }

      <div class="chart-content">
        <ng-content></ng-content>
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

    .chart-content {
      min-height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class ChartCardComponent {
  @Input() title: string = '';
}
