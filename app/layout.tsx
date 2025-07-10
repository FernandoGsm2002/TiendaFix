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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
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