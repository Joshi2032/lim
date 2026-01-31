import { createAction, props } from '@ngrx/store';
import { RestaurantTable } from '../../core/services/supabase.service';

// Load Tables
export const loadTables = createAction('[Tables Page] Load Tables');

export const loadTablesSuccess = createAction(
  '[Tables API] Load Tables Success',
  props<{ tables: RestaurantTable[] }>()
);

export const loadTablesFailure = createAction(
  '[Tables API] Load Tables Failure',
  props<{ error: string }>()
);

// Update Table Status
export const updateTableStatus = createAction(
  '[Tables Page] Update Table Status',
  props<{ tableId: string; status: RestaurantTable['status'] }>()
);

export const updateTableStatusSuccess = createAction(
  '[Tables API] Update Table Status Success',
  props<{ tableId: string; status: RestaurantTable['status'] }>()
);

export const updateTableStatusFailure = createAction(
  '[Tables API] Update Table Status Failure',
  props<{ error: string }>()
);

// Subscribe to Tables (real-time)
export const subscribeToTables = createAction('[Tables Page] Subscribe To Tables');

export const tablesUpdated = createAction(
  '[Tables Subscription] Tables Updated',
  props<{ tables: RestaurantTable[] }>()
);
