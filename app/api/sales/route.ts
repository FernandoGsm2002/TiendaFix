import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Sales API called - getting real data')
    
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { searchParams } = new URL(request.url)
    
    // Parámetros de consulta
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const paymentMethod = searchParams.get('payment_method')
    
    const offset = (page - 1) * limit

    // Obtener el usuario autenticado y su organización
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('❌ Usuario no autenticado:', authError)
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener la organización del usuario
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('auth_user_id', user.id)
      .single()

    if (profileError || !userProfile?.organization_id) {
      console.error('❌ Error obteniendo organización del usuario:', profileError)
      return NextResponse.json({ error: 'Organización no encontrada' }, { status: 403 })
    }

    const organizationId = userProfile.organization_id
    console.log('✅ Sales API - Organization ID:', organizationId)

    try {
      let query = supabase
        .from('sales')
        .select(`
          id, total, payment_method, notes, created_at,
          sale_type,
          updated_at,
          customers(id, name, email, phone, anonymous_identifier, customer_type),
          users!sales_created_by_fkey(id, name, email),
          sale_items(
            id, quantity, unit_price, total_price,
            inventory(id, name, category, brand, model)
          )
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      // Filtrar por método de pago
      if (paymentMethod && paymentMethod !== 'todos') {
        query = query.eq('payment_method', paymentMethod)
      }

      // Filtrar por rango de fechas
      if (dateFrom) {
        query = query.gte('created_at', dateFrom)
      }
      if (dateTo) {
        query = query.lte('created_at', dateTo)
      }

      // Filtrar por búsqueda si se proporciona
      if (search) {
        query = query.or(`
          customers.name.ilike.%${search}%,
          customers.email.ilike.%${search}%,
          customers.anonymous_identifier.ilike.%${search}%,
          payment_method.ilike.%${search}%,
          notes.ilike.%${search}%
        `)
      }

      // Obtener datos con paginación
      const { data: sales, error, count } = await query
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('🚨 Error fetching sales:', error)
        throw error
      }

      // Procesar datos para incluir información adicional
      const processedSales = (sales || []).map((sale: any) => ({
        ...sale,
        customer: sale.customers ? {
          id: sale.customers.id,
          name: sale.customers.name || sale.customers.anonymous_identifier || 'Cliente Anónimo',
          type: sale.customers.customer_type,
          email: sale.customers.email,
          phone: sale.customers.phone
        } : null,
        seller: sale.users ? {
          id: sale.users.id,
          name: sale.users.name,
          email: sale.users.email
        } : null,
        items: (sale.sale_items || []).map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          product: item.inventory ? {
            id: item.inventory.id,
            name: item.inventory.name,
            category: item.inventory.category,
            brand: item.inventory.brand,
            model: item.inventory.model
          } : null
        })),
        totalItems: (sale.sale_items || []).reduce((sum: number, item: any) => sum + item.quantity, 0)
      }))

      console.log(`✅ Fetched ${sales?.length || 0} sales from database`)

      return NextResponse.json({
        success: true,
        data: processedSales,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      })

    } catch (dbError) {
      console.error('🚨 Database query error:', dbError)
      
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
    console.error('🚨 Sales API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Creating new sale...')
    
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set: (name: string, value: string, options: any) => {
            cookieStore.set({ name, value, ...options })
          },
          remove: (name: string, options: any) => {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const body = await request.json()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Buscar el perfil del usuario en la tabla 'users' de la aplicación
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, organization_id')
      .eq('auth_user_id', user.id)
      .single()

    if (profileError || !userProfile) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json({ error: 'User profile not found in the application.' }, { status: 404 })
    }
    
    const organizationId = userProfile.organization_id;

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Debe incluir al menos un producto' },
        { status: 400 }
      )
    }

    if (!body.payment_method) {
      return NextResponse.json(
        { error: 'Método de pago es obligatorio' },
        { status: 400 }
      )
    }

    try {
      let customerId = null
      if (body.customer_id && body.customer_id !== 'general' && body.customer_id !== '') {
        customerId = body.customer_id
      }

      const newSale = {
        organization_id: organizationId,
        customer_id: customerId,
        created_by: userProfile.id,
        sale_type: 'product',
        subtotal: body.total,
        tax_amount: 0,
        discount_amount: 0,
        total: body.total,
        payment_method: body.payment_method,
        payment_status: 'paid',
        notes: body.notes || null
      }

      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert(newSale)
        .select()
        .single()

      if (saleError) {
        console.error('🚨 Error creating sale:', saleError)
        throw saleError
      }

      const saleItems = body.items
        .filter((item: any) => item.inventory_id)
        .map((item: any) => ({
          organization_id: organizationId,
          sale_id: sale.id,
          inventory_id: item.inventory_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price
        }))

      if (saleItems.length > 0) {
        const { data: createdItems, error: itemsError } = await supabase
          .from('sale_items')
          .insert(saleItems)
          .select()

        if (itemsError) {
          console.error('🚨 Error creating sale items:', itemsError)
          await supabase.from('sales').delete().eq('id', sale.id)
          throw itemsError
        }
      }

      console.log('✅ Sale created successfully:', sale.id)

      return NextResponse.json({ success: true, data: sale })

    } catch (transactionError) {
      console.error('🚨 Transaction error:', transactionError)
      return NextResponse.json(
        { error: 'Error al procesar la venta', details: transactionError instanceof Error ? transactionError.message : 'Unknown error' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('🚨 Create sale error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 
