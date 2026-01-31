import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { switchMap } from 'rxjs/operators';
import { SupabaseService } from '../../core/services/supabase.service';
import * as TablesActions from './tables.actions';

@Injectable()
export class TablesEffects {
  loadTables$;
  updateTableStatus$;
  subscribeToTables$;

  constructor(
    private actions$: Actions,
    private supabase: SupabaseService,
    private store: Store
  ) {
    this.loadTables$ = createEffect(() =>
      this.actions$.pipe(
        ofType(TablesActions.loadTables),
        switchMap(() =>
          this.supabase.getTables().then(
            tables => TablesActions.loadTablesSuccess({ tables }),
            (error: any) => TablesActions.loadTablesFailure({ error: error.message })
          )
        )
      )
    );

    this.updateTableStatus$ = createEffect(() =>
      this.actions$.pipe(
        ofType(TablesActions.updateTableStatus),
        switchMap(({ tableId, status }) =>
          this.supabase.updateTableStatus(tableId, status).then(
            () => TablesActions.updateTableStatusSuccess({ tableId, status }),
            (error: any) => TablesActions.updateTableStatusFailure({ error: error.message })
          )
        )
      )
    );

    this.subscribeToTables$ = createEffect(() =>
      this.actions$.pipe(
        ofType(TablesActions.subscribeToTables),
        switchMap(() => {
          return new Promise<never>((_, reject) => {
            this.supabase.subscribeToTables((tables) => {
              this.store.dispatch(TablesActions.tablesUpdated({ tables }));
            });
          });
        })
      ),
      { dispatch: false }
    );
  }
}
