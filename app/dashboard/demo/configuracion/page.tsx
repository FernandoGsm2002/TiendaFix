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
  Switch,
  Textarea,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Avatar
} from '@heroui/react'
import { 
  Settings, 
  User, 
  Building, 
  Palette, 
  Globe, 
  Shield, 
  Bell, 
  Printer, 
  Database, 
  Smartphone,
  Mail,
  Phone,
  MapPin,
  Save,
  Eye,
  EyeOff,
  Key,
  Users,
  CreditCard
} from 'lucide-react'

export default function DemoConfiguracionPage() {
  const { t } = useTranslations()
  const [showPassword, setShowPassword] = useState(false)
  const [selectedSection, setSelectedSection] = useState('empresa')
  const { isOpen, onOpen, onClose } = useDisclosure()

  const configSections = [
    { id: 'empresa', title: 'Información de la Empresa', icon: Building },
    { id: 'usuario', title: 'Perfil de Usuario', icon: User },
    { id: 'sistema', title: 'Configuración del Sistema', icon: Settings },
    { id: 'notificaciones', title: 'Notificaciones', icon: Bell },
    { id: 'seguridad', title: 'Seguridad y Acceso', icon: Shield },
    { id: 'integraciones', title: 'Integraciones', icon: Database }
  ]

  const empresaConfig = {
    nombre: 'TiendaFix Demo',
    ruc: '20123456789',
    direccion: 'Av. Demo 123, Lima, Perú',
    telefono: '+51 999 888 777',
    email: 'demo@tiendafix.com',
    website: 'www.tiendafix.com',
    moneda: 'PEN',
    idioma: 'es',
    timezone: 'America/Lima',
    logoUrl: null
  }

  const usuarioConfig = {
    nombre: 'Fernando Administrador',
    email: 'fernando@tiendafix.com',
    telefono: '+51 987 654 321',
    rol: 'owner',
    avatar: null,
    twoFactorEnabled: true,
    emailNotifications: true,
    smsNotifications: false
  }

  const sistemaConfig = {
    autoBackup: true,
    backupFrequency: 'daily',
    maintenanceMode: false,
    debugMode: false,
    cacheEnabled: true,
    compressionEnabled: true,
    maxFileSize: '10MB',
    sessionTimeout: '30'
  }

  const renderEmpresaSection = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Información de la Empresa</h4>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la empresa
          </label>
          <Input
            value="TiendaFix Demo"
            variant="bordered"
            isReadOnly
            className="w-full"
            classNames={{
              input: "text-gray-900",
              inputWrapper: "border-gray-300"
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            RUC/NIT
          </label>
          <Input
            value="20123456789"
            variant="bordered"
            isReadOnly
            className="w-full"
            classNames={{
              input: "text-gray-900",
              inputWrapper: "border-gray-300"
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dirección
          </label>
          <Input
            value="Av. Demo 123, Lima, Perú"
            variant="bordered"
            isReadOnly
            className="w-full"
            classNames={{
              input: "text-gray-900",
              inputWrapper: "border-gray-300"
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono
          </label>
          <Input
            value="+51 999 888 777"
            variant="bordered"
            isReadOnly
            className="w-full"
            classNames={{
              input: "text-gray-900",
              inputWrapper: "border-gray-300"
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <Input
            value="demo@tiendafix.com"
            variant="bordered"
            isReadOnly
            className="w-full"
            classNames={{
              input: "text-gray-900",
              inputWrapper: "border-gray-300"
            }}
          />
        </div>
      </div>
    </div>
  )

  const renderUsuarioSection = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Avatar 
          name="FA"
          size="lg"
          className="bg-gradient-to-br from-blue-400 to-blue-600 text-white"
        />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{usuarioConfig.nombre}</h3>
          <p className="text-gray-600">{usuarioConfig.email}</p>
          <Chip color="primary" variant="flat" size="sm">
            Propietario
          </Chip>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nombre Completo"
          value={usuarioConfig.nombre}
          variant="bordered"
          disabled
        />
        <Input
          label="Email"
          value={usuarioConfig.email}
          startContent={<Mail className="h-4 w-4 text-gray-400" />}
          variant="bordered"
          disabled
        />
        <Input
          label="Teléfono"
          value={usuarioConfig.telefono}
          startContent={<Phone className="h-4 w-4 text-gray-400" />}
          variant="bordered"
          disabled
        />
        <Input
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          value="••••••••"
          endContent={
            <button onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          variant="bordered"
          disabled
        />
      </div>
    </div>
  )

  const renderSistemaSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Respaldos Automáticos</h4>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Respaldos automáticos</span>
            <Switch isSelected={sistemaConfig.autoBackup} disabled />
          </div>
          <Select label="Frecuencia de respaldo" value={sistemaConfig.backupFrequency} variant="bordered" disabled>
            <SelectItem key="daily">Diario</SelectItem>
            <SelectItem key="weekly">Semanal</SelectItem>
            <SelectItem key="monthly">Mensual</SelectItem>
          </Select>
        </div>
        
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Rendimiento</h4>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Cache habilitado</span>
            <Switch isSelected={sistemaConfig.cacheEnabled} disabled />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Compresión habilitada</span>
            <Switch isSelected={sistemaConfig.compressionEnabled} disabled />
          </div>
          <Input
            label="Tiempo de sesión (minutos)"
            value={sistemaConfig.sessionTimeout}
            variant="bordered"
            disabled
          />
        </div>
      </div>
      
      <Divider />
      
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Modo de Mantenimiento</h4>
        <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Activar modo mantenimiento</p>
            <p className="text-sm text-gray-600">Los usuarios no podrán acceder al sistema</p>
          </div>
          <Switch isSelected={sistemaConfig.maintenanceMode} disabled />
        </div>
      </div>
    </div>
  )

  const renderNotificacionesSection = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Notificaciones por Email</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Nuevas reparaciones</span>
            <Switch isSelected={true} disabled />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Reparaciones completadas</span>
            <Switch isSelected={true} disabled />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Stock bajo</span>
            <Switch isSelected={true} disabled />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Reportes semanales</span>
            <Switch isSelected={false} disabled />
          </div>
        </div>
      </div>
      
      <Divider />
      
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Notificaciones SMS</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Alertas urgentes</span>
            <Switch isSelected={true} disabled />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Recordatorios de citas</span>
            <Switch isSelected={false} disabled />
          </div>
        </div>
      </div>
      
      <Divider />
      
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Notificaciones Push</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Activar notificaciones push</span>
            <Switch isSelected={true} disabled />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Sonido de notificación</span>
            <Switch isSelected={true} disabled />
          </div>
        </div>
      </div>
    </div>
  )

  const renderSeguridadSection = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Autenticación de Dos Factores</h4>
        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">2FA Habilitado</p>
            <p className="text-sm text-gray-600">Protección adicional para tu cuenta</p>
          </div>
          <Switch isSelected={usuarioConfig.twoFactorEnabled} disabled />
        </div>
      </div>
      
      <Divider />
      
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Políticas de Contraseña</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Longitud mínima: 8 caracteres</span>
            <Chip color="success" variant="flat" size="sm">Activo</Chip>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Requiere mayúsculas y minúsculas</span>
            <Chip color="success" variant="flat" size="sm">Activo</Chip>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Requiere números</span>
            <Chip color="success" variant="flat" size="sm">Activo</Chip>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Caducidad cada 90 días</span>
            <Chip color="warning" variant="flat" size="sm">Desactivado</Chip>
          </div>
        </div>
      </div>
      
      <Divider />
      
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Sesiones Activas</h4>
        <div className="space-y-3">
          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Chrome en Windows</p>
                  <p className="text-sm text-gray-500">IP: 192.168.1.100 • Activa ahora</p>
                </div>
              </div>
              <Chip color="success" variant="flat" size="sm">Actual</Chip>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderIntegracionesSection = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Servicios de Pago</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Yape</p>
                <p className="text-sm text-gray-500">Pagos móviles</p>
              </div>
            </div>
            <Switch isSelected={true} disabled />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Plin</p>
                <p className="text-sm text-gray-500">Transferencias bancarias</p>
              </div>
            </div>
            <Switch isSelected={false} disabled />
          </div>
        </div>
      </div>
      
      <Divider />
      
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">APIs Externas</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">SUNAT API</p>
                <p className="text-sm text-gray-500">Validación de RUC y facturación</p>
              </div>
            </div>
            <Chip color="success" variant="flat" size="sm">Conectado</Chip>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-gray-900">SMS Gateway</p>
                <p className="text-sm text-gray-500">Envío de notificaciones SMS</p>
              </div>
            </div>
            <Chip color="warning" variant="flat" size="sm">Desconectado</Chip>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSectionContent = () => {
    switch (selectedSection) {
      case 'empresa': return renderEmpresaSection()
      case 'usuario': return renderUsuarioSection()
      case 'sistema': return renderSistemaSection()
      case 'notificaciones': return renderNotificacionesSection()
      case 'seguridad': return renderSeguridadSection()
      case 'integraciones': return renderIntegracionesSection()
      default: return renderEmpresaSection()
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Configuración del Sistema
          </h1>
          <p className="text-gray-600 mt-1">
            Administra configuraciones y preferencias
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Chip 
            color="warning" 
            variant="flat" 
            size="lg"
            className="font-semibold"
          >
            🎭 MODO DEMO
          </Chip>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de navegación */}
        <Card className="shadow-lg lg:col-span-1">
          <CardHeader className="pb-0">
            <h3 className="text-lg font-semibold text-gray-900">Secciones</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {configSections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSection(section.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      selectedSection === section.id 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{section.title}</span>
                  </button>
                )
              })}
            </div>
          </CardBody>
        </Card>

        {/* Contenido principal */}
        <Card className="shadow-lg lg:col-span-3">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                {(() => {
                  const currentSection = configSections.find(s => s.id === selectedSection)
                  const Icon = currentSection?.icon || Settings
                  return <Icon className="h-6 w-6 text-blue-600" />
                })()}
                <h3 className="text-xl font-semibold text-gray-900">
                  {configSections.find(s => s.id === selectedSection)?.title}
                </h3>
              </div>
              <Chip color="primary" variant="flat" size="sm">
                Solo visualización
              </Chip>
            </div>
          </CardHeader>
          <CardBody>
            {renderSectionContent()}
          </CardBody>
        </Card>
      </div>

      {/* Información del demo */}
      <Card className="shadow-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50">
        <CardBody className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Panel de Configuración Completo ⚙️
              </h3>
              <p className="text-gray-700 mb-4">
                Esta es una vista completa del panel de configuración con todas las opciones disponibles. 
                En la versión real, podrías personalizar completamente tu experiencia y configurar integraciones.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    Configuración empresarial completa
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    Gestión de usuarios y permisos
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    Integraciones con servicios externos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
} 