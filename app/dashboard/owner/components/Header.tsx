'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { Bell, Search, User, LogOut, Settings, Package, Wrench, Unlock } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { textColors } from '@/lib/utils/colors'
import { useTranslations } from '@/lib/contexts/TranslationContext'

interface NotificationData {
  totalNotifications: number;
  items: {
    lowStockProducts: any[];
    pendingRepairs: any[];
    pendingUnlocks: any[];
  };
}

export default function Header() {
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
    <header className="bg-white border-b border-gray-200 px-3 md:px-6 py-3 md:py-4 rounded-lg shadow-sm">
      <div className="flex items-center justify-between space-x-2 md:space-x-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
            {userProfile?.organization_name || t('navigation.myStore')}
          </h1>
          <p className={`text-xs md:text-sm ${textColors.secondary} hidden sm:block`}>{t('navigation.adminPanel')}</p>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Búsqueda - Solo visible en desktop */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('header.search')}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64"
            />
          </div>

          {/* Notificaciones */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
              <div className="absolute right-0 mt-2 w-72 md:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{t('notifications.title')}</p>
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
                              className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Package className="w-4 h-4 mr-3 text-amber-500 flex-shrink-0" />
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
                              className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Wrench className="w-4 h-4 mr-3 text-blue-500 flex-shrink-0" />
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
                               className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                             >
                               <Unlock className="w-4 h-4 mr-3 text-purple-500 flex-shrink-0" />
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
                <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-center">
                  <button onClick={fetchNotifications} className="text-xs text-blue-600 font-semibold hover:underline">
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
              className="flex items-center space-x-2 md:space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {userProfile?.name || 'Usuario'}
                </p>
                <p className={`text-xs ${textColors.tertiary} capitalize`}>
                  {userProfile?.role || 'owner'}
                </p>
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userProfile?.name}
                  </p>
                  <p className={`text-xs ${textColors.tertiary} truncate`}>{user?.email}</p>
                </div>
                
                <Link href="/dashboard/owner/configuracion" className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
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
