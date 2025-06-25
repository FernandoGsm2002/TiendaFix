-- Script para verificar datos en la base de datos TiendaFix

-- 1. Verificar si existe la organización
SELECT 'Organizaciones encontradas:' as info;
SELECT id, name, email, subscription_status FROM organizations;

-- 2. Verificar si existen usuarios
SELECT 'Usuarios encontrados:' as info;
SELECT id, name, email, role FROM users LIMIT 5;

-- 3. Verificar si existen clientes
SELECT 'Clientes encontrados:' as info;
SELECT id, name, customer_type, phone FROM customers LIMIT 5;

-- 4. Verificar si existen dispositivos  
SELECT 'Dispositivos encontrados:' as info;
SELECT id, brand, model, device_type FROM devices LIMIT 5;

-- 5. Verificar si existen productos de inventario
SELECT 'Productos encontrados:' as info;
SELECT id, name, category, stock_quantity FROM inventory LIMIT 5; 