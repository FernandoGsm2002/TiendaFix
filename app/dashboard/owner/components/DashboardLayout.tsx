'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import Sidebar from './Sidebar'
import Header from './Header'
import { Spinner, Card, CardBody, Button } from '@heroui/react'
import { Menu, X } from 'lucide-react'
import { useTranslations } from '@/lib/contexts/TranslationContext'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { loading, isOwner } = useAuth()
  const { t } = useTranslations()

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-sm">
          <CardBody className="text-center p-8">
            <Spinner size="lg" color="primary" />
            <p className="mt-4 text-gray-600 font-medium">{t('common.loading')}</p>
          </CardBody>
        </Card>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
        <Card className="w-full max-w-md border border-red-200">
          <CardBody className="text-center p-8">
            <div className="text-red-500 text-4xl mb-4">🚫</div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
            <p className="text-gray-600 mb-6 text-sm md:text-base">No tienes permisos para acceder a esta sección.</p>
            <button 
              onClick={() => window.history.back()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm md:text-base"
            >
              Volver
            </button>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
      {/* Botón de menú móvil */}
      <Button
        isIconOnly
        variant="solid"
        color="primary"
        className={`fixed top-4 left-4 transition-all duration-300 lg:hidden shadow-lg z-50`}
        onPress={handleMobileMenuToggle}
        aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar Móvil (Drawer) - Sin overlay problemático */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Área de fondo clickeable para cerrar */}
          <div 
            className="absolute inset-0 bg-black/30"
            onClick={closeMobileMenu}
          />
          
          {/* Sidebar */}
          <div className="absolute top-0 left-0 h-full w-80 transform transition-transform duration-300 ease-in-out">
            <Card className="h-full shadow-2xl border-0 bg-white rounded-none rounded-r-xl">
              <CardBody className="p-0 h-full relative">
                <Sidebar 
                  isCollapsed={false}
                  onToggleCollapse={handleToggleSidebar}
                  onMobileMenuClose={closeMobileMenu}
                />
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      <div className="min-h-screen max-w-screen-2xl mx-auto p-2 md:p-4">
        <div className="h-screen flex gap-2 md:gap-4">
          {/* Sidebar Desktop */}
          <div className="hidden lg:flex flex-shrink-0">
            <Card className="h-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardBody className="p-0 h-full">
                <Sidebar 
                  isCollapsed={sidebarCollapsed}
                  onToggleCollapse={handleToggleSidebar}
                />
              </CardBody>
            </Card>
          </div>
          
          {/* Contenido principal */}
          <div className="flex-1 flex flex-col gap-2 md:gap-4 pt-16 lg:pt-0">
            <Header />
            
            <Card className="flex-1 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardBody className="p-3 md:p-6 h-full overflow-y-auto">
                {children}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 