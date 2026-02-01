import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, MenuItem, User } from '../shared/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectCurrentUser } from '../store/auth/auth.selectors';
import * as AuthActions from '../store/auth/auth.actions';

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
    console.log('🚀 MainLayoutComponent inicializado');
    this.currentUser$ = this.store.select(selectCurrentUser);

    // Suscribirse para ver los cambios
    this.currentUser$.subscribe(user => {
      console.log('👤 Usuario actual en MainLayout:', user);
    });
  }
}
