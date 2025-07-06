-- ================================
-- ARREGLAR USUARIO SUPERADMIN
-- ================================

-- Este script corrige el problema donde el superadmin no puede ver las solicitudes
-- debido a que no existe un registro en la tabla users después de la limpieza

-- Primero, verificar si existe el usuario superadmin
DO $$
DECLARE
    admin_auth_id UUID;
    admin_exists BOOLEAN := FALSE;
BEGIN
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
            
            RAISE NOTICE 'Usuario superadmin creado exitosamente';
        ELSE
            RAISE NOTICE 'Usuario superadmin ya existe';
        END IF;
    ELSE
        RAISE NOTICE 'No se encontró el usuario admin@tiendafix.com en auth.users';
    END IF;
END $$;

-- Mensaje de confirmación
SELECT 'Script de corrección de superadmin completado' as resultado; 