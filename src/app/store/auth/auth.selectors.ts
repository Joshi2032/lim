import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const authFeatureSelector = createFeatureSelector<AuthState>('auth');

export const selectAuthEmployee = createSelector(
  authFeatureSelector,
  (state: AuthState) => state.employee
);

export const selectAuthLoading = createSelector(
  authFeatureSelector,
  (state: AuthState) => state.loading
);

export const selectAuthError = createSelector(
  authFeatureSelector,
  (state: AuthState) => state.error
);
