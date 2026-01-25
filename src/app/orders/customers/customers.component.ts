import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent, MenuItem as SidebarMenuItem, User } from '../../shared/sidebar/sidebar.component';
import { PageHeaderComponent, PageAction } from '../../shared/page-header/page-header.component';
import { SectionHeaderComponent } from '../../shared/section-header/section-header.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { ModalComponent } from '../../shared/modal/modal.component';
import { SearchInputComponent } from '../../shared/search-input/search-input.component';
import { IconButtonComponent } from '../../shared/icon-button/icon-button.component';
import { CustomerItemComponent, CustomerItemData } from '../../shared/customer-item/customer-item.component';
import { AddressCardComponent, AddressData } from '../../shared/address-card/address-card.component';

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
  imports: [
    CommonModule,
    SidebarComponent,
    FormsModule,
    PageHeaderComponent,
    SectionHeaderComponent,
    EmptyStateComponent,
    ModalComponent,
    SearchInputComponent,
    IconButtonComponent,
    CustomerItemComponent,
    AddressCardComponent
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent implements OnInit {
  @Input() embedded: boolean = false;
  headerAction: PageAction = { label: 'Nuevo Cliente', icon: '+' };
  searchQuery: string = '';
  selectedCustomer: Customer | null = null;
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  cartCount: number = 0;
  showNewCustomerModal: boolean = false;
  showEditCustomerModal: boolean = false;
  showAddressModal: boolean = false;
  editingAddress: Address | null = null;

  newCustomerForm = {
    name: '',
    phone: '',
    email: '',
    notes: ''
  };

  addressForm: {
    label: string;
    street: string;
    city: string;
    state: string;
    zipCode?: string;
    reference?: string;
    isDefault: boolean;
  } = {
    label: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    reference: '',
    isDefault: false
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
    { id: 'pedidos', label: 'Pedidos', icon: '🧾', route: '/pedidos' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { id: 'panel', label: 'Panel de Control', icon: '📈', route: '/panel-control' },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', route: '/usuarios' }
  ];

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    // Mock data - En producción vendrá del backend
    this.customers = [
      {
        id: '1',
        name: 'ssf',
        phone: '55 1234 5678',
        email: 'ssf@email.com',
        initials: 'S',
        addressCount: 0,
        addresses: []
      }
    ];
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
    this.selectCustomer(newCustomer);
  }

  openEditCustomerModal() {
    if (!this.selectedCustomer) return;
    this.showEditCustomerModal = true;
    this.newCustomerForm = {
      name: this.selectedCustomer.name,
      phone: this.selectedCustomer.phone,
      email: this.selectedCustomer.email || '',
      notes: ''
    };
  }

  closeEditCustomerModal() {
    this.showEditCustomerModal = false;
  }

  updateCustomer() {
    if (!this.selectedCustomer || !this.newCustomerForm.name.trim() || !this.newCustomerForm.phone.trim()) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    const initials = this.newCustomerForm.name
      .split(' ')
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();

    const customerIndex = this.customers.findIndex(c => c.id === this.selectedCustomer!.id);
    if (customerIndex !== -1) {
      this.customers[customerIndex] = {
        ...this.customers[customerIndex],
        name: this.newCustomerForm.name,
        phone: this.newCustomerForm.phone,
        email: this.newCustomerForm.email || undefined,
        initials
      };
      this.selectedCustomer = { ...this.customers[customerIndex] };
      this.filteredCustomers = this.customers;
    }

    this.closeEditCustomerModal();
  }

  deleteCustomer() {
    if (!this.selectedCustomer) return;

    const confirmed = confirm(`¿Eliminar cliente "${this.selectedCustomer.name}"?\n\nEsta acción no se puede deshacer.`);
    if (!confirmed) return;

    this.customers = this.customers.filter(c => c.id !== this.selectedCustomer!.id);
    this.filteredCustomers = this.customers;
    this.selectedCustomer = null;
  }

  addAddress() {
    if (!this.selectedCustomer) return;
    this.editingAddress = null;
    this.addressForm = {
      label: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      reference: '',
      isDefault: this.selectedCustomer.addresses.length === 0
    };
    this.showAddressModal = true;
  }

  editAddress(address: Address) {
    this.editingAddress = address;
    this.addressForm = { ...address };
    this.showAddressModal = true;
  }

  closeAddressModal() {
    this.showAddressModal = false;
    this.editingAddress = null;
  }

  saveAddress() {
    if (!this.selectedCustomer || !this.addressForm.label.trim() || !this.addressForm.street.trim() ||
        !this.addressForm.city.trim() || !this.addressForm.state.trim()) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const customerIndex = this.customers.findIndex(c => c.id === this.selectedCustomer!.id);
    if (customerIndex === -1) return;

    if (this.editingAddress) {
      // Editar dirección existente
      const addressIndex = this.customers[customerIndex].addresses.findIndex(a => a.id === this.editingAddress!.id);
      if (addressIndex !== -1) {
        // Si se marca como principal, quitar principal de las demás
        if (this.addressForm.isDefault) {
          this.customers[customerIndex].addresses.forEach(a => a.isDefault = false);
        }

        this.customers[customerIndex].addresses[addressIndex] = {
          ...this.editingAddress,
          ...this.addressForm
        };
      }
    } else {
      // Agregar nueva dirección
      // Si se marca como principal, quitar principal de las demás
      if (this.addressForm.isDefault) {
        this.customers[customerIndex].addresses.forEach(a => a.isDefault = false);
      }

      const newAddress: Address = {
        id: Date.now().toString(),
        ...this.addressForm
      };

      this.customers[customerIndex].addresses.push(newAddress);
      this.customers[customerIndex].addressCount = this.customers[customerIndex].addresses.length;
    }

    this.selectedCustomer = { ...this.customers[customerIndex] };
    this.filteredCustomers = [...this.customers];
    this.closeAddressModal();
  }

  deleteAddress(addressId: string) {
    if (!this.selectedCustomer) return;

    const confirmed = confirm('¿Eliminar esta dirección?\n\nEsta acción no se puede deshacer.');
    if (!confirmed) return;

    const customerIndex = this.customers.findIndex(c => c.id === this.selectedCustomer!.id);
    if (customerIndex === -1) return;

    this.customers[customerIndex].addresses = this.customers[customerIndex].addresses.filter(a => a.id !== addressId);
    this.customers[customerIndex].addressCount = this.customers[customerIndex].addresses.length;

    // Si se eliminó la dirección principal y quedan direcciones, marcar la primera como principal
    if (this.customers[customerIndex].addresses.length > 0 &&
        !this.customers[customerIndex].addresses.some(a => a.isDefault)) {
      this.customers[customerIndex].addresses[0].isDefault = true;
    }

    this.selectedCustomer = { ...this.customers[customerIndex] };
    this.filteredCustomers = [...this.customers];
  }

  setDefaultAddress(addressId: string) {
    if (!this.selectedCustomer) return;

    const customerIndex = this.customers.findIndex(c => c.id === this.selectedCustomer!.id);
    if (customerIndex === -1) return;

    this.customers[customerIndex].addresses.forEach(a => {
      a.isDefault = a.id === addressId;
    });

    this.selectedCustomer = { ...this.customers[customerIndex] };
    this.filteredCustomers = [...this.customers];
  }
}
