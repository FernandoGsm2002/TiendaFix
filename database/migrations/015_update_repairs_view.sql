-- Migración 015: Actualizar vista repairs_view con campos de cédula/DNI y código de país
-- Fecha: 2024-01-15
-- Descripción: Agregar campos cedula_dni y country_code a la vista repairs_view

BEGIN;

-- Recrear la vista repairs_view con los nuevos campos
DROP VIEW IF EXISTS repairs_view;

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
  c.cedula_dni AS customer_cedula_dni,
  c.country_code AS customer_country_code,
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

-- También actualizar la vista de unlocks para incluir los mismos campos
DROP VIEW IF EXISTS unlocks_view;

CREATE OR REPLACE VIEW unlocks_view AS
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
  c.cedula_dni as customer_cedula_dni,
  c.country_code as customer_country_code,
  us.name as created_by_name,
  us.email as created_by_email
FROM
  unlocks u
LEFT JOIN
  customers c ON u.customer_id = c.id
LEFT JOIN
  users us ON u.created_by = us.id;

COMMIT; 