import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticación
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que sea técnico - CORREGIDO: usar tabla 'users' en lugar de 'user_profiles'
    const { data: userProfile } = await supabase
      .from('users')
      .select('role, id, organization_id')
      .eq('auth_user_id', session.user.id)
      .single()

    if (!userProfile || userProfile.role !== 'technician') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()

    // Validar datos de la venta
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'La venta debe tener al menos un producto' }, { status: 400 })
    }

    if (!body.payment_method) {
      return NextResponse.json({ error: 'Método de pago requerido' }, { status: 400 })
    }

    // Calcular totales - Los precios ya incluyen IGV
    const total = body.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    const subtotal = total / 1.18 // Calcular subtotal sin IGV (total / 1.18)
    const tax_amount = total - subtotal // IGV es la diferencia

    // Crear la venta - CORREGIDO: usar nombres de columnas correctos según el esquema
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        organization_id: userProfile.organization_id,
        customer_id: body.customer_id || null,
        created_by: userProfile.id, // CORREGIDO: usar created_by en lugar de technician_id
        subtotal,
        tax_amount, // CORREGIDO: usar tax_amount en lugar de tax
        total,
        payment_method: body.payment_method,
        notes: body.notes || null
      })
      .select()
      .single()

    if (saleError) {
      console.error('Sale creation error:', saleError)
      throw saleError
    }

    // Crear los items de la venta - CORREGIDO: usar inventory_id en lugar de product_id
    const saleItems = body.items.map((item: any) => ({
      organization_id: userProfile.organization_id,
      sale_id: sale.id,
      inventory_id: item.product_id, // CORREGIDO: usar inventory_id
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity
    }))

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems)

    if (itemsError) {
      console.error('Sale items creation error:', itemsError)
      // Revertir la venta si falla la inserción de items
      await supabase.from('sales').delete().eq('id', sale.id)
      throw itemsError
    }

    // El inventario se actualiza automáticamente mediante el trigger 'trigger_update_inventory_on_sale'
    // que se ejecuta cuando se insertan los sale_items, por lo que no necesitamos hacerlo manualmente aquí

    return NextResponse.json({
      success: true,
      data: {
        sale_id: sale.id,
        total,
        items: body.items.length,
        customer: body.customer_name || 'Cliente de mostrador'
      }
    })

  } catch (error) {
    console.error('Error processing sale:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

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
      .eq('auth_user_id', session.user.id)
      .single()

    if (!userProfile || userProfile.role !== 'technician') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Obtener ventas del técnico - CORREGIDO: usar created_by en lugar de technician_id
    const { data: sales, error: salesError, count } = await supabase
      .from('sales')
      .select(`
        id,
        subtotal,
        tax_amount,
        total,
        payment_method,
        created_at,
        customers (name, phone),
        sale_items (
          quantity,
          unit_price,
          total_price,
          inventory (name, brand, model)
        )
      `, { count: 'exact' })
      .eq('created_by', userProfile.id) // CORREGIDO: usar created_by
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (salesError) {
      console.error('Sales fetch error:', salesError)
      throw salesError
    }

    return NextResponse.json({
      success: true,
      data: sales || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching technician sales:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 