'use client'

import { useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
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
  Tab
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
  Clock
} from 'lucide-react'

export default function ConfiguracionPage() {
  const [loading, setLoading] = useState(false)
  const [shopConfig, setShopConfig] = useState({
    name: 'TiendaFix',
    address: 'Av. Principal 123, Lima',
    phone: '+51 987 654 321',
    email: 'info@tiendafix.com',
    description: 'Especialistas en reparación de dispositivos móviles'
  })

  const [notifications, setNotifications] = useState({
    lowStock: true,
    expiredRepairs: true,
    newCustomers: false,
    salesReports: true,
    systemUpdates: true
  })

  const [profileData] = useState({
    name: 'Fernando',
    email: 'fernando@tiendafix.com',
    role: 'Propietario',
    lastLogin: '16/01/2024 - 09:30'
  })

  const handleSaveShopConfig = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Configuración guardada exitosamente')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar la configuración')
    } finally {
      setLoading(false)
    }
  }

  const systemInfo = {
    version: '1.2.0',
    lastUpdate: '16/01/2024',
    database: 'PostgreSQL 15',
    storage: '2.5 GB / 10 GB',
    backups: 'Últimos: 15/01/2024',
    uptime: '99.9%'
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <h1 className={`text-4xl font-bold bg-gradient-to-r from-gray-600 to-slate-600 bg-clip-text text-transparent`}>
              Configuración
            </h1>
            <p className={`${textColors.secondary} text-lg`}>
              Ajustes generales del sistema y la tienda
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="bordered"
              startContent={<Download className="w-4 h-4" />}
            >
              Exportar Config
            </Button>
            <Button
              color="primary"
              onPress={handleSaveShopConfig}
              isLoading={loading}
              startContent={<Save className="w-4 h-4" />}
              className="shadow-lg"
            >
              Guardar Todo
            </Button>
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
                    <FormField
                      label="Nombre de la Tienda"
                      name="name"
                      value={shopConfig.name}
                      onChange={(value) => setShopConfig(prev => ({ ...prev, name: value }))}
                      required
                    />
                    
                    <FormField
                      label="Descripción"
                      name="description"
                      type="textarea"
                      value={shopConfig.description}
                      onChange={(value) => setShopConfig(prev => ({ ...prev, description: value }))}
                    />

                    <FormField
                      label="Dirección"
                      name="address"
                      value={shopConfig.address}
                      onChange={(value) => setShopConfig(prev => ({ ...prev, address: value }))}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Teléfono"
                        name="phone"
                        value={shopConfig.phone}
                        onChange={(value) => setShopConfig(prev => ({ ...prev, phone: value }))}
                      />
                      <FormField
                        label="Email"
                        name="email"
                        type="email"
                        value={shopConfig.email}
                        onChange={(value) => setShopConfig(prev => ({ ...prev, email: value }))}
                      />
                    </div>
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
                    <div className="text-center">
                      <Avatar
                        name={profileData.name}
                        size="lg"
                        classNames={{
                          base: "bg-gradient-to-br from-purple-400 to-purple-600",
                          icon: "text-white"
                        }}
                        className="mx-auto mb-4"
                      />
                      <h4 className={`text-lg font-semibold ${textColors.primary}`}>{profileData.name}</h4>
                      <Chip color="secondary" variant="flat" size="sm">
                        {profileData.role}
                      </Chip>
                    </div>

                    <Divider />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className={`text-sm ${textColors.secondary}`}>{profileData.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className={`text-sm ${textColors.secondary}`}>
                          Último acceso: {profileData.lastLogin}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="flat"
                      color="primary"
                      startContent={<Edit className="w-4 h-4" />}
                      className="w-full"
                    >
                      Editar Perfil
                    </Button>
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

                {/* Información del sistema */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-indigo-500" />
                      <h3 className={`text-lg font-semibold ${textColors.primary}`}>
                        Sistema
                      </h3>
                    </div>
                  </CardHeader>
                  <CardBody className="space-y-3">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className={textColors.secondary}>Versión:</span>
                        <Chip size="sm" variant="flat" color="primary">{systemInfo.version}</Chip>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={textColors.secondary}>Última actualización:</span>
                        <span className={`font-medium ${textColors.primary}`}>{systemInfo.lastUpdate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={textColors.secondary}>Base de datos:</span>
                        <span className={`font-medium ${textColors.primary}`}>{systemInfo.database}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={textColors.secondary}>Almacenamiento:</span>
                        <span className={`font-medium ${textColors.primary}`}>{systemInfo.storage}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={textColors.secondary}>Último backup:</span>
                        <span className={`font-medium ${textColors.primary}`}>{systemInfo.backups}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={textColors.secondary}>Disponibilidad:</span>
                        <Chip size="sm" variant="flat" color="success">{systemInfo.uptime}</Chip>
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