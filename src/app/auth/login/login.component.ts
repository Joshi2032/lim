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
      console.log('🔐 Step 1: Autenticando con Supabase Auth...');
      // 1. Autenticar con Supabase Auth
      const { user } = await this.supabase.signIn(this.email, this.password);

      if (!user) {
        throw new Error('No se pudo autenticar el usuario');
      }

      console.log('✅ Step 1 OK: Auth successful, user ID:', user.id);
      console.log('🔐 Step 2: Buscando empleado en base de datos...');

      // 2. Verificar que sea un empleado activo
      const employee = await this.supabase.getEmployeeByEmail(this.email);

      if (!employee) {
        console.error('❌ Step 2 FAILED: Empleado no encontrado');
        await this.supabase.signOut();
        this.errorMessage = 'No tienes permisos para acceder al sistema';
        this.isLoading = false;
        this.cdr.markForCheck();
        return;
      }

      console.log('✅ Step 2 OK: Empleado encontrado:', employee);

      if (!employee.active) {
        console.error('❌ Step 2 FAILED: Empleado inactivo');
        await this.supabase.signOut();
        this.errorMessage = 'Tu cuenta de empleado está inactiva';
        this.isLoading = false;
        this.cdr.markForCheck();
        return;
      }

      console.log('✅ Empleado activo');
      console.log('🔐 Step 3: Vinculando auth_user_id si es necesario...');

      // 3. Vincular auth_user_id si no está vinculado
      if (!employee.auth_user_id) {
        try {
          await this.supabase.linkEmployeeToAuthUser(employee.id, user.id);
          console.log('✅ Step 3 OK: Employee linked to auth user');
        } catch (linkError) {
          console.warn('⚠️ Step 3 WARNING: No se pudo vincular, continuando:', linkError);
        }
      } else {
        console.log('✅ Step 3 OK: Employee ya vinculado');
      }

      console.log('✅ Employee validated:', employee.full_name, '(' + employee.role + ')');
      console.log('🔐 Step 4: Redirigiendo según rol...');

      // 4. Redirigir según el rol
      this.redirectByRole(employee.role);

      // Reset loading después de un delay para asegurar la navegación
      setTimeout(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }, 500);
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      console.error('Error details:', error.message, error.code, error);
      this.errorMessage = error.message || 'Error al iniciar sesión. Verifica tus credenciales.';
      this.isLoading = false;
      this.cdr.markForCheck();
    }
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
