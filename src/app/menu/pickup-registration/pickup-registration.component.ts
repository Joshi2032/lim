import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../shared/sidebar/sidebar.component';
import { PageHeaderComponent, PageAction } from '../../shared/page-header/page-header.component';
import { MovementsService } from '../../shared/movements/movements.service';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

interface PickupOrder {
  customerName: string;
  customerPhone: string;
  pickupTime: string;
  notes: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-pickup-registration',
  imports: [CommonModule, FormsModule, SidebarComponent, PageHeaderComponent],
  templateUrl: './pickup-registration.component.html',
  styleUrl: './pickup-registration.component.scss'
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
  selectedQuantity: number = 1;

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
    private movements: MovementsService
  ) {}

  ngOnInit() {
    this.loadMenuItems();
    this.setDefaultPickupTime();
  }

  loadMenuItems() {
    // Mock data - En producción vendrá del backend
    this.availableItems = [
      { id: '1', name: 'Sushi Variado (24 pzas)', category: 'Sushi', price: 28.99, quantity: 0 },
      { id: '2', name: 'California Roll', category: 'Sushi', price: 12.99, quantity: 0 },
      { id: '3', name: 'Philadelphia Roll', category: 'Sushi', price: 13.99, quantity: 0 },
      { id: '4', name: 'Nigiri Variado (10 pzas)', category: 'Sushi', price: 18.99, quantity: 0 },
      { id: '5', name: 'Ramen Tonkotsu', category: 'Ramen', price: 15.99, quantity: 0 },
      { id: '6', name: 'Ramen Miso', category: 'Ramen', price: 14.99, quantity: 0 },
      { id: '7', name: 'Ramen Shoyu', category: 'Ramen', price: 14.99, quantity: 0 },
      { id: '8', name: 'Gyoza (6 pzas)', category: 'Entradas', price: 7.99, quantity: 0 },
      { id: '9', name: 'Edamame', category: 'Entradas', price: 5.99, quantity: 0 },
      { id: '10', name: 'Tempura Mix', category: 'Entradas', price: 9.99, quantity: 0 },
      { id: '11', name: 'Poke Bowl Salmón', category: 'Bowls', price: 16.99, quantity: 0 },
      { id: '12', name: 'Poke Bowl Atún', category: 'Bowls', price: 17.99, quantity: 0 },
      { id: '13', name: 'Mochi Assorted (6 pzas)', category: 'Postres', price: 8.99, quantity: 0 },
      { id: '14', name: 'Té Verde', category: 'Bebidas', price: 3.99, quantity: 0 },
      { id: '15', name: 'Ramune', category: 'Bebidas', price: 4.99, quantity: 0 }
    ];
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
    this.selectedQuantity = 1;
  }

  removeItem(itemId: string) {
    this.order.items = this.order.items.filter(i => i.id !== itemId);
  }

  updateItemQuantity(itemId: string, quantity: number) {
    const item = this.order.items.find(i => i.id === itemId);
    if (item) {
      item.quantity = Math.max(1, quantity);
    }
  }

  getTotal(): number {
    return this.order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  isFormValid(): boolean {
    return this.order.customerName.trim() !== '' &&
           this.order.customerPhone.trim() !== '' &&
           this.order.pickupTime !== '' &&
           this.order.items.length > 0;
  }

  submitOrder() {
    if (!this.isFormValid()) return;

    // Registrar movimiento
    this.movements.log({
      title: 'Nuevo pedido de recogida',
      description: `Pedido para ${this.order.customerName}`,
      section: 'cocina',
      status: 'success',
      actor: this.currentUser.name,
      role: this.currentUser.role
    });

    // Simular envío al backend
    console.log('Pedido registrado:', this.order);

    // Redireccionar al módulo de recogida
    this.router.navigate(['/recogida']);
  }

  cancel() {
    this.router.navigate(['/recogida']);
  }

  onHeaderActionClick() {
    this.router.navigate(['/recogida']);
  }
}
