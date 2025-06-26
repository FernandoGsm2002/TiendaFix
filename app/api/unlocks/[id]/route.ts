import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔧 Updating unlock status...')
    
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const unlockId = params.id
    
    // Obtener el usuario actual autenticado
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener el perfil del usuario para obtener su organización
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, organization_id, role')
      .eq('email', session.user.email)
      .single()

    if (profileError || !userProfile) {
      console.error('🚨 Error fetching user profile:', profileError)
      return NextResponse.json({ error: 'Error al obtener perfil de usuario' }, { status: 500 })
    }

    const organizationId = userProfile.organization_id

    if (!unlockId) {
      return NextResponse.json(
        { error: 'ID del unlock es requerido' },
        { status: 400 }
      )
    }

    // Validar estado
    const validStatuses = ['pending', 'in_progress', 'completed', 'failed']
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      )
    }

    // Verificar que el desbloqueo existe y el usuario tiene permisos
    const { data: existingUnlock, error: fetchError } = await supabase
      .from('unlocks')
      .select('id, created_by, organization_id')
      .eq('id', unlockId)
      .eq('organization_id', organizationId)
      .single()

    if (fetchError || !existingUnlock) {
      return NextResponse.json(
        { error: 'Desbloqueo no encontrado' },
        { status: 404 }
      )
    }

    // Solo el creador del desbloqueo o un owner/admin pueden actualizarlo
    if (userProfile.role === 'technician' && existingUnlock.created_by !== userProfile.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para actualizar este desbloqueo' },
        { status: 403 }
      )
    }

    const updateData: any = {}
    if (body.status) updateData.status = body.status
    if (body.completion_time) updateData.completion_time = body.completion_time
    if (body.notes) updateData.notes = body.notes
    
    updateData.updated_at = new Date().toISOString()

    const { data: unlock, error } = await supabase
      .from('unlocks')
      .update(updateData)
      .eq('id', unlockId)
      .select()
      .single()

    if (error) {
      console.error('🚨 Error updating unlock:', error)
      return NextResponse.json(
        { error: 'Error al actualizar el desbloqueo', details: error.message },
        { status: 500 }
      )
    }

    if (!unlock) {
      return NextResponse.json(
        { error: 'Desbloqueo no encontrado' },
        { status: 404 }
      )
    }

    console.log('✅ Unlock updated successfully:', unlock.id)

    return NextResponse.json({
      success: true,
      data: unlock
    })

  } catch (error) {
    console.error('🚨 Update unlock error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 