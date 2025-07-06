-- ================================
-- MEJORAR POLÍTICAS RLS PARA ORGANIZATION_REQUESTS
-- ================================

-- Este script mejora las políticas RLS para organization_requests
-- para que funcionen correctamente con la clave de servicio

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Super admin can manage organization requests" ON organization_requests;
DROP POLICY IF EXISTS "Users can view their own organization request" ON organization_requests;

-- Crear políticas mejoradas
-- Política 1: Super admin puede ver todas las solicitudes
CREATE POLICY "Super admin can manage organization requests" ON organization_requests
    FOR ALL USING (
        -- Permitir si es superadmin con registro en users
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND email = 'admin@tiendafix.com'
            AND role = 'super_admin'
        )
        OR
        -- Permitir si es superadmin directo desde auth.users (fallback)
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND email = 'admin@tiendafix.com'
        )
    );

-- Política 2: Los solicitantes pueden ver su propia solicitud
CREATE POLICY "Users can view their own organization request" ON organization_requests
    FOR SELECT USING (
        owner_email = auth.email()
        OR 
        owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Política 3: Permitir inserción de nuevas solicitudes (registro público)
CREATE POLICY "Allow public registration requests" ON organization_requests
    FOR INSERT WITH CHECK (
        status = 'pending'
    );

-- Mensaje de confirmación
SELECT 'Políticas RLS para organization_requests actualizadas exitosamente' as resultado; 