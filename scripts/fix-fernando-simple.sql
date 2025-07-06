-- ================================
-- ARREGLO SIMPLE PARA FERNANDO SUPERADMIN
-- ================================

-- Este script configura fernandoapple2002@gmail.com como superadmin
-- Versión simplificada sin RAISE NOTICE para evitar errores de sintaxis

-- PASO 1: Configurar Fernando como super_admin
DO $$
DECLARE
    fernando_auth_id UUID;
    fernando_user_exists BOOLEAN := FALSE;
BEGIN
    -- Buscar el usuario fernandoapple2002@gmail.com en auth.users
    SELECT id INTO fernando_auth_id 
    FROM auth.users 
    WHERE email = 'fernandoapple2002@gmail.com' 
    LIMIT 1;
    
    IF fernando_auth_id IS NOT NULL THEN
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
                NULL,
                true,
                NOW(),
                NOW()
            );
        END IF;
    END IF;
END $$;

-- PASO 2: Eliminar políticas existentes
DROP POLICY IF EXISTS "Super admin can manage organization requests" ON organization_requests;
DROP POLICY IF EXISTS "Users can view their own organization request" ON organization_requests;
DROP POLICY IF EXISTS "Allow public registration requests" ON organization_requests;

-- PASO 3: Crear políticas corregidas para Fernando
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

-- PASO 4: Verificación final - Mostrar información del usuario Fernando
SELECT 
    '=== USUARIO FERNANDO ===' as info,
    u.email,
    u.role,
    u.is_active,
    CASE WHEN u.organization_id IS NULL THEN 'Sin organización (CORRECTO)' ELSE 'Con organización' END as org_status
FROM users u 
WHERE u.email = 'fernandoapple2002@gmail.com';

-- Contar solicitudes totales
SELECT 
    '=== ESTADÍSTICAS ===' as info,
    COUNT(*) as total_solicitudes,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendientes,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as aprobadas
FROM organization_requests;

-- Mostrar las 3 solicitudes más recientes
SELECT 
    '=== SOLICITUDES RECIENTES ===' as info,
    name as tienda,
    owner_email as propietario,
    status as estado,
    created_at as fecha
FROM organization_requests 
ORDER BY created_at DESC 
LIMIT 3; 