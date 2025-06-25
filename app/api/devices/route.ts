// Devices API

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function getAuthenticatedUser(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: userProfile, error } = await supabase
    .from('users')
    .select('id, organization_id')
    .eq('auth_user_id', user.id)
    .single()
  
  if (error || !userProfile?.organization_id) {
    throw new Error('Organization not found for user.')
  }

  return { user, organizationId: userProfile.organization_id, profileId: userProfile.id }
}

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
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (error) {
              // The `delete` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    const { profileId, organizationId } = await getAuthenticatedUser(supabase)
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const marca = searchParams.get('marca') || 'todos'
    
    const offset = (page - 1) * limit

    let query = supabase
      .from('devices')
      .select(`
        id, customer_id, brand, model, device_type, serial_number, imei, color,
        storage_capacity, operating_system, notes, status,
        created_at, updated_at,
        customers(id, name, email, phone, anonymous_identifier, customer_type),
        repairs(id, title, status, created_at)
      `, { count: 'exact' })
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (marca !== 'todos') {
      query = query.ilike('brand', `%${marca}%`)
    }

    if (search) {
      const searchConditions = [
        `brand.ilike.%${search}%`,
        `model.ilike.%${search}%`,
        `imei.ilike.%${search}%`,
        `serial_number.ilike.%${search}%`,
        `customers.name.ilike.%${search}%`
      ].join(',')
      
      query = query.or(searchConditions)
    }

    const { data: devices, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) throw new Error(error.message)

    const devicesWithStats = (devices || []).map(device => ({
      ...device,
      totalReparaciones: device.repairs.length,
      ultimaReparacion: device.repairs.length > 0 ? device.repairs[0].created_at : null,
    }))

    return NextResponse.json({
      success: true,
      data: devicesWithStats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error: any) {
    console.error('Devices GET API error:', error)
    const status = error.message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ error: error.message }, { status })
  }
}

export async function POST(request: NextRequest) {
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
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (error) {
              // The `delete` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    const { profileId, organizationId } = await getAuthenticatedUser(supabase)
    const body = await request.json()
    
    if (!body.brand || !body.model || !body.customer_id) {
      return NextResponse.json({ error: 'Marca, modelo y cliente son obligatorios' }, { status: 400 })
    }

    const newDevice = {
      organization_id: organizationId,
      customer_id: body.customer_id,
      brand: body.brand,
      model: body.model,
      device_type: body.device_type || 'smartphone',
      serial_number: body.serial_number,
      imei: body.imei,
      color: body.color,
      storage_capacity: body.storage_capacity,
      operating_system: body.operating_system,
      notes: body.notes,
      created_by: profileId
    }

    const { data: device, error } = await supabase
      .from('devices')
      .insert(newDevice)
      .select()
      .single()

    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true, data: device })
  } catch (error: any) {
    console.error('Create device error:', error)
    const status = error.message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ error: 'Error al crear el dispositivo' }, { status })
  }
}
