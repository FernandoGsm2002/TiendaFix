import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Usar la clave de servicio para saltar RLS completamente
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(request: NextRequest) {
  try {
    console.log('📋 API Admin - Getting organization requests...')
    console.log('🔑 Using service key:', supabaseServiceKey ? 'Yes' : 'No')
    console.log('🕐 Request timestamp:', new Date().toISOString())
    
    // Verificar configuración de Supabase
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase configuration')
      return NextResponse.json(
        { error: 'Configuración de Supabase faltante' },
        { status: 500 }
      )
    }

    // Log de configuración
    console.log('🔗 Supabase URL:', supabaseUrl.substring(0, 30) + '...')
    console.log('🔑 Service key length:', supabaseServiceKey.length)

    // Obtener todas las solicitudes directamente - usando service key para saltar RLS
    console.log('🔍 Fetching organization requests with service key...')
    const { data: requests, error: requestsError } = await supabase
      .from('organization_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (requestsError) {
      console.error('❌ Error fetching requests:', requestsError)
      console.error('❌ Error details:', {
        code: requestsError.code,
        message: requestsError.message,
        details: requestsError.details,
        hint: requestsError.hint
      })
      
      return NextResponse.json(
        { error: `Error obteniendo solicitudes: ${requestsError.message}` },
        { status: 500 }
      )
    }

    // Obtener organizaciones existentes
    console.log('🔍 Fetching organizations...')
    const { data: organizations, error: orgsError } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false })

    if (orgsError) {
      console.error('❌ Error fetching organizations:', orgsError)
      return NextResponse.json(
        { error: `Error obteniendo organizaciones: ${orgsError.message}` },
        { status: 500 }
      )
    }

    console.log(`✅ Successfully fetched ${requests?.length || 0} requests and ${organizations?.length || 0} organizations`)
    
    // Log detallado de las solicitudes para debugging
    if (requests && requests.length > 0) {
      console.log('📊 Requests summary:')
      requests.forEach((req, index) => {
        console.log(`  ${index + 1}. ${req.name} (${req.owner_email}) - Status: ${req.status} - Created: ${req.created_at}`)
      })
    } else {
      console.log('⚠️  No requests found in database')
    }

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