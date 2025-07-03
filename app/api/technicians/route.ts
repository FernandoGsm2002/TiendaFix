import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { validateMultiTenantAccess, logApiCall } from '@/lib/utils/multi-tenant'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Interfaces
interface TechnicianData {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  is_active: boolean
  last_login: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

interface RepairData {
  id: string
  status: string
  created_at: string
  updated_at: string
  cost: number | null
}

interface UnlockData {
  id: string
  status: string
  created_at: string
  cost: number | null
}

interface SaleData {
  id: string
  created_at: string
  total_amount: number | null
}

interface TechnicianStats {
  totalReparaciones: number
  completadas: number
  enProceso: number
  pendientes: number
  reparacionesMes: number
  eficiencia: number
  tiempoPromedio: number
  ingrenosGenerados: number
  ultimoAcceso: string | null
  totalUnlocks: number
  totalSales: number
}

interface TechnicianWithStats extends TechnicianData {
  stats: TechnicianStats
}

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  
  try {
    // 1. Validar acceso multi-tenant
    const validation = await validateMultiTenantAccess(cookieStore)
    
    if (!validation.success) {
      return validation.response
    }

    const { userProfile, organizationId, supabase } = validation.context
    
    logApiCall('Technicians', organizationId, { 
      userRole: userProfile.role,
      userId: userProfile.id 
    })

    // 2. Extraer parámetros de consulta
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12')))
    const search = searchParams.get('search')
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const offset = (page - 1) * limit

    // 3. Construir query optimizada
    let query = supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        phone,
        role,
        is_active,
        last_login,
        avatar_url,
        created_at,
        updated_at
      `, { count: 'exact' })
      .eq('organization_id', organizationId)
      .in('role', ['technician', 'owner'])

    // 4. Aplicar filtros
    if (role && role !== 'todos') {
      query = query.eq('role', role)
    }

    if (status && status !== 'todos') {
      const isActive = status === 'active'
      query = query.eq('is_active', isActive)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    // 5. Ejecutar query con paginación
    const { data: technicians, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('❌ Database error:', error)
      throw error
    }

    console.log(`✅ Fetched ${technicians?.length || 0} technicians from database`)

    // 6. Obtener estadísticas de rendimiento para cada técnico
    const techniciansWithStats: TechnicianWithStats[] = await Promise.all(
      (technicians || []).map(async (technician: TechnicianData): Promise<TechnicianWithStats> => {
        try {
          // Consultas optimizadas en paralelo
          const [repairsData, unlocksData, salesData] = await Promise.all([
            // Reparaciones
            supabase
              .from('repairs')
              .select('id, status, created_at, updated_at, cost')
              .eq('assigned_technician_id', technician.id)
              .eq('organization_id', organizationId),
            
            // Desbloqueos
            supabase
              .from('unlocks')
              .select('id, status, created_at, cost')
              .eq('created_by', technician.id)
              .eq('organization_id', organizationId),
            
            // Ventas
            supabase
              .from('sales')
              .select('id, created_at, total_amount')
              .eq('created_by', technician.id)
              .eq('organization_id', organizationId)
          ])

          const repairs: RepairData[] = repairsData.data || []
          const unlocks: UnlockData[] = unlocksData.data || []
          const sales: SaleData[] = salesData.data || []

          // Calcular estadísticas
          const completedRepairs = repairs.filter((r: RepairData) => ['completed', 'delivered'].includes(r.status))
          const efficiency = repairs.length > 0 ? (completedRepairs.length / repairs.length) * 100 : 0

          // Calcular tiempo promedio de reparación
          const completedWithTimes = completedRepairs.filter((r: RepairData) => r.created_at && r.updated_at)
          const avgRepairTime = completedWithTimes.length > 0 ?
            completedWithTimes.reduce((sum: number, repair: RepairData) => {
              const start = new Date(repair.created_at)
              const end = new Date(repair.updated_at)
              return sum + (end.getTime() - start.getTime())
            }, 0) / completedWithTimes.length / (1000 * 60 * 60 * 24) : 0

          // Ingresos totales
          const repairRevenue = repairs.filter((r: RepairData) => r.cost && ['completed', 'delivered'].includes(r.status))
            .reduce((sum: number, r: RepairData) => sum + (r.cost || 0), 0)
          const unlockRevenue = unlocks.filter((u: UnlockData) => u.cost && u.status === 'completed')
            .reduce((sum: number, u: UnlockData) => sum + (u.cost || 0), 0)
          const salesRevenue = sales.reduce((sum: number, s: SaleData) => sum + (s.total_amount || 0), 0)

          return {
            ...technician,
            stats: {
              totalReparaciones: repairs.length,
              completadas: completedRepairs.length,
              enProceso: repairs.filter((r: RepairData) => ['in_progress', 'diagnosed', 'waiting_parts'].includes(r.status)).length,
              pendientes: repairs.filter((r: RepairData) => r.status === 'received').length,
              reparacionesMes: repairs.filter((r: RepairData) => {
                const createdAt = new Date(r.created_at)
                const lastMonth = new Date()
                lastMonth.setMonth(lastMonth.getMonth() - 1)
                return createdAt >= lastMonth
              }).length,
              eficiencia: Math.round(efficiency),
              tiempoPromedio: Math.round(avgRepairTime * 10) / 10,
              ingrenosGenerados: repairRevenue + unlockRevenue + salesRevenue,
              ultimoAcceso: technician.last_login,
              totalUnlocks: unlocks.length,
              totalSales: sales.length
            }
          }
        } catch (statsError) {
          console.warn(`Error calculating stats for technician ${technician.id}:`, statsError)
          return {
            ...technician,
            stats: {
              totalReparaciones: 0,
              completadas: 0,
              enProceso: 0,
              pendientes: 0,
              reparacionesMes: 0,
              eficiencia: 0,
              tiempoPromedio: 0,
              ingrenosGenerados: 0,
              ultimoAcceso: technician.last_login,
              totalUnlocks: 0,
              totalSales: 0
            }
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: techniciansWithStats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('🚨 Technicians API error:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  
  try {
    const validation = await validateMultiTenantAccess(cookieStore)
    
    if (!validation.success) {
      return validation.response
    }

    const { userProfile, organizationId, supabase } = validation.context
    
    // Solo owners pueden crear técnicos
    if (userProfile.role !== 'owner') {
      return NextResponse.json({ error: 'No tienes permisos para crear técnicos' }, { status: 403 })
    }

    logApiCall('Technicians POST', organizationId, { 
      userRole: userProfile.role,
      userId: userProfile.id 
    })

    const body = await request.json()

    // Validaciones
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json({ 
        error: 'Nombre, email y contraseña son obligatorios' 
      }, { status: 400 })
    }

    if (!['technician', 'owner'].includes(body.role)) {
      return NextResponse.json({ 
        error: 'Rol inválido. Debe ser "technician" o "owner"' 
      }, { status: 400 })
    }

    // Verificar que el email no esté en uso
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', body.email)
      .single()

    if (existingUser) {
      return NextResponse.json({ 
        error: 'El email ya está en uso' 
      }, { status: 400 })
    }

    // Crear cliente admin para operaciones de administrador
    const supabaseAdmin = createServerClient()

    // 1. Crear usuario en Supabase Auth usando cliente admin
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        full_name: body.name,
        role: body.role
      }
    })

    if (authError) {
      console.error('❌ Error creating auth user:', authError)
      return NextResponse.json({ 
        error: 'Error al crear las credenciales del usuario',
        details: authError.message 
      }, { status: 500 })
    }

    // 2. Crear perfil en la tabla users usando cliente normal
    const newTechnicianProfile = {
      organization_id: organizationId,
      auth_user_id: authUser.user.id,
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      role: body.role,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: technician, error: profileError } = await supabase
      .from('users')
      .insert(newTechnicianProfile)
      .select(`
        id,
        name,
        email,
        phone,
        role,
        is_active,
        last_login,
        avatar_url,
        created_at,
        updated_at
      `)
      .single()

    if (profileError) {
      console.error('❌ Error creating technician profile:', profileError)
      
      // Limpiar: eliminar usuario de Auth si falla el perfil
      try {
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      } catch (cleanupError) {
        console.error('❌ Error cleaning up auth user:', cleanupError)
      }
      
      return NextResponse.json({ 
        error: 'Error al guardar el perfil del técnico',
        details: profileError.message 
      }, { status: 500 })
    }

    console.log('✅ Technician created successfully:', technician.id)

    // Agregar estadísticas vacías para consistencia con GET
    const technicianWithStats = {
      ...technician,
      stats: {
        totalReparaciones: 0,
        completadas: 0,
        enProceso: 0,
        pendientes: 0,
        reparacionesMes: 0,
        eficiencia: 0,
        tiempoPromedio: 0,
        ingrenosGenerados: 0,
        ultimoAcceso: null,
        totalUnlocks: 0,
        totalSales: 0
      }
    }

    return NextResponse.json({
      success: true,
      data: technicianWithStats
    })

  } catch (error) {
    console.error('🚨 Create technician error:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
