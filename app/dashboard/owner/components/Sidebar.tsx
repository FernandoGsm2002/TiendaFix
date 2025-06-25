'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Avatar, 
  Button, 
  Divider, 
  Tooltip,
  Card,
  CardBody
} from '@heroui/react'
import { textColors, backgroundColors } from '@/lib/utils/colors'
import { 
  BarChart3, Wrench, Users, Smartphone, Package, 
  ShoppingCart, Unlock, UserCheck, FileBarChart, 
  Settings, ChevronLeft, ChevronRight, Building, LogOut
} from 'lucide-react'

interface SidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard/owner/dashboard',
    icon: BarChart3,
    description: 'Resumen general',
    color: 'text-blue-600'
  },
  {
    id: 'reparaciones',
    label: 'Reparaciones',
    href: '/dashboard/owner/reparaciones',
    icon: Wrench,
    description: 'Gestión de reparaciones',
    color: 'text-orange-600'
  },
  {
    id: 'clientes',
    label: 'Clientes',
    href: '/dashboard/owner/clientes',
    icon: Users,
    description: 'Base de datos de clientes',
    color: 'text-green-600'
  },
  {
    id: 'dispositivos',
    label: 'Dispositivos',
    href: '/dashboard/owner/dispositivos',
    icon: Smartphone,
    description: 'Registro de dispositivos',
    color: 'text-purple-600'
  },
  {
    id: 'inventario',
    label: 'Inventario',
    href: '/dashboard/owner/inventario',
    icon: Package,
    description: 'Control de stock',
    color: 'text-amber-600'
  },
  {
    id: 'ventas',
    label: 'Ventas/POS',
    href: '/dashboard/owner/ventas',
    icon: ShoppingCart,
    description: 'Sistema de ventas',
    color: 'text-emerald-600'
  },
  {
    id: 'desbloqueos',
    label: 'Desbloqueos',
    href: '/dashboard/owner/desbloqueos',
    icon: Unlock,
    description: 'Servicios de unlock',
    color: 'text-cyan-600'
  },
  {
    id: 'personal',
    label: 'Personal',
    href: '/dashboard/owner/personal',
    icon: UserCheck,
    description: 'Gestión de empleados',
    color: 'text-indigo-600'
  },
  {
    id: 'reportes',
    label: 'Reportes',
    href: '/dashboard/owner/reportes',
    icon: FileBarChart,
    description: 'Análisis y estadísticas',
    color: 'text-pink-600'
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    href: '/dashboard/owner/configuracion',
    icon: Settings,
    description: 'Ajustes de la tienda',
    color: 'text-gray-600'
  }
]

export default function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()

  const SidebarMenuItem = ({ item }: { item: typeof menuItems[0] }) => {
    const isActive = pathname === item.href
    const Icon = item.icon
    const iconColor = isActive ? 'text-blue-600' : item.color

    const baseClasses = "flex items-center rounded-lg transition-colors w-full";
    const activeClasses = "bg-blue-50 text-blue-700";
    const inactiveClasses = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";

    if (isCollapsed) {
      return (
        <Tooltip
          content={item.label}
          placement="right"
          classNames={{ content: "bg-gray-800 text-white px-3 py-1.5 rounded-md shadow-lg" }}
        >
          <Link
            href={item.href}
            className={`${baseClasses} p-3 justify-center ${isActive ? activeClasses : inactiveClasses}`}
          >
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </Link>
        </Tooltip>
      );
    }

    return (
      <Link
        href={item.href}
        className={`${baseClasses} p-2 ${isActive ? activeClasses : inactiveClasses}`}
      >
        <div className={`p-2 rounded-md ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-semibold ${isActive ? 'text-blue-800' : 'text-gray-800'}`}>
            {item.label}
          </p>
          <p className="text-xs text-gray-500">{item.description}</p>
        </div>
      </Link>
    );
  };

  return (
    <div className={`
      flex h-full flex-col bg-white transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-20' : 'w-72'}
    `}>
      {/* Header del Sidebar */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          {!isCollapsed && (
            <Link href="/dashboard/owner/dashboard" className="flex items-center gap-2">
              <Avatar
                icon={<Building className="h-5 w-5" />}
                classNames={{ base: "bg-blue-100", icon: "text-blue-600" }}
              />
              <span className="font-bold text-gray-800">TiendaFix</span>
            </Link>
          )}
          <Button
            isIconOnly
            variant="light"
            onPress={onToggleCollapse}
            className="h-8 w-8 data-[hover]:bg-gray-100"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-hidden">
        {/* Navegación Principal */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id} item={item} />
          ))}
        </nav>

        <div className='p-3 border-t'>
          {isCollapsed ? (
            <Tooltip content="Cerrar Sesión" placement="right">
              <Button 
                  isIconOnly 
                  variant="light" 
                  className="w-full data-[hover]:bg-red-50"
                >
                <LogOut className="h-5 w-5 text-red-500" />
              </Button>
            </Tooltip>
        ) : (
          <>
            <Button 
                variant="light" 
                className="w-full justify-start text-red-500 data-[hover]:bg-red-50 data-[hover]:text-red-600"
              >
              <LogOut className="mr-2 h-5 w-5" />
              Cerrar Sesión
            </Button>
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-400">
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