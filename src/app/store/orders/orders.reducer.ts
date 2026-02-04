import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Order } from './orders.models';
import * as OrdersActions from './orders.actions';

// State interface
export interface OrdersState extends EntityState<Order> {
  loading: boolean;
  error: string | null;
  lastUpdated?: number;
}

// Entity adapter
export const ordersAdapter: EntityAdapter<Order> = createEntityAdapter<Order>({
  selectId: (order: Order) => order.id,
  sortComparer: (a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
});

// Initial state
export const initialState: OrdersState = ordersAdapter.getInitialState({
  loading: false,
  error: null
});

// Reducer
export const ordersReducer = createReducer(
  initialState,
  // Load Orders
  on(OrdersActions.loadOrders, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(OrdersActions.loadOrdersSuccess, (state, { orders }) =>
    ordersAdapter.setAll(orders, {
      ...state,
      loading: false
    })
  ),
  on(OrdersActions.loadOrdersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load by Type
  on(OrdersActions.loadOrdersByType, (state) => ({
    ...state,
    loading: true
  })),
  on(OrdersActions.loadOrdersByTypeSuccess, (state, { orders }) =>
    ordersAdapter.setAll(orders, {
      ...state,
      loading: false
    })
  ),

  // Load by Status
  on(OrdersActions.loadOrdersByStatus, (state) => ({
    ...state,
    loading: true
  })),
  on(OrdersActions.loadOrdersByStatusSuccess, (state, { orders }) =>
    ordersAdapter.setAll(orders, {
      ...state,
      loading: false
    })
  ),

  // Create Order
  on(OrdersActions.createOrderSuccess, (state, { order }) =>
    ordersAdapter.addOne(order, {
      ...state,
      loading: false
    })
  ),
  on(OrdersActions.createOrderFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),

  // Update Status
  on(OrdersActions.updateOrderStatusSuccess, (state, { orderId, status }) =>
    ordersAdapter.updateOne(
      { id: orderId, changes: { status, updated_at: new Date().toISOString() } },
      { ...state, loading: false }
    )
  ),

  // Delete Order
  on(OrdersActions.deleteOrderSuccess, (state, { orderId }) =>
    ordersAdapter.removeOne(orderId, state)
  ),

  // Real-time updates
  on(OrdersActions.orderUpdated, (state, { order }) => {
    // Obtener todas las órdenes actuales como array
    const currentOrders = Object.values(state.entities).filter((o): o is Order => o !== undefined);

    // Buscar si la orden ya existe
    const existingIndex = currentOrders.findIndex(o => o.id === order.id);

    let updatedOrders: Order[];
    if (existingIndex >= 0) {
      // Actualizar orden existente
      updatedOrders = [...currentOrders];
      updatedOrders[existingIndex] = order;
    } else {
      // Agregar nueva orden
      updatedOrders = [order, ...currentOrders];
    }
    return ordersAdapter.setAll(updatedOrders, { ...state, loading: false, lastUpdated: Date.now() });
  }),

  on(OrdersActions.ordersUpdated, (state, { orders }) =>
    ordersAdapter.setAll(orders, state)
  )
);

// Selectors
export const {
  selectIds: selectOrderIds,
  selectEntities: selectOrderEntities,
  selectAll: selectAllOrders,
  selectTotal: selectTotalOrders
} = ordersAdapter.getSelectors();

export const selectOrdersLoading = (state: OrdersState) => state.loading;
export const selectOrdersError = (state: OrdersState) => state.error;
