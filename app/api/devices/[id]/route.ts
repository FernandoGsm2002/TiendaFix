import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function getUserAndOrg(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: userProfile, error } = await supabase
    .from('users')
    .select('organization_id')
    .eq('auth_user_id', user.id)
    .single()
  
  if (error || !userProfile?.organization_id) {
    throw new Error('Organization not found for user.')
  }

  return { user, organizationId: userProfile.organization_id }
}

function initSupabaseClient() {
  const cookieStore = cookies()
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

// GET - Obtener dispositivo por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = initSupabaseClient()
    const { organizationId } = await getUserAndOrg(supabase)
    const deviceId = params.id

    const { data: device, error } = await supabase
      .from('devices')
      .select(`
        id, customer_id, brand, model, device_type, serial_number, imei, color,
        storage_capacity, operating_system, notes, status,
        created_at, updated_at,
        customers(id, name, email, phone, anonymous_identifier, customer_type)
      `)
      .eq('id', deviceId)
      .eq('organization_id', organizationId)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Dispositivo no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: device })
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ error: error.message }, { status })
  }
}

// PUT - Actualizar dispositivo
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = initSupabaseClient()
    const { organizationId } = await getUserAndOrg(supabase)
    const body = await request.json()
    const deviceId = params.id

    let updateData: { [key: string]: any } = {
      updated_at: new Date().toISOString(),
    };

    if (body.status && Object.keys(body).length === 1) {
      updateData.status = body.status
    } else {
      if (!body.brand || !body.model) {
        return NextResponse.json({ error: 'Marca y modelo son obligatorios' }, { status: 400 })
      }
      Object.assign(updateData, {
        customer_id: body.customer_id,
        brand: body.brand,
        model: body.model,
        device_type: body.device_type,
        serial_number: body.serial_number,
        imei: body.imei,
        color: body.color,
        storage_capacity: body.storage_capacity,
        operating_system: body.operating_system,
        notes: body.notes,
      });
    }

    const { data: updatedDevice, error } = await supabase
      .from('devices')
      .update(updateData)
      .eq('id', deviceId)
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }
    return NextResponse.json({ success: true, data: updatedDevice })
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ error: 'Error al actualizar el dispositivo' }, { status })
  }
}

// DELETE - Eliminar dispositivo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = initSupabaseClient()
    const { organizationId } = await getUserAndOrg(supabase)
    const deviceId = params.id

    const { data: repairs } = await supabase
      .from('repairs')
      .select('id')
      .eq('device_id', deviceId)
      .limit(1)

    if (repairs && repairs.length > 0) {
      return NextResponse.json({ error: 'No se puede eliminar, tiene reparaciones asociadas' }, { status: 400 })
    }

    const { error } = await supabase
      .from('devices')
      .delete()
      .eq('id', deviceId)
      .eq('organization_id', organizationId)

    if (error) throw new Error(error.message)
    
    return NextResponse.json({ success: true, message: 'Dispositivo eliminado correctamente' })
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ error: 'Error al eliminar el dispositivo' }, { status })
  }
} 