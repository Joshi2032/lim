import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type IconButtonVariant = 'default' | 'danger' | 'primary';

@Component({
  selector: 'app-icon-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="icon-btn"
      [class]="variant"
      [type]="type"
      [title]="title"
      [disabled]="disabled"
      (click)="clicked.emit()">
      <ng-content></ng-content>
    </button>
  `,
  styleUrl: './icon-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconButtonComponent {
  @Input() variant: IconButtonVariant = 'default';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() title = '';
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<void>();
}
