-- Migración para simplificar los campos de costo en la tabla repairs
BEGIN;

-- Primero, agregamos el nuevo campo
ALTER TABLE public.repairs
ADD COLUMN cost numeric(10, 2) null;

-- Copiamos los datos existentes (priorizando final_cost sobre estimated_cost)
UPDATE public.repairs
SET cost = COALESCE(final_cost, estimated_cost);

-- Eliminamos las columnas antiguas
ALTER TABLE public.repairs
DROP COLUMN estimated_cost,
DROP COLUMN final_cost;

-- Agregamos un índice para mejorar el rendimiento de consultas relacionadas con costos
CREATE INDEX IF NOT EXISTS idx_repairs_cost ON public.repairs USING btree (cost) TABLESPACE pg_default;

-- Actualizamos las vistas o funciones que dependan de estos campos (si existen)
-- Por ejemplo, si hay una vista de dashboard que use estos campos:
-- CREATE OR REPLACE VIEW repair_income_dashboard AS
-- SELECT date_trunc('month', delivered_date) as month,
--        SUM(cost) as total_income
-- FROM repairs
-- WHERE status = 'delivered'
-- GROUP BY date_trunc('month', delivered_date);

COMMIT; 