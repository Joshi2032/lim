import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconButtonComponent } from '../icon-button/icon-button.component';

export type ModalSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, IconButtonComponent],
  template: `
    @if (isOpen) {
      <div class="modal-overlay" (click)="onOverlayClick()">
        <div class="modal-content" [class]="'modal-' + size" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ title }}</h2>
            <app-icon-button
              (clicked)="close.emit()"
              [title]="'Cerrar ' + title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </app-icon-button>
          </div>

          <div class="modal-body">
            <ng-content></ng-content>
          </div>

          @if (showFooter) {
            <div class="modal-footer">
              <button class="btn-secondary" type="button" (click)="close.emit()">
                {{ cancelText }}
              </button>
              <button class="btn-primary" type="button" (click)="confirm.emit()" [disabled]="confirmDisabled">
                {{ confirmText }}
              </button>
            </div>
          }
        </div>
      </div>
    }
  `,
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() size: ModalSize = 'medium';
  @Input() showFooter = true;
  @Input() cancelText = 'Cancelar';
  @Input() confirmText = 'Guardar';
  @Input() confirmDisabled = false;
  @Input() closeOnOverlayClick = true;

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onOverlayClick(): void {
    if (this.closeOnOverlayClick) {
      this.close.emit();
    }
  }
}
