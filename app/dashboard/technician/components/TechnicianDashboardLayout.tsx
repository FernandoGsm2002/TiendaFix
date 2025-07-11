'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import TechnicianSidebar from './TechnicianSidebar'
import TechnicianHeader from './TechnicianHeader'
import { Spinner, Card, CardBody, Button } from '@heroui/react'
import { AlertTriangle, ArrowLeft, Menu, X } from 'lucide-react'
import { AnnouncementModal, useAnnouncements } from '@/app/components/AnnouncementModal'

interface TechnicianDashboardLayoutProps {
  children: React.ReactNode
}

export default function TechnicianDashboardLayout({ children }: TechnicianDashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { loading, userProfile } = useAuth()
  
  // Hook para manejar anuncios
  const { isOpen: isAnnouncementOpen, onClose: onAnnouncementClose, currentVersion, markAsSeen } = useAnnouncements()

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 relative overflow-hidden p-4">
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-20 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-lg relative z-10">
          <CardBody className="text-center p-8 md:p-10">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Spinner size="lg" color="white" />
              </div>
            </div>
            <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Cargando Panel de Técnico
            </h3>
            <p className="text-gray-600 font-medium text-sm md:text-base">Preparando tu área de trabajo...</p>
            <div className="mt-6 flex justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  if (userProfile?.role !== 'technician') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 relative overflow-hidden p-4">
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-20 right-20 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/90 backdrop-blur-lg relative z-10">
          <CardBody className="text-center p-8 md:p-10">
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-8 md:w-10 h-8 md:h-10 text-white" />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-3">
              Acceso Denegado
            </h1>
            <p className="text-gray-600 mb-8 text-base md:text-lg leading-relaxed">
              No tienes permisos para acceder a esta sección del sistema. 
              Solo los técnicos autorizados pueden ingresar al panel de trabajo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                color="danger"
                variant="shadow"
                size="lg"
                startContent={<ArrowLeft className="w-5 h-5" />}
                onClick={() => window.history.back()}
                className="font-semibold"
              >
                Volver Atrás
              </Button>
              <Button 
                color="primary"
                variant="bordered"
                size="lg"
                onClick={() => window.location.href = '/auth/login'}
                className="font-semibold"
              >
                Iniciar Sesión
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 relative overflow-hidden">
      {/* Elementos decorativos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>



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
            <Card className="h-full shadow-2xl border-0 bg-white/95 backdrop-blur-xl rounded-none rounded-r-xl">
              <CardBody className="p-0 h-full relative">
                <TechnicianSidebar 
                  isCollapsed={false}
                  onToggleCollapse={handleToggleSidebar}
                  onMobileMenuClose={closeMobileMenu}
                />
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      <div className="min-h-screen max-w-screen-2xl mx-auto p-4 md:p-6 relative z-10">
        <div className="h-screen flex gap-4 md:gap-6">
          {/* Sidebar Desktop */}
          <div className="hidden lg:flex flex-shrink-0">
            <Card className="h-full shadow-2xl border-0 bg-white/95 backdrop-blur-xl">
              <CardBody className="p-0 h-full">
                <TechnicianSidebar 
                  isCollapsed={sidebarCollapsed}
                  onToggleCollapse={handleToggleSidebar}
                />
              </CardBody>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col gap-4 md:gap-6">
            {/* Header */}
            <div className="flex-shrink-0">
              <TechnicianHeader 
                onMobileMenuToggle={handleMobileMenuToggle}
                mobileMenuOpen={mobileMenuOpen}
              />
            </div>
            
            {/* Content Area */}
            <Card className="flex-1 shadow-2xl border-0 bg-white/95 backdrop-blur-xl overflow-hidden">
              <CardBody className="p-4 md:p-8 h-full overflow-y-auto">
                <div className="relative">
                  {children}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Anuncios */}
      {currentVersion && (
        <AnnouncementModal
          isOpen={isAnnouncementOpen}
          onClose={onAnnouncementClose}
          version={currentVersion}
          onMarkAsSeen={markAsSeen}
        />
      )}

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
} 