-- ================================
-- CORRECCIÓN RÁPIDA PARA ORGANIZATION_REQUESTS
-- ================================

-- Esta corrección resuelve el problema principal:
-- La función get_all_organization_requests_admin no existe o las políticas RLS están mal configuradas

-- 1. Eliminar políticas RLS problemáticas
DROP POLICY IF EXISTS "Super admin can manage organization requests" ON organization_requests;
DROP POLICY IF EXISTS "Users can view their own organization request" ON organization_requests;
DROP POLICY IF EXISTS "Allow public registration requests" ON organization_requests;

-- 2. Crear la función de administración que falta
CREATE OR REPLACE FUNCTION get_all_organization_requests_admin()
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    slug VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    address TEXT,
    subscription_plan VARCHAR,
    owner_name VARCHAR,
    owner_email VARCHAR,
    owner_phone VARCHAR,
    owner_password_hash VARCHAR,
    status VARCHAR,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Verificar si es superadmin (con fallback)
    IF EXISTS (
        SELECT 1 FROM users 
        WHERE auth_user_id = auth.uid() 
        AND email = 'admin@tiendafix.com'
        AND role = 'super_admin'
    ) OR EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND email = 'admin@tiendafix.com'
    ) THEN
        -- Retornar todas las solicitudes
        RETURN QUERY
        SELECT 
            org_req.id,
            org_req.name,
            org_req.slug,
            org_req.email,
            org_req.phone,
            org_req.address,
            org_req.subscription_plan,
            org_req.owner_name,
            org_req.owner_email,
            org_req.owner_phone,
            org_req.owner_password_hash,
            org_req.status,
            org_req.approved_by,
            org_req.approved_at,
            org_req.rejection_reason,
            org_req.created_at,
            org_req.updated_at
        FROM organization_requests org_req
        ORDER BY org_req.created_at DESC;
    ELSE
        RAISE EXCEPTION 'Acceso denegado: Solo superadmin puede usar esta función';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Crear políticas RLS corregidas
CREATE POLICY "Super admin can manage organization requests" ON organization_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND email = 'admin@tiendafix.com'
            AND role = 'super_admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND email = 'admin@tiendafix.com'
        )
    );

CREATE POLICY "Users can view their own organization request" ON organization_requests
    FOR SELECT USING (
        owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

CREATE POLICY "Allow public registration requests" ON organization_requests
    FOR INSERT WITH CHECK (
        status = 'pending'
    );

-- 4. Mensaje de confirmación
SELECT 'CORRECCIÓN APLICADA EXITOSAMENTE' as resultado;
SELECT 'Ahora puedes refrescar tu panel de superadmin' as instruccion; 