import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth/auth-context'
import { HeroUIProvider } from '@/lib/providers/heroui-provider'
import { TranslationProvider } from '@/lib/contexts/TranslationContext'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins'
})

export const metadata: Metadata = {
  title: 'TiendaFix',
  description: 'Sistema para gestion de talleres de reparacion de celulares',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        {/* Viewport optimizado para móviles siguiendo mejores prácticas */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover, interactive-widget=resizes-content" />
        
        {/* Meta tags para detección y formato */}
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        <meta name="color-scheme" content="light" />
        
        {/* PWA y móvil */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TiendaFix" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#f0fdf9" />
        
        {/* Optimización de rendering */}
        <meta name="renderer" content="webkit" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* Prevenir zoom automático en inputs en iOS */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={poppins.className}>
        <HeroUIProvider>
          <TranslationProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </TranslationProvider>
        </HeroUIProvider>
      </body>
    </html>
  )
} 