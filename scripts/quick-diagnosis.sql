-- ================================
-- DIAGNÓSTICO RÁPIDO DEL PROBLEMA
-- ================================

-- Ejecuta estas consultas para diagnosticar el problema

-- 1. Verificar si existe el usuario superadmin en auth.users
SELECT 
    'Superadmin en auth.users' as check_name,
    CASE 
        WHEN EXISTS(SELECT 1 FROM auth.users WHERE email = 'admin@tiendafix.com') 
        THEN '✅ OK' 
        ELSE '❌ MISSING' 
    END as status,
    COALESCE(
        (SELECT 'ID: ' || id::TEXT || ', Created: ' || created_at::TEXT 
         FROM auth.users WHERE email = 'admin@tiendafix.com' LIMIT 1),
        'No encontrado'
    ) as details;

-- 2. Verificar si existe el usuario en la tabla users
SELECT 
    'Superadmin en tabla users' as check_name,
    CASE 
        WHEN EXISTS(SELECT 1 FROM users WHERE email = 'admin@tiendafix.com') 
        THEN '✅ OK' 
        ELSE '❌ MISSING' 
    END as status,
    COALESCE(
        (SELECT 'ID: ' || id::TEXT || ', Role: ' || role || ', Auth ID: ' || COALESCE(auth_user_id::TEXT, 'NULL')
         FROM users WHERE email = 'admin@tiendafix.com' LIMIT 1),
        'No encontrado'
    ) as details;

-- 3. Contar solicitudes en organization_requests
SELECT 
    'Total de solicitudes' as check_name,
    '📊 INFO' as status,
    COUNT(*)::TEXT || ' solicitudes encontradas' as details
FROM organization_requests;

-- 4. Mostrar solicitudes recientes
SELECT 
    'Solicitudes recientes' as titulo,
    name as nombre_tienda,
    owner_email as email_propietario,
    status as estado,
    created_at as fecha_creacion
FROM organization_requests 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Verificar políticas RLS activas
SELECT 
    'Políticas RLS activas' as titulo,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'organization_requests'; 