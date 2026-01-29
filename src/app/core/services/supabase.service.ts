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
