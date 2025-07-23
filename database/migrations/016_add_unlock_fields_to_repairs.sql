-- Migration: Add PIN and Pattern Fields to Repairs
-- Date: 2024-01-15
-- Description: Adds PIN and pattern fields for device unlock information

BEGIN;

-- Agregar campos de desbloqueo a la tabla repairs
ALTER TABLE repairs 
ADD COLUMN device_pin VARCHAR(20),          -- PIN del dispositivo (ej: 1234, 123456)
ADD COLUMN device_pattern TEXT,             -- Patrón del dispositivo (JSON con puntos conectados)
ADD COLUMN unlock_type VARCHAR(20);         -- Tipo de desbloqueo: 'pin', 'pattern', 'none', 'fingerprint', 'face', 'other'

-- Crear comentarios para documentar los campos
COMMENT ON COLUMN repairs.device_pin IS 'PIN numérico del dispositivo para desbloqueo';
COMMENT ON COLUMN repairs.device_pattern IS 'Patrón de desbloqueo del dispositivo (JSON con puntos conectados)';
COMMENT ON COLUMN repairs.unlock_type IS 'Tipo de desbloqueo del dispositivo (pin, pattern, none, fingerprint, face, other)';

-- Crear índice para búsquedas por tipo de desbloqueo
CREATE INDEX IF NOT EXISTS idx_repairs_unlock_type ON repairs(unlock_type);

COMMIT; 