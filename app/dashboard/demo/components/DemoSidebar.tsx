'use client'

import { useState } from 'react'
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
  Settings,
  ChevronLeft,
  ChevronRight,
  Eye,
  Crown
} from 'lucide-react'
import { 
  Button, 
  Tooltip,
  Chip,
  Divider
} from '@heroui/react'

interface DemoSidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
  onMobileMenuClose?: () => void
}

// Función para obtener los elementos del menú con traducciones
const getMenuItems = (t: (key: string) => string) => [
  {
    id: 'dashboard',
    label: t('navigation.dashboard'),
    href: '/dashboard/demo',
    icon: Home,
    color: 'text-blue-600',
    gradient: 'from-blue-400 to-blue-600'
  },
  {
    id: 'reparaciones',
    label: t('navigation.repairs'),
    href: '/dashboard/demo/reparaciones',
    icon: Wrench,
    color: 'text-orange-600',
    gradient: 'from-orange-400 to-red-600'
  },
  {
    id: 'clientes',
    label: t('navigation.customers'),
    href: '/dashboard/demo/clientes',
    icon: Users,
    color: 'text-green-600',
    gradient: 'from-green-400 to-emerald-600'
  },
  {
    id: 'inventario',
    label: t('navigation.inventory'),
    href: '/dashboard/demo/inventario',
    icon: Package,
    color: 'text-amber-600',
    gradient: 'from-amber-400 to-orange-600'
  },
  {
    id: 'ventas',
    label: t('navigation.sales'),
    href: '/dashboard/demo/ventas',
    icon: ShoppingCart,
    color: 'text-emerald-600',
    gradient: 'from-emerald-400 to-green-600'
  },
  {
    id: 'desbloqueos',
    label: t('navigation.unlocks'),
    href: '/dashboard/demo/desbloqueos',
    icon: Unlock,
    color: 'text-cyan-600',
    gradient: 'from-cyan-400 to-blue-600'
  },
  {
    id: 'personal',
    label: t('navigation.staff'),
    href: '/dashboard/demo/personal',
    icon: UserCheck,
    color: 'text-indigo-600',
    gradient: 'from-indigo-400 to-purple-600'
  },
  {
    id: 'reportes',
    label: t('navigation.reports'),
    href: '/dashboard/demo/reportes',
    icon: BarChart3,
    color: 'text-pink-600',
    gradient: 'from-pink-400 to-rose-600'
  },
  {
    id: 'configuracion',
    label: t('navigation.settings'),
    href: '/dashboard/demo/configuracion',
    icon: Settings,
    color: 'text-gray-600',
    gradient: 'from-gray-400 to-gray-600'
  }
]

export default function DemoSidebar({ isCollapsed, onToggleCollapse, onMobileMenuClose }: DemoSidebarProps) {
  const { t } = useTranslations()
  const pathname = usePathname()
  
  const menuItems = getMenuItems(t)

  const handleMenuItemClick = () => {
    if (onMobileMenuClose) {
      onMobileMenuClose()
    }
  }

  const SidebarMenuItem = ({ item }: { item: typeof menuItems[0] }) => {
    const isActive = pathname === item.href
    const Icon = item.icon

    if (isCollapsed) {
      return (
        <Tooltip
          content={item.label}
          placement="right"
          color="primary"
          classNames={{ 
            content: "bg-gray-900 text-white border border-gray-700 shadow-2xl backdrop-blur-lg" 
          }}
          delay={200}
        >
          <Button
            as={Link}
            href={item.href}
            isIconOnly
            variant={isActive ? "solid" : "light"}
            color={isActive ? "primary" : "default"}
            className={`
              w-12 h-12 m-1 transition-all duration-300
              ${isActive 
                ? `bg-gradient-to-br ${item.gradient} shadow-lg transform scale-105` 
                : 'hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-200 hover:scale-105'
              }
            `}
            onClick={handleMenuItemClick}
          >
            <Icon className={`h-5 w-5 ${isActive ? 'text-white' : item.color}`} />
          </Button>
        </Tooltip>
      );
    }

    return (
      <Button
        as={Link}
        href={item.href}
        variant="light"
        className={`
          w-full justify-start p-3 h-12 rounded-lg transition-all duration-300 mb-1
          ${isActive 
            ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg transform scale-[1.02]` 
            : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md'
          }
        `}
        onClick={handleMenuItemClick}
      >
        <div className="flex items-center w-full">
          <div className={`
            p-2 rounded-lg mr-3 transition-all
            ${isActive 
              ? 'bg-white/20 backdrop-blur-sm' 
              : `bg-gradient-to-br ${item.gradient} shadow-md`
            }
          `}>
            <Icon className={`h-4 w-4 ${isActive ? 'text-white' : item.color}`} />
          </div>
          <div className="flex-1 text-left flex items-center">
            <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-800'}`}>
              {item.label}
            </p>
          </div>
          {isActive && (
            <div className="ml-2">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      </Button>
    );
  }

  return (
    <div className="h-full flex flex-col relative w-64">
      {/* Header del Sidebar */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <Crown className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">TiendaFix</h2>
                <Chip
                  size="sm"
                  color="warning"
                  variant="flat"
                  startContent={<Eye className="h-3 w-3" />}
                  className="text-xs"
                >
                  DEMO
                </Chip>
              </div>
            </div>
          )}
          
          {/* Botón de colapsar - Solo desktop */}
          <Button
            isIconOnly
            variant="light"
            color="primary"
            size="sm"
            className="hidden lg:flex"
            onPress={onToggleCollapse}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navegación */}
      <div className="flex-1 p-3 overflow-y-auto">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id} item={item} />
          ))}
        </nav>
      </div>

      {/* Footer del Sidebar */}
      <div className="p-3 border-t border-gray-100">
        {!isCollapsed ? (
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-orange-700">
                Modo Demo
              </span>
            </div>
            <p className="text-xs text-orange-600 leading-relaxed">
              Solo visualización
            </p>
          </div>
        ) : (
          <Tooltip
            content="Modo Demo Activo"
            placement="right"
            color="warning"
          >
            <div className="w-12 h-3 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full animate-pulse mx-auto"></div>
          </Tooltip>
        )}
      </div>
    </div>
  )
} 