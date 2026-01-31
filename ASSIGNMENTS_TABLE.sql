-- ============================================
-- TABLA: assignments
-- Descripción: Asignaciones de pedidos a repartidores
-- ============================================
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    delivery_person_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en-ruta', 'entregado', 'cancelado')),
    address TEXT,
    notes TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_assignments_order_id ON public.assignments(order_id);
CREATE INDEX IF NOT EXISTS idx_assignments_customer_id ON public.assignments(customer_id);
CREATE INDEX IF NOT EXISTS idx_assignments_delivery_person_id ON public.assignments(delivery_person_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON public.assignments(status);

-- ============================================
-- Mejorar updateOrderStatus para registrar en historial
-- ============================================
-- Esta función debería llamarse cada vez que se cambie el estado de una orden
-- Será agregada al método updateOrderStatus en SupabaseService
