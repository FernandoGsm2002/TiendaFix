import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Inventory API called - getting real data')
    
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    
    // Parámetros de consulta
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || 'todas'
    const stockStatus = searchParams.get('stockStatus') || 'todos'
    
    const offset = (page - 1) * limit

    // Verificar autenticación
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      console.error('❌ Usuario no autenticado:', authError)
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener la organización del usuario
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('auth_user_id', session.user.id)
      .single()

    if (profileError || !userProfile?.organization_id) {
      console.error('❌ Error obteniendo organización del usuario:', profileError)
      return NextResponse.json({ error: 'Organización no encontrada' }, { status: 403 })
    }

    const organizationId = userProfile.organization_id
    console.log('✅ Inventory API - Organization ID:', organizationId)

    try {
      let query = supabase
        .from('inventory')
        .select(`
          id, name, description, category, brand, model,
          stock_quantity, min_stock, unit_cost, enduser_price,
          supplier, sku, location, is_active,
          created_at, updated_at
        `)
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      // Filtrar por categoría si no es 'todas'
      if (category !== 'todas') {
        query = query.eq('category', category)
      }

      // Filtrar por estado de stock
      if (stockStatus === 'bajo') {
        query = query.lte('stock_quantity', supabase.rpc('min_stock'))
      } else if (stockStatus === 'agotado') {
        query = query.eq('stock_quantity', 0)
      } else if (stockStatus === 'disponible') {
        query = query.gt('stock_quantity', 0)
      }

      // Filtrar por búsqueda si se proporciona
      if (search) {
        const searchConditions = [
          `name.ilike.%${search}%`,
          `description.ilike.%${search}%`,
          `brand.ilike.%${search}%`,
          `model.ilike.%${search}%`,
          `sku.ilike.%${search}%`
        ].join(',')

        query = query.or(searchConditions)
      }

      // Obtener datos con paginación
      const { data: inventory, error, count } = await query
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('🚨 Error fetching inventory:', error)
        throw error
      }

      // Calcular estadísticas
      const allInventoryQuery = await supabase
        .from('inventory')
        .select('stock_quantity, min_stock, unit_cost, enduser_price')
        .eq('organization_id', organizationId)
        .eq('is_active', true)

      const allInventory = allInventoryQuery.data || []
      
      const stats = {
        totalItems: allInventory.length,
        stockBajo: allInventory.filter(item => item.stock_quantity <= item.min_stock && item.stock_quantity > 0).length,
        agotados: allInventory.filter(item => item.stock_quantity === 0).length,
        valorTotal: allInventory.reduce((sum, item) => sum + (item.stock_quantity * (item.unit_cost || 0)), 0),
        valorVenta: allInventory.reduce((sum, item) => sum + (item.stock_quantity * (item.enduser_price || 0)), 0)
      }

      console.log(`✅ Fetched ${inventory?.length || 0} inventory items from database`)

      return NextResponse.json({
        success: true,
        data: inventory || [],
        stats,
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
        stats: {
          totalItems: 0,
          stockBajo: 0,
          agotados: 0,
          valorTotal: 0,
          valorVenta: 0
        },
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      })
    }

  } catch (error) {
    console.error('🚨 Inventory API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Creating new inventory item...')
    
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    
    // Verificar autenticación
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      console.error('❌ Usuario no autenticado:', authError)
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener la organización del usuario
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('organization_id, id')
      .eq('auth_user_id', session.user.id)
      .single()

    if (profileError || !userProfile?.organization_id) {
      console.error('❌ Error obteniendo organización del usuario:', profileError)
      return NextResponse.json({ error: 'Organización no encontrada' }, { status: 403 })
    }

    const organizationId = userProfile.organization_id
    console.log('✅ Creating inventory for organization:', organizationId)

    const newItem = {
      organization_id: organizationId,
      name: body.name,
      description: body.description || '',
      category: body.category,
      brand: body.brand || '',
      model: body.model || '',
      stock_quantity: body.stock_quantity || 0,
      min_stock: body.min_stock || 0,
      unit_cost: body.unit_cost || 0,
      enduser_price: body.enduser_price || 0,
      supplier: body.supplier || '',
      sku: body.sku || '',
      location: body.location || '',
      is_active: true,
      created_by: userProfile.id
    }

    const { data: item, error } = await supabase
      .from('inventory')
      .insert(newItem)
      .select()
      .single()

    if (error) {
      console.error('🚨 Error creating inventory item:', error)
      return NextResponse.json(
        { error: 'Error al crear el producto', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Inventory item created successfully:', item.id)

    return NextResponse.json({
      success: true,
      data: item
    })

  } catch (error) {
    console.error('🚨 Create inventory item error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 
