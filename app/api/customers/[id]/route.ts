import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// GET - Obtener cliente por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔧 Getting customer by ID:', params.id)
    
    const supabase = createServerClient()
    const customerId = params.id
    const organizationId = '873d8154-8b40-4b8a-8d03-431bf9f697e6'

    const { data: customer, error } = await supabase
      .from('customers')
      .select(`
        id, name, email, phone, address, customer_type,
        anonymous_identifier, is_recurrent, notes,
        created_at, updated_at
      `)
      .eq('id', customerId)
      .eq('organization_id', organizationId)
      .single()

    if (error) {
      console.error('🚨 Error fetching customer:', error)
      return NextResponse.json(
        { error: 'Cliente no encontrado', details: error.message },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: customer
    })

  } catch (error) {
    console.error('🚨 Get customer error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar cliente
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔧 Updating customer:', params.id)
    
    const supabase = createServerClient()
    const body = await request.json()
    const customerId = params.id
    const organizationId = '873d8154-8b40-4b8a-8d03-431bf9f697e6'

    // Validaciones
    if (body.customer_type && !['identified', 'anonymous'].includes(body.customer_type)) {
      return NextResponse.json(
        { error: 'Tipo de cliente inválido' },
        { status: 400 }
      )
    }

    const updateData = {
      name: body.name || null,
      email: body.email || null,
      phone: body.phone || null,
      address: body.address || null,
      customer_type: body.customer_type,
      anonymous_identifier: body.anonymous_identifier || null,
      is_recurrent: body.is_recurrent || false,
      notes: body.notes || null,
      updated_at: new Date().toISOString()
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', customerId)
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) {
      console.error('🚨 Error updating customer:', error)
      return NextResponse.json(
        { error: 'Error al actualizar el cliente', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Customer updated successfully:', customer.id)

    return NextResponse.json({
      success: true,
      data: customer
    })

  } catch (error) {
    console.error('🚨 Update customer error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar cliente
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔧 Deleting customer:', params.id)
    
    const supabase = createServerClient()
    const customerId = params.id
    const organizationId = '873d8154-8b40-4b8a-8d03-431bf9f697e6'

    // Verificar si el cliente tiene reparaciones o dispositivos asociados
    const { data: repairs } = await supabase
      .from('repairs')
      .select('id')
      .eq('customer_id', customerId)
      .limit(1)

    const { data: devices } = await supabase
      .from('devices')
      .select('id')
      .eq('customer_id', customerId)
      .limit(1)

    if ((repairs && repairs.length > 0) || (devices && devices.length > 0)) {
      return NextResponse.json(
        { error: 'No se puede eliminar el cliente porque tiene reparaciones o dispositivos asociados' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId)
      .eq('organization_id', organizationId)

    if (error) {
      console.error('🚨 Error deleting customer:', error)
      return NextResponse.json(
        { error: 'Error al eliminar el cliente', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Customer deleted successfully:', customerId)

    return NextResponse.json({
      success: true,
      message: 'Cliente eliminado correctamente'
    })

  } catch (error) {
    console.error('🚨 Delete customer error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 