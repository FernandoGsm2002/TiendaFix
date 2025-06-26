-- Script para eliminar la columna assigned_technician_id
-- Ya que ahora usamos created_by para todo (consistencia con unlocks)

-- 1. Verificar que todas las reparaciones tengan created_by
SELECT 
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

-- 3. Eliminar la columna assigned_technician_id completamente
ALTER TABLE repairs DROP COLUMN IF EXISTS assigned_technician_id;

-- 4. Verificar resultado final
SELECT 
  COUNT(*) as total_repairs,
  COUNT(CASE WHEN created_by IS NOT NULL THEN 1 END) as con_created_by
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

-- 6. Verificar estructura de la tabla
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'repairs' 
  AND column_name IN ('created_by', 'assigned_technician_id')
ORDER BY column_name; 