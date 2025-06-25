import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// GET - Obtener producto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔧 Getting inventory item by ID:', params.id)
    
    const supabase = createServerClient()
    const itemId = params.id
    const organizationId = '873d8154-8b40-4b8a-8d03-431bf9f697e6'

    const { data: item, error } = await supabase
      .from('inventory')
      .select(`
        id, name, description, category, brand, model,
        stock_quantity, min_stock, unit_cost, enduser_price,
        supplier, sku, location, is_active,
        created_at, updated_at
      `)
      .eq('id', itemId)
      .eq('organization_id', organizationId)
      .single()

    if (error) {
      console.error('🚨 Error fetching inventory item:', error)
      return NextResponse.json(
        { error: 'Producto no encontrado', details: error.message },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: item
    })

  } catch (error) {
    console.error('🚨 Get inventory item error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar producto
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔧 Updating inventory item:', params.id)
    
    const supabase = createServerClient()
    const body = await request.json()
    const itemId = params.id
    const organizationId = '873d8154-8b40-4b8a-8d03-431bf9f697e6'

    // Validaciones básicas
    if (!body.name || !body.category) {
      return NextResponse.json(
        { error: 'Nombre y categoría son obligatorios' },
        { status: 400 }
      )
    }

    const updateData = {
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
      is_active: body.is_active !== undefined ? body.is_active : true,
      updated_at: new Date().toISOString()
    }

    const { data: item, error } = await supabase
      .from('inventory')
      .update(updateData)
      .eq('id', itemId)
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) {
      console.error('🚨 Error updating inventory item:', error)
      return NextResponse.json(
        { error: 'Error al actualizar el producto', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Inventory item updated successfully:', item.id)

    return NextResponse.json({
      success: true,
      data: item
    })

  } catch (error) {
    console.error('🚨 Update inventory item error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar producto
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔧 Deleting inventory item:', params.id)
    
    const supabase = createServerClient()
    const itemId = params.id
    const organizationId = '873d8154-8b40-4b8a-8d03-431bf9f697e6'

    // Verificar si el producto tiene ventas asociadas
    const { data: sales } = await supabase
      .from('sale_items')
      .select('id')
      .eq('inventory_id', itemId)
      .limit(1)

    if (sales && sales.length > 0) {
      // En lugar de eliminar, marcar como inactivo
      const { data: item, error } = await supabase
        .from('inventory')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .eq('organization_id', organizationId)
        .select()
        .single()

      if (error) {
        console.error('🚨 Error deactivating inventory item:', error)
        return NextResponse.json(
          { error: 'Error al desactivar el producto', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Producto desactivado correctamente (tiene ventas asociadas)',
        data: item
      })
    }

    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', itemId)
      .eq('organization_id', organizationId)

    if (error) {
      console.error('🚨 Error deleting inventory item:', error)
      return NextResponse.json(
        { error: 'Error al eliminar el producto', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Inventory item deleted successfully:', itemId)

    return NextResponse.json({
      success: true,
      message: 'Producto eliminado correctamente'
    })

  } catch (error) {
    console.error('🚨 Delete inventory item error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 