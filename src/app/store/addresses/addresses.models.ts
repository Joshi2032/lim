export interface CustomerAddress {
  id: string | number;
  customer_id: string | number;
  label: string;
  street: string;
  city: string;
  state: string;
  zip_code?: string;
  reference?: string;
  is_default: boolean;
}
