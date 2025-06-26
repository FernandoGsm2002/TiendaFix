'use client'

import React, { useState, useEffect } from 'react'
import TechnicianDashboardLayout from '../components/TechnicianDashboardLayout'
import { 
  Card, 
  CardBody, 
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Skeleton,
  Tooltip,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
  Switch
} from '@heroui/react'
import { textColors } from '@/lib/utils/colors'
import { formatCurrency } from '@/lib/utils/currency'
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Check,
  Wrench,
  Clock,
  CheckCircle,
  Smartphone,
  User,
  ClipboardList,
  X,
  AlertTriangle
} from 'lucide-react'

interface Repair {
  id: string
  title: string
  description: string
  problem_description: string
  solution_description: string | null
  status: string
  priority: string
  cost: number
  created_at: string
  updated_at: string
  unregistered_customer_name: string | null
  unregistered_customer_phone: string | null
  unregistered_device_info: string | null
  customers: {
    id: string
    name: string | null
    phone: string | null
    email: string | null
    anonymous_identifier: string | null
    customer_type: string
  } | null
  devices: {
    id: string
    brand: string
    model: string
    device_type: string
    color: string | null
    serial_number: string | null
    imei: string | null
  } | null
  users: {
    id: string
    name: string
    email: string
  } | null
}

interface Customer {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  anonymous_identifier: string | null
  customer_type: string
}

interface Device {
  id: string
  customer_id: string
  brand: string
  model: string
  device_type: string
  color: string | null
  serial_number: string | null
  imei: string | null
}

interface NewRepairForm {
  customer_id: string
  device_description: string
  title: string
  description: string
  problem_description: string
  priority: string
  cost: number
  internal_notes: string
  unregistered_customer_name?: string
  unregistered_customer_phone?: string
}

export default function TechnicianRepairsPage() {
  const [repairs, setRepairs] = useState<Repair[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  // Eliminado: Ya no necesitamos gestionar dispositivos por separado
  const [loading, setLoading] = useState(true)
  const [createLoading, setCreateLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isUnregistered, setIsUnregistered] = useState(false)
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    received: 0,
    diagnosed: 0,
    inProgress: 0,
    completed: 0,
    delivered: 0,
    cancelled: 0,
  })

  const [newRepair, setNewRepair] = useState<NewRepairForm>({
    customer_id: '',
    device_description: '',
    title: '',
    description: '',
    problem_description: '',
    priority: 'medium',
    cost: 0,
    internal_notes: '',
    unregistered_customer_name: '',
    unregistered_customer_phone: ''
  })

  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure()
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure()
  const { isOpen: isStatusOpen, onOpen: onStatusOpen, onClose: onStatusClose } = useDisclosure()

  useEffect(() => {
    fetchRepairs()
    fetchCustomers()
    // Eliminado: Ya no necesitamos cargar dispositivos
  }, [filtroEstado, busqueda])

  const fetchRepairs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filtroEstado !== 'todos') params.append('status', filtroEstado)
      if (busqueda) params.append('search', busqueda)

      const response = await fetch(`/api/repairs?${params}`)
      if (!response.ok) throw new Error('Error al cargar reparaciones')
      
      const data = await response.json()
      setRepairs(data.data || [])
      setStats(data.stats || stats)
    } catch (error) {
      console.error('Error fetching repairs:', error)
      setRepairs([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers?limit=100')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  // Eliminado: fetchDevices ya no se necesita

  const handleCreateRepair = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    setError(null)
    
    // Crear payload según el tipo de cliente
    const payload = isUnregistered
      ? {
          title: newRepair.title,
          description: newRepair.description,
          problem_description: newRepair.problem_description,
          priority: newRepair.priority,
          cost: newRepair.cost,
          internal_notes: newRepair.internal_notes,
          unregistered_customer_name: newRepair.unregistered_customer_name,
          unregistered_customer_phone: newRepair.unregistered_customer_phone,
          unregistered_device_info: newRepair.device_description,
          customer_id: null,
        }
      : {
          customer_id: newRepair.customer_id,
          unregistered_device_info: newRepair.device_description, // Para clientes registrados también usamos descripción libre
          title: newRepair.title,
          description: newRepair.description,
          problem_description: newRepair.problem_description,
          priority: newRepair.priority,
          cost: newRepair.cost,
          internal_notes: newRepair.internal_notes,
        }
    
    // Validaciones específicas
    if (isUnregistered) {
      if (!newRepair.unregistered_customer_name || !newRepair.device_description) {
        setError('Para clientes no registrados, el nombre y la información del dispositivo son obligatorios.')
        setCreateLoading(false)
        return
      }
    } else {
      if (!newRepair.customer_id || !newRepair.device_description) {
        setError('Por favor, seleccione un cliente y describa el dispositivo.')
        setCreateLoading(false)
        return
      }
    }

    // Validaciones generales
    if (!newRepair.title || !newRepair.problem_description) {
      setError('El título y la descripción del problema son obligatorios.')
      setCreateLoading(false)
      return
    }

    try {
      const response = await fetch('/api/repairs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear la reparación')
      }

      await fetchRepairs()
      onCreateClose()
      setNewRepair({
        customer_id: '',
        device_description: '',
        title: '',
        description: '',
        problem_description: '',
        priority: 'medium',
        cost: 0,
        internal_notes: '',
        unregistered_customer_name: '',
        unregistered_customer_phone: ''
      })
      // Eliminado: Ya no usamos filteredDevices
      setIsUnregistered(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleCustomerChange = (customerId: string) => {
    setNewRepair(prev => ({ ...prev, customer_id: customerId, device_description: '' }))
    // Eliminado: Ya no necesitamos filtrar dispositivos
  }

  const getCustomerDisplay = (customer: Customer) => {
    return customer.name || customer.anonymous_identifier || 'Cliente Anónimo'
  }

  // Eliminado: getDeviceDisplay ya no se necesita

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      'received': 'default',
      'diagnosed': 'warning',
      'in_progress': 'primary',
      'waiting_parts': 'secondary',
      'completed': 'success',
      'delivered': 'success',
      'cancelled': 'danger'
    }
    return colors[status] || 'default'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'received': 'Recibido',
      'diagnosed': 'Diagnosticado',
      'in_progress': 'En Proceso',
      'waiting_parts': 'Esperando Repuestos',
      'completed': 'Completado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    }
    return labels[status] || status
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, any> = {
      'low': 'default',
      'medium': 'warning',
      'high': 'danger',
      'urgent': 'danger'
    }
    return colors[priority] || 'default'
  }

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      'low': 'Baja',
      'medium': 'Media',
      'high': 'Alta',
      'urgent': 'Urgente'
    }
    return labels[priority] || priority
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getCustomerName = (customer: Repair['customers'], unregisteredName?: string | null) => {
    if (unregisteredName) return unregisteredName
    if (!customer) return 'Cliente desconocido'
    return customer.name || customer.anonymous_identifier || 'Cliente anónimo'
  }

  const getDeviceName = (device: Repair['devices'], unregisteredInfo?: string | null) => {
    if (unregisteredInfo) return unregisteredInfo
    if (!device) return 'Dispositivo desconocido'
    return `${device.brand} ${device.model}`
  }

  const handleViewDetails = (repair: Repair) => {
    setSelectedRepair(repair)
    onDetailOpen()
  }

  const handleStatusChange = (repair: Repair) => {
    setSelectedRepair(repair)
    onStatusOpen()
  }

  const confirmUpdateStatus = async (newStatus: string) => {
    if (!selectedRepair) return

    setUpdateLoading(true)
    try {
      const response = await fetch(`/api/repairs/${selectedRepair.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error al decodificar la respuesta del servidor' }))
        const errorMessage = errorData.error || 'Error al actualizar el estado'
        throw new Error(errorMessage)
      }
      
      onStatusClose()
      fetchRepairs() // Recargar para ver el cambio
    } catch (error) {
      console.error("Failed to update status", error)
      alert(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setUpdateLoading(false)
    }
  }

  const renderCell = React.useCallback((repair: Repair, columnKey: React.Key) => {
    switch (columnKey) {
      case "dispositivo":
        return (
          <div className="flex items-center gap-3">
            <Avatar
              icon={<Smartphone className="w-4 h-4" />}
              classNames={{
                base: "bg-gradient-to-br from-blue-400 to-purple-600",
                icon: "text-white"
              }}
            />
            <div>
              <p className={`font-semibold ${textColors.primary}`}>
                {repair.devices ? 
                  `${repair.devices.brand} ${repair.devices.model}` : 
                  'Dispositivo no registrado'
                }
              </p>
              <p className={`text-sm ${textColors.muted}`}>
                {repair.devices ? 
                  repair.devices.device_type : 
                  'Ver detalles para más información'
                }
              </p>
            </div>
          </div>
        )
      case "cliente":
        return (
          <div className="flex items-center gap-3">
            <Avatar
              icon={<User className="w-4 h-4" />}
              classNames={{
                base: "bg-gradient-to-br from-green-400 to-blue-600",
                icon: "text-white"
              }}
            />
            <div>
              <p className={`font-semibold ${textColors.primary}`}>
                {getCustomerName(repair.customers, repair.unregistered_customer_name)}
              </p>
              <p className={`text-sm ${textColors.muted}`}>
                {repair.customers?.phone || repair.unregistered_customer_phone || 'Sin contacto'}
              </p>
            </div>
          </div>
        )
      case "problema":
        return (
          <div className="max-w-xs">
            <p className={`font-semibold ${textColors.primary} truncate`}>
              {repair.title}
            </p>
            <p className={`text-sm ${textColors.muted} truncate`}>
              {repair.problem_description}
            </p>
          </div>
        )
      case "estado":
        return (
          <div className="flex flex-col gap-1">
            <Chip
              color={getStatusColor(repair.status)}
              variant="flat"
              size="sm"
            >
              {getStatusLabel(repair.status)}
            </Chip>
            <Chip
              color={getPriorityColor(repair.priority)}
              variant="flat"
              size="sm"
            >
              {getPriorityLabel(repair.priority)}
            </Chip>
          </div>
        )
      case "costo":
        return (
          <p className={`font-semibold ${textColors.primary}`}>
            {formatCurrency(repair.cost)}
          </p>
        )
      case "fecha":
        return (
          <p className={`text-sm ${textColors.secondary}`}>
            {formatDate(repair.created_at)}
          </p>
        )
      case "acciones":
        return (
          <div className="flex items-center gap-2">
            <Tooltip content="Ver detalles" classNames={{ content: "bg-gray-900 text-white" }}>
              <Button 
                isIconOnly 
                variant="flat" 
                size="sm" 
                aria-label="Ver detalles de la reparación"
                onPress={() => handleViewDetails(repair)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Cambiar estado" classNames={{ content: "bg-gray-900 text-white" }}>
              <Button 
                isIconOnly 
                variant="flat" 
                color="primary" 
                size="sm" 
                aria-label="Cambiar estado de la reparación"
                onPress={() => handleStatusChange(repair)}
              >
                <ClipboardList className="w-4 h-4" />
              </Button>
            </Tooltip>
            {repair.status === 'in_progress' && (
              <Tooltip content="Marcar como completada" classNames={{ content: "bg-gray-900 text-white" }}>
                <Button 
                  isIconOnly 
                  variant="flat" 
                  color="success" 
                  size="sm" 
                  aria-label="Marcar reparación como completada"
                  onPress={() => confirmUpdateStatus('completed')}
                >
                  <Check className="w-4 h-4" />
                </Button>
              </Tooltip>
            )}
          </div>
        )
      default:
        return <span>{repair[columnKey as keyof Repair]?.toString()}</span>
    }
  }, [])

  const columns = [
    { name: "DISPOSITIVO", uid: "dispositivo" },
    { name: "CLIENTE", uid: "cliente" },
    { name: "PROBLEMA", uid: "problema" },
    { name: "ESTADO", uid: "estado" },
    { name: "COSTO", uid: "costo" },
    { name: "FECHA", uid: "fecha" },
    { name: "ACCIONES", uid: "acciones" },
  ]

  if (loading) {
    return (
      <TechnicianDashboardLayout>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3">
              <Skeleton className="h-10 w-64 rounded-lg" />
              <Skeleton className="h-4 w-96 rounded-lg" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-32 rounded-lg" />
                <Skeleton className="h-6 w-40 rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-12 w-48 rounded-lg" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="shadow-lg">
                <CardBody className="p-6 space-y-3">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-8 w-12 rounded" />
                  <Skeleton className="h-2 w-full rounded" />
                </CardBody>
              </Card>
            ))}
          </div>
          
          <Card className="shadow-lg">
            <CardBody className="p-6">
              <Skeleton className="h-96 w-full rounded" />
            </CardBody>
          </Card>
        </div>
      </TechnicianDashboardLayout>
    )
  }

  return (
    <TechnicianDashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Mis Reparaciones
            </h1>
            <p className="text-gray-600 font-medium">
              Panel de trabajo • Gestión de reparaciones asignadas
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500 font-medium">Gestión activa</span>
              </div>
              <Chip 
                color="primary" 
                variant="flat"
                startContent={<Wrench className="w-4 h-4" />}
                className="font-semibold"
              >
                {stats.total} reparaciones en sistema
              </Chip>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              color="primary" 
              startContent={<Plus className="w-4 h-4" />}
              onPress={onCreateOpen}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 font-semibold shadow-lg"
            >
              Nueva Reparación
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-l-blue-500">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className={`text-sm font-semibold ${textColors.tertiary} uppercase tracking-wide`}>Total</p>
                  <p className={`text-3xl font-bold ${textColors.primary}`}>{stats.total}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                  <Wrench className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-l-orange-500">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className={`text-sm font-semibold ${textColors.tertiary} uppercase tracking-wide`}>Pendientes</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.received + stats.diagnosed}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: stats.total > 0 ? `${((stats.received + stats.diagnosed) / stats.total) * 100}%` : '0%' }}
                    ></div>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-l-blue-500">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className={`text-sm font-semibold ${textColors.tertiary} uppercase tracking-wide`}>En Proceso</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: stats.total > 0 ? `${(stats.inProgress / stats.total) * 100}%` : '0%' }}
                    ></div>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                  <ClipboardList className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-l-green-500">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className={`text-sm font-semibold ${textColors.tertiary} uppercase tracking-wide`}>Completadas</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completed + stats.delivered}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: stats.total > 0 ? `${((stats.completed + stats.delivered) / stats.total) * 100}%` : '0%' }}
                    ></div>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="shadow-lg border-0">
          <CardBody className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Input
                placeholder="Buscar reparaciones, clientes, dispositivos..."
                value={busqueda}
                onValueChange={setBusqueda}
                startContent={<Search className="w-5 h-5 text-gray-400" />}
                className="flex-1 min-w-[300px]"
                variant="bordered"
                radius="lg"
                classNames={{
                  input: "text-gray-900 placeholder:text-gray-500 font-medium",
                  inputWrapper: "border-gray-300 hover:border-blue-400 focus-within:border-blue-500 shadow-sm",
                }}
              />
              <Select
                placeholder="Filtrar por estado"
                selectedKeys={new Set([filtroEstado])}
                onSelectionChange={(keys) => setFiltroEstado(Array.from(keys)[0] as string)}
                className="w-full sm:w-auto min-w-[200px]"
                variant="bordered"
                radius="lg"
                startContent={<ClipboardList className="w-4 h-4 text-gray-500" />}
                classNames={{
                  trigger: "text-gray-900 hover:border-blue-400 shadow-sm",
                  value: "text-gray-900 font-medium",
                  popoverContent: "bg-white shadow-2xl",
                }}
              >
                <SelectItem key="todos" className="text-gray-900">Todos los estados</SelectItem>
                <SelectItem key="received" className="text-gray-900">Recibido</SelectItem>
                <SelectItem key="diagnosed" className="text-gray-900">Diagnosticado</SelectItem>
                <SelectItem key="in_progress" className="text-gray-900">En Proceso</SelectItem>
                <SelectItem key="waiting_parts" className="text-gray-900">Esperando Repuestos</SelectItem>
                <SelectItem key="completed" className="text-gray-900">Completado</SelectItem>
                <SelectItem key="delivered" className="text-gray-900">Entregado</SelectItem>
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* Tabla de reparaciones */}
        <Card className="shadow-lg border-0">
          <CardBody className="p-0">
            <Table 
              aria-label="Tabla de reparaciones"
              classNames={{
                wrapper: "shadow-none",
                th: "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-semibold border-b border-gray-200",
                td: "border-b border-gray-100 py-4",
                tr: "hover:bg-gray-50 transition-colors",
              }}
            >
              <TableHeader columns={columns}>
                {(column) => (
                  <TableColumn key={column.uid} align={column.uid === "acciones" ? "center" : "start"}>
                    {column.name}
                  </TableColumn>
                )}
              </TableHeader>
              <TableBody items={repairs}>
                {(item) => (
                  <TableRow key={item.id}>
                    {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {repairs.length === 0 && (
              <div className="text-center py-16">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-full">
                    <Wrench className="w-12 h-12 text-orange-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">No hay reparaciones</h3>
                    <p className="text-gray-600 max-w-md">
                      {busqueda || filtroEstado !== 'todos'
                        ? 'No se encontraron reparaciones con los filtros aplicados. Prueba ajustando los criterios de búsqueda.'
                        : 'Aún no tienes reparaciones asignadas. Las nuevas reparaciones aparecerán aquí.'}
                    </p>
                  </div>
                  {!busqueda && filtroEstado === 'todos' && (
                    <Button 
                      color="primary" 
                      startContent={<Plus className="w-4 h-4" />}
                      onPress={onCreateOpen}
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 font-semibold shadow-lg mt-4"
                    >
                      Crear Primera Reparación
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Modal para crear nueva reparación */}
        <Modal 
          isOpen={isCreateOpen} 
          onClose={onCreateClose}
          size="3xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            <form onSubmit={handleCreateRepair}>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-gray-900">Nueva Reparación</h2>
                <p className="text-sm text-gray-600">Crea una nueva reparación para un cliente</p>
              </ModalHeader>
              <ModalBody className="gap-4">
                <div className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Error</h3>
                          <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setError(null)}
                        className="absolute top-4 right-4 text-red-400 hover:text-red-600"
                        aria-label="Cerrar error"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Switch para Cliente No Registrado */}
                  <div className="flex items-center gap-4">
                    <label className="text-gray-700 font-medium">
                      Cliente no registrado
                    </label>
                    <Switch
                      isSelected={isUnregistered}
                      onChange={() => setIsUnregistered(!isUnregistered)}
                    />
                  </div>

                  {/* Campos dinámicos según el tipo de cliente */}
                  {isUnregistered ? (
                    // Campos para clientes no registrados
                    <>
                      <Input
                        label="Nombre del Cliente"
                        placeholder="Ej: Juan Pérez"
                        value={newRepair.unregistered_customer_name}
                        onValueChange={(value) => setNewRepair(prev => ({ ...prev, unregistered_customer_name: value }))}
                        variant="bordered"
                        isRequired
                        classNames={{
                          label: "text-gray-700",
                          input: "text-gray-900 placeholder:text-gray-500",
                          inputWrapper: "border-gray-300",
                        }}
                      />
                      
                      <Input
                        label="Teléfono del Cliente (Opcional)"
                        placeholder="Ej: +51 999 999 999"
                        value={newRepair.unregistered_customer_phone}
                        onValueChange={(value) => setNewRepair(prev => ({ ...prev, unregistered_customer_phone: value }))}
                        variant="bordered"
                        classNames={{
                          label: "text-gray-700",
                          input: "text-gray-900 placeholder:text-gray-500",
                          inputWrapper: "border-gray-300",
                        }}
                      />
                      
                      <Textarea
                        label="Información del Dispositivo"
                        placeholder="Ej: iPhone 13 Pro, color azul, con la pantalla rota"
                        value={newRepair.device_description}
                        onValueChange={(value) => setNewRepair(prev => ({ ...prev, device_description: value }))}
                        variant="bordered"
                        isRequired
                        rows={3}
                        classNames={{
                          label: "text-gray-700",
                          input: "text-gray-900 placeholder:text-gray-500",
                          inputWrapper: "border-gray-300",
                        }}
                      />
                    </>
                  ) : (
                    // Campos para clientes registrados
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="Cliente"
                        placeholder="Selecciona un cliente"
                        selectedKeys={newRepair.customer_id ? new Set([newRepair.customer_id]) : new Set()}
                        onSelectionChange={(keys) => handleCustomerChange(Array.from(keys)[0] as string)}
                        variant="bordered"
                        isRequired
                        classNames={{
                          label: "text-gray-700",
                          trigger: "text-gray-900",
                          value: "text-gray-900",
                          popoverContent: "bg-white",
                        }}
                      >
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} className="text-gray-900">
                            {getCustomerDisplay(customer)}
                          </SelectItem>
                        ))}
                      </Select>

                      <Input
                        label="Descripción del Dispositivo"
                        placeholder="Ej: iPhone 13 Pro Max 256GB Azul"
                        value={newRepair.device_description}
                        onValueChange={(value) => setNewRepair(prev => ({ ...prev, device_description: value }))}
                        variant="bordered"
                        isRequired
                        classNames={{
                          label: "text-gray-700",
                          input: "text-gray-900",
                          inputWrapper: "text-gray-900",
                        }}
                      />
                    </div>
                  )}

                  <Input
                    label="Título"
                    placeholder="Ej: Pantalla rota, No enciende, etc."
                    value={newRepair.title}
                    onValueChange={(value) => setNewRepair(prev => ({ ...prev, title: value }))}
                    variant="bordered"
                    isRequired
                    classNames={{
                      label: "text-gray-700",
                      input: "text-gray-900 placeholder:text-gray-500",
                      inputWrapper: "border-gray-300",
                    }}
                  />

                  <Textarea
                    label="Descripción del Problema"
                    placeholder="Describe detalladamente el problema del dispositivo..."
                    value={newRepair.problem_description}
                    onValueChange={(value) => setNewRepair(prev => ({ ...prev, problem_description: value }))}
                    variant="bordered"
                    isRequired
                    rows={3}
                    classNames={{
                      label: "text-gray-700",
                      input: "text-gray-900 placeholder:text-gray-500",
                      inputWrapper: "border-gray-300",
                    }}
                  />

                  <Textarea
                    label="Descripción General (Opcional)"
                    placeholder="Información adicional sobre la reparación..."
                    value={newRepair.description}
                    onValueChange={(value) => setNewRepair(prev => ({ ...prev, description: value }))}
                    variant="bordered"
                    rows={2}
                    classNames={{
                      label: "text-gray-700",
                      input: "text-gray-900 placeholder:text-gray-500",
                      inputWrapper: "border-gray-300",
                    }}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Prioridad"
                      selectedKeys={new Set([newRepair.priority])}
                      onSelectionChange={(keys) => setNewRepair(prev => ({ ...prev, priority: Array.from(keys)[0] as string }))}
                      variant="bordered"
                      classNames={{
                        label: "text-gray-700",
                        trigger: "text-gray-900",
                        value: "text-gray-900",
                        popoverContent: "bg-white",
                      }}
                    >
                      <SelectItem key="low" className="text-gray-900">Baja</SelectItem>
                      <SelectItem key="medium" className="text-gray-900">Media</SelectItem>
                      <SelectItem key="high" className="text-gray-900">Alta</SelectItem>
                      <SelectItem key="urgent" className="text-gray-900">Urgente</SelectItem>
                    </Select>

                    <Input
                      label="Costo (S/)"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newRepair.cost.toString()}
                      onValueChange={(value) => setNewRepair(prev => ({ ...prev, cost: parseFloat(value) || 0 }))}
                      variant="bordered"
                      classNames={{
                        label: "text-gray-700",
                        input: "text-gray-900 placeholder:text-gray-500",
                        inputWrapper: "border-gray-300",
                      }}
                    />
                  </div>

                  <Textarea
                    label="Notas Internas (Opcional)"
                    placeholder="Notas para el técnico, observaciones especiales..."
                    value={newRepair.internal_notes}
                    onValueChange={(value) => setNewRepair(prev => ({ ...prev, internal_notes: value }))}
                    variant="bordered"
                    rows={2}
                    classNames={{
                      label: "text-gray-700",
                      input: "text-gray-900 placeholder:text-gray-500",
                      inputWrapper: "border-gray-300",
                    }}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="danger" 
                  variant="flat" 
                  onPress={onCreateClose}
                  className="text-gray-900"
                >
                  Cancelar
                </Button>
                <Button 
                  color="primary" 
                  type="submit"
                  isLoading={createLoading}
                >
                  {createLoading ? 'Creando...' : 'Crear Reparación'}
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>

        {/* Modal para ver detalles */}
        <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="3xl">
          <ModalContent>
            <ModalHeader className={`flex flex-col gap-1 ${textColors.primary}`}>
              Detalles de la Reparación: {selectedRepair?.title}
            </ModalHeader>
            <ModalBody>
              {selectedRepair && (
               <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <p className="text-sm font-medium text-gray-500">Título</p>
                     <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedRepair.title}</p>
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-500">Estado</p>
                     <Chip color={getStatusColor(selectedRepair.status)} variant="flat">
                       {getStatusLabel(selectedRepair.status)}
                     </Chip>
                   </div>
                 </div>

                 {/* Información del creador */}
                 {selectedRepair.users && (
                   <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-blue-100 rounded-full">
                         <User className="w-4 h-4 text-blue-600" />
                       </div>
                       <div className="flex-1">
                         <p className="text-sm font-medium text-blue-800">Creado por</p>
                         <p className="text-base font-semibold text-blue-900">
                           {selectedRepair.users.name}
                         </p>
                         <p className="text-xs text-blue-600">
                           {selectedRepair.users.email}
                         </p>
                         <p className="text-xs text-blue-500 mt-1">
                           {new Date(selectedRepair.created_at).toLocaleString('es-ES', {
                             day: '2-digit',
                             month: 'short',
                             year: 'numeric',
                             hour: '2-digit',
                             minute: '2-digit'
                           })}
                         </p>
                       </div>
                     </div>
                   </div>
                 )}
                 
                 <div>
                   <p className="text-sm font-medium text-gray-500 mb-2">Cliente</p>
                   <p className="text-base text-gray-900 dark:text-gray-100">{getCustomerName(selectedRepair.customers, selectedRepair.unregistered_customer_name)}</p>
                   {(selectedRepair.customers?.phone || selectedRepair.unregistered_customer_phone) && (
                     <p className="text-sm text-gray-600">{selectedRepair.customers?.phone || selectedRepair.unregistered_customer_phone}</p>
                   )}
                 </div>

                 <div>
                   <p className="text-sm font-medium text-gray-500 mb-2">Dispositivo</p>
                   <p className="text-base text-gray-900 dark:text-gray-100">{getDeviceName(selectedRepair.devices, selectedRepair.unregistered_device_info)}</p>
                   {selectedRepair.devices && (
                     <p className="text-sm text-gray-600">{selectedRepair.devices.device_type}</p>
                   )}
                 </div>

                 <div>
                   <p className="text-sm font-medium text-gray-500 mb-2">Problema Reportado</p>
                   <p className="text-base text-gray-900 dark:text-gray-100">{selectedRepair.problem_description}</p>
                 </div>

                 {selectedRepair.description && (
                   <div>
                     <p className="text-sm font-medium text-gray-500 mb-2">Descripción General</p>
                     <p className="text-base text-gray-900 dark:text-gray-100">{selectedRepair.description}</p>
                   </div>
                 )}

                 {selectedRepair.solution_description && (
                   <div>
                     <p className="text-sm font-medium text-gray-500 mb-2">Solución</p>
                     <p className="text-base text-gray-900 dark:text-gray-100">{selectedRepair.solution_description}</p>
                   </div>
                 )}

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <p className="text-sm font-medium text-gray-500">Costo</p>
                     <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(selectedRepair.cost)}</p>
                   </div>
                   <div>
                     <p className="text-sm font-medium text-gray-500">Prioridad</p>
                     <Chip color={getPriorityColor(selectedRepair.priority)} variant="flat">
                       {getPriorityLabel(selectedRepair.priority)}
                     </Chip>
                   </div>
                 </div>
               </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onDetailClose}>
                Cerrar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal para cambiar estado */}
        <Modal isOpen={isStatusOpen} onClose={onStatusClose}>
          <ModalContent>
            <ModalHeader className="text-gray-900 dark:text-white">Actualizar Estado de la Reparación</ModalHeader>
            <ModalBody>
              {selectedRepair && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">Estado actual:</p>
                    <Chip color={getStatusColor(selectedRepair.status)} size="sm">
                      {getStatusLabel(selectedRepair.status)}
                    </Chip>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Seleccionar nuevo estado:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['received', 'diagnosed', 'in_progress', 'completed', 'delivered', 'cancelled'].map(status => (
                        <Button
                          key={status}
                          variant={selectedRepair.status === status ? "solid" : "bordered"}
                          color={getStatusColor(status)}
                          onPress={() => confirmUpdateStatus(status)}
                          className="w-full"
                          size="sm"
                          isLoading={updateLoading && selectedRepair.status !== status}
                        >
                          {getStatusLabel(status)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onStatusClose}>
                Cancelar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

      </div>
    </TechnicianDashboardLayout>
  )
}