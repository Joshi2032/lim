import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Combo } from './combos.models';
import * as CombosActions from './combos.actions';

export interface CombosState extends EntityState<Combo> {
  loading: boolean;
  error: string | null;
}

export const combosAdapter: EntityAdapter<Combo> = createEntityAdapter<Combo>({
  selectId: (combo: Combo) => combo.id,
  sortComparer: (a: Combo, b: Combo) => a.name.localeCompare(b.name)
});

export const initialState: CombosState = combosAdapter.getInitialState({
  loading: false,
  error: null
});

export const combosReducer = createReducer(
  initialState,
  on(CombosActions.loadCombos, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CombosActions.loadCombosSuccess, (state, { combos }) =>
    combosAdapter.setAll(combos, {
      ...state,
      loading: false
    })
  ),
  on(CombosActions.loadCombosFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(CombosActions.createComboSuccess, (state, { combo }) =>
    combosAdapter.addOne(combo, state)
  ),
  on(CombosActions.updateComboSuccess, (state, { comboId, combo }) =>
    combosAdapter.updateOne(
      { id: comboId, changes: combo },
      state
    )
  ),
  on(CombosActions.deleteComboSuccess, (state, { comboId }) =>
    combosAdapter.removeOne(comboId, state)
  ),
  on(CombosActions.combosUpdated, (state, { combos }) =>
    combosAdapter.setAll(combos, state)
  )
);

export const {
  selectAll: selectAllCombos,
  selectEntities: selectComboEntities,
  selectIds: selectComboIds,
  selectTotal: selectCombosTotal
} = combosAdapter.getSelectors();

export const selectCombosLoading = (state: CombosState) => state.loading;
export const selectCombosError = (state: CombosState) => state.error;
