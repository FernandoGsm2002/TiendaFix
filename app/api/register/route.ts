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
    const body = await request.json()
    
    console.log('📝 API Register - Received data:', {
      ...body,
      owner_password_hash: '[HIDDEN]'
    })

    // Insertar directamente en organization_requests usando la clave de servicio
    const { data, error } = await supabase
      .from('organization_requests')
      .insert({
        name: body.name,
        slug: body.slug,
        email: body.email,
        phone: body.phone || '',
        address: body.address || '',
        owner_name: body.owner_name,
        owner_email: body.owner_email,
        owner_phone: body.owner_phone || '',
        owner_password_hash: body.owner_password_hash,
        subscription_plan: body.subscription_plan,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Organization request created:', data.id)

    return NextResponse.json({
      success: true,
      data: data
    })

  } catch (error) {
    console.error('❌ API Register error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 