// Centralized models for Menu domain
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url?: string;
  available: boolean;
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
