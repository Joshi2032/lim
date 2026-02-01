import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export interface UserView {
  name: string;
  role: string;
  initials: string;
}

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

export const selectCurrentUser = createSelector(
  selectAuthEmployee,
  (employee): UserView | null => {
    console.log('🔍 selectCurrentUser - employee:', employee);

    if (!employee) {
      console.log('⚠️ No hay empleado en el store');
      return null;
    }

    if (!employee.full_name) {
      console.log('⚠️ Empleado sin full_name:', employee);
      return null;
    }

    const name = employee.full_name.trim();
    const role = employee.position?.display_name || employee.position?.name || 'Usuario';
    const initials = name
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const userView = { name, role, initials };
    console.log('✅ UserView generado:', userView);
    return userView;
  }
);
