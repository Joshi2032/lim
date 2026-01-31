import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { MenuItem } from '../../core/services/supabase.service';
import * as MenuItemsActions from './menu-items.actions';

export interface MenuItemsState extends EntityState<MenuItem> {
  loading: boolean;
  error: string | null;
}

export const menuItemsAdapter: EntityAdapter<MenuItem> = createEntityAdapter<MenuItem>({
  selectId: (menuItem: MenuItem) => menuItem.id,
  sortComparer: (a: MenuItem, b: MenuItem) => a.name.localeCompare(b.name)
});

export const initialState: MenuItemsState = menuItemsAdapter.getInitialState({
  loading: false,
  error: null
});

export const menuItemsReducer = createReducer(
  initialState,
  on(MenuItemsActions.loadMenuItems, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(MenuItemsActions.loadMenuItemsSuccess, (state, { menuItems }) =>
    menuItemsAdapter.setAll(menuItems, {
      ...state,
      loading: false
    })
  ),
  on(MenuItemsActions.loadMenuItemsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(MenuItemsActions.loadMenuItemsByCategory, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(MenuItemsActions.loadMenuItemsByCategorySuccess, (state, { menuItems }) =>
    menuItemsAdapter.setAll(menuItems, {
      ...state,
      loading: false
    })
  ),
  on(MenuItemsActions.createMenuItemSuccess, (state, { menuItem }) =>
    menuItemsAdapter.addOne(menuItem, state)
  ),
  on(MenuItemsActions.updateMenuItemSuccess, (state, { menuItemId, menuItem }) =>
    menuItemsAdapter.updateOne(
      { id: menuItemId, changes: menuItem },
      state
    )
  ),
  on(MenuItemsActions.deleteMenuItemSuccess, (state, { menuItemId }) =>
    menuItemsAdapter.removeOne(menuItemId, state)
  ),
  on(MenuItemsActions.menuItemsUpdated, (state, { menuItems }) =>
    menuItemsAdapter.setAll(menuItems, state)
  )
);

export const {
  selectIds: selectMenuItemIds,
  selectEntities: selectMenuItemEntities,
  selectAll: selectAllMenuItems,
  selectTotal: selectTotalMenuItems
} = menuItemsAdapter.getSelectors();

export const selectMenuItemsLoading = (state: MenuItemsState) => state.loading;
export const selectMenuItemsError = (state: MenuItemsState) => state.error;
