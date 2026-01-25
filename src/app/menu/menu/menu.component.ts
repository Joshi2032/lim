import { Component, OnInit } from '@angular/core';
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
  styleUrl: './menu.component.scss'
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
    { id: 'todos', label: 'Todos' },
    { id: 'combos', label: 'Combos' },
    { id: 'rolls', label: 'Rolls' },
    { id: 'nigiri', label: 'Nigiri' },
    { id: 'sashimi', label: 'Sashimi' },
    { id: 'especiales', label: 'Especiales' },
    { id: 'bebidas', label: 'Bebidas' },
    { id: 'postres', label: 'Postres' }
  ];

  sidebarItems: SidebarMenuItem[] = [
    { id: 'menu', label: 'Menú', icon: '🍜', route: '/menu', active: true },
    { id: 'mesas', label: 'Mesas', icon: '🪑', route: '/mesas' },
    { id: 'cocina', label: 'Cocina', icon: '🍳', route: '/cocina' },
    { id: 'clientes', label: 'Clientes', icon: '👥', route: '/clientes' },
    { id: 'entregas', label: 'Entregas', icon: '🚚', route: '/entregas' },
    { id: 'pedidos', label: 'Pedidos', icon: '🧾', route: '/pedidos' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { id: 'panel', label: 'Panel de Control', icon: '📈', route: '/panel-control' },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', route: '/usuarios' }
  ];

  constructor(private movements: MovementsService, private menuService: MenuService) {}

  ngOnInit(): void {
    // Subscribe to menu items from service
    this.menuService.getMenuItems().subscribe(items => {
      this.menuItems = items;
      this.filterItems();
    });

    // Subscribe to combos from service
    this.menuService.getCombos().subscribe(combos => {
      this.combos = combos;
      this.filterItems();
    });
  }

  filters: Filter[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'combos', label: 'Combos' },
    { id: 'rolls', label: 'Rolls', labelJapanese: 'ロール' },
    { id: 'nigiri', label: 'Nigiri', labelJapanese: '握り' },
    { id: 'sashimi', label: 'Sashimi', labelJapanese: '刺身' },
    { id: 'especiales', label: 'Especiales', labelJapanese: '特別' },
    { id: 'bebidas', label: 'Bebidas', labelJapanese: '飲み物' },
    { id: 'postres', label: 'Postres', labelJapanese: 'デザート' }
  ];

  menuItems: MenuItem[] = [
    {
      id: '1',
      name: 'Ramune',
      japaneseName: 'ラムネ',
      description: 'Refresco japonés tradicional',
      price: 55,
      image: '/assets/placeholder.png',
      category: 'bebidas'
    },
    {
      id: '2',
      name: 'Sake Caliente',
      japaneseName: '熱燗',
      description: 'Sake tradicional japonés servido caliente',
      price: 89,
      image: '/assets/placeholder.png',
      category: 'bebidas',
      variants: [
        { id: 'v1', name: 'Sake Junmai' },
        { id: 'v2', name: 'Sake Ginjo' },
        { id: 'v3', name: 'Sake Daiginjo' }
      ]
    },
    {
      id: '3',
      name: 'Sake Frío Premium',
      japaneseName: '冷酒',
      description: 'Sake Junmai Daiginjo',
      price: 149,
      image: '/assets/placeholder.png',
      badge: { text: 'Popular', type: 'popular' },
      category: 'bebidas',
      variants: [
        { id: 'v1', name: 'Copa pequeña' },
        { id: 'v2', name: 'Copa estándar' },
        { id: 'v3', name: 'Botella (750ml)' }
      ]
    },
    {
      id: '4',
      name: 'Té Verde',
      japaneseName: '緑茶',
      description: 'Té verde japonés tradicional',
      price: 45,
      image: '/assets/placeholder.png',
      category: 'bebidas'
    },
    {
      id: '5',
      name: 'Omakase del Chef',
      japaneseName: 'おまかせ',
      description: 'Selección especial del chef (10 piezas)',
      price: 459,
      image: '/assets/placeholder.png',
      category: 'especiales',
      variants: [
        { id: 'v1', name: 'Selección Pescados' },
        { id: 'v2', name: 'Selección Mariscos' },
        { id: 'v3', name: 'Selección Mixta' }
      ]
    },
    {
      id: '6',
      name: 'Bento Box Deluxe',
      japaneseName: '弁当箱',
      description: 'Sashimi, tempura, arroz, ensalada y sopa miso',
      price: 349,
      image: '/assets/placeholder.png',
      badge: { text: 'Popular', type: 'popular' },
      category: 'especiales',
      variants: [
        { id: 'v1', name: 'Con Sashimi' },
        { id: 'v2', name: 'Con Tempura' },
        { id: 'v3', name: 'Mixto (Recomendado)' }
      ]
    },
    {
      id: '7',
      name: 'Chirashi Bowl',
      japaneseName: 'ちらし丼',
      description: 'Arroz con variedad de pescados frescos encima',
      price: 259,
      image: '/assets/placeholder.png',
      badge: { text: 'Nuevo', type: 'nuevo' },
      category: 'especiales',
      variants: [
        { id: 'v1', name: 'Maguro (Atún)' },
        { id: 'v2', name: 'Sake (Salmón)' },
        { id: 'v3', name: 'Mixto' }
      ]
    },
    {
      id: '8',
      name: 'Nigiri de Anguila',
      japaneseName: 'うなぎ握り',
      description: 'Dos piezas de anguila glaseada',
      price: 109,
      image: '/assets/placeholder.png',
      category: 'nigiri'
    }
  ];

  combos: Combo[] = [
    {
      id: 'c1',
      name: 'Combo Romántico',
      japaneseName: 'ロマンティック・コンボ',
      description: 'Perfecto para dos: Chirashi Bowl + Sake Frío Premium + Té Verde',
      price: 449,
      image: '/assets/placeholder.png',
      badge: { text: 'Popular', type: 'popular' },
      category: 'combos',
      items: [
        { itemId: '7', quantity: 2 },
        { itemId: '3', quantity: 2 },
        { itemId: '4', quantity: 2 }
      ]
    },
    {
      id: 'c2',
      name: 'Combo Ejecutivo',
      japaneseName: 'エグゼクティブ・コンボ',
      description: 'Almuerzo completo: Omakase del Chef + Sake Caliente + Ramune',
      price: 599,
      image: '/assets/placeholder.png',
      badge: { text: 'Nuevo', type: 'nuevo' },
      category: 'combos',
      items: [
        { itemId: '5', quantity: 1 },
        { itemId: '2', quantity: 1 },
        { itemId: '1', quantity: 1 }
      ]
    },
    {
      id: 'c3',
      name: 'Combo Familia',
      japaneseName: 'ファミリー・コンボ',
      description: 'Para 4 personas: 2x Bento Box + Omakase + 4x Bebidas variadas',
      price: 1299,
      image: '/assets/placeholder.png',
      category: 'combos',
      items: [
        { itemId: '6', quantity: 2 },
        { itemId: '5', quantity: 1 },
        { itemId: '1', quantity: 2 },
        { itemId: '3', quantity: 2 }
      ]
    },
    {
      id: 'c4',
      name: 'Combo Degustación',
      japaneseName: 'テイスティング・コンボ',
      description: 'Prueba lo mejor: Omakase + Bento Box + Chirashi + Sake Premium',
      price: 989,
      image: '/assets/placeholder.png',
      category: 'combos',
      items: [
        { itemId: '5', quantity: 1 },
        { itemId: '6', quantity: 1 },
        { itemId: '7', quantity: 1 },
        { itemId: '3', quantity: 1 }
      ]
    }
  ];

  filteredItems: MenuItem[] = this.menuItems;
  filteredCombos: Combo[] = this.combos;

  onFilterChange(filterId: any) {
    this.selectedFilter = filterId;
    this.filterItems();
  }

  onSearch() {
    this.filterItems();
  }

  filterItems() {
    let items = this.menuItems;
    let combos = this.combos;

    // Filter by category
    if (this.selectedFilter !== 'todos') {
      if (this.selectedFilter === 'combos') {
        items = [];
        combos = combos.filter(combo => combo.category === this.selectedFilter);
      } else {
        items = items.filter(item => item.category === this.selectedFilter);
        combos = [];
      }
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.japaneseName?.toLowerCase().includes(query)
      );
      combos = combos.filter(combo =>
        combo.name.toLowerCase().includes(query) ||
        combo.description.toLowerCase().includes(query) ||
        combo.japaneseName?.toLowerCase().includes(query)
      );
    }

    this.filteredItems = items;
    this.filteredCombos = combos;
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
    }
    console.log('Added to cart:', itemId);
  }

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
    console.log('Logout');
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
