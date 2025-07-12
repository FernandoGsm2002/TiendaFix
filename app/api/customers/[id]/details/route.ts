import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticación
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const customerId = params.id

    // Obtener información básica del cliente
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select(`
        id, name, email, phone, address, customer_type,
        anonymous_identifier, is_recurrent, notes,
        customer_tax_id, customer_tax_id_type,
        cedula_dni, country_code,
        created_at, updated_at
      `)
      .eq('id', customerId)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    // Obtener historial de reparaciones
    const { data: repairs, error: repairsError } = await supabase
      .from('repairs')
      .select(`
        id,
        title,
        problem_description,
        status,
        cost,
        created_at,
        actual_completion_date,
        unregistered_device_info,
        devices!device_id (
          brand,
          model,
          device_type
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    // Obtener historial de desbloqueos
    const { data: unlocks, error: unlocksError } = await supabase
      .from('unlocks')
      .select(`
        id,
        unlock_type,
        brand,
        model,
        status,
        cost,
        created_at,
        completion_time,
        notes,
        devices!device_id (
          brand,
          model,
          device_type
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    console.log('🔍 Unlocks query result:', { unlocks, unlocksError, customerId })

    // Obtener historial de ventas
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select(`
        id,
        total,
        payment_method,
        payment_status,
        created_at,
        sale_items (
          quantity,
          unit_price,
          total_price,
          inventory (
            name
          )
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    // Procesar los servicios en un formato unificado
    const services: any[] = []

    // Agregar reparaciones
    if (repairs && !repairsError) {
      console.log(`✅ Processing ${repairs.length} repairs for customer ${customerId}`)
      repairs.forEach((repair: any) => {
        const deviceInfo = repair.unregistered_device_info || 
          (repair.devices ? `${repair.devices.brand} ${repair.devices.model}` : 'Dispositivo no especificado')
        
        const repairService = {
          id: repair.id,
          type: 'repair',
          title: repair.title,
          description: repair.problem_description,
          status: repair.status,
          cost: repair.cost || 0,
          created_at: repair.created_at,
          completed_at: repair.actual_completion_date,
          device_info: deviceInfo
        }
        
        console.log('🔧 Adding repair service:', repairService)
        services.push(repairService)
      })
    } else if (repairsError) {
      console.error('❌ Error fetching repairs:', repairsError)
    } else {
      console.log('ℹ️ No repairs found for customer', customerId)
    }

    // Agregar desbloqueos
    if (unlocks && !unlocksError) {
      console.log(`✅ Processing ${unlocks.length} unlocks for customer ${customerId}`)
      unlocks.forEach((unlock: any) => {
        // Priorizar la información del dispositivo relacionado, luego la información directa del unlock
        const deviceInfo = unlock.devices 
          ? `${unlock.devices.brand} ${unlock.devices.model}` 
          : `${unlock.brand} ${unlock.model}`
        
        const unlockService = {
          id: unlock.id,
          type: 'unlock',
          title: `Desbloqueo ${unlock.unlock_type}`,
          description: unlock.notes,
          status: unlock.status,
          cost: unlock.cost || 0,
          created_at: unlock.created_at,
          completed_at: unlock.completion_time,
          device_info: deviceInfo
        }
        
        console.log('🔧 Adding unlock service:', unlockService)
        services.push(unlockService)
      })
    } else if (unlocksError) {
      console.error('❌ Error fetching unlocks:', unlocksError)
    } else {
      console.log('ℹ️ No unlocks found for customer', customerId)
    }

    // Agregar ventas
    if (sales && !salesError) {
      console.log(`✅ Processing ${sales.length} sales for customer ${customerId}`)
      sales.forEach((sale: any) => {
        const items = sale.sale_items || []
        const itemsText = items.map((item: any) => `${item.inventory?.name || 'Producto'} (${item.quantity}x)`).join(', ')
        
        const saleService = {
          id: sale.id,
          type: 'sale',
          title: `Venta - ${sale.payment_method}`,
          description: `Productos: ${itemsText}`,
          status: sale.payment_status || 'completed',
          cost: sale.total || 0,
          created_at: sale.created_at,
          completed_at: sale.created_at,
          items: items.map((item: any) => ({
            name: item.inventory?.name || 'Producto',
            quantity: item.quantity,
            price: item.unit_price
          }))
        }
        
        console.log('🛒 Adding sale service:', saleService)
        services.push(saleService)
      })
    } else if (salesError) {
      console.error('❌ Error fetching sales:', salesError)
    } else {
      console.log('ℹ️ No sales found for customer', customerId)
    }

    // Calcular resumen financiero
    const totalSpent = services.reduce((sum, service) => sum + service.cost, 0)
    const completedServices = services.filter(s => ['completed', 'delivered'].includes(s.status))
    const pendingServices = services.filter(s => ['pending', 'in_progress'].includes(s.status))
    
    const totalPaid = completedServices.reduce((sum, service) => sum + service.cost, 0)
    const totalPending = pendingServices.reduce((sum, service) => sum + service.cost, 0)
    
    const lastCompletedService = completedServices
      .sort((a, b) => new Date(b.completed_at || b.created_at).getTime() - new Date(a.completed_at || a.created_at).getTime())[0]

    const financialSummary = {
      totalSpent,
      totalPending,
      totalPaid,
      lastPayment: lastCompletedService?.completed_at || lastCompletedService?.created_at
    }

    // Construir respuesta
    const customerDetail = {
      ...customer,
      services,
      financialSummary
    }

    return NextResponse.json({
      success: true,
      data: customerDetail
    })

  } catch (error) {
    console.error('Error fetching customer details:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 