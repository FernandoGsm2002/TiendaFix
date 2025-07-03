-- Script para corregir el historial de servicios de clientes
-- Ejecutar en la base de datos para solucionar los problemas

-- 1. Recrear la vista repairs_view corregida
DROP VIEW IF EXISTS repairs_view;

CREATE OR REPLACE VIEW repairs_view AS
SELECT
  r.id,
  r.organization_id,
  r.customer_id,
  r.device_id,
  r.created_by,
  r.title,
  r.description,
  r.problem_description,
  r.solution_description,
  r.status,
  r.priority,
  r.cost,
  r.estimated_completion_date,
  r.actual_completion_date,
  r.received_date,
  r.delivered_date,
  r.warranty_days,
  r.internal_notes,
  r.customer_notes,
  r.created_at,
  r.updated_at,
  r.unregistered_customer_name,
  r.unregistered_customer_phone,
  r.unregistered_device_info,
  c.name AS customer_name,
  c.email AS customer_email,
  c.phone AS customer_phone,
  c.anonymous_identifier AS customer_anonymous_identifier,
  c.customer_type AS customer_type,
  d.brand AS device_brand,
  d.model AS device_model,
  d.imei AS device_imei,
  d.serial_number AS device_serial_number,
  d.device_type as device_type,
  d.color as device_color,
  u.name as created_by_name,
  u.email as created_by_email
FROM
  repairs r
LEFT JOIN
  customers c ON r.customer_id = c.id
LEFT JOIN
  devices d ON r.device_id = d.id
LEFT JOIN
  users u ON r.created_by = u.id;

-- 2. Verificar que las tablas tienen las columnas correctas
SELECT 'Verificando estructura de tabla repairs:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'repairs' AND table_schema = 'public'
ORDER BY column_name;

SELECT 'Verificando estructura de tabla unlocks:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'unlocks' AND table_schema = 'public'
ORDER BY column_name;

SELECT 'Verificando estructura de tabla sales:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sales' AND table_schema = 'public'
ORDER BY column_name;

SELECT 'Verificando estructura de tabla sale_items:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sale_items' AND table_schema = 'public'
ORDER BY column_name;

-- 3. Test con un cliente que tenga servicios
SELECT 'Probando consulta de reparaciones para un cliente:' as info;
SELECT r.id, r.title, r.status, r.cost, r.created_at
FROM repairs r 
WHERE r.customer_id IS NOT NULL 
LIMIT 3;

SELECT 'Probando consulta de desbloqueos para un cliente:' as info;
SELECT u.id, u.unlock_type, u.status, u.cost, u.created_at
FROM unlocks u 
WHERE u.customer_id IS NOT NULL 
LIMIT 3;

SELECT 'Probando consulta de ventas para un cliente:' as info;
SELECT s.id, s.total, s.payment_method, s.payment_status, s.created_at
FROM sales s 
WHERE s.customer_id IS NOT NULL 
LIMIT 3; 