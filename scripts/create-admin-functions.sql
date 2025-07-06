-- ================================
-- FUNCIONES ADMINISTRATIVAS
-- ================================

-- Función para obtener todas las solicitudes (solo para superadmin)
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
    -- Solo permitir si es superadmin
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE auth_user_id = auth.uid() 
        AND email = 'admin@tiendafix.com'
        AND role = 'super_admin'
    ) AND NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.email = 'admin@tiendafix.com'
    ) THEN
        RAISE EXCEPTION 'Acceso denegado: Solo superadmin puede usar esta función';
    END IF;

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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para diagnosticar el estado del superadmin
CREATE OR REPLACE FUNCTION diagnose_superadmin_status()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    details TEXT
) AS $$
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
    
    -- Verificar conexión auth_user_id
    RETURN QUERY
    SELECT 
        'Auth Connection'::TEXT,
        CASE 
            WHEN EXISTS(
                SELECT 1 FROM users u 
                INNER JOIN auth.users au ON u.auth_user_id = au.id 
                WHERE u.email = 'admin@tiendafix.com'
            ) 
            THEN 'OK'::TEXT 
            ELSE 'BROKEN'::TEXT 
        END,
        COALESCE(
            (SELECT 'Connected correctly'::TEXT
             FROM users u 
             INNER JOIN auth.users au ON u.auth_user_id = au.id 
             WHERE u.email = 'admin@tiendafix.com' LIMIT 1),
            'Conexión rota entre auth.users y users'::TEXT
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para contar solicitudes por estado
CREATE OR REPLACE FUNCTION get_organization_requests_stats()
RETURNS TABLE (
    status_name TEXT,
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        org_req.status::TEXT,
        COUNT(*)::BIGINT
    FROM organization_requests org_req
    GROUP BY org_req.status
    ORDER BY COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mensaje de confirmación
SELECT 'Funciones administrativas creadas exitosamente' as resultado; 