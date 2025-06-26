-- Script para corregir las reparaciones del owner
-- Cambiar de assigned_technician_id a created_by para consistencia

-- 1. Verificar estado actual
SELECT 
  'ANTES DEL CAMBIO' as momento,
  COUNT(*) as total_repairs,
  COUNT(CASE WHEN created_by IS NOT NULL THEN 1 END) as con_created_by,
  COUNT(CASE WHEN created_by IS NULL THEN 1 END) as sin_created_by,
  COUNT(CASE WHEN assigned_technician_id IS NOT NULL THEN 1 END) as con_assigned_tech
FROM repairs 
WHERE organization_id = '873d8154-8b40-4b8a-8d03-431bf9f697e6';

-- 2. Actualizar reparaciones sin created_by (asignar al owner)
UPDATE repairs 
SET created_by = 'a06654c1-d078-404d-bfec-72c883079a41',
    updated_at = NOW()
WHERE organization_id = '873d8154-8b40-4b8a-8d03-431bf9f697e6'
  AND created_by IS NULL;

-- 3. Limpiar assigned_technician_id ya que ahora usamos created_by
UPDATE repairs 
SET assigned_technician_id = NULL,
    updated_at = NOW()
WHERE organization_id = '873d8154-8b40-4b8a-8d03-431bf9f697e6'
  AND assigned_technician_id IS NOT NULL;

-- 4. Verificar resultado final
SELECT 
  'DESPUES DEL CAMBIO' as momento,
  COUNT(*) as total_repairs,
  COUNT(CASE WHEN created_by IS NOT NULL THEN 1 END) as con_created_by,
  COUNT(CASE WHEN created_by IS NULL THEN 1 END) as sin_created_by,
  COUNT(CASE WHEN assigned_technician_id IS NOT NULL THEN 1 END) as con_assigned_tech
FROM repairs 
WHERE organization_id = '873d8154-8b40-4b8a-8d03-431bf9f697e6';

-- 5. Mostrar reparaciones por usuario
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