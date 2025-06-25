-- Verificar que Fernando existe como usuario en la base de datos
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar usuario Fernando
SELECT 
  id, 
  email, 
  name, 
  role, 
  organization_id,
  created_at
FROM users 
WHERE email = 'fernandoapplehtml@gmail.com';

-- 2. Verificar organización de Fernando
SELECT 
  id, 
  name, 
  slug, 
  email, 
  subscription_status,
  created_at
FROM organizations 
WHERE id = '873d8154-8b40-4b8a-8d03-431bf9f697e6';

-- 3. Si Fernando no existe como usuario, crearlo:
/*
INSERT INTO users (
  id, 
  organization_id, 
  email, 
  name, 
  role, 
  is_active
) VALUES (
  'a06654c1-d078-404d-bfac-72c883079a4',
  '873d8154-8b40-4b8a-8d03-431bf9f697e6',
  'fernandoapplehtml@gmail.com',
  'Fernando Contreras',
  'owner',
  true
);
*/

-- 4. Verificar que el insert funcionó
SELECT 
  u.id as user_id,
  u.email,
  u.name,
  u.role,
  o.name as organization_name
FROM users u
JOIN organizations o ON u.organization_id = o.id
WHERE u.email = 'fernandoapplehtml@gmail.com'; 