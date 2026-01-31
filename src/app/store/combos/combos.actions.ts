import { createAction, props } from '@ngrx/store';
import { Combo } from '../../core/services/supabase.service';

export type ComboCreate = Omit<Combo, 'id' | 'created_at' | 'updated_at'>;
export type ComboUpdate = Partial<Omit<Combo, 'id' | 'created_at' | 'updated_at'>>;

// Load Combos
export const loadCombos = createAction('[Combos Page] Load Combos');

export const loadCombosSuccess = createAction(
  '[Combos API] Load Combos Success',
  props<{ combos: Combo[] }>()
);

export const loadCombosFailure = createAction(
  '[Combos API] Load Combos Failure',
  props<{ error: string }>()
);

// Create Combo
export const createCombo = createAction(
  '[Combos Page] Create Combo',
  props<{ combo: ComboCreate; itemIds: string[] }>()
);

export const createComboSuccess = createAction(
  '[Combos API] Create Combo Success',
  props<{ combo: Combo }>()
);

export const createComboFailure = createAction(
  '[Combos API] Create Combo Failure',
  props<{ error: string }>()
);

// Update Combo
export const updateCombo = createAction(
  '[Combos Page] Update Combo',
  props<{ comboId: string; combo: ComboUpdate; itemIds?: string[] }>()
);

export const updateComboSuccess = createAction(
  '[Combos API] Update Combo Success',
  props<{ comboId: string; combo: ComboUpdate }>()
);

export const updateComboFailure = createAction(
  '[Combos API] Update Combo Failure',
  props<{ error: string }>()
);

// Delete Combo
export const deleteCombo = createAction(
  '[Combos Page] Delete Combo',
  props<{ comboId: string }>()
);

export const deleteComboSuccess = createAction(
  '[Combos API] Delete Combo Success',
  props<{ comboId: string }>()
);

export const deleteComboFailure = createAction(
  '[Combos API] Delete Combo Failure',
  props<{ error: string }>()
);

// Subscribe to Combos (real-time)
export const subscribeToCombos = createAction('[Combos Page] Subscribe To Combos');

export const combosUpdated = createAction(
  '[Combos Subscription] Combos Updated',
  props<{ combos: Combo[] }>()
);
