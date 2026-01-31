import { createAction, props } from '@ngrx/store';
import { Order, OrderItem } from '../../core/services/supabase.service';

// Load Actions
export const loadOrders = createAction('[Orders Page] Load Orders');

export const loadOrdersSuccess = createAction(
  '[Orders API] Load Orders Success',
  props<{ orders: Order[] }>()
);

export const loadOrdersFailure = createAction(
  '[Orders API] Load Orders Failure',
  props<{ error: string }>()
);

// Load by Type
export const loadOrdersByType = createAction(
  '[Orders Page] Load Orders By Type',
  props<{ orderType: 'dine-in' | 'pickup' | 'delivery' }>()
);

export const loadOrdersByTypeSuccess = createAction(
  '[Orders API] Load Orders By Type Success',
  props<{ orders: Order[] }>()
);

// Load by Status
export const loadOrdersByStatus = createAction(
  '[Orders Page] Load Orders By Status',
  props<{ status: Order['status'] }>()
);

export const loadOrdersByStatusSuccess = createAction(
  '[Orders API] Load Orders By Status Success',
  props<{ orders: Order[] }>()
);

// Create Order
export const createOrder = createAction(
  '[Orders Page] Create Order',
  props<{ order: Omit<Order, 'id' | 'created_at' | 'updated_at'> }>()
);

export const createOrderWithItems = createAction(
  '[Orders Page] Create Order With Items',
  props<{ order: Omit<Order, 'id' | 'created_at' | 'updated_at'>; items: Array<Omit<OrderItem, 'id' | 'order_id'>> }>()
);

export const createOrderSuccess = createAction(
  '[Orders API] Create Order Success',
  props<{ order: Order }>()
);

export const createOrderFailure = createAction(
  '[Orders API] Create Order Failure',
  props<{ error: string }>()
);

// Update Order Status
export const updateOrderStatus = createAction(
  '[Orders Page] Update Order Status',
  props<{ orderId: string; status: Order['status']; userId?: string }>()
);

export const updateOrderStatusSuccess = createAction(
  '[Orders API] Update Order Status Success',
  props<{ orderId: string; status: Order['status'] }>()
);

export const updateOrderStatusFailure = createAction(
  '[Orders API] Update Order Status Failure',
  props<{ error: string }>()
);

// Delete Order
export const deleteOrder = createAction(
  '[Orders Page] Delete Order',
  props<{ orderId: string }>()
);

export const deleteOrderSuccess = createAction(
  '[Orders API] Delete Order Success',
  props<{ orderId: string }>()
);

// Real-time Subscription
export const subscribeToOrders = createAction('[Orders Page] Subscribe To Orders');

export const ordersUpdated = createAction(
  '[Orders API] Orders Updated Via Subscription',
  props<{ orders: Order[] }>()
);
