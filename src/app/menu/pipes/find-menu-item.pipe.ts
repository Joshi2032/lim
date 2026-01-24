import { Pipe, PipeTransform } from '@angular/core';

export interface MenuItem {
  id: string;
  name: string;
  japaneseName?: string;
  description: string;
  price: number;
  image: string;
  badge?: { text: string; type: 'popular' | 'nuevo' | 'oferta' };
  category?: string;
}

@Pipe({
  name: 'findMenuItemPipe',
  standalone: true
})
export class FindMenuItemPipe implements PipeTransform {
  transform(menuItems: MenuItem[], itemId: string): MenuItem | undefined {
    return menuItems.find(item => item.id === itemId);
  }
}
