import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET - Obtener técnico por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔧 Getting technician by ID:', params.id)
    
    const supabase = createRouteHandlerClient({ cookies })
    const technicianId = params.id

    // Verificar autenticación
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      console.error('❌ Usuario no autenticado:', authError)
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener la organización del usuario
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('auth_user_id', session.user.id)
      .single()

    if (profileError || !userProfile?.organization_id) {
      console.error('❌ Error obteniendo organización del usuario:', profileError)
      return NextResponse.json({ error: 'Organización no encontrada' }, { status: 403 })
    }

    const organizationId = userProfile.organization_id

    const { data: technician, error } = await supabase
      .from('users')
      .select(`
        id, name, email, phone, role, is_active, last_login,
        avatar_url, created_at, updated_at
      `)
      .eq('id', technicianId)
      .eq('organization_id', organizationId)
      .single()

    if (error) {
      console.error('🚨 Error fetching technician:', error)
      return NextResponse.json(
        { error: 'Técnico no encontrado', details: error.message },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: technician
    })

  } catch (error) {
    console.error('🚨 Get technician error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar técnico
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔧 Updating technician:', params.id)
    
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const technicianId = params.id

    // Verificar autenticación
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      console.error('❌ Usuario no autenticado:', authError)
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener la organización del usuario
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('auth_user_id', session.user.id)
      .single()

    if (profileError || !userProfile?.organization_id) {
      console.error('❌ Error obteniendo organización del usuario:', profileError)
      return NextResponse.json({ error: 'Organización no encontrada' }, { status: 403 })
    }

    const organizationId = userProfile.organization_id

    // Validaciones
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Nombre y email son obligatorios' },
        { status: 400 }
      )
    }

    if (body.role && !['technician', 'owner'].includes(body.role)) {
      return NextResponse.json(
        { error: 'Rol inválido' },
        { status: 400 }
      )
    }

    const updateData = {
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      role: body.role || 'technician',
      is_active: body.is_active !== undefined ? body.is_active : true,
      updated_at: new Date().toISOString()
    }

    const { data: technician, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', technicianId)
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) {
      console.error('🚨 Error updating technician:', error)
      return NextResponse.json(
        { error: 'Error al actualizar el técnico', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Technician updated successfully:', technician.id)

    return NextResponse.json({
      success: true,
      data: technician
    })

  } catch (error) {
    console.error('🚨 Update technician error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar técnico
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔧 Deleting technician:', params.id)
    
    const supabase = createRouteHandlerClient({ cookies })
    const technicianId = params.id

    // Verificar autenticación
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      console.error('❌ Usuario no autenticado:', authError)
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener la organización del usuario
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('auth_user_id', session.user.id)
      .single()

    if (profileError || !userProfile?.organization_id) {
      console.error('❌ Error obteniendo organización del usuario:', profileError)
      return NextResponse.json({ error: 'Organización no encontrada' }, { status: 403 })
    }

    const organizationId = userProfile.organization_id

    // Verificar si el técnico tiene reparaciones asignadas
    const { data: repairs } = await supabase
      .from('repairs')
      .select('id')
      .eq('assigned_technician_id', technicianId)
      .limit(1)

    if (repairs && repairs.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el técnico porque tiene reparaciones asignadas' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', technicianId)
      .eq('organization_id', organizationId)

    if (error) {
      console.error('🚨 Error deleting technician:', error)
      return NextResponse.json(
        { error: 'Error al eliminar el técnico', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Technician deleted successfully:', technicianId)

    return NextResponse.json({
      success: true,
      message: 'Técnico eliminado correctamente'
    })

  } catch (error) {
    console.error('🚨 Delete technician error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 