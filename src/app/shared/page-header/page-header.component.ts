import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PageAction {
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div class="header-title">
        <h1>{{ title }}
          @if (japaneseName) {
            <span class="japanese-text">{{ japaneseName }}</span>
          }
        </h1>
        @if (subtitle) {
          <p class="header-subtitle">{{ subtitle }}</p>
        }
      </div>
      @if (action) {
        <button class="action-btn" (click)="onActionClick()">
          @if (action.icon) {
            <span class="action-icon">{{ action.icon }}</span>
          }
          {{ action.label }}
        </button>
      }
    </div>
  `,
  styleUrl: './page-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() japaneseName?: string;
  @Input() subtitle?: string;
  @Input() action?: PageAction;
  @Output() actionClick = new EventEmitter<void>();

  onActionClick() {
    this.actionClick.emit();
  }
}
