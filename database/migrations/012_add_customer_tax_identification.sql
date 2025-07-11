-- Migration: Add Tax Identification Fields to Customers
-- Date: 2024-01-15
-- Description: Adds customer tax identification fields that adapt to organization's country

-- ================================
-- ADD CUSTOMER TAX IDENTIFICATION FIELDS
-- ================================

-- Agregar campos de identificación tributaria a la tabla customers
ALTER TABLE customers 
ADD COLUMN customer_tax_id VARCHAR(50), -- Número de identificación tributaria del cliente
ADD COLUMN customer_tax_id_type VARCHAR(20); -- Tipo de identificación (heredado de la organización)

-- Crear índice para mejorar consultas por tax_id del cliente
CREATE INDEX idx_customers_tax_id ON customers(customer_tax_id);

-- Crear índice compuesto para consultas por organización y tax_id
CREATE INDEX idx_customers_org_tax_id ON customers(organization_id, customer_tax_id);

-- Comentarios explicativos
COMMENT ON COLUMN customers.customer_tax_id IS 'Número de identificación tributaria del cliente (RUC, RUT, NIT, CUIT, etc.)';
COMMENT ON COLUMN customers.customer_tax_id_type IS 'Tipo de identificación tributaria según el país de la organización';

-- ================================
-- INFORMACIÓN ADICIONAL
-- ================================

-- Este campo se adapta automáticamente al país configurado en la organización:
-- - Si la organización está en Perú, el cliente tendrá RUC
-- - Si la organización está en Chile, el cliente tendrá RUT
-- - Si la organización está en Argentina, el cliente tendrá CUIT
-- - Y así sucesivamente para todos los países sudamericanos

-- El campo es OPCIONAL y solo se usa cuando el cliente es una empresa
-- o persona jurídica que requiere facturación formal. 