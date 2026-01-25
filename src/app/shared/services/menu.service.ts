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
    },
    {
      id: '3',
      name: 'Sake Frío Premium',
      japaneseName: '冷酒',
      description: 'Sake Junmai Daiginjo',
      price: 149,
      image: '/assets/placeholder.png',
      badge: { text: 'Popular', type: 'popular' },
      category: 'bebidas',
      variants: [
        { id: 'v1', name: 'Copa pequeña' },
        { id: 'v2', name: 'Copa estándar' },
        { id: 'v3', name: 'Botella (750ml)' }
      ]
    },
    {
      id: '4',
      name: 'Té Verde',
      japaneseName: '緑茶',
      description: 'Té verde japonés tradicional',
      price: 45,
      image: '/assets/placeholder.png',
      category: 'bebidas'
    },
    {
      id: '5',
      name: 'Omakase del Chef',
      japaneseName: 'おまかせ',
      description: 'Selección especial del chef (10 piezas)',
      price: 459,
      image: '/assets/placeholder.png',
      category: 'especiales',
      variants: [
        { id: 'v1', name: 'Selección Pescados' },
        { id: 'v2', name: 'Selección Mariscos' },
        { id: 'v3', name: 'Selección Mixta' }
      ]
    },
    {
      id: '6',
      name: 'Bento Box Deluxe',
      japaneseName: '弁当箱',
      description: 'Sashimi, tempura, arroz, ensalada y sopa miso',
      price: 349,
      image: '/assets/placeholder.png',
      badge: { text: 'Popular', type: 'popular' },
      category: 'especiales',
      variants: [
        { id: 'v1', name: 'Con Sashimi' },
        { id: 'v2', name: 'Con Tempura' },
        { id: 'v3', name: 'Mixto (Recomendado)' }
      ]
    },
    {
      id: '7',
      name: 'Chirashi Bowl',
      japaneseName: 'ちらし丼',
      description: 'Arroz con variedad de pescados frescos encima',
      price: 259,
      image: '/assets/placeholder.png',
      badge: { text: 'Nuevo', type: 'nuevo' },
      category: 'especiales',
      variants: [
        { id: 'v1', name: 'Maguro (Atún)' },
        { id: 'v2', name: 'Sake (Salmón)' },
        { id: 'v3', name: 'Mixto' }
      ]
    },
    {
      id: '8',
      name: 'Nigiri de Anguila',
      japaneseName: 'うなぎ握り',
      description: 'Dos piezas de anguila glaseada',
      price: 109,
      image: '/assets/placeholder.png',
      category: 'nigiri'
    }
  ]);

  private combos$ = new BehaviorSubject<Combo[]>([
    {
      id: 'c1',
      name: 'Combo Romántico',
      japaneseName: 'ロマンティック・コンボ',
      description: 'Perfecto para dos: Chirashi Bowl + Sake Frío Premium + Té Verde',
      price: 449,
      image: '/assets/placeholder.png',
      badge: { text: 'Popular', type: 'popular' },
      category: 'combos',
      items: [
        { itemId: '7', quantity: 2 },
        { itemId: '3', quantity: 2 },
        { itemId: '4', quantity: 2 }
      ]
    },
    {
      id: 'c2',
      name: 'Combo Ejecutivo',
      japaneseName: 'エグゼクティブ・コンボ',
      description: 'Almuerzo completo: Omakase del Chef + Sake Caliente + Ramune',
      price: 599,
      image: '/assets/placeholder.png',
      badge: { text: 'Nuevo', type: 'nuevo' },
      category: 'combos',
      items: [
        { itemId: '5', quantity: 1 },
        { itemId: '2', quantity: 1 },
        { itemId: '1', quantity: 1 }
      ]
    },
    {
      id: 'c3',
      name: 'Combo Familia',
      japaneseName: 'ファミリー・コンボ',
      description: 'Para 4 personas: 2x Bento Box + Omakase + 4x Bebidas variadas',
      price: 1299,
      image: '/assets/placeholder.png',
      category: 'combos',
      items: [
        { itemId: '6', quantity: 2 },
        { itemId: '5', quantity: 1 },
        { itemId: '1', quantity: 2 },
        { itemId: '3', quantity: 2 }
      ]
    },
    {
      id: 'c4',
      name: 'Combo Degustación',
      japaneseName: 'テイスティング・コンボ',
      description: 'Prueba lo mejor: Omakase + Bento Box + Chirashi + Sake Premium',
      price: 989,
      image: '/assets/placeholder.png',
      category: 'combos',
      items: [
        { itemId: '5', quantity: 1 },
        { itemId: '6', quantity: 1 },
        { itemId: '7', quantity: 1 },
        { itemId: '3', quantity: 1 }
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
