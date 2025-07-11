-- ===============================
-- SCRIPT DE CONFIGURACIÓN DE SUPERADMIN
-- ===============================
-- Este script configura un usuario como superadministrador
-- Reemplaza $SUPER_ADMIN_EMAIL con el email del administrador

-- ===============================
-- PASO 1: DIAGNÓSTICO COMPLETO
-- ===============================

SELECT '=== DIAGNÓSTICO INICIAL ===' as info;

-- Verificar solicitudes en DB
SELECT 
    'Total solicitudes en database' as check_name,
    COUNT(*) as cantidad,
    MAX(created_at) as ultima_solicitud
FROM organization_requests;

-- Verificar by status
SELECT 
    'Solicitudes por estado' as info,
    status,
    COUNT(*) as cantidad
FROM organization_requests
GROUP BY status;

-- ===============================
-- PASO 2: LIMPIAR CONFIGURACIÓN ANTERIOR
-- ===============================

SELECT '=== LIMPIANDO CONFIGURACIÓN ANTERIOR ===' as info;

-- Eliminar políticas RLS problemáticas
DROP POLICY IF EXISTS "Super admin can manage organization requests" ON organization_requests;
DROP POLICY IF EXISTS "Fernando super admin can manage organization requests" ON organization_requests;
DROP POLICY IF EXISTS "Users can view their own organization request" ON organization_requests;
DROP POLICY IF EXISTS "Allow public registration requests" ON organization_requests;

-- Eliminar función anterior si existe
DROP FUNCTION IF EXISTS get_all_organization_requests_admin();

-- ===============================
-- PASO 3: CREAR FUNCIÓN DE ADMINISTRACIÓN
-- ===============================

SELECT '=== CREANDO FUNCIÓN DE ADMINISTRACIÓN ===' as info;

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
    -- Verificar si es superadmin
    IF EXISTS (
        SELECT 1 FROM users 
        WHERE auth_user_id = auth.uid() 
        AND role = 'super_admin'
        AND is_active = true
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

-- ===============================
-- PASO 4: CREAR POLÍTICAS RLS OPTIMIZADAS
-- ===============================

SELECT '=== CREANDO POLÍTICAS RLS OPTIMIZADAS ===' as info;

-- Política principal: Superadmin puede gestionar todas las solicitudes
CREATE POLICY "Super admin can manage organization requests" ON organization_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role = 'super_admin'
            AND is_active = true
        )
    );

-- Política para que los solicitantes vean su propia solicitud
CREATE POLICY "Users can view their own organization request" ON organization_requests
    FOR SELECT USING (
        owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Política para permitir nuevos registros
CREATE POLICY "Allow public registration requests" ON organization_requests
    FOR INSERT WITH CHECK (
        status = 'pending'
    );

-- ===============================
-- PASO 5: FUNCIÓN DE DIAGNÓSTICO FINAL
-- ===============================

CREATE OR REPLACE FUNCTION diagnose_superadmin_final()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Verificar solicitudes
    RETURN QUERY
    SELECT 
        'Total solicitudes'::TEXT,
        COUNT(*)::TEXT,
        'Deberían aparecer en el panel'::TEXT
    FROM organization_requests;
    
    -- Verificar función admin
    RETURN QUERY
    SELECT 
        'Función admin'::TEXT,
        CASE 
            WHEN EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_all_organization_requests_admin')
            THEN 'CREADA ✅'
            ELSE 'ERROR ❌'
        END,
        'Función para obtener todas las solicitudes'::TEXT;
    
    -- Verificar políticas RLS
    RETURN QUERY
    SELECT 
        'Políticas RLS'::TEXT,
        CASE 
            WHEN EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'organization_requests' AND policyname LIKE '%Super admin%')
            THEN 'CREADAS ✅'
            ELSE 'ERROR ❌'
        END,
        'Políticas para acceso de superadmin'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ===============================
-- PASO 6: VERIFICACIÓN FINAL
-- ===============================

SELECT '=== VERIFICACIÓN FINAL ===' as info;

-- Ejecutar diagnóstico
SELECT * FROM diagnose_superadmin_final();

-- Mostrar últimas solicitudes
SELECT 
    '=== ÚLTIMAS SOLICITUDES ===' as info,
    name as empresa,
    owner_email,
    status,
    created_at
FROM organization_requests
ORDER BY created_at DESC
LIMIT 5;

-- ===============================
-- PASO 7: INSTRUCCIONES FINALES
-- ===============================

SELECT '=== INSTRUCCIONES FINALES ===' as info;
SELECT '1. Ejecuta este script completo en Supabase SQL Editor' as paso;
SELECT '2. Configura tu usuario como super_admin en la tabla users' as paso;
SELECT '3. Cierra sesión en tu aplicación' as paso;
SELECT '4. Vuelve a iniciar sesión' as paso;
SELECT '5. Ve al panel de superadmin' as paso;
SELECT '6. Deberías ver todas las solicitudes' as paso; 