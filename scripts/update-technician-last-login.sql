-- Script para actualizar el last_login del técnico
-- Ejecutar en Supabase SQL Editor

-- Actualizar last_login para el técnico fernandoaguado113@gmail.com
UPDATE users 
SET last_login = NOW() 
WHERE email = 'fernandoaguado113@gmail.com';

-- Verificar que se actualizó correctamente
SELECT 
  id,
  email, 
  name, 
  role, 
  last_login,
  created_at
FROM users 
WHERE email = 'fernandoaguado113@gmail.com'; 