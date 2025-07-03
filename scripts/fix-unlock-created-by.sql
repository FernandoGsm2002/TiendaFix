-- Script para verificar y corregir los problemas de created_by en unlocks

-- 1. Verificar desbloqueos sin usuario válido
SELECT 
    u.id,
    u.unlock_type,
    u.model,
    u.created_by,
    us.name as created_by_name,
    u.organization_id
FROM unlocks u
LEFT JOIN users us ON u.created_by = us.id
WHERE u.created_by IS NULL OR us.id IS NULL;

-- 2. Verificar si hay usuarios en la organización para asignar
SELECT 
    id,
    name,
    email,
    role,
    organization_id
FROM users 
WHERE organization_id = '73f0299f-0554-4f06-bde5-6e4100ba6903'
ORDER BY role, created_at;

-- 3. Actualizar desbloqueos huérfanos asignándolos al owner de la organización
UPDATE unlocks 
SET created_by = (
    SELECT id 
    FROM users 
    WHERE organization_id = '73f0299f-0554-4f06-bde5-6e4100ba6903' 
    AND role = 'owner' 
    LIMIT 1
)
WHERE organization_id = '73f0299f-0554-4f06-bde5-6e4100ba6903'
AND (created_by IS NULL OR created_by NOT IN (
    SELECT id FROM users WHERE organization_id = '73f0299f-0554-4f06-bde5-6e4100ba6903'
));

-- 4. Verificar que se corrigieron los problemas
SELECT 
    u.id,
    u.unlock_type,
    u.model,
    u.created_by,
    us.name as created_by_name,
    u.organization_id
FROM unlocks u
LEFT JOIN users us ON u.created_by = us.id
WHERE u.organization_id = '73f0299f-0554-4f06-bde5-6e4100ba6903'; 