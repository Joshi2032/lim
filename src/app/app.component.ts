import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import * as AuthActions from './store/auth/auth.actions';
import * as OrdersActions from './store/orders/orders.actions';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'lim';

  constructor(private store: Store) {}

  ngOnInit() {
    console.log('🚀 Inicializando aplicación...');
    // Verificar si hay una sesión activa al cargar la app
    this.store.dispatch(AuthActions.initializeAuth());

    // Cargar órdenes existentes de la BD
    this.store.dispatch(OrdersActions.loadOrders());
    
    // Suscribirse a cambios de órdenes en tiempo real globalmente
    this.store.dispatch(OrdersActions.subscribeToOrders());
  }
}
