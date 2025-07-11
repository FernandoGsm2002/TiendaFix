-- ================================
-- SUPABASE STORAGE SETUP
-- ================================

-- Insertar bucket para logos de organizaciones
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organization-logos',
  'organization-logos',
  true,
  5242880, -- 5MB en bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ================================

-- Habilitar RLS en el bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Política para permitir ver logos (público)
CREATE POLICY "Logos are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'organization-logos');

-- Política para permitir subir logos (solo owners de la organización)
CREATE POLICY "Organization owners can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'organization-logos' 
  AND auth.uid() IN (
    SELECT u.auth_user_id 
    FROM users u 
    WHERE u.role = 'owner' 
    AND u.organization_id::text = (storage.foldername(name))[1]
    AND u.auth_user_id = auth.uid()
  )
);

-- Política para permitir actualizar logos (solo owners de la organización)
CREATE POLICY "Organization owners can update their logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'organization-logos' 
  AND auth.uid() IN (
    SELECT u.auth_user_id 
    FROM users u 
    WHERE u.role = 'owner' 
    AND u.organization_id::text = (storage.foldername(name))[1]
    AND u.auth_user_id = auth.uid()
  )
);

-- Política para permitir eliminar logos (solo owners de la organización)
CREATE POLICY "Organization owners can delete their logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'organization-logos' 
  AND auth.uid() IN (
    SELECT u.auth_user_id 
    FROM users u 
    WHERE u.role = 'owner' 
    AND u.organization_id::text = (storage.foldername(name))[1]
    AND u.auth_user_id = auth.uid()
  )
);

-- ================================
-- FUNCIONES DE AYUDA
-- ================================

-- Función para obtener la URL pública de un logo
CREATE OR REPLACE FUNCTION get_organization_logo_url(org_id UUID)
RETURNS TEXT AS $$
DECLARE
  logo_url TEXT;
BEGIN
  SELECT organizations.logo_url INTO logo_url
  FROM organizations
  WHERE organizations.id = org_id;
  
  RETURN logo_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- COMENTARIOS
-- ================================

COMMENT ON FUNCTION get_organization_logo_url(UUID) IS 'Obtiene la URL pública del logo de una organización';
COMMENT ON POLICY "Logos are publicly viewable" ON storage.objects IS 'Permite ver los logos públicamente';
COMMENT ON POLICY "Organization owners can upload logos" ON storage.objects IS 'Solo los owners pueden subir logos de su organización';
COMMENT ON POLICY "Organization owners can update their logos" ON storage.objects IS 'Solo los owners pueden actualizar logos de su organización';
COMMENT ON POLICY "Organization owners can delete their logos" ON storage.objects IS 'Solo los owners pueden eliminar logos de su organización'; 