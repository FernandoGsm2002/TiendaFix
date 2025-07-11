-- Migration: Add Tax Identification Fields to Organizations
-- Date: 2024-01-15
-- Description: Adds country and tax_id fields to organizations table for supporting South American tax identification

-- ================================
-- ADD TAX IDENTIFICATION FIELDS
-- ================================

-- Agregar campos de identificación tributaria a la tabla organizations
ALTER TABLE organizations 
ADD COLUMN country VARCHAR(20) DEFAULT 'PE', -- País (código ISO 3166-1 alpha-2)
ADD COLUMN tax_id VARCHAR(50), -- Número de identificación tributaria
ADD COLUMN tax_id_type VARCHAR(20); -- Tipo de identificación (RUC, RUT, NIT, etc.)

-- Crear índice para mejorar consultas por país
CREATE INDEX idx_organizations_country ON organizations(country);

-- Crear índice para mejorar consultas por tax_id
CREATE INDEX idx_organizations_tax_id ON organizations(tax_id);

-- Comentarios explicativos
COMMENT ON COLUMN organizations.country IS 'País de la organización (código ISO 3166-1 alpha-2)';
COMMENT ON COLUMN organizations.tax_id IS 'Número de identificación tributaria (RUC, RUT, NIT, CUIT, etc.)';
COMMENT ON COLUMN organizations.tax_id_type IS 'Tipo de identificación tributaria según el país';

-- ================================
-- INFORMACIÓN ADICIONAL
-- ================================

-- Tipos de identificación tributaria por país:
-- AR: CUIT (Clave Única de Identificación Tributaria)
-- BO: NIT (Número de Identificación Tributaria)
-- BR: CPF (Pessoa Física) / CNPJ (Pessoa Jurídica)
-- CL: RUT (Rol Único Tributario)
-- CO: NIT (Número de Identificación Tributaria)
-- EC: RUC (Registro Único de Contribuyentes)
-- PE: RUC (Registro Único de Contribuyentes)
-- PY: RUC (Registro Único de Contribuyentes)
-- UY: RUT (Registro Único Tributario)
-- VE: RIF (Registro Único de Información Fiscal) 