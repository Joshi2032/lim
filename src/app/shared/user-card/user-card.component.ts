import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { AvatarComponent } from '../avatar/avatar.component';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, IconButtonComponent, AvatarComponent],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss'
})
export class UserCardComponent {
  @Input() name = '';
  @Input() email = '';
  @Input() roleLabel = '';
  @Input() roleId = '';
  @Input() initials = '';
  @Input() status: 'activo' | 'inactivo' = 'activo';

  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
}
