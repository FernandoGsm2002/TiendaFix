import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('auth_user_id', user.id)
      .single()

    if (profileError || !userProfile || !userProfile.organization_id) {
      console.error('Profile fetch error for dashboard:', profileError)
      return NextResponse.json({ error: 'User profile or organization not found.' }, { status: 404 })
    }
    
    const organizationId = userProfile.organization_id;

    const { data, error } = await supabase.rpc('get_dashboard_stats', { p_org_id: organizationId })

    if (error) {
      console.error('🚨 Database function error:', error)
      return NextResponse.json({ error: 'Error al consultar las estadísticas del dashboard', details: error.message }, { status: 500 })
    }

    // The function now returns data in the exact shape the frontend needs.
    // We just need to add a default for salesLast7Days in case it's null
    if (data.chartData && !data.chartData.salesLast7Days) {
      data.chartData.salesLast7Days = [];
    }
    
    // Same for recent activity
    if (!data.recentActivity) {
      data.recentActivity = [];
    }

    // And repairsByStatus
    if (data.chartData && !data.chartData.repairsByStatus) {
      data.chartData.repairsByStatus = {};
    }


    return NextResponse.json({
      success: true,
      data: data
    })

  } catch (error) {
    console.error('🚨 Dashboard stats error:', error)
    return NextResponse.json({ error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
} 
