import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Interfaces compartidas
export interface UserProfile {
  id: string
  organization_id: string
  role: 'super_admin' | 'owner' | 'technician'
  name: string
  email: string
}

export interface MultiTenantContext {
  user: any
  userProfile: UserProfile
  organizationId: string
  supabase: any
}

// Cliente Supabase optimizado
export function createSupabaseClient(cookieStore: any) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

// Función principal para validar autenticación y obtener contexto multi-tenant
export async function validateMultiTenantAccess(
  cookieStore: any,
  options: {
    requiredRole?: UserProfile['role'][]
    allowSuperAdmin?: boolean
  } = {}
): Promise<{ success: true; context: MultiTenantContext } | { success: false; response: NextResponse }> {
  
  const supabase = createSupabaseClient(cookieStore)
  
  try {
    // 1. Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('❌ Authentication failed:', authError?.message)
      return {
        success: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // 2. Obtener perfil del usuario
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, organization_id, role, name, email')
      .eq('auth_user_id', user.id)
      .single()
    
    if (profileError || !userProfile) {
      console.log('❌ User profile not found:', profileError?.message)
      return {
        success: false,
        response: NextResponse.json({ error: 'User profile not found' }, { status: 403 })
      }
    }

    // 3. Validar organización (excepto super_admin)
    if (userProfile.role !== 'super_admin' && !userProfile.organization_id) {
      console.log('❌ Organization not found for user:', userProfile.id)
      return {
        success: false,
        response: NextResponse.json({ error: 'Organization not found' }, { status: 403 })
      }
    }

    // 4. Validar rol requerido
    if (options.requiredRole && !options.requiredRole.includes(userProfile.role)) {
      // Permitir super_admin si está habilitado
      if (!options.allowSuperAdmin || userProfile.role !== 'super_admin') {
        console.log('❌ Insufficient permissions:', { 
          userRole: userProfile.role, 
          requiredRoles: options.requiredRole 
        })
        return {
          success: false,
          response: NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }
      }
    }

    const organizationId = userProfile.organization_id || 'super_admin'
    
    console.log(`✅ Multi-tenant access validated:`, {
      userId: userProfile.id,
      role: userProfile.role,
      organizationId: organizationId !== 'super_admin' ? organizationId : 'SUPER_ADMIN'
    })

    return {
      success: true,
      context: {
        user,
        userProfile,
        organizationId,
        supabase
      }
    }

  } catch (error) {
    console.error('❌ Multi-tenant validation error:', error)
    return {
      success: false,
      response: NextResponse.json({ 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
  }
}

// Función para construir queries con filtro de organización
export function buildOrganizationQuery(
  supabase: any, 
  table: string, 
  organizationId: string,
  isSuperAdmin: boolean = false
) {
  const query = supabase.from(table)
  
  // Super admin puede ver todas las organizaciones
  if (!isSuperAdmin) {
    return query.eq('organization_id', organizationId)
  }
  
  return query
}

// Función para logs consistentes
export function logApiCall(endpoint: string, organizationId: string, additionalData?: any) {
  console.log(`🔧 ${endpoint} API called`, {
    organizationId: organizationId !== 'super_admin' ? organizationId : 'SUPER_ADMIN',
    timestamp: new Date().toISOString(),
    ...additionalData
  })
}

// Función para validar que los datos pertenecen a la organización
export async function validateResourceOwnership(
  supabase: any,
  table: string,
  resourceId: string,
  organizationId: string,
  isSuperAdmin: boolean = false
): Promise<boolean> {
  
  if (isSuperAdmin) return true
  
  const { data, error } = await supabase
    .from(table)
    .select('organization_id')
    .eq('id', resourceId)
    .single()
  
  if (error || !data) {
    console.log(`❌ Resource not found: ${table}/${resourceId}`)
    return false
  }
  
  const hasAccess = data.organization_id === organizationId
  
  if (!hasAccess) {
    console.log(`❌ Access denied to resource: ${table}/${resourceId}`, {
      resourceOrg: data.organization_id,
      userOrg: organizationId
    })
  }
  
  return hasAccess
} 