-- ================================
-- EJEMPLOS DE USO - TIENDAFIX
-- ================================

-- ================================
-- 1. REGISTRO DE UNA NUEVA TIENDA
-- ================================

-- Paso 1: El usuario llena el formulario de registro
INSERT INTO organization_requests (
    name, slug, email, phone, address, subscription_plan,
    owner_name, owner_email, owner_phone, owner_password_hash
) VALUES (
    'TecnoCell Reparaciones',
    'tecnocell-reparaciones',
    'contacto@tecnocell.com',
    '+51 999 888 777',
    'Av. Tecnología 123, Lima, Perú',
    'monthly_6',
    'Juan Pérez',
    'juan@tecnocell.com',
    '+51 999 888 777',
    crypt('mi_password_seguro', gen_salt('bf'))
);

-- Paso 2: El super admin revisa y aprueba la solicitud
SELECT approve_organization_request('uuid-de-la-solicitud');

-- Paso 3: Se crea automáticamente la organización y el usuario owner
-- El frontend debe crear la cuenta en Supabase Auth y actualizar auth_user_id

-- ================================
-- 2. MANEJO DE CLIENTES
-- ================================

-- Cliente identificado normal
INSERT INTO customers (organization_id, name, email, phone, customer_type, is_recurrent) 
VALUES (
    'org-uuid', 
    'María García', 
    'maria@email.com', 
    '+51 999 777 888',
    'identified', 
    false
);

-- Cliente anónimo (el trigger genera automáticamente anonymous_identifier)
INSERT INTO customers (organization_id, customer_type) 
VALUES ('org-uuid', 'anonymous');
-- Resultado: anonymous_identifier = 'ANONIMO-001'

-- Cliente walk-in
INSERT INTO customers (organization_id, anonymous_identifier, customer_type) 
VALUES ('org-uuid', 'WALK-IN-001', 'anonymous');

-- ================================
-- 3. INVENTARIO CON PRECIOS DUALES
-- ================================

-- Agregar producto con precios diferentes
INSERT INTO inventory (
    organization_id, name, description, sku, category,
    stock_quantity, min_stock, unit_cost, enduser_price, recurrent_price
) VALUES (
    'org-uuid',
    'Pantalla iPhone 12',
    'Pantalla LCD de reemplazo para iPhone 12',
    'IP12-LCD-001',
    'Pantallas',
    10,
    2,
    150.00,    -- Costo
    250.00,    -- Precio usuario final
    220.00     -- Precio cliente recurrente
);

-- ================================
-- 4. OBTENER PRECIO CORRECTO PARA CLIENTE
-- ================================

-- Obtener precio para un cliente específico
SELECT get_customer_price('inventory-uuid', 'customer-uuid') as precio_a_aplicar;

-- Ejemplo en una venta:
-- Si es cliente recurrente: se usa recurrent_price (220.00)
-- Si es cliente nuevo: se usa enduser_price (250.00)

-- ================================
-- 5. CREACIÓN DE REPARACIONES
-- ================================

-- Crear dispositivo del cliente
INSERT INTO devices (
    organization_id, customer_id, brand, model, device_type,
    serial_number, imei, color, storage_capacity, operating_system
) VALUES (
    'org-uuid', 'customer-uuid', 'Apple', 'iPhone 12', 'smartphone',
    'SERIAL123', '123456789012345', 'Negro', '128GB', 'iOS 16'
);

-- Crear reparación
INSERT INTO repairs (
    organization_id, device_id, customer_id, assigned_technician_id,
    title, problem_description, status, priority, estimated_cost
) VALUES (
    'org-uuid', 'device-uuid', 'customer-uuid', 'technician-uuid',
    'Cambio de pantalla',
    'Pantalla rota por caída',
    'received',
    'medium',
    250.00
);

-- ================================
-- 6. VENTAS EN POS
-- ================================

-- Crear venta
INSERT INTO sales (
    organization_id, customer_id, created_by, sale_type,
    subtotal, tax_amount, total, payment_method
) VALUES (
    'org-uuid', 'customer-uuid', 'user-uuid', 'product',
    250.00, 45.00, 295.00, 'cash'
);

-- Agregar items a la venta (aplicando precio correcto)
INSERT INTO sale_items (
    organization_id, sale_id, inventory_id, quantity, unit_price, total_price
) VALUES (
    'org-uuid', 
    'sale-uuid', 
    'inventory-uuid', 
    1, 
    (SELECT get_customer_price('inventory-uuid', 'customer-uuid')),
    (SELECT get_customer_price('inventory-uuid', 'customer-uuid'))
);

-- ================================
-- 7. UNLOCKS
-- ================================

-- Servicio de unlock
INSERT INTO unlocks (
    organization_id, customer_id, device_id, created_by,
    unlock_type, brand, model, imei, cost, provider
) VALUES (
    'org-uuid', 'customer-uuid', 'device-uuid', 'user-uuid',
    'icloud', 'Apple', 'iPhone 12', '123456789012345',
    80.00, 'UnlockProvider123'
);

-- ================================
-- 8. CONSULTAS ÚTILES
-- ================================

-- Ver todas las solicitudes pendientes (solo super admin)
SELECT 
    name as tienda,
    owner_name as propietario,
    owner_email as email,
    subscription_plan as plan,
    created_at as solicitado_el
FROM organization_requests 
WHERE status = 'pending'
ORDER BY created_at;

-- Ver clientes por tipo en una organización
SELECT 
    customer_type,
    COUNT(*) as cantidad,
    COUNT(CASE WHEN is_recurrent THEN 1 END) as recurrentes
FROM customers 
WHERE organization_id = 'org-uuid'
GROUP BY customer_type;

-- Ver productos con stock bajo
SELECT 
    name, 
    stock_quantity, 
    min_stock,
    enduser_price,
    recurrent_price
FROM inventory 
WHERE organization_id = 'org-uuid' 
AND stock_quantity <= min_stock
AND is_active = true;

-- Reparaciones por estado
SELECT 
    status,
    COUNT(*) as cantidad,
    AVG(estimated_cost) as costo_promedio
FROM repairs 
WHERE organization_id = 'org-uuid'
GROUP BY status;

-- Clientes que se volvieron recurrentes automáticamente
SELECT 
    COALESCE(name, anonymous_identifier) as cliente,
    customer_type,
    is_recurrent,
    created_at
FROM customers 
WHERE organization_id = 'org-uuid'
AND is_recurrent = true
ORDER BY created_at DESC;

-- ================================
-- 9. CONFIGURACIONES POR DEFECTO
-- ================================

-- Al aprobar una organización, se crean estas configuraciones:
/*
INSERT INTO organization_settings (organization_id, setting_key, setting_value, setting_type) VALUES
('org-uuid', 'currency', 'PEN', 'string'),
('org-uuid', 'tax_rate', '18', 'number'),
('org-uuid', 'warranty_days', '30', 'number'),
('org-uuid', 'business_hours', '{"monday": "9:00-18:00", "tuesday": "9:00-18:00", "wednesday": "9:00-18:00", "thursday": "9:00-18:00", "friday": "9:00-18:00", "saturday": "9:00-14:00", "sunday": "closed"}', 'json');
*/

-- ================================
-- 10. REPORTES Y ESTADÍSTICAS
-- ================================

-- Reporte de ventas del mes
SELECT 
    DATE(created_at) as fecha,
    COUNT(*) as num_ventas,
    SUM(total) as total_ventas,
    AVG(total) as promedio_venta
FROM sales 
WHERE organization_id = 'org-uuid'
AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY DATE(created_at)
ORDER BY fecha;

-- Productos más vendidos
SELECT 
    i.name as producto,
    SUM(si.quantity) as cantidad_vendida,
    SUM(si.total_price) as ingresos_totales
FROM sale_items si
JOIN inventory i ON si.inventory_id = i.id
WHERE si.organization_id = 'org-uuid'
GROUP BY i.id, i.name
ORDER BY cantidad_vendida DESC
LIMIT 10;

-- Técnicos más productivos
SELECT 
    u.name as tecnico,
    COUNT(r.id) as reparaciones_asignadas,
    COUNT(CASE WHEN r.status = 'completed' THEN 1 END) as completadas,
    AVG(CASE WHEN r.status = 'completed' THEN r.final_cost END) as costo_promedio
FROM users u
LEFT JOIN repairs r ON u.id = r.assigned_technician_id
WHERE u.organization_id = 'org-uuid' 
AND u.role = 'technician'
GROUP BY u.id, u.name
ORDER BY completadas DESC; 