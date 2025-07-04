import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { isNetworkError } from '@/lib/supabase/retry-helpers'

export async function middleware(req: NextRequest) {
  try {
    // No aplicar middleware a la página de reconexión
    if (req.nextUrl.pathname === '/auth/reconnect') {
      return NextResponse.next()
    }

    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })
    
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    // Manejar errores de red específicamente
    if (error && isNetworkError(error)) {
      console.error('🔴 Error de red en middleware:', error)
      // Permitir un retry suave redirigiendo a una página de reconexión
      return NextResponse.redirect(new URL('/auth/reconnect', req.url))
    }

    // Si no hay sesión y la ruta requiere autenticación
    // Excluir el dashboard demo que no requiere autenticación
    if (!session && req.nextUrl.pathname.startsWith('/dashboard') && !req.nextUrl.pathname.startsWith('/dashboard/demo')) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    return res
  } catch (error) {
    console.error('🔴 Error en middleware:', error)
    // En caso de error crítico, redirigir a reconexión
    if (error instanceof Error && isNetworkError(error)) {
      return NextResponse.redirect(new URL('/auth/reconnect', req.url))
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
    '/auth/reconnect'
  ],
} 