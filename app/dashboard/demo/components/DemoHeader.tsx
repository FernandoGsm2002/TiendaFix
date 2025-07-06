'use client'

import React from 'react'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import { Bell, Search, User, LogOut, Settings, Package, Wrench, Unlock, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { textColors } from '@/lib/utils/colors'
import { Button, Chip, Badge } from '@heroui/react'
import { useRouter } from 'next/navigation'

interface DemoHeaderProps {
  onMobileMenuToggle?: () => void;
  mobileMenuOpen?: boolean;
}

export default function DemoHeader({ onMobileMenuToggle, mobileMenuOpen }: DemoHeaderProps = {}) {
  const { t } = useTranslations()
  const router = useRouter()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  // Datos demo para notificaciones
  const notifications = {
    totalNotifications: 3,
    items: {
      lowStockProducts: [
        { id: 1, name: 'Protector iPhone 14', stock: 2 },
        { id: 2, name: 'Cargador Samsung', stock: 1 }
      ],
      pendingRepairs: [
        { id: 101, serial_number: 'IP14-2024-001' }
      ],
      pendingUnlocks: []
    }
  }

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
              <p className={`text-xs md:text-sm ${textColors.secondary} hidden sm:block`}>{t('navigation.adminPanel')}</p>
            </div>
            <Chip 
              color="warning" 
              variant="solid"
              size="sm"
              className="hidden sm:flex font-bold animate-pulse"
            >
              MODO DEMO
            </Chip>
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Búsqueda - Solo visible en desktop */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('header.search')}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64"
              disabled
            />
          </div>

          {/* Notificaciones */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notifications.totalNotifications > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">
                    {notifications.totalNotifications}
                  </span>
                </span>
              )}
            </button>
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 md:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{t('notifications.title')}</p>
                </div>
                <div className="py-1 max-h-80 overflow-y-auto">
                  {notifications.items.lowStockProducts.length > 0 && (
                    <div>
                      <p className={`px-4 py-2 text-xs font-bold ${textColors.tertiary} uppercase`}>{t('notifications.lowStock')}</p>
                      {notifications.items.lowStockProducts.map((item: any) => (
                        <div 
                          key={item.id}
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                          <Package className="w-4 h-4 mr-3 text-amber-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{item.name}</p>
                            <p className={`text-xs ${textColors.muted}`}>{t('notifications.stock')}: {item.stock}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {notifications.items.pendingRepairs.length > 0 && (
                    <div>
                      <p className={`px-4 pt-3 pb-2 text-xs font-bold ${textColors.tertiary} uppercase`}>{t('notifications.pendingRepairs')}</p>
                      {notifications.items.pendingRepairs.map((item: any) => (
                        <div 
                          key={item.id}
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                          <Wrench className="w-4 h-4 mr-3 text-blue-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{t('notifications.repair')} #{item.id}</p>
                            <p className={`text-xs ${textColors.muted} truncate`}>{t('notifications.serialNumber')}: {item.serial_number}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="px-4 py-2 border-t border-gray-100 bg-blue-50 text-center">
                    <p className="text-xs text-blue-600 font-semibold">
                      📋 Datos de demostración - Solo vista previa
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Perfil de usuario */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 md:space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  Usuario Demo
                </p>
                <p className={`text-xs ${textColors.tertiary} capitalize`}>
                  Solo visualización
                </p>
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Usuario Demo
                  </p>
                  <p className={`text-xs ${textColors.tertiary} truncate`}>demo@tiendafix.com</p>
                </div>
                
                <div className="px-4 py-2 text-sm text-gray-500 cursor-not-allowed flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  {t('header.configuration')} (Demo)
                </div>
                
                <button 
                  onClick={handleExitDemo}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Salir del Demo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 