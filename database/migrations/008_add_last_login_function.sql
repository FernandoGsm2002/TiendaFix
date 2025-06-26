-- Migración para agregar función de actualización automática de last_login
-- Ejecutar en Supabase SQL Editor

-- Function to update last_login for the current user
create or replace function update_user_last_login()
returns void
language sql
security definer
set search_path = public
as $$
  update users 
  set last_login = now() 
  where auth_user_id = auth.uid();
$$;

-- Comentario: Esta función permite actualizar el last_login del usuario autenticado
-- Se puede llamar desde cualquier API endpoint cuando el usuario realiza una acción 