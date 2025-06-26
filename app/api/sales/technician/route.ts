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

    // Verificar que sea técnico
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role, id, organization_id')
      .eq('user_id', session.user.id)
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

    // Calcular totales
    const subtotal = body.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    const tax = subtotal * 0.18 // IGV 18%
    const total = subtotal + tax

    // Crear la venta
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        organization_id: userProfile.organization_id,
        customer_id: body.customer_id || null,
        technician_id: userProfile.id,
        subtotal,
        tax,
        total,
        payment_method: body.payment_method,
        notes: body.notes || null,
        created_by: userProfile.id
      })
      .select()
      .single()

    if (saleError) {
      throw saleError
    }

    // Crear los items de la venta
    const saleItems = body.items.map((item: any) => ({
      sale_id: sale.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity
    }))

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems)

    if (itemsError) {
      // Revertir la venta si falla la inserción de items
      await supabase.from('sales').delete().eq('id', sale.id)
      throw itemsError
    }

    // Actualizar el inventario (reducir stock)
    for (const item of body.items) {
      const { error: inventoryError } = await supabase
        .from('inventory')
        .update({ 
          stock: supabase.sql`stock - ${item.quantity}` 
        })
        .eq('id', item.product_id)
        .gte('stock', item.quantity) // Solo actualizar si hay suficiente stock

      if (inventoryError) {
        console.error('Error updating inventory:', inventoryError)
        // No fallar la venta por errores de inventario, solo loggear
      }
    }

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

    // Verificar que sea técnico
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role, id, organization_id')
      .eq('user_id', session.user.id)
      .single()

    if (!userProfile || userProfile.role !== 'technician') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Obtener ventas del técnico
    const { data: sales, error: salesError, count } = await supabase
      .from('sales')
      .select(`
        id,
        subtotal,
        tax,
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
      .eq('technician_id', userProfile.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (salesError) {
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