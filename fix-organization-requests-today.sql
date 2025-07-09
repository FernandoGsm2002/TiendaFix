-- ===============================
-- CORRECCIÓN COMPLETA - ORGANIZATION REQUESTS
-- ===============================

-- PASO 1: Diagnóstico inicial
SELECT 'DIAGNÓSTICO INICIAL' as paso;

-- Ver solicitudes existentes
SELECT 
    'Total solicitudes' as info,
    COUNT(*) as cantidad,
    MAX(created_at) as ultima_solicitud
FROM organization_requests;

-- PASO 2: Eliminar políticas RLS problemáticas
SELECT 'ELIMINANDO POLÍTICAS RLS PROBLEMÁTICAS' as paso;

DROP POLICY IF EXISTS "Super admin can manage organization requests" ON organization_requests;
DROP POLICY IF EXISTS "Users can view their own organization request" ON organization_requests;
DROP POLICY IF EXISTS "Allow public registration requests" ON organization_requests;

-- PASO 3: Crear/Reemplazar la función de administración
SELECT 'CREANDO FUNCIÓN DE ADMINISTRACIÓN' as paso;

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
    -- Verificar si es superadmin (múltiples verificaciones)
    IF EXISTS (
        SELECT 1 FROM users 
        WHERE auth_user_id = auth.uid() 
        AND email = 'fernandoapple2002@gmail.com'
        AND role = 'super_admin'
    ) OR EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND email = 'fernandoapple2002@gmail.com'
    ) OR EXISTS (
        SELECT 1 FROM users 
        WHERE auth_user_id = auth.uid() 
        AND role = 'super_admin'
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

-- PASO 4: Crear políticas RLS mejoradas
SELECT 'CREANDO POLÍTICAS RLS MEJORADAS' as paso;

-- Política principal: Super admin puede ver todas las solicitudes
CREATE POLICY "Super admin can manage organization requests" ON organization_requests
    FOR ALL USING (
        -- Permitir si es Fernando como superadmin
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND email = 'fernandoapple2002@gmail.com'
            AND role = 'super_admin'
        )
        OR
        -- Permitir si es cualquier superadmin
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role = 'super_admin'
        )
        OR
        -- Fallback directo desde auth.users
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND email = 'fernandoapple2002@gmail.com'
        )
    );

-- Política para que los solicitantes vean su propia solicitud
CREATE POLICY "Users can view their own organization request" ON organization_requests
    FOR SELECT USING (
        owner_email = auth.email()
        OR 
        owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Política para permitir inserción de nuevas solicitudes (registro público)
CREATE POLICY "Allow public registration requests" ON organization_requests
    FOR INSERT WITH CHECK (
        status = 'pending'
    );

-- PASO 5: Verificar que el usuario Fernando esté configurado correctamente
SELECT 'VERIFICANDO USUARIO FERNANDO' as paso;

-- Mostrar info del usuario Fernando
SELECT 
    'Usuario Fernando' as info,
    u.email,
    u.role,
    u.is_active,
    u.auth_user_id,
    CASE WHEN u.organization_id IS NULL THEN 'Sin org (correcto)' ELSE 'Con org' END as org_status
FROM users u 
WHERE u.email = 'fernandoapple2002@gmail.com';

-- PASO 6: Probar la función
SELECT 'PROBANDO FUNCIÓN (si falla, verificar permisos)' as paso;

-- Esto debería funcionar con la service key
SELECT COUNT(*) as total_solicitudes_via_funcion
FROM get_all_organization_requests_admin();

-- PASO 7: Verificación final
SELECT 'VERIFICACIÓN FINAL' as paso;

-- Contar solicitudes directas
SELECT 
    'Acceso directo' as metodo,
    COUNT(*) as total_solicitudes
FROM organization_requests;

-- Verificar función existe
SELECT 
    'Función existe' as check_name,
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'get_all_organization_requests_admin'
        ) 
        THEN 'SÍ' 
        ELSE 'NO' 
    END as exists;

-- Mensaje final
SELECT 
    'CORRECCIÓN COMPLETADA' as resultado,
    'Ahora refresca tu panel de super-admin' as instruccion; 