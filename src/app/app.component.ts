import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import * as AuthActions from './store/auth/auth.actions';

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
  }
}
