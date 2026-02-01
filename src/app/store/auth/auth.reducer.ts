import { createReducer, on } from '@ngrx/store';
import { Employee } from '../employees/employees.models';
import * as AuthActions from './auth.actions';

export interface AuthState {
  employee: Employee | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  employee: null,
  loading: false,
  error: null
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AuthActions.loginSuccess, (state, { employee }) => ({
    ...state,
    loading: false,
    employee,
    error: null
  })),
  on(AuthActions.refreshCurrentUserSuccess, (state, { employee }) => ({
    ...state,
    employee,
    error: null
  })),
  on(AuthActions.employeeDataUpdated, (state, { employee }) => ({
    ...state,
    employee
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(AuthActions.logout, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AuthActions.logoutSuccess, () => ({
    ...initialState
  })),
  on(AuthActions.logoutFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);
