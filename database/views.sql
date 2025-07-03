-- View for Repairs
CREATE OR REPLACE VIEW repairs_view AS
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
  c.name AS customer_name,
  c.email AS customer_email,
  c.phone AS customer_phone,
  c.anonymous_identifier AS customer_anonymous_identifier,
  c.customer_type AS customer_type,
  d.brand AS device_brand,
  d.model AS device_model,
  d.imei AS device_imei,
  d.serial_number AS device_serial_number,
  d.device_type as device_type,
  d.color as device_color,
  u.name as created_by_name,
  u.email as created_by_email
FROM
  repairs r
LEFT JOIN
  customers c ON r.customer_id = c.id
LEFT JOIN
  devices d ON r.device_id = d.id
LEFT JOIN
  users u ON r.created_by = u.id; 