export type AssignmentStatus = 'pendiente' | 'en-ruta' | 'entregado' | 'cancelado';

export interface Assignment {
  id: string;
  order_id: string;
  customer_id: string;
  delivery_person_id: string;
  status: AssignmentStatus;
  address?: string;
  notes?: string;
  assigned_at: string;
  completed_at?: string;
}

export type AssignmentCreate = Omit<Assignment, 'id' | 'assigned_at' | 'completed_at'>;
export type AssignmentUpdate = Partial<Pick<Assignment, 'status' | 'address' | 'notes' | 'completed_at'>>;
