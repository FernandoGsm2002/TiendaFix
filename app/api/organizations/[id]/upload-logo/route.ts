import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticación
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que el usuario pertenece a la organización y es owner
    const { data: userProfile } = await supabase
      .from('users')
      .select('role, organization_id')
      .eq('auth_user_id', session.user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Solo permitir acceso si es owner de la organización
    if (userProfile.role !== 'owner' || userProfile.organization_id !== params.id) {
      return NextResponse.json({ error: 'Acceso denegado. Solo el propietario puede subir el logo.' }, { status: 403 })
    }

    // Obtener el archivo del formulario
    const formData = await request.formData()
    const file = formData.get('logo') as File

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 })
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Tipo de archivo no permitido. Solo se permiten: JPG, PNG, GIF, WEBP' 
      }, { status: 400 })
    }

    // Validar tamaño del archivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'El archivo es demasiado grande. Máximo permitido: 5MB' 
      }, { status: 400 })
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const filename = `logo-${params.id}-${timestamp}.${fileExtension}`

    // Convertir archivo a buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Subir a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('organization-logos')
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('❌ Error uploading to Supabase Storage:', uploadError)
      return NextResponse.json({ error: 'Error al subir el archivo al almacenamiento' }, { status: 500 })
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('organization-logos')
      .getPublicUrl(filename)

    const logoUrl = publicUrl

    // Primero obtener el logo anterior para eliminarlo
    const { data: currentOrg } = await supabase
      .from('organizations')
      .select('logo_url')
      .eq('id', params.id)
      .single()

    // Actualizar la organización con la nueva URL del logo
    const { error: updateError } = await supabase
      .from('organizations')
      .update({ 
        logo_url: logoUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    // Si la actualización fue exitosa y había un logo anterior, eliminarlo
    if (!updateError && currentOrg?.logo_url) {
      // Extraer el nombre del archivo de la URL anterior
      const oldFilename = currentOrg.logo_url.split('/').pop()
      if (oldFilename && oldFilename.startsWith('logo-')) {
        await supabase.storage
          .from('organization-logos')
          .remove([oldFilename])
      }
    }

    if (updateError) {
      console.error('❌ Error updating organization logo:', updateError)
      return NextResponse.json({ error: 'Error al actualizar el logo en la base de datos' }, { status: 500 })
    }

    console.log('✅ Logo uploaded successfully:', {
      organizationId: params.id,
      filename,
      logoUrl,
      fileSize: file.size,
      fileType: file.type
    })

    return NextResponse.json({
      success: true,
      data: {
        logo_url: logoUrl,
        filename,
        message: 'Logo subido exitosamente'
      }
    })

  } catch (error) {
    console.error('❌ Error uploading logo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar autenticación
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que el usuario pertenece a la organización y es owner
    const { data: userProfile } = await supabase
      .from('users')
      .select('role, organization_id')
      .eq('auth_user_id', session.user.id)
      .single()

    if (!userProfile) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Solo permitir acceso si es owner de la organización
    if (userProfile.role !== 'owner' || userProfile.organization_id !== params.id) {
      return NextResponse.json({ error: 'Acceso denegado. Solo el propietario puede eliminar el logo.' }, { status: 403 })
    }

    // Primero obtener el logo actual para eliminarlo del storage
    const { data: currentOrg } = await supabase
      .from('organizations')
      .select('logo_url')
      .eq('id', params.id)
      .single()

    // Eliminar el logo de la base de datos
    const { error: updateError } = await supabase
      .from('organizations')
      .update({ 
        logo_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    // Si la actualización fue exitosa y había un logo, eliminarlo del storage
    if (!updateError && currentOrg?.logo_url) {
      const oldFilename = currentOrg.logo_url.split('/').pop()
      if (oldFilename && oldFilename.startsWith('logo-')) {
        const { error: deleteError } = await supabase.storage
          .from('organization-logos')
          .remove([oldFilename])
        
        if (deleteError) {
          console.error('❌ Error deleting file from storage:', deleteError)
          // No fallar la operación si no se puede eliminar el archivo
        }
      }
    }

    if (updateError) {
      console.error('❌ Error removing organization logo:', updateError)
      return NextResponse.json({ error: 'Error al eliminar el logo de la base de datos' }, { status: 500 })
    }

    console.log('✅ Logo removed successfully:', {
      organizationId: params.id
    })

    return NextResponse.json({
      success: true,
      data: {
        message: 'Logo eliminado exitosamente'
      }
    })

  } catch (error) {
    console.error('❌ Error removing logo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 