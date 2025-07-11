import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Helper function to get authenticated user's organization
async function getAuthenticatedUserOrganization(supabase: any) {
  const { data: { session }, error: authError } = await supabase.auth.getSession()
  if (authError || !session) {
    throw new Error('No autorizado')
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('organization_id')
    .eq('auth_user_id', session.user.id)
    .single()

  if (profileError || !userProfile?.organization_id) {
    throw new Error('Organización no encontrada')
  }

  return userProfile.organization_id
}

// GET - Obtener cliente por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔧 Getting customer by ID:', params.id)
    
    const supabase = createRouteHandlerClient({ cookies })
    const customerId = params.id

    const organizationId = await getAuthenticatedUserOrganization(supabase)

    const { data: customer, error } = await supabase
      .from('customers')
      .select(`
        id, name, email, phone, address, customer_type,
        anonymous_identifier, is_recurrent, notes,
        customer_tax_id, customer_tax_id_type,
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
    const status = error instanceof Error && error.message === 'No autorizado' ? 401 : 
                   error instanceof Error && error.message === 'Organización no encontrada' ? 403 : 500
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status }
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
    
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const customerId = params.id

    const organizationId = await getAuthenticatedUserOrganization(supabase)

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
      customer_tax_id: body.customer_tax_id || null,
      customer_tax_id_type: body.customer_tax_id_type || null,
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
    const status = error instanceof Error && error.message === 'No autorizado' ? 401 : 
                   error instanceof Error && error.message === 'Organización no encontrada' ? 403 : 500
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status }
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
    
    const supabase = createRouteHandlerClient({ cookies })
    const customerId = params.id

    const organizationId = await getAuthenticatedUserOrganization(supabase)

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
    const status = error instanceof Error && error.message === 'No autorizado' ? 401 : 
                   error instanceof Error && error.message === 'Organización no encontrada' ? 403 : 500
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status }
    )
  }
} 