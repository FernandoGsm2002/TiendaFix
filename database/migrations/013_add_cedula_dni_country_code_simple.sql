-- Migración 013: Agregar campos de cédula/DNI y código de país para WhatsApp (Versión Simplificada)
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

-- Actualizar índice de búsqueda para incluir cédula/DNI
DROP INDEX IF EXISTS idx_customers_search;
CREATE INDEX idx_customers_search ON customers USING gin (
  to_tsvector(
    'spanish'::regconfig,
    (
      (
        (
          (
            ((COALESCE(name, ''))::text || ' '::text) || 
            (COALESCE(phone, ''))::text
          ) || ' '::text
        ) || (COALESCE(email, ''))::text
      ) || ' '::text
    ) || (COALESCE(cedula_dni, ''))::text
  )
);

COMMIT; 