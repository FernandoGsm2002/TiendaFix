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
import { useCurrency, useTranslations } from '@/lib/contexts/TranslationContext'
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
  AlertTriangle,
  Filter,
  Printer
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
  technician: {
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
  const { formatCurrency } = useCurrency()
  const { t } = useTranslations()
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
          title: newRepair.title,
          description: newRepair.description,
          problem_description: newRepair.problem_description,
          priority: newRepair.priority,
          cost: newRepair.cost,
          internal_notes: newRepair.internal_notes,
          // Para clientes registrados, guardamos la info del dispositivo en unregistered_device_info
          // pero mantenemos customer_id para que se identifique como registrado
          unregistered_device_info: newRepair.device_description,
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
    return t(`repairs.status.${status}`) || status
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
    return t(`repairs.priority.${priority}`) || priority
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getCustomerName = (customer: Repair['customers'], unregisteredName?: string | null) => {
    if (!customer && unregisteredName) return unregisteredName
    if (!customer) return 'Cliente no registrado'
    return customer.name || customer.anonymous_identifier || 'Cliente Anónimo'
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

  // Estado para loading de impresión
  const [printLoading, setPrintLoading] = useState(false)

  // Obtener información de la organización
  const fetchOrganizationInfo = async () => {
    try {
      // Primero obtenemos el organization_id del usuario actual
      const userResponse = await fetch('/api/user/profile')
      const userData = await userResponse.json()
      
      if (!userData.success) {
        throw new Error('No se pudo obtener el perfil del usuario')
      }

      const organizationId = userData.data.organization_id
      
      // Luego obtenemos la información de la organización
      const orgResponse = await fetch(`/api/organizations/${organizationId}`)
      const orgData = await orgResponse.json()
      
      if (!orgData.success) {
        throw new Error('No se pudo obtener la información de la organización')
      }

      return orgData.data
    } catch (error) {
      console.error('Error fetching organization info:', error)
      throw error
    }
  }

  // Generar el ticket de impresión en formato térmico
  const generateThermalTicket = (repair: Repair, organizationInfo: any) => {
    const currentDate = new Date().toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const customerName = getCustomerName(repair.customers, repair.unregistered_customer_name)
    const deviceName = getDeviceName(repair.devices, repair.unregistered_device_info)
    const customerPhone = repair.customers?.phone || repair.unregistered_customer_phone || 'No disponible'

    // HTML para ticket térmico (ancho 80mm)
    const ticketHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.2;
            margin: 0;
            padding: 5mm;
            width: 70mm;
            color: black;
          }
          .center { text-align: center; }
          .left { text-align: left; }
          .right { text-align: right; }
          .bold { font-weight: bold; }
          .large { font-size: 14px; }
          .border-top { border-top: 1px dashed black; margin: 8px 0; padding-top: 8px; }
          .border-bottom { border-bottom: 1px dashed black; margin: 8px 0; padding-bottom: 8px; }
          .space { margin: 8px 0; }
          .flex-row { display: flex; justify-content: space-between; }
          .break { page-break-inside: avoid; }
        </style>
      </head>
      <body>
        <div class="center bold large">
          ${organizationInfo.name || 'TIENDA DE REPARACIONES'}
        </div>
        
        ${organizationInfo.address ? `<div class="center">${organizationInfo.address}</div>` : ''}
        ${organizationInfo.phone ? `<div class="center">Tel: ${organizationInfo.phone}</div>` : ''}
        ${organizationInfo.email ? `<div class="center">${organizationInfo.email}</div>` : ''}
        
        <div class="border-top"></div>
        
        <div class="center bold large">TICKET DE REPARACIÓN</div>
        <div class="center">No. ${repair.id.slice(0, 8).toUpperCase()}</div>
        
        <div class="border-top"></div>
        
        <div class="space">
          <div class="bold">FECHA DE RECEPCIÓN:</div>
          <div>${formatDate(repair.created_at)}</div>
        </div>
        
        <div class="space">
          <div class="bold">CLIENTE:</div>
          <div>${customerName}</div>
          <div>Tel: ${customerPhone}</div>
        </div>
        
        <div class="space">
          <div class="bold">DISPOSITIVO:</div>
          <div>${deviceName}</div>
          ${repair.devices?.serial_number ? `<div>S/N: ${repair.devices.serial_number}</div>` : ''}
          ${repair.devices?.imei ? `<div>IMEI: ${repair.devices.imei}</div>` : ''}
        </div>
        
        <div class="space">
          <div class="bold">PROBLEMA REPORTADO:</div>
          <div>${repair.problem_description}</div>
        </div>
        
        ${repair.solution_description ? `
        <div class="space">
          <div class="bold">SOLUCIÓN APLICADA:</div>
          <div>${repair.solution_description}</div>
        </div>
        ` : ''}
        
        <div class="space">
          <div class="bold">ESTADO:</div>
          <div>${getStatusLabel(repair.status)}</div>
        </div>
        
        <div class="space">
          <div class="bold">PRIORIDAD:</div>
          <div>${getPriorityLabel(repair.priority)}</div>
        </div>
        
        <div class="border-top"></div>
        
        <div class="flex-row space">
          <div class="bold">COSTO:</div>
          <div class="bold">${formatCurrency(repair.cost)}</div>
        </div>
        
        <div class="border-top"></div>
        
        <div class="center">
          <div>Fecha de impresión: ${currentDate}</div>
          <div class="space">¡Gracias por confiar en nosotros!</div>
        </div>
        
        <div class="border-bottom"></div>
        
        <div class="center small">
          <div>Conserve este ticket como comprobante</div>
          <div>de su reparación</div>
        </div>
      </body>
      </html>
    `

    return ticketHTML
  }

  // Función para imprimir el ticket
  const handlePrintTicket = async (repair: Repair) => {
    setPrintLoading(true)
    try {
      // Obtener información de la organización
      const organizationInfo = await fetchOrganizationInfo()
      
      // Generar el HTML del ticket
      const ticketHTML = generateThermalTicket(repair, organizationInfo)
      
      // Crear un iframe oculto para la impresión (mejor compatibilidad)
      const iframe = document.createElement('iframe')
      iframe.style.position = 'absolute'
      iframe.style.top = '-1000px'
      iframe.style.left = '-1000px'
      iframe.style.width = '300px'
      iframe.style.height = '600px'
      
      document.body.appendChild(iframe)
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      if (iframeDoc) {
        iframeDoc.write(ticketHTML)
        iframeDoc.close()
        
        // Esperar que el contenido se cargue y luego imprimir
        setTimeout(() => {
          try {
            iframe.contentWindow?.print()
            setTimeout(() => {
              document.body.removeChild(iframe)
            }, 1000)
          } catch (printError) {
            console.error('Error al imprimir:', printError)
            // Fallback: descargar como archivo
            downloadTicketAsFile(ticketHTML, repair.id)
            document.body.removeChild(iframe)
          }
        }, 500)
      } else {
        // Fallback si no se puede crear el iframe
        downloadTicketAsFile(ticketHTML, repair.id)
        document.body.removeChild(iframe)
      }
      
    } catch (error) {
      console.error('Error printing ticket:', error)
      setError('Error al generar el ticket de impresión')
    } finally {
      setPrintLoading(false)
    }
  }

  // Función auxiliar para descargar el ticket como archivo
  const downloadTicketAsFile = (ticketHTML: string, repairId: string) => {
    const blob = new Blob([ticketHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ticket-reparacion-${repairId.slice(0, 8)}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
            <Tooltip content="Imprimir ticket" classNames={{ content: "bg-gray-900 text-white" }}>
              <Button 
                isIconOnly 
                variant="flat" 
                color="secondary" 
                size="sm" 
                aria-label="Imprimir ticket de reparación"
                onPress={() => handlePrintTicket(repair)}
                isLoading={printLoading}
              >
                <Printer className="w-4 h-4" />
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
        <div className="space-y-4 md:space-y-6">
          <Skeleton className="h-6 md:h-8 w-48 rounded-lg" />
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 w-full sm:w-64 rounded-lg" />
            <Skeleton className="h-10 w-full sm:w-32 rounded-lg" />
            <Skeleton className="h-10 w-full sm:w-24 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardBody className="p-4">
                  <Skeleton className="h-16 w-full rounded" />
                </CardBody>
              </Card>
            ))}
          </div>
          <Card>
            <CardBody className="p-4">
              <Skeleton className="h-64 w-full rounded" />
            </CardBody>
          </Card>
        </div>
      </TechnicianDashboardLayout>
    )
  }

  if (error) {
    return (
      <TechnicianDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Error al cargar reparaciones: {error}</p>
          </div>
        </div>
      </TechnicianDashboardLayout>
    )
  }

  return (
    <TechnicianDashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mis Reparaciones
            </h1>
            <p className={`text-sm md:text-base ${textColors.secondary} mt-1`}>Gestiona y actualiza tus trabajos asignados</p>
          </div>
          <Button 
            color="primary" 
            startContent={<Plus className="h-4 w-4" />}
            onPress={onCreateOpen}
            className="w-full sm:w-auto font-semibold"
            size="lg"
          >
            Nueva Reparación
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all">
            <CardBody className="p-3 md:p-4 text-center">
              <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className={`text-xs md:text-sm ${textColors.secondary} font-medium`}>Total</p>
            </CardBody>
          </Card>
          <Card className="shadow-lg border-0 bg-orange-50 hover:shadow-xl transition-all">
            <CardBody className="p-3 md:p-4 text-center">
              <p className="text-lg md:text-2xl font-bold text-orange-900">{stats.received + stats.diagnosed}</p>
              <p className="text-xs md:text-sm text-orange-700 font-medium">Pendientes</p>
            </CardBody>
          </Card>
          <Card className="shadow-lg border-0 bg-blue-50 hover:shadow-xl transition-all">
            <CardBody className="p-3 md:p-4 text-center">
              <p className="text-lg md:text-2xl font-bold text-blue-900">{stats.inProgress}</p>
              <p className="text-xs md:text-sm text-blue-700 font-medium">En Proceso</p>
            </CardBody>
          </Card>
          <Card className="shadow-lg border-0 bg-green-50 hover:shadow-xl transition-all">
            <CardBody className="p-3 md:p-4 text-center">
              <p className="text-lg md:text-2xl font-bold text-green-900">{stats.completed + stats.delivered}</p>
              <p className="text-xs md:text-sm text-green-700 font-medium">Completadas</p>
            </CardBody>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardBody className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por cliente, dispositivo o número de serie..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  startContent={<Search className="h-4 w-4 text-gray-400" />}
                  variant="bordered"
                  size="lg"
                  className="w-full"
                  classNames={{
                    input: "text-sm",
                    inputWrapper: "border-gray-200 hover:border-gray-300"
                  }}
                />
              </div>
              <Select
                placeholder="Filtrar por estado"
                selectedKeys={[filtroEstado]}
                onSelectionChange={(keys) => setFiltroEstado(Array.from(keys)[0] as string)}
                startContent={<Filter className="h-4 w-4 text-gray-400" />}
                variant="bordered"
                size="lg"
                className="w-full lg:w-48"
                classNames={{
                  trigger: "border-gray-200 hover:border-gray-300"
                }}
              >
                <SelectItem key="todos">{t('filters.allStates')}</SelectItem>
                <SelectItem key="received">{t('repairs.status.received')}</SelectItem>
                <SelectItem key="diagnosed">{t('repairs.status.diagnosed')}</SelectItem>
                <SelectItem key="in_progress">{t('repairs.status.in_progress')}</SelectItem>
                <SelectItem key="waiting_parts">{t('repairs.status.waiting_parts')}</SelectItem>
                <SelectItem key="completed">{t('repairs.status.completed')}</SelectItem>
                <SelectItem key="delivered">{t('repairs.status.delivered')}</SelectItem>
                <SelectItem key="cancelled">{t('repairs.status.cancelled')}</SelectItem>
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* Vista Desktop - Tabla */}
        <div className="hidden lg:block">
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
            </CardBody>
          </Card>
        </div>

        {/* Vista Móvil - Cards */}
        <div className="lg:hidden">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="h-48">
                  <CardBody className="p-4">
                    <Skeleton className="h-full w-full rounded" />
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : repairs.length === 0 ? (
            <Card className="shadow-lg border-0">
              <CardBody className="p-8">
                <div className="text-center">
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
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {repairs.map((repair) => (
                <Card key={repair.id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardBody className="p-0">
                    {/* Header del Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar
                          icon={<Wrench className="w-4 h-4" />}
                          classNames={{
                            base: "bg-gradient-to-br from-blue-400 to-purple-600",
                            icon: "text-white"
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 truncate text-sm md:text-base">
                            {repair.title}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {formatDate(repair.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
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
                    </div>

                    {/* Cliente */}
                    <div className="bg-green-50 p-3 border-b">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-green-800">CLIENTE</span>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {getCustomerName(repair.customers, repair.unregistered_customer_name)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {repair.customers?.phone || repair.unregistered_customer_phone || 'Sin contacto'}
                      </p>
                    </div>

                    {/* Dispositivo */}
                    <div className="bg-blue-50 p-3 border-b">
                      <div className="flex items-center gap-2 mb-1">
                        <Smartphone className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-800">DISPOSITIVO</span>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {repair.devices ? 
                          `${repair.devices.brand} ${repair.devices.model}` : 
                          'Dispositivo no registrado'
                        }
                      </p>
                      <p className="text-xs text-gray-600">
                        {repair.devices ? 
                          repair.devices.device_type : 
                          'Ver detalles para más información'
                        }
                      </p>
                    </div>

                    {/* Problema */}
                    <div className="p-3 border-b">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <span className="text-xs font-medium text-orange-800">PROBLEMA</span>
                      </div>
                      <p className="text-sm text-gray-900 line-clamp-2">
                        {repair.problem_description}
                      </p>
                    </div>

                    {/* Costo y Creador */}
                    <div className="bg-gray-50 p-3 border-b">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium text-gray-500">COSTO</p>
                          <p className="font-bold text-lg text-green-600">
                            {formatCurrency(repair.cost)}
                          </p>
                        </div>
                        {repair.technician && (
                          <div>
                            <p className="text-xs font-medium text-gray-500">CREADO POR</p>
                            <p className="font-semibold text-sm text-gray-900 truncate">
                              {repair.technician.name}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="p-3">
                      <div className="flex gap-2 flex-wrap">
                        <Button 
                          size="sm" 
                          variant="flat" 
                          color="primary"
                          className="flex-1 min-w-0"
                          startContent={<Eye className="w-4 h-4" />}
                          onPress={() => handleViewDetails(repair)}
                        >
                          Ver
                        </Button>
                        <Button 
                          size="sm" 
                          variant="flat" 
                          color="secondary"
                          className="flex-1 min-w-0"
                          startContent={<Printer className="w-4 h-4" />}
                          onPress={() => handlePrintTicket(repair)}
                          isLoading={printLoading}
                        >
                          Ticket
                        </Button>
                        <Button 
                          size="sm" 
                          variant="flat" 
                          color="warning"
                          className="flex-1 min-w-0"
                          startContent={<ClipboardList className="w-4 h-4" />}
                          onPress={() => handleStatusChange(repair)}
                        >
                          Estado
                        </Button>
                        {repair.status === 'in_progress' && (
                          <Button 
                            size="sm" 
                            variant="flat" 
                            color="success"
                            className="flex-1 min-w-0"
                            startContent={<Check className="w-4 h-4" />}
                            onPress={() => confirmUpdateStatus('completed')}
                          >
                            Completar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Empty state para ambas vistas */}
        {!loading && repairs.length === 0 && (
          <div className="hidden lg:block">
            <Card className="shadow-lg border-0">
              <CardBody className="p-0">
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
              </CardBody>
            </Card>
          </div>
        )}

        {/* Modal para crear nueva reparación */}
        <Modal 
          isOpen={isCreateOpen} 
          onClose={onCreateClose}
          size="2xl"
          scrollBehavior="inside"
          classNames={{
            wrapper: "z-[1000]",
            backdrop: "z-[999]",
            base: "max-h-[95vh] my-2 mx-2 sm:mx-6 w-full max-w-4xl",
            body: "max-h-[75vh] overflow-y-auto py-4 px-6",
            header: "border-b border-gray-200 pb-4 px-6",
            footer: "border-t border-gray-200 pt-4 px-6"
          }}
        >
          <ModalContent>
            <form onSubmit={handleCreateRepair}>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Nueva Reparación</h2>
                <p className="text-sm md:text-base text-gray-600">Crea una nueva reparación para un cliente</p>
              </ModalHeader>
              <ModalBody className="gap-3 md:gap-4">
                <div className="space-y-3 md:space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4">
                      <div className="flex">
                        <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
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
                  <div className="flex items-center gap-4 py-2">
                    <label className="text-base font-medium text-gray-700">
                      Cliente no registrado
                    </label>
                    <Switch
                      isSelected={isUnregistered}
                      onChange={() => setIsUnregistered(!isUnregistered)}
                      size="md"
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
                        size="md"
                        classNames={{
                          label: "text-gray-700 text-base",
                          input: "text-gray-900 placeholder:text-gray-500 text-base",
                          inputWrapper: "border-gray-300 min-h-12",
                        }}
                      />
                      
                      <Input
                        label="Teléfono del Cliente (Opcional)"
                        placeholder="Ej: +51 999 999 999"
                        value={newRepair.unregistered_customer_phone}
                        onValueChange={(value) => setNewRepair(prev => ({ ...prev, unregistered_customer_phone: value }))}
                        variant="bordered"
                        size="md"
                        classNames={{
                          label: "text-gray-700 text-base",
                          input: "text-gray-900 placeholder:text-gray-500 text-base",
                          inputWrapper: "border-gray-300 min-h-12",
                        }}
                      />
                      
                      <Textarea
                        label="Información del Dispositivo"
                        placeholder="Ej: iPhone 13 Pro, color azul, con la pantalla rota"
                        value={newRepair.device_description}
                        onValueChange={(value) => setNewRepair(prev => ({ ...prev, device_description: value }))}
                        variant="bordered"
                        isRequired
                        size="md"
                        minRows={3}
                        maxRows={5}
                        classNames={{
                          label: "text-gray-700 text-base",
                          input: "text-gray-900 placeholder:text-gray-500 text-base",
                          inputWrapper: "border-gray-300",
                        }}
                      />
                    </>
                  ) : (
                    // Campos para clientes registrados
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <Select
                        label="Cliente"
                        placeholder="Selecciona un cliente"
                        selectedKeys={newRepair.customer_id ? new Set([newRepair.customer_id]) : new Set()}
                        onSelectionChange={(keys) => handleCustomerChange(Array.from(keys)[0] as string)}
                        variant="bordered"
                        isRequired
                        size="md"
                        classNames={{
                          label: "text-gray-700 text-base",
                          trigger: "text-gray-900 text-base min-h-12",
                          value: "text-gray-900 text-base",
                          popoverContent: "bg-white",
                        }}
                      >
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} className="text-gray-900 text-base">
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
                        size="md"
                        classNames={{
                          label: "text-gray-700 text-base",
                          input: "text-gray-900 text-base",
                          inputWrapper: "text-gray-900 min-h-12",
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
                    size="md"
                    classNames={{
                      label: "text-gray-700 text-base",
                      input: "text-gray-900 placeholder:text-gray-500 text-base",
                      inputWrapper: "border-gray-300 min-h-12",
                    }}
                  />

                  <Textarea
                    label="Descripción del Problema"
                    placeholder="Describe detalladamente el problema del dispositivo..."
                    value={newRepair.problem_description}
                    onValueChange={(value) => setNewRepair(prev => ({ ...prev, problem_description: value }))}
                    variant="bordered"
                    isRequired
                    size="md"
                    minRows={3}
                    maxRows={5}
                    classNames={{
                      label: "text-gray-700 text-base",
                      input: "text-gray-900 placeholder:text-gray-500 text-base",
                      inputWrapper: "border-gray-300",
                    }}
                  />

                  <Textarea
                    label="Descripción General (Opcional)"
                    placeholder="Información adicional sobre la reparación..."
                    value={newRepair.description}
                    onValueChange={(value) => setNewRepair(prev => ({ ...prev, description: value }))}
                    variant="bordered"
                    size="md"
                    minRows={3}
                    maxRows={4}
                    classNames={{
                      label: "text-gray-700 text-base",
                      input: "text-gray-900 placeholder:text-gray-500 text-base",
                      inputWrapper: "border-gray-300",
                    }}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <Select
                      label="Prioridad"
                      selectedKeys={new Set([newRepair.priority])}
                      onSelectionChange={(keys) => setNewRepair(prev => ({ ...prev, priority: Array.from(keys)[0] as string }))}
                      variant="bordered"
                      size="md"
                      classNames={{
                        label: "text-gray-700 text-base",
                        trigger: "text-gray-900 text-base min-h-12",
                        value: "text-gray-900 text-base",
                        popoverContent: "bg-white",
                      }}
                    >
                      <SelectItem key="low" className="text-gray-900 text-base">Baja</SelectItem>
                      <SelectItem key="medium" className="text-gray-900 text-base">Media</SelectItem>
                      <SelectItem key="high" className="text-gray-900 text-base">Alta</SelectItem>
                      <SelectItem key="urgent" className="text-gray-900 text-base">Urgente</SelectItem>
                    </Select>

                    <Input
                      label="Costo (S/)"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newRepair.cost.toString()}
                      onValueChange={(value) => setNewRepair(prev => ({ ...prev, cost: parseFloat(value) || 0 }))}
                      variant="bordered"
                      size="md"
                      classNames={{
                        label: "text-gray-700 text-base",
                        input: "text-gray-900 placeholder:text-gray-500 text-base",
                        inputWrapper: "border-gray-300 min-h-12",
                      }}
                    />
                  </div>

                  <Textarea
                    label="Notas Internas (Opcional)"
                    placeholder="Notas para el técnico, observaciones especiales..."
                    value={newRepair.internal_notes}
                    onValueChange={(value) => setNewRepair(prev => ({ ...prev, internal_notes: value }))}
                    variant="bordered"
                    size="md"
                    minRows={3}
                    maxRows={4}
                    classNames={{
                      label: "text-gray-700 text-base",
                      input: "text-gray-900 placeholder:text-gray-500 text-base",
                      inputWrapper: "border-gray-300",
                    }}
                  />
                </div>
              </ModalBody>
              <ModalFooter className="gap-3 py-4">
                <Button 
                  color="danger" 
                  variant="flat" 
                  onPress={onCreateClose}
                  className="text-gray-900 text-base font-medium"
                  size="md"
                >
                  Cancelar
                </Button>
                <Button 
                  color="primary" 
                  type="submit"
                  isLoading={createLoading}
                  size="md"
                  className="font-medium text-base px-6"
                >
                  {createLoading ? 'Creando...' : 'Crear Reparación'}
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>

        {/* Modal para ver detalles */}
        <Modal 
          isOpen={isDetailOpen} 
          onClose={onDetailClose} 
          size="xl"
          scrollBehavior="inside"
          classNames={{
            wrapper: "z-[1000]",
            backdrop: "z-[999]",
            base: "max-h-[95vh] my-1 mx-1 sm:my-2 sm:mx-2 md:mx-6",
            body: "max-h-[75vh] overflow-y-auto py-2 md:py-4",
            header: "border-b border-gray-200 pb-2 md:pb-4",
            footer: "border-t border-gray-200 pt-2 md:pt-4"
          }}
        >
          <ModalContent>
            <ModalHeader className={`flex flex-col gap-1 ${textColors.primary}`}>
              <h2 className="text-lg md:text-xl font-bold">Detalles de la Reparación: {selectedRepair?.title}</h2>
            </ModalHeader>
            <ModalBody>
              {selectedRepair && (
               <div className="space-y-3 md:space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                   <div>
                     <p className="text-xs md:text-sm font-medium text-gray-500">Título</p>
                     <p className="text-sm md:text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedRepair.title}</p>
                   </div>
                   <div>
                     <p className="text-xs md:text-sm font-medium text-gray-500">Estado</p>
                     <Chip color={getStatusColor(selectedRepair.status)} variant="flat" size="sm">
                       {getStatusLabel(selectedRepair.status)}
                     </Chip>
                   </div>
                 </div>

                 {/* Información del creador */}
                 {selectedRepair.technician && (
                   <div className="bg-blue-50 p-3 md:p-4 rounded-lg border border-blue-200">
                     <div className="flex items-center gap-3">
                       <div className="p-2 bg-blue-100 rounded-full">
                         <User className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                       </div>
                       <div className="flex-1">
                         <p className="text-xs md:text-sm font-medium text-blue-800">Creado por</p>
                         <p className="text-sm md:text-base font-semibold text-blue-900">
                           {selectedRepair.technician.name}
                         </p>
                         <p className="text-xs text-blue-600">
                           {selectedRepair.technician.email}
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
                   <p className="text-xs md:text-sm font-medium text-gray-500 mb-2">Cliente</p>
                   <p className="text-sm md:text-base text-gray-900 dark:text-gray-100">{getCustomerName(selectedRepair.customers, selectedRepair.unregistered_customer_name)}</p>
                   {(selectedRepair.customers?.phone || selectedRepair.unregistered_customer_phone) && (
                     <p className="text-xs md:text-sm text-gray-600">{selectedRepair.customers?.phone || selectedRepair.unregistered_customer_phone}</p>
                   )}
                 </div>

                 <div>
                   <p className="text-xs md:text-sm font-medium text-gray-500 mb-2">Dispositivo</p>
                   <p className="text-sm md:text-base text-gray-900 dark:text-gray-100">{getDeviceName(selectedRepair.devices, selectedRepair.unregistered_device_info)}</p>
                   {selectedRepair.devices && (
                     <p className="text-xs md:text-sm text-gray-600">{selectedRepair.devices.device_type}</p>
                   )}
                 </div>

                 <div>
                   <p className="text-xs md:text-sm font-medium text-gray-500 mb-2">Problema Reportado</p>
                   <p className="text-sm md:text-base text-gray-900 dark:text-gray-100">{selectedRepair.problem_description}</p>
                 </div>

                 {selectedRepair.description && (
                   <div>
                     <p className="text-xs md:text-sm font-medium text-gray-500 mb-2">Descripción General</p>
                     <p className="text-sm md:text-base text-gray-900 dark:text-gray-100">{selectedRepair.description}</p>
                   </div>
                 )}

                 {selectedRepair.solution_description && (
                   <div>
                     <p className="text-xs md:text-sm font-medium text-gray-500 mb-2">Solución</p>
                     <p className="text-sm md:text-base text-gray-900 dark:text-gray-100">{selectedRepair.solution_description}</p>
                   </div>
                 )}

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                   <div>
                     <p className="text-xs md:text-sm font-medium text-gray-500">Costo</p>
                     <p className="text-sm md:text-lg font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(selectedRepair.cost)}</p>
                   </div>
                   <div>
                     <p className="text-xs md:text-sm font-medium text-gray-500">Prioridad</p>
                     <Chip color={getPriorityColor(selectedRepair.priority)} variant="flat" size="sm">
                       {getPriorityLabel(selectedRepair.priority)}
                     </Chip>
                   </div>
                 </div>
               </div>
              )}
            </ModalBody>
            <ModalFooter className="gap-2">
              <Button color="default" variant="light" onPress={onDetailClose} size="sm">
                Cerrar
              </Button>
              {selectedRepair && (
                <Button 
                  color="secondary" 
                  variant="flat"
                  startContent={<Printer className="w-3 h-3 md:w-4 md:h-4" />}
                  onPress={() => handlePrintTicket(selectedRepair)}
                  isLoading={printLoading}
                  size="sm"
                >
                  Imprimir Ticket
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal para cambiar estado */}
        <Modal 
          isOpen={isStatusOpen} 
          onClose={onStatusClose}
          size="lg"
          scrollBehavior="inside"
          classNames={{
            wrapper: "z-[1000]",
            backdrop: "z-[999]",
            base: "max-h-[95vh] my-2 mx-2 sm:mx-6",
            body: "max-h-[70vh] overflow-y-auto py-4",
            header: "border-b border-gray-200 pb-4",
            footer: "border-t border-gray-200 pt-4"
          }}
        >
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