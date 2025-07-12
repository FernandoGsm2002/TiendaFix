-- Migración 013: Agregar campos de cédula/DNI y código de país para WhatsApp
-- Fecha: 2024-01-15
-- Descripción: Agregar identificación personal y código de país para funcionalidad de WhatsApp

BEGIN;

-- Agregar campos de cédula/DNI y código de país a la tabla customers
ALTER TABLE customers 
ADD COLUMN cedula_dni VARCHAR(20),
ADD COLUMN country_code VARCHAR(5) DEFAULT '+51';

-- Crear comentarios para documentar los campos
COMMENT ON COLUMN customers.cedula_dni IS 'Número de cédula de identidad o DNI del cliente';
COMMENT ON COLUMN customers.country_code IS 'Código de país para WhatsApp (+51, +57, etc.)';

-- Crear índice para búsquedas por cédula/DNI
CREATE INDEX IF NOT EXISTS idx_customers_cedula_dni ON customers(cedula_dni) WHERE cedula_dni IS NOT NULL;

-- Crear índice para búsquedas por código de país
CREATE INDEX IF NOT EXISTS idx_customers_country_code ON customers(country_code);

-- Actualizar la política RLS para incluir los nuevos campos
DROP POLICY IF EXISTS "customers_select" ON customers;
CREATE POLICY "customers_select" ON customers
FOR SELECT USING (
  organization_id = (
    SELECT organization_id 
    FROM users 
    WHERE auth_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "customers_insert" ON customers;
CREATE POLICY "customers_insert" ON customers
FOR INSERT WITH CHECK (
  organization_id = (
    SELECT organization_id 
    FROM users 
    WHERE auth_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "customers_update" ON customers;
CREATE POLICY "customers_update" ON customers
FOR UPDATE USING (
  organization_id = (
    SELECT organization_id 
    FROM users 
    WHERE auth_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "customers_delete" ON customers;
CREATE POLICY "customers_delete" ON customers
FOR DELETE USING (
  organization_id = (
    SELECT organization_id 
    FROM users 
    WHERE auth_user_id = auth.uid()
  )
);

COMMIT; 