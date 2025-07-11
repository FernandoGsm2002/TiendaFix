'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Header from './Header'
import Sidebar from './Sidebar'
import { Container, DashboardContainer, MobileNavContainer } from '@/app/components/ui/Container'
import { useBreakpoint, useIsTouchDevice, useUserPreferences } from '@/lib/hooks/useBreakpoint'
import { useNavigationLayout } from '@/lib/hooks/useAdaptiveGrid'
import { Button, Divider } from '@heroui/react'
import { AnnouncementModal, useAnnouncements } from '@/app/components/AnnouncementModal'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isMobile, isTablet, isDesktop, isClient, windowSize } = useBreakpoint()
  const isTouchDevice = useIsTouchDevice()
  const { reducedMotion } = useUserPreferences()
  const navigationLayout = useNavigationLayout()
  
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const pathname = usePathname()
  
  // Hook para manejar anuncios
  const { isOpen: isAnnouncementOpen, onClose: onAnnouncementClose, currentVersion, markAsSeen } = useAnnouncements()

  // Auto-cerrar sidebar en móvil cuando cambia la ruta
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [pathname, isMobile])

  // Configurar estado inicial del sidebar
  useEffect(() => {
    if (isClient) {
      // En desktop, sidebar abierto por defecto si hay suficiente espacio
      if (isDesktop && windowSize.width >= 1200) {
        setSidebarOpen(true)
      } else if (isTablet && windowSize.width >= 900) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
      setIsLoaded(true)
    }
  }, [isClient, isDesktop, isTablet, windowSize.width])

  // Auto-colapsar sidebar en pantallas medianas
  useEffect(() => {
    if (isDesktop && windowSize.width < 1200 && windowSize.width >= 1024) {
      setSidebarOpen(false)
    } else if (isTablet && windowSize.width < 900) {
      setSidebarOpen(false)
    }
  }, [windowSize.width, isDesktop, isTablet])

  if (!isClient || !isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className={`
      min-h-screen bg-gray-50 dark:bg-gray-900
      transition-colors duration-300 ease-smooth
      ${!reducedMotion ? 'animate-fade-in' : ''}
    `}>
      
            {/* Sidebar Móvil (Drawer) - Funcional para hamburguesa */}
      {sidebarOpen && isMobile && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Área de fondo clickeable para cerrar */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="absolute top-0 left-0 h-full w-80 transform transition-transform duration-300 ease-in-out">
            <div className="h-full shadow-2xl border-0 bg-white rounded-none rounded-r-xl">
              <div className="p-0 h-full relative">
                <Sidebar 
                  isCollapsed={false}
                  onToggleCollapse={() => setSidebarOpen(!sidebarOpen)}
                  onMobileMenuClose={() => setSidebarOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Layout Principal */}
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
        
        {/* Sidebar Desktop */}
        {!isMobile && (
          <div className={`
            relative flex-shrink-0 z-30
            transition-all duration-300 ease-smooth
            ${sidebarOpen 
              ? (isDesktop ? 'w-72' : 'w-64') 
              : 'w-16'
            }
            ${isTablet && 'shadow-xl'}
            border-r border-gray-200 dark:border-gray-700
          `}>
            <Sidebar 
              isCollapsed={!sidebarOpen} 
              onToggleCollapse={() => setSidebarOpen(!sidebarOpen)}
            />
          </div>
        )}

        {/* Overlay para tablet cuando sidebar está abierto */}
        {isTablet && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Contenido Principal con separación */}
        <div className={`
          flex-1 flex flex-col overflow-hidden
          ${!isMobile ? 'ml-1' : ''}
        `}>
          
          {/* Header con separación */}
          <div className={`
            flex-shrink-0 z-20
            ${isMobile ? 'sticky top-0' : 'relative'}
            bg-white dark:bg-gray-800
            border-b border-gray-200 dark:border-gray-700
            ${!isMobile ? 'mx-2 mt-2 rounded-t-lg shadow-sm' : ''}
          `}>
            <Header 
              onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)}
              mobileMenuOpen={sidebarOpen}
            />
          </div>

          {/* Área de Contenido con espaciado optimizado */}
          <main className={`
            flex-1 overflow-auto
            ${!reducedMotion ? 'animate-slide-up' : ''}
            ${!isMobile ? 'bg-white dark:bg-gray-800 m-2 mt-0 rounded-b-lg shadow-sm' : 'bg-gray-50 dark:bg-gray-900'}
          `}>
            {/* Container responsivo optimizado */}
            <div className={`
              ${isMobile ? 'p-4' : isTablet ? 'p-6' : 'p-8'}
              ${!isMobile ? 'pt-6' : 'pt-4'}
              min-h-full
            `}>
              
              {/* Breadcrumb compacto - solo en desktop */}
              {!isMobile && pathname.split('/').filter(Boolean).length > 2 && (
                <div className="mb-4">
                  <nav className="flex" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-2">
                      <li className="inline-flex items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Dashboard
                        </span>
                      </li>
                      <li>
                        <div className="flex items-center">
                          <svg className="w-3 h-3 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                            {pathname.split('/')[3]?.replace('-', ' ')}
                          </span>
                        </div>
                      </li>
                    </ol>
                  </nav>
                </div>
              )}

              {/* Contenido dinámico */}
              <div className={`
                transition-all duration-300 ease-smooth
                ${!reducedMotion ? 'animate-fade-in' : ''}
                ${!isMobile ? 'space-y-6' : 'space-y-4'}
              `}>
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Indicador de conexión (opcional) */}
      {isClient && (
        <div className="fixed bottom-4 right-4 z-50 transition-all duration-300 ease-smooth">
          <div className={`
            flex items-center gap-2 px-3 py-2 rounded-full
            bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200
            border border-green-200 dark:border-green-700
            shadow-sm text-xs font-medium
            ${!reducedMotion ? 'animate-fade-in' : ''}
          `}>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            En línea
          </div>
        </div>
      )}

      {/* Modal de Anuncios */}
      {currentVersion && (
        <AnnouncementModal
          isOpen={isAnnouncementOpen}
          onClose={onAnnouncementClose}
          version={currentVersion}
          onMarkAsSeen={markAsSeen}
        />
      )}

      {/* Efectos de carga y transiciones suaves */}
      <style jsx global>{`
        /* Smooth scroll para toda la aplicación */
        html {
          scroll-behavior: ${reducedMotion ? 'auto' : 'smooth'};
        }
        
        /* Optimizaciones para touch devices */
        @media (hover: none) and (pointer: coarse) {
          .hover\\:scale-105:hover {
            transform: none;
          }
          
          .hover\\:shadow-lg:hover {
            box-shadow: none;
          }
        }
        
        /* Transiciones optimizadas */
        * {
          transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: ${reducedMotion ? '0ms' : '150ms'};
        }
        
        /* Mejores scrollbars */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgb(203 213 225 / 0.5);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgb(203 213 225 / 0.8);
        }
        
        /* Dark mode scrollbars */
        .dark ::-webkit-scrollbar-thumb {
          background: rgb(75 85 99 / 0.5);
        }
        
        .dark ::-webkit-scrollbar-thumb:hover {
          background: rgb(75 85 99 / 0.8);
        }
      `}</style>
    </div>
  )
}

export default DashboardLayout 