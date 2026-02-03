import { Injectable, isDevMode } from '@angular/core';
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

export interface Position {
  id: string;
  name: string;
  description?: string;
  display_name: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  auth_user_id?: string;
  email: string;
  full_name: string;
  position_id: string;
  position?: Position;
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
  private readonly debug = isDevMode();
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  private menuItemsSubject = new BehaviorSubject<MenuItem[]>([]);

  constructor() {}

  private log(...args: unknown[]) {
    if (this.debug) {
      console.log(...args);
    }
  }

  // ==================== ORDERS ====================

  async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
    try {
      this.log('Creating order:', orderData);
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
      this.log('Order created:', data);
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
      this.log('Orders loaded:', (data || []).length, data);
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
      this.log(`Orders of type ${orderType} loaded:`, (data || []).length, data);
      return (data || []) as Order[];
    } catch (error) {
      console.error(`Error fetching orders with type ${orderType}:`, error);
      return [];
    }
  }

  async updateOrderStatus(orderId: string, status: Order['status'], userId?: string) {
    try {
      this.log('📝 Updating order status:', orderId, 'to', status);

      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      // Registrar en historial de cambios de estado
      const { error: historyError } = await supabase
        .from('order_status_history')
        .insert([{
          order_id: orderId,
          status: status,
          changed_by: userId || 'system',
          changed_at: new Date().toISOString()
        }]);

      if (historyError) {
        console.warn('⚠️ Error recording status history:', historyError);
        // No fallar si no se puede registrar el historial
      } else {
        this.log('✅ Status history recorded');
      }

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
      this.log('Adding order items:', items);
      const { data, error } = await supabase
        .from('order_items')
        .insert(items)
        .select();

      if (error) {
        console.error('Supabase error adding order items:', error);
        throw error;
      }
      this.log('Order items added:', data);
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
      this.log('Menu items loaded:', items.length, items);
      this.menuItemsSubject.next(items);
      return items;
    } catch (error) {
      console.error('Error fetching menu items:', error);
      return [];
    }
  }

  async getMenuItemById(menuItemId: string): Promise<MenuItem | null> {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', menuItemId)
        .single();

      if (error) throw error;
      return data as MenuItem;
    } catch (error) {
      console.error('Error fetching menu item by id:', error);
      return null;
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
      this.log('📝 Creating menu item:', itemData);
      const { data, error } = await supabase
        .from('menu_items')
        .insert([itemData])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating menu item:', error);
        throw error;
      }

      this.log('✅ Menu item created:', data);
      return data as MenuItem;
    } catch (error) {
      console.error('❌ Error in createMenuItem:', error);
      throw error;
    }
  }

  async updateMenuItem(itemId: string, itemData: Partial<Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    try {
      this.log('📝 Updating menu item:', itemId, itemData);
      const { error } = await supabase
        .from('menu_items')
        .update(itemData)
        .eq('id', itemId);

      if (error) {
        console.error('❌ Error updating menu item:', error);
        throw error;
      }

      this.log('✅ Menu item updated');
    } catch (error) {
      console.error('❌ Error in updateMenuItem:', error);
      throw error;
    }
  }

  async deleteMenuItem(itemId: string): Promise<void> {
    try {
      this.log('🗑️ Deleting menu item:', itemId);
      const { error } = await supabase
        .from('menu_items')
        .update({ available: false })
        .eq('id', itemId);

      if (error) {
        console.error('❌ Error deleting menu item:', error);
        throw error;
      }

      this.log('✅ Menu item deleted (marked as unavailable)');
    } catch (error) {
      console.error('❌ Error in deleteMenuItem:', error);
      throw error;
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      this.log('📋 Fetching categories...');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ Error fetching categories:', error);
        throw error;
      }

      this.log('✅ Categories fetched:', data?.length || 0);
      return (data as Category[]) || [];
    } catch (error) {
      console.error('❌ Error in getCategories:', error);
      throw error;
    }
  }

  // ==================== RESTAURANT TABLES ====================

  async getTables(): Promise<RestaurantTable[]> {
    try {
      this.log('📋 Fetching tables...');
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .order('table_number', { ascending: true });

      if (error) {
        console.error('❌ Error fetching tables:', error);
        throw error;
      }

      this.log('✅ Tables fetched:', data?.length || 0);
      return (data as RestaurantTable[]) || [];
    } catch (error) {
      console.error('❌ Error in getTables:', error);
      throw error;
    }
  }

  async updateTableStatus(tableId: string, status: 'available' | 'occupied' | 'reserved' | 'cleaning'): Promise<void> {
    try {
      this.log('📝 Updating table status:', tableId, status);
      const { error } = await supabase
        .from('restaurant_tables')
        .update({ status })
        .eq('id', tableId);

      if (error) {
        console.error('❌ Error updating table status:', error);
        throw error;
      }

      this.log('✅ Table status updated');
    } catch (error) {
      console.error('❌ Error in updateTableStatus:', error);
      throw error;
    }
  }

  subscribeToTables(callback: (tables: RestaurantTable[]) => void) {
    this.log('🔔 Subscribing to table changes...');

    const channel = supabase
      .channel('restaurant_tables-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'restaurant_tables' },
        () => {
          this.log('🔄 Table change detected, fetching updated tables...');
          this.getTables().then(callback);
        }
      )
      .subscribe();

    return channel;
  }

  // ==================== AUTHENTICATION ====================

  async signIn(email: string, password: string) {
    try {
      this.log('🔑 Signing in user:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Sign in error:', error);
        throw error;
      }

      this.log('✅ User signed in:', data.user?.email);
      return data;
    } catch (error) {
      console.error('❌ Error in signIn:', error);
      throw error;
    }
  }

  async signUp(email: string, password: string, metadata?: { name?: string }) {
    try {
      this.log('📝 Signing up user:', email);
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

      this.log('✅ User signed up:', data.user?.email);
      return data;
    } catch (error) {
      console.error('❌ Error in signUp:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      this.log('🚪 Signing out user...');
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ Sign out error:', error);
        throw error;
      }

      this.log('✅ User signed out');
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

  subscribeToEmployeeChanges(employeeId: string, callback: (employee: Employee) => void) {
    console.log('📡 Creando suscripción para empleado:', employeeId);

    const channel = supabase
      .channel(`employee-${employeeId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'employees',
          filter: `id=eq.${employeeId}`
        },
        async (payload) => {
          console.log('🔔 Employee change detected:', payload);
          // Recargar empleado con relaciones
          const { data } = await supabase
            .from('employees')
            .select(`
              *,
              position: positions(
                id,
                name,
                description,
                display_name,
                created_at,
                updated_at
              )
            `)
            .eq('id', employeeId)
            .single();

          if (data) {
            console.log('✅ Datos actualizados recibidos:', data);
            callback(data as Employee);
          } else {
            console.log('❌ No se pudieron obtener los datos actualizados');
          }
        }
      )
      .subscribe((status, err) => {
        console.log('📡 Estado de suscripción:', status);
        if (err) {
          console.error('❌ Error en suscripción:', err);
        }
      });

    return channel;
  }

  unsubscribe(channel: any) {
    if (channel) {
      supabase.removeChannel(channel);
    }
  }

  // ==================== CUSTOMERS ====================

  async createOrGetCustomer(phone: string, name?: string, email?: string): Promise<Customer> {
    try {
      this.log('🔍 Checking for existing customer with phone:', phone);

      // Try to find existing customer by phone
      const { data: existing } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', phone)
        .single();

      if (existing) {
        this.log('✅ Found existing customer:', existing);
        return existing as Customer;
      }

      // Create new customer
      this.log('📝 Creating new customer...');
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

      this.log('✅ Customer created:', data);
      return data as Customer;
    } catch (error) {
      console.error('❌ Error in createOrGetCustomer:', error);
      throw error;
    }
  }

  async getCustomers(): Promise<Customer[]> {
    try {
      this.log('📋 Fetching all customers...');
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching customers:', error);
        throw error;
      }

      this.log('✅ Customers fetched:', data?.length || 0);
      return (data as Customer[]) || [];
    } catch (error) {
      console.error('❌ Error in getCustomers:', error);
      throw error;
    }
  }

  async updateCustomer(customerId: number, customerData: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    try {
      this.log('📝 Updating customer:', customerId, customerData);
      const { error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', customerId);

      if (error) {
        console.error('❌ Error updating customer:', error);
        throw error;
      }

      this.log('✅ Customer updated successfully');
    } catch (error) {
      console.error('❌ Error in updateCustomer:', error);
      throw error;
    }
  }

  async deleteCustomer(customerId: number): Promise<void> {
    try {
      this.log('🗑️ Deleting customer:', customerId);
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) {
        console.error('❌ Error deleting customer:', error);
        throw error;
      }

      this.log('✅ Customer deleted successfully');
    } catch (error) {
      console.error('❌ Error in deleteCustomer:', error);
      throw error;
    }
  }

  // ==================== CUSTOMER ADDRESSES ====================

  async getCustomerAddresses(customerId: string): Promise<CustomerAddress[]> {
    try {
      this.log('📋 Fetching addresses for customer:', customerId);
      const { data, error } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('customer_id', customerId)
        .order('is_default', { ascending: false });

      if (error) {
        console.error('❌ Error fetching addresses:', error);
        throw error;
      }

      this.log('✅ Addresses fetched:', data?.length || 0);
      return (data as CustomerAddress[]) || [];
    } catch (error) {
      console.error('❌ Error in getCustomerAddresses:', error);
      throw error;
    }
  }

  async createCustomerAddress(addressData: Omit<CustomerAddress, 'id' | 'created_at' | 'updated_at'>): Promise<CustomerAddress> {
    try {
      this.log('📝 Creating customer address:', addressData);

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

      this.log('✅ Address created:', data);
      return data as CustomerAddress;
    } catch (error) {
      console.error('❌ Error in createCustomerAddress:', error);
      throw error;
    }
  }

  async updateCustomerAddress(addressId: string, addressData: Partial<Omit<CustomerAddress, 'id' | 'customer_id' | 'created_at' | 'updated_at'>>): Promise<void> {
    try {
      this.log('📝 Updating address:', addressId, addressData);

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

      this.log('✅ Address updated successfully');
    } catch (error) {
      console.error('❌ Error in updateCustomerAddress:', error);
      throw error;
    }
  }

  async deleteCustomerAddress(addressId: string): Promise<void> {
    try {
      this.log('🗑️ Deleting address:', addressId);
      const { error } = await supabase
        .from('customer_addresses')
        .delete()
        .eq('id', addressId);

      if (error) {
        console.error('❌ Error deleting address:', error);
        throw error;
      }

      this.log('✅ Address deleted successfully');
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
      this.log('📝 Creating combo:', comboData);

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

      this.log('✅ Combo created:', combo);
      return combo as Combo;
    } catch (error) {
      console.error('❌ Error in createCombo:', error);
      throw error;
    }
  }

  async updateCombo(comboId: string, comboData: Partial<Omit<Combo, 'id' | 'created_at' | 'updated_at'>>, itemIds?: string[]): Promise<void> {
    try {
      this.log('📝 Updating combo:', comboId, comboData);

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

      this.log('✅ Combo updated');
    } catch (error) {
      console.error('❌ Error in updateCombo:', error);
      throw error;
    }
  }

  async deleteCombo(comboId: string): Promise<void> {
    try {
      this.log('🗑️ Deleting combo:', comboId);
      const { error } = await supabase
        .from('combos')
        .update({ available: false })
        .eq('id', comboId);

      if (error) {
        console.error('❌ Error deleting combo:', error);
        throw error;
      }

      this.log('✅ Combo deleted (marked as unavailable)');
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

  // ==================== ASSIGNMENTS ====================

  async createAssignment(assignmentData: {
    order_id: string;
    customer_id: string;
    delivery_person_id: string;
    status: 'pendiente' | 'en-ruta' | 'entregado' | 'cancelado';
    address?: string;
    notes?: string;
  }): Promise<any> {
    try {
      this.log('📝 Creating assignment:', assignmentData);

      const { data, error } = await supabase
        .from('assignments')
        .insert([assignmentData])
        .select()
        .single();

      if (error) throw error;

      this.log('✅ Assignment created:', data);
      return data;
    } catch (error) {
      console.error('❌ Error creating assignment:', error);
      throw error;
    }
  }

  async getAssignments(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching assignments:', error);
      return [];
    }
  }

  async getAssignmentsByDeliveryPerson(deliveryPersonId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('delivery_person_id', deliveryPersonId)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching assignments for delivery person:', error);
      return [];
    }
  }

  async updateAssignment(assignmentId: string, assignmentData: Partial<{
    status: string;
    address: string;
    notes: string;
    completed_at: string;
  }>): Promise<void> {
    try {
      this.log('📝 Updating assignment:', assignmentId, assignmentData);

      const { error } = await supabase
        .from('assignments')
        .update({ ...assignmentData, updated_at: new Date().toISOString() })
        .eq('id', assignmentId);

      if (error) throw error;

      this.log('✅ Assignment updated');
    } catch (error) {
      console.error('❌ Error updating assignment:', error);
      throw error;
    }
  }

  async deleteAssignment(assignmentId: string): Promise<void> {
    try {
      this.log('🗑️ Deleting assignment:', assignmentId);

      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      this.log('✅ Assignment deleted');
    } catch (error) {
      console.error('❌ Error deleting assignment:', error);
      throw error;
    }
  }

  subscribeToAssignments(callback: (assignments: any[]) => void) {
    const channel = supabase
      .channel('assignments-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assignments' },
        async () => {
          const assignments = await this.getAssignments();
          callback(assignments);
        }
      )
      .subscribe();

    return channel;
  }

  // ==================== POSITIONS ====================

  async getPositions(): Promise<Position[]> {
    try {
      this.log('📋 Fetching positions...');
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      this.log('✅ Positions fetched:', data?.length || 0);
      return (data as Position[]) || [];
    } catch (error) {
      console.error('❌ Error in getPositions:', error);
      throw error;
    }
  }

  async getPositionByName(positionName: string): Promise<Position | null> {
    try {
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .eq('name', positionName)
        .single();

      if (error) throw error;
      return data as Position;
    } catch (error) {
      console.error('❌ Error in getPositionByName:', error);
      return null;
    }
  }

  // ==================== EMPLOYEES ====================

  async getEmployees(): Promise<Employee[]> {
    try {
      this.log('📋 Fetching employees...');
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          position: positions(
            id,
            name,
            description,
            display_name,
            created_at,
            updated_at
          )
        `)
        .order('full_name', { ascending: true });

      if (error) throw error;
      this.log('✅ Employees fetched:', data?.length || 0, data);
      return (data as Employee[]) || [];
    } catch (error) {
      console.error('❌ Error in getEmployees:', error);
      return [];
    }
  }

  async getEmployeeByEmail(email: string): Promise<Employee | null> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          position: positions(
            id,
            name,
            description,
            display_name,
            created_at,
            updated_at
          )
        `)
        .eq('email', email)
        .eq('active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }
      return data as Employee;
    } catch (error) {
      console.error('❌ Error in getEmployeeByEmail:', error);
      return null;
    }
  }

  async getEmployeeByAuthId(authUserId: string): Promise<Employee | null> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          position: positions(
            id,
            name,
            description,
            display_name,
            created_at,
            updated_at
          )
        `)
        .eq('auth_user_id', authUserId)
        .eq('active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as Employee;
    } catch (error) {
      console.error('❌ Error in getEmployeeByAuthId:', error);
      return null;
    }
  }

  private async signUpWithRetry(
    email: string,
    password: string,
    fullName: string,
    maxRetries: number = 3
  ) {
    let lastError: any = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: undefined
          }
        });

        if (error) {
          lastError = error;

          // Si es un error de rate limit, esperar y reintentar
          if (error.message?.includes('rate limit')) {
            const delayMs = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
            this.log(`⏳ Rate limit detectado. Reintentando en ${delayMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            continue;
          }

          // Otros errores, lanzar inmediatamente
          throw error;
        }

        return data;
      } catch (error) {
        lastError = error;
      }
    }

    // Si se agotaron los reintentos
    throw lastError || new Error('Error al crear usuario en Authentication');
  }

  async createEmployee(
    employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'position'>,
    password?: string
  ): Promise<Employee> {
    try {
      this.log('📝 Creating employee:', employeeData);

      // Nota: Supabase Auth valida emails únicos automáticamente
      // No necesitamos validar aquí para evitar problemas de autenticación      // 1. Usar contraseña proporcionada o generar una temporal
      const userPassword = password || this.generateTemporaryPassword();
      const isTemporaryPassword = !password;

      // 2. Crear usuario en Authentication (con manejo de rate limit)
      this.log('🔐 Creating auth user for:', employeeData.email);
      const authData = await this.signUpWithRetry(
        employeeData.email,
        userPassword,
        employeeData.full_name
      );

      if (!authData?.user) {
        throw new Error('No se pudo crear el usuario en Authentication');
      }

      this.log('✅ Auth user created:', authData.user.id);

      // 3. Crear empleado en la tabla con el auth_user_id
      const employeeWithAuth = {
        ...employeeData,
        auth_user_id: authData.user.id
      };

      const { data, error } = await supabase
        .from('employees')
        .insert([employeeWithAuth])
        .select(`
          *,
          position: positions(
            id,
            name,
            description,
            display_name,
            created_at,
            updated_at
          )
        `)
        .single();

      if (error) {
        console.error('❌ Error creating employee:', error);
        // Si falla la creación del empleado, intentar eliminar el usuario de auth
        await supabase.auth.admin.deleteUser(authData.user.id).catch(console.error);
        throw error;
      }

      this.log('✅ Employee created:', data);

      // Solo mostrar contraseña si fue generada automáticamente
      if (isTemporaryPassword) {
        this.log('🔑 Temporary password:', userPassword, '(Save this!)');
      }

      // Retornar el empleado con la contraseña solo si fue temporal
      return {
        ...data as Employee,
        temporaryPassword: isTemporaryPassword ? userPassword : undefined
      } as any;
    } catch (error) {
      console.error('❌ Error in createEmployee:', error);
      throw error;
    }
  }

  private generateTemporaryPassword(): string {
    // Generar contraseña temporal segura (8 caracteres: letras, números y símbolos)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async updateEmployee(employeeId: string, employeeData: Partial<Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'position'>>): Promise<void> {
    try {
      this.log('📝 Updating employee:', employeeId, employeeData);
      const { error } = await supabase
        .from('employees')
        .update(employeeData)
        .eq('id', employeeId);

      if (error) {
        console.error('❌ Error updating employee:', error);
        throw error;
      }

      this.log('✅ Employee updated');
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
      this.log('🗑️ Deleting employee:', employeeId);
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId);

      if (error) {
        console.error('❌ Error deleting employee:', error);
        throw error;
      }

      this.log('✅ Employee deleted');
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
