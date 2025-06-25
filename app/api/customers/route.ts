import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Customers API called - getting real data')
    
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    
    // Parámetros de consulta
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || 'todos'
    
    const offset = (page - 1) * limit
    
    // UUID válido de Fernando (organización real)
    const organizationId = '873d8154-8b40-4b8a-8d03-431bf9f697e6'

    try {
      let query = supabase
        .from('customers')
        .select(`
          id, name, email, phone, address, customer_type,
          anonymous_identifier, is_recurrent, notes,
          created_at, updated_at
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      // Filtrar por tipo si no es 'todos'
      if (type !== 'todos') {
        query = query.eq('customer_type', type)
      }

      // Filtrar por búsqueda si se proporciona
      if (search) {
        const searchConditions = [
          `name.ilike.%${search}%`,
          `email.ilike.%${search}%`,
          `phone.ilike.%${search}%`,
          `anonymous_identifier.ilike.%${search}%`
        ].join(',')

        query = query.or(searchConditions)
      }

      // Obtener datos con paginación
      const { data: customers, error, count } = await query
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('🚨 Error fetching customers:', error)
        throw error
      }

      // Obtener estadísticas de reparaciones para cada cliente
      const customersWithStats = await Promise.all(
        (customers || []).map(async (customer) => {
          const { data: repairs, error: repairsError } = await supabase
            .from('repairs')
            .select('id, status, final_cost, estimated_cost')
            .eq('customer_id', customer.id)
            .eq('organization_id', organizationId)

          if (repairsError) {
            console.warn(`Error fetching repairs for customer ${customer.id}:`, repairsError)
          }

          const repairsList = repairs || []
          const totalSpent = repairsList
            .filter(r => r.final_cost)
            .reduce((sum, r) => sum + (r.final_cost || 0), 0)

          return {
            ...customer,
            stats: {
              totalReparaciones: repairsList.length,
              pendientes: repairsList.filter(r => r.status === 'received').length,
              completadas: repairsList.filter(r => r.status === 'completed').length,
              entregadas: repairsList.filter(r => r.status === 'delivered').length,
              totalGastado: totalSpent
            }
          }
        })
      )

      console.log(`✅ Fetched ${customers?.length || 0} customers from database`)

      return NextResponse.json({
        success: true,
        data: customersWithStats,
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
          limit: 12,
          total: 0,
          totalPages: 0
        }
      })
    }

  } catch (error) {
    console.error('🚨 Customers API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Creating new customer...')
    
    const supabase = createServerClient()
    const body = await request.json()
    
    // UUID válido de Fernando (organización real)
    const organizationId = '873d8154-8b40-4b8a-8d03-431bf9f697e6'

    // Validar tipo de cliente
    if (!['identified', 'anonymous'].includes(body.customer_type)) {
      return NextResponse.json(
        { error: 'Tipo de cliente inválido' },
        { status: 400 }
      )
    }

    const newCustomer = {
      organization_id: organizationId,
      customer_type: body.customer_type,
      name: body.name || null,
      email: body.email || null,
      phone: body.phone || null,
      address: body.address || null,
      anonymous_identifier: body.anonymous_identifier || null,
      is_recurrent: body.is_recurrent || false,
      notes: body.notes || null
    }

    // Validaciones específicas por tipo
    if (body.customer_type === 'identified') {
      if (!body.name || !body.phone) {
        return NextResponse.json(
          { error: 'Nombre y teléfono son obligatorios para clientes identificados' },
          { status: 400 }
        )
      }
    } else if (body.customer_type === 'anonymous') {
      if (!body.anonymous_identifier) {
        return NextResponse.json(
          { error: 'Identificador anónimo es obligatorio para clientes anónimos' },
          { status: 400 }
        )
      }
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .insert(newCustomer)
      .select()
      .single()

    if (error) {
      console.error('🚨 Error creating customer:', error)
      return NextResponse.json(
        { error: 'Error al crear el cliente', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Customer created successfully:', customer.id)

    return NextResponse.json({
      success: true,
      data: customer
    })

  } catch (error) {
    console.error('🚨 Create customer error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
