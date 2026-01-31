# 📊 Auditoría de Flujo de Datos - Casa Lim

## Estado de Tablas en Base de Datos

```
✅ categories - 6 rows
✅ menu_items - 9 rows
✅ combos - 0 rows ⚠️ (sin combo_items: 0)
✅ customers - 1 row
✅ customer_addresses - 2 rows
✅ employees - 6 rows
✅ orders - 2 rows
✅ order_items - 2 rows
✅ restaurant_tables - 12 rows

❌ combo_items - 0 rows (esperando combos)
❌ cash_register_shifts - 0 rows (no implementado)
❌ inventory - 0 rows (no implementado)
❌ inventory_movements - 0 rows (no implementado)
❌ payments - 0 rows (no implementado)
❌ print_jobs - 0 rows (no implementado)
❌ order_status_history - 0 rows (no implementado)
❌ delivery_zones - 0 rows (no implementado)
```

## Flujos de Datos Implementados ✅

### 1. CLIENTES (Customers)
**Ubicación**: `/orders/customers`
- ✅ Crear cliente: `createOrGetCustomer()`
- ✅ Cargar clientes: `getCustomers()`
- ✅ Actualizar cliente: `updateCustomer()`
- ✅ Eliminar cliente: `deleteCustomer()`
- ✅ Direcciones: `subscribeToCustomerAddresses()`

**Punto de guardado**: CustomersComponent.createCustomerInSupabase()
**Verificación**: Aparecen en la tabla después de crear ✓

---

### 2. EMPLEADOS (Employees)
**Ubicación**: `/panel-control/usuarios`
- ✅ Crear empleado: `createEmployee()`
- ✅ Cargar empleados: `getEmployees()`
- ✅ Actualizar empleado: `updateEmployee()`
- ✅ Eliminar empleado: `deleteEmployee()`

**Mapeo de roles**:
- UI: "duena" → DB: "admin"
- UI: "chef" → DB: "chef"
- UI: "mesero" → DB: "waiter"
- UI: "repartidor" → DB: "delivery"
- UI: "cajero" → DB: "cashier"

**Punto de guardado**: UsersComponent.saveUser()
**Verificación**: 6 empleados en BD ✓

---

### 3. MENÚ - PLATOS (Menu Items)
**Ubicación**: `/panel-control/productos`
- ✅ Crear platillo: `createMenuItem()`
- ✅ Cargar platillos: `getMenuItems()`
- ✅ Actualizar platillo: `updateMenuItem()`
- ✅ Eliminar platillo: `deleteMenuItem()`
- ✅ Por categoría: `getMenuItemsByCategory()`

**Punto de guardado**: ProductsManagementComponent.addPlato()
**Verificación**: 9 items en menu_items ✓

---

### 4. MENÚ - COMBOS
**Ubicación**: `/panel-control/productos`
- ✅ Crear combo: `createCombo(comboData, itemIds)`
- ✅ Cargar combos: `getCombos()`
- ✅ Actualizar combo: `updateCombo()`
- ✅ Eliminar combo: `deleteCombo()`
- ✅ Items del combo: Tabla `combo_items`

**Punto de guardado**: ProductsManagementComponent.addCombo()
**Estado**: 0 combos en BD ⚠️
**Problema**: Revisar si el componente está guardando combos correctamente

---

### 5. PEDIDOS (Orders)
**Ubicación**: `/recogida` (pickup) / `/pedidos`
- ✅ Crear pedido: `createOrder()`
- ✅ Cargar pedidos: `getOrders()`
- ✅ Por tipo: `getOrdersByType()` (pickup/delivery/dine-in)
- ✅ Por estado: `getOrdersByStatus()`
- ✅ Actualizar estado: `updateOrderStatus()`

**Tablas relacionadas**:
- `orders` - 2 rows ✓
- `order_items` - 2 rows ✓
- `order_status_history` - 0 rows ❌

**Punto de guardado**: 
- PickupRegistrationComponent.registerOrderInSupabase()
- TablesComponent (dine-in)

---

### 6. DIRECCIONES DE CLIENTES (Customer Addresses)
**Ubicación**: `/pedidos/clientes`
- ✅ Crear dirección: `createCustomerAddress()`
- ✅ Cargar direcciones: `getCustomerAddresses()`
- ✅ Actualizar dirección: `updateCustomerAddress()`
- ✅ Eliminar dirección: `deleteCustomerAddress()`
- ✅ Suscripción real-time: `subscribeToCustomerAddresses()`

**Estado**: 2 direcciones en BD ✓

---

### 7. MESAS (Restaurant Tables)
**Ubicación**: `/mesas`
- ✅ Cargar mesas: `getTables()`
- ✅ Actualizar estado: `updateTableStatus()`
- ✅ Suscripción real-time: `subscribeToTables()`

**Estado**: 12 mesas en BD ✓

---

### 8. ASIGNACIONES (Assignments)
**Ubicación**: `/pedidos/asignaciones`
- ✅ Crear asignación: `createAssignment()`
- ✅ Cargar asignaciones: `getAssignments()`
- ✅ Actualizar asignación: `updateAssignment()`
- ✅ Eliminar asignación: `deleteAssignment()`
- ✅ Suscripción real-time: `subscribeToAssignments()`

**Estado**: Implementado en Supabase ✓
**Tabla**: `assignments` (creada con FK a orders, customers, employees)
**Métodos CRUD**: Todos implementados en SupabaseService
**Componente**: AssignmentsComponent sincronizado con BD

---

## Flujos NO Implementados ❌

### Tablas que NO se usan:
1. `cash_register_shifts` - Turnos de caja
2. `inventory` - Inventario
3. `inventory_movements` - Movimientos de inventario
4. `payments` - Pagos de pedidos
5. `print_jobs` - Trabajos de impresión
6. `order_status_history` - Historial de cambios de estado
7. `delivery_zones` - Zonas de entrega

---

## 🔍 Checklist de Verificación

### Por cada módulo, verificar:

- [ ] **Crear** → ¿Aparece en BD?
- [ ] **Leer** → ¿Se carga correctamente?
- [ ] **Actualizar** → ¿Se refleja en BD?
- [ ] **Eliminar** → ¿Se quita de BD?
- [ ] **Real-time** → ¿Se actualiza sin F5?

---

## Problemas Encontrados ⚠️

### 1. ✅ ASIGNACIONES - SOLUCIONADO
- Tabla `assignments` creada en Supabase
- Métodos CRUD implementados en SupabaseService
- AssignmentsComponent actualizado para guardar/cargar de BD
- Real-time subscriptions activadas

### 2. ✅ HISTORIAL DE ÓRDENES - SOLUCIONADO
- Método `updateOrderStatus()` ahora registra en `order_status_history`
- Se guarda automáticamente cada cambio de estado
- Tabla existente en BD pero no se usaba

### 3. Tablas sin implementar (OPCIONAL para MVP)
- `payments`, `inventory`, `print_jobs`, `delivery_zones`
- No son críticas pero limitan funcionalidad avanzada

---

## Próximos Pasos

1. **Auditar creación de combos** en ProductsManagementComponent
2. **Implementar tabla `assignments`** en Supabase
3. **Agregar métodos CRUD** para asignaciones en SupabaseService
4. **Verificar real-time** en todos los módulos
5. **Implementar tablas de inventario** (opcional para MVP)

---

## Conexiones Verificadas ✅

```
CustomersComponent → SupabaseService.createOrGetCustomer() → customers table ✓
UsersComponent → SupabaseService.createEmployee() → employees table ✓
ProductsManagementComponent → SupabaseService.createMenuItem() → menu_items table ✓
PickupRegistrationComponent → SupabaseService.createOrder() → orders table ✓
CustomersComponent → SupabaseService.createCustomerAddress() → customer_addresses table ✓
TablesComponent → SupabaseService.updateTableStatus() → restaurant_tables table ✓

AssignmentsComponent → ??? (en memoria, no en BD) ❌
```
