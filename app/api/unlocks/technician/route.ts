import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticación
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que sea técnico - CORREGIDO: usar tabla 'users'
    const { data: userProfile } = await supabase
      .from('users')
      .select('role, id, organization_id')
      .eq('email', session.user.email)
      .single()

    if (!userProfile) {
      console.log('❌ User profile not found for email:', session.user.email)
      return NextResponse.json({ error: 'Perfil de usuario no encontrado' }, { status: 404 })
    }

    console.log('✅ User profile found:', { role: userProfile.role, id: userProfile.id })

    if (userProfile.role !== 'technician') {
      console.log('❌ User is not a technician, role:', userProfile.role)
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || 'todos'
    const search = searchParams.get('search') || ''
    const offset = (page - 1) * limit

    try {
      // Consultar desbloqueos reales de la base de datos creados por este técnico
      let query = supabase
        .from('unlocks')
        .select(`
          id, unlock_type, brand, model, imei, serial_number,
          status, cost, provider, provider_order_id, completion_time,
          notes, created_at, updated_at,
          customers(id, name, email, phone, anonymous_identifier, customer_type),
          devices(id, brand, model, device_type, color),
          users!unlocks_created_by_fkey(id, name, email)
        `)
        .eq('organization_id', userProfile.organization_id)
        .eq('created_by', userProfile.id) // Solo desbloqueos creados por este técnico
        .order('created_at', { ascending: false })

      // Filtrar por estado si no es 'todos'
      if (status !== 'todos') {
        query = query.eq('status', status)
      }

      // Filtrar por búsqueda si se proporciona
      if (search) {
        const searchConditions = [
          `brand.ilike.%${search}%`,
          `model.ilike.%${search}%`,
          `imei.ilike.%${search}%`
        ].join(',')

        query = query.or(searchConditions)
      }

      // Obtener datos con paginación
      const { data: unlocks, error, count } = await query
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('🚨 Error fetching technician unlocks:', error)
        throw error
      }

      // Transformar datos al formato que espera la página del técnico
      const transformedUnlocks = (unlocks || []).map(unlock => {
        const customer = Array.isArray(unlock.customers) ? unlock.customers[0] : unlock.customers
        return {
          id: unlock.id,
          customer_name: customer?.name || 'Cliente General',
          customer_phone: customer?.phone || '',
          brand: unlock.brand,
          model: unlock.model,
          imei: unlock.imei || '',
          carrier: '', // Campo legacy
          country: 'Peru', // Campo legacy
          service_type: unlock.unlock_type,
          status: unlock.status,
          price: unlock.cost,
          estimated_time: '24-48 horas', // Campo legacy
          notes: unlock.notes || '',
          created_at: unlock.created_at,
          updated_at: unlock.updated_at,
          completion_date: unlock.completion_time
        }
      })

      return NextResponse.json({
        success: true,
        data: transformedUnlocks,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      })

    } catch (dbError) {
      console.error('🚨 Database error fetching technician unlocks:', dbError)
      // Devolver estructura vacía si falla la BD
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      })
    }

  } catch (error) {
    console.error('Error fetching technician unlocks:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticación
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que sea técnico - CORREGIDO: usar tabla 'users'
    const { data: userProfile } = await supabase
      .from('users')
      .select('role, id, organization_id')
      .eq('email', session.user.email)
      .single()

    if (!userProfile) {
      console.log('❌ User profile not found for email:', session.user.email)
      return NextResponse.json({ error: 'Perfil de usuario no encontrado' }, { status: 404 })
    }

    console.log('✅ User profile found:', { role: userProfile.role, id: userProfile.id })

    if (userProfile.role !== 'technician') {
      console.log('❌ User is not a technician, role:', userProfile.role)
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    const { unlockId, status, notes, completion_time } = body

    if (!unlockId || !status) {
      return NextResponse.json({ error: 'ID de desbloqueo y estado son requeridos' }, { status: 400 })
    }

    // Verificar que el desbloqueo existe y fue creado por este técnico
    const { data: existingUnlock, error: fetchError } = await supabase
      .from('unlocks')
      .select('id, created_by')
      .eq('id', unlockId)
      .eq('organization_id', userProfile.organization_id)
      .eq('created_by', userProfile.id) // Solo puede actualizar sus propios desbloqueos
      .single()

    if (fetchError || !existingUnlock) {
      return NextResponse.json({ error: 'Desbloqueo no encontrado o sin permisos' }, { status: 404 })
    }

    // Actualizar el desbloqueo
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (notes) updateData.notes = notes
    if (completion_time) updateData.completion_time = completion_time

    const { data: updatedUnlock, error: updateError } = await supabase
      .from('unlocks')
      .update(updateData)
      .eq('id', unlockId)
      .select()
      .single()

    if (updateError) {
      console.error('🚨 Error updating unlock:', updateError)
      return NextResponse.json({ error: 'Error al actualizar el desbloqueo' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: updatedUnlock
    })

  } catch (error) {
    console.error('Error updating unlock:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticación
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que sea técnico - CORREGIDO: usar tabla 'users'
    const { data: userProfile } = await supabase
      .from('users')
      .select('role, id, organization_id')
      .eq('email', session.user.email)
      .single()

    if (!userProfile) {
      console.log('❌ User profile not found for email:', session.user.email)
      return NextResponse.json({ error: 'Perfil de usuario no encontrado' }, { status: 404 })
    }

    console.log('✅ User profile found:', { role: userProfile.role, id: userProfile.id })

    if (userProfile.role !== 'technician') {
      console.log('❌ User is not a technician, role:', userProfile.role)
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      customer_name, 
      customer_phone, 
      brand, 
      model, 
      imei, 
      carrier, 
      country, 
      service_type, 
      price, 
      estimated_time, 
      notes 
    } = body

    // Validaciones
    if (!brand || !model) {
      return NextResponse.json({ 
        error: 'Marca y modelo son requeridos' 
      }, { status: 400 })
    }

    // Crear el desbloqueo en la base de datos
    const newUnlockData = {
      organization_id: userProfile.organization_id,
      created_by: userProfile.id,
      unlock_type: service_type || 'Factory Unlock',
      brand,
      model,
      imei: imei || null,
      status: 'pending',
      cost: price || 0,
      notes: notes || null
    }

    const { data: unlock, error: createError } = await supabase
      .from('unlocks')
      .insert(newUnlockData)
      .select()
      .single()

    if (createError) {
      console.error('🚨 Error creating unlock:', createError)
      return NextResponse.json({ 
        error: 'Error al crear el desbloqueo', 
        details: createError.message 
      }, { status: 500 })
    }

    console.log('✅ Nuevo desbloqueo creado por técnico:', unlock.id)

    return NextResponse.json({
      success: true,
      data: unlock,
      message: 'Desbloqueo creado exitosamente'
    })

  } catch (error) {
    console.error('Error creating unlock:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 