import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Usar la clave de servicio para saltar RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(request: NextRequest) {
  try {
    console.log('📋 API Admin - Getting organization requests...')

    // Obtener todas las solicitudes
    const { data: requests, error: requestsError } = await supabase
      .from('organization_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (requestsError) {
      console.error('❌ Error fetching requests:', requestsError)
      return NextResponse.json(
        { error: requestsError.message },
        { status: 500 }
      )
    }

    // Obtener organizaciones existentes
    const { data: organizations, error: orgsError } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false })

    if (orgsError) {
      console.error('❌ Error fetching organizations:', orgsError)
      return NextResponse.json(
        { error: orgsError.message },
        { status: 500 }
      )
    }

    console.log(`✅ Found ${requests.length} requests and ${organizations.length} organizations`)

    return NextResponse.json({
      success: true,
      data: {
        requests: requests || [],
        organizations: organizations || []
      }
    })

  } catch (error) {
    console.error('❌ API Admin requests error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 