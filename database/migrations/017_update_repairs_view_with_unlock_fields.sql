-- Migration: Update repairs_view to include unlock fields
-- Date: 2024-01-15
-- Description: Updates the repairs_view to include device_pin, device_pattern, and unlock_type fields

BEGIN;

-- Drop the existing view
DROP VIEW IF EXISTS public.repairs_view;

-- Recreate the view with the new unlock fields
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
  -- New unlock fields
  r.device_pin,
  r.device_pattern,
  r.unlock_type,
  -- Customer fields
  c.name AS customer_name,
  c.email AS customer_email,
  c.phone AS customer_phone,
  c.anonymous_identifier AS customer_anonymous_identifier,
  c.customer_type,
  c.cedula_dni AS customer_cedula_dni,
  c.country_code AS customer_country_code,
  c.customer_tax_id AS customer_tax_id,
  c.customer_tax_id_type AS customer_tax_id_type,
  -- Device fields
  d.brand AS device_brand,
  d.model AS device_model,
  d.imei AS device_imei,
  d.serial_number AS device_serial_number,
  d.device_type,
  d.color AS device_color,
  -- User fields
  u.name AS created_by_name,
  u.email AS created_by_email
FROM
  repairs r
  LEFT JOIN customers c ON r.customer_id = c.id
  LEFT JOIN devices d ON r.device_id = d.id
  LEFT JOIN users u ON r.created_by = u.id;

-- Add comment to the view
COMMENT ON VIEW public.repairs_view IS 'Comprehensive view of repairs with related customer, device, and user information including unlock fields';

COMMIT; 