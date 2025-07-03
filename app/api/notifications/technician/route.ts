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

    // Verificar que sea técnico
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role, id')
      .eq('user_id', session.user.id)
      .single()

    if (!userProfile || userProfile.role !== 'technician') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const technicianId = userProfile.id

    // Obtener reparaciones CREADAS por el técnico que están pendientes o en progreso
    const { data: myRepairs, error: repairsError } = await supabase
      .from('repairs')
      .select('id, serial_number, status, priority, created_at, unregistered_customer_name')
      .eq('created_by', technicianId)
      .in('status', ['received', 'diagnosed', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(10)

    if (repairsError) {
      console.error('Error fetching repairs:', repairsError)
    }

    // Obtener desbloqueos creados por el técnico que están pendientes o en progreso
    const { data: myUnlocks, error: unlocksError } = await supabase
      .from('unlocks')
      .select('id, imei, brand, model, customer_name, status, created_at')
      .eq('created_by', technicianId)
      .in('status', ['pending', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(10)

    if (unlocksError) {
      console.error('Error fetching unlocks:', unlocksError)
      // No fallar si no existe la tabla de unlocks
    }

    // Formatear datos de reparaciones para incluir nombre del cliente
    const formattedRepairs = (myRepairs || []).map(repair => ({
      id: repair.id,
      serial_number: repair.serial_number,
      customer_name: repair.unregistered_customer_name || 'Cliente registrado',
      status: repair.status,
      priority: repair.priority,
      created_at: repair.created_at
    }))

    // Calcular total de notificaciones
    const totalNotifications = (formattedRepairs?.length || 0) + (myUnlocks?.length || 0)

    const notificationData = {
      totalNotifications,
      items: {
        assignedRepairs: formattedRepairs || [],
        pendingUnlocks: myUnlocks || []
      }
    }

    return NextResponse.json({
      success: true,
      data: notificationData
    })

  } catch (error) {
    console.error('Error fetching technician notifications:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 