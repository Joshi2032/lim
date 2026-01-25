import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../badge/badge.component';

export interface ProductCardData {
  id: string;
  name: string;
  japaneseName?: string;
  description: string;
  price: number;
  category: string;
  image?: string;
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  template: `
    <div class="product-card">
      <div class="product-header">
        <div class="product-info">
          <h3>{{ product.name }}</h3>
          @if (product.japaneseName) {
            <p class="japanese">{{ product.japaneseName }}</p>
          }
        </div>
        <div class="product-price">\${{ product.price }}</div>
      </div>
      <p class="product-description">{{ product.description }}</p>
      <div class="product-category">
        <app-badge [text]="product.category" [type]="badgeType"></app-badge>
      </div>
      <div class="product-actions">
        <button class="btn-edit" (click)="edit.emit(product)">Editar</button>
        <button class="btn-delete" (click)="delete.emit(product.id)">Eliminar</button>
      </div>
    </div>
  `,
  styleUrl: './product-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardComponent {
  @Input() product!: ProductCardData;
  @Input() badgeType: 'popular' | 'nuevo' | 'oferta' = 'popular';
  @Output() edit = new EventEmitter<ProductCardData>();
  @Output() delete = new EventEmitter<string>();
}
