import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateMultiTenantAccess, logApiCall } from '@/lib/utils/multi-tenant'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  
  try {
    // 1. Validar acceso multi-tenant
    const validation = await validateMultiTenantAccess(cookieStore)
    
    if (!validation.success) {
      return validation.response
    }

    const { userProfile, organizationId, supabase } = validation.context
    
    logApiCall('Repairs', organizationId, { 
      userRole: userProfile.role,
      userId: userProfile.id 
    })

    // 2. Extraer parámetros de consulta
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const offset = (page - 1) * limit

    console.log('📅 Date filters received:', { startDate, endDate })

    // 3. Construir query base optimizada usando la vista
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
        customer_name,
        customer_email,
        customer_phone,
        customer_anonymous_identifier,
        customer_type,
        device_brand,
        device_model,
        device_type,
        device_color,
        device_imei,
        device_serial_number,
        created_by_name,
        created_by_email
      `, { count: 'exact' })

    // 4. Aplicar filtros de organización y rol
    query = query.eq('organization_id', organizationId)

    // Técnicos solo ven SUS reparaciones
    if (userProfile.role === 'technician') {
      console.log('🔍 Filtering repairs for technician:', userProfile.id)
      query = query.eq('created_by', userProfile.id)
    }

    // 5. Aplicar filtros adicionales
    if (status && status !== 'todos') {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,problem_description.ilike.%${search}%,customer_name.ilike.%${search}%,unregistered_customer_name.ilike.%${search}%,device_brand.ilike.%${search}%,device_model.ilike.%${search}%,unregistered_device_info.ilike.%${search}%,status.ilike.%${search}%`)
    }

    // Filtros de fecha
    if (startDate) {
      console.log('🗓️ Applying start date filter:', startDate)
      query = query.gte('created_at', `${startDate}T00:00:00.000Z`)
    }

    if (endDate) {
      console.log('🗓️ Applying end date filter:', endDate)
      query = query.lte('created_at', `${endDate}T23:59:59.999Z`)
    }

    // 6. Ejecutar query con paginación
    const { data: repairs, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('❌ Database error:', error)
      throw error
    }

    console.log(`✅ Fetched ${repairs?.length || 0} repairs from database`)

    // 7. Calcular estadísticas de forma paralela
    let statsQuery = supabase
      .from('repairs_view')
      .select('status')
      .eq('organization_id', organizationId)

    // Filtrar estadísticas por técnico si aplica
    if (userProfile.role === 'technician') {
      statsQuery = statsQuery.eq('created_by', userProfile.id)
    }

    // Aplicar filtros de fecha a las estadísticas
    if (startDate) {
      statsQuery = statsQuery.gte('created_at', `${startDate}T00:00:00.000Z`)
    }

    if (endDate) {
      statsQuery = statsQuery.lte('created_at', `${endDate}T23:59:59.999Z`)
    }

    // Aplicar filtro de estado a las estadísticas
    if (status && status !== 'todos') {
      statsQuery = statsQuery.eq('status', status)
    }

    const { data: statsData, error: statsError } = await statsQuery

    // 8. Procesar estadísticas de forma segura
    const stats = {
      total: count || 0,
      received: 0,
      diagnosed: 0,
      inProgress: 0,
      completed: 0,
      delivered: 0,
      cancelled: 0,
    }

    if (!statsError && statsData) {
      statsData.forEach((repair: { status: string }) => {
        switch (repair.status) {
          case 'received': stats.received++; break
          case 'diagnosed': stats.diagnosed++; break
          case 'in_progress': stats.inProgress++; break
          case 'completed': stats.completed++; break
          case 'delivered': stats.delivered++; break
          case 'cancelled': stats.cancelled++; break
        }
      })
    }

    console.log('📊 Stats calculated:', stats)

    // 9. Serializar datos de forma segura usando la vista
    const serializedRepairs = repairs?.map((repair: any) => ({
      id: repair.id,
      title: repair.title,
      description: repair.description,
      problem_description: repair.problem_description,
      solution_description: repair.solution_description,
      status: repair.status,
      priority: repair.priority,
      cost: repair.cost ? parseFloat(repair.cost.toString()) : null,
      estimated_completion_date: repair.estimated_completion_date,
      actual_completion_date: repair.actual_completion_date,
      received_date: repair.received_date,
      delivered_date: repair.delivered_date,
      warranty_days: repair.warranty_days,
      internal_notes: repair.internal_notes,
      customer_notes: repair.customer_notes,
      created_at: repair.created_at,
      updated_at: repair.updated_at,
      unregistered_customer_name: repair.unregistered_customer_name,
      unregistered_customer_phone: repair.unregistered_customer_phone,
      unregistered_device_info: repair.unregistered_device_info,
      customers: repair.customer_name ? {
        id: repair.customer_id,
        name: repair.customer_name,
        phone: repair.customer_phone,
        email: repair.customer_email,
        anonymous_identifier: repair.customer_anonymous_identifier,
        customer_type: repair.customer_type
      } : null,
      devices: repair.device_brand ? {
        id: repair.device_id,
        brand: repair.device_brand,
        model: repair.device_model,
        device_type: repair.device_type,
        color: repair.device_color,
        serial_number: repair.device_serial_number,
        imei: repair.device_imei
      } : null,
      technician: repair.created_by_name ? {
        id: repair.created_by,
        name: repair.created_by_name,
        email: repair.created_by_email
      } : null
    })) || []

    return NextResponse.json({
      success: true,
      data: serializedRepairs,
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
      { 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST method remains similar but with multi-tenant validation
export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  
  try {
    const validation = await validateMultiTenantAccess(cookieStore)
    
    if (!validation.success) {
      return validation.response
    }

    const { userProfile, organizationId, supabase } = validation.context
    
    logApiCall('Repairs POST', organizationId, { 
      userRole: userProfile.role,
      userId: userProfile.id 
    })

    const body = await request.json()

    // Validar que los datos pertenecen a la organización
    if (body.customer_id) {
      const { data: customer } = await supabase
        .from('customers')
        .select('organization_id')
        .eq('id', body.customer_id)
        .single()
      
      if (!customer || customer.organization_id !== organizationId) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }
    }

    if (body.device_id) {
      const { data: device } = await supabase
        .from('devices')
        .select('organization_id')
        .eq('id', body.device_id)
        .single()
      
      if (!device || device.organization_id !== organizationId) {
        return NextResponse.json({ error: 'Device not found' }, { status: 404 })
      }
    }

    // Crear reparación con organización
    const repairData = {
      ...body,
      organization_id: organizationId,
      created_by: userProfile.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: repair, error } = await supabase
      .from('repairs')
      .insert(repairData)
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating repair:', error)
      throw error
    }

    console.log('✅ Repair created successfully:', repair.id)

    return NextResponse.json({
      success: true,
      data: repair
    })

  } catch (error) {
    console.error('🚨 Repairs POST error:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
