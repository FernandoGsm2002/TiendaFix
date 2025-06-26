-- Script para debuggear usuarios y reparaciones

-- 1. Mostrar todos los usuarios
SELECT 
  id,
  email,
  name,
  role,
  'USER' as tipo
FROM users 
WHERE organization_id = '873d8154-8b40-4b8a-8d03-431bf9f697e6'
ORDER BY role, name;

-- 2. Mostrar todas las reparaciones con sus creadores
SELECT 
  r.id,
  r.title,
  r.status,
  r.created_by,
  u.name as creator_name,
  u.role as creator_role,
  u.email as creator_email,
  'REPAIR' as tipo
FROM repairs r
LEFT JOIN users u ON r.created_by = u.id
WHERE r.organization_id = '873d8154-8b40-4b8a-8d03-431bf9f697e6'
ORDER BY r.created_at DESC;

-- 3. Contar reparaciones por usuario
SELECT 
  u.name as usuario,
  u.role as rol,
  u.email,
  COUNT(r.id) as total_reparaciones,
  'STATS' as tipo
FROM users u
LEFT JOIN repairs r ON u.id = r.created_by 
  AND r.organization_id = '873d8154-8b40-4b8a-8d03-431bf9f697e6'
WHERE u.organization_id = '873d8154-8b40-4b8a-8d03-431bf9f697e6'
GROUP BY u.id, u.name, u.role, u.email
ORDER BY total_reparaciones DESC; 