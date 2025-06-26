import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Unlocks API called - getting real data')
    
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    
    // Verificar autenticación y rol del usuario
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      console.log('❌ No session found')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log('✅ Session found:', session.user.email)

    // Obtener perfil del usuario para verificar rol
    const { data: userProfile } = await supabase
      .from('users')
      .select('role, id, organization_id')
      .eq('email', session.user.email)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: 'Perfil de usuario no encontrado' }, { status: 404 })
    }
    
    // Parámetros de consulta
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'todos'
    const unlock_type = searchParams.get('unlock_type') || 'todos'
    
    const offset = (page - 1) * limit

    try {
      let query = supabase
        .from('unlocks')
        .select(`
          id, unlock_type, brand, model, imei, serial_number,
          status, cost, provider, provider_order_id, completion_time,
          notes, created_at, updated_at, created_by,
          customers(id, name, email, phone, anonymous_identifier, customer_type),
          devices(id, brand, model, device_type, color),
          users!unlocks_created_by_fkey(id, name, email)
        `)
        .eq('organization_id', userProfile.organization_id)
        .order('created_at', { ascending: false })

      // Si es técnico, solo mostrar sus propios desbloqueos
      if (userProfile.role === 'technician') {
        query = query.eq('created_by', userProfile.id)
        console.log('🔧 Filtering unlocks for technician:', userProfile.id)
      }

      // Filtrar por estado si no es 'todos'
      if (status !== 'todos') {
        query = query.eq('status', status)
      }

      // Filtrar por tipo de unlock si no es 'todos'
      if (unlock_type !== 'todos') {
        query = query.eq('unlock_type', unlock_type)
      }

      // Filtrar por búsqueda si se proporciona
      if (search) {
        const searchConditions = [
          `brand.ilike.%${search}%`,
          `model.ilike.%${search}%`,
          `imei.ilike.%${search}%`,
          `provider_order_id.ilike.%${search}%`,
          `customers.name.ilike.%${search}%`,
          `customers.anonymous_identifier.ilike.%${search}%`
        ].join(',')

        query = query.or(searchConditions)
      }

      // Obtener datos con paginación
      const { data: unlocks, error, count } = await query
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('🚨 Error fetching unlocks:', error)
        throw error
      }

      console.log(`✅ Fetched ${unlocks?.length || 0} unlocks from database`)

      return NextResponse.json({
        success: true,
        data: unlocks || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      })

    } catch (dbError) {
      console.error('🚨 Database query error:', dbError)
      
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
    console.error('🚨 Unlocks API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Creating new unlock...')
    
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    
    // Verificar autenticación y obtener usuario actual
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener perfil del usuario
    const { data: userProfile } = await supabase
      .from('users')
      .select('role, id, organization_id')
      .eq('email', session.user.email)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: 'Perfil de usuario no encontrado' }, { status: 404 })
    }

    // Validaciones básicas
    if (!body.unlock_type || !body.brand || !body.model) {
      return NextResponse.json(
        { error: 'Tipo de unlock, marca y modelo son obligatorios' },
        { status: 400 }
      )
    }

    // Manejar cliente general
    let customerId = null
    let deviceId = null
    
    if (body.customer_id && body.customer_id !== 'general') {
      customerId = body.customer_id
      
      // Si hay cliente específico, crear dispositivo automáticamente
      if (body.brand && body.model) {
        const newDevice = {
          organization_id: userProfile.organization_id,
          customer_id: customerId,
          brand: body.brand,
          model: body.model,
          device_type: 'smartphone', // Default type
          serial_number: body.serial_number || null,
          imei: body.imei || null,
          color: null,
          storage_capacity: null,
          operating_system: null,
          notes: body.notes || null
        }

        const { data: device, error: deviceError } = await supabase
          .from('devices')
          .insert(newDevice)
          .select()
          .single()

        if (deviceError) {
          console.error('🚨 Error creating device:', deviceError)
          return NextResponse.json(
            { error: 'Error al crear el dispositivo', details: deviceError.message },
            { status: 500 }
          )
        }

        deviceId = device.id
        console.log('✅ Device created for unlock:', deviceId)
      }
    }

    // Validar tipo de unlock (ahora permite cualquier texto)
    const newUnlock = {
      organization_id: userProfile.organization_id,
      customer_id: customerId,
      device_id: deviceId,
      created_by: userProfile.id,
      unlock_type: body.unlock_type,
      brand: body.brand,
      model: body.model,
      imei: body.imei || null,
      serial_number: body.serial_number || null,
      status: 'pending',
      cost: body.cost || 0,
      provider: body.provider || null,
      notes: body.notes || null
    }

    const { data: unlock, error } = await supabase
      .from('unlocks')
      .insert(newUnlock)
      .select()
      .single()

    if (error) {
      console.error('🚨 Error creating unlock:', error)
      return NextResponse.json(
        { error: 'Error al crear el desbloqueo', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Unlock created successfully:', unlock.id)

    return NextResponse.json({
      success: true,
      data: unlock
    })

  } catch (error) {
    console.error('🚨 Create unlock error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
