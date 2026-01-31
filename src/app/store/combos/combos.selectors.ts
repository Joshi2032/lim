import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CombosState, selectAllCombos, selectCombosError, selectCombosLoading } from './combos.reducer';

export const selectCombosState = createFeatureSelector<CombosState>('combos');

export const selectCombos = createSelector(
  selectCombosState,
  selectAllCombos
);

export const selectCombosLoadingState = createSelector(
  selectCombosState,
  selectCombosLoading
);

export const selectCombosErrorState = createSelector(
  selectCombosState,
  selectCombosError
);

export const selectComboById = (id: string) =>
  createSelector(
    selectCombos,
    combos => combos.find(c => c.id === id)
  );
