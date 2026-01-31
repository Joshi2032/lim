import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { isDevMode } from '@angular/core';

import { routes } from './app.routes';
import { ordersReducer } from './store/orders/orders.reducer';
import { customersReducer } from './store/customers/customers.reducer';
import { employeesReducer } from './store/employees/employees.reducer';
import { OrdersEffects } from './store/orders/orders.effects';
import { CustomersEffects } from './store/customers/customers.effects';
import { EmployeesEffects } from './store/employees/employees.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore({
      orders: ordersReducer,
      customers: customersReducer,
      employees: employeesReducer
    }),
    provideEffects([OrdersEffects, CustomersEffects, EmployeesEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })
  ]
};
