import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { switchMap } from 'rxjs/operators';
import { SupabaseService } from '../../core/services/supabase.service';
import * as MenuItemsActions from './menu-items.actions';

@Injectable()
export class MenuItemsEffects {
  loadMenuItems$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MenuItemsActions.loadMenuItems),
      switchMap(() =>
        this.supabase.getMenuItems().then(
          menuItems => MenuItemsActions.loadMenuItemsSuccess({ menuItems }),
          (error: any) => MenuItemsActions.loadMenuItemsFailure({ error: error.message })
        )
      )
    )
  );

  loadMenuItemsByCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MenuItemsActions.loadMenuItemsByCategory),
      switchMap(({ categoryId }) =>
        this.supabase.getMenuItemsByCategory(categoryId).then(
          menuItems => MenuItemsActions.loadMenuItemsByCategorySuccess({ menuItems }),
          (error: any) => MenuItemsActions.loadMenuItemsByCategoryFailure({ error: error.message })
        )
      )
    )
  );

  createMenuItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MenuItemsActions.createMenuItem),
      switchMap(({ menuItem }) =>
        this.supabase.createMenuItem(menuItem).then(
          (result: any) => MenuItemsActions.createMenuItemSuccess({ menuItem: result }),
          (error: any) => MenuItemsActions.createMenuItemFailure({ error: error.message })
        )
      )
    )
  );

  updateMenuItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MenuItemsActions.updateMenuItem),
      switchMap(({ menuItemId, menuItem }) =>
        this.supabase.updateMenuItem(menuItemId, menuItem).then(
          () => MenuItemsActions.updateMenuItemSuccess({ menuItemId, menuItem }),
          (error: any) => MenuItemsActions.updateMenuItemFailure({ error: error.message })
        )
      )
    )
  );

  deleteMenuItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MenuItemsActions.deleteMenuItem),
      switchMap(({ menuItemId }) =>
        this.supabase.deleteMenuItem(menuItemId).then(
          () => MenuItemsActions.deleteMenuItemSuccess({ menuItemId }),
          (error: any) => MenuItemsActions.deleteMenuItemFailure({ error: error.message })
        )
      )
    )
  );

  subscribeToMenuItems$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MenuItemsActions.subscribeToMenuItems),
      switchMap(() => {
        return new Promise<never>((_, reject) => {
          this.supabase.subscribeToMenuItems((menuItems) => {
            // Dispatch update action when items change
            this.store.dispatch(MenuItemsActions.menuItemsUpdated({ menuItems }));
          });
        });
      })
    ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private supabase: SupabaseService,
    private store: Store
  ) {}
}
