-- ================================
-- DATOS DE EJEMPLO PARA TIENDAFIX
-- ================================

-- Crear organización de ejemplo
INSERT INTO organizations (id, name, slug, email, phone, address, subscription_plan, subscription_status) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'TiendaFix Demo',
  'tiendafix-demo',
  'demo@tiendafix.com',
  '+51 999 123 456',
  'Av. Tecnología 123, Lima, Perú',
  'monthly_6',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Crear usuario owner de ejemplo
INSERT INTO users (id, organization_id, auth_user_id, name, email, role, phone, is_active)
VALUES (
  '650e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  'auth-user-demo-123',
  'Fernando Administrador',
  'fernandoapplehtml@gmail.com',
  'owner',
  '+51 999 123 456',
  true
) ON CONFLICT (id) DO NOTHING;

-- Crear algunos clientes de ejemplo
INSERT INTO customers (id, organization_id, name, email, phone, customer_type, is_recurrent, created_at)
VALUES 
  ('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'María García', 'maria@example.com', '+51 987 654 321', 'identified', true, NOW() - INTERVAL '10 days'),
  ('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Juan Pérez', 'juan@example.com', '+51 912 345 678', 'identified', false, NOW() - INTERVAL '5 days'),
  ('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', NULL, NULL, NULL, 'anonymous', false, NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- Actualizar el cliente anónimo con identificador
UPDATE customers 
SET anonymous_identifier = 'Cliente-ANO-001'
WHERE id = '750e8400-e29b-41d4-a716-446655440003';

-- Crear algunos dispositivos de ejemplo
INSERT INTO devices (id, organization_id, customer_id, brand, model, device_type, imei, serial_number, color, storage_capacity, operating_system, notes, created_at)
VALUES 
  ('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '750e8400-e29b-41d4-a716-446655440001', 'iPhone', '14 Pro Max', 'smartphone', '123456789012345', 'F2LMLPLQK3', 'Deep Purple', '256GB', 'iOS 17', 'Pantalla rota', NOW() - INTERVAL '8 days'),
  ('850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '750e8400-e29b-41d4-a716-446655440002', 'Samsung', 'Galaxy S23 Ultra', 'smartphone', '987654321098765', 'RF8N123ABC', 'Phantom Black', '512GB', 'Android 14', 'Batería agotada', NOW() - INTERVAL '4 days'),
  ('850e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '750e8400-e29b-41d4-a716-446655440003', 'Xiaomi', 'Redmi Note 12', 'smartphone', '456789123456789', NULL, 'Blue', '128GB', 'MIUI 14', 'No enciende', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Crear algunas reparaciones de ejemplo
INSERT INTO repairs (id, organization_id, device_id, customer_id, created_by, title, description, problem_description, status, priority, estimated_cost, created_at)
VALUES 
  ('950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Cambio de pantalla iPhone 14 Pro Max', 'Reemplazo de pantalla por daño físico', 'Pantalla completamente rota por caída', 'in_progress', 'high', 350.00, NOW() - INTERVAL '7 days'),
  ('950e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '850e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'Cambio de batería Samsung S23', 'Reemplazo de batería defectuosa', 'Batería no mantiene carga', 'completed', 'medium', 120.00, NOW() - INTERVAL '3 days'),
  ('950e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '850e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', 'Reparación de software Xiaomi', 'Reinstalación de firmware', 'Equipo no enciende después de actualización', 'diagnosed', 'low', 80.00, NOW())
ON CONFLICT (id) DO NOTHING;

-- Crear algunos productos de inventario
INSERT INTO inventory (id, organization_id, name, description, category, brand, model, stock_quantity, min_stock, unit_cost, enduser_price, recurrent_price, supplier, is_active, created_by, created_at)
VALUES 
  ('a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Pantalla iPhone 14 Pro Max', 'Pantalla OLED original para iPhone 14 Pro Max', 'Pantallas', 'Apple', 'iPhone 14 Pro Max', 5, 2, 280.00, 350.00, 320.00, 'TechParts Lima', true, '650e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '15 days'),
  ('a50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Batería Samsung S23', 'Batería original Samsung Galaxy S23 Ultra', 'Baterías', 'Samsung', 'Galaxy S23 Ultra', 8, 3, 80.00, 120.00, 100.00, 'Samsung Parts', true, '650e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '12 days'),
  ('a50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Cargador USB-C', 'Cargador rápido USB-C universal', 'Accesorios', 'Universal', 'USB-C 20W', 15, 5, 15.00, 25.00, 20.00, 'Tech Accessories', true, '650e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '8 days'),
  ('a50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Mica Templada Universal', 'Protector de pantalla vidrio templado', 'Protectores', 'Universal', 'Templado 9H', 20, 10, 5.00, 15.00, 12.00, 'Glass Protection Co', true, '650e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- Crear algunos unlocks de ejemplo
INSERT INTO unlocks (id, organization_id, customer_id, device_id, created_by, unlock_type, brand, model, imei, status, cost, provider, notes, created_at)
VALUES 
  ('b50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '750e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'icloud', 'iPhone', '14 Pro Max', '123456789012345', 'completed', 150.00, 'iRemovalPro', 'Unlock exitoso', NOW() - INTERVAL '6 days'),
  ('b50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '750e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'frp', 'Samsung', 'Galaxy S23 Ultra', '987654321098765', 'in_progress', 80.00, 'UnlockTool', 'En proceso', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- Mensaje de confirmación
SELECT 'Datos de ejemplo insertados exitosamente' as status;
