import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Customer } from './customers.models';
import * as CustomersActions from './customers.actions';

export interface CustomersState extends EntityState<Customer> {
  loading: boolean;
  error: string | null;
}

export const customersAdapter: EntityAdapter<Customer> = createEntityAdapter<Customer>({
  selectId: (customer: Customer) => customer.id,
  sortComparer: (a: Customer, b: Customer) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
});

export const initialState: CustomersState = customersAdapter.getInitialState({
  loading: false,
  error: null
});

export const customersReducer = createReducer(
  initialState,
  on(CustomersActions.loadCustomers, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CustomersActions.loadCustomersSuccess, (state, { customers }) =>
    customersAdapter.setAll(customers, {
      ...state,
      loading: false
    })
  ),
  on(CustomersActions.loadCustomersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(CustomersActions.createCustomerSuccess, (state, { customer }) =>
    customersAdapter.addOne(customer, state)
  ),
  on(CustomersActions.updateCustomerSuccess, (state, { customerId, customer }) =>
    customersAdapter.updateOne(
      { id: customerId.toString(), changes: customer },
      state
    )
  ),
  on(CustomersActions.deleteCustomerSuccess, (state, { customerId }) =>
    customersAdapter.removeOne(customerId.toString(), state)
  )
);

export const {
  selectIds: selectCustomerIds,
  selectEntities: selectCustomerEntities,
  selectAll: selectAllCustomers,
  selectTotal: selectTotalCustomers
} = customersAdapter.getSelectors();

export const selectCustomersLoading = (state: CustomersState) => state.loading;
export const selectCustomersError = (state: CustomersState) => state.error;
