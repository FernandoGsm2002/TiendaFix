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
    
    logApiCall('Customers', organizationId, { 
      userRole: userProfile.role,
      userId: userProfile.id 
    })

    // 2. Extraer parámetros de consulta
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const search = searchParams.get('search')
    const customerType = searchParams.get('customer_type')
    const offset = (page - 1) * limit

    // 3. Construir query optimizada
    let query = supabase
      .from('customers')
      .select(`
        id,
        name,
        phone,
        email,
        address,
        anonymous_identifier,
        customer_type,
        created_at,
        updated_at
      `, { count: 'exact' })
      .eq('organization_id', organizationId)

    // 4. Aplicar filtros
    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (customerType && customerType !== 'todos' && customerType !== 'recurrent') {
      query = query.eq('customer_type', customerType)
    }

    // 5. Ejecutar query con paginación
    const { data: customers, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('❌ Database error:', error)
      throw error
    }

    console.log(`✅ Fetched ${customers?.length || 0} customers from database`)

    // 6. Calcular estadísticas por cliente
    const customersWithStats = await Promise.all(
      (customers || []).map(async (customer: any) => {
        try {
          // Calcular estadísticas de reparaciones
          const { data: repairs, error: repairsError } = await supabase
            .from('repairs')
            .select('cost')
            .eq('customer_id', customer.id)
            .eq('organization_id', organizationId)

          // Calcular estadísticas de desbloqueos
          const { data: unlocks, error: unlocksError } = await supabase
            .from('unlocks')
            .select('cost')
            .eq('customer_id', customer.id)
            .eq('organization_id', organizationId)

          // Calcular estadísticas de ventas
          const { data: sales, error: salesError } = await supabase
            .from('sales')
            .select('total')
            .eq('customer_id', customer.id)
            .eq('organization_id', organizationId)

          // Log para debugging
          console.log(`📊 Customer ${customer.id} data:`, {
            repairs: repairs?.length || 0,
            unlocks: unlocks?.length || 0,
            sales: sales?.length || 0,
            repairsData: repairs,
            unlocksData: unlocks,
            salesData: sales,
            errors: { repairsError, unlocksError, salesError }
          })

          // Calcular totales
          const totalGastadoReparaciones = repairs?.reduce((sum: number, repair: any) => sum + (repair.cost || 0), 0) || 0
          const totalGastadoDesbloqueos = unlocks?.reduce((sum: number, unlock: any) => sum + (unlock.cost || 0), 0) || 0
          const totalGastadoVentas = sales?.reduce((sum: number, sale: any) => sum + (sale.total || 0), 0) || 0
          
          const totalGastado = totalGastadoReparaciones + totalGastadoDesbloqueos + totalGastadoVentas
          const totalReparaciones = (repairs?.length || 0) + (unlocks?.length || 0) + (sales?.length || 0)

          // Log de totales calculados
          console.log(`💰 Customer ${customer.id} totals:`, {
            totalGastadoReparaciones,
            totalGastadoDesbloqueos,
            totalGastadoVentas,
            totalGastado,
            totalReparaciones
          })

          // Determinar si es cliente recurrente (más de 2 servicios)
          const isRecurrent = totalReparaciones > 2

          return {
            ...customer,
            is_recurrent: isRecurrent,
            stats: {
              totalGastado,
              totalReparaciones,
              reparaciones: repairs?.length || 0,
              desbloqueos: unlocks?.length || 0,
              ventas: sales?.length || 0
            }
          }
        } catch (statsError) {
          console.error(`❌ Error calculating stats for customer ${customer.id}:`, statsError)
          return {
            ...customer,
            is_recurrent: false,
            stats: {
              totalGastado: 0,
              totalReparaciones: 0,
              reparaciones: 0,
              desbloqueos: 0,
              ventas: 0
            }
          }
        }
      })
    )

    // 7. Filtrar clientes recurrentes si es necesario
    let finalCustomers = customersWithStats
    if (customerType === 'recurrent') {
      finalCustomers = customersWithStats.filter(c => c.is_recurrent)
    }

    // 8. Calcular estadísticas generales
    const { data: statsData } = await supabase
      .from('customers')
      .select('customer_type')
      .eq('organization_id', organizationId)

    const recurrentCount = customersWithStats.filter(c => c.is_recurrent).length

    const stats = {
      total: count || 0,
      registered: statsData?.filter((c: { customer_type: string }) => c.customer_type === 'identified').length || 0,
      anonymous: statsData?.filter((c: { customer_type: string }) => c.customer_type === 'anonymous').length || 0,
      recurrent: recurrentCount
    }

    console.log('📊 Customer stats calculated:', stats)

    return NextResponse.json({
      success: true,
      data: finalCustomers,
      pagination: {
        page,
        limit,
        total: customerType === 'recurrent' ? finalCustomers.length : (count || 0),
        totalPages: Math.ceil((customerType === 'recurrent' ? finalCustomers.length : (count || 0)) / limit)
      },
      stats
    })

  } catch (error) {
    console.error('🚨 Customers API error:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  
  try {
    const validation = await validateMultiTenantAccess(cookieStore)
    
    if (!validation.success) {
      return validation.response
    }

    const { userProfile, organizationId, supabase } = validation.context
    
    logApiCall('Customers POST', organizationId, { 
      userRole: userProfile.role,
      userId: userProfile.id 
    })

    const body = await request.json()

    // Crear customer con organización
    const customerData = {
      ...body,
      organization_id: organizationId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .insert(customerData)
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating customer:', error)
      throw error
    }

    console.log('✅ Customer created successfully:', customer.id)

    return NextResponse.json({
      success: true,
      data: customer
    })

  } catch (error) {
    console.error('🚨 Customers POST error:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
