-- ================================
-- SCRIPT MAESTRO: CORRECCIÓN COMPLETA DEL SUPERADMIN
-- ================================

-- Este script resuelve completamente el problema del superadmin
-- después de la limpieza de la base de datos

BEGIN;

-- ================================
-- PASO 1: VERIFICAR Y CREAR USUARIO SUPERADMIN
-- ================================

DO $$
DECLARE
    admin_auth_id UUID;
    admin_exists BOOLEAN := FALSE;
BEGIN
    RAISE NOTICE 'Paso 1: Verificando usuario superadmin...';
    
    -- Buscar el usuario admin@tiendafix.com en auth.users
    SELECT id INTO admin_auth_id 
    FROM auth.users 
    WHERE email = 'admin@tiendafix.com' 
    LIMIT 1;
    
    IF admin_auth_id IS NOT NULL THEN
        -- Verificar si existe en la tabla users
        SELECT EXISTS(
            SELECT 1 FROM users 
            WHERE auth_user_id = admin_auth_id 
            AND email = 'admin@tiendafix.com'
        ) INTO admin_exists;
        
        -- Si no existe, crearlo
        IF NOT admin_exists THEN
            INSERT INTO users (
                auth_user_id,
                email,
                name,
                role,
                is_active,
                created_at,
                updated_at
            ) VALUES (
                admin_auth_id,
                'admin@tiendafix.com',
                'Super Administrador',
                'super_admin',
                true,
                NOW(),
                NOW()
            );
            
            RAISE NOTICE 'Usuario superadmin creado exitosamente en tabla users';
        ELSE
            RAISE NOTICE 'Usuario superadmin ya existe en tabla users';
        END IF;
    ELSE
        RAISE NOTICE 'ADVERTENCIA: No se encontró el usuario admin@tiendafix.com en auth.users';
        RAISE NOTICE 'Por favor verifica que el usuario existe en Supabase Auth Dashboard';
    END IF;
END $$;

-- ================================
-- PASO 2: MEJORAR POLÍTICAS RLS
-- ================================

RAISE NOTICE 'Paso 2: Actualizando políticas RLS...';

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Super admin can manage organization requests" ON organization_requests;
DROP POLICY IF EXISTS "Users can view their own organization request" ON organization_requests;
DROP POLICY IF EXISTS "Allow public registration requests" ON organization_requests;

-- Crear políticas mejoradas
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

CREATE POLICY "Users can view their own organization request" ON organization_requests
    FOR SELECT USING (
        owner_email = auth.email()
        OR 
        owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

CREATE POLICY "Allow public registration requests" ON organization_requests
    FOR INSERT WITH CHECK (
        status = 'pending'
    );

-- ================================
-- PASO 3: CREAR FUNCIONES ADMINISTRATIVAS
-- ================================

RAISE NOTICE 'Paso 3: Creando funciones administrativas...';

-- Función para obtener todas las solicitudes
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
) AS $func$
BEGIN
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
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función de diagnóstico
CREATE OR REPLACE FUNCTION diagnose_superadmin_status()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    details TEXT
) AS $func$
BEGIN
    -- Verificar usuario en auth.users
    RETURN QUERY
    SELECT 
        'Auth User Exists'::TEXT,
        CASE 
            WHEN EXISTS(SELECT 1 FROM auth.users WHERE email = 'admin@tiendafix.com') 
            THEN 'OK'::TEXT 
            ELSE 'MISSING'::TEXT 
        END,
        COALESCE(
            (SELECT 'ID: ' || id::TEXT || ', Created: ' || created_at::TEXT 
             FROM auth.users WHERE email = 'admin@tiendafix.com' LIMIT 1),
            'No encontrado'::TEXT
        );
    
    -- Verificar usuario en tabla users
    RETURN QUERY
    SELECT 
        'Users Table Record'::TEXT,
        CASE 
            WHEN EXISTS(SELECT 1 FROM users WHERE email = 'admin@tiendafix.com') 
            THEN 'OK'::TEXT 
            ELSE 'MISSING'::TEXT 
        END,
        COALESCE(
            (SELECT 'ID: ' || id::TEXT || ', Role: ' || role || ', Auth ID: ' || COALESCE(auth_user_id::TEXT, 'NULL')
             FROM users WHERE email = 'admin@tiendafix.com' LIMIT 1),
            'No encontrado'::TEXT
        );
    
    -- Verificar solicitudes en organization_requests
    RETURN QUERY
    SELECT 
        'Organization Requests Count'::TEXT,
        'INFO'::TEXT,
        'Total: ' || COUNT(*)::TEXT
    FROM organization_requests;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- PASO 4: VERIFICACIÓN FINAL
-- ================================

RAISE NOTICE 'Paso 4: Ejecutando verificación final...';

-- Ejecutar diagnóstico
SELECT 'DIAGNÓSTICO FINAL:' as resultado;
SELECT * FROM diagnose_superadmin_status();

-- Mostrar estadísticas de solicitudes
SELECT 'ESTADÍSTICAS DE SOLICITUDES:' as resultado;
SELECT 
    status,
    COUNT(*) as cantidad,
    MIN(created_at) as primera_solicitud,
    MAX(created_at) as ultima_solicitud
FROM organization_requests 
GROUP BY status
ORDER BY COUNT(*) DESC;

COMMIT;

-- ================================
-- INSTRUCCIONES FINALES
-- ================================

SELECT '✅ CORRECCIÓN COMPLETADA EXITOSAMENTE' as resultado;
SELECT 'Instrucciones: ' as mensaje;
SELECT '1. Reinicia el servidor Next.js (npm run dev)' as paso_1;
SELECT '2. Limpia la caché del navegador' as paso_2;
SELECT '3. Intenta acceder al panel de superadmin' as paso_3;
SELECT '4. Si persiste el problema, verifica los logs de la consola del navegador' as paso_4; 