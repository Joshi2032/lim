import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AvatarSize = 'small' | 'medium' | 'large';
export type AvatarVariant = 'primary' | 'secondary' | 'success' | 'warning';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="avatar"
      [class]="size + ' ' + variant"
      [title]="name">
      <span>{{ initials }}</span>
    </div>
  `,
  styleUrl: './avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvatarComponent {
  @Input() initials = '';
  @Input() name = '';
  @Input() size: AvatarSize = 'medium';
  @Input() variant: AvatarVariant = 'primary';
}
