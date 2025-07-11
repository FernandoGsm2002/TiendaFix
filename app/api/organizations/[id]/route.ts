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
        logo_url,
        subscription_plan,
        subscription_status,
        subscription_start_date,
        subscription_end_date,
        max_users,
        max_devices,
        country,
        tax_id,
        tax_id_type,
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

export async function PUT(
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

    // Verificar que el usuario pertenece a la organización y es owner
    const { data: userProfile } = await supabase
      .from('users')
      .select('role, organization_id')
      .eq('auth_user_id', session.user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Solo permitir acceso si es owner de la organización
    if (userProfile.role !== 'owner' || userProfile.organization_id !== params.id) {
      return NextResponse.json({ error: 'Acceso denegado. Solo el propietario puede actualizar la organización' }, { status: 403 })
    }

    // Obtener datos del cuerpo de la petición
    const body = await request.json()
    const { country, tax_id, tax_id_type } = body

    // Validar que country sea válido si se proporciona
    if (country && typeof country !== 'string') {
      return NextResponse.json({ error: 'El país debe ser una cadena válida' }, { status: 400 })
    }

    // Validar que tax_id sea válido si se proporciona
    if (tax_id && typeof tax_id !== 'string') {
      return NextResponse.json({ error: 'El número de identificación tributaria debe ser una cadena válida' }, { status: 400 })
    }

    // Preparar datos para actualización
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (country !== undefined) {
      updateData.country = country
    }
    if (tax_id !== undefined) {
      updateData.tax_id = tax_id
    }
    if (tax_id_type !== undefined) {
      updateData.tax_id_type = tax_id_type
    }

    // Actualizar la organización
    const { data: updatedOrganization, error: updateError } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        id,
        name,
        slug,
        email,
        phone,
        address,
        logo_url,
        subscription_plan,
        subscription_status,
        subscription_start_date,
        subscription_end_date,
        max_users,
        max_devices,
        country,
        tax_id,
        tax_id_type,
        created_at,
        updated_at
      `)
      .single()

    if (updateError) {
      console.error('❌ Error updating organization:', updateError)
      return NextResponse.json({ error: 'Error al actualizar la organización' }, { status: 500 })
    }

    console.log('✅ Organization updated successfully:', {
      id: updatedOrganization.id,
      country: updatedOrganization.country,
      tax_id: updatedOrganization.tax_id,
      tax_id_type: updatedOrganization.tax_id_type
    })

    return NextResponse.json({
      success: true,
      data: updatedOrganization
    })

  } catch (error) {
    console.error('Error updating organization:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 