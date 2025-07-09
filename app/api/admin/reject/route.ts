import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Usar la clave de servicio para saltar RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    const { requestId, rejectionReason } = await request.json()
    
    if (!requestId) {
      return NextResponse.json(
        { error: 'ID de solicitud requerido' },
        { status: 400 }
      )
    }

    if (!rejectionReason || rejectionReason.trim().length < 10) {
      return NextResponse.json(
        { error: 'Razón de rechazo requerida (mínimo 10 caracteres)' },
        { status: 400 }
      )
    }
    
    console.log('🚫 Rejecting organization request:', requestId)

    // Obtener la solicitud
    const { data: orgRequest, error: fetchError } = await supabase
      .from('organization_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (fetchError || !orgRequest) {
      console.error('❌ Error fetching request:', fetchError)
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      )
    }

    if (orgRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'La solicitud ya ha sido procesada' },
        { status: 400 }
      )
    }

    // Marcar solicitud como rechazada
    const { error: updateError } = await supabase
      .from('organization_requests')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason.trim(),
        approved_at: new Date().toISOString(), // Fecha de procesamiento
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)

    if (updateError) {
      console.error('❌ Error updating request:', updateError)
      return NextResponse.json(
        { error: 'Error rechazando solicitud: ' + updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ Organization request rejected successfully:', orgRequest.name)

    return NextResponse.json({
      success: true,
      message: 'Solicitud rechazada exitosamente',
      data: {
        requestId,
        organizationName: orgRequest.name,
        rejectionReason: rejectionReason.trim(),
        status: 'rejected'
      }
    })

  } catch (error) {
    console.error('❌ Reject API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 