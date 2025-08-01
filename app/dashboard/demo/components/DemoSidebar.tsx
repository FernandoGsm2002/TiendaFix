'use client'

import { useState } from 'react'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import {
  BarChart3, Wrench, Users, Smartphone, Package, 
  ShoppingCart, Unlock, UserCheck, FileBarChart, 
  Settings, ChevronLeft, ChevronRight, Building, LogOut, 
  Activity, Eye, Zap, Sparkles, Crown
} from 'lucide-react'
import { 
  Avatar, 
  Button, 
  Tooltip,
  Card,
  CardBody,
  Chip,
  Divider
} from '@heroui/react'
import { useRouter } from 'next/navigation'

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
    icon: BarChart3,
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-50 to-blue-100'
  },
  {
    id: 'reparaciones',
    label: t('navigation.repairs'),
    href: '/dashboard/demo/reparaciones',
    icon: Wrench,
    color: 'text-orange-600',
    gradient: 'from-orange-400 to-red-600',
    bgGradient: 'from-orange-50 to-red-100'
  },
  {
    id: 'clientes',
    label: t('navigation.customers'),
    href: '/dashboard/demo/clientes',
    icon: Users,
    color: 'text-green-600',
    gradient: 'from-green-400 to-emerald-600',
    bgGradient: 'from-green-50 to-emerald-100'
  },
  {
    id: 'inventario',
    label: t('navigation.inventory'),
    href: '/dashboard/demo/inventario',
    icon: Package,
    color: 'text-amber-600',
    gradient: 'from-amber-400 to-orange-600',
    bgGradient: 'from-amber-50 to-orange-100'
  },
  {
    id: 'ventas',
    label: t('navigation.pos'),
    href: '/dashboard/demo/ventas',
    icon: ShoppingCart,
    color: 'text-emerald-600',
    gradient: 'from-emerald-400 to-green-600',
    bgGradient: 'from-emerald-50 to-green-100'
  },
  {
    id: 'desbloqueos',
    label: t('navigation.unlocks'),
    href: '/dashboard/demo/desbloqueos',
    icon: Unlock,
    color: 'text-cyan-600',
    gradient: 'from-cyan-400 to-blue-600',
    bgGradient: 'from-cyan-50 to-blue-100'
  },
  {
    id: 'personal',
    label: t('navigation.staff'),
    href: '/dashboard/demo/personal',
    icon: UserCheck,
    color: 'text-indigo-600',
    gradient: 'from-indigo-400 to-purple-600',
    bgGradient: 'from-indigo-50 to-purple-100'
  },
  {
    id: 'reportes',
    label: t('navigation.reports'),
    href: '/dashboard/demo/reportes',
    icon: FileBarChart,
    color: 'text-pink-600',
    gradient: 'from-pink-400 to-rose-600',
    bgGradient: 'from-pink-50 to-rose-100'
  },
  {
    id: 'configuracion',
    label: t('navigation.settings'),
    href: '/dashboard/demo/configuracion',
    icon: Settings,
    color: 'text-gray-600',
    gradient: 'from-gray-400 to-gray-600',
    bgGradient: 'from-gray-100 to-gray-200'
  }
]

export default function DemoSidebar({ isCollapsed, onToggleCollapse, onMobileMenuClose }: DemoSidebarProps) {
  const { t } = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  
  const menuItems = getMenuItems(t)

  const handleExitDemo = () => {
    router.push('/auth/login')
  }

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
          classNames={{ 
            content: "bg-gray-800 text-white border border-gray-700 shadow-2xl backdrop-blur-lg" 
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
              w-12 h-12 m-1 transition-all duration-300 rounded-xl
              ${isActive 
                ? `bg-gradient-to-br ${item.gradient} text-white shadow-lg transform scale-105` 
                : `text-gray-600 hover:bg-gradient-to-br hover:${item.bgGradient} hover:scale-105`
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
          w-full justify-start p-4 h-14 rounded-xl transition-all duration-300 mb-2 group
          ${isActive 
            ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg transform scale-[1.02]` 
            : `hover:bg-gradient-to-r hover:${item.bgGradient} hover:shadow-md`
          }
        `}
        onClick={handleMenuItemClick}
      >
        <div className="flex items-center w-full">
          <div className={`
            p-2.5 rounded-lg mr-4 transition-all duration-300
            ${isActive 
              ? 'bg-white/20 backdrop-blur-sm' 
              : `bg-white shadow-md group-hover:bg-gradient-to-br group-hover:${item.bgGradient}`
            }
          `}>
            <Icon className={`h-5 w-5 ${isActive ? 'text-white' : item.color}`} />
          </div>
          <div className="flex-1 text-left flex items-center">
            <p className={`text-base font-bold ${isActive ? 'text-white' : 'text-gray-700'}`}>
              {item.label}
            </p>
          </div>

        </div>
      </Button>
    );
  };

  return (
    <div className={`
      flex h-full flex-col bg-gradient-to-b from-gray-50 to-gray-100 transition-all duration-300 ease-in-out border-r border-gray-200/80
      ${isCollapsed ? 'w-20' : 'w-80'}
    `}>
      {/* Header del Sidebar con gradiente */}
      <div className={`
        flex shrink-0 items-center justify-between p-4 border-b border-gray-200/80
        ${isCollapsed ? 'h-20' : 'h-24'}
      `}>
        {!isCollapsed && (
          <Link href="/dashboard/demo" className="flex items-center gap-3 group">
            <div className="relative">
              <Avatar
                icon={<Crown className="h-6 w-6" />}
                size="lg"
                classNames={{ 
                  base: "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg group-hover:shadow-xl transition-all",
                  icon: "text-white"
                }}
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Demo TiendaFix
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <Chip
                    size="sm"
                    color="warning"
                    variant="solid"
                    startContent={<Eye className="h-3 w-3" />}
                    className="text-xs font-bold"
                  >
                    PREVIEW
                  </Chip>
                </div>
              </div>
            </div>
          </Link>
        )}
        <Button
          isIconOnly
          variant="light"
          onPress={onToggleCollapse}
          className={`
            h-10 w-10 text-gray-500 hover:text-blue-600 hover:bg-blue-100 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md
            ${isCollapsed ? 'mx-auto' : ''}
          `}
          aria-label={isCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-hidden">
        {/* Badge de estado cuando está colapsado */}
        {isCollapsed && (
          <div className="p-2">
            <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto"></div>
          </div>
        )}

        {/* Navegación Principal */}
        <nav className={`flex-1 overflow-y-auto py-4 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          {!isCollapsed && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Vista Previa</p>
              </div>
              <Divider className="bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            </div>
          )}
          
          <div className={`space-y-1 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.id} item={item} />
            ))}
          </div>
        </nav>

        {/* Footer del sidebar */}
        <div className={`p-4 border-t border-gray-200/80 bg-gradient-to-r from-gray-50/50 to-gray-100 ${isCollapsed ? 'px-2' : ''}`}>
          {isCollapsed ? (
            <Tooltip 
              content="Salir del Demo" 
              placement="right"
              classNames={{ 
                content: "bg-red-600 text-white border border-red-700 shadow-2xl" 
              }}
            >
              <Button 
                isIconOnly 
                variant="light" 
                size="lg"
                className="w-12 h-12 text-red-500 hover:text-red-600 hover:bg-gradient-to-br hover:from-red-50 hover:to-red-100 transition-all duration-300 rounded-xl shadow-sm hover:shadow-md mx-auto"
                onPress={handleExitDemo}
                aria-label="Salir del demo"
                autoFocus={false}
                tabIndex={-1}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </Tooltip>
          ) : (
            <>
              <Button 
                variant="light" 
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 rounded-xl p-4 h-auto mb-4"
                onPress={handleExitDemo}
                autoFocus={false}
                tabIndex={-1}
                onFocus={(e) => (e.target as HTMLButtonElement).blur()}
              >
                <div className="flex items-center w-full">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-red-100 to-red-200 mr-3">
                    <LogOut className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="font-medium">Salir del Demo</span>
                </div>
              </Button>
              
              {/* Demo info banner */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                  <Chip size="sm" color="primary" variant="dot" className="text-xs text-black">
                    Modo Demostración
                  </Chip>
                </div>
                <p className="text-xs text-blue-600 leading-relaxed">
                  Explora todas las funcionalidades de TiendaFix en esta vista previa interactiva
                </p>
              </div>
              
              {/* Footer info */}
              <div className="text-center">
                <p className="text-xs text-gray-500 font-medium">
                  © TIENDAFIX V2 - 2025
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 