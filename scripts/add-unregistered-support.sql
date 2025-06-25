-- Paso 1: Permitir que customer_id y device_id sean nulos en la tabla de reparaciones.
-- Esto es por si una reparación no está asociada a un cliente/dispositivo registrado.

ALTER TABLE public.repairs
ALTER COLUMN customer_id DROP NOT NULL,
ALTER COLUMN device_id DROP NOT NULL;

-- Paso 2: Añadir columnas para guardar la información de clientes no registrados.
-- Las añadimos solo si no existen para evitar errores al ejecutar el script varias veces.

ALTER TABLE public.repairs
ADD COLUMN IF NOT EXISTS unregistered_customer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS unregistered_customer_phone VARCHAR(50);

-- Paso 3: Añadir columnas para guardar la información de dispositivos no registrados.

ALTER TABLE public.repairs
ADD COLUMN IF NOT EXISTS unregistered_device_info TEXT;

-- Confirmación (opcional): Puedes ejecutar esto para ver los cambios en la estructura.
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'repairs'; 