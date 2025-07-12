import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateMultiTenantAccess, logApiCall } from '@/lib/utils/multi-tenant'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies()
  
  try {
    // 1. Validar acceso multi-tenant
    const validation = await validateMultiTenantAccess(cookieStore)
    
    if (!validation.success) {
      return validation.response
    }

    const { userProfile, organizationId, supabase } = validation.context
    
    logApiCall('Unlocks PUT', organizationId, { 
      userRole: userProfile.role,
      userId: userProfile.id,
      unlockId: params.id
    })

    const body = await request.json()
    const unlockId = params.id

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
      console.error('❌ Unlock not found:', fetchError)
      return NextResponse.json(
        { error: 'Desbloqueo no encontrado' },
        { status: 404 }
      )
    }

    // Solo el creador del desbloqueo o un owner pueden actualizarlo
    if (userProfile.role === 'technician' && existingUnlock.created_by !== userProfile.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para actualizar este desbloqueo' },
        { status: 403 }
      )
    }

    // Preparar datos de actualización
    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    
    if (body.status) updateData.status = body.status
    if (body.completion_time) updateData.completion_time = body.completion_time
    if (body.notes) updateData.notes = body.notes

    // Actualizar el desbloqueo
    const { data: unlock, error } = await supabase
      .from('unlocks')
      .update(updateData)
      .eq('id', unlockId)
      .eq('organization_id', organizationId)
      .select(`
        id,
        unlock_type,
        brand,
        model,
        imei,
        serial_number,
        status,
        cost,
        provider,
        provider_order_id,
        completion_time,
        notes,
        created_at,
        updated_at,
        customers!left (
          id,
          name,
          phone,
          email,
          anonymous_identifier,
          customer_type,
          cedula_dni,
          country_code
        ),
        users!unlocks_created_by_fkey (
          id,
          name,
          email
        )
      `)
      .single()

    if (error) {
      console.error('❌ Error updating unlock:', error)
      return NextResponse.json(
        { error: 'Error al actualizar el desbloqueo', details: error.message },
        { status: 500 }
      )
    }

    if (!unlock) {
      return NextResponse.json(
        { error: 'Desbloqueo no encontrado después de actualizar' },
        { status: 404 }
      )
    }

    console.log('✅ Unlock updated successfully:', unlock.id)

    // Serializar datos de forma segura
    const serializedUnlock = {
      id: unlock.id,
      unlock_type: unlock.unlock_type,
      brand: unlock.brand,
      model: unlock.model,
      imei: unlock.imei,
      serial_number: unlock.serial_number,
      status: unlock.status,
      cost: unlock.cost ? parseFloat(unlock.cost.toString()) : 0,
      provider: unlock.provider,
      provider_order_id: unlock.provider_order_id,
      completion_time: unlock.completion_time,
      notes: unlock.notes,
      created_at: unlock.created_at,
      updated_at: unlock.updated_at,
      customer: unlock.customers ? {
        id: unlock.customers.id,
        name: unlock.customers.name,
        phone: unlock.customers.phone,
        email: unlock.customers.email,
        anonymous_identifier: unlock.customers.anonymous_identifier,
        customer_type: unlock.customers.customer_type,
        cedula_dni: unlock.customers.cedula_dni,
        country_code: unlock.customers.country_code
      } : null,
      technician: unlock.users ? {
        id: unlock.users.id,
        name: unlock.users.name,
        email: unlock.users.email
      } : null
    }

    return NextResponse.json({
      success: true,
      data: serializedUnlock
    })

  } catch (error) {
    console.error('🚨 Update unlock error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies()
  
  try {
    const validation = await validateMultiTenantAccess(cookieStore)
    
    if (!validation.success) {
      return validation.response
    }

    const { userProfile, organizationId, supabase } = validation.context
    
    logApiCall('Unlocks DELETE', organizationId, { 
      userRole: userProfile.role,
      userId: userProfile.id,
      unlockId: params.id
    })

    const unlockId = params.id

    if (!unlockId) {
      return NextResponse.json(
        { error: 'ID del unlock es requerido' },
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

    // Solo el creador del desbloqueo o un owner pueden eliminarlo
    if (userProfile.role === 'technician' && existingUnlock.created_by !== userProfile.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar este desbloqueo' },
        { status: 403 }
      )
    }

    // Eliminar el desbloqueo
    const { error } = await supabase
      .from('unlocks')
      .delete()
      .eq('id', unlockId)
      .eq('organization_id', organizationId)

    if (error) {
      console.error('❌ Error deleting unlock:', error)
      return NextResponse.json(
        { error: 'Error al eliminar el desbloqueo', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Unlock deleted successfully:', unlockId)

    return NextResponse.json({
      success: true,
      message: 'Desbloqueo eliminado exitosamente'
    })

  } catch (error) {
    console.error('🚨 Delete unlock error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 