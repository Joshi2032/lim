import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OrdersState, selectAllOrders, selectOrdersLoading, selectOrdersError } from './orders.reducer';

export const selectOrdersState = createFeatureSelector<OrdersState>('orders');

// Base selectors
export const selectOrders = createSelector(
  selectOrdersState,
  selectAllOrders
);

export const selectOrdersById = (id: string) =>
  createSelector(
    selectOrdersState,
    (state) => state.entities[id]
  );

export const selectOrdersLoading$ = createSelector(
  selectOrdersState,
  selectOrdersLoading
);

export const selectOrdersError$ = createSelector(
  selectOrdersState,
  selectOrdersError
);

// Computed selectors
export const selectTodayOrders = createSelector(
  selectOrders,
  (orders) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return orders.filter(o => {
      const orderDate = new Date(o.created_at);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });
  }
);

export const selectOrdersByStatus = (status: string) =>
  createSelector(
    selectOrders,
    (orders) => orders.filter(o => o.status === status)
  );

export const selectOrdersByType = (type: string) =>
  createSelector(
    selectOrders,
    (orders) => orders.filter(o => o.order_type === type)
  );

export const selectOrdersStats = createSelector(
  selectTodayOrders,
  (orders) => ({
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    revenue: orders.reduce((sum, o) => sum + o.total_price, 0),
    avgTicket: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total_price, 0) / orders.length : 0
  })
);
