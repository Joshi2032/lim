import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, MenuItem, User } from '../shared/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import { selectAuthEmployee } from '../store/auth/auth.selectors';
import { Employee } from '../store/employees/employees.models';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  template: `
    <div class="app-layout">
      <app-sidebar
        [menuItems]="sidebarItems"
        [currentUser]="currentUser$ | async"
        [cartCount]="cartCount">
      </app-sidebar>

      <div class="app-content">
        <router-outlet />
      </div>
    </div>
  `,
  styleUrls: ['../app.component.scss']
})
export class MainLayoutComponent implements OnInit {
  cartCount: number = 0;
  currentUser$!: Observable<User | null>;

  sidebarItems: MenuItem[] = [
    { id: 'menu', label: 'Menú', icon: '🍜', route: '/menu' },
    { id: 'mesas', label: 'Mesas', icon: '🪑', route: '/mesas' },
    { id: 'cocina', label: 'Cocina', icon: '🍳', route: '/cocina' },
    { id: 'recogida', label: 'Recogida', icon: '🛍️', route: '/recogida' },
    { id: 'pedidos', label: 'Pedidos', icon: '🧾', route: '/pedidos' },
    { id: 'panel', label: 'Panel de Control', icon: '📈', route: '/panel-control' }
  ];

  constructor(private store: Store) {}

  ngOnInit() {
    this.currentUser$ = this.store.select(selectAuthEmployee).pipe(
      map((employee: Employee | null) => {
        if (!employee) return null;
        return {
          name: employee.full_name,
          role: employee.position?.display_name || employee.position?.name || 'Usuario',
          initials: this.getInitials(employee.full_name)
        };
      })
    );
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
