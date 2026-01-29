import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  showPassword = false;
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  async onLogin(event: Event) {
    event.preventDefault();

    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      this.cdr.markForCheck();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    try {
      const { user } = await this.supabase.signIn(this.email, this.password);

      if (user) {
        console.log('✅ Login successful, redirecting to menu...');
        this.router.navigate(['/menu']);
      }
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      this.errorMessage = error.message || 'Error al iniciar sesión. Verifica tus credenciales.';
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }
}
