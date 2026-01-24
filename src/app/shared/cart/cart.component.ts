import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CartItem {
	id: string;
	name: string;
	price: number;
	quantity: number;
	variant?: { id: string; name: string; price?: number }; // Variante seleccionada
}

@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  @Input() isOpen: boolean = false;
  @Input() items: CartItem[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() itemsChange = new EventEmitter<CartItem[]>();

  get total(): number {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  onClose() {
    this.close.emit();
  }

  increaseQuantity(itemId: string) {
    const item = this.items.find(i => i.id === itemId);
    if (item) {
      item.quantity++;
      this.itemsChange.emit(this.items);
    }
  }

  decreaseQuantity(itemId: string) {
    const item = this.items.find(i => i.id === itemId);
    if (item && item.quantity > 1) {
      item.quantity--;
      this.itemsChange.emit(this.items);
    }
  }

  removeItem(itemId: string) {
    this.items = this.items.filter(i => i.id !== itemId);
    this.itemsChange.emit(this.items);
  }
}
