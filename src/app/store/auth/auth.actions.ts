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

export const refreshCurrentUser = createAction('[Auth] Refresh Current User');

export const refreshCurrentUserSuccess = createAction(
  '[Auth API] Refresh Current User Success',
  props<{ employee: Employee }>()
);

export const refreshCurrentUserFailure = createAction(
  '[Auth API] Refresh Current User Failure',
  props<{ error: string }>()
);

export const employeeDataUpdated = createAction(
  '[Auth Realtime] Employee Data Updated',
  props<{ employee: Employee }>()
);

export const initializeAuth = createAction('[Auth] Initialize Auth');

export const startUserPolling = createAction('[Auth] Start User Polling');

export const stopUserPolling = createAction('[Auth] Stop User Polling');
