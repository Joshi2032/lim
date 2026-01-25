import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'popular' | 'nuevo' | 'oferta' | 'default' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'small' | 'medium';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeComponent {
  @Input() text: string = ''; // Para compatibilidad con uso antiguo
  @Input() type: BadgeVariant = 'popular'; // Alias de variant
  @Input() variant: BadgeVariant = 'popular'; // Nuevo input preferido
  @Input() size: BadgeSize = 'medium';

  get effectiveVariant(): BadgeVariant {
    return this.variant !== 'popular' ? this.variant : this.type;
  }
}
