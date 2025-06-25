import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    console.log('🔧 Profile API called for:', email)

    // Para fernando, siempre devolver role owner con acceso completo
    if (email === 'fernandoapplehtml@gmail.com') {
      return NextResponse.json({
        success: true,
        data: {
          id: 'user-123',
          email: 'fernandoapplehtml@gmail.com',
          name: 'Fernando Apple',
          role: 'owner',
          organization_id: '873d8154-8b40-4b8a-8d03-431bf9f697e6',
          organization_name: 'TiendaFix Central',
          is_active: true,
          status: 'approved' // Importante: estado aprobado
        }
      })
    }

    // Para otros usuarios, devolver perfil básico
    return NextResponse.json({
      success: true,
      data: {
        id: 'user-generic',
        email: email,
        name: 'Usuario Genérico',
        role: 'technician',
        organization_id: '873d8154-8b40-4b8a-8d03-431bf9f697e6',
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
