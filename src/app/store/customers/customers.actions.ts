import { createAction, props } from '@ngrx/store';
import { Customer } from './customers.models';

export const loadCustomers = createAction('[Customers Page] Load Customers');

export const loadCustomersSuccess = createAction(
  '[Customers API] Load Customers Success',
  props<{ customers: Customer[] }>()
);

export const loadCustomersFailure = createAction(
  '[Customers API] Load Customers Failure',
  props<{ error: string }>()
);

export const createCustomer = createAction(
  '[Customers Page] Create Customer',
  props<{ phone: string; name?: string; email?: string }>()
);

export const createCustomerSuccess = createAction(
  '[Customers API] Create Customer Success',
  props<{ customer: Customer }>()
);

export const createCustomerFailure = createAction(
  '[Customers API] Create Customer Failure',
  props<{ error: string }>()
);

export const updateCustomer = createAction(
  '[Customers Page] Update Customer',
  props<{ customerId: number; customer: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>> }>()
);

export const updateCustomerSuccess = createAction(
  '[Customers API] Update Customer Success',
  props<{ customerId: number; customer: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>> }>()
);

export const updateCustomerFailure = createAction(
  '[Customers API] Update Customer Failure',
  props<{ error: string }>()
);

export const deleteCustomer = createAction(
  '[Customers Page] Delete Customer',
  props<{ customerId: number }>()
);

export const deleteCustomerSuccess = createAction(
  '[Customers API] Delete Customer Success',
  props<{ customerId: number }>()
);

export const deleteCustomerFailure = createAction(
  '[Customers API] Delete Customer Failure',
  props<{ error: string }>()
);
