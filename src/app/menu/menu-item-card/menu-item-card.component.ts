import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BadgeComponent } from '../../shared/badge/badge.component';

export interface MenuItem {
	id: string;
	name: string;
	japaneseName?: string;
	description: string;
	price: number;
	image: string;
	badge?: { text: string; type: 'popular' | 'nuevo' | 'oferta' };
}

@Component({
  selector: 'app-menu-item-card',
  imports: [BadgeComponent],
  templateUrl: './menu-item-card.component.html',
  styleUrl: './menu-item-card.component.scss'
})
export class MenuItemCardComponent {
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() japaneseName?: string;
  @Input() description: string = '';
  @Input() price: number = 0;
  @Input() image: string = '';
  @Input() badge?: { text: string; type: 'popular' | 'nuevo' | 'oferta' };

  @Output() add = new EventEmitter<string>();

  onAdd() {
    this.add.emit(this.id);
  }
}
