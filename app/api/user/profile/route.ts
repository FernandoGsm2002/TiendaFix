import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Función común para obtener perfil de usuario
async function getUserProfile(supabase: any) {
  // Verificar autenticación de forma segura contactando el servidor de Supabase Auth
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !authUser) {
    console.error('❌ User not authenticated:', authError)
    throw new Error('Usuario no autenticado')
  }
  
  console.log('🔐 Authenticated user:', authUser.id, authUser.email)
  
  // Buscar usuario real en la base de datos usando auth_user_id
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, name, role, organization_id')
    .eq('auth_user_id', authUser.id)
    .single()

  if (error || !user) {
    console.error('❌ User not found in database:', error)
    throw new Error('Usuario no encontrado')
  }

  console.log('✅ User found in database:', { id: user.id, email: user.email, role: user.role })

  return {
    id: user.id, // ID real de la base de datos
    email: user.email,
    name: user.name,
    role: user.role,
    organization_id: user.organization_id,
    organization_name: 'TiendaFix Central',
    is_active: true,
    status: 'approved'
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Profile API (GET) called')

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

    const userData = await getUserProfile(supabase)

    return NextResponse.json({
      success: true,
      data: userData
    })

  } catch (error) {
    console.error('🚨 Profile API (GET) error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: error instanceof Error && error.message === 'Usuario no autenticado' ? 401 : 
               error instanceof Error && error.message === 'Usuario no encontrado' ? 404 : 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Profile API (POST) called')

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

    const userData = await getUserProfile(supabase)

    // Actualizar last_login para el usuario autenticado (solo en POST)
    console.log('🔄 Updating last_login for authenticated user:', userData.email)
    const { error: updateError } = await supabase
      .rpc('update_user_last_login')

    if (updateError) {
      console.warn('⚠️ Could not update last_login:', updateError)
      // No fallar la respuesta por esto, solo loguearlo
    } else {
      console.log('✅ last_login updated for user:', userData.email)
    }

    return NextResponse.json({
      success: true,
      data: userData
    })

  } catch (error) {
    console.error('🚨 Profile API (POST) error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: error instanceof Error && error.message === 'Usuario no autenticado' ? 401 : 
               error instanceof Error && error.message === 'Usuario no encontrado' ? 404 : 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🔧 Profile API (PUT) called - Change password')

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

    const { newPassword } = await request.json()

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Verificar autenticación
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser) {
      console.error('❌ User not authenticated:', authError)
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    // Actualizar contraseña usando Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (updateError) {
      console.error('❌ Error updating password:', updateError)
      return NextResponse.json(
        { error: 'Error al actualizar la contraseña: ' + updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ Password updated successfully for user:', authUser.email)

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    })

  } catch (error) {
    console.error('🚨 Profile API (PUT) error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 
