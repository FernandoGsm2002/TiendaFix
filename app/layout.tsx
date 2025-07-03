import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth/auth-context'
import { HeroUIProvider } from '@/lib/providers/heroui-provider'
import { TranslationProvider } from '@/lib/contexts/TranslationContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TiendaFix - Sistema de Gestión de Reparaciones',
  description: 'Sistema completo para gestión de tiendas de reparación de dispositivos electrónicos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
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