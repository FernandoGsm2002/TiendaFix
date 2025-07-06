'use client'

import { useState } from 'react'
import React from 'react'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import DemoHeader from './DemoHeader'
import DemoSidebar from './DemoSidebar'
import { Card, CardBody, Spinner } from '@heroui/react'
import { Menu, X } from 'lucide-react'

interface DemoLayoutProps {
  children: React.ReactNode
}

export default function DemoLayout({ children }: DemoLayoutProps) {
  const { t } = useTranslations()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
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
                <DemoSidebar 
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
                <DemoSidebar 
                  isCollapsed={sidebarCollapsed}
                  onToggleCollapse={handleToggleSidebar}
                />
              </CardBody>
            </Card>
          </div>
          
          {/* Contenido principal */}
          <div className="flex-1 flex flex-col gap-2 md:gap-4">
            <DemoHeader 
              onMobileMenuToggle={handleMobileMenuToggle}
              mobileMenuOpen={mobileMenuOpen}
            />
            
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