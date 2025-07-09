-- ===================================================
-- SCRIPT MANUAL PARA RECHAZAR SOLICITUD DE ORGANIZACIÓN
-- ===================================================

-- 1. 🔍 PRIMERO: Ver solicitudes pendientes
SELECT 
    id,
    name,
    slug,
    email,
    owner_name,
    owner_email,
    owner_phone,
    subscription_plan,
    status,
    created_at
FROM organization_requests 
WHERE status = 'pending'
ORDER BY created_at DESC;

-- 2. 🚫 RECHAZAR SOLICITUD (cambia estos valores)
-- Ejemplo de uso:
-- Reemplaza 'REQUEST_ID_AQUI' con el ID real de la solicitud
-- Reemplaza 'RAZON_DEL_RECHAZO' con la razón específica

UPDATE organization_requests 
SET 
    status = 'rejected',
    rejection_reason = 'RAZON_DEL_RECHAZO_AQUI', -- Cambia esto
    approved_at = NOW(), -- Fecha de procesamiento
    updated_at = NOW()
WHERE id = 'REQUEST_ID_AQUI'; -- Cambia esto

-- 3. ✅ VERIFICAR RESULTADO
SELECT 
    name,
    owner_name,
    owner_email,
    status,
    rejection_reason,
    approved_at as rejected_at
FROM organization_requests 
WHERE id = 'REQUEST_ID_AQUI'; -- Cambia esto

-- ===================================================
-- EJEMPLOS PRÁCTICOS DE RECHAZO
-- ===================================================

-- Ejemplo 1: Rechazar por información incompleta
/*
UPDATE organization_requests 
SET 
    status = 'rejected',
    rejection_reason = 'La información proporcionada está incompleta. Faltan datos de contacto válidos y la dirección comercial no es clara. Por favor, complete todos los campos requeridos y vuelva a enviar la solicitud.',
    approved_at = NOW(),
    updated_at = NOW()
WHERE name = 'Ejemplo Tienda' AND status = 'pending';
*/

-- Ejemplo 2: Rechazar por no cumplir requisitos
/*
UPDATE organization_requests 
SET 
    status = 'rejected',
    rejection_reason = 'Su solicitud no cumple con los requisitos mínimos para el plan seleccionado. El plan anual requiere un volumen mínimo de transacciones estimado. Por favor, considere un plan mensual o proporcione más información sobre su volumen de negocio.',
    approved_at = NOW(),
    updated_at = NOW()
WHERE owner_email = 'email@ejemplo.com' AND status = 'pending';
*/

-- Ejemplo 3: Rechazar por duplicado
/*
UPDATE organization_requests 
SET 
    status = 'rejected',
    rejection_reason = 'Ya existe una organización registrada con este email o nombre comercial. Si cree que esto es un error, por favor contacte al soporte técnico con los detalles de su caso.',
    approved_at = NOW(),
    updated_at = NOW()
WHERE slug = 'tienda-ejemplo' AND status = 'pending';
*/

-- ===================================================
-- CONSULTAS ÚTILES
-- ===================================================

-- Ver todas las solicitudes rechazadas con razones
SELECT 
    name as tienda,
    owner_name as propietario,
    owner_email as email,
    rejection_reason as razon_rechazo,
    approved_at as fecha_rechazo
FROM organization_requests 
WHERE status = 'rejected'
ORDER BY approved_at DESC;

-- Estadísticas de solicitudes
SELECT 
    status,
    COUNT(*) as cantidad,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM organization_requests), 2) as porcentaje
FROM organization_requests 
GROUP BY status
ORDER BY cantidad DESC;

-- Últimas 10 solicitudes procesadas (aprobadas y rechazadas)
SELECT 
    name,
    owner_name,
    status,
    CASE 
        WHEN status = 'approved' THEN 'Aprobada'
        WHEN status = 'rejected' THEN 'Rechazada'
        ELSE 'Pendiente'
    END as estado_es,
    approved_at as fecha_procesamiento,
    rejection_reason
FROM organization_requests 
WHERE approved_at IS NOT NULL
ORDER BY approved_at DESC
LIMIT 10;

-- ===================================================
-- NOTAS IMPORTANTES
-- ===================================================

/*
🔴 RECUERDA:
1. Una vez rechazada, la solicitud NO puede ser aprobada automáticamente
2. La razón del rechazo será visible para el solicitante
3. Usa razones claras y constructivas
4. Mínimo 10 caracteres en la razón de rechazo
5. Puedes usar saltos de línea en la razón con \n

📝 RAZONES COMUNES DE RECHAZO:
- Información incompleta o incorrecta
- Documentos faltantes o no válidos
- No cumple requisitos del plan seleccionado
- Duplicado de solicitud existente
- Problemas de verificación de identidad
- Actividad comercial no compatible

✅ BUENAS PRÁCTICAS:
- Sé específico sobre qué falta o está mal
- Proporciona instrucciones claras para corregir
- Mantén un tono profesional pero amigable
- Incluye pasos para reenviar la solicitud si es aplicable
*/ 