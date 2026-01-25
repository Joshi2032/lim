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
  private menuItems$ = new BehaviorSubject<MenuItem[]>([
    {
      id: '1',
      name: 'Ramune',
      japaneseName: 'ラムネ',
      description: 'Refresco japonés tradicional',
      price: 55,
      image: '/assets/placeholder.png',
      category: 'bebidas'
    },
    {
      id: '2',
      name: 'Sake Caliente',
      japaneseName: '熱燗',
      description: 'Sake tradicional japonés servido caliente',
      price: 89,
      image: '/assets/placeholder.png',
      category: 'bebidas',
      variants: [
        { id: 'v1', name: 'Sake Junmai' },
        { id: 'v2', name: 'Sake Ginjo' },
        { id: 'v3', name: 'Sake Daiginjo' }
      ]
    }
  ]);

  private combos$ = new BehaviorSubject<Combo[]>([
    {
      id: 'c1',
      name: 'Combo Romántico',
      japaneseName: 'ロマンティック・コンボ',
      description: 'Perfecto para dos',
      price: 449,
      image: '/assets/placeholder.png',
      badge: { text: 'Popular', type: 'popular' },
      category: 'combos',
      items: [
        { itemId: '1', quantity: 2 }
      ]
    }
  ]);

  constructor() {}

  getMenuItems(): Observable<MenuItem[]> {
    return this.menuItems$.asObservable();
  }

  getCombos(): Observable<Combo[]> {
    return this.combos$.asObservable();
  }

  addMenuItem(item: MenuItem): void {
    const items = this.menuItems$.value;
    this.menuItems$.next([...items, item]);
  }

  addCombo(combo: Combo): void {
    const combos = this.combos$.value;
    this.combos$.next([...combos, combo]);
  }

  updateMenuItem(id: string, item: Partial<MenuItem>): void {
    const items = this.menuItems$.value.map(i => i.id === id ? { ...i, ...item } : i);
    this.menuItems$.next(items);
  }

  updateCombo(id: string, combo: Partial<Combo>): void {
    const combos = this.combos$.value.map(c => c.id === id ? { ...c, ...combo } : c);
    this.combos$.next(combos);
  }

  deleteMenuItem(id: string): void {
    const items = this.menuItems$.value.filter(i => i.id !== id);
    this.menuItems$.next(items);
  }

  deleteCombo(id: string): void {
    const combos = this.combos$.value.filter(c => c.id !== id);
    this.combos$.next(combos);
  }
}
