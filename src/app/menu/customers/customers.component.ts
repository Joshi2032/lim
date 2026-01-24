import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../shared/sidebar/sidebar.component';

export interface Address {
	id: string;
	label: string;
	street: string;
	city: string;
	state: string;
	zipCode?: string;
	reference?: string;
	isDefault: boolean;
}

export interface Customer {
	id: string;
	name: string;
	phone: string;
	email?: string;
	initials: string;
	addresses: Address[];
	addressCount: number;
}

@Component({
  selector: 'app-customers',
  imports: [CommonModule, SidebarComponent, FormsModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent implements OnInit {
  searchQuery: string = '';
  selectedCustomer: Customer | null = null;
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  cartCount: number = 0;
  showNewCustomerModal: boolean = false;
  newCustomerForm = {
    name: '',
    phone: '',
    email: '',
    notes: ''
  };

  currentUser: User = {
    name: 'Josue',
    role: 'Dueña',
    initials: 'J'
  };

  sidebarItems: SidebarMenuItem[] = [
    { id: 'menu', label: 'Menú', icon: '🍜', route: '/menu' },
    { id: 'mesas', label: 'Mesas', icon: '🪑', route: '/mesas' },
    { id: 'cocina', label: 'Cocina', icon: '🍳', route: '/cocina' },
    { id: 'clientes', label: 'Clientes', icon: '👥', route: '/clientes', active: true },
    { id: 'entregas', label: 'Entregas', icon: '🚚', route: '/entregas' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { id: 'panel', label: 'Panel de Control', icon: '📈', route: '/panel-control' },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', route: '/usuarios' }
  ];

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    // Mock data - En producción vendrá del backend
    this.customers = [];
    this.filteredCustomers = this.customers;
  }

  filterCustomers() {
    if (!this.searchQuery.trim()) {
      this.filteredCustomers = this.customers;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredCustomers = this.customers.filter(customer =>
      customer.name.toLowerCase().includes(query) ||
      customer.phone.includes(query) ||
      (customer.email && customer.email.toLowerCase().includes(query))
    );
  }

  selectCustomer(customer: Customer) {
    this.selectedCustomer = { ...customer };
  }

  openNewCustomerModal() {
    this.showNewCustomerModal = true;
    this.newCustomerForm = {
      name: '',
      phone: '',
      email: '',
      notes: ''
    };
  }

  closeNewCustomerModal() {
    this.showNewCustomerModal = false;
  }

  addCustomer() {
    if (!this.newCustomerForm.name.trim() || !this.newCustomerForm.phone.trim()) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    const initials = this.newCustomerForm.name
      .split(' ')
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();

    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: this.newCustomerForm.name,
      phone: this.newCustomerForm.phone,
      email: this.newCustomerForm.email || undefined,
      initials,
      addresses: [],
      addressCount: 0
    };

    this.customers.unshift(newCustomer);
    this.filteredCustomers = this.customers;
    this.closeNewCustomerModal();
  }

  addAddress() {
    console.log('Agregar dirección para cliente:', this.selectedCustomer?.name);
    // TODO: Implementar modal de agregar dirección
  }

  editAddress(address: Address) {
    console.log('Editar dirección:', address);
    // TODO: Implementar modal de editar dirección
  }

  deleteAddress(addressId: string) {
    console.log('Eliminar dirección:', addressId);
    // TODO: Implementar confirmación y eliminación
  }
}
