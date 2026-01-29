-- ============================================
-- TABLA: combos
-- Descripción: Almacena combos (conjuntos de platillos)
-- ============================================
CREATE TABLE IF NOT EXISTS public.combos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    japanese_name VARCHAR(255),
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: combo_items
-- Descripción: Relación muchos a muchos entre combos y menu_items
-- ============================================
CREATE TABLE IF NOT EXISTS public.combo_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    combo_id UUID NOT NULL REFERENCES public.combos(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(combo_id, menu_item_id)
);

-- ============================================
-- TABLA: employees
-- Descripción: Empleados del restaurante con autenticación
-- ============================================
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'chef', 'waiter', 'delivery', 'cashier')),
    phone VARCHAR(20),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_combos_available ON public.combos(available);
CREATE INDEX IF NOT EXISTS idx_combo_items_combo_id ON public.combo_items(combo_id);
CREATE INDEX IF NOT EXISTS idx_combo_items_menu_item_id ON public.combo_items(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_employees_auth_user_id ON public.employees(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_role ON public.employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_active ON public.employees(active);

-- Trigger para actualizar updated_at en combos
CREATE OR REPLACE FUNCTION update_combos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER combos_updated_at
    BEFORE UPDATE ON public.combos
    FOR EACH ROW
    EXECUTE FUNCTION update_combos_updated_at();

-- Trigger para actualizar updated_at en employees
CREATE OR REPLACE FUNCTION update_employees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER employees_updated_at
    BEFORE UPDATE ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION update_employees_updated_at();

-- Datos de ejemplo para empleados (opcional)
-- Nota: Los auth_user_id se deben agregar después de crear usuarios en Supabase Auth
INSERT INTO public.employees (email, full_name, role, phone, active)
VALUES
    ('admin@restaurant.com', 'Administrador', 'admin', '1234567890', true),
    ('chef@restaurant.com', 'Chef Principal', 'chef', '1234567891', true),
    ('mesero@restaurant.com', 'Mesero 1', 'waiter', '1234567892', true)
ON CONFLICT (email) DO NOTHING;

COMMENT ON TABLE public.combos IS 'Combos de platillos con precio especial';
COMMENT ON TABLE public.combo_items IS 'Platillos incluidos en cada combo';
COMMENT ON TABLE public.employees IS 'Empleados del restaurante con roles y autenticación';
