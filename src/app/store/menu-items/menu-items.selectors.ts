import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MenuItemsState, selectAllMenuItems, selectMenuItemsError, selectMenuItemsLoading } from './menu-items.reducer';

export const selectMenuItemsState = createFeatureSelector<MenuItemsState>('menuItems');

// Base selectors
export const selectMenuItems = createSelector(
  selectMenuItemsState,
  selectAllMenuItems
);

export const selectMenuItemsLoadingState = createSelector(
  selectMenuItemsState,
  selectMenuItemsLoading
);

export const selectMenuItemsErrorState = createSelector(
  selectMenuItemsState,
  selectMenuItemsError
);

// Computed selectors
export const selectAvailableMenuItems = createSelector(
  selectMenuItems,
  menuItems => menuItems.filter(item => item.available)
);

export const selectMenuItemsByCategory = (categoryId: string) =>
  createSelector(
    selectMenuItems,
    menuItems => menuItems.filter(item => item.category_id === categoryId)
  );

export const selectMenuItemById = (id: string) =>
  createSelector(
    selectMenuItems,
    menuItems => menuItems.find(item => item.id === id)
  );

export const selectMenuItemsCount = createSelector(
  selectMenuItems,
  menuItems => menuItems.length
);

export const selectAvailableMenuItemsCount = createSelector(
  selectAvailableMenuItems,
  menuItems => menuItems.length
);

export const selectMenuItemsStats = createSelector(
  selectMenuItems,
  menuItems => {
    const available = menuItems.filter(item => item.available).length;
    const unavailable = menuItems.filter(item => !item.available).length;
    const byCategory: Record<string, number> = {};

    menuItems.forEach(item => {
      byCategory[item.category_id] = (byCategory[item.category_id] || 0) + 1;
    });

    return {
      total: menuItems.length,
      available,
      unavailable,
      byCategory
    };
  }
);
