import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// Interfaces para tipado fuerte
interface NotificationItem {
  id: string
  type: 'low_stock' | 'pending_repair' | 'pending_unlock'
  priority: 'high' | 'medium' | 'low'
  message: string
  createdAt: string
  data: Record<string, any>
}

interface CustomerData {
  name: string
}

interface InventoryItem {
  id: string
  name: string
  stock_quantity: number
  min_stock: number
}

interface RepairItem {
  id: string
  title: string
  status: string
  created_at: string
  customers: CustomerData[]
}

interface UnlockItem {
  id: string
  unlock_type: string
  model: string
  status: string
  created_at: string
  customers: CustomerData[]
}

// Cliente Supabase optimizado para multi-tenant
const createSupabaseClient = (cookieStore: any) => {
  return createServerClient(
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
}

// Función para obtener el perfil del usuario con cache
async function getUserProfile(supabase: any, userId: string) {
  const { data: userProfile, error } = await supabase
    .from('users')
    .select('id, organization_id, role')
    .eq('auth_user_id', userId)
    .single()
    
  if (error || !userProfile?.organization_id) {
    throw new Error('Organization not found')
  }
  
  return userProfile
}

export async function GET() {
  const cookieStore = cookies()
  const supabase = createSupabaseClient(cookieStore)

  try {
    // 1. Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Obtener perfil del usuario y organización
    const userProfile = await getUserProfile(supabase, user.id)
    const organizationId = userProfile.organization_id

    console.log(`🔔 Notifications API - Organization ID: ${organizationId}`)

    // 3. Consultas paralelas optimizadas - Stock bajo, reparaciones y desbloqueos
    const [lowStockResult, repairsResult, unlocksResult] = await Promise.all([
      // Inventario con bajo stock
      supabase
        .from('inventory')
        .select('id, name, stock_quantity, min_stock')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .filter('stock_quantity', 'lte', 'min_stock')
        .order('stock_quantity', { ascending: true })
        .limit(10),

      // Reparaciones pendientes y en proceso
      supabase
        .from('repairs')
        .select(`
          id, 
          title, 
          status, 
          created_at,
          customers!inner(name)
        `)
        .eq('organization_id', organizationId)
        .in('status', ['received', 'diagnosed', 'in_progress'])
        .order('created_at', { ascending: true })
        .limit(10),

      // Desbloqueos pendientes y en proceso
      supabase
        .from('unlocks')
        .select(`
          id, 
          unlock_type, 
          model, 
          status, 
          created_at,
          customers!inner(name)
        `)
        .eq('organization_id', organizationId)
        .in('status', ['pending', 'in_progress'])
        .order('created_at', { ascending: true })
        .limit(10)
    ])

    // 4. Manejo de errores específicos
    if (lowStockResult.error) {
      console.error('❌ Low stock query error:', lowStockResult.error)
    }
    if (repairsResult.error) {
      console.error('❌ Repairs query error:', repairsResult.error)
    }
    if (unlocksResult.error) {
      console.error('❌ Unlocks query error:', unlocksResult.error)
    }

    // 5. Construir notificaciones de forma segura
    const notifications: NotificationItem[] = []

    // Notificaciones de bajo stock
    if (lowStockResult.data) {
      (lowStockResult.data as InventoryItem[]).forEach(item => {
        notifications.push({
          id: `low-stock-${item.id}`,
          type: 'low_stock',
          priority: 'high',
          message: `⚠️ Bajo stock: ${item.name} (${item.stock_quantity}/${item.min_stock})`,
          createdAt: new Date().toISOString(),
          data: { inventoryId: item.id, currentStock: item.stock_quantity }
        })
      })
    }

    // Notificaciones de reparaciones
    if (repairsResult.data) {
      (repairsResult.data as RepairItem[]).forEach(repair => {
        const customerName = repair.customers && repair.customers.length > 0 
          ? repair.customers[0].name 
          : 'Cliente sin nombre'
        
        notifications.push({
          id: `repair-${repair.id}`,
          type: 'pending_repair',
          priority: 'medium',
          message: `🔧 Reparación "${repair.title}" - ${customerName}`,
          createdAt: repair.created_at,
          data: { repairId: repair.id, status: repair.status }
        })
      })
    }

    // Notificaciones de desbloqueos
    if (unlocksResult.data) {
      (unlocksResult.data as UnlockItem[]).forEach(unlock => {
        const customerName = unlock.customers && unlock.customers.length > 0 
          ? unlock.customers[0].name 
          : 'Cliente sin nombre'
        
        notifications.push({
          id: `unlock-${unlock.id}`,
          type: 'pending_unlock',
          priority: 'medium',
          message: `🔓 Desbloqueo ${unlock.unlock_type} ${unlock.model} - ${customerName}`,
          createdAt: unlock.created_at,
          data: { unlockId: unlock.id, status: unlock.status }
        })
      })
    }

    // 6. Ordenar por prioridad y fecha
    notifications.sort((a, b) => {
      if (a.priority !== b.priority) {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    console.log(`✅ Notifications fetched: ${notifications.length} items`)
    
    return NextResponse.json({ 
      notifications: notifications.slice(0, 20), // Limitar a 20 notificaciones
      total: notifications.length,
      organizationId 
    })

  } catch (error) {
    console.error('❌ Error in notifications route:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 