import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Forzar el renderizado dinámico para esta ruta
export const dynamic = 'force-dynamic'

export async function GET() {
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
      .eq('email', session.user.email)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: 'Perfil de usuario no encontrado' }, { status: 404 })
    }

    if (userProfile.role !== 'technician') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const technicianId = userProfile.id
    const organizationId = userProfile.organization_id

    // Obtener estadísticas del técnico
    const [
      repairsResult,
      currentMonthRepairs,
      lastMonthRepairs,
      efficiencyData,
      revenueData,
      todayTasks,
      unlocksResult,
      currentMonthUnlocks,
      unlockRevenueData,
      salesResult,
      currentMonthSales,
      salesRevenueData
    ] = await Promise.all([
      // Reparaciones creadas por el técnico con información del dispositivo
      supabase
        .from('repairs')
        .select('id, status, cost, created_at, updated_at, title, problem_description')
        .eq('organization_id', organizationId)
        .eq('created_by', technicianId),
      
      // Reparaciones del mes actual
      supabase
        .from('repairs')
        .select('id, status, created_at')
        .eq('organization_id', organizationId)
        .eq('created_by', technicianId)
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      
      // Reparaciones del mes pasado
      supabase
        .from('repairs')
        .select('id, status, created_at')
        .eq('organization_id', organizationId)
        .eq('created_by', technicianId)
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString())
        .lt('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      
      // Datos para eficiencia (últimas 4 semanas)
      supabase
        .from('repairs')
        .select('id, status, created_at, updated_at')
        .eq('organization_id', organizationId)
        .eq('created_by', technicianId)
        .gte('created_at', new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()),
      
      // Ingresos generados por el técnico (reparaciones)
      supabase
        .from('repairs')
        .select('cost, status, updated_at')
        .eq('organization_id', organizationId)
        .eq('created_by', technicianId)
        .in('status', ['completed', 'delivered'])
        .gte('updated_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      
      // Tareas de hoy
      supabase
        .from('repairs')
        .select('id, status')
        .eq('organization_id', organizationId)
        .eq('created_by', technicianId)
        .in('status', ['received', 'diagnosed', 'in_progress'])
        .gte('created_at', new Date().toISOString().split('T')[0]),

      // Desbloqueos creados por el técnico con información del dispositivo
      supabase
        .from('unlocks')
        .select('id, status, cost, created_at, updated_at, brand, model')
        .eq('organization_id', organizationId)
        .eq('created_by', technicianId),

      // Desbloqueos del mes actual
      supabase
        .from('unlocks')
        .select('id, status, created_at')
        .eq('organization_id', organizationId)
        .eq('created_by', technicianId)
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),

      // Ingresos generados por el técnico (desbloqueos)
      supabase
        .from('unlocks')
        .select('cost, status, updated_at')
        .eq('organization_id', organizationId)
        .eq('created_by', technicianId)
        .eq('status', 'completed')
        .gte('updated_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),

      // Ventas creadas por el técnico con información de productos
      supabase
        .from('sales')
        .select('id, total, created_at, payment_method')
        .eq('organization_id', organizationId)
        .eq('created_by', technicianId),

      // Ventas del mes actual
      supabase
        .from('sales')
        .select('id, total, created_at')
        .eq('organization_id', organizationId)
        .eq('created_by', technicianId)
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),

      // Ingresos generados por el técnico (ventas)
      supabase
        .from('sales')
        .select('total, created_at')
        .eq('organization_id', organizationId)
        .eq('created_by', technicianId)
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
    ])

    if (repairsResult.error) {
      throw repairsResult.error
    }

    const repairs = repairsResult.data || []
    const currentMonth = currentMonthRepairs.data || []
    const lastMonth = lastMonthRepairs.data || []
    const efficiency = efficiencyData.data || []
    const revenue = revenueData.data || []
    const today = todayTasks.data || []
    const unlocks = unlocksResult.data || []
    const currentMonthUnlocksData = currentMonthUnlocks.data || []
    const unlockRevenue = unlockRevenueData.data || []
    const sales = salesResult.data || []
    const currentMonthSalesData = currentMonthSales.data || []
    const salesRevenue = salesRevenueData.data || []

    // Calcular estadísticas de reparaciones
    const myRepairs = repairs.filter(r => ['received', 'diagnosed', 'in_progress', 'waiting_parts'].includes(r.status)).length
    const completedRepairs = currentMonth.filter(r => ['completed', 'delivered'].includes(r.status)).length
    const inProgressRepairs = repairs.filter(r => r.status === 'in_progress').length
    const pendingRepairs = repairs.filter(r => ['received', 'diagnosed'].includes(r.status)).length
    
    // Calcular estadísticas de desbloqueos
    const myUnlocks = unlocks.filter(u => ['pending', 'in_progress'].includes(u.status)).length
    const completedUnlocks = currentMonthUnlocksData.filter(u => u.status === 'completed').length
    const inProgressUnlocks = unlocks.filter(u => u.status === 'in_progress').length
    const pendingUnlocks = unlocks.filter(u => u.status === 'pending').length
    
    // Calcular estadísticas de ventas
    const totalSales = sales.length
    const completedSales = currentMonthSalesData.length
    
    // Tiempo promedio removido - no se necesita

    // Calcular eficiencia semanal (% de trabajos completados vs iniciados)
    const totalCurrentMonth = currentMonth.length + currentMonthUnlocksData.length + currentMonthSalesData.length
    const totalCompleted = completedRepairs + completedUnlocks + completedSales
    const weeklyEfficiency = totalCurrentMonth > 0
      ? Math.round((totalCompleted / totalCurrentMonth) * 100)
      : 0

    // Calcular ingresos mensuales combinados (reparaciones + desbloqueos + ventas)
    const repairRevenue = revenue.reduce((sum, repair) => sum + (repair.cost || 0), 0)
    const unlockRevenueAmount = unlockRevenue.reduce((sum, unlock) => sum + (unlock.cost || 0), 0)
    const salesRevenueAmount = salesRevenue.reduce((sum, sale) => sum + (sale.total || 0), 0)
    const monthlyRevenue = repairRevenue + unlockRevenueAmount + salesRevenueAmount

    // Calcular ingresos totales por tipo
    const totalRepairRevenue = repairRevenue
    const totalUnlockRevenue = unlockRevenueAmount
    const totalSalesRevenue = salesRevenueAmount

    // Preparar datos para gráficos
    const repairsByStatus = repairs.reduce((acc, repair) => {
      acc[repair.status] = (acc[repair.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Tendencia de eficiencia por semana
    const weeklyData = []
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(Date.now() - (i * 7 + 7) * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000)
      
      const weekRepairs = efficiency.filter(r => {
        const date = new Date(r.created_at)
        return date >= weekStart && date < weekEnd
      })
      
      const weekCompleted = weekRepairs.filter(r => ['completed', 'delivered'].includes(r.status)).length
      const weekEfficiency = weekRepairs.length > 0 ? Math.round((weekCompleted / weekRepairs.length) * 100) : 0
      
      weeklyData.push({
        week: `S${4 - i}`,
        efficiency: weekEfficiency
      })
    }

    // Actividad reciente combinada (reparaciones + desbloqueos + ventas)
    const repairActivity = repairs
      .filter(r => r.updated_at)
      .map(repair => {
        const deviceInfo = 'Dispositivo'
        const customerName = 'Cliente'
        const issueShort = repair.problem_description ? 
          (repair.problem_description.length > 30 ? 
            repair.problem_description.substring(0, 30) + '...' : 
            repair.problem_description) : repair.title || 'Problema no especificado'
        
        return {
          type: repair.status === 'completed' ? 'repair_completed' : 
                repair.status === 'in_progress' ? 'repair_started' : 'repair_diagnosed',
          title: repair.status === 'completed' ? 'Reparación completada' :
                 repair.status === 'in_progress' ? 'Reparación en progreso' : 'Diagnóstico actualizado',
          description: `${deviceInfo} - ${issueShort}`,
          customer: customerName,
          time: repair.updated_at,
          repairId: repair.id,
          itemType: 'repair'
        }
      })

    const unlockActivity = unlocks
      .filter(u => u.updated_at)
      .map(unlock => {
        const deviceInfo = unlock.brand && unlock.model ? `${unlock.brand} ${unlock.model}` : 'Dispositivo'
        const customerName = 'Cliente'
        
        return {
          type: unlock.status === 'completed' ? 'unlock_completed' : 
                unlock.status === 'in_progress' ? 'unlock_started' : 'unlock_received',
          title: unlock.status === 'completed' ? 'Desbloqueo completado' :
                 unlock.status === 'in_progress' ? 'Desbloqueo en progreso' : 'Nuevo desbloqueo recibido',
          description: deviceInfo,
          customer: customerName,
          time: unlock.updated_at,
          repairId: unlock.id,
          itemType: 'unlock'
        }
      })

    const salesActivity = sales
      .filter(s => s.created_at)
      .map(sale => {
        const customerName = 'Cliente de mostrador'
        const productDescription = `Venta por S/ ${sale.total}`
        
        return {
          type: 'sale_completed',
          title: 'Venta procesada',
          description: productDescription,
          customer: customerName,
          time: sale.created_at,
          repairId: sale.id,
          itemType: 'sale'
        }
      })

    const recentActivity = [...repairActivity, ...unlockActivity, ...salesActivity]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5)

    const stats = {
      assignedRepairs: myRepairs,
      completedRepairs,
      inProgressRepairs,
      pendingRepairs,
      assignedUnlocks: myUnlocks,
      completedUnlocks,
      inProgressUnlocks,
      pendingUnlocks,
      totalSales,
      completedSales,
      weeklyEfficiency,
      monthlyRevenue,
      totalRepairRevenue,
      totalUnlockRevenue,
      totalSalesRevenue,
      todayTasks: today.length
    }

    // Calcular línea de tiempo de trabajos completados por día (últimos 7 días)
    const completionTimeline = []
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      
      const repairsCompleted = repairs.filter(r => 
        ['completed', 'delivered'].includes(r.status) && 
        r.updated_at &&
        new Date(r.updated_at) >= dayStart && 
        new Date(r.updated_at) < dayEnd
      ).length
      
      const unlocksCompleted = unlocks.filter(u => 
        u.status === 'completed' && 
        u.updated_at &&
        new Date(u.updated_at) >= dayStart && 
        new Date(u.updated_at) < dayEnd
      ).length
      
      const salesCompleted = sales.filter(s => 
        s.created_at &&
        new Date(s.created_at) >= dayStart && 
        new Date(s.created_at) < dayEnd
      ).length
      
      completionTimeline.push({
        day: dayNames[date.getDay()],
        completed: repairsCompleted + unlocksCompleted + salesCompleted
      })
    }

    const chartData = {
      repairsByStatus,
      completionTimeline,
      efficiencyTrend: weeklyData
    }

    return NextResponse.json({
      success: true,
      data: {
        stats,
        chartData,
        recentActivity
      }
    })

  } catch (error) {
    console.error('Error fetching technician stats:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 