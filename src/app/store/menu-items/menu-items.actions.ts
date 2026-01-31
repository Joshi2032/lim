import { createAction, props } from '@ngrx/store';
import { MenuItem } from '../../core/services/supabase.service';

// Load Menu Items
export const loadMenuItems = createAction('[Menu Page] Load Menu Items');

export const loadMenuItemsSuccess = createAction(
  '[Menu API] Load Menu Items Success',
  props<{ menuItems: MenuItem[] }>()
);

export const loadMenuItemsFailure = createAction(
  '[Menu API] Load Menu Items Failure',
  props<{ error: string }>()
);

// Load Menu Items By Category
export const loadMenuItemsByCategory = createAction(
  '[Menu Page] Load Menu Items By Category',
  props<{ categoryId: string }>()
);

export const loadMenuItemsByCategorySuccess = createAction(
  '[Menu API] Load Menu Items By Category Success',
  props<{ menuItems: MenuItem[] }>()
);

export const loadMenuItemsByCategoryFailure = createAction(
  '[Menu API] Load Menu Items By Category Failure',
  props<{ error: string }>()
);

// Create Menu Item
export const createMenuItem = createAction(
  '[Create Product Dialog] Create Menu Item',
  props<{ menuItem: Omit<MenuItem, 'id'> }>()
);

export const createMenuItemSuccess = createAction(
  '[Menu API] Create Menu Item Success',
  props<{ menuItem: MenuItem }>()
);

export const createMenuItemFailure = createAction(
  '[Menu API] Create Menu Item Failure',
  props<{ error: string }>()
);

// Update Menu Item
export const updateMenuItem = createAction(
  '[Edit Product Dialog] Update Menu Item',
  props<{ menuItemId: string; menuItem: Partial<MenuItem> }>()
);

export const updateMenuItemSuccess = createAction(
  '[Menu API] Update Menu Item Success',
  props<{ menuItemId: string; menuItem: Partial<MenuItem> }>()
);

export const updateMenuItemFailure = createAction(
  '[Menu API] Update Menu Item Failure',
  props<{ error: string }>()
);

// Delete Menu Item
export const deleteMenuItem = createAction(
  '[Products Table] Delete Menu Item',
  props<{ menuItemId: string }>()
);

export const deleteMenuItemSuccess = createAction(
  '[Menu API] Delete Menu Item Success',
  props<{ menuItemId: string }>()
);

export const deleteMenuItemFailure = createAction(
  '[Menu API] Delete Menu Item Failure',
  props<{ error: string }>()
);

// Subscribe to Menu Items (real-time)
export const subscribeToMenuItems = createAction('[Menu Page] Subscribe To Menu Items');

export const menuItemsUpdated = createAction(
  '[Menu Subscription] Menu Items Updated',
  props<{ menuItems: MenuItem[] }>()
);
