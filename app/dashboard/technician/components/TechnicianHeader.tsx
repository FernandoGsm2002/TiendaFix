'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { Bell, Search, User, LogOut, Settings, Package, Wrench, Unlock, Activity, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Input, 
  Button, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  Avatar,
  Card,
  CardBody,
  Badge,
  Chip
} from '@heroui/react'

interface NotificationData {
  totalNotifications: number;
  items: {
    assignedRepairs: any[];
    pendingUnlocks: any[];
  };
}

interface TechnicianHeaderProps {
  onMobileMenuToggle?: () => void;
  mobileMenuOpen?: boolean;
}

export default function TechnicianHeader({ onMobileMenuToggle, mobileMenuOpen }: TechnicianHeaderProps = {}) {
  const { user, userProfile, signOut } = useAuth()
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications/technician')
      
      if (!response.ok) {
        // Si es 404 o 500, usar datos vacíos sin mostrar error en consola
        if (response.status === 404 || response.status === 500) {
          console.warn('API de notificaciones no disponible, usando datos vacíos')
          setNotifications({
            totalNotifications: 0,
            items: {
              assignedRepairs: [],
              pendingUnlocks: []
            }
          })
          return
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      setNotifications(result.data)
    } catch (err) {
      // Solo mostrar error en consola si es un error real, no por APIs no implementados
      console.warn('No se pudieron cargar las notificaciones:', err instanceof Error ? err.message : 'Error desconocido')
      setNotifications({
        totalNotifications: 0,
        items: {
          assignedRepairs: [],
          pendingUnlocks: []
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/auth/login'
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      console.log('Buscando:', searchValue)
      // Aquí puedes implementar la lógica de búsqueda
    }
  }

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-r from-[#eafae7] via-[#f0fdf9] to-[#c0e6ba] backdrop-blur-sm">
      <CardBody className="px-4 md:px-8 py-4 md:py-6">
        <div className="flex items-center justify-between space-x-3 md:space-x-6">
          {/* Logo y título con gradiente */}
          <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
            {/* Botón de menú móvil integrado */}
            {onMobileMenuToggle && (
              <Button
                isIconOnly
                variant="light"
                className="lg:hidden p-2 text-[#4ca771] hover:text-[#013237] hover:bg-[#eafae7]"
                onPress={onMobileMenuToggle}
                aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
            
            <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-[#4ca771] to-[#013237] shadow-lg flex-shrink-0">
              <Activity className="w-5 md:w-6 h-5 md:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-[#4ca771] to-[#013237] bg-clip-text text-transparent truncate">
                {userProfile?.organization_name ? `${userProfile.organization_name} - Panel de Técnico` : 'Panel de Técnico'}
              </h1>
            </div>
          </div>

          {/* Barra de búsqueda y controles */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Búsqueda mejorada - Solo visible en desktop */}
            <form onSubmit={handleSearch} className="hidden xl:block">
              <Input
                placeholder="Buscar reparaciones, clientes, dispositivos..."
                value={searchValue}
                onValueChange={setSearchValue}
                startContent={
                  <div className="p-1 rounded-md bg-gradient-to-br from-[#eafae7] to-[#c0e6ba]">
                    <Search className="w-4 h-4 text-[#4ca771]" />
                  </div>
                }
                variant="bordered"
                size="lg"
                className="w-80"
                classNames={{
                  input: "text-[#013237] placeholder:text-[#4ca771]",
                  inputWrapper: "border-[#c0e6ba] hover:border-[#4ca771] focus-within:border-[#013237] bg-[#f0fdf9]/80 backdrop-blur-sm",
                }}
                aria-label="Buscar en el sistema"
              />
            </form>

            {/* Notificaciones con badge mejorado */}
            <Dropdown isOpen={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  variant="light"
                  size="lg"
                  className="relative bg-[#f0fdf9]/80 backdrop-blur-sm border border-[#c0e6ba] hover:border-[#4ca771] shadow-lg hover:shadow-xl transition-all"
                  aria-label="Ver notificaciones"
                >
                  <Bell className="w-5 h-5 text-[#4ca771]" />
                  {notifications && notifications.totalNotifications > 0 && (
                    <Badge
                      content={notifications.totalNotifications}
                      color="danger"
                      placement="top-right"
                      size="sm"
                      classNames={{
                        badge: "animate-pulse"
                      }}
                    >
                      {null}
                    </Badge>
                  )}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Menu de notificaciones"
                className="w-80 md:w-96 max-h-96 overflow-y-auto"
                variant="flat"
                classNames={{
                  base: "bg-[#f0fdf9]/95 backdrop-blur-lg border border-[#c0e6ba] shadow-2xl"
                }}
              >
                <DropdownItem
                  key="header"
                  className="h-auto"
                  isReadOnly
                >
                  <div className="px-2 py-3 border-b border-[#c0e6ba]">
                    <div className="flex items-center justify-between">
                      <p className="text-base md:text-lg font-bold bg-gradient-to-r from-[#4ca771] to-[#013237] bg-clip-text text-transparent">
                        Mis Notificaciones
                      </p>
                      <Chip size="sm" color="primary" variant="flat" className="bg-[#eafae7] text-[#013237]">
                        {notifications?.totalNotifications || 0}
                      </Chip>
                    </div>
                  </div>
                </DropdownItem>
                {loading ? (
                  <DropdownItem key="loading" isReadOnly>
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4ca771]"></div>
                      <p className="ml-3 text-sm text-[#013237]">Cargando notificaciones...</p>
                    </div>
                  </DropdownItem>
                ) : notifications && notifications.totalNotifications > 0 ? (
                  <>
                    {notifications.items.assignedRepairs.length > 0 && (
                      <>
                        <DropdownItem key="repairs-header" isReadOnly>
                          <div className="flex items-center gap-2 py-2">
                            <div className="p-1 rounded-md bg-orange-100">
                              <Wrench className="w-4 h-4 text-orange-600" />
                            </div>
                            <p className="text-sm font-bold text-orange-700 uppercase tracking-wide">
                              Reparaciones Asignadas
                            </p>
                          </div>
                        </DropdownItem>
                        {notifications.items.assignedRepairs.map((item: any, index: number) => (
                          <DropdownItem 
                            key={`repair-${index}`} 
                            as={Link} 
                            href="/dashboard/technician/reparaciones"
                            className="hover:bg-orange-50"
                          >
                            <div className="flex items-center space-x-4 py-2">
                              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 flex-shrink-0">
                                <Wrench className="w-4 h-4 text-orange-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900">Reparación #{item.id}</p>
                                <p className="text-sm text-gray-600 truncate">S/N: {item.serial_number}</p>
                                <Chip size="sm" color="warning" variant="flat" className="mt-1">
                                  Pendiente
                                </Chip>
                              </div>
                            </div>
                          </DropdownItem>
                        ))}
                      </>
                    )}
                    {notifications.items.pendingUnlocks.length > 0 && (
                      <>
                        <DropdownItem key="unlocks-header" isReadOnly>
                          <div className="flex items-center gap-2 py-2">
                            <div className="p-1 rounded-md bg-purple-100">
                              <Unlock className="w-4 h-4 text-purple-600" />
                            </div>
                            <p className="text-sm font-bold text-purple-700 uppercase tracking-wide">
                              Desbloqueos Pendientes
                            </p>
                          </div>
                        </DropdownItem>
                        {notifications.items.pendingUnlocks.map((item: any, index: number) => (
                          <DropdownItem 
                            key={`unlock-${index}`} 
                            as={Link} 
                            href="/dashboard/technician/desbloqueos"
                            className="hover:bg-purple-50"
                          >
                            <div className="flex items-center space-x-4 py-2">
                              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 flex-shrink-0">
                                <Unlock className="w-4 h-4 text-purple-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900">Desbloqueo #{item.id}</p>
                                <p className="text-sm text-gray-600 truncate">IMEI: {item.imei}</p>
                                <Chip size="sm" color="secondary" variant="flat" className="mt-1">
                                  En cola
                                </Chip>
                              </div>
                            </div>
                          </DropdownItem>
                        ))}
                      </>
                    )}
                  </>
                ) : (
                  <DropdownItem key="empty" isReadOnly>
                    <div className="text-center py-8">
                      <div className="p-4 rounded-full bg-gray-100 w-fit mx-auto mb-3">
                        <Bell className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 font-medium">No tienes notificaciones nuevas</p>
                      <p className="text-xs text-gray-500 mt-1">Te notificaremos cuando tengas nuevas tareas</p>
                    </div>
                  </DropdownItem>
                )}
                <DropdownItem 
                  key="refresh" 
                  onPress={fetchNotifications}
                  className="border-t border-gray-100"
                >
                  <div className="text-center py-2">
                    <p className="text-sm text-blue-600 font-semibold">🔄 Actualizar notificaciones</p>
                  </div>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            {/* Menú de usuario mejorado */}
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="light"
                  className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-[#f0fdf9]/80 backdrop-blur-sm border border-[#c0e6ba] hover:border-[#4ca771] shadow-lg hover:shadow-xl transition-all rounded-xl"
                  aria-label="Menu de usuario"
                >
                  <Avatar
                    icon={<User className="w-4 md:w-5 h-4 md:h-5" />}
                    size="sm"
                    classNames={{
                      base: "bg-gradient-to-br from-[#4ca771] to-[#013237]",
                      icon: "text-white"
                    }}
                  />
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-bold text-[#013237] truncate">
                      {userProfile?.name || 'Usuario'}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-[#4ca771]">Técnico</p>
                      <Chip size="sm" color="success" variant="dot" className="text-[#013237] bg-[#eafae7]">
                        Activo
                      </Chip>
                    </div>
                  </div>
                </Button>
              </DropdownTrigger>
              <DropdownMenu 
                aria-label="Menu de perfil de usuario" 
                variant="flat"
                classNames={{
                  base: "bg-[#f0fdf9]/95 backdrop-blur-lg border border-[#c0e6ba] shadow-2xl min-w-[250px]"
                }}
              >
                <DropdownItem key="profile-info" isReadOnly>
                  <div className="py-3 border-b border-[#c0e6ba]">
                    <div className="flex items-center gap-3">
                      <Avatar
                        icon={<User className="w-5 h-5" />}
                        size="md"
                        classNames={{
                          base: "bg-gradient-to-br from-[#4ca771] to-[#013237]",
                          icon: "text-white"
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#013237] truncate">
                          {userProfile?.name}
                        </p>
                        <p className="text-xs text-[#4ca771] truncate">{user?.email}</p>
                        <Chip size="sm" color="primary" variant="flat" className="mt-1 bg-[#eafae7] text-[#013237]">
                          Técnico Autorizado
                        </Chip>
                      </div>
                    </div>
                  </div>
                </DropdownItem>
                <DropdownItem 
                  key="profile" 
                  as={Link} 
                  href="/dashboard/technician/perfil"
                  startContent={
                    <div className="p-1 rounded-md bg-[#eafae7]">
                      <Settings className="w-4 h-4 text-[#4ca771]" />
                    </div>
                  }
                  className="hover:bg-[#eafae7] text-[#013237]"
                >
                  <span className="font-medium">Mi Perfil y Configuración</span>
                </DropdownItem>
                <DropdownItem 
                  key="logout" 
                  onPress={handleSignOut}
                  startContent={
                    <div className="p-1 rounded-md bg-red-100">
                      <LogOut className="w-4 h-4 text-red-600" />
                    </div>
                  }
                  className="text-danger hover:bg-red-50"
                  color="danger"
                >
                  <span className="font-medium">Cerrar Sesión</span>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </CardBody>
    </Card>
  )
} 