import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHeaderComponent } from '../section-header/section-header.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

export interface TopProduct {
  id: string;
  rank: number;
  name: string;
  quantity: number;
  color?: string;
}

@Component({
  selector: 'app-top-products-chart',
  standalone: true,
  imports: [CommonModule, SectionHeaderComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="products-container">
      @if (title) {
        <app-section-header [title]="title"></app-section-header>
      }

      @if (products && products.length > 0) {
        <div class="products-list">
          @for (product of products; track product.id) {
            <div class="product-item">
              <div class="product-rank" [style.background]="getRankColor(product.rank)">
                {{ product.rank }}
              </div>
              <div class="product-name">{{ product.name }}</div>
              <div class="product-bar-container">
                <div class="product-bar">
                  <div
                    class="bar-fill"
                    [style.width.%]="getPercentage(product.quantity)"
                    [style.--bar-color]="product.color || 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)'">
                  </div>
                </div>
              </div>
              <div class="product-quantity">{{ product.quantity }}</div>
            </div>
          }
        </div>
      } @else {
        <app-empty-state
          icon="inbox"
          title="Sin datos"
          description="No hay productos disponibles">
        </app-empty-state>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .products-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .products-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .product-item {
      display: grid;
      grid-template-columns: 40px 1fr 200px 60px;
      grid-gap: 12px;
      align-items: center;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.04);
        border-color: rgba(255, 255, 255, 0.15);
        transform: translateX(4px);
      }

      @media (max-width: 768px) {
        grid-template-columns: 35px 1fr 100px 50px;
        gap: 8px;
        padding: 10px 12px;
      }

      @media (max-width: 480px) {
        grid-template-columns: 32px 1fr 80px 40px;
        gap: 6px;
        padding: 8px;
      }
    }

    .product-rank {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      color: white;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

      @media (max-width: 768px) {
        width: 35px;
        height: 35px;
        font-size: 12px;
      }

      @media (max-width: 480px) {
        width: 32px;
        height: 32px;
        font-size: 11px;
      }
    }

    .product-name {
      font-size: 14px;
      font-weight: 600;
      color: #f1f5f9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;

      @media (max-width: 768px) {
        font-size: 13px;
      }

      @media (max-width: 480px) {
        font-size: 12px;
      }
    }

    .product-bar-container {
      display: flex;
      align-items: center;
      min-width: 0;
    }

    .product-bar {
      width: 100%;
      height: 24px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .bar-fill {
      height: 100%;
      background: var(--bar-color);
      transition: width 0.3s ease;
      display: flex;
      align-items: center;
      min-width: 2px;
    }

    .product-quantity {
      font-size: 14px;
      font-weight: 700;
      color: #f1f5f9;
      text-align: right;
      min-width: 60px;

      @media (max-width: 768px) {
        font-size: 13px;
        min-width: 50px;
      }

      @media (max-width: 480px) {
        font-size: 12px;
        min-width: 40px;
      }
    }
  `]
})
export class TopProductsChartComponent {
  @Input() products: TopProduct[] = [];
  @Input() title: string = '';

  private readonly rankColors = ['#ef4444', '#f97316', '#8b5cf6', '#3b82f6', '#10b981'];

  getRankColor(rank: number): string {
    return this.rankColors[rank - 1] || '#6b7280';
  }

  getPercentage(quantity: number): number {
    if (!this.products || this.products.length === 0) return 0;
    const maxQuantity = Math.max(...this.products.map(p => p.quantity));
    return (quantity / maxQuantity) * 100;
  }
}
