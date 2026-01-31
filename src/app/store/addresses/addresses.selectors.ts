import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AddressesState, adapter } from './addresses.reducer';

export const addressesFeatureSelector = createFeatureSelector<AddressesState>('addresses');

export const {
  selectIds: selectAddressIds,
  selectEntities: selectAddressEntities,
  selectAll: selectAllAddresses,
  selectTotal: selectTotalAddresses
} = adapter.getSelectors(addressesFeatureSelector);

export const selectAddressesLoading = createSelector(
  addressesFeatureSelector,
  (state: AddressesState) => state.loading
);

export const selectAddressesError = createSelector(
  addressesFeatureSelector,
  (state: AddressesState) => state.error
);

export const selectCurrentCustomerId = createSelector(
  addressesFeatureSelector,
  (state: AddressesState) => state.currentCustomerId as string | null
);

export const selectCustomerAddresses = createSelector(
  selectAllAddresses,
  (addresses) => addresses
);
