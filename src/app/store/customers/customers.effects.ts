import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { SupabaseService } from '../../core/services/supabase.service';
import * as CustomersActions from './customers.actions';

@Injectable()
export class CustomersEffects {
  loadCustomers$;
  createCustomer$;
  updateCustomer$;
  deleteCustomer$;

  constructor(
    private actions$: Actions,
    private supabase: SupabaseService
  ) {
    this.loadCustomers$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CustomersActions.loadCustomers),
        switchMap(() =>
          this.supabase.getCustomers().then(
            customers => CustomersActions.loadCustomersSuccess({ customers }),
            (error: any) => CustomersActions.loadCustomersFailure({ error: error.message })
          )
        )
      )
    );

    this.createCustomer$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CustomersActions.createCustomer),
        switchMap(({ phone, name, email }) =>
          this.supabase.createOrGetCustomer(phone, name, email).then(
            (customer: any) => CustomersActions.createCustomerSuccess({ customer }),
            (error: any) => CustomersActions.createCustomerFailure({ error: error.message })
          )
        )
      )
    );

    this.updateCustomer$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CustomersActions.updateCustomer),
        switchMap(({ customerId, customer }) =>
          this.supabase.updateCustomer(customerId, customer).then(
            () => CustomersActions.updateCustomerSuccess({ customerId, customer }),
            (error: any) => CustomersActions.updateCustomerFailure({ error: error.message })
          )
        )
      )
    );

    this.deleteCustomer$ = createEffect(() =>
      this.actions$.pipe(
        ofType(CustomersActions.deleteCustomer),
        switchMap(({ customerId }) =>
          this.supabase.deleteCustomer(customerId).then(
            () => CustomersActions.deleteCustomerSuccess({ customerId }),
            (error: any) => CustomersActions.deleteCustomerFailure({ error: error.message })
          )
        )
      )
    );
  }
}
