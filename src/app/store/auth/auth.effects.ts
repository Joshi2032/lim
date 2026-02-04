import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { switchMap, tap } from 'rxjs/operators';
import { SupabaseService } from '../../core/services/supabase.service';
import { Employee } from '../employees/employees.models';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  login$;
  logout$;
  refreshCurrentUser$;
  subscribeToEmployeeChanges$;
  unsubscribeFromEmployeeChanges$;
  startUserPolling$;
  stopUserPolling$;
  initializeAuth$;
  private pollingInterval: any = null;

  constructor(
    private actions$: Actions,
    private supabase: SupabaseService,
    private store: Store,
    private router: Router
  ) {
    this.login$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.login),
        switchMap(({ email, password }) =>
          this.loginFlow(email, password).then(
            employee => AuthActions.loginSuccess({ employee }),
            (error: any) => AuthActions.loginFailure({ error: error?.message || 'Error al iniciar sesión. Verifica tus credenciales.' })
          )
        )
      )
    );

    this.logout$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        switchMap(() =>
          this.supabase.signOut().then(
            () => AuthActions.logoutSuccess(),
            (error: any) => AuthActions.logoutFailure({ error: error?.message || 'Error al cerrar sesión.' })
          )
        )
      )
    );

    this.refreshCurrentUser$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.refreshCurrentUser),
        switchMap(() =>
          this.refreshUserData().then(
            employee => AuthActions.refreshCurrentUserSuccess({ employee }),
            (error: any) => AuthActions.refreshCurrentUserFailure({ error: error?.message || 'Error al actualizar datos del usuario.' })
          )
        )
      )
    );

    this.subscribeToEmployeeChanges$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ employee }) => {
          this.startPolling(employee.id);
        })
      ),
      { dispatch: false }
    );

    this.unsubscribeFromEmployeeChanges$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.logoutSuccess),
        tap(() => {
          this.stopPolling();
          console.log('🔓 Sesión cerrada, redirigiendo a login...');
          this.router.navigate(['/login']);
        })
      ),
      { dispatch: false }
    );

    this.startUserPolling$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.startUserPolling),
        tap(() => {
          // Efecto secundario, el polling ya está iniciado
        })
      ),
      { dispatch: false }
    );

    this.stopUserPolling$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.stopUserPolling),
        tap(() => {
          this.stopPolling();
        })
      ),
      { dispatch: false }
    );

    this.initializeAuth$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AuthActions.initializeAuth),
        switchMap(() =>
          this.checkExistingSession().then(
            employee => employee ? AuthActions.loginSuccess({ employee }) : AuthActions.loginFailure({ error: 'No hay sesión activa' }),
            (error: any) => AuthActions.loginFailure({ error: error?.message || 'Error al verificar sesión.' })
          )
        )
      )
    );
  }

  private async loginFlow(email: string, password: string): Promise<Employee> {
    const { user } = await this.supabase.signIn(email, password);
    if (!user) {
      throw new Error('No se pudo autenticar el usuario');
    }

    const employee = await this.supabase.getEmployeeByEmail(email);
    if (!employee) {
      await this.supabase.signOut();
      throw new Error('No tienes permisos para acceder al sistema');
    }

    if (!employee.active) {
      await this.supabase.signOut();
      throw new Error('Tu cuenta de empleado está inactiva');
    }

    if (!employee.auth_user_id) {
      try {
        await this.supabase.linkEmployeeToAuthUser(employee.id, user.id);
      } catch (linkError) {
        // Ignore linking errors, allow login to continue
      }
    }

    return employee;
  }

  private async refreshUserData(): Promise<Employee> {
    const user = await this.supabase.getCurrentUser();
    if (!user?.email) {
      throw new Error('No hay usuario autenticado');
    }

    const employee = await this.supabase.getEmployeeByEmail(user.email);
    if (!employee) {
      throw new Error('No se encontraron datos del empleado');
    }

    return employee;
  }

  private startPolling(employeeId: string) {
    // Limpiar polling anterior si existe
    this.stopPolling();

    console.log('⏱️ Iniciando polling para empleado:', employeeId, '(cada 30 segundos)');

    // Polling cada 30 segundos
    this.pollingInterval = setInterval(async () => {
      try {
        console.log('🔄 Verificando actualizaciones del empleado...');
        const employee = await this.supabase.getEmployeeByEmail(
          (await this.supabase.getCurrentUser())?.email || ''
        );

        if (employee) {
          console.log('✅ Datos actualizados:', employee);
          this.store.dispatch(AuthActions.employeeDataUpdated({ employee }));
        }
      } catch (error) {
        console.error('❌ Error en polling:', error);
      }
    }, 30000); // 30 segundos
  }

  private stopPolling() {
    if (this.pollingInterval) {
      console.log('⏹️ Deteniendo polling');
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private async checkExistingSession(): Promise<Employee | null> {
    console.log('🔍 Verificando sesión existente...');

    try {
      // Supabase restaura la sesión automáticamente desde localStorage
      const { data: { session } } = await this.supabase.supabase.auth.getSession();

      if (!session?.user?.email) {
        console.log('⚠️ No hay sesión activa');
        return null;
      }

      console.log('✅ Sesión restaurada para:', session.user.email);

      // Obtener datos del empleado
      const employee = await this.supabase.getEmployeeByEmail(session.user.email);

      if (!employee) {
        console.log('⚠️ No se encontró empleado para:', session.user.email);
        return null;
      }

      console.log('✅ Empleado cargado:', employee);

      // Iniciar polling para mantener datos actualizados
      this.startPolling(employee.id);

      return employee;
    } catch (error) {
      console.error('❌ Error al verificar sesión:', error);
      return null;
    }
  }
}
