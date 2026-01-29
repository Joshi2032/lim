import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../shared/sidebar/sidebar.component';
import { MenuItemCardComponent, MenuItem } from '../menu-item-card/menu-item-card.component';
import { CartComponent, CartItem } from '../../shared/cart/cart.component';
import { BadgeComponent } from '../../shared/badge/badge.component';
import { VariantSelectorComponent } from '../variant-selector/variant-selector.component';
import { MovementsService } from '../../shared/movements/movements.service';
import { MenuService } from '../../shared/services/menu.service';
import { FilterChipsComponent, FilterOption } from '../../shared/filter-chips/filter-chips.component';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { SectionHeaderComponent } from '../../shared/section-header/section-header.component';
import { SearchInputComponent } from '../../shared/search-input/search-input.component';
import { SupabaseService, MenuItem as SupabaseMenuItem } from '../../core/services/supabase.service';

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
  imports: [CommonModule, SidebarComponent, MenuItemCardComponent, FormsModule, CartComponent, BadgeComponent, VariantSelectorComponent, FilterChipsComponent, PageHeaderComponent, SectionHeaderComponent, SearchInputComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent implements OnInit {
  searchQuery: string = '';
  selectedFilter: string = 'todos';
  cartCount: number = 0;
  isCartOpen: boolean = false;
  cartItems: CartItem[] = [];
  isVariantSelectorOpen: boolean = false;
  selectedComboForVariants: { comboId: string; itemId: string; quantity: number } | null = null;

  currentUser: User = {
    name: 'Josue',
    role: 'Dueña',
    initials: 'J'
  };

  filterOptions: FilterOption[] = [
    { id: 'todos', label: 'Todos' }
  ];

  sidebarItems: SidebarMenuItem[] = [
    { id: 'menu', label: 'Menú', icon: '🍜', route: '/menu', active: true },
    { id: 'mesas', label: 'Mesas', icon: '🪑', route: '/mesas' },
    { id: 'cocina', label: 'Cocina', icon: '🍳', route: '/cocina' },
    { id: 'recogida', label: 'Recogida', icon: '🛍️', route: '/recogida' },
    { id: 'clientes', label: 'Clientes', icon: '👥', route: '/clientes' },
    { id: 'entregas', label: 'Entregas', icon: '🚚', route: '/entregas' },
    { id: 'pedidos', label: 'Pedidos', icon: '🧾', route: '/pedidos' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { id: 'panel', label: 'Panel de Control', icon: '📈', route: '/panel-control' },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', route: '/usuarios' }
  ];

  constructor(
    private movements: MovementsService,
    private menuService: MenuService,
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMenuFromSupabase();
  }

  async loadMenuFromSupabase() {
    try {
      console.log('📋 Loading menu from Supabase...');

      // Cargar items del menú
      const supabaseItems = await this.supabase.getMenuItems();
      console.log('✅ Menu items loaded:', supabaseItems);

      // Mapear a formato local
      this.menuItems = supabaseItems.map(item => this.mapSupabaseItemToLocal(item));

      // Cargar categorías para filtros
      await this.loadCategories();

      // Cargar combos
      await this.loadCombosFromSupabase();

      // Filtrar items iniciales
      this.filterItems();

      this.cdr.markForCheck();
    } catch (error) {
      console.error('❌ Error loading menu:', error);
      alert('Error al cargar menú: ' + (error as any).message);
    }
  }

  async loadCombosFromSupabase() {
    try {
      const supabaseCombos = await this.supabase.getCombos();
      console.log('✅ Combos loaded:', supabaseCombos);

      this.combos = supabaseCombos.map(combo => ({
        id: combo.id.toString(),
        name: combo.name,
        japaneseName: combo.japanese_name || '',
        description: combo.description || '',
        price: combo.price,
        image: combo.image_url || '/assets/placeholder.png',
        items: [], // Will be populated by combo items
        category: 'combos'
      }));

      this.cdr.markForCheck();
    } catch (error) {
      console.error('❌ Error loading combos:', error);
    }
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

  async loadCategories() {
    try {
      const categories = await this.supabase.getCategories();
      console.log('✅ Categories loaded:', categories);

      // Crear filterOptions desde las categorías
      this.filterOptions = [
        { id: 'todos', label: 'Todos' },
        ...categories.map(cat => ({
          id: cat.id.toString(),
          label: cat.name
        }))
      ];

      this.cdr.markForCheck();
    } catch (error) {
      console.error('❌ Error loading categories:', error);
    }
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
    console.log('Attempting to add combo to cart:', comboId);
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
          actor: this.currentUser.name,
          role: this.currentUser.role
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
      actor: this.currentUser.name,
      role: this.currentUser.role
    });
  }

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
  }

  handleLogout() {
    console.log('Logout clicked');
    // Logout logic would go here
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
        actor: this.currentUser.name,
        role: this.currentUser.role
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
