# 📊 Análisis: Gestor de Estado para Casa Lim

## ¿Valdría la pena un gestor de estado?

**SÍ** - Especialmente considerando:
- 10+ componentes cargando datos independientemente
- Múltiples suscripciones a los mismos datos
- Sin deduplicación de queries
- Dashboard recalculando TODO en cada cambio

---

## Opciones de Gestor de Estado

### 1. **RxJS Services Pattern** ⭐ (RECOMENDADO)
**Complejidad**: ⭐☆☆
**Setup**: 30 minutos
**Dependencias nuevas**: NINGUNA (ya tiene RxJS)

```typescript
// state.service.ts
@Injectable({ providedIn: 'root' })
export class AppStateService {
  // State en BehaviorSubjects
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  private customersSubject = new BehaviorSubject<Customer[]>([]);
  private employeesSubject = new BehaviorSubject<Employee[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // Selectors (observables)
  orders$ = this.ordersSubject.asObservable();
  customers$ = this.customersSubject.asObservable();
  employees$ = this.employeesSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  // Computed selectors
  deliveryPersons$ = this.employees$.pipe(
    map(emps => emps.filter(e => e.position?.name === 'delivery'))
  );

  todayOrders$ = this.orders$.pipe(
    map(orders => orders.filter(o => this.isToday(o.created_at)))
  );

  constructor(private supabase: SupabaseService) {}

  // Actions (métodos que actualizan state)
  async loadOrders() {
    this.loadingSubject.next(true);
    try {
      const orders = await this.supabase.getOrders();
      this.ordersSubject.next(orders);
    } finally {
      this.loadingSubject.next(false);
    }
  }

  updateOrderStatus(orderId: string, status: Order['status']) {
    const current = this.ordersSubject.value;
    const updated = current.map(o =>
      o.id === orderId ? { ...o, status } : o
    );
    this.ordersSubject.next(updated);
  }

  private isToday(dateStr: string): boolean {
    // ...
  }
}
```

**Componente antes** ❌:
```typescript
export class DashboardComponent implements OnInit {
  orders: Order[] = [];
  customers: Customer[] = [];
  todayOrders: Order[] = [];

  async ngOnInit() {
    this.orders = await this.supabase.getOrders();
    this.customers = await this.supabase.getCustomers();
    this.todayOrders = this.filterTodayOrders();
  }
}
```

**Componente después** ✅:
```typescript
export class DashboardComponent implements OnInit {
  todayOrders$ = this.state.todayOrders$;
  customers$ = this.state.customers$;
  loading$ = this.state.loading$;

  ngOnInit() {
    this.state.loadOrders();
    this.state.loadCustomers();
  }

  constructor(public state: AppStateService) {}
}
```

**Template**:
```html
<div *ngIf="loading$ | async; else content">
  <app-skeleton></app-skeleton>
</div>

<ng-template #content>
  <div>
    <app-stat-card *ngFor="let order of (todayOrders$ | async)"
      [order]="order">
    </app-stat-card>
  </div>
</ng-template>
```

---

### 2. **NgRx** (Enterprise)
**Complejidad**: ⭐⭐⭐⭐⭐
**Setup**: 2-3 horas
**Dependencias**: @ngrx/store, @ngrx/effects, @ngrx/store-devtools

```typescript
// orders.state.ts
export interface OrdersState {
  items: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  items: [],
  loading: false,
  error: null
};

export const ordersReducer = createReducer(
  initialState,
  on(loadOrders, state => ({ ...state, loading: true })),
  on(loadOrdersSuccess, (state, { orders }) => ({
    ...state,
    items: orders,
    loading: false
  })),
  on(loadOrdersError, (state, { error }) => ({
    ...state,
    error,
    loading: false
  }))
);

// orders.effects.ts
@Injectable()
export class OrdersEffects {
  loadOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadOrders),
      switchMap(() =>
        this.supabase.getOrders().pipe(
          map(orders => loadOrdersSuccess({ orders })),
          catchError(error => of(loadOrdersError({ error })))
        )
      )
    )
  );
}
```

**Componente**:
```typescript
export class DashboardComponent {
  orders$ = this.store.select(selectOrders);
  loading$ = this.store.select(selectLoading);

  ngOnInit() {
    this.store.dispatch(loadOrders());
  }

  constructor(private store: Store) {}
}
```

**Ventajas**: 
- Muy completo
- Redux DevTools para debugging
- Testing más fácil

**Desventajas**:
- Boilerplate (10x más código)
- Curva de aprendizaje pronunciada
- Overkill para esta app

---

### 3. **Akita**
**Complejidad**: ⭐⭐⭐
**Setup**: 1 hora
**Dependencias**: @datorama/akita

Punto medio entre RxJS y NgRx. No recomendado para ti (menos comunidad).

---

## Recomendación: RxJS Services Pattern

### ✅ Ventajas
- **Cero dependencias nuevas** - Ya tienes RxJS
- **Fácil de entender** - Menos boilerplate
- **Rápido de implementar** - 30-60 minutos
- **Debuggable** - Con Redux DevTools plugin
- **Escalable** - Puedes migrar a NgRx después

### ❌ Desventajas
- Menos estructura que NgRx
- Sin time-travel debugging nativo
- Requiere disciplina del equipo

---

## Plan de Migración

### **Fase 1** (30 min) - Core Services
```
1. Crear AppStateService
2. Migrar estado de: Orders, Customers, Employees
3. Crear computed selectors
```

### **Fase 2** (1 hora) - Components
```
1. DashboardComponent
2. TablesComponent
3. MenuComponent
```

### **Fase 3** (1 hora) - Testing
```
1. Pruebas E2E
2. Performance testing
3. Memory profiling
```

**Total**: ~3 horas

---

## Ejemplo Completo: AppStateService

```typescript
// app.state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay, distinctUntilChanged } from 'rxjs/operators';
import { SupabaseService, Order, Customer, Employee } from '../core/services/supabase.service';

interface AppState {
  orders: Order[];
  customers: Customer[];
  employees: Employee[];
  loading: boolean;
  error: string | null;
}

const initialState: AppState = {
  orders: [],
  customers: [],
  employees: [],
  loading: false,
  error: null
};

@Injectable({ providedIn: 'root' })
export class AppStateService {
  private stateSubject = new BehaviorSubject<AppState>(initialState);
  
  // Public observables
  state$ = this.stateSubject.asObservable();
  
  // Selectors
  orders$ = this.selectOrders();
  customers$ = this.selectCustomers();
  employees$ = this.selectEmployees();
  loading$ = this.stateSubject.pipe(
    map(s => s.loading),
    distinctUntilChanged(),
    shareReplay(1)
  );

  // Computed selectors
  deliveryPersons$ = this.employees$.pipe(
    map(emps => emps.filter(e => e.position?.name === 'delivery')),
    shareReplay(1)
  );

  todayOrders$ = this.orders$.pipe(
    map(orders => this.filterTodayOrders(orders)),
    shareReplay(1)
  );

  ordersStats$ = this.orders$.pipe(
    map(orders => ({
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      completed: orders.filter(o => o.status === 'completed').length,
      revenue: orders.reduce((sum, o) => sum + o.total_price, 0)
    })),
    shareReplay(1)
  );

  constructor(private supabase: SupabaseService) {}

  // =============== ORDERS ===============
  
  async loadOrders() {
    this.setLoading(true);
    try {
      const orders = await this.supabase.getOrders();
      this.updateState({ orders });
      
      // Subscribe a cambios en tiempo real
      this.supabase.subscribeToOrders((orders) => {
        this.updateState({ orders });
      });
    } catch (error) {
      this.setError('Error loading orders: ' + error);
    } finally {
      this.setLoading(false);
    }
  }

  updateOrderStatus(orderId: string, status: Order['status']) {
    const orders = this.stateSubject.value.orders.map(o =>
      o.id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o
    );
    this.updateState({ orders });
  }

  addOrder(order: Order) {
    const orders = [...this.stateSubject.value.orders, order];
    this.updateState({ orders });
  }

  // =============== CUSTOMERS ===============

  async loadCustomers() {
    this.setLoading(true);
    try {
      const customers = await this.supabase.getCustomers();
      this.updateState({ customers });
    } catch (error) {
      this.setError('Error loading customers: ' + error);
    } finally {
      this.setLoading(false);
    }
  }

  // =============== EMPLOYEES ===============

  async loadEmployees() {
    this.setLoading(true);
    try {
      const employees = await this.supabase.getEmployees();
      this.updateState({ employees });
    } catch (error) {
      this.setError('Error loading employees: ' + error);
    } finally {
      this.setLoading(false);
    }
  }

  // =============== HELPERS ===============

  private selectOrders(): Observable<Order[]> {
    return this.stateSubject.pipe(
      map(s => s.orders),
      distinctUntilChanged(),
      shareReplay(1)
    );
  }

  private selectCustomers(): Observable<Customer[]> {
    return this.stateSubject.pipe(
      map(s => s.customers),
      distinctUntilChanged(),
      shareReplay(1)
    );
  }

  private selectEmployees(): Observable<Employee[]> {
    return this.stateSubject.pipe(
      map(s => s.employees),
      distinctUntilChanged(),
      shareReplay(1)
    );
  }

  private updateState(partial: Partial<AppState>) {
    const current = this.stateSubject.value;
    this.stateSubject.next({ ...current, ...partial });
  }

  private setLoading(loading: boolean) {
    this.updateState({ loading });
  }

  private setError(error: string) {
    this.updateState({ error });
  }

  private filterTodayOrders(orders: Order[]): Order[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return orders.filter(o => {
      const orderDate = new Date(o.created_at);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });
  }
}
```

---

## Impacto Esperado

| Métrica | Antes | Después |
|---------|-------|---------|
| Queries por página | 4-6 | 1 |
| Memory footprint | Alto | Bajo |
| Suscripciones activas | 3-5 por componente | 1 global |
| Mantenibilidad | Baja | Alta |
| Testing | Difícil | Fácil |
| Performance | 100ms | 50-60ms |

---

## Próximos Pasos

1. **¿Quieres que implemente AppStateService?**
2. **¿Qué datos priorizar?** (Orders, Customers, Employees, etc)
3. **¿Migración gradual o todo de una vez?**
