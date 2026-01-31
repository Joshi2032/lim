import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { CustomerAddress } from './addresses.models';
import * as AddressesActions from './addresses.actions';

export interface AddressesState extends EntityState<CustomerAddress> {
  loading: boolean;
  error: string | null;
  currentCustomerId: string | null;
}

export const adapter: EntityAdapter<CustomerAddress> = createEntityAdapter<CustomerAddress>({
  selectId: (address: CustomerAddress) => String(address.id)
});

const initialState: AddressesState = adapter.getInitialState({
  loading: false,
  error: null,
  currentCustomerId: null
});

export const addressesReducer = createReducer(
  initialState,
  // Load Customer Addresses
  on(AddressesActions.loadCustomerAddresses, (state, { customerId }) => ({
    ...state,
    loading: true,
    error: null,
    currentCustomerId: String(customerId)
  })),
  on(AddressesActions.loadCustomerAddressesSuccess, (state, { addresses }) =>
    adapter.setAll(addresses, { ...state, loading: false })
  ),
  on(AddressesActions.loadCustomerAddressesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Create Address
  on(AddressesActions.createAddress, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AddressesActions.createAddressSuccess, (state, { address }) =>
    adapter.addOne(address, { ...state, loading: false })
  ),
  on(AddressesActions.createAddressFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Update Address
  on(AddressesActions.updateAddress, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AddressesActions.updateAddressSuccess, (state, { address }) =>
    adapter.updateOne({ id: String(address.id), changes: address }, { ...state, loading: false })
  ),
  on(AddressesActions.updateAddressFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Delete Address
  on(AddressesActions.deleteAddress, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AddressesActions.deleteAddressSuccess, (state, { addressId }) =>
    adapter.removeOne(String(addressId), { ...state, loading: false })
  ),
  on(AddressesActions.deleteAddressFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Subscribe to Customer Addresses
  on(AddressesActions.subscribeToCustomerAddresses, (state, { customerId }) => ({
    ...state,
    currentCustomerId: String(customerId)
  })),
  on(AddressesActions.customerAddressesUpdated, (state, { addresses }) =>
    adapter.setAll(addresses, state)
  )
);
