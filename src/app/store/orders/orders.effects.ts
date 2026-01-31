import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { SupabaseService } from '../../core/services/supabase.service';
import * as OrdersActions from './orders.actions';

@Injectable()
export class OrdersEffects {
  loadOrders$ = createEffect(() =>
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

  loadOrdersByType$ = createEffect(() =>
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

  loadOrdersByStatus$ = createEffect(() =>
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

  createOrder$ = createEffect(() =>
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

  createOrderWithItems$ = createEffect(() =>
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

  updateOrderStatus$ = createEffect(() =>
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

  deleteOrder$ = createEffect(() =>
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

  subscribeToOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrdersActions.subscribeToOrders),
      tap(() => {
        this.supabase.subscribeToOrders((orders) => {
          this.actions$.pipe(
            ofType(OrdersActions.ordersUpdated)
          );
        });
      })
    ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private supabase: SupabaseService
  ) {}
}
