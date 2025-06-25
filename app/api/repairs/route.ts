import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Repairs API called - getting real data')
    
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    
    // Parámetros de consulta
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'todos'
    
    const offset = (page - 1) * limit
    const organizationId = '873d8154-8b40-4b8a-8d03-431bf9f697e6' // ID fijo para pruebas

    try {
      let query = supabase
        .from('repairs_view')
        .select(`*`, { count: 'exact' })
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      // Filtrar por estado si no es 'todos'
      if (status !== 'todos') {
        query = query.eq('status', status)
      }

      // Filtrar por búsqueda si se proporciona
      if (search) {
        const searchConditions = [
          `title.ilike.%${search}%`,
          `problem_description.ilike.%${search}%`,
          `customer_name.ilike.%${search}%`,
          `customer_anonymous_identifier.ilike.%${search}%`,
          `device_brand.ilike.%${search}%`,
          `device_model.ilike.%${search}%`,
          `device_imei.ilike.%${search}%`
        ].join(',')
        
        query = query.or(searchConditions)
      }

      // Obtener datos con paginación
      const { data: flatRepairs, error, count } = await query
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('🚨 Error fetching repairs:', error)
        throw error
      }
      
      const repairs = flatRepairs.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        problem_description: r.problem_description,
        solution_description: r.solution_description,
        status: r.status,
        priority: r.priority,
        estimated_cost: r.estimated_cost,
        final_cost: r.final_cost,
        estimated_completion_date: r.estimated_completion_date,
        actual_completion_date: r.actual_completion_date,
        received_date: r.received_date,
        delivered_date: r.delivered_date,
        warranty_days: r.warranty_days,
        internal_notes: r.internal_notes,
        customer_notes: r.customer_notes,
        created_at: r.created_at,
        updated_at: r.updated_at,
        customers: {
          id: r.customer_id,
          name: r.customer_name,
          email: r.customer_email,
          phone: r.customer_phone,
          anonymous_identifier: r.customer_anonymous_identifier,
          customer_type: r.customer_type,
        },
        devices: {
          id: r.device_id,
          brand: r.device_brand,
          model: r.device_model,
          device_type: r.device_type,
          serial_number: r.device_serial_number,
          imei: r.device_imei,
          color: r.device_color,
        },
        users: {
          id: r.created_by,
          name: r.created_by_name,
          email: r.created_by_email,
        }
      }));

      // Obtener estadísticas
      const statusCounts = [
        supabase.from('repairs').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('status', 'received'),
        supabase.from('repairs').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('status', 'diagnosed'),
        supabase.from('repairs').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('status', 'in_progress'),
        supabase.from('repairs').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('status', 'completed'),
        supabase.from('repairs').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('status', 'delivered'),
        supabase.from('repairs').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('status', 'cancelled')
      ];
      
      const [
        received,
        diagnosed,
        inProgress,
        completed,
        delivered,
        cancelled
      ] = await Promise.all(statusCounts);

      const stats = {
        total: count || 0,
        received: received.count || 0,
        diagnosed: diagnosed.count || 0,
        inProgress: inProgress.count || 0,
        completed: completed.count || 0,
        delivered: delivered.count || 0,
        cancelled: cancelled.count || 0
      }

      console.log(`✅ Fetched ${repairs?.length || 0} repairs from database`)

      return NextResponse.json({
        success: true,
        data: repairs || [],
        stats: stats,
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
    console.error('🚨 Repairs API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Creating new repair...')
    
    const supabase = createServerClient()
    const body = await request.json()
    
    console.log('📋 Repair request body:', body)
    
    const organizationId = '873d8154-8b40-4b8a-8d03-431bf9f697e6' // ID fijo para pruebas
    const createdById = 'a06654c1-d078-404d-bfec-72c883079a41' // Fernando's user ID

    // Validaciones
    if (!body.title || !body.problem_description) {
      return NextResponse.json(
        { error: 'Título y descripción del problema son obligatorios' },
        { status: 400 }
      )
    }

    // Validar si es cliente registrado o no
    if (!body.customer_id && !body.unregistered_customer_name) {
      return NextResponse.json(
        { error: 'Debe proporcionar un cliente registrado o los datos de un cliente no registrado.' },
        { status: 400 }
      )
    }

    const newRepair = {
      organization_id: organizationId,
      customer_id: body.customer_id || null,
      device_id: body.device_id || null,
      assigned_technician_id: null,
      created_by: createdById,
      title: body.title,
      description: body.description || '',
      problem_description: body.problem_description,
      status: 'received',
      priority: body.priority || 'medium',
      estimated_cost: body.estimated_cost || 0,
      received_date: new Date().toISOString(),
      warranty_days: 90,
      internal_notes: body.internal_notes || null,
      // Campos para no registrados
      unregistered_customer_name: body.unregistered_customer_name || null,
      unregistered_customer_phone: body.unregistered_customer_phone || null,
      unregistered_device_info: body.unregistered_device_info || null,
    }

    console.log('📝 Repair data to insert:', newRepair)

    const { data: repair, error } = await supabase
      .from('repairs')
      .insert(newRepair)
      .select()
      .single()

    if (error) {
      console.error('🚨 Error creating repair:', error)
      console.error('🚨 Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json(
        { error: 'Error al crear la reparación', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Repair created successfully:', repair.id)

    return NextResponse.json({
      success: true,
      data: repair
    })

  } catch (error) {
    console.error('🚨 Create repair error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
