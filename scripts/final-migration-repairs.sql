-- Script final para migrar de assigned_technician_id a created_by
-- ORDEN CORRECTO: Vista primero, luego eliminar columna

-- 1. Verificar estado actual
SELECT 
  'ANTES DEL CAMBIO' as momento,
  COUNT(*) as total_repairs,
  COUNT(CASE WHEN created_by IS NOT NULL THEN 1 END) as con_created_by,
  COUNT(CASE WHEN created_by IS NULL THEN 1 END) as sin_created_by
FROM repairs 
WHERE organization_id = '873d8154-8b40-4b8a-8d03-431bf9f697e6';

-- 2. Asignar created_by a reparaciones que no lo tengan (al owner)
UPDATE repairs 
SET created_by = 'a06654c1-d078-404d-bfec-72c883079a41',
    updated_at = NOW()
WHERE organization_id = '873d8154-8b40-4b8a-8d03-431bf9f697e6'
  AND created_by IS NULL;

-- 3. PRIMERO: Actualizar la vista repairs_view SIN assigned_technician_id
DROP VIEW IF EXISTS repairs_view;

CREATE VIEW repairs_view AS
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

-- 4. SEGUNDO: Ahora eliminar la columna assigned_technician_id
ALTER TABLE repairs DROP COLUMN assigned_technician_id;

-- 5. Eliminar el índice relacionado si existe
DROP INDEX IF EXISTS idx_repairs_technician;

-- 6. Verificar resultado final
SELECT 
  'DESPUES DEL CAMBIO' as momento,
  COUNT(*) as total_repairs,
  COUNT(CASE WHEN created_by IS NOT NULL THEN 1 END) as con_created_by
FROM repairs 
WHERE organization_id = '873d8154-8b40-4b8a-8d03-431bf9f697e6';

-- 7. Mostrar reparaciones por usuario
SELECT 
  u.name as usuario,
  u.role as rol,
  COUNT(r.id) as total_reparaciones,
  COUNT(CASE WHEN r.status = 'completed' THEN 1 END) as completadas,
  COUNT(CASE WHEN r.status = 'in_progress' THEN 1 END) as en_proceso
FROM repairs r
LEFT JOIN users u ON r.created_by = u.id
WHERE r.organization_id = '873d8154-8b40-4b8a-8d03-431bf9f697e6'
GROUP BY u.id, u.name, u.role
ORDER BY total_reparaciones DESC;

-- 8. Verificar que la columna ya no existe
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'repairs' 
  AND column_name IN ('created_by', 'assigned_technician_id')
ORDER BY column_name;

-- 9. Verificar que la vista funciona correctamente
SELECT COUNT(*) as total_en_vista FROM repairs_view 
WHERE organization_id = '873d8154-8b40-4b8a-8d03-431bf9f697e6'; 