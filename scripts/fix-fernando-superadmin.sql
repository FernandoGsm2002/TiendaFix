-- ================================
-- ARREGLAR SUPERADMIN PARA FERNANDO
-- ================================

-- Este script configura fernandoapple2002@gmail.com como superadmin
-- y corrige las políticas RLS para que funcionen correctamente

BEGIN;

-- ================================
-- PASO 1: VERIFICAR Y CREAR/ACTUALIZAR USUARIO SUPERADMIN
-- ================================

DO $$
DECLARE
    fernando_auth_id UUID;
    fernando_user_exists BOOLEAN := FALSE;
BEGIN
    RAISE NOTICE 'Paso 1: Configurando fernandoapple2002@gmail.com como superadmin...';
    
    -- Buscar el usuario fernandoapple2002@gmail.com en auth.users
    SELECT id INTO fernando_auth_id 
    FROM auth.users 
    WHERE email = 'fernandoapple2002@gmail.com' 
    LIMIT 1;
    
    IF fernando_auth_id IS NOT NULL THEN
        RAISE NOTICE 'Usuario auth encontrado: %', fernando_auth_id;
        
        -- Verificar si existe en la tabla users
        SELECT EXISTS(
            SELECT 1 FROM users 
            WHERE auth_user_id = fernando_auth_id 
            AND email = 'fernandoapple2002@gmail.com'
        ) INTO fernando_user_exists;
        
        IF fernando_user_exists THEN
            -- Actualizar rol a super_admin
            UPDATE users 
            SET 
                role = 'super_admin',
                updated_at = NOW()
            WHERE auth_user_id = fernando_auth_id 
            AND email = 'fernandoapple2002@gmail.com';
            
            RAISE NOTICE 'Usuario Fernando actualizado a super_admin';
        ELSE
            -- Crear usuario como super_admin
            INSERT INTO users (
                auth_user_id,
                email,
                name,
                role,
                organization_id,
                is_active,
                created_at,
                updated_at
            ) VALUES (
                fernando_auth_id,
                'fernandoapple2002@gmail.com',
                'Fernando - Super Administrador',
                'super_admin',
                NULL, -- Los super admins no pertenecen a una organización específica
                true,
                NOW(),
                NOW()
            );
            
            RAISE NOTICE 'Usuario Fernando creado como super_admin';
        END IF;
    ELSE
        RAISE NOTICE 'ADVERTENCIA: No se encontró fernandoapple2002@gmail.com en auth.users';
        RAISE NOTICE 'Por favor verifica que el usuario existe en Supabase Auth Dashboard';
    END IF;
END $$;

-- ================================
-- PASO 2: ACTUALIZAR POLÍTICAS RLS
-- ================================

DO $$
BEGIN
    RAISE NOTICE 'Paso 2: Actualizando políticas RLS para Fernando...';
END $$;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Super admin can manage organization requests" ON organization_requests;
DROP POLICY IF EXISTS "Users can view their own organization request" ON organization_requests;
DROP POLICY IF EXISTS "Allow public registration requests" ON organization_requests;

-- Crear políticas corregidas para Fernando
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
        -- Fallback para otros superadmins
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

-- Política para que los solicitantes vean sus propias solicitudes
CREATE POLICY "Users can view their own organization request" ON organization_requests
    FOR SELECT USING (
        owner_email = auth.email()
        OR 
        owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Política para permitir nuevos registros públicos
CREATE POLICY "Allow public registration requests" ON organization_requests
    FOR INSERT WITH CHECK (
        status = 'pending'
    );

-- ================================
-- PASO 3: VERIFICACIÓN FINAL
-- ================================

DO $$
BEGIN
    RAISE NOTICE 'Paso 3: Verificando configuración...';
END $$;

-- Mostrar información del usuario Fernando
SELECT 
    'USUARIO FERNANDO:' as info,
    u.id as user_id,
    u.email,
    u.name,
    u.role,
    u.auth_user_id,
    u.organization_id,
    u.is_active
FROM users u 
WHERE u.email = 'fernandoapple2002@gmail.com';

-- Contar solicitudes totales
SELECT 
    'TOTAL SOLICITUDES:' as info,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendientes,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as aprobadas,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rechazadas
FROM organization_requests;

-- Mostrar las 3 solicitudes más recientes
SELECT 
    'SOLICITUDES RECIENTES:' as info,
    name as tienda,
    owner_email as propietario,
    status as estado,
    created_at as fecha
FROM organization_requests 
ORDER BY created_at DESC 
LIMIT 3;

COMMIT;

-- ================================
-- INSTRUCCIONES
-- ================================

SELECT '✅ CONFIGURACIÓN DE SUPERADMIN COMPLETADA' as resultado;
SELECT 'Instrucciones:' as mensaje;
SELECT '1. Reinicia el servidor (npm run dev)' as paso_1;
SELECT '2. Limpia caché del navegador (Ctrl+F5)' as paso_2;
SELECT '3. Haz login con fernandoapple2002@gmail.com' as paso_3;
SELECT '4. Ve al panel de superadmin' as paso_4;
SELECT '5. Las nuevas solicitudes deberían aparecer ahora' as paso_5; 