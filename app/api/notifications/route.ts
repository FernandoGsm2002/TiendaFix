import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

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

export async function GET() {
  const cookieStore = cookies()
  const supabase = createSupabaseClient(cookieStore)

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()
      
    if (!userProfile || !userProfile.organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 403 })
    }

    const organizationId = userProfile.organization_id

    const { data: lowStockItems, error: lowStockError } = await supabase
      .from('inventory')
      .select('id, name, quantity, low_stock_threshold')
      .eq('organization_id', organizationId)
      .lte('quantity', 5) // O usar 'low_stock_threshold' si existe

    const { data: pendingRepairs, error: repairsError } = await supabase
      .from('repairs')
      .select('id, title, status, created_at, customers(name)')
      .eq('organization_id', organizationId)
      .in('status', ['pending', 'received', 'diagnosed'])

    const { data: pendingUnlocks, error: unlocksError } = await supabase
      .from('unlocks')
      .select('id, unlock_type, model, status, created_at, customers(name)')
      .eq('organization_id', organizationId)
      .in('status', ['pending', 'in_progress'])

    if (lowStockError || repairsError || unlocksError) {
      console.error('Error fetching notifications:', { lowStockError, repairsError, unlocksError })
      return NextResponse.json({ error: 'Error fetching notification data' }, { status: 500 })
    }

    const notifications = [
      ...(lowStockItems || []).map(item => ({
        id: `low-stock-${item.id}`,
        type: 'low_stock',
        message: `Bajo stock para ${item.name}. Cantidad restante: ${item.quantity}.`,
        createdAt: new Date().toISOString()
      })),
      ...(pendingRepairs || []).map(repair => ({
        id: `repair-${repair.id}`,
        type: 'pending_repair',
        message: `Reparación "${repair.title}" para ${(repair.customers as any)?.name || 'cliente'} está pendiente.`,
        createdAt: repair.created_at
      })),
      ...(pendingUnlocks || []).map(unlock => ({
        id: `unlock-${unlock.id}`,
        type: 'pending_unlock',
        message: `Desbloqueo de ${unlock.unlock_type} ${unlock.model} para ${(unlock.customers as any)?.name || 'cliente'} está pendiente.`,
        createdAt: unlock.created_at
      }))
    ]
    
    return NextResponse.json({ notifications })

  } catch (error) {
    console.error('Error in notifications route:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 