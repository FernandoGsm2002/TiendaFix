-- Script para asignar las reparaciones del admin a él mismo
-- Esto corrige el problema donde assigned_technician_id está en NULL

-- Actualizar todas las reparaciones creadas por el admin para que estén asignadas a él
UPDATE repairs 
SET assigned_technician_id = created_by,
    updated_at = NOW()
WHERE assigned_technician_id IS NULL 
  AND created_by IS NOT NULL
  AND organization_id = '873d8154-8b40-4b8a-8d03-431bf9f697e6';

-- Verificar los cambios
SELECT 
  id,
  title,
  status,
  created_by,
  assigned_technician_id,
  CASE 
    WHEN created_by = assigned_technician_id THEN '✅ Asignado correctamente'
    ELSE '❌ Necesita corrección'
  END as assignment_status
FROM repairs 
WHERE organization_id = '873d8154-8b40-4b8a-8d03-431bf9f697e6'
ORDER BY created_at DESC; 