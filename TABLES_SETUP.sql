-- Crear tabla para mesas del restaurante
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INTEGER NOT NULL UNIQUE,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning')),
  current_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_tables_status ON restaurant_tables(status);
CREATE INDEX IF NOT EXISTS idx_tables_number ON restaurant_tables(table_number);

-- Insertar mesas de ejemplo (12 mesas con diferentes capacidades)
INSERT INTO restaurant_tables (table_number, capacity, status) VALUES
  (1, 2, 'available'),
  (2, 2, 'available'),
  (3, 4, 'available'),
  (4, 4, 'available'),
  (5, 6, 'available'),
  (6, 6, 'available'),
  (7, 8, 'available'),
  (8, 4, 'available'),
  (9, 2, 'available'),
  (10, 4, 'available'),
  (11, 6, 'available'),
  (12, 8, 'available')
ON CONFLICT (table_number) DO NOTHING;

-- Habilitar Row Level Security
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad (permitir acceso público para MVP)
DROP POLICY IF EXISTS "Allow public read on restaurant_tables" ON restaurant_tables;
DROP POLICY IF EXISTS "Allow public update on restaurant_tables" ON restaurant_tables;

CREATE POLICY "Allow public read on restaurant_tables"
  ON restaurant_tables FOR SELECT USING (true);

CREATE POLICY "Allow public update on restaurant_tables"
  ON restaurant_tables FOR UPDATE USING (true);

-- Agregar tabla de direcciones de clientes (customer_addresses)
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label VARCHAR(100) NOT NULL,
  street VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20),
  reference TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Índice para direcciones
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_default ON customer_addresses(customer_id, is_default);

-- RLS para direcciones
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access on customer_addresses" ON customer_addresses;
CREATE POLICY "Allow public access on customer_addresses"
  ON customer_addresses FOR ALL USING (true);
