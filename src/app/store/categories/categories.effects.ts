import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap } from 'rxjs/operators';
import { SupabaseService } from '../../core/services/supabase.service';
import * as CategoriesActions from './categories.actions';

@Injectable()
export class CategoriesEffects {
  loadCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CategoriesActions.loadCategories),
      switchMap(() =>
        this.supabase.getCategories().then(
          categories => CategoriesActions.loadCategoriesSuccess({ categories }),
          (error: any) => CategoriesActions.loadCategoriesFailure({ error: error.message })
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private supabase: SupabaseService
  ) {}
}
