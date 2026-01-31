-- ============================================
-- TABLA: positions
-- Descripción: Puestos/roles disponibles para empleados
-- ============================================
CREATE TABLE IF NOT EXISTS public.positions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    display_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar puestos predefinidos
INSERT INTO public.positions (name, description, display_name)
VALUES
    ('admin', 'Administrador del sistema', 'Dueña'),
    ('chef', 'Chef de cocina', 'Chef'),
    ('waiter', 'Mesero/Mesera', 'Mesero'),
    ('delivery', 'Personal de reparto', 'Repartidor'),
    ('cashier', 'Cajero/Cajera', 'Cajero')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- MODIFICAR TABLA: employees
-- Agregar FK a positions y migrar datos
-- ============================================

-- 1. Agregar nueva columna position_id
ALTER TABLE public.employees
ADD COLUMN position_id UUID REFERENCES public.positions(id) ON DELETE RESTRICT;

-- 2. Migrar datos existentes (mapear roles a IDs de posiciones)
UPDATE public.employees e
SET position_id = (SELECT id FROM public.positions WHERE name = e.role)
WHERE e.role IS NOT NULL;

-- 3. Hacer la columna position_id NOT NULL (después de migrar los datos)
ALTER TABLE public.employees
ALTER COLUMN position_id SET NOT NULL;

-- 4. Eliminar columna role antigua
ALTER TABLE public.employees
DROP COLUMN role;

-- 5. Crear índice para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_employees_position_id ON public.employees(position_id);

-- ============================================
-- VALIDACIÓN
-- ============================================
-- Verificar que todos los empleados tengan posición asignada
SELECT COUNT(*) as total_employees,
       SUM(CASE WHEN position_id IS NOT NULL THEN 1 ELSE 0 END) as employees_with_position
FROM public.employees;

-- Ver la estructura final
SELECT
    e.id,
    e.full_name,
    e.email,
    p.name as role,
    p.display_name as role_display,
    e.active
FROM public.employees e
JOIN public.positions p ON e.position_id = p.id
ORDER BY e.full_name;
