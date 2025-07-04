'use client'

import React from 'react'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import { Bell, User, LogOut, Menu, X } from 'lucide-react'
import { Button, Chip, Badge } from '@heroui/react'
import { useRouter } from 'next/navigation'

interface DemoHeaderProps {
  onMobileMenuToggle?: () => void;
  mobileMenuOpen?: boolean;
}

export default function DemoHeader({ onMobileMenuToggle, mobileMenuOpen }: DemoHeaderProps = {}) {
  const { t } = useTranslations()
  const router = useRouter()

  const handleExitDemo = () => {
    router.push('/auth/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 px-3 md:px-6 py-3 md:py-4 rounded-lg shadow-sm">
      <div className="flex items-center justify-between space-x-2 md:space-x-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Botón de menú móvil integrado */}
          {onMobileMenuToggle && (
            <Button
              isIconOnly
              variant="light"
              color="primary"
              className="lg:hidden p-2"
              onPress={onMobileMenuToggle}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
          
          <div className="flex-1 min-w-0 flex items-center gap-3">
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                TiendaFix Central
              </h1>
              <p className="text-xs md:text-sm text-gray-600 hidden sm:block">Panel de Administración</p>
            </div>
            <Chip 
              color="warning" 
              variant="solid"
              size="sm"
              className="hidden sm:flex font-bold"
            >
              MODO DEMO
            </Chip>
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Notificaciones */}
          <Button
            isIconOnly
            variant="light"
            color="primary"
            className="relative"
            aria-label="Notificaciones"
          >
            <Bell className="h-5 w-5" />
            <Badge
              color="danger"
              size="sm"
              className="absolute -top-1 -right-1"
            >
              3
            </Badge>
          </Button>

          {/* Usuario Demo */}
          <div className="flex items-center space-x-2 md:space-x-3 p-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900">Usuario Demo</p>
              <p className="text-xs text-gray-500">Solo visualización</p>
            </div>
          </div>

          {/* Botón Salir */}
          <Button
            color="danger"
            variant="light"
            startContent={<LogOut className="h-4 w-4" />}
            onPress={handleExitDemo}
            className="hidden sm:flex"
          >
            Salir Demo
          </Button>

          {/* Botón Salir (móvil) */}
          <Button
            isIconOnly
            color="danger"
            variant="light"
            className="sm:hidden"
            onPress={handleExitDemo}
            aria-label="Salir del Demo"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
} 