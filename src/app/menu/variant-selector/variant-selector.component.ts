import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItem, ItemVariant } from '../menu-item-card/menu-item-card.component';

@Component({
  selector: 'app-variant-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './variant-selector.component.html',
  styleUrl: './variant-selector.component.scss'
})
export class VariantSelectorComponent {
  @Input() isOpen: boolean = false;
  @Input() item: MenuItem | null = null;
  @Input() quantity: number = 1;

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{ item: MenuItem; variant: ItemVariant | null; quantity: number }>();

  selectedVariant: ItemVariant | null = null;

  onClose() {
    this.selectedVariant = null;
    this.close.emit();
  }

  onConfirm() {
    if (this.item) {
      this.confirm.emit({
        item: this.item,
        variant: this.selectedVariant,
        quantity: this.quantity
      });
      this.selectedVariant = null;
    }
  }

  selectVariant(variant: ItemVariant) {
    this.selectedVariant = variant;
  }
}
