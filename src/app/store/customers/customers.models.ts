// Centralized models for Customers domain
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
