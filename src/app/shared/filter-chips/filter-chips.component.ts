import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FilterOption {
  id: string | number;
  label: string;
}

@Component({
  selector: 'app-filter-chips',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="filter-chips" [class.status]="status">
      <span class="chip-label">{{ label }}</span>
      <button
        *ngFor="let option of options"
        class="chip"
        [class.active]="isActive(option.id)"
        (click)="selectOption(option.id)">
        {{ option.label }}
      </button>
    </div>
  `,
  styleUrl: './filter-chips.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterChipsComponent {
  @Input() label: string = '';
  @Input() options: FilterOption[] = [];
  @Input() selectedId: string | number | null = null;
  @Input() status: boolean = false;
  @Output() optionSelected = new EventEmitter<string | number>();

  isActive(optionId: string | number): boolean {
    return this.selectedId === optionId;
  }

  selectOption(optionId: string | number) {
    this.optionSelected.emit(optionId);
  }
}
