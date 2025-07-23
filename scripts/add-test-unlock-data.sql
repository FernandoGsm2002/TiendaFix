-- Script para agregar datos de prueba de desbloqueo a reparaciones existentes
-- Ejecutar este script para tener datos con los que probar

-- Agregar datos de PIN a las primeras 2 reparaciones
UPDATE repairs 
SET 
  unlock_type = 'pin',
  device_pin = '1234',
  device_pattern = NULL
WHERE id IN (
  SELECT id FROM repairs 
  ORDER BY created_at DESC 
  LIMIT 2
);

-- Agregar datos de patrón a las siguientes 2 reparaciones
UPDATE repairs 
SET 
  unlock_type = 'pattern',
  device_pin = NULL,
  device_pattern = '[1,2,3,5,9]'
WHERE id IN (
  SELECT id FROM repairs 
  WHERE unlock_type IS NULL
  ORDER BY created_at DESC 
  LIMIT 2
);

-- Agregar otros tipos a las siguientes reparaciones
UPDATE repairs 
SET 
  unlock_type = 'fingerprint',
  device_pin = NULL,
  device_pattern = NULL
WHERE id IN (
  SELECT id FROM repairs 
  WHERE unlock_type IS NULL
  ORDER BY created_at DESC 
  LIMIT 1
);

-- Verificar los cambios
SELECT id, title, unlock_type, device_pin, device_pattern, created_at
FROM repairs 
WHERE unlock_type IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- Verificar que la vista también muestra los datos
SELECT id, title, unlock_type, device_pin, device_pattern, created_at
FROM repairs_view 
WHERE unlock_type IS NOT NULL
ORDER BY created_at DESC
LIMIT 10; 