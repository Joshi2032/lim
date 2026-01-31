import { createAction, props } from '@ngrx/store';
import { Employee } from '../employees/employees.models';

export const login = createAction(
  '[Auth Page] Login',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth API] Login Success',
  props<{ employee: Employee }>()
);

export const loginFailure = createAction(
  '[Auth API] Login Failure',
  props<{ error: string }>()
);

export const logout = createAction('[Auth Page] Logout');

export const logoutSuccess = createAction('[Auth API] Logout Success');

export const logoutFailure = createAction(
  '[Auth API] Logout Failure',
  props<{ error: string }>()
);
