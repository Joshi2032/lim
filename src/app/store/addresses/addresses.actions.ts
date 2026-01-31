import { createAction, props } from '@ngrx/store';
import { CustomerAddress } from './addresses.models';

// Load Addresses by Customer
export const loadCustomerAddresses = createAction(
  '[Addresses Page] Load Customer Addresses',
  props<{ customerId: string | number }>()
);

export const loadCustomerAddressesSuccess = createAction(
  '[Addresses API] Load Customer Addresses Success',
  props<{ customerId: string | number; addresses: CustomerAddress[] }>()
);

export const loadCustomerAddressesFailure = createAction(
  '[Addresses API] Load Customer Addresses Failure',
  props<{ error: string }>()
);

// Create Address
export const createAddress = createAction(
  '[Addresses Page] Create Address',
  props<{ customerId: string | number; address: Omit<CustomerAddress, 'id'> }>()
);

export const createAddressSuccess = createAction(
  '[Addresses API] Create Address Success',
  props<{ address: CustomerAddress }>()
);

export const createAddressFailure = createAction(
  '[Addresses API] Create Address Failure',
  props<{ error: string }>()
);

// Update Address
export const updateAddress = createAction(
  '[Addresses Page] Update Address',
  props<{ address: CustomerAddress }>()
);

export const updateAddressSuccess = createAction(
  '[Addresses API] Update Address Success',
  props<{ address: CustomerAddress }>()
);

export const updateAddressFailure = createAction(
  '[Addresses API] Update Address Failure',
  props<{ error: string }>()
);

// Delete Address
export const deleteAddress = createAction(
  '[Addresses Page] Delete Address',
  props<{ addressId: string | number }>()
);

export const deleteAddressSuccess = createAction(
  '[Addresses API] Delete Address Success',
  props<{ addressId: string | number }>()
);

export const deleteAddressFailure = createAction(
  '[Addresses API] Delete Address Failure',
  props<{ error: string }>()
);

// Real-time Subscription
export const subscribeToCustomerAddresses = createAction(
  '[Addresses Page] Subscribe To Customer Addresses',
  props<{ customerId: string | number }>()
);

export const customerAddressesUpdated = createAction(
  '[Addresses API] Customer Addresses Updated Via Subscription',
  props<{ customerId: string | number; addresses: CustomerAddress[] }>()
);
