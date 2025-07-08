-- ================================
-- DIAGNÓSTICO Y CORRECCIÓN COMPLETA PARA SOLICITUDES DE ORGANIZACIONES
-- ================================

-- Paso 1: Diagnosticar el estado actual
SELECT 'DIAGNÓSTICO DEL SISTEMA' as seccion;

-- Verificar si existe la función de administración
SELECT 
  'Función get_all_organization_requests_admin' as check_name,
  CASE 
    WHEN EXISTS(
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'get_all_organization_requests_admin'
    ) 
    THEN 'EXISTE' 
    ELSE 'NO EXISTE' 
  END as status;

-- Contar solicitudes por estado
SELECT 
  'Total de solicitudes en DB' as check_name,
  COUNT(*)::TEXT as status
FROM organization_requests;

SELECT 
  'Solicitudes por estado' as check_name,
  status,
  COUNT(*)::TEXT as cantidad
FROM organization_requests
GROUP BY status;

-- Verificar usuario superadmin
SELECT 
  'Usuario superadmin en auth.users' as check_name,
  CASE 
    WHEN EXISTS(SELECT 1 FROM auth.users WHERE email = 'admin@tiendafix.com') 
    THEN 'EXISTE' 
    ELSE 'NO EXISTE' 
  END as status;

SELECT 
  'Usuario superadmin en tabla users' as check_name,
  CASE 
    WHEN EXISTS(SELECT 1 FROM users WHERE email = 'admin@tiendafix.com' AND role = 'super_admin') 
    THEN 'EXISTE' 
    ELSE 'NO EXISTE' 
  END as status;

-- Paso 2: Eliminar políticas RLS problemáticas
SELECT 'ELIMINANDO POLÍTICAS PROBLEMÁTICAS' as seccion;

DROP POLICY IF EXISTS "Super admin can manage organization requests" ON organization_requests;
DROP POLICY IF EXISTS "Users can view their own organization request" ON organization_requests;

-- Paso 3: Crear función de administración si no existe
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
    -- Permitir si es superadmin con registro en users
    IF EXISTS (
        SELECT 1 FROM users 
        WHERE auth_user_id = auth.uid() 
        AND email = 'admin@tiendafix.com'
        AND role = 'super_admin'
    ) OR EXISTS (
        -- Fallback: verificar directamente en auth.users
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

-- Paso 4: Crear políticas RLS mejoradas
SELECT 'CREANDO POLÍTICAS RLS MEJORADAS' as seccion;

-- Política principal: Super admin puede ver todas las solicitudes
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
        -- Fallback: permitir si es superadmin directo desde auth.users
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND email = 'admin@tiendafix.com'
        )
    );

-- Política para que los solicitantes vean su propia solicitud
CREATE POLICY "Users can view their own organization request" ON organization_requests
    FOR SELECT USING (
        owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Política para permitir inserción de nuevas solicitudes (registro público)
CREATE POLICY "Allow public registration requests" ON organization_requests
    FOR INSERT WITH CHECK (
        status = 'pending'
    );

-- Paso 5: Crear función de diagnóstico mejorada
CREATE OR REPLACE FUNCTION diagnose_organization_requests_issue()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Verificar función de administración
    RETURN QUERY
    SELECT 
        'Admin Function'::TEXT,
        CASE 
            WHEN EXISTS(
                SELECT 1 FROM information_schema.routines 
                WHERE routine_name = 'get_all_organization_requests_admin'
            ) 
            THEN 'OK'::TEXT 
            ELSE 'MISSING'::TEXT 
        END,
        'Función get_all_organization_requests_admin'::TEXT;
    
    -- Verificar usuario superadmin en auth.users
    RETURN QUERY
    SELECT 
        'Superadmin in auth.users'::TEXT,
        CASE 
            WHEN EXISTS(SELECT 1 FROM auth.users WHERE email = 'admin@tiendafix.com') 
            THEN 'OK'::TEXT 
            ELSE 'MISSING'::TEXT 
        END,
        COALESCE(
            (SELECT 'User ID: ' || id::TEXT 
             FROM auth.users WHERE email = 'admin@tiendafix.com' LIMIT 1),
            'No encontrado'::TEXT
        );
    
    -- Verificar usuario superadmin en tabla users
    RETURN QUERY
    SELECT 
        'Superadmin in users table'::TEXT,
        CASE 
            WHEN EXISTS(SELECT 1 FROM users WHERE email = 'admin@tiendafix.com' AND role = 'super_admin') 
            THEN 'OK'::TEXT 
            ELSE 'MISSING'::TEXT 
        END,
        COALESCE(
            (SELECT 'User ID: ' || id::TEXT || ', Auth ID: ' || COALESCE(auth_user_id::TEXT, 'NULL')
             FROM users WHERE email = 'admin@tiendafix.com' LIMIT 1),
            'No encontrado'::TEXT
        );
    
    -- Contar solicitudes por estado
    RETURN QUERY
    SELECT 
        'Total Requests'::TEXT,
        'INFO'::TEXT,
        'Total: ' || COUNT(*)::TEXT || ' solicitudes'
    FROM organization_requests;
    
    -- Solicitudes recientes
    RETURN QUERY
    SELECT 
        'Recent Requests'::TEXT,
        'INFO'::TEXT,
        'Últimas 5: ' || STRING_AGG(name || ' (' || status || ')', ', ')
    FROM (
        SELECT name, status 
        FROM organization_requests 
        ORDER BY created_at DESC 
        LIMIT 5
    ) recent;
    
    -- Verificar políticas RLS
    RETURN QUERY
    SELECT 
        'RLS Policies'::TEXT,
        'INFO'::TEXT,
        'Políticas activas: ' || COUNT(*)::TEXT
    FROM pg_policies 
    WHERE tablename = 'organization_requests';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 6: Función para test de acceso directo
CREATE OR REPLACE FUNCTION test_organization_requests_access()
RETURNS TABLE (
    method TEXT,
    result_count BIGINT,
    success BOOLEAN,
    error_message TEXT
) AS $$
DECLARE
    error_msg TEXT;
BEGIN
    -- Test 1: Acceso directo
    BEGIN
        RETURN QUERY
        SELECT 
            'Direct Access'::TEXT,
            COUNT(*),
            true,
            'OK'::TEXT
        FROM organization_requests;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY
        SELECT 
            'Direct Access'::TEXT,
            0::BIGINT,
            false,
            SQLERRM::TEXT;
    END;
    
    -- Test 2: A través de función
    BEGIN
        RETURN QUERY
        SELECT 
            'Function Access'::TEXT,
            COUNT(*),
            true,
            'OK'::TEXT
        FROM get_all_organization_requests_admin();
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY
        SELECT 
            'Function Access'::TEXT,
            0::BIGINT,
            false,
            SQLERRM::TEXT;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mensaje final
SELECT 'CORRECCIÓN COMPLETADA' as resultado;
SELECT 'Ejecuta SELECT * FROM diagnose_organization_requests_issue(); para verificar' as siguiente_paso; 