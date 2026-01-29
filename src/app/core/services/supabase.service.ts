import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { supabase } from '../config/supabase.config';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url?: string;
  available: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  order_type: 'dine-in' | 'pickup' | 'delivery';
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total_price: number;
  created_at: string;
  updated_at: string;
  table_number?: number;
  delivery_address?: string;
  pickup_time?: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip_code?: string;
  reference?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  display_order?: number;
  created_at: string;
  updated_at: string;
}

export interface Combo {
  id: string;
  name: string;
  japanese_name?: string;
  description: string;
  price: number;
  image_url?: string;
  available: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ComboItem {
  id: string;
  combo_id: string;
  menu_item_id: string;
  quantity: number;
  created_at?: string;
}

export interface Employee {
  id: string;
  auth_user_id?: string;
  email: string;
  full_name: string;
  role: 'admin' | 'chef' | 'waiter' | 'delivery' | 'cashier';
  phone?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RestaurantTable {
  id: string;
  table_number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  current_order_id?: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  private menuItemsSubject = new BehaviorSubject<MenuItem[]>([]);

  constructor() {}

  // ==================== ORDERS ====================

  async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
    try {
      console.log('Creating order:', orderData);
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            order_number: `ORD-${Date.now()}`,
            customer_name: orderData.customer_name,
            customer_email: orderData.customer_email || null,
            customer_phone: orderData.customer_phone || null,
            order_type: orderData.order_type,
            status: orderData.status,
            total_price: orderData.total_price,
            table_number: orderData.table_number || null,
            delivery_address: orderData.delivery_address || null,
            pickup_time: orderData.pickup_time || null,
            notes: orderData.notes || null,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating order:', error);
        throw error;
      }
      console.log('Order created:', data);
      return data as Order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching orders:', error);
        throw error;
      }
      console.log('Orders loaded:', (data || []).length, data);
      return (data || []) as Order[];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  async getOrdersByStatus(status: Order['status']): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching orders with status ${status}:`, error);
      return [];
    }
  }

  async getOrdersByType(orderType: Order['order_type']): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_type', orderType)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`Supabase error fetching orders with type ${orderType}:`, error);
        throw error;
      }
      console.log(`Orders of type ${orderType} loaded:`, (data || []).length, data);
      return (data || []) as Order[];
    } catch (error) {
      console.error(`Error fetching orders with type ${orderType}:`, error);
      return [];
    }
  }

  async updateOrderStatus(orderId: string, status: Order['status']) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  async deleteOrder(orderId: string) {
    try {
      const { error } = await supabase.from('orders').delete().eq('id', orderId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

  // ==================== ORDER ITEMS ====================

  async addOrderItems(items: Array<Omit<OrderItem, 'id'>>) {
    try {
      console.log('Adding order items:', items);
      const { data, error } = await supabase
        .from('order_items')
        .insert(items)
        .select();

      if (error) {
        console.error('Supabase error adding order items:', error);
        throw error;
      }
      console.log('Order items added:', data);
      return data;
    } catch (error) {
      console.error('Error adding order items:', error);
      throw error;
    }
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching order items:', error);
      return [];
    }
  }

  // ==================== MENU ITEMS ====================

  async getMenuItems(): Promise<MenuItem[]> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true)
        .order('name');

      if (error) {
        console.error('Supabase error fetching menu items:', error);
        throw error;
      }

      const items = (data || []) as MenuItem[];
      console.log('Menu items loaded:', items.length, items);
      this.menuItemsSubject.next(items);
      return items;
    } catch (error) {
      console.error('Error fetching menu items:', error);
      return [];
    }
  }

  async getMenuItemsByCategory(categoryId: string): Promise<MenuItem[]> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('category_id', categoryId)
        .eq('available', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching menu items by category:', error);
      return [];
    }
  }

  async createMenuItem(itemData: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem> {
    try {
      console.log('📝 Creating menu item:', itemData);
      const { data, error } = await supabase
        .from('menu_items')
        .insert([itemData])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating menu item:', error);
        throw error;
      }

      console.log('✅ Menu item created:', data);
      return data as MenuItem;
    } catch (error) {
      console.error('❌ Error in createMenuItem:', error);
      throw error;
    }
  }

  async updateMenuItem(itemId: string, itemData: Partial<Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    try {
      console.log('📝 Updating menu item:', itemId, itemData);
      const { error } = await supabase
        .from('menu_items')
        .update(itemData)
        .eq('id', itemId);

      if (error) {
        console.error('❌ Error updating menu item:', error);
        throw error;
      }

      console.log('✅ Menu item updated');
    } catch (error) {
      console.error('❌ Error in updateMenuItem:', error);
      throw error;
    }
  }

  async deleteMenuItem(itemId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting menu item:', itemId);
      const { error } = await supabase
        .from('menu_items')
        .update({ available: false })
        .eq('id', itemId);

      if (error) {
        console.error('❌ Error deleting menu item:', error);
        throw error;
      }

      console.log('✅ Menu item deleted (marked as unavailable)');
    } catch (error) {
      console.error('❌ Error in deleteMenuItem:', error);
      throw error;
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      console.log('📋 Fetching categories...');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ Error fetching categories:', error);
        throw error;
      }

      console.log('✅ Categories fetched:', data?.length || 0);
      return (data as Category[]) || [];
    } catch (error) {
      console.error('❌ Error in getCategories:', error);
      throw error;
    }
  }

  // ==================== RESTAURANT TABLES ====================

  async getTables(): Promise<RestaurantTable[]> {
    try {
      console.log('📋 Fetching tables...');
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .order('table_number', { ascending: true });

      if (error) {
        console.error('❌ Error fetching tables:', error);
        throw error;
      }

      console.log('✅ Tables fetched:', data?.length || 0);
      return (data as RestaurantTable[]) || [];
    } catch (error) {
      console.error('❌ Error in getTables:', error);
      throw error;
    }
  }

  async updateTableStatus(tableId: string, status: 'available' | 'occupied' | 'reserved' | 'cleaning'): Promise<void> {
    try {
      console.log('📝 Updating table status:', tableId, status);
      const { error } = await supabase
        .from('restaurant_tables')
        .update({ status })
        .eq('id', tableId);

      if (error) {
        console.error('❌ Error updating table status:', error);
        throw error;
      }

      console.log('✅ Table status updated');
    } catch (error) {
      console.error('❌ Error in updateTableStatus:', error);
      throw error;
    }
  }

  subscribeToTables(callback: (tables: RestaurantTable[]) => void) {
    console.log('🔔 Subscribing to table changes...');

    const channel = supabase
      .channel('restaurant_tables-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'restaurant_tables' },
        () => {
          console.log('🔄 Table change detected, fetching updated tables...');
          this.getTables().then(callback);
        }
      )
      .subscribe();

    return channel;
  }

  // ==================== AUTHENTICATION ====================

  async signIn(email: string, password: string) {
    try {
      console.log('🔑 Signing in user:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        throw error;
      }

      console.log('✅ User signed in:', data.user?.email);
      return data;
    } catch (error) {
      console.error('❌ Error in signIn:', error);
      throw error;
    }
  }

  async signUp(email: string, password: string, metadata?: { name?: string }) {
    try {
      console.log('📝 Signing up user:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) {
        console.error('❌ Sign up error:', error);
        throw error;
      }

      console.log('✅ User signed up:', data.user?.email);
      return data;
    } catch (error) {
      console.error('❌ Error in signUp:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      console.log('🚪 Signing out user...');
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ Sign out error:', error);
        throw error;
      }

      console.log('✅ User signed out');
    } catch (error) {
      console.error('❌ Error in signOut:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('❌ Error getting current user:', error);
        throw error;
      }

      return user;
    } catch (error) {
      console.error('❌ Error in getCurrentUser:', error);
      return null;
    }
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // ==================== CUSTOMERS ====================

  async createOrGetCustomer(phone: string, name?: string, email?: string): Promise<Customer> {
    try {
      console.log('🔍 Checking for existing customer with phone:', phone);

      // Try to find existing customer by phone
      const { data: existing } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', phone)
        .single();

      if (existing) {
        console.log('✅ Found existing customer:', existing);
        return existing as Customer;
      }

      // Create new customer
      console.log('📝 Creating new customer...');
      const customerData = {
        phone,
        name: name || 'Cliente',
        email: email || null
      };

      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating customer:', error);
        throw error;
      }

      console.log('✅ Customer created:', data);
      return data as Customer;
    } catch (error) {
      console.error('❌ Error in createOrGetCustomer:', error);
      throw error;
    }
  }

  async getCustomers(): Promise<Customer[]> {
    try {
      console.log('📋 Fetching all customers...');
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching customers:', error);
        throw error;
      }

      console.log('✅ Customers fetched:', data?.length || 0);
      return (data as Customer[]) || [];
    } catch (error) {
      console.error('❌ Error in getCustomers:', error);
      throw error;
    }
  }

  async updateCustomer(customerId: number, customerData: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    try {
      console.log('📝 Updating customer:', customerId, customerData);
      const { error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', customerId);

      if (error) {
        console.error('❌ Error updating customer:', error);
        throw error;
      }

      console.log('✅ Customer updated successfully');
    } catch (error) {
      console.error('❌ Error in updateCustomer:', error);
      throw error;
    }
  }

  async deleteCustomer(customerId: number): Promise<void> {
    try {
      console.log('🗑️ Deleting customer:', customerId);
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) {
        console.error('❌ Error deleting customer:', error);
        throw error;
      }

      console.log('✅ Customer deleted successfully');
    } catch (error) {
      console.error('❌ Error in deleteCustomer:', error);
      throw error;
    }
  }

  // ==================== CUSTOMER ADDRESSES ====================

  async getCustomerAddresses(customerId: string): Promise<CustomerAddress[]> {
    try {
      console.log('📋 Fetching addresses for customer:', customerId);
      const { data, error } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('customer_id', customerId)
        .order('is_default', { ascending: false });

      if (error) {
        console.error('❌ Error fetching addresses:', error);
        throw error;
      }

      console.log('✅ Addresses fetched:', data?.length || 0);
      return (data as CustomerAddress[]) || [];
    } catch (error) {
      console.error('❌ Error in getCustomerAddresses:', error);
      throw error;
    }
  }

  async createCustomerAddress(addressData: Omit<CustomerAddress, 'id' | 'created_at' | 'updated_at'>): Promise<CustomerAddress> {
    try {
      console.log('📝 Creating customer address:', addressData);

      // Si es la dirección por defecto, quitar el default de las demás
      if (addressData.is_default) {
        await supabase
          .from('customer_addresses')
          .update({ is_default: false })
          .eq('customer_id', addressData.customer_id);
      }

      const { data, error } = await supabase
        .from('customer_addresses')
        .insert([addressData])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating address:', error);
        throw error;
      }

      console.log('✅ Address created:', data);
      return data as CustomerAddress;
    } catch (error) {
      console.error('❌ Error in createCustomerAddress:', error);
      throw error;
    }
  }

  async updateCustomerAddress(addressId: string, addressData: Partial<Omit<CustomerAddress, 'id' | 'customer_id' | 'created_at' | 'updated_at'>>): Promise<void> {
    try {
      console.log('📝 Updating address:', addressId, addressData);

      // Si se está marcando como default, quitar el default de las demás
      if (addressData.is_default) {
        // Primero obtenemos el customer_id de esta dirección
        const { data: addressInfo } = await supabase
          .from('customer_addresses')
          .select('customer_id')
          .eq('id', addressId)
          .single();

        if (addressInfo) {
          await supabase
            .from('customer_addresses')
            .update({ is_default: false })
            .eq('customer_id', addressInfo.customer_id);
        }
      }

      const { error } = await supabase
        .from('customer_addresses')
        .update(addressData)
        .eq('id', addressId);

      if (error) {
        console.error('❌ Error updating address:', error);
        throw error;
      }

      console.log('✅ Address updated successfully');
    } catch (error) {
      console.error('❌ Error in updateCustomerAddress:', error);
      throw error;
    }
  }

  async deleteCustomerAddress(addressId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting address:', addressId);
      const { error } = await supabase
        .from('customer_addresses')
        .delete()
        .eq('id', addressId);

      if (error) {
        console.error('❌ Error deleting address:', error);
        throw error;
      }

      console.log('✅ Address deleted successfully');
    } catch (error) {
      console.error('❌ Error in deleteCustomerAddress:', error);
      throw error;
    }
  }

  subscribeToCustomerAddresses(customerId: string, callback: (addresses: CustomerAddress[]) => void) {
    const channel = supabase
      .channel(`customer_addresses:${customerId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customer_addresses', filter: `customer_id=eq.${customerId}` },
        async () => {
          const addresses = await this.getCustomerAddresses(customerId);
          callback(addresses);
        }
      )
      .subscribe();

    return channel;
  }

  // ==================== COMBOS ====================

  async getCombos(): Promise<Combo[]> {
    try {
      const { data, error } = await supabase
        .from('combos')
        .select('*')
        .eq('available', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching combos:', error);
      return [];
    }
  }

  async getComboWithItems(comboId: string): Promise<{ combo: Combo; items: MenuItem[] } | null> {
    try {
      const { data: combo, error: comboError } = await supabase
        .from('combos')
        .select('*')
        .eq('id', comboId)
        .single();

      if (comboError) throw comboError;

      const { data: comboItems, error: itemsError } = await supabase
        .from('combo_items')
        .select('menu_item_id, quantity')
        .eq('combo_id', comboId);

      if (itemsError) throw itemsError;

      const menuItemIds = comboItems?.map(ci => ci.menu_item_id) || [];
      const { data: menuItems, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .in('id', menuItemIds);

      if (menuError) throw menuError;

      return {
        combo: combo as Combo,
        items: menuItems || []
      };
    } catch (error) {
      console.error('Error fetching combo with items:', error);
      return null;
    }
  }

  async createCombo(comboData: Omit<Combo, 'id' | 'created_at' | 'updated_at'>, itemIds: string[]): Promise<Combo> {
    try {
      console.log('📝 Creating combo:', comboData);

      const { data: combo, error: comboError } = await supabase
        .from('combos')
        .insert([comboData])
        .select()
        .single();

      if (comboError) {
        console.error('❌ Error creating combo:', comboError);
        throw comboError;
      }

      // Agregar items al combo
      if (itemIds.length > 0) {
        const comboItems = itemIds.map(itemId => ({
          combo_id: combo.id,
          menu_item_id: itemId,
          quantity: 1
        }));

        const { error: itemsError } = await supabase
          .from('combo_items')
          .insert(comboItems);

        if (itemsError) {
          console.error('❌ Error adding items to combo:', itemsError);
          throw itemsError;
        }
      }

      console.log('✅ Combo created:', combo);
      return combo as Combo;
    } catch (error) {
      console.error('❌ Error in createCombo:', error);
      throw error;
    }
  }

  async updateCombo(comboId: string, comboData: Partial<Omit<Combo, 'id' | 'created_at' | 'updated_at'>>, itemIds?: string[]): Promise<void> {
    try {
      console.log('📝 Updating combo:', comboId, comboData);

      const { error: comboError } = await supabase
        .from('combos')
        .update(comboData)
        .eq('id', comboId);

      if (comboError) {
        console.error('❌ Error updating combo:', comboError);
        throw comboError;
      }

      // Si se proporcionan items, actualizar la relación
      if (itemIds !== undefined) {
        // Eliminar items actuales
        await supabase
          .from('combo_items')
          .delete()
          .eq('combo_id', comboId);

        // Agregar nuevos items
        if (itemIds.length > 0) {
          const comboItems = itemIds.map(itemId => ({
            combo_id: comboId,
            menu_item_id: itemId,
            quantity: 1
          }));

          const { error: itemsError } = await supabase
            .from('combo_items')
            .insert(comboItems);

          if (itemsError) {
            console.error('❌ Error updating combo items:', itemsError);
            throw itemsError;
          }
        }
      }

      console.log('✅ Combo updated');
    } catch (error) {
      console.error('❌ Error in updateCombo:', error);
      throw error;
    }
  }

  async deleteCombo(comboId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting combo:', comboId);
      const { error } = await supabase
        .from('combos')
        .update({ available: false })
        .eq('id', comboId);

      if (error) {
        console.error('❌ Error deleting combo:', error);
        throw error;
      }

      console.log('✅ Combo deleted (marked as unavailable)');
    } catch (error) {
      console.error('❌ Error in deleteCombo:', error);
      throw error;
    }
  }

  subscribeToComboChanges(callback: (combos: Combo[]) => void) {
    const channel = supabase
      .channel('combos-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'combos' },
        async () => {
          const combos = await this.getCombos();
          callback(combos);
        }
      )
      .subscribe();

    return channel;
  }

  // ==================== EMPLOYEES ====================

  async getEmployees(): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('full_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
  }

  async getEmployeeByEmail(email: string): Promise<Employee | null> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .eq('active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      return data as Employee;
    } catch (error) {
      console.error('Error fetching employee by email:', error);
      return null;
    }
  }

  async getEmployeeByAuthId(authUserId: string): Promise<Employee | null> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('auth_user_id', authUserId)
        .eq('active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as Employee;
    } catch (error) {
      console.error('Error fetching employee by auth ID:', error);
      return null;
    }
  }

  async createEmployee(employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): Promise<Employee> {
    try {
      console.log('📝 Creating employee:', employeeData);
      const { data, error } = await supabase
        .from('employees')
        .insert([employeeData])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating employee:', error);
        throw error;
      }

      console.log('✅ Employee created:', data);
      return data as Employee;
    } catch (error) {
      console.error('❌ Error in createEmployee:', error);
      throw error;
    }
  }

  async updateEmployee(employeeId: string, employeeData: Partial<Omit<Employee, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    try {
      console.log('📝 Updating employee:', employeeId, employeeData);
      const { error } = await supabase
        .from('employees')
        .update(employeeData)
        .eq('id', employeeId);

      if (error) {
        console.error('❌ Error updating employee:', error);
        throw error;
      }

      console.log('✅ Employee updated');
    } catch (error) {
      console.error('❌ Error in updateEmployee:', error);
      throw error;
    }
  }

  async linkEmployeeToAuthUser(employeeId: string, authUserId: string): Promise<void> {
    try {
      await this.updateEmployee(employeeId, { auth_user_id: authUserId });
    } catch (error) {
      console.error('❌ Error linking employee to auth user:', error);
      throw error;
    }
  }

  async deleteEmployee(employeeId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting employee:', employeeId);
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId);

      if (error) {
        console.error('❌ Error deleting employee:', error);
        throw error;
      }

      console.log('✅ Employee deleted');
    } catch (error) {
      console.error('❌ Error in deleteEmployee:', error);
      throw error;
    }
  }

  // ==================== REAL-TIME SUBSCRIPTIONS ====================

  subscribeToOrders(callback: (orders: Order[]) => void) {
    const subscription = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          this.getOrders().then(callback);
        }
      )
      .subscribe();

    return subscription;
  }

  subscribeToPickupOrders(callback: (orders: Order[]) => void) {
    const subscription = supabase
      .channel('public:orders:pickup')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          this.getOrdersByType('pickup').then(callback);
        }
      )
      .subscribe();

    return subscription;
  }

  subscribeToMenuItems(callback: (items: MenuItem[]) => void) {
    const subscription = supabase
      .channel('public:menu_items')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_items' },
        () => {
          this.getMenuItems().then(callback);
        }
      )
      .subscribe();

    return subscription;
  }

  // ==================== OBSERVABLES ====================

  getOrders$(): Observable<Order[]> {
    return this.ordersSubject.asObservable();
  }

  getMenuItems$(): Observable<MenuItem[]> {
    return this.menuItemsSubject.asObservable();
  }

  updateOrders(orders: Order[]) {
    this.ordersSubject.next(orders);
  }

  updateMenuItems(items: MenuItem[]) {
    this.menuItemsSubject.next(items);
  }
}
