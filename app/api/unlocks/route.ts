import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateMultiTenantAccess, logApiCall } from '@/lib/utils/multi-tenant'

export const dynamic = 'force-dynamic'

// GET - Obtener desbloqueos
export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  
  try {
    // 1. Validar acceso multi-tenant
    const validation = await validateMultiTenantAccess(cookieStore)
    
    if (!validation.success) {
      return validation.response
    }

    const { userProfile, organizationId, supabase } = validation.context
    
    logApiCall('Unlocks', organizationId, { 
      userRole: userProfile.role,
      userId: userProfile.id 
    })

    // 2. Extraer parámetros de consulta
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12')))
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const unlockType = searchParams.get('unlock_type')
    const offset = (page - 1) * limit

    // 3. Construir query optimizada
    let query = supabase
      .from('unlocks')
      .select(`
        id,
        unlock_type,
        brand,
        model,
        imei,
        serial_number,
        status,
        cost,
        provider,
        provider_order_id,
        completion_time,
        notes,
        created_at,
        updated_at,
        customers!left (
          id,
          name,
          phone,
          email,
          anonymous_identifier,
          customer_type
        ),
        users!unlocks_created_by_fkey (
          id,
          name,
          email
        )
      `, { count: 'exact' })
      .eq('organization_id', organizationId)

    // 4. Aplicar filtros por rol
    if (userProfile.role === 'technician') {
      query = query.eq('created_by', userProfile.id)
    }

    // 5. Aplicar filtros adicionales
    if (status && status !== 'todos') {
      query = query.eq('status', status)
    }

    if (unlockType && unlockType !== 'todos') {
      query = query.eq('unlock_type', unlockType)
    }

    if (search) {
      query = query.or(`brand.ilike.%${search}%,model.ilike.%${search}%,imei.ilike.%${search}%,serial_number.ilike.%${search}%`)
    }

    // 6. Ejecutar query con paginación
    const { data: unlocks, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('❌ Database error:', error)
      throw error
    }

    console.log(`✅ Fetched ${unlocks?.length || 0} unlocks from database`)

    // 7. Calcular estadísticas
    const { data: statsData } = await supabase
      .from('unlocks')
      .select('status, cost')
      .eq('organization_id', organizationId)

    const stats = {
      total: count || 0,
      pending: statsData?.filter((u: any) => u.status === 'pending').length || 0,
      in_progress: statsData?.filter((u: any) => u.status === 'in_progress').length || 0,
      completed: statsData?.filter((u: any) => u.status === 'completed').length || 0,
      totalRevenue: statsData?.filter((u: any) => u.status === 'completed').reduce((sum: number, u: any) => sum + (u.cost || 0), 0) || 0
    }

    // 8. Serializar datos de forma segura
    const serializedUnlocks = unlocks?.map((unlock: any) => ({
      id: unlock.id,
      unlock_type: unlock.unlock_type,
      brand: unlock.brand,
      model: unlock.model,
      imei: unlock.imei,
      serial_number: unlock.serial_number,
      status: unlock.status,
      cost: unlock.cost ? parseFloat(unlock.cost.toString()) : 0,
      provider: unlock.provider,
      provider_order_id: unlock.provider_order_id,
      completion_time: unlock.completion_time,
      notes: unlock.notes,
      created_at: unlock.created_at,
      updated_at: unlock.updated_at,
      customer: unlock.customers ? {
        id: unlock.customers.id,
        name: unlock.customers.name,
        phone: unlock.customers.phone,
        email: unlock.customers.email,
        anonymous_identifier: unlock.customers.anonymous_identifier,
        customer_type: unlock.customers.customer_type
      } : null,
      technician: unlock.users ? {
        id: unlock.users.id,
        name: unlock.users.name,
        email: unlock.users.email
      } : null
    })) || []

    return NextResponse.json({
      success: true,
      data: serializedUnlocks,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      stats
    })

  } catch (error) {
    console.error('🚨 Unlocks API error:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo desbloqueo
export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  
  try {
    const validation = await validateMultiTenantAccess(cookieStore)
    
    if (!validation.success) {
      return validation.response
    }

    const { userProfile, organizationId, supabase } = validation.context
    
    logApiCall('Unlocks POST', organizationId, { 
      userRole: userProfile.role,
      userId: userProfile.id 
    })

    const body = await request.json()

    // Validaciones corregidas - customer_id puede ser null para cliente general
    if (!body.unlock_type || !body.brand || !body.model || body.cost === undefined) {
      return NextResponse.json(
        { error: 'Campos obligatorios: unlock_type, brand, model, cost' },
        { status: 400 }
      )
    }

    // Validar que el customer existe si se proporciona
    if (body.customer_id && body.customer_id !== 'general') {
      const { data: customer } = await supabase
        .from('customers')
        .select('organization_id')
        .eq('id', body.customer_id)
        .single()
      
      if (!customer || customer.organization_id !== organizationId) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }
    }

    // Crear unlock con organización
    const unlockData = {
      organization_id: organizationId,
      customer_id: body.customer_id === 'general' ? null : body.customer_id,
      created_by: userProfile.id,
      unlock_type: body.unlock_type,
      brand: body.brand,
      model: body.model,
      imei: body.imei || null,
      serial_number: body.serial_number || null,
      status: body.status || 'pending',
      cost: parseFloat(body.cost.toString()) || 0,
      provider: body.provider || null,
      notes: body.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: unlock, error } = await supabase
      .from('unlocks')
      .insert(unlockData)
      .select(`
        id,
        unlock_type,
        brand,
        model,
        imei,
        serial_number,
        status,
        cost,
        provider,
        completion_time,
        notes,
        created_at,
        updated_at,
        customers!left (
          id,
          name,
          phone,
          email
        ),
        users!unlocks_created_by_fkey (
          id,
          name,
          email
        )
      `)
      .single()

    if (error) {
      console.error('❌ Error creating unlock:', error)
      throw error
    }

    console.log('✅ Unlock created successfully:', unlock.id)

    return NextResponse.json({
      success: true,
      data: unlock
    })

  } catch (error) {
    console.error('🚨 Unlocks POST error:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
