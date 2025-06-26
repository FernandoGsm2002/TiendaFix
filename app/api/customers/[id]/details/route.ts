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
      .select('*')
      .eq('id', customerId)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    // Obtener historial de reparaciones
    const { data: repairs, error: repairsError } = await supabase
      .from('repairs_view')
      .select(`
        id,
        title,
        problem_description,
        status,
        cost,
        created_at,
        actual_completion_date,
        unregistered_device_info,
        devices (
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
        devices (
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
        total_amount,
        payment_method,
        status,
        created_at,
        customer_name,
        sale_items (
          product_name,
          quantity,
          price
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    // Procesar los servicios en un formato unificado
    const services: any[] = []

    // Agregar reparaciones
    if (repairs && !repairsError) {
      repairs.forEach((repair: any) => {
        const deviceInfo = repair.unregistered_device_info || 
          (repair.devices && repair.devices.length > 0 ? `${repair.devices[0].brand} ${repair.devices[0].model}` : 'Dispositivo no especificado')
        
        services.push({
          id: repair.id,
          type: 'repair',
          title: repair.title,
          description: repair.problem_description,
          status: repair.status,
          cost: repair.cost || 0,
          created_at: repair.created_at,
          completed_at: repair.actual_completion_date,
          device_info: deviceInfo
        })
      })
    }

    // Agregar desbloqueos
    if (unlocks && !unlocksError) {
      console.log(`✅ Processing ${unlocks.length} unlocks for customer ${customerId}`)
      unlocks.forEach((unlock: any) => {
        // Priorizar la información del dispositivo relacionado, luego la información directa del unlock
        const deviceInfo = (unlock.devices && unlock.devices.length > 0) 
          ? `${unlock.devices[0].brand} ${unlock.devices[0].model}` 
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
      sales.forEach((sale: any) => {
        const items = sale.sale_items || []
        const itemsText = items.map((item: any) => `${item.product_name} (${item.quantity}x)`).join(', ')
        
        services.push({
          id: sale.id,
          type: 'sale',
          title: `Venta - ${sale.payment_method}`,
          description: `Productos: ${itemsText}`,
          status: sale.status || 'completed',
          cost: sale.total_amount || 0,
          created_at: sale.created_at,
          completed_at: sale.created_at,
          items: items.map((item: any) => ({
            name: item.product_name,
            quantity: item.quantity,
            price: item.price
          }))
        })
      })
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