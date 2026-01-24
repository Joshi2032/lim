import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../shared/sidebar/sidebar.component';
import { MenuItemCardComponent, MenuItem } from '../menu-item-card/menu-item-card.component';
import { CartComponent, CartItem } from '../../shared/cart/cart.component';

interface Filter {
	id: string;
	label: string;
	labelJapanese?: string;
}

@Component({
  selector: 'app-menu',
  imports: [SidebarComponent, MenuItemCardComponent, FormsModule, CartComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  searchQuery: string = '';
  selectedFilter: string = 'todos';
  cartCount: number = 0;
  isCartOpen: boolean = false;
  cartItems: CartItem[] = [];

  currentUser: User = {
    name: 'Josue',
    role: 'Dueña',
    initials: 'J'
  };

  sidebarItems: SidebarMenuItem[] = [
    { id: 'menu', label: 'Menú', icon: '🍜', route: '/menu', active: true },
    { id: 'mesas', label: 'Mesas', icon: '🪑', route: '/mesas' },
    { id: 'cocina', label: 'Cocina', icon: '🍳', route: '/cocina' },
    { id: 'clientes', label: 'Clientes', icon: '👥', route: '/clientes' },
    { id: 'entregas', label: 'Entregas', icon: '🚚', route: '/entregas' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { id: 'panel', label: 'Panel de Control', icon: '📈', route: '/panel-control' },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', route: '/usuarios' }
  ];

  filters: Filter[] = [
    { id: 'todos', label: 'Todos' },
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
      category: 'bebidas'
    },
    {
      id: '3',
      name: 'Sake Frío Premium',
      japaneseName: '冷酒',
      description: 'Sake Junmai Daiginjo',
      price: 149,
      image: '/assets/placeholder.png',
      badge: { text: 'Popular', type: 'popular' },
      category: 'bebidas'
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
      category: 'especiales'
    },
    {
      id: '6',
      name: 'Bento Box Deluxe',
      japaneseName: '弁当箱',
      description: 'Sashimi, tempura, arroz, ensalada y sopa miso',
      price: 349,
      image: '/assets/placeholder.png',
      badge: { text: 'Popular', type: 'popular' },
      category: 'especiales'
    },
    {
      id: '7',
      name: 'Chirashi Bowl',
      japaneseName: 'ちらし丼',
      description: 'Arroz con variedad de pescados frescos encima',
      price: 259,
      image: '/assets/placeholder.png',
      badge: { text: 'Nuevo', type: 'nuevo' },
      category: 'especiales'
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

  filteredItems: MenuItem[] = this.menuItems;

  onFilterChange(filterId: string) {
    this.selectedFilter = filterId;
    this.filterItems();
  }

  onSearch() {
    this.filterItems();
  }

  filterItems() {
    let items = this.menuItems;

    // Filter by category
    if (this.selectedFilter !== 'todos') {
      items = items.filter(item => item.category === this.selectedFilter);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.japaneseName?.toLowerCase().includes(query)
      );
    }

    this.filteredItems = items;
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
    }
    console.log('Added to cart:', itemId);
  }

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
  }

  handleLogout() {
    console.log('Logout');
  }
}

// Extend MenuItem interface to include category
declare module '../menu-item-card/menu-item-card.component' {
  interface MenuItem {
    category?: string;
  }
}
