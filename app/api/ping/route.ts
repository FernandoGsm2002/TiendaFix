import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
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
    
    // Realizar una consulta simple para verificar la conexión
    const { data, error } = await supabase
      .from('health_checks')
      .select('id')
      .limit(1)

    if (error) {
      console.error('❌ Health check error:', error)
      return NextResponse.json({ status: 'error', error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      region: process.env.VERCEL_REGION || 'unknown'
    })
  } catch (error) {
    console.error('❌ Ping endpoint error:', error)
    return NextResponse.json({ status: 'error', error: 'Internal server error' }, { status: 500 })
  }
} 