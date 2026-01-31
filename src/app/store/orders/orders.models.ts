// Centralized models for Orders domain
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
