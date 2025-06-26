import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    console.log('🔧 Profile API called for:', email)

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

    // Verificar autenticación de forma segura contactando el servidor de Supabase Auth
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    // Buscar usuario real en la base de datos
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, organization_id')
      .eq('email', email)
      .single()

    if (error || !user) {
      console.error('❌ User not found in database:', error)
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    console.log('✅ User found in database:', { id: user.id, email: user.email, role: user.role })

    // Actualizar last_login solo si hay usuario autenticado verificado por el servidor
    if (authUser && !authError) {
      console.log('🔄 Updating last_login for authenticated user:', authUser.email)
      const { error: updateError } = await supabase
        .rpc('update_user_last_login')

      if (updateError) {
        console.warn('⚠️ Could not update last_login:', updateError)
        // No fallar la respuesta por esto, solo loguearlo
      } else {
        console.log('✅ last_login updated for user:', user.email)
      }
    } else {
      console.log('⚠️ No authenticated user verified by server, skipping last_login update')
      if (authError) {
        console.warn('🔴 Auth verification error:', authError)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id, // ID real de la base de datos
        email: user.email,
        name: user.name,
        role: user.role,
        organization_id: user.organization_id,
        organization_name: 'TiendaFix Central',
        is_active: true,
        status: 'approved'
      }
    })

  } catch (error) {
    console.error('🚨 Profile API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 
