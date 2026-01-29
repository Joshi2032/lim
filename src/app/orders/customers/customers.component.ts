import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
export class CustomersComponent implements OnInit {
  private isSubmitting = false;

  constructor(
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

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
    { id: 'recogida', label: 'Recogida', icon: '🛍️', route: '/recogida' },
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

  async loadCustomers() {
    try {
      console.log('📋 Loading customers from Supabase...');
      const supabaseCustomers = await this.supabase.getCustomers();
      console.log('✅ Customers loaded:', supabaseCustomers);

      // Mapear clientes con sus direcciones
      this.customers = await Promise.all(
        supabaseCustomers.map(c => this.mapSupabaseCustomerToLocal(c))
      );
      this.filteredCustomers = this.customers;
      this.cdr.markForCheck();
    } catch (error) {
      console.error('❌ Error loading customers:', error);
      alert('Error al cargar clientes: ' + (error as any).message);
    }
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

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    this.createCustomerInSupabase()
      .then(() => {
        this.closeNewCustomerModal();
        this.loadCustomers();
      })
      .catch(error => {
        console.error('❌ Error creating customer:', error);
        alert('Error al crear cliente: ' + error.message);
      })
      .finally(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      });
  }

  private async createCustomerInSupabase(): Promise<void> {
    console.log('📝 Creating customer in Supabase...');

    try {
      const customerData = {
        name: this.newCustomerForm.name.trim(),
        phone: this.newCustomerForm.phone.trim(),
        email: this.newCustomerForm.email?.trim() || null
      };

      const newCustomer = await this.supabase.createOrGetCustomer(
        customerData.phone,
        customerData.name,
        customerData.email || undefined
      );

      console.log('✅ Customer created:', newCustomer);

      // Select the new customer
      this.selectedCustomer = await this.mapSupabaseCustomerToLocal(newCustomer);
    } catch (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }
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

    this.updateCustomerInSupabase()
      .then(() => {
        this.closeEditCustomerModal();
        this.loadCustomers();
      })
      .catch(error => {
        console.error('❌ Error updating customer:', error);
        alert('Error al actualizar cliente: ' + error.message);
      })
      .finally(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      });
  }

  private async updateCustomerInSupabase(): Promise<void> {
    if (!this.selectedCustomer) return;

    console.log('📝 Updating customer in Supabase...');

    try {
      const customerData = {
        name: this.newCustomerForm.name.trim(),
        phone: this.newCustomerForm.phone.trim(),
        email: this.newCustomerForm.email?.trim() || undefined
      };

      await this.supabase.updateCustomer(
        parseInt(this.selectedCustomer.id),
        customerData
      );

      console.log('✅ Customer updated');
    } catch (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }
  }

  deleteCustomer() {
    if (!this.selectedCustomer) return;

    const confirmed = confirm(`¿Eliminar cliente "${this.selectedCustomer.name}"?\n\nEsta acción no se puede deshacer.`);
    if (!confirmed) return;

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    this.deleteCustomerFromSupabase()
      .then(() => {
        this.selectedCustomer = null;
        this.loadCustomers();
      })
      .catch(error => {
        console.error('❌ Error deleting customer:', error);
        alert('Error al eliminar cliente: ' + error.message);
      })
      .finally(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      });
  }

  private async deleteCustomerFromSupabase(): Promise<void> {
    if (!this.selectedCustomer) return;

    console.log('🗑️ Deleting customer from Supabase...');

    try {
      await this.supabase.deleteCustomer(parseInt(this.selectedCustomer.id));
      console.log('✅ Customer deleted');
    } catch (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }
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
      .then(() => {
        this.closeAddressModal();
        this.loadCustomers();
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
      .then(() => {
        this.loadCustomers();
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
      .then(() => {
        this.loadCustomers();
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
