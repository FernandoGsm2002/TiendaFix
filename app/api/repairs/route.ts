import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Repairs API called - getting real data')
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticación
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      console.log('❌ No session found')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log('✅ Session found:', session.user.email)

    // Obtener perfil del usuario - CORREGIDO: usar tabla 'users'
    const { data: userProfile } = await supabase
      .from('users')
      .select('role, id, organization_id')
      .eq('email', session.user.email)
      .single()

    if (!userProfile) {
      console.log('❌ User profile not found')
      return NextResponse.json({ error: 'Perfil de usuario no encontrado' }, { status: 404 })
    }

    console.log('✅ User profile found:', { role: userProfile.role, id: userProfile.id })

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const offset = (page - 1) * limit

    // Construir query base
    let query = supabase
      .from('repairs_view')
      .select(`
        id,
        title,
        description,
        problem_description,
        solution_description,
        status,
        priority,
        cost,
        estimated_completion_date,
        actual_completion_date,
        received_date,
        delivered_date,
        warranty_days,
        internal_notes,
        customer_notes,
        created_at,
        updated_at,
        unregistered_customer_name,
        unregistered_customer_phone,
        unregistered_device_info,
        customers (
          id,
          name,
          phone,
          email,
          anonymous_identifier,
          customer_type
        ),
        devices (
          id,
          brand,
          model,
          device_type,
          color,
          serial_number,
          imei
        ),
        users (
          id,
          name,
          email
        )
      `, { count: 'exact' })

    // Filtrar por organización
    query = query.eq('organization_id', userProfile.organization_id)

    // FILTRO POR ROL: Técnicos solo ven SUS reparaciones
    if (userProfile.role === 'technician') {
      console.log('🔍 Filtering repairs for technician:', userProfile.id)
      query = query.eq('created_by', userProfile.id)
    }

    // Aplicar filtros adicionales
    if (status && status !== 'todos') {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,problem_description.ilike.%${search}%`)
    }

    // Ejecutar query con paginación
    const { data: repairs, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('❌ Database error:', error)
      throw error
    }

    console.log(`✅ Fetched ${repairs?.length || 0} repairs from database`)

    // Calcular estadísticas
    const statsQuery = supabase
      .from('repairs_view')
      .select('status', { count: 'exact' })
      .eq('organization_id', userProfile.organization_id)

    // Filtrar estadísticas por técnico si aplica
    if (userProfile.role === 'technician') {
      statsQuery.eq('created_by', userProfile.id)
    }

    const { data: statsData, error: statsError } = await statsQuery

    let stats = {
      total: 0,
      received: 0,
      diagnosed: 0,
      inProgress: 0,
      completed: 0,
      delivered: 0,
      cancelled: 0,
    }

    if (!statsError && statsData) {
      stats = {
        total: count || 0,
        received: statsData.filter(r => r.status === 'received').length,
        diagnosed: statsData.filter(r => r.status === 'diagnosed').length,
        inProgress: statsData.filter(r => r.status === 'in_progress').length,
        completed: statsData.filter(r => r.status === 'completed').length,
        delivered: statsData.filter(r => r.status === 'delivered').length,
        cancelled: statsData.filter(r => r.status === 'cancelled').length,
      }
    }

    console.log('📊 Stats calculated:', stats)

    return NextResponse.json({
      success: true,
      data: repairs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      stats
    })

  } catch (error) {
    console.error('🚨 Repairs API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticación
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener perfil del usuario - CORREGIDO: usar tabla 'users'
    const { data: userProfile } = await supabase
      .from('users')
      .select('role, id, organization_id')
      .eq('email', session.user.email)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: 'Perfil de usuario no encontrado' }, { status: 404 })
    }

    const body = await request.json()

    // Preparar datos de la reparación
    const repairData = {
      organization_id: userProfile.organization_id,
      customer_id: body.customer_id || null,
      device_id: body.device_id || null,
      title: body.title,
      description: body.description,
      problem_description: body.problem_description,
      priority: body.priority || 'medium',
      cost: body.cost || 0,
      internal_notes: body.internal_notes,
      created_by: userProfile.id,
      status: 'received',
      received_date: new Date().toISOString(),
      warranty_days: 30,
      // Campos para clientes no registrados
      unregistered_customer_name: body.unregistered_customer_name || null,
      unregistered_customer_phone: body.unregistered_customer_phone || null,
      unregistered_device_info: body.unregistered_device_info || null
    }

    const { data: repair, error } = await supabase
      .from('repairs')
      .insert(repairData)
      .select()
      .single()

    if (error) {
      console.error('Error creating repair:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      data: repair
    })

  } catch (error) {
    console.error('Error in POST /api/repairs:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
