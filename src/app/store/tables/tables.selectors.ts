import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TablesState, selectAllTables, selectTablesError, selectTablesLoading } from './tables.reducer';

export const selectTablesState = createFeatureSelector<TablesState>('tables');

export const selectTables = createSelector(
  selectTablesState,
  selectAllTables
);

export const selectTablesLoadingState = createSelector(
  selectTablesState,
  selectTablesLoading
);

export const selectTablesErrorState = createSelector(
  selectTablesState,
  selectTablesError
);

export const selectTablesByStatus = (status: string) =>
  createSelector(
    selectTables,
    tables => tables.filter(t => t.status === status)
  );
