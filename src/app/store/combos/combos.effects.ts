import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { switchMap } from 'rxjs/operators';
import { SupabaseService } from '../../core/services/supabase.service';
import * as CombosActions from './combos.actions';

@Injectable()
export class CombosEffects {
  loadCombos$;
  createCombo$;
  updateCombo$;
  deleteCombo$;
  subscribeToCombos$;

  constructor(
    private actions$: Actions,
    private supabase: SupabaseService,
    private store: Store
  ) {
    this.loadCombos$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CombosActions.loadCombos),
        switchMap(() =>
          this.supabase.getCombos().then(
            combos => CombosActions.loadCombosSuccess({ combos }),
            (error: any) => CombosActions.loadCombosFailure({ error: error.message })
          )
        )
      )
    );

    this.createCombo$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CombosActions.createCombo),
        switchMap(({ combo, itemIds }) =>
          this.supabase.createCombo(combo, itemIds).then(
            (result: any) => CombosActions.createComboSuccess({ combo: result }),
            (error: any) => CombosActions.createComboFailure({ error: error.message })
          )
        )
      )
    );

    this.updateCombo$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CombosActions.updateCombo),
        switchMap(({ comboId, combo, itemIds }) =>
          this.supabase.updateCombo(comboId, combo, itemIds).then(
            () => CombosActions.updateComboSuccess({ comboId, combo }),
            (error: any) => CombosActions.updateComboFailure({ error: error.message })
          )
        )
      )
    );

    this.deleteCombo$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CombosActions.deleteCombo),
        switchMap(({ comboId }) =>
          this.supabase.deleteCombo(comboId).then(
            () => CombosActions.deleteComboSuccess({ comboId }),
            (error: any) => CombosActions.deleteComboFailure({ error: error.message })
          )
        )
      )
    );

    this.subscribeToCombos$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CombosActions.subscribeToCombos),
        switchMap(() => {
          return new Promise<never>((_, reject) => {
            this.supabase.subscribeToComboChanges((combos) => {
              this.store.dispatch(CombosActions.combosUpdated({ combos }));
            });
          });
        })
      ),
      { dispatch: false }
    );
  }
}
