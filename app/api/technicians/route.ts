import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Technicians API called - getting real data')
    
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
        },
      }
    )
    
    const { searchParams } = new URL(request.url)
    
    // Parámetros de consulta
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || 'todos'
    
    const offset = (page - 1) * limit
    const organizationId = '873d8154-8b40-4b8a-8d03-431bf9f697e6' // ID fijo para pruebas

    try {
      let query = supabase
        .from('users')
        .select(`
          id, name, email, phone, role, is_active, last_login,
          avatar_url, created_at, updated_at
        `)
        .eq('organization_id', organizationId)
        .in('role', ['technician', 'owner'])
        .order('created_at', { ascending: false })

      // Filtrar por rol si no es 'todos'
      if (role !== 'todos') {
        query = query.eq('role', role)
      }

      // Filtrar por búsqueda si se proporciona
      if (search) {
        query = query.or(`
          name.ilike.%${search}%,
          email.ilike.%${search}%
        `)
      }

      // Obtener datos con paginación
      const { data: technicians, error, count } = await query
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('🚨 Error fetching technicians:', error)
        throw error
      }

      // Obtener estadísticas de rendimiento para cada técnico
      const techniciansWithStats = await Promise.all(
        (technicians || []).map(async (technician) => {
          try {
            // Reparaciones asignadas
            const { data: assignedRepairs, error: assignedError } = await supabase
              .from('repairs')
              .select('id, status, created_at, updated_at, cost')
              .eq('assigned_technician_id', technician.id)
              .eq('organization_id', organizationId)

            // Reparaciones del último mes
            const lastMonth = new Date()
            lastMonth.setMonth(lastMonth.getMonth() - 1)
            
            const { data: monthlyRepairs, error: monthlyError } = await supabase
              .from('repairs')
              .select('id, status, created_at, cost')
              .eq('assigned_technician_id', technician.id)
              .eq('organization_id', organizationId)
              .gte('created_at', lastMonth.toISOString())

            if (assignedError || monthlyError) {
              console.warn(`Error fetching stats for technician ${technician.id}`)
              return technician // Devolver sin estadísticas en caso de error
            }

            const assignedRepairsList = assignedRepairs || []
            const monthlyRepairsList = monthlyRepairs || []

            // Calcular eficiencia (reparaciones completadas vs asignadas)
            const completedRepairs = assignedRepairsList.filter(r => r.status === 'completed' || r.status === 'delivered')
            const efficiency = assignedRepairsList.length > 0 ? 
              (completedRepairs.length / assignedRepairsList.length) * 100 : 0

            // Calcular tiempo promedio de reparación
            const completedWithTimes = completedRepairs.filter(r => r.created_at && r.updated_at)
            const avgRepairTime = completedWithTimes.length > 0 ?
              completedWithTimes.reduce((sum, repair) => {
                const start = new Date(repair.created_at)
                const end = new Date(repair.updated_at)
                return sum + (end.getTime() - start.getTime())
              }, 0) / completedWithTimes.length / (1000 * 60 * 60 * 24) : 0 // En días

            // Ingresos generados
            const totalRevenue = assignedRepairsList
              .filter(r => r.cost && (r.status === 'completed' || r.status === 'delivered'))
              .reduce((sum, r) => sum + (r.cost || 0), 0)

            return {
              ...technician,
              stats: {
                totalReparaciones: assignedRepairsList.length,
                completadas: completedRepairs.length,
                enProceso: assignedRepairsList.filter(r => ['in_progress', 'diagnosed', 'waiting_parts'].includes(r.status)).length,
                pendientes: assignedRepairsList.filter(r => r.status === 'received').length,
                reparacionesMes: monthlyRepairsList.length,
                eficiencia: Math.round(efficiency),
                tiempoPromedio: Math.round(avgRepairTime * 10) / 10,
                ingrenosGenerados: totalRevenue,
                ultimoAcceso: technician.last_login
              }
            }
          } catch (statsError) {
            console.warn(`Error calculating stats for technician ${technician.id}:`, statsError)
            return technician // Devolver sin estadísticas en caso de error
          }
        })
      )

      console.log(`✅ Fetched ${technicians?.length || 0} technicians from database`)

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

    } catch (dbError) {
      console.error('🚨 Database query error:', dbError)
      
      // Devolver estructura vacía si falla la BD
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0
        }
      })
    }

  } catch (error) {
    console.error('🚨 Technicians API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Creating new technician...')
    
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set: (name: string, value: string, options: CookieOptions) => { cookieStore.set({ name, value, ...options }) },
          remove: (name: string, options: CookieOptions) => { cookieStore.set({ name, value: '', ...options }) },
        },
      }
    )
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: adminProfile } = await supabase
      .from('users')
      .select('organization_id')
      .eq('auth_user_id', session.user.id)
      .single();

    if (!adminProfile) {
      return NextResponse.json({ error: 'Admin profile not found' }, { status: 404 });
    }

    const organizationId = adminProfile.organization_id;
    const body = await request.json()

    // Validaciones
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json({ error: 'Nombre, email y contraseña son obligatorios' }, { status: 400 });
    }
    if (!['technician', 'owner'].includes(body.role)) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });
    }

    // Crear un cliente de Supabase con privilegios de administrador
    const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          cookies: {
            get(name: string) { return cookieStore.get(name)?.value },
            set: (name: string, value: string, options: CookieOptions) => { cookieStore.set({ name, value, ...options }) },
            remove: (name: string, options: CookieOptions) => { cookieStore.set({ name, value: '', ...options }) },
          },
        }
      )

    // 1. Crear usuario en Supabase Auth con el cliente admin
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        full_name: body.name,
        role: body.role
      }
    });

    if (authError) {
      console.error('🚨 Error creating auth user:', authError);
      return NextResponse.json({ error: 'Error al crear las credenciales del usuario', details: authError.message }, { status: 500 });
    }

    // 2. Crear usuario en la tabla `users` de la aplicación
    const newTechnicianProfile = {
      organization_id: organizationId,
      auth_user_id: authUser.user.id, // Enlazar con el usuario de Auth
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      role: body.role,
      is_active: true,
    }

    const { data: technician, error: profileError } = await supabase
      .from('users')
      .insert(newTechnicianProfile)
      .select()
      .single()

    if (profileError) {
      console.error('🚨 Error creating technician profile:', profileError)
      // Si falla, intentar eliminar el usuario de Auth para evitar registros huérfanos
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json({ error: 'Error al guardar el perfil del técnico', details: profileError.message }, { status: 500 });
    }

    console.log('✅ Technician created successfully:', technician.id)
    return NextResponse.json({ success: true, data: technician })

  } catch (error) {
    console.error('🚨 Create technician error:', error)
    return NextResponse.json({ error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
