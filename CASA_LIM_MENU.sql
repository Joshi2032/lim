-- ============================================
-- MENÚ CASA LIM - Script de inserción completa
-- ============================================

-- ==================== LIMPIAR DATOS ANTERIORES (OPCIONAL) ====================
-- DESCOMENTAR SI QUIERES EMPEZAR DE CERO
-- DELETE FROM combo_items;
-- DELETE FROM combos;
-- DELETE FROM menu_items;
-- DELETE FROM categories;

-- ==================== CATEGORÍAS ====================
INSERT INTO categories (name, description, icon) VALUES
  ('Paquetes', 'Combos económicos con arroz y acompañamientos', '📦'),
  ('Platos Fuertes', 'Platos principales del restaurante', '🍽️'),
  ('Mariscos', 'Pescados y mariscos frescos', '🦐'),
  ('Sopas', 'Sopas calientes', '🍜'),
  ('Arroces', 'Arroces especiales', '🍚'),
  ('Tallarines', 'Fideos salteados', '🍝'),
  ('Fritos', 'Entradas fritas crujientes', '🍤'),
  ('Sushi', 'Rolls y sushi variado', '🍣'),
  ('Bebidas', 'Bebidas refrescantes', '🥤'),
  ('Postres', 'Postres y helados', '🍰');

-- ==================== ITEMS DE MENÚ ====================

-- FRITOS / ENTRADAS
INSERT INTO menu_items (name, description, price, category_id, available) VALUES
  ('Camarones Gratinados', 'Camarones empanizados crujientes', 3.50, (SELECT id FROM categories WHERE name = 'Fritos' LIMIT 1), true),
  ('Cerdo Agridulce', 'Cerdo en salsa agridulce', 3.50, (SELECT id FROM categories WHERE name = 'Platos Fuertes' LIMIT 1), true),
  ('Pollo Broster', 'Pollo frito estilo broaster', 2.50, (SELECT id FROM categories WHERE name = 'Fritos' LIMIT 1), true),
  ('Galleta de Calamar', 'Anillos de calamar empanizados', 2.00, (SELECT id FROM categories WHERE name = 'Fritos' LIMIT 1), true),
  ('China Malla', 'Masa frita crujiente', 1.50, (SELECT id FROM categories WHERE name = 'Fritos' LIMIT 1), true),
  ('Deditos', 'Dedos de pescado empanizados', 2.00, (SELECT id FROM categories WHERE name = 'Fritos' LIMIT 1), true),
  ('Wantan Frito', 'Wantanes crujientes', 2.00, (SELECT id FROM categories WHERE name = 'Fritos' LIMIT 1), true);

-- ARROCES
INSERT INTO menu_items (name, description, price, category_id, available) VALUES
  ('Arroz Frito', 'Arroz frito simple', 1.50, (SELECT id FROM categories WHERE name = 'Arroces' LIMIT 1), true),
  ('Arroz Chaufa', 'Arroz chaufa clásico', 3.50, (SELECT id FROM categories WHERE name = 'Arroces' LIMIT 1), true),
  ('Arroz Chino', 'Arroz chino especial', 3.50, (SELECT id FROM categories WHERE name = 'Arroces' LIMIT 1), true),
  ('Yakimeshi', 'Arroz frito estilo japonés', 3.50, (SELECT id FROM categories WHERE name = 'Arroces' LIMIT 1), true),
  ('Arroz con Mariscos', 'Arroz con mariscos mixtos', 5.00, (SELECT id FROM categories WHERE name = 'Mariscos' LIMIT 1), true);

-- TALLARINES
INSERT INTO menu_items (name, description, price, category_id, available) VALUES
  ('Tallarín Saltado', 'Tallarín salteado con verduras', 3.50, (SELECT id FROM categories WHERE name = 'Tallarines' LIMIT 1), true),
  ('Tallarín con Pollo', 'Tallarín con pollo saltado', 4.00, (SELECT id FROM categories WHERE name = 'Tallarines' LIMIT 1), true),
  ('Tallarín con Mariscos', 'Tallarín saltado con mariscos', 5.00, (SELECT id FROM categories WHERE name = 'Mariscos' LIMIT 1), true);

-- PLATOS FUERTES
INSERT INTO menu_items (name, description, price, category_id, available) VALUES
  ('Pollo a la Brasa', 'Pollo marinado a la parrilla', 3.50, (SELECT id FROM categories WHERE name = 'Platos Fuertes' LIMIT 1), true),
  ('Cebollín', 'Plato con cebolla china', 3.00, (SELECT id FROM categories WHERE name = 'Platos Fuertes' LIMIT 1), true),
  ('Tiqqui Tacui', 'Plato especial de la casa', 4.50, (SELECT id FROM categories WHERE name = 'Platos Fuertes' LIMIT 1), true),
  ('China Brasa', 'Plato fusión china con brasa', 4.50, (SELECT id FROM categories WHERE name = 'Platos Fuertes' LIMIT 1), true);

-- MARISCOS
INSERT INTO menu_items (name, description, price, category_id, available) VALUES
  ('Pescado Frito', 'Pescado entero frito', 5.00, (SELECT id FROM categories WHERE name = 'Mariscos' LIMIT 1), true),
  ('Pescado a la Plancha', 'Pescado a la plancha con ensalada', 5.00, (SELECT id FROM categories WHERE name = 'Mariscos' LIMIT 1), true),
  ('Camarones', 'Camarones salteados', 6.00, (SELECT id FROM categories WHERE name = 'Mariscos' LIMIT 1), true),
  ('Mejillones', 'Mejillones frescos', 4.50, (SELECT id FROM categories WHERE name = 'Mariscos' LIMIT 1), true),
  ('Gelatina de Cetal', 'Gelatina de pescado', 4.00, (SELECT id FROM categories WHERE name = 'Mariscos' LIMIT 1), true);

-- SOPAS
INSERT INTO menu_items (name, description, price, category_id, available) VALUES
  ('Sopa Maritash', 'Sopa de mariscos', 3.50, (SELECT id FROM categories WHERE name = 'Sopas' LIMIT 1), true),
  ('Wantan', 'Sopa wantan', 3.00, (SELECT id FROM categories WHERE name = 'Sopas' LIMIT 1), true);

-- SUSHI
INSERT INTO menu_items (name, description, price, category_id, available) VALUES
  ('Sushi Marino', 'Roll con pescado y mariscos', 8.00, (SELECT id FROM categories WHERE name = 'Sushi' LIMIT 1), true),
  ('Sushi Nikkei', 'Roll fusión peruano-japonés', 8.00, (SELECT id FROM categories WHERE name = 'Sushi' LIMIT 1), true),
  ('Sushi Acevichado', 'Roll con toque de ceviche', 8.00, (SELECT id FROM categories WHERE name = 'Sushi' LIMIT 1), true);

-- BEBIDAS
INSERT INTO menu_items (name, description, price, category_id, available) VALUES
  ('Refresco', 'Gaseosa personal', 1.50, (SELECT id FROM categories WHERE name = 'Bebidas' LIMIT 1), true),
  ('Chicha Morada', 'Chicha morada casera', 2.00, (SELECT id FROM categories WHERE name = 'Bebidas' LIMIT 1), true),
  ('Limonada', 'Limonada natural', 2.00, (SELECT id FROM categories WHERE name = 'Bebidas' LIMIT 1), true);

-- POSTRES
INSERT INTO menu_items (name, description, price, category_id, available) VALUES
  ('Ice Scholl Lim', 'Helado especial de la casa', 3.00, (SELECT id FROM categories WHERE name = 'Postres' LIMIT 1), true),
  ('Gelatina', 'Gelatina de frutas', 2.00, (SELECT id FROM categories WHERE name = 'Postres' LIMIT 1), true);

-- ==================== COMBOS / PAQUETES ====================

-- PAQUETE 1
INSERT INTO combos (name, description, price, available) VALUES
  ('Paquete 1', 'Arroz Frito + Opción de China Malla/Galleta de Calamar/Deditos', 2.00, true);

INSERT INTO combo_items (combo_id, menu_item_id, quantity)
SELECT
  (SELECT id FROM combos WHERE name = 'Paquete 1' LIMIT 1),
  id,
  1
FROM menu_items
WHERE name IN ('Arroz Frito', 'China Malla');

-- PAQUETE 2
INSERT INTO combos (name, description, price, available) VALUES
  ('Paquete 2', 'Arroz Frito + Cebollín + 2 Acompañamientos', 2.00, true);

INSERT INTO combo_items (combo_id, menu_item_id, quantity)
SELECT
  (SELECT id FROM combos WHERE name = 'Paquete 2' LIMIT 1),
  id,
  1
FROM menu_items
WHERE name IN ('Arroz Frito', 'Cebollín', 'Galleta de Calamar');

-- PAQUETE 3
INSERT INTO combos (name, description, price, available) VALUES
  ('Paquete 3', 'Arroz Frito + Cerdo/Pollo/Res + Deditos', 2.50, true);

INSERT INTO combo_items (combo_id, menu_item_id, quantity)
SELECT
  (SELECT id FROM combos WHERE name = 'Paquete 3' LIMIT 1),
  id,
  1
FROM menu_items
WHERE name IN ('Arroz Frito', 'Cerdo Agridulce', 'Deditos');

-- PAQUETE PLUS
INSERT INTO combos (name, description, price, available) VALUES
  ('Paquete Plus', 'Arroz Chino + Cerdo Agridulce + Cebollín', 2.50, true);

INSERT INTO combo_items (combo_id, menu_item_id, quantity)
SELECT
  (SELECT id FROM combos WHERE name = 'Paquete Plus' LIMIT 1),
  id,
  1
FROM menu_items
WHERE name IN ('Arroz Chino', 'Cerdo Agridulce', 'Cebollín');

-- ==================== VERIFICACIÓN ====================
-- Ver categorías creadas
SELECT 'CATEGORÍAS CREADAS:' as info;
SELECT name, description FROM categories ORDER BY name;

-- Ver items por categoría
SELECT 'ITEMS POR CATEGORÍA:' as info;
SELECT c.name as categoria, COUNT(mi.id) as total_items
FROM categories c
LEFT JOIN menu_items mi ON c.id = mi.category_id
GROUP BY c.name
ORDER BY c.name;

-- Ver combos creados
SELECT 'COMBOS CREADOS:' as info;
SELECT name, description, price FROM combos;

-- Total de items
SELECT 'TOTAL DE ITEMS:' as info, COUNT(*) as total FROM menu_items;
SELECT 'TOTAL DE COMBOS:' as info, COUNT(*) as total FROM combos;
