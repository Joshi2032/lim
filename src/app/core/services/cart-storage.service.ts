import { Injectable } from '@angular/core';
import { CartItem } from '../../shared/cart/cart.component';

@Injectable({
  providedIn: 'root'
})
export class CartStorageService {
  private readonly CART_KEY = 'restaurant_cart';

  saveCart(items: CartItem[]): void {
    try {
      localStorage.setItem(this.CART_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  loadCart(): CartItem[] {
    try {
      const stored = localStorage.getItem(this.CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  }

  clearCart(): void {
    try {
      localStorage.removeItem(this.CART_KEY);
    } catch (error) {
      console.error('Error clearing cart from localStorage:', error);
    }
  }

  getCartCount(): number {
    const items = this.loadCart();
    return items.reduce((count, item) => count + item.quantity, 0);
  }
}
