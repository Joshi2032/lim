# NgRx Implementation - Casa Lim

## Overview
This document describes the NgRx state management implementation for the Casa Lim restaurant management application.

## Installation
The following NgRx packages have been installed (v19, compatible with Angular 19):
- `@ngrx/store@19` - Core state management
- `@ngrx/effects@19` - Side effects (async operations)
- `@ngrx/entity@19` - Entity management utilities
- `@ngrx/store-devtools@19` - Redux DevTools integration

## Store Modules Implemented

### 1. Orders Store (`src/app/store/orders/`)
**Purpose**: Manage all order-related state centrally

**Files**:
- `orders.actions.ts` - 13 actions (load, loadByType, loadByStatus, create, updateStatus, delete, subscribe)
- `orders.reducer.ts` - EntityAdapter pattern with all state transitions
- `orders.effects.ts` - 7 effects handling async operations
- `orders.selectors.ts` - 7 selectors including computed stats (revenue, counts, avgTicket)

**Key Features**:
- Entity adapter for normalized state
- Real-time subscription support via subscribeToOrders effect
- Computed selectors for today's orders and statistics
- Filter orders by type (dine-in, pickup, delivery) or status

### 2. Customers Store (`src/app/store/customers/`)
**Purpose**: Manage customer data and operations

**Files**:
- `customers.actions.ts` - 11 actions (load, createOrGet, update, delete)
- `customers.reducer.ts` - EntityAdapter with sorted by created_at
- `customers.effects.ts` - 4 effects using SupabaseService methods
- `customers.selectors.ts` - Selectors for active customers, stats, and by ID lookup

**Key Features**:
- Uses `createOrGetCustomer` for deduplication
- Tracks active customers (with phone number)
- Statistics include total, active, and customers with email

### 3. Employees Store (`src/app/store/employees/`)
**Purpose**: Manage employee data with position relationships

**Files**:
- `employees.actions.ts` - 14 actions (load, loadPositions, create, update, delete)
- `employees.reducer.ts` - EntityAdapter sorted by full_name, includes positions state
- `employees.effects.ts` - 5 effects for CRUD operations and position loading
- `employees.selectors.ts` - Rich selectors for filtering by position (delivery, chef, waiter)

**Key Features**:
- Integrated positions management (admin, chef, waiter, delivery, cashier)
- Computed selectors for employees by position
- Statistics by position and availability

## Configuration

The store is configured in `src/app/app.config.ts`:

```typescript
provideStore({
  orders: ordersReducer,
  customers: customersReducer,
  employees: employeesReducer
}),
provideEffects([OrdersEffects, CustomersEffects, EmployeesEffects]),
provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })
```

## Architecture Pattern

All store modules follow the same pattern:

```
┌─────────────┐
│  Component  │ dispatch(action)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Actions   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Effects   │ ────► SupabaseService ────► Supabase DB
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Reducer   │ ────► EntityAdapter
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Selectors  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Component  │ store.select(selector) | async
└─────────────┘
```

## Usage Examples

### Dispatching Actions
```typescript
// Load all orders
this.store.dispatch(OrdersActions.loadOrders());

// Create new order
this.store.dispatch(OrdersActions.createOrder({ 
  orderData: { customer_name: 'John', order_type: 'dine-in', ... }
}));

// Update order status
this.store.dispatch(OrdersActions.updateOrderStatus({ 
  orderId: '123', 
  status: 'ready' 
}));
```

### Selecting Data
```typescript
// Select all orders
orders$ = this.store.select(selectOrders);

// Select today's orders
todayOrders$ = this.store.select(selectTodayOrders);

// Select orders by status
pendingOrders$ = this.store.select(selectOrdersByStatus('pending'));

// Select computed statistics
orderStats$ = this.store.select(selectOrdersStats);
// Returns: { total, pending, preparing, ready, completed, cancelled, revenue, avgTicket }
```

### Component Integration
```typescript
@Component({
  // ...
})
export class DashboardComponent implements OnInit {
  orders$ = this.store.select(selectTodayOrders);
  stats$ = this.store.select(selectOrdersStats);
  loading$ = this.store.select(selectOrdersLoadingState);

  constructor(private store: Store) {}

  ngOnInit() {
    // Dispatch load action
    this.store.dispatch(OrdersActions.loadOrders());
  }
}
```

Template:
```html
<div *ngIf="loading$ | async">Loading...</div>
<div *ngFor="let order of orders$ | async">
  {{ order.customer_name }} - {{ order.total_price | currency }}
</div>

<div *ngIf="stats$ | async as stats">
  Total: {{ stats.total }}
  Revenue: {{ stats.revenue | currency }}
  Avg Ticket: {{ stats.avgTicket | currency }}
</div>
```

## Benefits Achieved

1. **Centralized State**: All data flows through a single store
2. **Predictable Updates**: Actions are the only way to change state
3. **Debugging**: Redux DevTools for time-travel debugging
4. **Performance**: Memoized selectors prevent unnecessary recalculations
5. **Testability**: Pure functions (reducers, selectors) easy to test
6. **Maintainability**: Clear separation of concerns (actions, effects, reducers, selectors)

## Migration Status

### ✅ Completed
- NgRx packages installed
- Store modules created (Orders, Customers, Employees)
- Store configured in app.config.ts
- Compilation errors fixed
- Application builds successfully

### ⏳ Pending
- Migrate DashboardComponent to use Orders store
- Migrate AssignmentsComponent to use store dispatches
- Migrate ProductsManagementComponent to use store
- Remove manual Supabase subscriptions from components
- Add loading/error UI based on store state
- Implement real-time subscription effects
- Add menu items store module
- Add categories store module
- Add assignments store module

## DevTools

Redux DevTools is configured and available in development mode. To use:

1. Install Redux DevTools extension for Chrome/Firefox
2. Open DevTools while running `ng serve`
3. Navigate to Redux tab
4. View action history, state tree, time-travel debug

## Testing

Store modules can be tested using:

```typescript
import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

describe('Orders Selectors', () => {
  let store: MockStore;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({ initialState: {} })]
    });
    store = TestBed.inject(MockStore);
  });

  it('should select today orders', () => {
    // Test implementation
  });
});
```

## Next Steps

1. **Component Migration**: Update components to use `store.select()` instead of direct Supabase calls
2. **Real-time Updates**: Configure effects to listen to Supabase subscriptions and dispatch updates
3. **Error Handling**: Implement global error handling in effects
4. **Loading States**: Add UI indicators based on loading states
5. **Optimistic Updates**: Implement optimistic UI updates for better UX
6. **Persistence**: Consider adding state persistence with @ngrx/store-persistence (optional)

## Resources

- [NgRx Documentation](https://ngrx.io/)
- [NgRx Entity](https://ngrx.io/guide/entity)
- [NgRx Effects](https://ngrx.io/guide/effects)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
