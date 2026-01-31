import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
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
import { SupabaseService, Customer as SupabaseCustomer, CustomerAddress as SupabaseAddress } from '../../core/services/supabase.service';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import * as CustomersActions from '../../store/customers/customers.actions';
import { selectCustomers, selectCustomersLoadingState } from '../../store/customers/customers.selectors';
import * as AddressesActions from '../../store/addresses/addresses.actions';
import { selectCustomerAddresses } from '../../store/addresses/addresses.selectors';
import { CustomerAddress } from '../../store/addresses/addresses.models';

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
  styleUrl: './customers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersComponent implements OnInit, OnDestroy {
  private isSubmitting = false;
  private subscriptions = new Subscription();
  private pendingSelectPhone: string | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private store: Store
  ) {
    this.customers$ = this.store.select(selectCustomers);
    this.loading$ = this.store.select(selectCustomersLoadingState);
    this.addresses$ = this.store.select(selectCustomerAddresses);
  }

  @Input() embedded: boolean = false;
  headerAction: PageAction = { label: 'Nuevo Cliente', icon: '+' };
  searchQuery: string = '';
  selectedCustomer: Customer | null = null;
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  customers$: Observable<SupabaseCustomer[]>;
  loading$: Observable<boolean>;
  addresses$: Observable<CustomerAddress[]>;
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
    { id: 'recogida', label: 'Recogida', icon: '🛍️', route: '/recogida' },
    { id: 'clientes', label: 'Clientes', icon: '👥', route: '/clientes', active: true },
    { id: 'entregas', label: 'Entregas', icon: '🚚', route: '/entregas' },
    { id: 'pedidos', label: 'Pedidos', icon: '🧾', route: '/pedidos' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { id: 'panel', label: 'Panel de Control', icon: '📈', route: '/panel-control' },
    { id: 'usuarios', label: 'Usuarios', icon: '👤', route: '/usuarios' }
  ];

  ngOnInit() {
    this.store.dispatch(CustomersActions.loadCustomers());

    this.subscriptions.add(
      this.customers$.subscribe(supabaseCustomers => {
        this.mapAndUpdateCustomers(supabaseCustomers);
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private mapAndUpdateCustomers(supabaseCustomers: SupabaseCustomer[]) {
    Promise.all(
      supabaseCustomers.map(c => this.mapSupabaseCustomerToLocal(c))
    ).then(mappedCustomers => {
      this.customers = mappedCustomers;
      this.filteredCustomers = this.customers;

      if (this.pendingSelectPhone) {
        const matched = mappedCustomers.find(c => c.phone === this.pendingSelectPhone);
        if (matched) {
          this.selectedCustomer = matched;
          this.pendingSelectPhone = null;
        }
      } else if (this.selectedCustomer) {
        const refreshed = mappedCustomers.find(c => c.id === this.selectedCustomer?.id);
        if (refreshed) {
          this.selectedCustomer = refreshed;
        }
      }

      this.cdr.markForCheck();
    }).catch(error => {
      console.error('❌ Error mapping customers:', error);
    });
  }

  private async mapSupabaseCustomerToLocal(supabaseCustomer: SupabaseCustomer): Promise<Customer> {
    const initials = supabaseCustomer.name
      .split(' ')
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();

    // Return customer with empty addresses - they'll be loaded via store
    return {
      id: supabaseCustomer.id.toString(),
      name: supabaseCustomer.name,
      phone: supabaseCustomer.phone || '',
      email: supabaseCustomer.email || undefined,
      initials,
      addresses: [],
      addressCount: 0
    };
  }

  private mapSupabaseAddressToLocal(supabaseAddress: SupabaseAddress): Address {
    return {
      id: supabaseAddress.id.toString(),
      label: supabaseAddress.label,
      street: supabaseAddress.street,
      city: supabaseAddress.city,
      state: supabaseAddress.state,
      zipCode: supabaseAddress.zip_code,
      reference: supabaseAddress.reference,
      isDefault: supabaseAddress.is_default
    };
  }

  private mapStoreAddressToLocal(storeAddress: CustomerAddress): Address {
    return {
      id: storeAddress.id.toString(),
      label: storeAddress.label,
      street: storeAddress.street,
      city: storeAddress.city,
      state: storeAddress.state,
      zipCode: storeAddress.zip_code,
      reference: storeAddress.reference,
      isDefault: storeAddress.is_default
    };
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

    // Load addresses from store for this customer
    this.store.dispatch(AddressesActions.loadCustomerAddresses({ customerId: customer.id }));
    this.store.dispatch(AddressesActions.subscribeToCustomerAddresses({ customerId: customer.id }));

    // Subscribe to address updates from store
    this.subscriptions.add(
      this.addresses$.subscribe(addresses => {
        if (this.selectedCustomer && this.selectedCustomer.id === customer.id) {
          this.selectedCustomer.addresses = addresses.map(addr => this.mapStoreAddressToLocal(addr));
          this.selectedCustomer.addressCount = addresses.length;
          this.cdr.markForCheck();
        }
      })
    );
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

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const name = this.newCustomerForm.name.trim();
    const phone = this.newCustomerForm.phone.trim();
    const email = this.newCustomerForm.email?.trim() || undefined;

    this.pendingSelectPhone = phone;
    this.store.dispatch(CustomersActions.createCustomer({ phone, name, email }));

    this.closeNewCustomerModal();
    this.isSubmitting = false;
    this.cdr.markForCheck();
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

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const customerData = {
      name: this.newCustomerForm.name.trim(),
      phone: this.newCustomerForm.phone.trim(),
      email: this.newCustomerForm.email?.trim() || undefined
    };

    this.store.dispatch(
      CustomersActions.updateCustomer({
        customerId: parseInt(this.selectedCustomer.id, 10),
        customer: customerData
      })
    );

    this.closeEditCustomerModal();
    this.isSubmitting = false;
    this.cdr.markForCheck();
  }

  deleteCustomer() {
    if (!this.selectedCustomer) return;

    const confirmed = confirm(`¿Eliminar cliente "${this.selectedCustomer.name}"?\n\nEsta acción no se puede deshacer.`);
    if (!confirmed) return;

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    this.store.dispatch(
      CustomersActions.deleteCustomer({
        customerId: parseInt(this.selectedCustomer.id, 10)
      })
    );

    this.selectedCustomer = null;
    this.isSubmitting = false;
    this.cdr.markForCheck();
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

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    if (this.editingAddress) {
      // Update existing address via store
      this.store.dispatch(AddressesActions.updateAddress({
        address: {
          id: this.editingAddress.id,
          customer_id: this.selectedCustomer.id,
          label: this.addressForm.label.trim(),
          street: this.addressForm.street.trim(),
          city: this.addressForm.city.trim(),
          state: this.addressForm.state.trim(),
          zip_code: this.addressForm.zipCode?.trim() || undefined,
          reference: this.addressForm.reference?.trim() || undefined,
          is_default: this.addressForm.isDefault
        }
      }));
    } else {
      // Create new address via store
      this.store.dispatch(AddressesActions.createAddress({
        customerId: this.selectedCustomer.id,
        address: {
          customer_id: this.selectedCustomer.id,
          label: this.addressForm.label.trim(),
          street: this.addressForm.street.trim(),
          city: this.addressForm.city.trim(),
          state: this.addressForm.state.trim(),
          zip_code: this.addressForm.zipCode?.trim() || undefined,
          reference: this.addressForm.reference?.trim() || undefined,
          is_default: this.addressForm.isDefault
        }
      }));
    }

    this.closeAddressModal();
    this.isSubmitting = false;
    this.cdr.markForCheck();
  }

  deleteAddress(addressId: string) {
    if (!this.selectedCustomer) return;

    const confirmed = confirm('¿Eliminar esta dirección?\n\nEsta acción no se puede deshacer.');
    if (!confirmed) return;

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    this.store.dispatch(AddressesActions.deleteAddress({ addressId }));

    this.isSubmitting = false;
    this.cdr.markForCheck();
  }

  setDefaultAddress(addressId: string) {
    if (!this.selectedCustomer) return;

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    this.store.dispatch(AddressesActions.updateAddress({
      address: {
        id: addressId,
        customer_id: this.selectedCustomer.id,
        label: '',
        street: '',
        city: '',
        state: '',
        is_default: true
      }
    }));

    this.isSubmitting = false;
    this.cdr.markForCheck();
  }
}
