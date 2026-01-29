# Componentes Reutilizables - Casa Lim Restaurant

## 📋 Resumen

Se han creado múltiples componentes siguiendo el diseño de la interfaz del restaurante. Los componentes están organizados en carpetas modulares y se han identificado claramente cuáles son **reutilizables**.

## 🔄 Componentes Reutilizables

### 1. **Badge Component** (`shared/badge`)
**Propósito**: Mostrar etiquetas visuales como "Popular", "Nuevo", "Oferta"

**Props**:
- `text: string` - Texto del badge
- `type: 'popular' | 'nuevo' | 'oferta'` - Tipo de badge (define el color)

**Uso**:
```html
<app-badge text="Popular" type="popular" />
<app-badge text="Nuevo" type="nuevo" />
```

**Colores**:
- `popular`: Rosa (#e5395a)
- `nuevo`: Amarillo (#fbbf24)
- `oferta`: Verde (#22c55e)

---

### 2. **MenuItem Card Component** (`menu/menu-item-card`)
**Propósito**: Tarjeta de producto para mostrar items del menú

**Props**:
- `id: string` - ID único del item
- `name: string` - Nombre del platillo
- `japaneseName?: string` - Nombre en japonés (opcional)
- `description: string` - Descripción del platillo
- `price: number` - Precio
- `image: string` - URL de la imagen
- `badge?: { text: string; type: 'popular' | 'nuevo' | 'oferta' }` - Badge opcional

**Events**:
- `(add)` - Emite el ID del item cuando se hace clic en el botón de agregar

**Uso**:
```html
<app-menu-item-card
  id="1"
  name="Sake Caliente"
  japaneseName="熱燗"
  description="Sake tradicional japonés servido caliente"
  price="89"
  image="/assets/sake.png"
  [badge]="{ text: 'Popular', type: 'popular' }"
  (add)="handleAddToCart($event)"
/>
```

**Características**:
- Hover effect con elevación
- Botón de agregar animado
- Soporte para badges en la esquina superior derecha
- Diseño responsive

---

### 3. **Sidebar Component** (`shared/sidebar`)
**Propósito**: Barra lateral de navegación reutilizable para toda la aplicación

**Props**:
- `menuItems: MenuItem[]` - Array de items del menú
- `currentUser: User | null` - Usuario actual
- `cartCount: number` - Cantidad de items en el carrito

**Events**:
- `(logout)` - Emite cuando se hace clic en cerrar sesión

**Interfaces**:
```typescript
interface MenuItem {
  id: string;
  label: string;
  icon: string; // Emoji o HTML
  route: string;
  active?: boolean;
}

interface User {
  name: string;
  role: string;
  initials: string;
}
```

**Uso**:
```html
<app-sidebar 
  [menuItems]="sidebarItems" 
  [currentUser]="currentUser"
  [cartCount]="3"
  (logout)="handleLogout()"
/>
```

**Características**:
- Logo y nombre del restaurante en header
- Items de navegación con RouterLink
- Avatar de usuario con iniciales
- Botón de carrito con contador
- Botón de cerrar sesión
- Diseño fixed con scroll

---

## 📦 Componentes No Reutilizables (Específicos)

### Menu Component (`menu/menu`)
**Propósito**: Página principal del menú con header, filtros y grid de productos

**Características**:
- Header con título bilingüe (Español/Japonés)
- Buscador de productos
- Filtros por categoría (Todos, Rolls, Nigiri, Sashimi, etc.)
- Grid responsive de productos
- Integración con Sidebar

**No es reutilizable porque**: Es específico para la página del menú del restaurante

---

## 🎨 Estilos Globales Compartidos

Los componentes reutilizables comparten:
- Paleta de colores consistente:
  - Primario: #dc2626 (Rojo)
  - Background: #0a0a0a (Negro oscuro)
  - Cards: #1a1a1a
  - Borders: #2a2a2a
  - Texto: #fff, #999, #666
  - Acento amarillo: #fbbf24

- Gradientes:
  - Botones: `linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)`
  - Hover: `linear-gradient(90deg, #e53935 0%, #c62828 100%)`

---

## 📁 Estructura de Carpetas

```
src/app/
├── auth/                    # Autenticación
│   ├── login/
│   └── register/
├── menu/                    # Menú del restaurante
│   ├── menu/               # Componente principal (NO reutilizable)
│   └── menu-item-card/     # ✅ REUTILIZABLE
└── shared/                  # Componentes compartidos
    ├── badge/              # ✅ REUTILIZABLE
    └── sidebar/            # ✅ REUTILIZABLE
```

---

## 🚀 Cómo Usar los Componentes Reutilizables

### 1. Importar en tu componente:
```typescript
import { BadgeComponent } from './shared/badge/badge.component';
import { MenuItemCardComponent } from './menu/menu-item-card/menu-item-card.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';

@Component({
  selector: 'app-my-component',
  imports: [BadgeComponent, MenuItemCardComponent, SidebarComponent],
  // ...
})
```

### 2. Usar en el template:
```html
<!-- Badge -->
<app-badge text="Nuevo" type="nuevo" />

<!-- Menu Item Card -->
<app-menu-item-card
  [id]="item.id"
  [name]="item.name"
  [price]="item.price"
  [image]="item.image"
  (add)="onAddToCart($event)"
/>

<!-- Sidebar -->
<app-sidebar 
  [menuItems]="navItems"
  [currentUser]="user"
  [cartCount]="cartTotal"
  (logout)="onLogout()"
/>
```

---

## ✅ Ventajas de esta Arquitectura

1. **Reutilización**: Los componentes Badge, MenuItem Card y Sidebar se pueden usar en múltiples páginas
2. **Mantenibilidad**: Cambios en un componente se reflejan en toda la app
3. **Consistencia**: Diseño uniforme en toda la aplicación
4. **Escalabilidad**: Fácil agregar nuevas páginas reutilizando componentes
5. **Testing**: Componentes pequeños son más fáciles de testear
6. **Lazy Loading**: Componentes se cargan cuando se necesitan

---

## 📝 Ejemplos de Reutilización

### Caso 1: Página de Bebidas
```typescript
// Reutiliza MenuItemCard con datos de bebidas
<app-menu-item-card
  *ngFor="let drink of drinks"
  [id]="drink.id"
  [name]="drink.name"
  [price]="drink.price"
  [image]="drink.image"
  [badge]="drink.isNew ? { text: 'Nuevo', type: 'nuevo' } : undefined"
  (add)="addToCart($event)"
/>
```

### Caso 2: Panel de Administración
```typescript
// Reutiliza Sidebar con diferentes items de menú
<app-sidebar 
  [menuItems]="adminMenuItems"
  [currentUser]="admin"
  (logout)="logout()"
/>
```

### Caso 3: Promociones
```typescript
// Reutiliza Badge para ofertas especiales
<app-badge text="50% OFF" type="oferta" />
```

---

## 🔧 Próximos Pasos

1. Crear componente de Carrito (`shared/cart`)
2. Agregar animaciones a los componentes
3. Implementar loading states
4. Agregar variantes de tema (dark/light)
5. Crear más variantes de Badge (oferta, agotado, etc.)
6. Documentar props adicionales conforme se agreguen
