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
import { menuItemsReducer } from './store/menu-items/menu-items.reducer';
import { assignmentsReducer } from './store/assignments/assignments.reducer';
import { categoriesReducer } from './store/categories/categories.reducer';
import { combosReducer } from './store/combos/combos.reducer';
import { OrdersEffects } from './store/orders/orders.effects';
import { CustomersEffects } from './store/customers/customers.effects';
import { EmployeesEffects } from './store/employees/employees.effects';
import { MenuItemsEffects } from './store/menu-items/menu-items.effects';
import { AssignmentsEffects } from './store/assignments/assignments.effects';
import { CategoriesEffects } from './store/categories/categories.effects';
import { CombosEffects } from './store/combos/combos.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore({
      orders: ordersReducer,
      customers: customersReducer,
      employees: employeesReducer,
      menuItems: menuItemsReducer,
      assignments: assignmentsReducer,
      categories: categoriesReducer,
      combos: combosReducer
    }),
    provideEffects([
      OrdersEffects,
      CustomersEffects,
      EmployeesEffects,
      MenuItemsEffects,
      AssignmentsEffects,
      CategoriesEffects,
      CombosEffects
    ]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })
  ]
};
