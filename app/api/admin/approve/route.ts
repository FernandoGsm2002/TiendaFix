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

export async function POST(request: NextRequest) {
  try {
    const { requestId } = await request.json()
    
    if (!requestId) {
      return NextResponse.json(
        { error: 'ID de solicitud requerido' },
        { status: 400 }
      )
    }
    
    console.log('🔧 Approving organization request:', requestId)

    // Obtener la solicitud
    const { data: orgRequest, error: fetchError } = await supabase
      .from('organization_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (fetchError || !orgRequest) {
      console.error('❌ Error fetching request:', fetchError)
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      )
    }

    if (orgRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'La solicitud ya ha sido procesada' },
        { status: 400 }
      )
    }

    // Calcular fecha de fin de suscripción
    const subscriptionEndDate = getSubscriptionEndDate(orgRequest.subscription_plan)

    // Crear la organización
    const { data: newOrg, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: orgRequest.name,
        slug: orgRequest.slug,
        email: orgRequest.email,
        phone: orgRequest.phone,
        address: orgRequest.address,
        subscription_plan: orgRequest.subscription_plan,
        subscription_end_date: subscriptionEndDate,
        request_id: orgRequest.id
      })
      .select()
      .single()

    if (orgError) {
      console.error('❌ Error creating organization:', orgError)
      return NextResponse.json(
        { error: 'Error creando organización: ' + orgError.message },
        { status: 500 }
      )
    }

    // Crear cuenta de autenticación en Supabase Auth
    console.log('🔐 Creating auth user for:', orgRequest.owner_email)
    
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: orgRequest.owner_email,
      password: 'TiendaFix2024!', // Contraseña temporal que el usuario debe cambiar
      email_confirm: true, // Confirmar email automáticamente
      user_metadata: {
        name: orgRequest.owner_name,
        role: 'owner',
        organization_name: orgRequest.name
      }
    })

    if (authError) {
      console.error('❌ Error creating auth user:', authError)
      // Revertir creación de organización
      await supabase.from('organizations').delete().eq('id', newOrg.id)
      return NextResponse.json(
        { error: 'Error creando cuenta de autenticación: ' + authError.message },
        { status: 500 }
      )
    }

    console.log('✅ Auth user created:', authUser.user.id)

    // Crear usuario owner en la tabla users
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        auth_user_id: authUser.user.id, // Conectar con la cuenta de auth
        organization_id: newOrg.id,
        email: orgRequest.owner_email,
        name: orgRequest.owner_name,
        role: 'owner',
        phone: orgRequest.owner_phone
      })
      .select()
      .single()

    if (userError) {
      console.error('❌ Error creating user:', userError)
      // Revertir creación de organización y auth user
      await supabase.from('organizations').delete().eq('id', newOrg.id)
      await supabase.auth.admin.deleteUser(authUser.user.id)
      return NextResponse.json(
        { error: 'Error creando usuario: ' + userError.message },
        { status: 500 }
      )
    }

    // Marcar solicitud como aprobada
    const { error: updateError } = await supabase
      .from('organization_requests')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)

    if (updateError) {
      console.error('❌ Error updating request:', updateError)
    }

    // Crear configuraciones por defecto
    const defaultSettings = [
      { setting_key: 'currency', setting_value: 'PEN', setting_type: 'string' },
      { setting_key: 'tax_rate', setting_value: '18', setting_type: 'number' },
      { setting_key: 'warranty_days', setting_value: '30', setting_type: 'number' },
      { 
        setting_key: 'business_hours', 
        setting_value: JSON.stringify({
          monday: '9:00-18:00',
          tuesday: '9:00-18:00', 
          wednesday: '9:00-18:00',
          thursday: '9:00-18:00',
          friday: '9:00-18:00',
          saturday: '9:00-14:00',
          sunday: 'closed'
        }), 
        setting_type: 'json' 
      }
    ]

    const settingsToInsert = defaultSettings.map(setting => ({
      organization_id: newOrg.id,
      ...setting
    }))

    const { error: settingsError } = await supabase
      .from('organization_settings')
      .insert(settingsToInsert)

    if (settingsError) {
      console.error('❌ Error creating settings:', settingsError)
      // No revertir por esto, solo logear
    }

    console.log('✅ Organization approved successfully:', newOrg.name)

    return NextResponse.json({
      success: true,
      message: 'Organización aprobada exitosamente',
      data: {
        organization: newOrg,
        user: newUser,
        authUser: {
          id: authUser.user.id,
          email: authUser.user.email,
          temporaryPassword: 'TiendaFix2024!'
        },
        status: 'approved'
      }
    })

  } catch (error) {
    console.error('❌ Approve API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

function getSubscriptionEndDate(plan: string): string {
  const now = new Date()
  
  switch (plan) {
    case 'monthly_3':
      const date3 = new Date(now)
      date3.setMonth(date3.getMonth() + 3)
      return date3.toISOString()
    case 'monthly_6':
      const date6 = new Date(now)
      date6.setMonth(date6.getMonth() + 6)
      return date6.toISOString()
    case 'yearly':
      const dateYear = new Date(now)
      dateYear.setFullYear(dateYear.getFullYear() + 1)
      return dateYear.toISOString()
    default:
      const dateDefault = new Date(now)
      dateDefault.setMonth(dateDefault.getMonth() + 6)
      return dateDefault.toISOString()
  }
} 