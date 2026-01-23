import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
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
