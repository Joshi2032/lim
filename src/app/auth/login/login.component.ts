import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import * as AuthActions from '../../store/auth/auth.actions';
import { selectAuthEmployee, selectAuthError, selectAuthLoading } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit, OnDestroy {
  showPassword = false;
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  private subscriptions = new Subscription();
  private lastRedirectEmployeeId: string | null = null;

  constructor(
    private router: Router,
    private store: Store,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.store.select(selectAuthLoading).subscribe(loading => {
        this.isLoading = loading;
        this.cdr.markForCheck();
      })
    );

    this.subscriptions.add(
      this.store.select(selectAuthError).subscribe(error => {
        this.errorMessage = error || '';
        this.cdr.markForCheck();
      })
    );

    this.subscriptions.add(
      this.store.select(selectAuthEmployee).subscribe(employee => {
        if (!employee || employee.id === this.lastRedirectEmployeeId) return;
        this.lastRedirectEmployeeId = employee.id;
        this.redirectByRole(employee.position?.name || 'waiter');
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  onLogin(event: Event) {
    event.preventDefault();

    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      this.cdr.markForCheck();
      return;
    }

    this.store.dispatch(AuthActions.login({ email: this.email, password: this.password }));
  }

  private redirectByRole(role: string) {
    console.log('🎯 Redirecting role:', role);
    switch (role) {
      case 'admin':
        console.log('→ Navegando a /panel-control');
        this.router.navigate(['/panel-control']);
        break;
      case 'chef':
        console.log('→ Navegando a /cocina');
        this.router.navigate(['/cocina']);
        break;
      case 'waiter':
        console.log('→ Navegando a /mesas');
        this.router.navigate(['/mesas']);
        break;
      case 'delivery':
        console.log('→ Navegando a /entregas');
        this.router.navigate(['/entregas']);
        break;
      case 'cashier':
        console.log('→ Navegando a /recogida');
        this.router.navigate(['/recogida']);
        break;
      default:
        console.log('→ Navegando a /menu (default)');
        this.router.navigate(['/menu']);
    }
  }
}
