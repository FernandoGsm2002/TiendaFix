'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import Sidebar from './Sidebar'
import Header from './Header'
import { Spinner, Card, CardBody } from '@heroui/react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { loading, isOwner } = useAuth()

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="w-80">
          <CardBody className="text-center p-8">
            <Spinner size="lg" color="primary" />
            <p className="mt-4 text-gray-600 font-medium">Cargando dashboard...</p>
          </CardBody>
        </Card>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
        <Card className="w-96 border border-red-200">
          <CardBody className="text-center p-8">
            <div className="text-red-500 text-4xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
            <p className="text-gray-600 mb-6">No tienes permisos para acceder a esta sección.</p>
            <button 
              onClick={() => window.history.back()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
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
      <div className="min-h-screen max-w-screen-2xl mx-auto p-4">
        <div className="h-screen flex gap-4">
          <div className="flex-shrink-0">
            <Card className="h-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardBody className="p-0 h-full">
                <Sidebar 
                  isCollapsed={sidebarCollapsed}
                  onToggleCollapse={handleToggleSidebar}
                />
              </CardBody>
            </Card>
          </div>
          
          <div className="flex-1 flex flex-col gap-4">
            <Header />
            
            <Card className="flex-1 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardBody className="p-6 h-full overflow-y-auto">
                {children}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 