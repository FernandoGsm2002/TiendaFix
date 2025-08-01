﻿'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { Bell, Search, User, LogOut, Settings, Package, Wrench, Unlock, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { textColors } from '@/lib/utils/colors'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import { Button } from '@heroui/react'

interface NotificationData {
  totalNotifications: number;
  items: {
    lowStockProducts: any[];
    pendingRepairs: any[];
    pendingUnlocks: any[];
  };
}

interface HeaderProps {
  onMobileMenuToggle?: () => void;
  mobileMenuOpen?: boolean;
}

export default function Header({ onMobileMenuToggle, mobileMenuOpen }: HeaderProps = {}) {
  const { user, userProfile, signOut } = useAuth()
  const { t } = useTranslations()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications')
      if (!response.ok) throw new Error('Error al cargar notificaciones')
      const result = await response.json()
      setNotifications(result.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/auth/login'
  }

  return (
    <header className="bg-[#F8F9FA] border-b border-[#E8F0FE] px-3 md:px-6 py-3 md:py-4 rounded-lg shadow-sm">
      <div className="flex items-center justify-between space-x-2 md:space-x-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Botón de menú móvil integrado */}
          {onMobileMenuToggle && (
            <Button
              isIconOnly
              variant="light"
              className="lg:hidden p-2 text-[#6C757D] hover:text-[#004085] hover:bg-[#E8F0FE]"
              onPress={onMobileMenuToggle}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
          
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-2xl font-bold text-[#343A40] truncate">
              {userProfile?.organization_name ? `${userProfile.organization_name} - ${t('navigation.adminPanel')}` : t('navigation.adminPanel')}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Búsqueda - Solo visible en desktop */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6C757D]" />
            <input
              type="text"
              placeholder={t('header.search')}
              className="pl-10 pr-4 py-2 border border-[#E8F0FE] rounded-lg text-sm focus:ring-2 focus:ring-[#004085] focus:border-[#004085] w-64 text-[#343A40] placeholder-[#6C757D]"
            />
          </div>

          {/* Notificaciones */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-[#6C757D] hover:text-[#004085] hover:bg-[#E8F0FE] rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notifications && notifications.totalNotifications > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">
                    {notifications.totalNotifications}
                  </span>
                </span>
              )}
            </button>
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 md:w-80 bg-[#F8F9FA] rounded-lg shadow-lg border border-[#E8F0FE] z-50 max-h-96 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E8F0FE]">
                  <p className="text-sm font-semibold text-[#343A40]">{t('notifications.title')}</p>
                </div>
                <div className="py-1 max-h-80 overflow-y-auto">
                  {loading ? (
                    <p className={`text-sm ${textColors.secondary} px-4 py-3`}>{t('notifications.loading')}</p>
                  ) : notifications && notifications.totalNotifications > 0 ? (
                    <>
                      {notifications.items.lowStockProducts.length > 0 && (
                        <div>
                          <p className={`px-4 py-2 text-xs font-bold ${textColors.tertiary} uppercase`}>{t('notifications.lowStock')}</p>
                          {notifications.items.lowStockProducts.map((item: any) => (
                            <Link 
                              key={item.id} 
                              href="/dashboard/owner/inventario" 
                              onClick={() => setIsNotificationsOpen(false)}
                              className="flex items-center px-4 py-3 text-sm text-[#343A40] hover:bg-[#E8F0FE]"
                            >
                              <Package className="w-4 h-4 mr-3 text-[#6C757D] flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium truncate">{item.name}</p>
                                <p className={`text-xs ${textColors.muted}`}>{t('notifications.stock')}: {item.stock}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                      {notifications.items.pendingRepairs.length > 0 && (
                        <div>
                          <p className={`px-4 pt-3 pb-2 text-xs font-bold ${textColors.tertiary} uppercase`}>{t('notifications.pendingRepairs')}</p>
                          {notifications.items.pendingRepairs.map((item: any) => (
                            <Link 
                              key={item.id} 
                              href="/dashboard/owner/reparaciones" 
                              onClick={() => setIsNotificationsOpen(false)}
                              className="flex items-center px-4 py-3 text-sm text-[#343A40] hover:bg-[#E8F0FE]"
                            >
                              <Wrench className="w-4 h-4 mr-3 text-[#6C757D] flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium">{t('notifications.repair')} #{item.id}</p>
                                <p className={`text-xs ${textColors.muted} truncate`}>{t('notifications.serialNumber')}: {item.serial_number}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                      {notifications.items.pendingUnlocks.length > 0 && (
                         <div>
                           <p className={`px-4 pt-3 pb-2 text-xs font-bold ${textColors.tertiary} uppercase`}>{t('notifications.pendingUnlocks')}</p>
                           {notifications.items.pendingUnlocks.map((item: any) => (
                             <Link 
                               key={item.id} 
                               href="/dashboard/owner/desbloqueos" 
                               onClick={() => setIsNotificationsOpen(false)}
                               className="flex items-center px-4 py-3 text-sm text-[#343A40] hover:bg-[#E8F0FE]"
                             >
                               <Unlock className="w-4 h-4 mr-3 text-[#6C757D] flex-shrink-0" />
                               <div className="min-w-0 flex-1">
                                 <p className="font-medium">{t('notifications.unlock')} #{item.id}</p>
                                 <p className={`text-xs ${textColors.muted} truncate`}>IMEI: {item.imei}</p>
                               </div>
                             </Link>
                           ))}
                         </div>
                      )}
                    </>
                  ) : (
                    <p className={`text-sm ${textColors.secondary} px-4 py-10 text-center`}>{t('notifications.noNotifications')}</p>
                  )}
                </div>
                <div className="px-4 py-2 border-t border-[#E8F0FE] bg-[#E8F0FE] text-center">
                  <button onClick={fetchNotifications} className="text-xs text-[#004085] font-semibold hover:underline">
                    {t('notifications.refresh')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Perfil de usuario */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 md:space-x-3 p-2 hover:bg-[#E8F0FE] rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-[#004085] to-[#003366] rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-[#343A40]">
                  {userProfile?.name || 'Usuario'}
                </p>
                <p className="text-xs text-[#6C757D] capitalize">
                  {userProfile?.role || 'owner'}
                </p>
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#F8F9FA] rounded-lg shadow-lg border border-[#E8F0FE] py-1 z-50">
                <div className="px-4 py-2 border-b border-[#E8F0FE]">
                  <p className="text-sm font-medium text-[#343A40] truncate">
                    {userProfile?.name}
                  </p>
                  <p className="text-xs text-[#6C757D] truncate">{user?.email}</p>
                </div>
                
                <Link href="/dashboard/owner/configuracion" className="w-full text-left px-4 py-2 text-sm text-[#343A40] hover:bg-[#E8F0FE] flex items-center">
                  <Settings className="w-4 h-4 mr-2 text-[#6C757D]" />
                  {t('header.configuration')}
                </Link>
                
                <button 
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('header.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
