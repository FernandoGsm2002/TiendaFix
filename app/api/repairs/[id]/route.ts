import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const createSupabaseClient = (cookieStore: any) => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: any) {
          cookieStore.delete(name, options)
        },
      },
    }
  )
}

// GET - Obtener reparación por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies()
  const supabase = createSupabaseClient(cookieStore)
  const repairId = params.id

  try {
    console.log('🔧 Getting repair by ID:', params.id)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: organizationId, error: orgError } = await supabase.rpc('get_user_org_id')

    if (orgError || !organizationId) {
      console.error('Could not retrieve organization for user:', orgError)
      return NextResponse.json({ error: 'Organization not found for user.' }, { status: 403 })
    }

    const { data: repair, error } = await supabase
      .from('repairs')
      .select(`
        id, title, description, problem_description, solution_description, 
        status, priority, cost,
        estimated_completion_date, actual_completion_date, received_date, delivered_date,
        warranty_days, internal_notes, customer_notes,
        created_at, updated_at,
        customers(id, name, email, phone, anonymous_identifier, customer_type, cedula_dni, country_code),
        devices(id, brand, model, device_type, serial_number, imei, color),
        users!repairs_created_by_fkey(id, name, email)
      `)
      .eq('id', repairId)
      .eq('organization_id', organizationId)
      .single()

    if (error) {
      console.error('🚨 Error fetching repair:', error)
      return NextResponse.json(
        { error: 'Reparación no encontrada', details: error.message },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: repair
    })

  } catch (error) {
    console.error('🚨 Get repair error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar reparación
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies()
  const supabase = createSupabaseClient(cookieStore)
  const repairId = params.id
  
  try {
    console.log('🔧 Updating repair:', params.id)
    
    const body = await request.json()
    
    // Obtener el usuario autenticado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Obtener la organización y el ID de perfil del usuario via RPC
    const [
      { data: organizationId, error: orgError },
      { data: profileId, error: profileError }
    ] = await Promise.all([
      supabase.rpc('get_user_org_id'),
      supabase.rpc('get_user_profile_id')
    ]);

    if (orgError || !organizationId) {
      console.error('Could not retrieve organization for user:', orgError)
      return NextResponse.json({ error: 'Organization not found for user.' }, { status: 403 })
    }
    if (profileError || !profileId) {
      console.error('Could not retrieve profile ID for user:', profileError)
      return NextResponse.json({ error: 'User profile not found.' }, { status: 403 })
    }

    // Obtener estado actual de la reparación antes de actualizar
    const { data: currentRepair, error: fetchError } = await supabase
      .from('repairs')
      .select('status, customer_id, cost, title, device_id, internal_notes')
      .eq('id', repairId)
      .single()

    if (fetchError) {
      console.error('🚨 Error fetching current repair state:', fetchError)
      return NextResponse.json({ error: 'No se pudo encontrar la reparación a actualizar' }, { status: 404 })
    }
    
    let updateData: { [key: string]: any } = {
      updated_at: new Date().toISOString()
    };

    // Caso 1: Actualización parcial de estado (incluyendo notas de progreso)
    if (body.status && (Object.keys(body).length === 1 || (Object.keys(body).length === 2 && body.progress_notes))) {
      console.log('🔄 Performing partial status update to:', body.status)
      updateData.status = body.status
      
      // Agregar notas de progreso si se proporcionan
      if (body.progress_notes) {
        updateData.internal_notes = currentRepair.internal_notes 
          ? `${currentRepair.internal_notes}\n\n--- ${new Date().toLocaleString('es-PE')} ---\n${body.progress_notes}`
          : `--- ${new Date().toLocaleString('es-PE')} ---\n${body.progress_notes}`
      }
    } 
    // Caso 2: Actualización completa del formulario
    else {
      console.log('📝 Performing full form update')
      // Validaciones para actualización completa
      if (!body.title || !body.problem_description) {
        return NextResponse.json(
          { error: 'Título y descripción del problema son obligatorios para una actualización completa' },
          { status: 400 }
        )
      }
      
      // Construir objeto de actualización completa
      updateData = {
        ...updateData,
        title: body.title,
        description: body.description,
        problem_description: body.problem_description,
        solution_description: body.solution_description,
        status: body.status,
        priority: body.priority,
        cost: body.cost,
        warranty_days: body.warranty_days,
        internal_notes: body.internal_notes,
        customer_notes: body.customer_notes
      };
    }

    // Lógica de fechas para ciertos estados
    if (updateData.status === 'completed' || updateData.status === 'delivered') {
      updateData.actual_completion_date = body.actual_completion_date || new Date().toISOString()
    }
    if (updateData.status === 'delivered') {
      updateData.delivered_date = body.delivered_date || new Date().toISOString()
    }

    const { data: repair, error } = await supabase
      .from('repairs')
      .update(updateData)
      .eq('id', repairId)
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) {
      console.error('🚨 Error updating repair:', error)
      return NextResponse.json(
        { error: 'Error al actualizar la reparación', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Repair updated successfully:', repair.id)

    const newStatus = body.status || updateData.status;

    // Actualizar estado del dispositivo asociado
    if (currentRepair.device_id && newStatus) {
      let deviceStatus: any;
      switch (newStatus) {
        case 'received':
        case 'pending':
        case 'diagnosed':
        case 'in_progress':
          deviceStatus = 'in_repair';
          break;
        case 'waiting_parts':
          deviceStatus = 'awaiting_parts';
          break;
        case 'completed':
          deviceStatus = 'ready_for_pickup';
          break;
        case 'delivered':
          deviceStatus = 'delivered';
          break;
        case 'cannot_be_repaired':
        case 'cancelled':
            deviceStatus = 'irreparable';
            break;
        default:
          deviceStatus = null; // No cambiar el estado del dispositivo
      }

      if (deviceStatus) {
        const { error: deviceUpdateError } = await supabase
          .from('devices')
          .update({ status: deviceStatus })
          .eq('id', currentRepair.device_id)
        
        if (deviceUpdateError) {
          console.error('🚨 Error updating device status:', deviceUpdateError)
          // No bloqueamos la respuesta por esto, pero es importante registrarlo
        } else {
          console.log(`🔄 Device ${currentRepair.device_id} status updated to ${deviceStatus}`)
        }
      }
    }

    // Si la reparación se acaba de marcar como 'completed', registrar la venta.
    if (newStatus === 'completed' && currentRepair.status !== 'completed') {
      const repairCost = body.cost || currentRepair.cost || 0;
      console.log(`[SalesLog] Checking repair ${repair.id}. Status changed from ${currentRepair.status} to ${newStatus}.`)
      console.log(`[SalesLog] Calculated repair cost: ${repairCost}. (Body: ${body.cost}, Current: ${currentRepair.cost})`)

      if (repairCost > 0) {
        console.log(`[SalesLog] Cost is positive. Creating a sales record for ${repairCost}...`);
        
        const saleData = {
          organization_id: organizationId,
          customer_id: currentRepair.customer_id,
          created_by: profileId,
          total: repairCost,
          payment_method: 'other', // O un valor predeterminado
          sale_type: 'service',
          notes: `Ingreso por Reparación #${repair.id}: ${currentRepair.title || ''}`.trim()
        };

        console.log('[SalesLog] Sales data to be inserted:', saleData);

        const { error: saleError } = await supabase
          .from('sales')
          .insert(saleData);

        if (saleError) {
          console.error('🚨 [SalesLog] Error creating sales record for repair:', saleError);
          // No devolvemos un error aquí para no bloquear la actualización de la reparación,
          // pero lo registramos para poder depurarlo.
        } else {
          console.log(`💰 [SalesLog] Sales record created successfully for repair ${repair.id}.`);
        }
      } else {
        console.log(`[SalesLog] Cost is 0 or less. No sales record will be created.`);
      }
    }

    return NextResponse.json({
      success: true,
      data: repair
    })

  } catch (error) {
    console.error('🚨 Update repair error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar reparación
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies()
  const supabase = createSupabaseClient(cookieStore)
  const repairId = params.id

  try {
    console.log('🔧 Deleting repair:', params.id)
    
    // Obtener el usuario autenticado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Obtener la organización del usuario via RPC
    const { data: organizationId, error: orgError } = await supabase.rpc('get_user_org_id')

    if (orgError || !organizationId) {
      console.error('Could not retrieve organization for user:', orgError)
      return NextResponse.json({ error: 'Organization not found for user.' }, { status: 403 })
    }

    const { error } = await supabase
      .from('repairs')
      .delete()
      .eq('id', repairId)
      .eq('organization_id', organizationId)

    if (error) {
      console.error('🚨 Error deleting repair:', error)
      return NextResponse.json(
        { error: 'Error al eliminar la reparación', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Repair deleted successfully:', repairId)

    return NextResponse.json({ success: true, message: 'Reparación eliminada' })

  } catch (error) {
    console.error('🚨 Delete repair error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}