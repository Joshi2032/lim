import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MenuItem {
  id: string;
  name: string;
  japaneseName?: string;
  description: string;
  price: number;
  image: string;
  category: string;
  variants?: { id: string; name: string }[];
  badge?: { text: string; type: 'popular' | 'nuevo' | 'oferta' };
}

export interface ComboItem {
  itemId: string;
  quantity: number;
}

export interface Combo {
  id: string;
  name: string;
  japaneseName?: string;
  description: string;
  price: number;
  image: string;
  items: ComboItem[];
  badge?: { text: string; type: 'popular' | 'nuevo' | 'oferta' };
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  // Data comes from Supabase now - empty subjects
  private menuItems$ = new BehaviorSubject<MenuItem[]>([]);
  private combos$ = new BehaviorSubject<Combo[]>([]);

  constructor() {}

  getMenuItems(): Observable<MenuItem[]> {
    return this.menuItems$.asObservable();
  }

  getCombos(): Observable<Combo[]> {
    return this.combos$.asObservable();
  }

  // Deprecated - use SupabaseService instead
  addMenuItem(item: MenuItem): void {}
  addCombo(combo: Combo): void {}
  updateMenuItem(id: string, item: Partial<MenuItem>): void {}
  updateCombo(id: string, combo: Partial<Combo>): void {}
  deleteMenuItem(id: string): void {}
  deleteCombo(id: string): void {}
}
