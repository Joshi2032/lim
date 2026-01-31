import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap } from 'rxjs/operators';
import { SupabaseService, Employee } from '../../core/services/supabase.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  login$;
  logout$;

  constructor(
    private actions$: Actions,
    private supabase: SupabaseService
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
}
