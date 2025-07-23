-- Script completo para actualizar la base de datos con campos de desbloqueo
-- Ejecutar este script en la consola SQL de Supabase

-- Paso 1: Agregar campos de desbloqueo a la tabla repairs
DO $$ 
BEGIN
  -- Agregar device_pin si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='repairs' AND column_name='device_pin') THEN
    ALTER TABLE repairs ADD COLUMN device_pin VARCHAR(20);
    COMMENT ON COLUMN repairs.device_pin IS 'PIN numérico del dispositivo para desbloqueo';
  END IF;
  
  -- Agregar device_pattern si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='repairs' AND column_name='device_pattern') THEN
    ALTER TABLE repairs ADD COLUMN device_pattern TEXT;
    COMMENT ON COLUMN repairs.device_pattern IS 'Patrón de desbloqueo del dispositivo (JSON con puntos conectados)';
  END IF;
  
  -- Agregar unlock_type si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='repairs' AND column_name='unlock_type') THEN
    ALTER TABLE repairs ADD COLUMN unlock_type VARCHAR(20);
    COMMENT ON COLUMN repairs.unlock_type IS 'Tipo de desbloqueo del dispositivo (pin, pattern, none, fingerprint, face, other)';
  END IF;
END $$;

-- Paso 2: Crear índice para búsquedas por tipo de desbloqueo
CREATE INDEX IF NOT EXISTS idx_repairs_unlock_type ON repairs(unlock_type);

-- Paso 3: Actualizar la vista repairs_view
DROP VIEW IF EXISTS public.repairs_view;

CREATE VIEW public.repairs_view AS
SELECT
  r.id,
  r.organization_id,
  r.customer_id,
  r.device_id,
  r.created_by,
  r.title,
  r.description,
  r.problem_description,
  r.solution_description,
  r.status,
  r.priority,
  r.cost,
  r.estimated_completion_date,
  r.actual_completion_date,
  r.received_date,
  r.delivered_date,
  r.warranty_days,
  r.internal_notes,
  r.customer_notes,
  r.created_at,
  r.updated_at,
  r.unregistered_customer_name,
  r.unregistered_customer_phone,
  r.unregistered_device_info,
  -- Nuevos campos de desbloqueo
  r.device_pin,
  r.device_pattern,
  r.unlock_type,
  -- Campos del cliente
  c.name AS customer_name,
  c.email AS customer_email,
  c.phone AS customer_phone,
  c.anonymous_identifier AS customer_anonymous_identifier,
  c.customer_type,
  c.cedula_dni AS customer_cedula_dni,
  c.country_code AS customer_country_code,
  c.customer_tax_id AS customer_tax_id,
  c.customer_tax_id_type AS customer_tax_id_type,
  -- Campos del dispositivo
  d.brand AS device_brand,
  d.model AS device_model,
  d.imei AS device_imei,
  d.serial_number AS device_serial_number,
  d.device_type,
  d.color AS device_color,
  -- Campos del usuario
  u.name AS created_by_name,
  u.email AS created_by_email
FROM
  repairs r
  LEFT JOIN customers c ON r.customer_id = c.id
  LEFT JOIN devices d ON r.device_id = d.id
  LEFT JOIN users u ON r.created_by = u.id;

-- Comentario de la vista
COMMENT ON VIEW public.repairs_view IS 'Vista integral de reparaciones con información relacionada de clientes, dispositivos y usuarios, incluyendo campos de desbloqueo';

-- Mensaje de confirmación
SELECT 'Script ejecutado exitosamente. Los campos de desbloqueo han sido agregados y la vista repairs_view ha sido actualizada.' as resultado; 