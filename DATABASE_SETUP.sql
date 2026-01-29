-- ==================== CATEGORÍAS ====================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

INSERT INTO categories (name, description, icon) VALUES
  ('Sushi', 'Platos de sushi variado', '🍣'),
  ('Ramen', 'Sopas ramen tradicionales', '🍜'),
  ('Entradas', 'Entrada deliciosas', '🥟'),
  ('Bowls', 'Bowls nutritivos', '🥣'),
  ('Postres', 'Postres y dulces', '🍰'),
  ('Bebidas', 'Bebidas frescas', '🥤')
ON CONFLICT DO NOTHING;

-- ==================== ITEMS DE MENÚ ====================
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category_id UUID REFERENCES categories(id),
  image_url VARCHAR(500),
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

INSERT INTO menu_items (name, description, price, category_id, available) VALUES
  ('Sushi Variado (24 pzas)', 'Mix de sushi fresco', 28.99, (SELECT id FROM categories WHERE name = 'Sushi'), true),
  ('California Roll', 'Rollo de California con camarón', 12.99, (SELECT id FROM categories WHERE name = 'Sushi'), true),
  ('Philadelphia Roll', 'Rollo con salmón y queso crema', 13.99, (SELECT id FROM categories WHERE name = 'Sushi'), true),
  ('Ramen Tonkotsu', 'Ramen con caldo de cerdo', 15.99, (SELECT id FROM categories WHERE name = 'Ramen'), true),
  ('Ramen Miso', 'Ramen con miso tradicional', 14.99, (SELECT id FROM categories WHERE name = 'Ramen'), true),
  ('Gyoza (6 pzas)', 'Dumplings fritos', 7.99, (SELECT id FROM categories WHERE name = 'Entradas'), true)
ON CONFLICT DO NOTHING;

-- ==================== CLIENTES ====================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(email),
  UNIQUE(phone)
);

-- ==================== ÓRDENES ====================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(100) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  order_type VARCHAR(50) NOT NULL CHECK (order_type IN ('dine-in', 'pickup', 'delivery')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  total_price DECIMAL(10, 2) NOT NULL,
  table_number INTEGER,
  delivery_address TEXT,
  pickup_time VARCHAR(5),
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_type ON orders(order_type);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- ==================== ITEMS DE ORDEN ====================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- ==================== HISTORIAL DE ESTADO ====================
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_status_history_order_id ON order_status_history(order_id);

-- ==================== PAGOS ====================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'card', 'online')),
  transaction_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_payments_order_id ON payments(order_id);

-- ==================== TRABAJOS DE IMPRESIÓN ====================
CREATE TABLE IF NOT EXISTS print_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  printer_type VARCHAR(50) CHECK (printer_type IN ('receipt', 'kitchen', 'label')),
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'completed', 'failed')),
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_print_jobs_status ON print_jobs(status);

-- ==================== TURNOS DE CAJA ====================
CREATE TABLE IF NOT EXISTS cash_register_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  shift_number VARCHAR(100) UNIQUE NOT NULL,
  opening_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  closing_amount DECIMAL(10, 2),
  total_sales DECIMAL(10, 2) DEFAULT 0,
  opened_at TIMESTAMP DEFAULT now(),
  closed_at TIMESTAMP,
  notes TEXT
);

CREATE INDEX idx_shifts_opened_at ON cash_register_shifts(opened_at DESC);

-- ==================== GESTIÓN DE INVENTARIO ====================
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  quantity_available INTEGER NOT NULL,
  quantity_reserved INTEGER DEFAULT 0,
  minimum_stock INTEGER DEFAULT 5,
  unit VARCHAR(50),
  last_restocked TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(menu_item_id)
);

-- ==================== MOVIMIENTOS DE INVENTARIO ====================
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES inventory(id),
  movement_type VARCHAR(50) CHECK (movement_type IN ('purchase', 'consumption', 'adjustment', 'loss')),
  quantity INTEGER NOT NULL,
  notes TEXT,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT now()
);

-- ==================== ZONAS DE ENTREGA ====================
CREATE TABLE IF NOT EXISTS delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  base_fee DECIMAL(10, 2) NOT NULL,
  max_distance_km DECIMAL(5, 2),
  estimated_time_minutes INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- ==================== POLÍTICAS RLS ====================

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Public read access for menu items and categories
CREATE POLICY "Allow public read on categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read on menu_items" ON menu_items FOR SELECT USING (available = true);

-- Authenticated users can read orders
CREATE POLICY "Allow authenticated read on orders" ON orders FOR SELECT USING (auth.role() = 'authenticated');

-- Insert orders for authenticated users
CREATE POLICY "Allow insert orders for authenticated" ON orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Update orders for authenticated users
CREATE POLICY "Allow update orders for authenticated" ON orders FOR UPDATE USING (auth.role() = 'authenticated');
