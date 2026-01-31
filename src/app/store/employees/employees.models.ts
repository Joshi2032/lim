// Centralized models for Employees domain
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
