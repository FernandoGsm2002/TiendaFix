-- Add created_by column to devices table
ALTER TABLE public.devices
ADD COLUMN created_by UUID;

-- Add foreign key constraint to users table
ALTER TABLE public.devices
ADD CONSTRAINT fk_devices_created_by
FOREIGN KEY (created_by)
REFERENCES public.users(id);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_devices_created_by ON public.devices(created_by); 