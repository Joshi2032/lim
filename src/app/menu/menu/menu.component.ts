import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuItemCardComponent, MenuItem } from '../menu-item-card/menu-item-card.component';
import { CartComponent, CartItem } from '../../shared/cart/cart.component';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { VariantSelectorComponent } from '../variant-selector/variant-selector.component';
import { MovementsService } from '../../shared/movements/movements.service';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { FilterChipsComponent, FilterOption } from '../../shared/filter-chips/filter-chips.component';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { SectionHeaderComponent } from '../../shared/section-header/section-header.component';
import { SearchInputComponent } from '../../shared/search-input/search-input.component';
import { MenuItem as SupabaseMenuItem, Category as SupabaseCategory, Combo as SupabaseCombo } from '../../core/services/supabase.service';
import * as MenuItemsActions from '../../store/menu-items/menu-items.actions';
import { selectAvailableMenuItems } from '../../store/menu-items/menu-items.selectors';
import * as CategoriesActions from '../../store/categories/categories.actions';
import { selectCategories } from '../../store/categories/categories.selectors';
import * as CombosActions from '../../store/combos/combos.actions';
import { selectCombos } from '../../store/combos/combos.selectors';
import * as OrdersActions from '../../store/orders/orders.actions';

interface Filter {
	id: string;
	label: string;
	labelJapanese?: string;
}

interface ComboItem {
	itemId: string;
	quantity: number;
}

interface Combo {
	id: string;
	name: string;
	japaneseName?: string;
	description: string;
	price: number;
	image: string;
	items: ComboItem[];
	badge?: { text: string; type: 'popular' | 'nuevo' | 'oferta' };
	category: string;
}

@Component({
  selector: 'app-menu',
  imports: [CommonModule, MenuItemCardComponent, FormsModule, CartComponent, BadgeComponent, VariantSelectorComponent, FilterChipsComponent, PageHeaderComponent, SectionHeaderComponent, SearchInputComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent implements OnInit, OnDestroy {
  searchQuery: string = '';
  selectedFilter: string = 'todos';
  cartCount: number = 0;
  isCartOpen: boolean = false;
  cartItems: CartItem[] = [];
  isVariantSelectorOpen: boolean = false;
  selectedComboForVariants: { comboId: string; itemId: string; quantity: number } | null = null;

  filterOptions: FilterOption[] = [
    { id: 'todos', label: 'Todos' }
  ];

  menuItems$: Observable<SupabaseMenuItem[]>;
  categories$: Observable<SupabaseCategory[]>;
  combos$: Observable<SupabaseCombo[]>;
  private subscriptions = new Subscription();

  constructor(
    private movements: MovementsService,
    private store: Store,
    private cdr: ChangeDetectorRef
  ) {
    this.menuItems$ = this.store.select(selectAvailableMenuItems);
    this.categories$ = this.store.select(selectCategories);
    this.combos$ = this.store.select(selectCombos);
  }

  ngOnInit(): void {
    this.store.dispatch(MenuItemsActions.loadMenuItems());
    this.store.dispatch(MenuItemsActions.subscribeToMenuItems());
    this.store.dispatch(CategoriesActions.loadCategories());
    this.store.dispatch(CombosActions.loadCombos());
    this.store.dispatch(CombosActions.subscribeToCombos());

    this.subscriptions.add(
      this.menuItems$.subscribe(items => {
        this.menuItems = items.map(item => this.mapSupabaseItemToLocal(item));
        this.filterItems();
        this.cdr.markForCheck();
      })
    );

    this.subscriptions.add(
      this.categories$.subscribe(categories => {
        this.filterOptions = [
          { id: 'todos', label: 'Todos' },
          ...categories.map(cat => ({
            id: cat.id.toString(),
            label: cat.name
          }))
        ];
        this.cdr.markForCheck();
      })
    );

    this.subscriptions.add(
      this.combos$.subscribe(combos => {
        this.combos = combos.map(combo => ({
          id: combo.id.toString(),
          name: combo.name,
          japaneseName: combo.japanese_name || '',
          description: combo.description || '',
          price: combo.price,
          image: combo.image_url || '/assets/placeholder.png',
          items: [],
          category: 'combos'
        }));
        this.filterItems();
        this.cdr.markForCheck();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  filterItems() {
    if (this.selectedFilter === 'todos') {
      this.filteredItems = [...this.menuItems];
      this.filteredCombos = [...this.combos];
    } else {
      this.filteredItems = this.menuItems.filter(item => item.category === this.selectedFilter);
      this.filteredCombos = this.combos.filter(combo => combo.category === 'combos');
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      this.filteredItems = this.filteredItems.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
      this.filteredCombos = this.filteredCombos.filter(combo =>
        combo.name.toLowerCase().includes(query) ||
        combo.description.toLowerCase().includes(query)
      );
    }

    this.cdr.markForCheck();
  }

  onSearch() {
    this.filterItems();
  }

  onFilterChange(filterId: string | number) {
    this.selectedFilter = String(filterId);
    this.filterItems();
  }


  private mapSupabaseItemToLocal(supabaseItem: SupabaseMenuItem): MenuItem {
    return {
      id: supabaseItem.id.toString(),
      name: supabaseItem.name,
      description: supabaseItem.description,
      price: supabaseItem.price,
      image: supabaseItem.image_url || '/assets/placeholder.png',
      category: supabaseItem.category_id
    };
  }

  menuItems: MenuItem[] = [];
  combos: Combo[] = [];
  filteredItems: MenuItem[] = [];
  filteredCombos: Combo[] = [];

  handleAddComboToCart(comboId: string) {
    const combo = this.combos.find(c => c.id === comboId);
    if (combo) {
      // Revisar si algún item tiene variantes
      const itemsWithVariants = combo.items.filter(comboItem => {
        const menuItem = this.getMenuItemById(comboItem.itemId);
        return menuItem && menuItem.variants && menuItem.variants.length > 0;
      });

      if (itemsWithVariants.length > 0) {
        // Mostrar selector de variantes para el primer item con variantes
        const firstItemWithVariants = itemsWithVariants[0];
        this.selectedComboForVariants = {
          comboId,
          itemId: firstItemWithVariants.itemId,
          quantity: firstItemWithVariants.quantity
        };
        this.isVariantSelectorOpen = true;
      } else {
        // Agregar directamente si no tiene variantes
        this.addComboToCartDirect(combo);
      }
    }
  }

  onVariantConfirm(event: { item: MenuItem; variant: any; quantity: number }) {
    if (this.selectedComboForVariants) {
      const combo = this.combos.find(c => c.id === this.selectedComboForVariants!.comboId);
      if (combo) {
        // Crear item del combo con variante
        const cartItemId = `${combo.id}-${event.item.id}-${event.variant.id}`;
        const existingItem = this.cartItems.find(c => c.id === cartItemId);

        if (existingItem) {
          existingItem.quantity += event.quantity;
        } else {
          this.cartItems.push({
            id: cartItemId,
            name: `${combo.name} - ${event.item.name}`,
            price: combo.price / combo.items.length, // Prorratear precio del combo
            quantity: event.quantity,
            variant: { id: event.variant.id, name: event.variant.name }
          });
        }
        this.cartCount += event.quantity;
        this.isCartOpen = true;

        this.movements.log({
          title: 'Combo con variante',
          description: `${combo.name} (${event.item.name} - ${event.variant.name}) x${event.quantity}`,
          section: 'menu',
          status: 'success',
          actor: 'Usuario',
          role: 'Sistema'
        });
      }
    }
    this.isVariantSelectorOpen = false;
    this.selectedComboForVariants = null;
  }

  addComboToCartDirect(combo: Combo) {
    const existingItem = this.cartItems.find(c => c.id === combo.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cartItems.push({
        id: combo.id,
        name: combo.name,
        price: combo.price,
        quantity: 1
      });
    }
    this.cartCount++;
    this.isCartOpen = true;

    this.movements.log({
      title: 'Combo agregado',
      description: `${combo.name} añadido al carrito`,
      section: 'menu',
      status: 'success',
      actor: 'Usuario',
      role: 'Sistema'
    });
  }

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
  }

  handleCheckout(items: CartItem[]) {
    if (items.length === 0) return;

    // Calcular total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Crear los items de la orden
    const orderItems = items.map(item => ({
      menu_item_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
      subtotal: item.price * item.quantity,
      variant_name: item.variant?.name
    }));

    // Crear la orden con tipo 'dine-in' y estado 'pending'
    this.store.dispatch(OrdersActions.createOrderWithItems({
      order: {
        order_number: `ORD-${Date.now()}`,
        customer_name: 'Cliente en sitio',
        order_type: 'dine-in',
        status: 'pending',
        total_price: total
      },
      items: orderItems
    }));

    // Limpiar el carrito
    this.cartItems = [];
    this.cartCount = 0;
    this.isCartOpen = false;
    this.cdr.markForCheck();

    // Registrar movimiento
    this.movements.log({
      title: 'Pedido creado',
      description: `Nueva orden creada con ${items.length} items por $${total}`,
      section: 'menu',
      status: 'success',
      actor: 'Usuario',
      role: 'Sistema'
    });
  }

  handleAddToCart(itemId: string) {
    const item = this.menuItems.find(m => m.id === itemId);
    if (item) {
      const existingItem = this.cartItems.find(c => c.id === itemId);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        this.cartItems.push({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1
        });
      }
      this.cartCount++;
      this.isCartOpen = true;

      this.movements.log({
        title: 'Producto agregado',
        description: `${item.name} añadido al carrito`,
        section: 'menu',
        status: 'success',
        actor: 'Usuario',
        role: 'Sistema'
      });

      this.cdr.markForCheck();
    }
  }

  getMenuItemById(itemId: string): MenuItem | undefined {
    return this.menuItems.find(item => item.id === itemId);
  }
}

// Extend MenuItem interface to include category
declare module '../menu-item-card/menu-item-card.component' {
  interface MenuItem {
    category?: string;
  }
}
