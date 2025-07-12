-- Migración 014: Corregir políticas RLS para tabla customers
-- Fecha: 2024-01-15
-- Descripción: Corregir referencias incorrectas a user_profiles por users

BEGIN;

-- Eliminar las políticas incorrectas creadas en la migración 013
DROP POLICY IF EXISTS "customers_select" ON customers;
DROP POLICY IF EXISTS "customers_insert" ON customers;
DROP POLICY IF EXISTS "customers_update" ON customers;
DROP POLICY IF EXISTS "customers_delete" ON customers;

-- Crear las políticas correctas usando la tabla users y auth_user_id
CREATE POLICY "customers_select" ON customers
FOR SELECT USING (
  organization_id = (
    SELECT organization_id 
    FROM users 
    WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "customers_insert" ON customers
FOR INSERT WITH CHECK (
  organization_id = (
    SELECT organization_id 
    FROM users 
    WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "customers_update" ON customers
FOR UPDATE USING (
  organization_id = (
    SELECT organization_id 
    FROM users 
    WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "customers_delete" ON customers
FOR DELETE USING (
  organization_id = (
    SELECT organization_id 
    FROM users 
    WHERE auth_user_id = auth.uid()
  )
);

COMMIT; 