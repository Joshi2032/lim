import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CustomersState, selectAllCustomers, selectCustomersError, selectCustomersLoading } from './customers.reducer';

export const selectCustomersState = createFeatureSelector<CustomersState>('customers');

// Base selectors
export const selectCustomers = createSelector(
  selectCustomersState,
  selectAllCustomers
);

export const selectCustomersLoadingState = createSelector(
  selectCustomersState,
  selectCustomersLoading
);

export const selectCustomersErrorState = createSelector(
  selectCustomersState,
  selectCustomersError
);

// Computed selectors
export const selectCustomerCount = createSelector(
  selectCustomers,
  customers => customers.length
);

export const selectActiveCustomers = createSelector(
  selectCustomers,
  customers => customers.filter(c => c.phone) // Filter customers with active phone
);

export const selectCustomerById = (id: string) =>
  createSelector(
    selectCustomers,
    customers => customers.find(c => c.id === id)
  );

export const selectCustomersStats = createSelector(
  selectCustomers,
  customers => ({
    total: customers.length,
    active: customers.filter(c => c.phone).length,
    withEmail: customers.filter(c => c.email).length
  })
);
