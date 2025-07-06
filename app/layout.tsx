import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth/auth-context'
import { HeroUIProvider } from '@/lib/providers/heroui-provider'
import { TranslationProvider } from '@/lib/contexts/TranslationContext'

const manrope = Manrope({ subsets: ['latin'] })

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
      <body className={manrope.className}>
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