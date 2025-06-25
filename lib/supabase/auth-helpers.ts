import { createServerClient } from './server'

/**
 * Obtiene el organization_id del usuario autenticado
 * @returns UUID del organization o null si no está autenticado
 */
export async function getCurrentUserOrganizationId(): Promise<string | null> {
  try {
    const supabase = createServerClient()
    
    // Obtener el usuario autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.warn('❌ Usuario no autenticado:', authError?.message)
      return null
    }

    // Buscar la información del usuario en la tabla users
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('auth_user_id', user.id)
      .single()

    if (userError || !userRecord) {
      console.warn('❌ No se encontró registro de usuario:', userError?.message)
      return null
    }

    console.log('✅ Organization ID obtenido:', userRecord.organization_id)
    return userRecord.organization_id
  } catch (error) {
    console.error('🚨 Error obteniendo organization_id:', error)
    return null
  }
}

/**
 * Obtiene el organization_id o devuelve un UUID de prueba
 * Útil durante desarrollo cuando no hay autenticación real
 */
export async function getOrganizationIdOrDefault(): Promise<string> {
  const orgId = await getCurrentUserOrganizationId()
  
  // Si no hay organización, usar un UUID válido de prueba
  if (!orgId) {
    console.warn('⚠️ Usando organization_id de prueba. Configurar autenticación real.')
    return '550e8400-e29b-41d4-a716-446655440000' // UUID válido de prueba
  }
  
  return orgId
}