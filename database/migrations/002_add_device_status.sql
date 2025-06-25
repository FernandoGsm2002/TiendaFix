-- 1. Crear el nuevo tipo ENUM para el estado del dispositivo
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'device_status') THEN
        CREATE TYPE device_status AS ENUM (
            'in_store',             -- En tienda, recién recibido
            'in_repair',            -- En proceso de reparación
            'awaiting_parts',       -- Esperando repuestos
            'ready_for_pickup',     -- Reparación completada, listo para entrega
            'delivered',            -- Entregado al cliente
            'irreparable',          -- No se puede reparar
            'in_unlock'             -- En proceso de desbloqueo
        );
    END IF;
END$$;


-- 2. Añadir la columna 'status' a la tabla 'devices'
ALTER TABLE public.devices
ADD COLUMN IF NOT EXISTS status device_status NOT NULL DEFAULT 'in_store';

-- Opcional: Actualizar dispositivos existentes que están en una reparación activa
-- Esto establece un estado inicial lógico para los datos que ya existen.
UPDATE public.devices d
SET status = 'in_repair'
FROM public.repairs r
WHERE r.device_id = d.id AND r.status IN ('received', 'diagnosed', 'in_progress', 'waiting_parts');

UPDATE public.devices d
SET status = 'ready_for_pickup'
FROM public.repairs r
WHERE r.device_id = d.id AND r.status = 'completed';

UPDATE public.devices d
SET status = 'delivered'
FROM public.repairs r
WHERE r.device_id = d.id AND r.status = 'delivered';

COMMENT ON COLUMN public.devices.status IS 'El estado actual del dispositivo dentro del flujo de trabajo de la tienda.';

-- Print a success message
SELECT 'Columna "status" añadida a la tabla "devices" y estados iniciales actualizados.'; 