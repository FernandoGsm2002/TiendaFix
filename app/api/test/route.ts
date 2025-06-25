import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔧 Testing environment variables...')
    
    // Verificar variables de entorno directamente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('🔧 Supabase URL:', supabaseUrl ? 'SET' : 'NOT SET')
    console.log('🔧 Supabase Key:', supabaseKey ? 'SET' : 'NOT SET')
    console.log('🔧 URL Value:', supabaseUrl)
    console.log('🔧 Key Length:', supabaseKey?.length || 0)
    
    return NextResponse.json({ 
      status: 'OK',
      message: 'Environment variables test',
      supabase_url: !!supabaseUrl,
      supabase_key: !!supabaseKey,
      url_value: supabaseUrl,
      key_length: supabaseKey?.length || 0,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('🚨 Test API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 