-- ================================
-- DIAGNÓSTICO ESPECÍFICO PARA FERNANDO
-- ================================

-- Este script diagnostica si Fernando está correctamente configurado como superadmin

-- 1. Verificar usuario en auth.users
SELECT 
    'AUTH.USERS CHECK' as check_type,
    CASE 
        WHEN EXISTS(SELECT 1 FROM auth.users WHERE email = 'fernandoapple2002@gmail.com') 
        THEN '✅ ENCONTRADO' 
        ELSE '❌ NO ENCONTRADO' 
    END as status,
    COALESCE(
        (SELECT 'ID: ' || id::TEXT || ' | Creado: ' || created_at::TEXT 
         FROM auth.users WHERE email = 'fernandoapple2002@gmail.com' LIMIT 1),
        'Usuario no existe en auth.users'
    ) as details;

-- 2. Verificar usuario en tabla users
SELECT 
    'USERS TABLE CHECK' as check_type,
    CASE 
        WHEN EXISTS(SELECT 1 FROM users WHERE email = 'fernandoapple2002@gmail.com') 
        THEN '✅ ENCONTRADO' 
        ELSE '❌ NO ENCONTRADO' 
    END as status,
    COALESCE(
        (SELECT 'ID: ' || id::TEXT || ' | Role: ' || role || ' | Auth ID: ' || COALESCE(auth_user_id::TEXT, 'NULL') || ' | Org ID: ' || COALESCE(organization_id::TEXT, 'NULL')
         FROM users WHERE email = 'fernandoapple2002@gmail.com' LIMIT 1),
        'Usuario no existe en tabla users'
    ) as details;

-- 3. Verificar si es super_admin
SELECT 
    'SUPER ADMIN ROLE CHECK' as check_type,
    CASE 
        WHEN EXISTS(SELECT 1 FROM users WHERE email = 'fernandoapple2002@gmail.com' AND role = 'super_admin') 
        THEN '✅ ES SUPER ADMIN' 
        ELSE '❌ NO ES SUPER ADMIN' 
    END as status,
    COALESCE(
        (SELECT 'Role actual: ' || role || ' | Activo: ' || is_active::TEXT
         FROM users WHERE email = 'fernandoapple2002@gmail.com' LIMIT 1),
        'Usuario no encontrado'
    ) as details;

-- 4. Verificar conexión entre auth.users y users
SELECT 
    'AUTH CONNECTION CHECK' as check_type,
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM users u 
            INNER JOIN auth.users au ON u.auth_user_id = au.id 
            WHERE u.email = 'fernandoapple2002@gmail.com'
        ) 
        THEN '✅ CONEXIÓN OK' 
        ELSE '❌ CONEXIÓN ROTA' 
    END as status,
    COALESCE(
        (SELECT 'Auth ID: ' || au.id::TEXT || ' | User ID: ' || u.id::TEXT
         FROM users u 
         INNER JOIN auth.users au ON u.auth_user_id = au.id 
         WHERE u.email = 'fernandoapple2002@gmail.com' LIMIT 1),
        'Conexión no encontrada entre auth.users y users'
    ) as details;

-- 5. Verificar políticas RLS activas
SELECT 
    'RLS POLICIES CHECK' as check_type,
    '📋 INFO' as status,
    COUNT(*)::TEXT || ' políticas activas en organization_requests' as details
FROM pg_policies 
WHERE tablename = 'organization_requests';

-- 6. Mostrar políticas específicas
SELECT 
    'POLÍTICA: ' || policyname as check_type,
    '📋 INFO' as status,
    'Comando: ' || cmd || ' | Permisiva: ' || permissive::TEXT as details
FROM pg_policies 
WHERE tablename = 'organization_requests'
ORDER BY policyname;

-- 7. Contar solicitudes totales
SELECT 
    'ORGANIZATION REQUESTS COUNT' as check_type,
    '📊 ESTADÍSTICAS' as status,
    'Total: ' || COUNT(*) || ' | Pendientes: ' || COUNT(CASE WHEN status = 'pending' THEN 1 END) || ' | Aprobadas: ' || COUNT(CASE WHEN status = 'approved' THEN 1 END) as details
FROM organization_requests;

-- 8. Mostrar últimas 3 solicitudes
SELECT 
    'ÚLTIMAS SOLICITUDES' as info,
    name as tienda,
    owner_email as propietario,
    status as estado,
    created_at as fecha_creacion
FROM organization_requests 
ORDER BY created_at DESC 
LIMIT 3;

-- 9. Verificar si Fernando puede acceder a solicitudes (simulación de política)
SELECT 
    'SIMULACIÓN ACCESO RLS' as check_type,
    CASE 
        WHEN EXISTS(
            SELECT 1 FROM users 
            WHERE email = 'fernandoapple2002@gmail.com' 
            AND role = 'super_admin'
        ) 
        THEN '✅ DEBERÍA TENER ACCESO' 
        ELSE '❌ NO DEBERÍA TENER ACCESO' 
    END as status,
    'Basado en role = super_admin en tabla users' as details;

-- 10. Verificar estructura de organización de Fernando (si tiene)
SELECT 
    'FERNANDO ORGANIZATION CHECK' as check_type,
    CASE 
        WHEN u.organization_id IS NULL THEN '✅ SIN ORGANIZACIÓN (CORRECTO PARA SUPER ADMIN)'
        ELSE '⚠️  TIENE ORGANIZACIÓN ASIGNADA'
    END as status,
    COALESCE('Org ID: ' || u.organization_id::TEXT, 'Sin organización') as details
FROM users u
WHERE u.email = 'fernandoapple2002@gmail.com';

-- RESUMEN FINAL
SELECT '================================' as resumen;
SELECT 'RESUMEN DE DIAGNÓSTICO PARA FERNANDO' as resumen;
SELECT '================================' as resumen; 