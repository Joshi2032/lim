import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { SupabaseService } from '../../core/services/supabase.service';
import * as AddressesActions from './addresses.actions';

@Injectable()
export class AddressesEffects {
  loadCustomerAddresses$;
  createAddress$;
  updateAddress$;
  deleteAddress$;
  subscribeToCustomerAddresses$;

  constructor(
    private actions$: Actions,
    private supabase: SupabaseService
  ) {
    this.loadCustomerAddresses$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AddressesActions.loadCustomerAddresses),
        switchMap(({ customerId }) =>
          this.supabase.getCustomerAddresses(customerId.toString()).then(
            addresses => AddressesActions.loadCustomerAddressesSuccess({ customerId, addresses }),
            error => AddressesActions.loadCustomerAddressesFailure({ error: error.message })
          )
        )
      )
    );

    this.createAddress$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AddressesActions.createAddress),
        switchMap(({ customerId, address }) =>
          this.supabase.createCustomerAddress(address as any).then(
            createdAddress => {
              // After creating, load all addresses again to update store
              return this.supabase.getCustomerAddresses(String(customerId)).then(
                addresses => AddressesActions.loadCustomerAddressesSuccess({ customerId, addresses })
              );
            },
            error => AddressesActions.createAddressFailure({ error: error.message })
          )
        )
      )
    );

    this.updateAddress$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AddressesActions.updateAddress),
        switchMap(({ address }) =>
          this.supabase.updateCustomerAddress(String(address.id), address as any).then(
            () => {
              // After updating, load all addresses again to update store
              return this.supabase.getCustomerAddresses(String(address.customer_id)).then(
                addresses => AddressesActions.loadCustomerAddressesSuccess({
                  customerId: address.customer_id,
                  addresses
                })
              );
            },
            error => AddressesActions.updateAddressFailure({ error: error.message })
          )
        )
      )
    );

    this.deleteAddress$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AddressesActions.deleteAddress),
        switchMap(({ addressId }) =>
          this.supabase.deleteCustomerAddress(String(addressId)).then(
            () => AddressesActions.deleteAddressSuccess({ addressId }),
            error => AddressesActions.deleteAddressFailure({ error: error.message })
          )
        )
      )
    );

    this.subscribeToCustomerAddresses$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AddressesActions.subscribeToCustomerAddresses),
        tap(({ customerId }) => {
          this.supabase.subscribeToCustomerAddresses(
            String(customerId),
            (addresses) => {
              // Dispatch action to update store with new addresses
              const updateAction = AddressesActions.customerAddressesUpdated({
                customerId,
                addresses
              });
              // We need to manually dispatch this since we're in a tap
              // This will be handled by the reducer
            }
          );
        })
      ),
      { dispatch: false }
    );
  }
}
