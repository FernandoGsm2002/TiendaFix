import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    console.log('API received dates:', { startDate, endDate })

    if (!startDate || !endDate) {
      return NextResponse.json({ 
        success: false, 
        error: 'Se requieren fechas de inicio y fin' 
      }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar la sesión del usuario
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError) {
      console.error('Error de autenticación:', authError)
      return NextResponse.json({ 
        success: false, 
        error: 'Error de autenticación' 
      }, { status: 401 })
    }
    
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        error: 'No hay sesión activa' 
      }, { status: 401 })
    }

    // Obtener el organization_id del usuario
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('auth_user_id', session.user.id)
      .single()

    if (userError) {
      console.error('Error al obtener usuario:', userError)
      return NextResponse.json({ 
        success: false, 
        error: 'Error al obtener información del usuario' 
      }, { status: 400 })
    }

    if (!userData?.organization_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuario no asociado a una organización' 
      }, { status: 400 })
    }

    console.log('Calling get_reports_data with:', {
      org_id: userData.organization_id,
      startDate,
      endDate
    })

    // Llamar a la función get_reports_data
    const { data, error } = await supabase.rpc('get_reports_data', {
      p_org_id: userData.organization_id,
      p_start_date: startDate,
      p_end_date: endDate
    })

    if (error) {
      console.error('Error al obtener reportes:', error)
      return NextResponse.json({ 
        success: false, 
        error: `Error al obtener los datos del reporte: ${error.message}` 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error: any) {
    console.error('Error en el endpoint de reportes:', error)
    return NextResponse.json({ 
      success: false, 
      error: `Error interno del servidor: ${error.message}` 
    }, { status: 500 })
  }
} 