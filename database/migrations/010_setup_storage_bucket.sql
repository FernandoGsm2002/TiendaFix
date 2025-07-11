-- Migration: Setup Storage Bucket for Organization Logos
-- Date: 2024-01-15
-- Description: Creates storage bucket and policies for organization logos

-- ================================
-- CREATE STORAGE BUCKET
-- ================================

-- Crear bucket para logos de organizaciones
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organization-logos',
  'organization-logos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ================================
-- STORAGE POLICIES
-- ================================

-- Limpiar políticas existentes si existen
DROP POLICY IF EXISTS "Public can view organization logos" ON storage.objects;
DROP POLICY IF EXISTS "Owners can upload organization logos" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete organization logos" ON storage.objects;
DROP POLICY IF EXISTS "Owners can update organization logos" ON storage.objects;

-- Política para permitir lectura pública de logos
CREATE POLICY "Public can view organization logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'organization-logos');

-- Política para permitir a owners subir logos de su organización
CREATE POLICY "Owners can upload organization logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'organization-logos'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE users.auth_user_id = auth.uid() 
    AND users.role = 'owner'
  )
);

-- Política para permitir a owners eliminar logos de su organización  
CREATE POLICY "Owners can delete organization logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'organization-logos'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE users.auth_user_id = auth.uid() 
    AND users.role = 'owner'
  )
);

-- Política para permitir a owners actualizar logos de su organización
CREATE POLICY "Owners can update organization logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'organization-logos'
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE users.auth_user_id = auth.uid() 
    AND users.role = 'owner'
  )
); 