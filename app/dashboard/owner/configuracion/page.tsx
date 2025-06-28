'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '@/lib/auth/auth-context'
import { 
  Card, 
  CardBody, 
  CardHeader,
  Button,
  Switch,
  Avatar,
  Divider,
  Chip,
  Tabs,
  Tab,
  Progress,
  Skeleton
} from '@heroui/react'
import { textColors } from '@/lib/utils/colors'
import FormField from '@/app/components/ui/FormField'
import LanguageCurrencySelector from '@/app/components/LanguageCurrencySelector'
import { 
  Settings, 
  Building, 
  User, 
  Bell, 
  Shield, 
  Save,
  Edit,
  Lock,
  Globe,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Monitor,
  Smartphone,
  Database,
  Cloud,
  Download,
  Upload,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  HardDrive,
  Users,
  Wrench,
  Package,
  TrendingUp,
  Calendar
} from 'lucide-react'

interface OrganizationData {
  id: string
  name: string
  slug: string
  email: string
  phone: string | null
  address: string | null
  subscription_plan: string
  subscription_status: string
  max_users: number
  max_devices: number
  created_at: string
}

interface SystemStats {
  totalUsers: number
  totalCustomers: number
  totalDevices: number
  totalRepairs: number
  totalInventory: number
  storageUsed: number
  storageLimit: number
}

export default function ConfiguracionPage() {
  const { userProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null)
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [notifications, setNotifications] = useState({
    lowStock: true,
    expiredRepairs: true,
    newCustomers: false,
    salesReports: true,
    systemUpdates: true
  })

  // Función para cargar datos de la organización
  const fetchOrganizationData = async () => {
    try {
      setDataLoading(true)
      setError(null)

      // Por ahora usar datos simulados para la organización hasta crear el API
      const simulatedOrgData: OrganizationData = {
        id: userProfile?.organization_id || 'demo-org',
        name: 'TiendaFix Central',
        slug: 'tiendafix-central',
        email: 'info@tiendafix.com',
        phone: '+51 987 654 321',
        address: 'Av. Principal 123, Lima, Perú',
        subscription_plan: 'yearly',
        subscription_status: 'active',
        max_users: 10,
        max_devices: 500,
        created_at: '2024-01-01T00:00:00Z'
      }

      // Obtener estadísticas del sistema
      const statsResponse = await fetch('/api/dashboard/stats')
      if (!statsResponse.ok) throw new Error('Error al cargar estadísticas')
      const statsData = await statsResponse.json()

      setOrganizationData(simulatedOrgData)
      setSystemStats({
        totalUsers: statsData.data?.counters?.totalUsers || 0,
        totalCustomers: statsData.data?.counters?.totalCustomers || 0,
        totalDevices: statsData.data?.counters?.totalDevices || 0,
        totalRepairs: statsData.data?.counters?.totalRepairs || 0,
        totalInventory: statsData.data?.counters?.totalInventory || 0,
        storageUsed: 2.5, // GB simulado
        storageLimit: 10 // GB simulado
      })
    } catch (err) {
      console.error('Error loading configuration data:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    fetchOrganizationData()
  }, [])

  const handleSaveShopConfig = async () => {
    if (!organizationData) return
    
    setLoading(true)
    try {
      // Simular guardado (implementar API más tarde)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Configuración a guardar:', {
        name: organizationData.name,
        email: organizationData.email,
        phone: organizationData.phone,
        address: organizationData.address
      })
      
      alert('Configuración guardada exitosamente (modo demo)')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar la configuración')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSubscriptionColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'warning'
      case 'expired': return 'danger'
      default: return 'default'
    }
  }

  const getSubscriptionLabel = (plan: string) => {
    switch (plan) {
      case 'monthly_3': return 'Plan Básico (3 meses)'
      case 'monthly_6': return 'Plan Estándar (6 meses)'
      case 'yearly': return 'Plan Premium (1 año)'
      default: return plan
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header moderno */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-gray-100 rounded-2xl p-8 border border-gray-200 shadow-sm">
          {/* Elementos de fondo */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-400/10 to-blue-500/10 rounded-full blur-2xl"></div>
          
          <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl shadow-lg">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-slate-600 bg-clip-text text-transparent">
                    Configuración del Sistema
            </h1>
                  <p className="text-gray-600 text-base mt-1">
                    Gestiona todos los aspectos de tu tienda desde un solo lugar
                  </p>
                </div>
              </div>
              
              {organizationData && !dataLoading && (
                <div className="flex items-center gap-4 mt-4">
                  <Chip 
                    color="success" 
                    variant="flat" 
                    startContent={<CheckCircle className="w-3 h-3" />}
                    size="sm"
                  >
                    Sistema Activo
                  </Chip>
                  <Chip 
                    color="primary" 
                    variant="flat"
                    size="sm"
                  >
                    {getSubscriptionLabel(organizationData.subscription_plan)}
                  </Chip>
                </div>
              )}
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="bordered"
              startContent={<Download className="w-4 h-4" />}
                className="bg-white/50 backdrop-blur-sm border-gray-300"
            >
              Exportar Config
            </Button>
            <Button
              color="primary"
              onPress={handleSaveShopConfig}
              isLoading={loading}
              startContent={<Save className="w-4 h-4" />}
                className="shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
                {loading ? 'Guardando...' : 'Guardar Todo'}
            </Button>
            </div>
          </div>
        </div>

        {/* Tabs principales */}
        <Tabs variant="bordered" size="lg" defaultSelectedKey="general">
          <Tab key="general" title={
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span>General</span>
            </div>
          }>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
              {/* Panel izquierdo */}
              <div className="lg:col-span-2 space-y-6">
                {/* Información de la tienda */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-blue-500" />
                      <h3 className={`text-lg font-semibold ${textColors.primary}`}>
                        Información de la Tienda
                      </h3>
                    </div>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    {dataLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-4 w-3/4 rounded" />
                        <Skeleton className="h-10 w-full rounded" />
                        <Skeleton className="h-4 w-3/4 rounded" />
                        <Skeleton className="h-20 w-full rounded" />
                        <Skeleton className="h-4 w-3/4 rounded" />
                        <Skeleton className="h-10 w-full rounded" />
                        <div className="grid grid-cols-2 gap-4">
                          <Skeleton className="h-10 w-full rounded" />
                          <Skeleton className="h-10 w-full rounded" />
                        </div>
                      </div>
                    ) : organizationData ? (
                      <>
                    <FormField
                      label="Nombre de la Tienda"
                      name="name"
                          value={organizationData.name}
                          onChange={(value) => setOrganizationData(prev => prev ? { ...prev, name: value } : null)}
                      required
                    />
                    
                    <FormField
                          label="Identificador único"
                          name="slug"
                          value={organizationData.slug}
                          onChange={(value) => setOrganizationData(prev => prev ? { ...prev, slug: value } : null)}
                          disabled
                          helpText="Este es tu identificador único en el sistema"
                    />

                    <FormField
                      label="Dirección"
                      name="address"
                          value={organizationData.address || ''}
                          onChange={(value) => setOrganizationData(prev => prev ? { ...prev, address: value } : null)}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Teléfono"
                        name="phone"
                            value={organizationData.phone || ''}
                            onChange={(value) => setOrganizationData(prev => prev ? { ...prev, phone: value } : null)}
                      />
                      <FormField
                        label="Email"
                        name="email"
                        type="email"
                            value={organizationData.email}
                            onChange={(value) => setOrganizationData(prev => prev ? { ...prev, email: value } : null)}
                            required
                      />
                    </div>

                        {/* Información de suscripción */}
                        <Divider />
                        <div className="space-y-3">
                          <h4 className="text-md font-semibold text-gray-800">Información de Suscripción</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Plan:</span>
                              <Chip 
                                color="primary" 
                                variant="flat"
                                size="sm"
                              >
                                {getSubscriptionLabel(organizationData.subscription_plan)}
                              </Chip>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Estado:</span>
                              <Chip 
                                color={getSubscriptionColor(organizationData.subscription_status) as any} 
                                variant="flat"
                                size="sm"
                              >
                                {organizationData.subscription_status === 'active' ? 'Activo' : 
                                 organizationData.subscription_status === 'inactive' ? 'Inactivo' : 'Expirado'}
                              </Chip>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Usuarios máximos:</span>
                              <span className="text-sm font-semibold text-gray-900">{organizationData.max_users}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Dispositivos máximos:</span>
                              <span className="text-sm font-semibold text-gray-900">{organizationData.max_devices}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : error ? (
                      <div className="text-center py-8">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600">{error}</p>
                        <Button 
                          color="primary" 
                          variant="flat" 
                          onPress={fetchOrganizationData}
                          className="mt-4"
                        >
                          Reintentar
                        </Button>
                      </div>
                    ) : null}
                  </CardBody>
                </Card>

                {/* Configuración de idioma y moneda */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-green-500" />
                      <h3 className={`text-lg font-semibold ${textColors.primary}`}>
                        Idioma y Moneda
                      </h3>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <LanguageCurrencySelector />
                  </CardBody>
                </Card>

                {/* Notificaciones */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-orange-500" />
                      <h3 className={`text-lg font-semibold ${textColors.primary}`}>
                        Notificaciones
                      </h3>
                    </div>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${textColors.primary}`}>Alertas de stock bajo</p>
                        <p className={`text-sm ${textColors.muted}`}>Recibir notificaciones cuando el stock esté bajo</p>
                      </div>
                      <Switch 
                        isSelected={notifications.lowStock}
                        onValueChange={(value) => setNotifications(prev => ({ ...prev, lowStock: value }))}
                      />
                    </div>

                    <Divider />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${textColors.primary}`}>Reparaciones vencidas</p>
                        <p className={`text-sm ${textColors.muted}`}>Alertas sobre reparaciones que han superado el tiempo estimado</p>
                      </div>
                      <Switch 
                        isSelected={notifications.expiredRepairs}
                        onValueChange={(value) => setNotifications(prev => ({ ...prev, expiredRepairs: value }))}
                      />
                    </div>

                    <Divider />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${textColors.primary}`}>Nuevos clientes</p>
                        <p className={`text-sm ${textColors.muted}`}>Notificaciones cuando se registre un nuevo cliente</p>
                      </div>
                      <Switch 
                        isSelected={notifications.newCustomers}
                        onValueChange={(value) => setNotifications(prev => ({ ...prev, newCustomers: value }))}
                      />
                    </div>

                    <Divider />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${textColors.primary}`}>Reportes de ventas</p>
                        <p className={`text-sm ${textColors.muted}`}>Resúmenes automáticos de ventas diarias/semanales</p>
                      </div>
                      <Switch 
                        isSelected={notifications.salesReports}
                        onValueChange={(value) => setNotifications(prev => ({ ...prev, salesReports: value }))}
                      />
                    </div>

                    <Divider />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${textColors.primary}`}>Actualizaciones del sistema</p>
                        <p className={`text-sm ${textColors.muted}`}>Notificaciones sobre nuevas versiones y mejoras</p>
                      </div>
                      <Switch 
                        isSelected={notifications.systemUpdates}
                        onValueChange={(value) => setNotifications(prev => ({ ...prev, systemUpdates: value }))}
                      />
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Panel derecho */}
              <div className="space-y-6">
                {/* Perfil del propietario */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-purple-500" />
                      <h3 className={`text-lg font-semibold ${textColors.primary}`}>
                        Perfil del Propietario
                      </h3>
                    </div>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    {dataLoading ? (
                      <div className="space-y-4">
                        <div className="text-center">
                          <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                          <Skeleton className="h-4 w-24 rounded mx-auto mb-2" />
                          <Skeleton className="h-6 w-20 rounded mx-auto" />
                        </div>
                        <Skeleton className="h-px w-full" />
                        <div className="space-y-3">
                          <Skeleton className="h-4 w-full rounded" />
                          <Skeleton className="h-4 w-3/4 rounded" />
                        </div>
                        <Skeleton className="h-10 w-full rounded" />
                      </div>
                    ) : userProfile ? (
                      <>
                    <div className="text-center">
                      <Avatar
                            name={userProfile.name}
                        size="lg"
                        classNames={{
                          base: "bg-gradient-to-br from-purple-400 to-purple-600",
                          icon: "text-white"
                        }}
                        className="mx-auto mb-4"
                      />
                          <h4 className={`text-lg font-semibold ${textColors.primary}`}>{userProfile.name}</h4>
                      <Chip color="secondary" variant="flat" size="sm">
                            {userProfile.role === 'owner' ? 'Propietario' : 
                             userProfile.role === 'technician' ? 'Técnico' : userProfile.role}
                      </Chip>
                    </div>

                    <Divider />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                            <span className={`text-sm ${textColors.secondary}`}>{userProfile.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span className={`text-sm ${textColors.secondary}`}>
                              ID: {userProfile.organization_id?.slice(0, 8)}...
                            </span>
                          </div>
                          {organizationData && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                        <span className={`text-sm ${textColors.secondary}`}>
                                Registrado: {formatDate(organizationData.created_at)}
                        </span>
                      </div>
                          )}
                    </div>

                    <Button
                      variant="flat"
                      color="primary"
                      startContent={<Edit className="w-4 h-4" />}
                      className="w-full"
                    >
                      Editar Perfil
                    </Button>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <User className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className={textColors.secondary}>Cargando perfil...</p>
                      </div>
                    )}
                  </CardBody>
                </Card>

                {/* Seguridad */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-500" />
                      <h3 className={`text-lg font-semibold ${textColors.primary}`}>
                        Seguridad
                      </h3>
                    </div>
                  </CardHeader>
                  <CardBody className="space-y-3">
                    <Button
                      variant="flat"
                      startContent={<Lock className="w-4 h-4" />}
                      className="w-full justify-start"
                    >
                      Cambiar Contraseña
                    </Button>
                    <Button
                      variant="flat"
                      startContent={<Monitor className="w-4 h-4" />}
                      className="w-full justify-start"
                    >
                      Sesiones Activas
                    </Button>
                    <Button
                      variant="flat"
                      startContent={<Shield className="w-4 h-4" />}
                      className="w-full justify-start"
                    >
                      Configurar 2FA
                    </Button>
                  </CardBody>
                </Card>

                {/* Estadísticas del sistema */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-indigo-500" />
                      <h3 className={`text-lg font-semibold ${textColors.primary}`}>
                        Estadísticas del Sistema
                      </h3>
                    </div>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    {dataLoading ? (
                      <div className="space-y-3">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="flex justify-between items-center">
                            <Skeleton className="h-4 w-1/3 rounded" />
                            <Skeleton className="h-6 w-16 rounded" />
                          </div>
                        ))}
                      </div>
                    ) : systemStats ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full">
                              <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p>
                            <p className="text-sm text-gray-600">Usuarios</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full">
                              <User className="w-6 h-6 text-green-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{systemStats.totalCustomers}</p>
                            <p className="text-sm text-gray-600">Clientes</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-purple-100 rounded-full">
                              <Smartphone className="w-6 h-6 text-purple-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{systemStats.totalDevices}</p>
                            <p className="text-sm text-gray-600">Dispositivos</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-orange-100 rounded-full">
                              <Wrench className="w-6 h-6 text-orange-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{systemStats.totalRepairs}</p>
                            <p className="text-sm text-gray-600">Reparaciones</p>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-indigo-100 rounded-full">
                            <Package className="w-6 h-6 text-indigo-600" />
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{systemStats.totalInventory}</p>
                          <p className="text-sm text-gray-600">Items en Inventario</p>
                        </div>

                        <Divider />

                        {/* Uso de almacenamiento */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Almacenamiento</span>
                            <span className="text-sm font-medium text-gray-900">
                              {systemStats.storageUsed} GB / {systemStats.storageLimit} GB
                            </span>
                          </div>
                          <Progress 
                            value={(systemStats.storageUsed / systemStats.storageLimit) * 100}
                            color="primary"
                            className="w-full"
                          />
                          <p className={`text-xs ${textColors.muted}`}>
                            {((systemStats.storageUsed / systemStats.storageLimit) * 100).toFixed(1)}% utilizado
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <Database className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className={textColors.secondary}>No se pudieron cargar las estadísticas</p>
                      </div>
                    )}
                  </CardBody>
                </Card>

                {/* Información del sistema técnico */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-indigo-500" />
                      <h3 className={`text-lg font-semibold ${textColors.primary}`}>
                        Sistema Técnico
                      </h3>
                    </div>
                  </CardHeader>
                  <CardBody className="space-y-3">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className={textColors.secondary}>Versión:</span>
                        <Chip size="sm" variant="flat" color="primary">v1.3.0</Chip>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={textColors.secondary}>Base de datos:</span>
                        <span className={`font-medium ${textColors.primary}`}>PostgreSQL 15</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={textColors.secondary}>Estado:</span>
                        <Chip size="sm" variant="flat" color="success">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Operativo
                        </Chip>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={textColors.secondary}>Último backup:</span>
                        <span className={`font-medium ${textColors.primary}`}>Hoy</span>
                      </div>
                    </div>

                    <Divider />

                    <div className="space-y-2">
                      <Button
                        variant="flat"
                        startContent={<Cloud className="w-4 h-4" />}
                        size="sm"
                        className="w-full justify-start"
                      >
                        Crear Backup
                      </Button>
                      <Button
                        variant="flat"
                        startContent={<Upload className="w-4 h-4" />}
                        size="sm"
                        className="w-full justify-start"
                      >
                        Restaurar Backup
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>
    </DashboardLayout>
  )
} 