import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticación
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que el usuario pertenece a la organización o es super admin
    const { data: userProfile } = await supabase
      .from('users')
      .select('role, organization_id')
      .eq('auth_user_id', session.user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Solo permitir acceso si es super admin o pertenece a la organización
    if (userProfile.role !== 'super_admin' && userProfile.organization_id !== params.id) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Obtener datos de la organización
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select(`
        id,
        name,
        slug,
        email,
        phone,
        address,
        subscription_plan,
        subscription_status,
        subscription_start_date,
        subscription_end_date,
        max_users,
        max_devices,
        created_at,
        updated_at
      `)
      .eq('id', params.id)
      .single()

    if (orgError || !organization) {
      console.error('❌ Error fetching organization:', orgError)
      return NextResponse.json({ error: 'Organización no encontrada' }, { status: 404 })
    }

    console.log('✅ Organization data retrieved:', {
      id: organization.id,
      name: organization.name,
      subscription_plan: organization.subscription_plan,
      subscription_status: organization.subscription_status,
      subscription_start_date: organization.subscription_start_date,
      subscription_end_date: organization.subscription_end_date,
      max_users: organization.max_users,
      max_devices: organization.max_devices
    })

    return NextResponse.json({
      success: true,
      data: organization
    })

  } catch (error) {
    console.error('Error fetching organization:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 