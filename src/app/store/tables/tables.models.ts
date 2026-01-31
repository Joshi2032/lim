// Centralized models for Tables domain
export interface RestaurantTable {
  id: string;
  table_number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  current_order_id?: string;
  created_at: string;
  updated_at: string;
}
