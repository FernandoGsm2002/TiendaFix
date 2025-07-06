'use client'

import React, { useState } from 'react'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Chip, 
  Button, 
  Input, 
  Select, 
  SelectItem, 
  Divider,
  Avatar,
  Skeleton
} from '@heroui/react'
import { 
  Settings, 
  User, 
  Building, 
  Globe, 
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  CreditCard,
  Calendar,
  DollarSign
} from 'lucide-react'

export default function DemoConfiguracionPage() {
  const { t } = useTranslations()
  const [selectedSection, setSelectedSection] = useState('organizacion')

  const configSections = [
    { id: 'organizacion', title: 'Información de la Organización', icon: Building },
    { id: 'usuario', title: 'Perfil de Usuario', icon: User },
    { id: 'preferencias', title: 'Idioma y Moneda', icon: Globe }
  ]

  const organizacionData = {
    name: 'TiendaFix Demo',
    email: 'demo@tiendafix.com',
    phone: '+51 999 888 777',
    address: 'Av. Demo 123, Lima, Perú',
    subscription_plan: 'premium',
    subscription_status: 'active',
    created_at: '2024-01-15T10:00:00Z',
    max_users: 10,
    max_devices: 500
  }

  const usuarioData = {
    name: 'Usuario Demo',
    email: 'usuario@tiendafix.com',
    role: 'owner'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getSubscriptionColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'suspended': return 'warning'
      case 'cancelled': return 'danger'
      default: return 'default'
    }
  }

  const getSubscriptionLabel = (plan: string) => {
    switch (plan) {
      case 'basic': return 'Básico'
      case 'premium': return 'Premium'
      case 'enterprise': return 'Enterprise'
      default: return plan
    }
  }

  const renderOrganizacionSection = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-xl">
          <Building className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Información de la Organización</h3>
          <p className="text-gray-600">Datos de tu empresa en TiendaFix</p>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <h4 className="text-lg font-semibold text-gray-900">Datos de la Empresa</h4>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la empresa</label>
              <Input
                value={organizacionData.name}
                variant="bordered"
                isReadOnly
                startContent={<Building className="h-4 w-4 text-gray-400" />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email de contacto</label>
              <Input
                value={organizacionData.email}
                variant="bordered"
                isReadOnly
                startContent={<Mail className="h-4 w-4 text-gray-400" />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
              <Input
                value={organizacionData.phone}
                variant="bordered"
                isReadOnly
                startContent={<Phone className="h-4 w-4 text-gray-400" />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
              <Input
                value={organizacionData.address}
                variant="bordered"
                isReadOnly
                startContent={<MapPin className="h-4 w-4 text-gray-400" />}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <h4 className="text-lg font-semibold text-gray-900">Plan y Suscripción</h4>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CreditCard className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-700 font-medium">Plan Actual</p>
              <Chip color="success" variant="flat" className="mt-1">
                {getSubscriptionLabel(organizacionData.subscription_plan)}
              </Chip>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-700 font-medium">Estado</p>
              <Chip 
                color={getSubscriptionColor(organizacionData.subscription_status)} 
                variant="flat" 
                className="mt-1"
              >
                Activo
              </Chip>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-purple-700 font-medium">Miembro desde</p>
              <p className="text-xs text-purple-600 mt-1">
                {formatDate(organizacionData.created_at)}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Usuarios máximos:</span>
              <span className="text-sm font-bold text-gray-900">{organizacionData.max_users}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Dispositivos máximos:</span>
              <span className="text-sm font-bold text-gray-900">{organizacionData.max_devices}</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )

  const renderUsuarioSection = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-100 p-3 rounded-xl">
          <User className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Perfil de Usuario</h3>
          <p className="text-gray-600">Tu información personal</p>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardBody className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar 
              name="UD"
              size="lg"
              className="bg-gradient-to-br from-blue-500 to-purple-600 text-white"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{usuarioData.name}</h3>
              <p className="text-gray-600">{usuarioData.email}</p>
              <Chip color="primary" variant="flat" size="sm" className="mt-1">
                Propietario
              </Chip>
            </div>
          </div>
          
          <Divider />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
              <Input
                value={usuarioData.name}
                variant="bordered"
                isReadOnly
                startContent={<User className="h-4 w-4 text-gray-400" />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input
                value={usuarioData.email}
                variant="bordered"
                isReadOnly
                startContent={<Mail className="h-4 w-4 text-gray-400" />}
              />
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Modo Demo Activo</span>
            </div>
            <p className="text-sm text-blue-700">
              Estás navegando en modo demostración. Los cambios no se guardarán.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )

  const renderPreferenciasSection = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-green-100 p-3 rounded-xl">
          <Globe className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Idioma y Moneda</h3>
          <p className="text-gray-600">Personaliza tu experiencia</p>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Idioma del sistema</label>
                             <Select
                 selectedKeys={['es']}
                 variant="bordered"
                 isDisabled
                 placeholder="Seleccionar idioma"
               >
                 <SelectItem key="es">Español</SelectItem>
                 <SelectItem key="en">English</SelectItem>
                 <SelectItem key="pt">Português</SelectItem>
               </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
                             <Select
                 selectedKeys={['PEN']}
                 variant="bordered"
                 isDisabled
                 placeholder="Seleccionar moneda"
               >
                 <SelectItem key="PEN">Sol Peruano (S/)</SelectItem>
                 <SelectItem key="USD">Dólar Americano ($)</SelectItem>
                 <SelectItem key="EUR">Euro (€)</SelectItem>
               </Select>
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Configuración Demo</span>
            </div>
            <p className="text-sm text-orange-700">
              En la versión completa podrás cambiar idioma y moneda según tus preferencias.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )

  const renderSectionContent = () => {
    switch (selectedSection) {
      case 'organizacion':
        return renderOrganizacionSection()
      case 'usuario':
        return renderUsuarioSection()
      case 'preferencias':
        return renderPreferenciasSection()
      default:
        return renderOrganizacionSection()
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Configuración
          </h1>
          <p className="text-gray-600 mt-1">
            Administra la configuración de tu organización
          </p>
        </div>
        <Chip 
          color="warning" 
          variant="flat" 
          size="lg"
          className="font-semibold"
        >
          🎭 MODO DEMO
        </Chip>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de navegación */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold text-gray-900">Secciones</h3>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="space-y-2">
                {configSections.map((section) => {
                  const Icon = section.icon
                  return (
                    <Button
                      key={section.id}
                      variant={selectedSection === section.id ? "solid" : "light"}
                      color={selectedSection === section.id ? "primary" : "default"}
                      className="w-full justify-start"
                      startContent={<Icon className="h-4 w-4" />}
                      onPress={() => setSelectedSection(section.id)}
                    >
                      {section.title}
                    </Button>
                  )
                })}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Contenido principal */}
        <div className="lg:col-span-3">
          {renderSectionContent()}
        </div>
      </div>
    </div>
  )
} 