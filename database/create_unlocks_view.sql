-- Crear vista para unlocks con joins
CREATE OR REPLACE VIEW public.unlocks_view AS
SELECT
  u.id,
  u.organization_id,
  u.customer_id,
  u.device_id,
  u.created_by,
  u.unlock_type,
  u.brand,
  u.model,
  u.imei,
  u.serial_number,
  u.status,
  u.cost,
  u.provider,
  u.provider_order_id,
  u.completion_time,
  u.notes,
  u.created_at,
  u.updated_at,
  c.name as customer_name,
  c.email as customer_email,
  c.phone as customer_phone,
  c.anonymous_identifier as customer_anonymous_identifier,
  c.customer_type,
  us.name as created_by_name,
  us.email as created_by_email
FROM
  unlocks u
  LEFT JOIN customers c ON u.customer_id = c.id
  LEFT JOIN users us ON u.created_by = us.id; 