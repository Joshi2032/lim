import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { RestaurantTable } from './tables.models';
import * as TablesActions from './tables.actions';

export interface TablesState extends EntityState<RestaurantTable> {
  loading: boolean;
  error: string | null;
}

export const tablesAdapter: EntityAdapter<RestaurantTable> = createEntityAdapter<RestaurantTable>({
  selectId: (table: RestaurantTable) => table.id,
  sortComparer: (a: RestaurantTable, b: RestaurantTable) => a.table_number - b.table_number
});

export const initialState: TablesState = tablesAdapter.getInitialState({
  loading: false,
  error: null
});

export const tablesReducer = createReducer(
  initialState,
  on(TablesActions.loadTables, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(TablesActions.loadTablesSuccess, (state, { tables }) =>
    tablesAdapter.setAll(tables, {
      ...state,
      loading: false
    })
  ),
  on(TablesActions.loadTablesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(TablesActions.updateTableStatusSuccess, (state, { tableId, status }) =>
    tablesAdapter.updateOne({ id: tableId, changes: { status } }, state)
  ),
  on(TablesActions.tablesUpdated, (state, { tables }) =>
    tablesAdapter.setAll(tables, state)
  )
);

export const {
  selectAll: selectAllTables,
  selectEntities: selectTableEntities,
  selectIds: selectTableIds,
  selectTotal: selectTablesTotal
} = tablesAdapter.getSelectors();

export const selectTablesLoading = (state: TablesState) => state.loading;
export const selectTablesError = (state: TablesState) => state.error;
