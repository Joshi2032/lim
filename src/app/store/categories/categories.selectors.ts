import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CategoriesState, selectAllCategories, selectCategoriesError, selectCategoriesLoading } from './categories.reducer';

export const selectCategoriesState = createFeatureSelector<CategoriesState>('categories');

export const selectCategories = createSelector(
  selectCategoriesState,
  selectAllCategories
);

export const selectCategoriesLoadingState = createSelector(
  selectCategoriesState,
  selectCategoriesLoading
);

export const selectCategoriesErrorState = createSelector(
  selectCategoriesState,
  selectCategoriesError
);

export const selectCategoryById = (id: string) =>
  createSelector(
    selectCategories,
    categories => categories.find(c => c.id === id)
  );
