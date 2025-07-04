'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TechnicianDashboardLayout from '../components/TechnicianDashboardLayout'
import { 
  Card, 
  CardBody, 
  Input,
  Select,
  SelectItem,
  Chip,
  Skeleton,
  Tooltip,
  Avatar,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Button
} from '@heroui/react'
import { formatCurrency } from '@/lib/utils/currency'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import { 
  Search, 
  Eye, 
  Smartphone, 
  Laptop,
  Tablet,
  Watch,
  Users,
  Calendar,
  Wrench,
  CheckCircle,
  Clock,
  Monitor,
  Cpu,
  Hash,
  User,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'

interface Device {
  id: string
  brand: string
  model: string
  serial_number: string
  imei?: string
  device_type: string
  color?: string
  storage_capacity?: string
  operating_system?: string
  notes?: string
  status: string
  created_at: string
  updated_at: string
  customers: {
    id: string
    name: string | null
    email: string | null
    phone: string | null
    anonymous_identifier: string | null
    customer_type: string
  } | null
  repairs: {
    id: string
    title: string
    status: string
    created_at: string
  }[]
}

export default function TechnicianDevicesPage() {
  const router = useRouter()
  const { t } = useTranslations()

  // REDIRECCIÓN AUTOMÁTICA - Apartado de dispositivos temporalmente deshabilitado
  useEffect(() => {
    router.push('/dashboard/technician/clientes')
  }, [router])

  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroMarca, setFiltroMarca] = useState('todas')
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)

  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure()

  // Cargar dispositivos
  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filtroTipo !== 'todos') params.append('device_type', filtroTipo)
      if (filtroMarca !== 'todas') params.append('brand', filtroMarca)
      if (busqueda) params.append('search', busqueda)

      const response = await fetch(`/api/devices?${params}`)
      if (!response.ok) throw new Error('Error al cargar dispositivos')
      
      const data = await response.json()
      setDevices(data.data || [])
    } catch (error) {
      console.error('Error fetching devices:', error)
      setDevices([])
    } finally {
      setLoading(false)
    }
  }

  // Aplicar filtros cuando cambien
  useEffect(() => {
    fetchDevices()
  }, [filtroTipo, filtroMarca, busqueda])

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartphone': return Smartphone
      case 'laptop': return Laptop
      case 'tablet': return Tablet
      case 'smartwatch': return Watch
      default: return Smartphone
    }
  }

  const getDeviceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'smartphone': 'Smartphone',
      'laptop': 'Laptop',
      'tablet': 'Tablet',
      'smartwatch': 'Smartwatch',
      'other': 'Otro'
    }
    return labels[type] || type
  }

  const getConditionColor = (condition: string) => {
    const colors: Record<string, any> = {
      'Excelente': 'success',
      'Muy bueno': 'primary',
      'Usado': 'warning',
      'Dañado': 'danger'
    }
    return colors[condition] || 'default'
  }

  const getRepairStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      'received': 'default',
      'diagnosed': 'warning',
      'in_progress': 'primary',
      'completed': 'success',
      'cancelled': 'danger'
    }
    return colors[status] || 'default'
  }

  const getRepairStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'received': 'Recibido',
      'diagnosed': 'Diagnosticado',
      'in_progress': 'En Proceso',
      'completed': 'Completado',
      'cancelled': 'Cancelado'
    }
    return labels[status] || status
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredDevices = devices.filter(device => {
    const customerName = device.customers?.name || device.customers?.anonymous_identifier || '';
    const matchesSearch = customerName.toLowerCase().includes(busqueda.toLowerCase()) ||
                         (device.brand || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                         (device.model || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                         (device.serial_number || '').toLowerCase().includes(busqueda.toLowerCase())
    const matchesType = filtroTipo === 'todos' || device.device_type === filtroTipo
    const matchesBrand = filtroMarca === 'todas' || (device.brand || '').toLowerCase() === filtroMarca.toLowerCase()
    return matchesSearch && matchesType && matchesBrand
  })

  const stats = {
    total: devices.length,
    smartphones: devices.filter(d => d.device_type === 'smartphone').length,
    laptops: devices.filter(d => d.device_type === 'laptop').length,
    tablets: devices.filter(d => d.device_type === 'tablet').length,
    conReparaciones: devices.filter(d => d.repairs.some(r => ['received', 'diagnosed', 'in_progress'].includes(r.status))).length
  }

  const handleViewDetails = (device: Device) => {
    setSelectedDevice(device)
    onDetailOpen()
  }

  if (loading) {
    return (
      <TechnicianDashboardLayout>
        <div className="space-y-8">
          <Skeleton className="h-12 w-80 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="shadow-xl">
                <CardBody className="p-6">
                  <Skeleton className="h-32 w-full rounded-lg" />
                </CardBody>
              </Card>
            ))}
          </div>
          <Card className="shadow-xl">
            <CardBody className="p-6">
              <Skeleton className="h-80 w-full rounded-lg" />
            </CardBody>
          </Card>
        </div>
      </TechnicianDashboardLayout>
    )
  }

  return (
    <TechnicianDashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Registro de Dispositivos
            </h1>
            <p className="text-gray-600 font-medium">
              Base de datos de dispositivos • Historial de reparaciones
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500 font-medium">Consulta disponible</span>
              </div>
              <Chip 
                color="primary" 
                variant="flat"
                startContent={<Monitor className="w-4 h-4" />}
                className="font-semibold"
              >
                {stats.total} dispositivos registrados
              </Chip>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover:scale-105 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-blue-100">
            <CardBody className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md">
                  <Monitor className="w-4 h-4 text-white" />
                </div>
                <Chip color="primary" variant="flat" size="sm" className="font-medium">Total</Chip>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-cyan-700">Total Dispositivos</p>
                <p className="text-xl font-bold text-cyan-800">{stats.total}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
            <CardBody className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
                <Chip color="primary" variant="flat" size="sm" className="font-medium">Móviles</Chip>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-blue-700">Teléfonos Móviles</p>
                <p className="text-xl font-bold text-blue-800">{stats.smartphones}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
            <CardBody className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
                  <Tablet className="w-4 h-4 text-white" />
                </div>
                <Chip color="success" variant="flat" size="sm" className="font-medium">Tablets</Chip>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-green-700">Tablets y Otros</p>
                <p className="text-xl font-bold text-green-800">{stats.tablets}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardBody className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-md">
                  <Wrench className="w-4 h-4 text-white" />
                </div>
                <Chip color="warning" variant="flat" size="sm" className="font-medium">En Reparación</Chip>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-orange-700">Con Reparaciones</p>
                <p className="text-xl font-bold text-orange-800">{stats.conReparaciones}</p>
              </div>
            </CardBody>
          </Card>


        </div>

        {/* Filtros */}
        <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-gray-50">
          <CardBody className="p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="flex-1 w-full">
              <Input
                placeholder="Buscar por cliente, marca, modelo o número de serie..."
                value={busqueda}
                onValueChange={setBusqueda}
                  startContent={
                    <div className="p-1 rounded-md bg-gradient-to-br from-cyan-100 to-blue-100">
                      <Search className="w-4 h-4 text-cyan-600" />
                    </div>
                  }
                variant="bordered"
                  classNames={{
                    input: "text-gray-900 placeholder:text-gray-500",
                    inputWrapper: "border-gray-300 hover:border-cyan-400 focus-within:border-cyan-500 bg-white shadow-md",
                  }}
              />
              </div>
              <div className="flex gap-4 w-full lg:w-auto">
              <Select
                  placeholder="Tipo de Dispositivo"
                selectedKeys={new Set([filtroTipo])}
                onSelectionChange={(keys) => setFiltroTipo(Array.from(keys)[0] as string)}
                variant="bordered"
                  className="w-full lg:w-60"
                  classNames={{
                    trigger: "text-gray-900 border-gray-300 hover:border-cyan-400 bg-white shadow-md",
                    value: "text-gray-900",
                    popoverContent: "bg-white shadow-2xl border border-gray-200",
                  }}
                >
                  <SelectItem key="todos" className="text-gray-900">{t('filters.allTypes')}</SelectItem>
                  <SelectItem key="smartphone" className="text-gray-900">Smartphones</SelectItem>
                  <SelectItem key="laptop" className="text-gray-900">Laptops</SelectItem>
                  <SelectItem key="tablet" className="text-gray-900">Tablets</SelectItem>
                  <SelectItem key="smartwatch" className="text-gray-900">Smartwatches</SelectItem>
              </Select>
              <Select
                placeholder="Marca"
                selectedKeys={new Set([filtroMarca])}
                onSelectionChange={(keys) => setFiltroMarca(Array.from(keys)[0] as string)}
                variant="bordered"
                  className="w-full lg:w-52"
                  classNames={{
                    trigger: "text-gray-900 border-gray-300 hover:border-cyan-400 bg-white shadow-md",
                    value: "text-gray-900",
                    popoverContent: "bg-white shadow-2xl border border-gray-200",
                  }}
                >
                  <SelectItem key="todas" className="text-gray-900">Todas las marcas</SelectItem>
                  <SelectItem key="apple" className="text-gray-900">Apple</SelectItem>
                  <SelectItem key="samsung" className="text-gray-900">Samsung</SelectItem>
                  <SelectItem key="huawei" className="text-gray-900">Huawei</SelectItem>
                  <SelectItem key="xiaomi" className="text-gray-900">Xiaomi</SelectItem>
                  <SelectItem key="motorola" className="text-gray-900">Motorola</SelectItem>
                  <SelectItem key="lg" className="text-gray-900">LG</SelectItem>
              </Select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Tabla de dispositivos */}
        <Card className="shadow-xl border-0 bg-white">
          <CardBody className="p-0">
            <Table 
              aria-label="Tabla de dispositivos"
              classNames={{
                wrapper: "min-h-[300px] shadow-none",
                th: "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-bold text-sm border-b border-gray-200",
                td: "py-3 border-b border-gray-100"
              }}
            >
              <TableHeader>
                <TableColumn>DISPOSITIVO & PROPIETARIO</TableColumn>
                <TableColumn>TIPO & ESPECIFICACIONES</TableColumn>
                <TableColumn>IDENTIFICACIÓN</TableColumn>
                <TableColumn>CONTACTO</TableColumn>
                <TableColumn>ESTADO & REPARACIONES</TableColumn>
                <TableColumn>REGISTRO</TableColumn>
                <TableColumn>ACCIONES</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredDevices.map((device) => {
                  const IconComponent = getDeviceIcon(device.device_type)
                  return (
                    <TableRow key={device.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <Avatar
                            icon={<IconComponent className="w-4 h-4" />}
                            size="md"
                            classNames={{
                              base: "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg",
                              icon: "text-white"
                            }}
                          />
                          <div>
                            <p className="font-bold text-gray-900">
                              {device.brand} {device.model}
                            </p>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <p className="text-sm text-gray-600">
                                {device.customers?.name || device.customers?.anonymous_identifier || 'Cliente no registrado'}
                              </p>
                            </div>
                            {device.color && (
                              <Chip size="sm" color="default" variant="flat" className="mt-1">
                                {device.color}
                              </Chip>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Chip
                            color="primary"
                            variant="flat"
                            size="md"
                            className="font-semibold"
                          >
                            {getDeviceTypeLabel(device.device_type)}
                          </Chip>
                          {device.storage_capacity && (
                            <div className="flex items-center gap-2">
                              <Cpu className="w-4 h-4 text-gray-400" />
                              <p className="text-sm text-gray-600">{device.storage_capacity}</p>
                            </div>
                          )}
                          {device.operating_system && (
                            <p className="text-xs text-gray-500">{device.operating_system}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {device.serial_number && (
                            <div className="flex items-center gap-2">
                              <Hash className="w-4 h-4 text-gray-400" />
                              <p className="text-sm font-medium text-gray-700">
                                {device.serial_number}
                              </p>
                            </div>
                          )}
                          {device.imei && (
                            <div className="flex items-center gap-2">
                              <Smartphone className="w-4 h-4 text-gray-400" />
                              <p className="text-sm text-gray-600">
                              IMEI: {device.imei}
                            </p>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {device.customers?.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-green-500" />
                              <p className="text-sm text-gray-700">
                                {device.customers.phone}
                              </p>
                            </div>
                          )}
                          {device.customers?.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-blue-500" />
                              <p className="text-sm text-gray-600">
                                {device.customers.email}
                              </p>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-3">
                          <Chip
                            color="success"
                            variant="flat"
                            size="md"
                            startContent={<CheckCircle className="w-4 h-4" />}
                            className="font-semibold"
                          >
                            Registrado
                          </Chip>
                          {device.repairs.length > 0 && (
                        <div className="space-y-1">
                              <p className="text-xs text-gray-500 font-medium">
                                {device.repairs.length} reparacion(es)
                              </p>
                              {device.repairs.slice(0, 2).map((repair) => (
                                <Chip
                                  key={repair.id}
                                  color={getRepairStatusColor(repair.status)}
                                  variant="flat"
                                  size="sm"
                                  className="mr-1"
                                >
                                  {getRepairStatusLabel(repair.status)}
                            </Chip>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <p className="text-sm text-gray-600">
                              {formatDate(device.created_at)}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500">
                            Actualizado: {formatDate(device.updated_at)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Tooltip 
                          content="Ver detalles completos"
                          classNames={{ content: "bg-gray-900 text-white" }}
                        >
                            <Button 
                              isIconOnly 
                            size="sm"
                              variant="flat" 
                            color="primary"
                              onPress={() => handleViewDetails(device)}
                            className="hover:scale-110 transition-transform"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {filteredDevices.length === 0 && (
              <div className="text-center py-16">
                <Monitor className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No se encontraron dispositivos</h3>
                <p className="text-gray-600 text-lg">
                  {busqueda || filtroTipo !== 'todos' || filtroMarca !== 'todas'
                    ? 'No hay dispositivos que coincidan con los filtros aplicados.'
                    : 'No hay dispositivos registrados en el sistema.'}
                </p>
                {(busqueda || filtroTipo !== 'todos' || filtroMarca !== 'todas') && (
                  <Button
                    color="primary"
                    variant="flat"
                    className="mt-4"
                    onPress={() => {
                      setBusqueda('')
                      setFiltroTipo('todos')
                      setFiltroMarca('todas')
                    }}
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Modal de detalles */}
        <Modal 
          isOpen={isDetailOpen} 
          onOpenChange={onDetailClose} 
          size="2xl"
          scrollBehavior="inside"
          classNames={{
            wrapper: "z-[1000]",
            backdrop: "z-[999]",
            base: "max-h-[95vh] my-2 mx-2 sm:mx-6",
            body: "max-h-[75vh] overflow-y-auto py-4",
            header: "border-b border-gray-200 pb-4",
            footer: "border-t border-gray-200 pt-4"
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                      {selectedDevice && React.createElement(getDeviceIcon(selectedDevice.device_type), { className: "w-6 h-6 text-white" })}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Detalles del Dispositivo</h3>
                      <p className="text-cyan-100 text-sm">Información completa del dispositivo</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody className="p-6">
                  {selectedDevice && (
                    <div className="space-y-6">
                      {/* Información del dispositivo */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Monitor className="w-5 h-5 text-cyan-600" />
                          Información del Dispositivo
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Marca:</p>
                            <p className="font-semibold text-gray-900">{selectedDevice.brand}</p>
                          </div>
                        <div>
                            <p className="text-sm text-gray-600">Modelo:</p>
                            <p className="font-semibold text-gray-900">{selectedDevice.model}</p>
                        </div>
                          <div>
                            <p className="text-sm text-gray-600">Tipo:</p>
                            <Chip color="primary" variant="flat">
                              {getDeviceTypeLabel(selectedDevice.device_type)}
                            </Chip>
                      </div>
                        <div>
                            <p className="text-sm text-gray-600">Color:</p>
                            <p className="font-semibold text-gray-900">{selectedDevice.color || 'No especificado'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Capacidad:</p>
                            <p className="font-semibold text-gray-900">{selectedDevice.storage_capacity || 'No especificado'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Sistema:</p>
                            <p className="font-semibold text-gray-900">{selectedDevice.operating_system || 'No especificado'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Identificación */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 p-6 rounded-xl">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Hash className="w-5 h-5 text-blue-600" />
                          Identificación
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedDevice.serial_number && (
                      <div>
                              <p className="text-sm text-gray-600">Número de Serie:</p>
                              <p className="font-mono text-gray-900 bg-white p-2 rounded border">
                              {selectedDevice.serial_number}
                              </p>
                            </div>
                          )}
                          {selectedDevice.imei && (
                            <div>
                              <p className="text-sm text-gray-600">IMEI:</p>
                              <p className="font-mono text-gray-900 bg-white p-2 rounded border">
                                {selectedDevice.imei}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Información del cliente */}
                      {selectedDevice.customers && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-100 p-6 rounded-xl">
                          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-green-600" />
                            Propietario
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Nombre:</p>
                              <p className="font-semibold text-gray-900">
                                {selectedDevice.customers.name || selectedDevice.customers.anonymous_identifier}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Tipo:</p>
                              <Chip 
                                color={selectedDevice.customers.customer_type === 'registered' ? 'success' : 'warning'} 
                                variant="flat"
                              >
                                {selectedDevice.customers.customer_type === 'registered' ? 'Registrado' : 'Anónimo'}
                              </Chip>
                            </div>
                            {selectedDevice.customers.phone && (
                              <div>
                                <p className="text-sm text-gray-600">Teléfono:</p>
                                <p className="font-semibold text-gray-900">{selectedDevice.customers.phone}</p>
                              </div>
                            )}
                            {selectedDevice.customers.email && (
                        <div>
                                <p className="text-sm text-gray-600">Email:</p>
                                <p className="font-semibold text-gray-900">{selectedDevice.customers.email}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Historial de reparaciones */}
                      <div className="bg-gradient-to-r from-orange-50 to-red-100 p-6 rounded-xl">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Wrench className="w-5 h-5 text-orange-600" />
                          Historial de Reparaciones ({selectedDevice.repairs.length})
                        </h4>
                        {selectedDevice.repairs.length > 0 ? (
                          <div className="space-y-3">
                            {selectedDevice.repairs.map((repair) => (
                              <div key={repair.id} className="bg-white p-4 rounded-lg border">
                                <div className="flex items-center justify-between">
                                  <p className="font-semibold text-gray-900">{repair.title}</p>
                                    <Chip
                                      color={getRepairStatusColor(repair.status)}
                                      variant="flat"
                                      size="sm"
                                    >
                                      {getRepairStatusLabel(repair.status)}
                                    </Chip>
                                  </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  Fecha: {formatDate(repair.created_at)}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-600 italic">No hay reparaciones registradas para este dispositivo.</p>
                        )}
                      </div>

                      {/* Notas */}
                      {selectedDevice.notes && (
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-100 p-6 rounded-xl">
                          <h4 className="text-lg font-bold text-gray-900 mb-3">Notas Adicionales</h4>
                          <p className="text-gray-700 bg-white p-4 rounded-lg border">
                            {selectedDevice.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </ModalBody>
                <ModalFooter className="border-t border-gray-200">
                  <Button variant="flat" onPress={onClose} size="lg">
                    Cerrar
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </TechnicianDashboardLayout>
  )
} 