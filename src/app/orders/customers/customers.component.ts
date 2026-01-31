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
  private addressSubscription: any = null;
  private subscriptions = new Subscription();
  private pendingSelectPhone: string | null = null;

  constructor(
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef,
    private store: Store
  ) {
    this.customers$ = this.store.select(selectCustomers);
    this.loading$ = this.store.select(selectCustomersLoadingState);
  }

  @Input() embedded: boolean = false;
  headerAction: PageAction = { label: 'Nuevo Cliente', icon: '+' };
  searchQuery: string = '';
  selectedCustomer: Customer | null = null;
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  customers$: Observable<SupabaseCustomer[]>;
  loading$: Observable<boolean>;
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
    if (this.addressSubscription) {
      this.addressSubscription.unsubscribe();
    }
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

    // Cargar direcciones del cliente
    let addresses: Address[] = [];
    try {
      const supabaseAddresses = await this.supabase.getCustomerAddresses(supabaseCustomer.id.toString());
      addresses = supabaseAddresses.map(a => this.mapSupabaseAddressToLocal(a));
    } catch (error) {
      console.error('Error loading addresses for customer:', supabaseCustomer.id, error);
    }

    return {
      id: supabaseCustomer.id.toString(),
      name: supabaseCustomer.name,
      phone: supabaseCustomer.phone || '',
      email: supabaseCustomer.email || undefined,
      initials,
      addresses,
      addressCount: addresses.length
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
    // Desuscribirse de cambios anteriores si existen
    if (this.addressSubscription) {
      this.addressSubscription.unsubscribe();
    }

    this.selectedCustomer = { ...customer };

    // Suscribirse a cambios de direcciones del cliente seleccionado
    this.addressSubscription = this.supabase.subscribeToCustomerAddresses(
      customer.id,
      (addresses) => {
        if (this.selectedCustomer && this.selectedCustomer.id === customer.id) {
          this.selectedCustomer.addresses = addresses.map(addr => this.mapSupabaseAddressToLocal(addr));
          this.selectedCustomer.addressCount = addresses.length;
          this.cdr.markForCheck();
        }
      }
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

    this.saveAddressToSupabase()
      .then(async () => {
        this.closeAddressModal();
        // Recargar solo las direcciones del cliente seleccionado
        if (this.selectedCustomer) {
          try {
            const addresses = await this.supabase.getCustomerAddresses(this.selectedCustomer.id);
            this.selectedCustomer.addresses = addresses.map(a => this.mapSupabaseAddressToLocal(a));
            this.selectedCustomer.addressCount = addresses.length;
          } catch (error) {
            console.error('Error loading addresses after save:', error);
          }
        }
      })
      .catch(error => {
        console.error('❌ Error saving address:', error);
        alert('Error al guardar dirección: ' + error.message);
      })
      .finally(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      });
  }

  private async saveAddressToSupabase(): Promise<void> {
    if (!this.selectedCustomer) return;

    console.log('📝 Saving address to Supabase...');

    try {
      if (this.editingAddress) {
        // Editar dirección existente
        await this.supabase.updateCustomerAddress(
          this.editingAddress.id,
          {
            label: this.addressForm.label.trim(),
            street: this.addressForm.street.trim(),
            city: this.addressForm.city.trim(),
            state: this.addressForm.state.trim(),
            zip_code: this.addressForm.zipCode?.trim() || undefined,
            reference: this.addressForm.reference?.trim() || undefined,
            is_default: this.addressForm.isDefault
          }
        );
        console.log('✅ Address updated');
      } else {
        // Crear nueva dirección
        await this.supabase.createCustomerAddress({
          customer_id: this.selectedCustomer.id,
          label: this.addressForm.label.trim(),
          street: this.addressForm.street.trim(),
          city: this.addressForm.city.trim(),
          state: this.addressForm.state.trim(),
          zip_code: this.addressForm.zipCode?.trim() || undefined,
          reference: this.addressForm.reference?.trim() || undefined,
          is_default: this.addressForm.isDefault
        });
        console.log('✅ Address created');
      }
    } catch (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }
  }

  deleteAddress(addressId: string) {
    if (!this.selectedCustomer) return;

    const confirmed = confirm('¿Eliminar esta dirección?\n\nEsta acción no se puede deshacer.');
    if (!confirmed) return;

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    this.deleteAddressFromSupabase(addressId)
      .then(async () => {
        // Recargar solo las direcciones del cliente seleccionado
        if (this.selectedCustomer) {
          try {
            const addresses = await this.supabase.getCustomerAddresses(this.selectedCustomer.id);
            this.selectedCustomer.addresses = addresses.map(a => this.mapSupabaseAddressToLocal(a));
            this.selectedCustomer.addressCount = addresses.length;
          } catch (error) {
            console.error('Error loading addresses after delete:', error);
          }
        }
      })
      .catch(error => {
        console.error('❌ Error deleting address:', error);
        alert('Error al eliminar dirección: ' + error.message);
      })
      .finally(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      });
  }

  private async deleteAddressFromSupabase(addressId: string): Promise<void> {
    console.log('🗑️ Deleting address from Supabase...');

    try {
      await this.supabase.deleteCustomerAddress(addressId);
      console.log('✅ Address deleted');
    } catch (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }
  }

  setDefaultAddress(addressId: string) {
    if (!this.selectedCustomer) return;

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    this.setDefaultAddressInSupabase(addressId)
      .then(async () => {
        // Recargar solo las direcciones del cliente seleccionado
        if (this.selectedCustomer) {
          try {
            const addresses = await this.supabase.getCustomerAddresses(this.selectedCustomer.id);
            this.selectedCustomer.addresses = addresses.map(a => this.mapSupabaseAddressToLocal(a));
            this.selectedCustomer.addressCount = addresses.length;
          } catch (error) {
            console.error('Error loading addresses after setting default:', error);
          }
        }
      })
      .catch(error => {
        console.error('❌ Error setting default address:', error);
        alert('Error al establecer dirección principal: ' + error.message);
      })
      .finally(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      });
  }

  private async setDefaultAddressInSupabase(addressId: string): Promise<void> {
    console.log('⭐ Setting default address in Supabase...');

    try {
      await this.supabase.updateCustomerAddress(addressId, {
        is_default: true
      });
      console.log('✅ Default address set');
    } catch (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }
  }
}
