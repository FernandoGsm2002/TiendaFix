-- ================================
-- VERIFICACIÓN RÁPIDA DEL PROBLEMA CON ORGANIZATION_REQUESTS
-- ================================

-- 1. Verificar cuántas solicitudes hay en total
SELECT 
    'Total de solicitudes en la base de datos' as descripcion,
    COUNT(*) as cantidad,
    MAX(created_at) as ultima_creada
FROM organization_requests;

-- 2. Solicitudes por estado
SELECT 
    'Solicitudes por estado' as descripcion,
    status,
    COUNT(*) as cantidad
FROM organization_requests
GROUP BY status
ORDER BY COUNT(*) DESC;

-- 3. Solicitudes recientes (últimas 10)
SELECT 
    'Últimas 10 solicitudes' as descripcion,
    name as empresa,
    owner_email as email_owner,
    status,
    created_at
FROM organization_requests
ORDER BY created_at DESC
LIMIT 10;

-- 4. Verificar si existe la función de administración
SELECT 
    'Función get_all_organization_requests_admin' as descripcion,
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'get_all_organization_requests_admin'
        ) 
        THEN 'EXISTE' 
        ELSE 'NO EXISTE - ESTE ES EL PROBLEMA' 
    END as estado;

-- 5. Verificar usuario superadmin
SELECT 
    'Usuario superadmin' as descripcion,
    CASE 
        WHEN EXISTS(SELECT 1 FROM auth.users WHERE email = 'admin@tiendafix.com') 
        THEN 'OK en auth.users' 
        ELSE 'FALTA en auth.users' 
    END as auth_status,
    CASE 
        WHEN EXISTS(SELECT 1 FROM users WHERE email = 'admin@tiendafix.com' AND role = 'super_admin') 
        THEN 'OK en users' 
        ELSE 'FALTA en users' 
    END as users_status;

-- 6. Mostrar mensaje de diagnóstico
SELECT 
    '🔍 DIAGNÓSTICO COMPLETADO' as resultado,
    'Si hay solicitudes pero la función NO EXISTE, ese es el problema' as explicacion; 