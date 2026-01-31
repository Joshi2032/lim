// Centralized models for Combos domain
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
