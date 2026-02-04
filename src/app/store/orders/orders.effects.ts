import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { switchMap, tap } from 'rxjs/operators';
import { SupabaseService } from '../../core/services/supabase.service';
import { Order, OrderItem } from './orders.models';
import * as OrdersActions from './orders.actions';

@Injectable()
export class OrdersEffects {
  loadOrders$;
  loadOrdersByType$;
  loadOrdersByStatus$;
  createOrder$;
  createOrderWithItems$;
  updateOrderStatus$;
  deleteOrder$;
  subscribeToOrders$;

  constructor(
    private actions$: Actions,
    private supabase: SupabaseService,
    private store: Store
  ) {
    this.loadOrders$ = createEffect(() =>
      this.actions$.pipe(
        ofType(OrdersActions.loadOrders),
        switchMap(() =>
          this.supabase.getOrders().then(
            orders => OrdersActions.loadOrdersSuccess({ orders }),
            error => OrdersActions.loadOrdersFailure({ error: error.message })
          )
        )
      )
    );

    this.loadOrdersByType$ = createEffect(() =>
      this.actions$.pipe(
        ofType(OrdersActions.loadOrdersByType),
        switchMap(({ orderType }) =>
          this.supabase.getOrdersByType(orderType).then(
            orders => OrdersActions.loadOrdersByTypeSuccess({ orders }),
            error => OrdersActions.loadOrdersFailure({ error: error.message })
          )
        )
      )
    );

    this.loadOrdersByStatus$ = createEffect(() =>
      this.actions$.pipe(
        ofType(OrdersActions.loadOrdersByStatus),
        switchMap(({ status }) =>
          this.supabase.getOrdersByStatus(status).then(
            orders => OrdersActions.loadOrdersByStatusSuccess({ orders }),
            error => OrdersActions.loadOrdersFailure({ error: error.message })
          )
        )
      )
    );

    this.createOrder$ = createEffect(() =>
      this.actions$.pipe(
        ofType(OrdersActions.createOrder),
        switchMap(({ order }) =>
          this.supabase.createOrder(order).then(
            createdOrder => OrdersActions.createOrderSuccess({ order: createdOrder }),
            error => OrdersActions.createOrderFailure({ error: error.message })
          )
        )
      )
    );

    this.createOrderWithItems$ = createEffect(() =>
      this.actions$.pipe(
        ofType(OrdersActions.createOrderWithItems),
        switchMap(({ order, items }) =>
          this.supabase.createOrder(order).then(
            async (result) => {
              const orderItems = items.map(item => ({
                ...item,
                order_id: result.id
              }));
              await this.supabase.addOrderItems(orderItems);
              return OrdersActions.createOrderSuccess({ order: result });
            },
            (error: any) => OrdersActions.createOrderFailure({ error: error.message })
          )
        )
      )
    );

    this.updateOrderStatus$ = createEffect(() =>
      this.actions$.pipe(
        ofType(OrdersActions.updateOrderStatus),
        switchMap(({ orderId, status, userId }) =>
          this.supabase.updateOrderStatus(orderId, status, userId).then(
            () => OrdersActions.updateOrderStatusSuccess({ orderId, status }),
            error => OrdersActions.updateOrderStatusFailure({ error: error.message })
          )
        )
      )
    );

    this.deleteOrder$ = createEffect(() =>
      this.actions$.pipe(
        ofType(OrdersActions.deleteOrder),
        switchMap(({ orderId }) =>
          this.supabase.deleteOrder(orderId).then(
            () => OrdersActions.deleteOrderSuccess({ orderId }),
            error => OrdersActions.loadOrdersFailure({ error: error.message })
          )
        )
      )
    );

    this.subscribeToOrders$ = createEffect(() =>
      this.actions$.pipe(
        ofType(OrdersActions.subscribeToOrders),
        tap(() => {
          this.supabase.subscribeToOrders((orders) => {
            // orders es un array de 1 elemento cuando viene del real-time
            if (orders.length > 0) {
              this.store.dispatch(OrdersActions.orderUpdated({ order: orders[0] }));
            }
          });
        })
      ),
      { dispatch: false }
    );
  }
}
