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
    console.log('📍 Request URL:', request.url)
    console.log('🔍 Request headers:', {
      'user-agent': request.headers.get('user-agent'),
      'cache-control': request.headers.get('cache-control'),
      'if-none-match': request.headers.get('if-none-match')
    })
    
    // Verificar configuración de Supabase
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase configuration')
      console.error('❌ URL exists:', !!supabaseUrl)
      console.error('❌ Service Key exists:', !!supabaseServiceKey)
      return NextResponse.json(
        { error: 'Configuración de Supabase faltante' },
        { status: 500 }
      )
    }

    // Log de configuración
    console.log('🔗 Supabase URL:', supabaseUrl.substring(0, 30) + '...')
    console.log('🔑 Service key length:', supabaseServiceKey.length)
    console.log('🔑 Service key prefix:', supabaseServiceKey.substring(0, 10) + '...')

    // Test de conexión básica
    console.log('🔍 Testing Supabase connection...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('organization_requests')
      .select('count')
      .limit(1)
      .single()

    if (connectionError) {
      console.error('❌ Connection test failed:', connectionError)
    } else {
      console.log('✅ Connection test passed')
    }

    // Obtener todas las solicitudes directamente - usando service key para saltar RLS
    console.log('🔍 Fetching organization requests with service key...')
    console.log('🔍 Query: SELECT * FROM organization_requests ORDER BY created_at DESC')
    
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
      
      // Intento de diagnóstico adicional
      console.log('🔍 Attempting alternative query for debugging...')
      const { data: debugData, error: debugError } = await supabase
        .rpc('diagnose_superadmin_final')
      
      if (debugData) {
        console.log('🔍 Debug data:', debugData)
      } else {
        console.log('🔍 Debug query failed:', debugError)
      }
      
      return NextResponse.json(
        { 
          error: `Error obteniendo solicitudes: ${requestsError.message}`,
          debug: {
            code: requestsError.code,
            details: requestsError.details,
            hint: requestsError.hint,
            timestamp: new Date().toISOString()
          }
        },
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
      
      // Log estadísticas por estado
      const statusCounts = requests.reduce((acc, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      console.log('📊 Status distribution:', statusCounts)
    } else {
      console.log('⚠️  No requests found in database')
      console.log('⚠️  This indicates either:')
      console.log('     1. Database is empty (check Supabase dashboard)')
      console.log('     2. RLS policies are blocking access (should not happen with service key)')
      console.log('     3. Table name or structure changed')
      
      // Intentar query directo para verificar
      console.log('🔍 Attempting direct count query...')
      const { count, error: countError } = await supabase
        .from('organization_requests')
        .select('*', { count: 'exact', head: true })
      
      if (countError) {
        console.log('❌ Count query failed:', countError)
      } else {
        console.log(`📊 Direct count result: ${count} records`)
      }
    }

    // Crear response con headers anti-caché
    const response = NextResponse.json({
      success: true,
      data: {
        requests: requests || [],
        organizations: organizations || []
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestsCount: requests?.length || 0,
        organizationsCount: organizations?.length || 0,
        debug: process.env.NODE_ENV === 'development' ? {
          supabaseUrl: supabaseUrl.substring(0, 30) + '...',
          serviceKeyLength: supabaseServiceKey.length,
          requestUrl: request.url
        } : undefined
      }
    }, { status: 200 })

    // Headers para evitar caché
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    response.headers.set('X-Timestamp', new Date().toISOString())

    return response

  } catch (error) {
    console.error('❌ API Admin requests error:', error)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        debug: process.env.NODE_ENV === 'development' ? {
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        } : undefined
      },
      { status: 500 }
    )
  }
} 