'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Avatar, 
  Button, 
  Tooltip,
  Card,
  CardBody,
  Chip,
  Divider
} from '@heroui/react'
import { 
  BarChart3, Wrench, Users, Smartphone, Package, 
  ShoppingCart, Unlock, UserCheck, FileBarChart, 
  Settings, ChevronLeft, ChevronRight, Building, LogOut, 
  Activity, Eye, Zap, Sparkles
} from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface TechnicianSidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
  onMobileMenuClose?: () => void
}

// Menú limitado para técnicos con nueva paleta Poppins
const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard/technician/dashboard',
    icon: BarChart3,
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-50 to-blue-100'
  },
  {
    id: 'reparaciones',
    label: 'Mis Reparaciones',
    href: '/dashboard/technician/reparaciones',
    icon: Wrench,
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-50 to-blue-100'
  },
  {
    id: 'clientes',
    label: 'Clientes',
    href: '/dashboard/technician/clientes',
    icon: Users,
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-50 to-blue-100'
  },
  // TEMPORALMENTE OCULTO - Apartado de dispositivos será eliminado en el nuevo flujo
  // {
  //   id: 'dispositivos',
  //   label: 'Dispositivos',
  //   href: '/dashboard/technician/dispositivos',
  //   icon: Smartphone,
  //   color: 'text-blue-600',
  //   gradient: 'from-blue-500 to-blue-600',
  //   bgGradient: 'from-blue-50 to-blue-100'
  // },
  {
    id: 'inventario',
    label: 'Inventario',
    href: '/dashboard/technician/inventario',
    icon: Package,
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-50 to-blue-100'
  },
  {
    id: 'ventas',
    label: 'Ventas/POS',
    href: '/dashboard/technician/ventas',
    icon: ShoppingCart,
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-50 to-blue-100'
  },
  {
    id: 'desbloqueos',
    label: 'Desbloqueos',
    href: '/dashboard/technician/desbloqueos',
    icon: Unlock,
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-50 to-blue-100'
  }
]

export default function TechnicianSidebar({ isCollapsed, onToggleCollapse, onMobileMenuClose }: TechnicianSidebarProps) {
  const pathname = usePathname()
  const { signOut, userProfile } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
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
            <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`} />
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
            <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`} />
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
          relative flex shrink-0 items-center justify-center p-4 border-b border-gray-200/80
          ${isCollapsed ? 'h-20' : 'h-28'}
        `}>
        {!isCollapsed && (
          <Link href="/dashboard/technician/dashboard" className="flex items-center justify-center w-full group">
            <div className="flex flex-col items-center gap-2">
              <Image
                src="/pngs/tiendafixlogo.png"
                alt="Logo"
                width={140}
                height={70}
                className="object-contain group-hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
          </Link>
        )}
        
        {/* Botón de toggle posicionado en la esquina */}
        <Button
          isIconOnly
          variant="light"
          onPress={onToggleCollapse}
          className={`
            absolute top-4 right-4 h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-100 transition-all duration-300 rounded-lg z-10
            ${isCollapsed ? 'mx-auto relative top-0 right-0' : ''}
          `}
          aria-label={isCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-hidden">
        {/* Badge de estado cuando está colapsado */}
        {isCollapsed && (
          <div className="p-2">
            <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mx-auto"></div>
          </div>
        )}

        {/* Navegación Principal */}
        <nav className={`flex-1 overflow-y-auto py-4 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          {!isCollapsed && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Herramientas</p>
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
              content="Cerrar Sesión" 
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
                onPress={handleSignOut}
                aria-label="Cerrar sesión"
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
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 rounded-xl p-4 h-auto"
                onPress={handleSignOut}
                autoFocus={false}
                tabIndex={-1}
                onFocus={(e) => (e.target as HTMLButtonElement).blur()}
              >
                <div className="flex items-center w-full">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-red-100 to-red-200 mr-3">
                    <LogOut className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="font-medium">Cerrar Sesión</span>
                </div>
              </Button>
              
              {/* Footer info */}
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                  <Chip size="sm" color="primary" variant="dot" className="text-xs text-gray-600 bg-blue-100">
                    Sistema Activo
                  </Chip>
                </div>
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