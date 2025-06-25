import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔧 Updating unlock status...')
    
    const supabase = createServerClient()
    const body = await request.json()
    const unlockId = params.id
    
    const organizationId = '873d8154-8b40-4b8a-8d03-431bf9f697e6'

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

    const updateData: any = {}
    if (body.status) updateData.status = body.status
    if (body.completion_time) updateData.completion_time = body.completion_time
    
    updateData.updated_at = new Date().toISOString()

    const { data: unlock, error } = await supabase
      .from('unlocks')
      .update(updateData)
      .eq('id', unlockId)
      .eq('organization_id', organizationId)
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