import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartItem } from '../models/cart.model';

@Component({
  selector: 'app-checkout-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-modal.component.html',
  styleUrls: ['./checkout-modal.component.scss']
})
export class CheckoutModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() items: CartItem[] = [];
  @Output() confirm = new EventEmitter<{ items: CartItem[]; notes: string }>();
  @Output() cancel = new EventEmitter<void>();

  notes = '';
  total = 0;

  ngOnInit() {
    this.calculateTotal();
  }

  ngOnChanges() {
    this.calculateTotal();
  }

  calculateTotal() {
    this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  onConfirm() {
    this.confirm.emit({
      items: this.items,
      notes: this.notes.trim()
    });
    this.notes = '';
  }

  onCancel() {
    this.cancel.emit();
    this.notes = '';
  }
}
