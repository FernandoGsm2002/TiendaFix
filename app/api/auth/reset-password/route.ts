import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'El email es requerido' },
        { status: 400 }
      )
    }

    // Crear cliente con service key para operaciones administrativas
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar si el usuario existe en nuestra base de datos
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name, organization_id')
      .eq('email', email)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'No se encontró una cuenta con este email' },
        { status: 404 }
      )
    }

    console.log('🔄 Enviando email de recuperación a:', email)

    // Enviar email de recuperación
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password/confirm`
    })

    if (resetError) {
      console.error('❌ Error enviando email de recuperación:', resetError)
      return NextResponse.json(
        { error: 'Error enviando email de recuperación: ' + resetError.message },
        { status: 500 }
      )
    }

    console.log('✅ Email de recuperación enviado exitosamente')

    return NextResponse.json({
      success: true,
      message: 'Se ha enviado un enlace de recuperación a tu email'
    })

  } catch (error) {
    console.error('❌ Error en API reset-password:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 