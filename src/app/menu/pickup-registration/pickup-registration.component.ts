import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../shared/sidebar/sidebar.component';
import { PageHeaderComponent, PageAction } from '../../shared/page-header/page-header.component';
import { MovementsService } from '../../shared/movements/movements.service';
import { SupabaseService, MenuItem, Order, OrderItem } from '../../core/services/supabase.service';

interface LocalMenuItem extends MenuItem {
  quantity: number;
}

interface PickupOrder {
  customerName: string;
  customerPhone: string;
  pickupTime: string;
  notes: string;
  items: LocalMenuItem[];
}

@Component({
  selector: 'app-pickup-registration',
  imports: [CommonModule, FormsModule, SidebarComponent, PageHeaderComponent],
  templateUrl: './pickup-registration.component.html',
  styleUrl: './pickup-registration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PickupRegistrationComponent implements OnInit {
  order: PickupOrder = {
    customerName: '',
    customerPhone: '',
    pickupTime: '',
    notes: '',
    items: []
  };

  availableItems: MenuItem[] = [];
  selectedItem: string = '';
  private _totalMemoized: number | null = null;
  selectedQuantity: number = 1;
  isSubmitting = false;

  currentUser: User = {
    name: 'Josue',
    role: 'Dueña',
    initials: 'J'
  };

  sidebarItems: SidebarMenuItem[] = [
    { id: 'menu', label: 'Menú', icon: '🍜', route: '/menu' },
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

  headerAction: PageAction = {
    label: 'Ver Pedidos',
    icon: '📋'
  };

  constructor(
    private router: Router,
    private movements: MovementsService,
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadMenuItems();
    this.setDefaultPickupTime();
  }

  async loadMenuItems() {
    try {
      const items = await this.supabase.getMenuItems();
      this.availableItems = items;
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error loading menu items:', error);
      alert('Error al cargar el menú');
    }
  }

  setDefaultPickupTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // 30 minutos desde ahora
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.order.pickupTime = `${hours}:${minutes}`;
  }

  addItemToOrder() {
    if (!this.selectedItem || this.selectedQuantity <= 0) return;

    const item = this.availableItems.find(i => i.id === this.selectedItem);
    if (!item) return;

    const existingItem = this.order.items.find(i => i.id === item.id);
    if (existingItem) {
      existingItem.quantity += this.selectedQuantity;
    } else {
      this.order.items.push({
        ...item,
        quantity: this.selectedQuantity
      });
    }

    this.selectedItem = '';
    this._totalMemoized = null; // Invalidar caché
    this.selectedQuantity = 1;
  }

  removeItem(itemId: string) {
    this.order.items = this.order.items.filter(i => i.id !== itemId);
    this._totalMemoized = null; // Invalidar caché
  }

  updateItemQuantity(itemId: string, quantity: number) {
    const item = this.order.items.find(i => i.id === itemId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this._totalMemoized = null; // Invalidar caché
    }
  }

  getTotal(): number {
    if (this._totalMemoized !== null) return this._totalMemoized;
    this._totalMemoized = this.order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return this._totalMemoized;
  }

  isFormValid(): boolean {
    return this.order.customerName.trim() !== '' &&
           this.order.customerPhone.trim() !== '' &&
           this.order.pickupTime !== '' &&
           this.order.items.length > 0;
  }

  submitOrder() {
    if (!this.isFormValid() || this.isSubmitting) return;

    this.isSubmitting = true;
    this.cdr.markForCheck();

    this.registerOrderInSupabase().finally(() => {
      this.isSubmitting = false;
      this.cdr.markForCheck();
    });
  }

  private async registerOrderInSupabase() {
    try {
      // Create order in Supabase
      const orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'> = {
        customer_name: this.order.customerName,
        customer_phone: this.order.customerPhone,
        customer_email: '',
        order_type: 'pickup',
        status: 'pending',
        total_price: this.getTotal(),
        pickup_time: this.order.pickupTime,
        notes: this.order.notes
      };

      const newOrder = await this.supabase.createOrder(orderData);

      // Add order items
      const orderItems: Array<Omit<OrderItem, 'id'>> = this.order.items.map(item => ({
        order_id: newOrder.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity
      }));

      await this.supabase.addOrderItems(orderItems);

      // Log movement
      this.movements.log({
        title: 'Nuevo pedido de recogida',
        description: `Pedido #${newOrder.order_number} para ${this.order.customerName}`,
        section: 'cocina',
        status: 'success',
        actor: this.currentUser.name,
        role: this.currentUser.role
      });

      this.router.navigate(['/recogida']);
    } catch (error) {
      console.error('Error registering order:', error);
      alert('Error al registrar el pedido. Intenta de nuevo.');
    }
  }

  cancel() {
    this.router.navigate(['/recogida']);
  }

  onHeaderActionClick() {
    this.router.navigate(['/recogida']);
  }

  trackByItemId(_index: number, item: MenuItem): string {
    return item.id;
  }
}
