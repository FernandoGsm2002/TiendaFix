'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import {
  Home,
  Users,
  Wrench,
  Package,
  ShoppingCart,
  Unlock,
  UserCheck,
  BarChart3,
  Settings
} from 'lucide-react'

export default function DemoSidebar() {
  const { t } = useTranslations()
  const pathname = usePathname()

  const menuItems = [
    {
      icon: Home,
      label: t('sidebar.dashboard'),
      href: '/dashboard/demo',
      active: pathname === '/dashboard/demo'
    },
    {
      icon: Users,
      label: t('sidebar.customers'),
      href: '/dashboard/demo/clientes',
      active: pathname.startsWith('/dashboard/demo/clientes')
    },
    {
      icon: Wrench,
      label: t('sidebar.repairs'),
      href: '/dashboard/demo/reparaciones',
      active: pathname.startsWith('/dashboard/demo/reparaciones')
    },
    {
      icon: Package,
      label: t('sidebar.inventory'),
      href: '/dashboard/demo/inventario',
      active: pathname.startsWith('/dashboard/demo/inventario')
    },
    {
      icon: ShoppingCart,
      label: t('sidebar.sales'),
      href: '/dashboard/demo/ventas',
      active: pathname.startsWith('/dashboard/demo/ventas')
    },
    {
      icon: Unlock,
      label: t('sidebar.unlocks'),
      href: '/dashboard/demo/desbloqueos',
      active: pathname.startsWith('/dashboard/demo/desbloqueos')
    },
    {
      icon: UserCheck,
      label: t('sidebar.staff'),
      href: '/dashboard/demo/personal',
      active: pathname.startsWith('/dashboard/demo/personal')
    },
    {
      icon: BarChart3,
      label: t('sidebar.reports'),
      href: '/dashboard/demo/reportes',
      active: pathname.startsWith('/dashboard/demo/reportes')
    },
    {
      icon: Settings,
      label: t('sidebar.settings'),
      href: '/dashboard/demo/configuracion',
      active: pathname.startsWith('/dashboard/demo/configuracion')
    }
  ]

  return (
    <aside className="fixed left-0 top-16 w-64 h-full bg-white shadow-lg border-r border-gray-200 z-40">
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  item.active
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
      
      {/* Indicador de modo demo */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span className="text-sm font-medium text-orange-700">
              Modo Demo
            </span>
          </div>
          <p className="text-xs text-orange-600 mt-1">
            Solo visualización - Sin funcionalidad
          </p>
        </div>
      </div>
    </aside>
  )
} 