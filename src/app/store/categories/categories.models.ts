// Centralized models for Categories domain
export interface Category {
  id: string;
  name: string;
  description?: string;
  display_order?: number;
  created_at: string;
  updated_at: string;
}
