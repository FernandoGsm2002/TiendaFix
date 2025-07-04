'use client'

import React, { useState, useEffect, useCallback } from 'react'
import debounce from 'lodash.debounce'
import DashboardLayout from '../components/DashboardLayout'
import { useTranslations, useCurrency } from '@/lib/contexts/TranslationContext'
import { 
  Card, 
  CardBody, 
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  useDisclosure,
  Skeleton,
  Pagination,
  Tooltip,
  Avatar,
  Progress,
  Textarea,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Switch
} from '@heroui/react'
import FormField from '@/app/components/ui/FormField'
import { textColors } from '@/lib/utils/colors'
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Trash2, 
  Calendar, 
  User, 
  Smartphone, 
  AlertTriangle, 
  X,
  Wrench,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  ClipboardList,
  Shield,
  Settings,
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
  estimated_completion_date: string | null
  actual_completion_date: string | null
  received_date: string
  delivered_date: string | null
  warranty_days: number
  internal_notes: string | null
  customer_notes: string | null
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

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface NewRepairForm {
  customer_id: string;
  device_description: string;
  title: string;
  description: string;
  problem_description: string;
  priority: string;
  cost: number;
  internal_notes: string;
  unregistered_customer_name?: string;
  unregistered_customer_phone?: string;
  unregistered_device_info?: string;
}

interface RepairStats {
  total: number;
  received: number;
  diagnosed: number;
  inProgress: number;
  completed: number;
  delivered: number;
  cancelled: number;
}

export default function ReparacionesPage() {
  const { t } = useTranslations()
  const { formatCurrency } = useCurrency()
  const [repairs, setRepairs] = useState<Repair[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [printLoading, setPrintLoading] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [stats, setStats] = useState<RepairStats>({
    total: 0,
    received: 0,
    diagnosed: 0,
    inProgress: 0,
    completed: 0,
    delivered: 0,
    cancelled: 0,
  })
  const [isUnregistered, setIsUnregistered] = useState(false);

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
    unregistered_customer_phone: '',
    unregistered_device_info: '',
  })

  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null)


  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure()
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure()

  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const { isOpen: isStatusOpen, onOpen: onStatusOpen, onClose: onStatusClose } = useDisclosure()

  const fetchRepairs = async (page = 1, estado = filtroEstado, search = busqueda, startDate = fechaInicio, endDate = fechaFin) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })
      
      if (estado !== 'todos') params.append('status', estado)
      if (search.trim()) params.append('search', search.trim())
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)



      const response = await fetch(`/api/repairs?${params}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar reparaciones')
      }
      
      const data = await response.json()
      setRepairs(data.data)
      setPagination(data.pagination)
      if (data.stats) {
        setStats(data.stats)
      }
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const debouncedFetch = useCallback(debounce(() => {
    fetchRepairs(1, filtroEstado, busqueda, fechaInicio, fechaFin);
  }, 300), [filtroEstado, busqueda, fechaInicio, fechaFin]);

  useEffect(() => {
    fetchRepairs(1, filtroEstado, busqueda, fechaInicio, fechaFin);
  }, [filtroEstado, fechaInicio, fechaFin]);

  useEffect(() => {
    if (busqueda.trim() || busqueda === '') {
      debouncedFetch();
    }
  }, [busqueda, debouncedFetch]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers?limit=100')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.data)
      }
    } catch (err) {
      console.error('Error fetching customers:', err)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleFiltroChange = (keys: any) => {
    const newStatus = Array.from(keys)[0] as string || 'todos'
    setFiltroEstado(newStatus)
  }

  const handleBusquedaChange = (search: string) => {
    setBusqueda(search)
  }



  const handleCreateRepair = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    setError(null)
    
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
          unregistered_device_info: newRepair.unregistered_device_info,
          customer_id: null,
          device_id: null,
        }
      : {
          customer_id: newRepair.customer_id,
          unregistered_device_info: newRepair.device_description,
          device_id: null,
          title: newRepair.title,
          description: newRepair.description,
          problem_description: newRepair.problem_description,
          priority: newRepair.priority,
          cost: newRepair.cost,
          internal_notes: newRepair.internal_notes,
        };
    
    if (isUnregistered) {
      if (!payload.unregistered_customer_name || !payload.unregistered_device_info) {
        setError('Para clientes no registrados, el nombre y la información del dispositivo son obligatorios.')
        setCreateLoading(false)
        return
      }
    } else {
      if (!payload.customer_id || !newRepair.device_description) {
        setError('Por favor, seleccione un cliente y describa el dispositivo.')
        setCreateLoading(false)
        return
      }
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

      await fetchRepairs(1, filtroEstado, busqueda, fechaInicio, fechaFin)
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
        unregistered_customer_phone: '',
        unregistered_device_info: '',
      })
      setIsUnregistered(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleCustomerChange = (customerId: string) => {
    setNewRepair(prev => ({ ...prev, customer_id: customerId, device_description: '' }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default'
      case 'diagnosed': return 'warning'
      case 'in_progress': return 'primary'
      case 'completed': return 'success'
      case 'delivered': return 'success'
      case 'cancelled': return 'danger'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    return t(`repairs.status.${status}`) || status
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'default'
      case 'medium': return 'warning'
      case 'high': return 'danger'
      case 'urgent': return 'danger'
      default: return 'default'
    }
  }

  const getPriorityLabel = (priority: string) => {
    return t(`repairs.priority.${priority}`) || priority
  }



  const getCustomerName = (customer: Repair['customers'], unregisteredName?: string | null) => {
    if (!customer && unregisteredName) return unregisteredName
    if (!customer) return 'Cliente no registrado'
    return customer.name || customer.anonymous_identifier || 'Cliente Anónimo'
  }

  const getDeviceName = (device: Repair['devices'], unregisteredInfo?: string | null) => {
    if (!device && unregisteredInfo) return unregisteredInfo
    if (!device) return 'Dispositivo no registrado'
    return `${device.brand} ${device.model}`
  }

  // Funciones CRUD
  const handleViewDetails = (repair: Repair) => {
    setSelectedRepair(repair)
    onDetailOpen()
  }



  const handleStatusChange = (repair: Repair) => {
    setSelectedRepair(repair)
    onStatusOpen()
  }

  const confirmUpdateStatus = async (newStatus: string) => {
    if (!selectedRepair) return;

    setUpdateLoading(true);
    try {
      const response = await fetch(`/api/repairs/${selectedRepair.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error al decodificar la respuesta del servidor' }));
        const errorMessage = errorData.error || 'Error al actualizar el estado';
        throw new Error(errorMessage);
      }
      
      onStatusClose();
      fetchRepairs(1, filtroEstado, busqueda, fechaInicio, fechaFin); // Recargar para ver el cambio
    } catch (error) {
      console.error("Failed to update status", error);
      alert(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteRepair = (repair: Repair) => {
    setSelectedRepair(repair)
    onDeleteOpen()
  }

  const confirmDeleteRepair = async () => {
    if (!selectedRepair) return
    
    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/repairs/${selectedRepair.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar la reparación')
      }

      onDeleteClose()
      fetchRepairs(1, filtroEstado, busqueda, fechaInicio, fechaFin)
      alert('Reparación eliminada exitosamente')
    } catch (err) {
      console.error('Error deleting repair:', err)
      alert(err instanceof Error ? err.message : 'Error al eliminar la reparación')
    } finally {
      setDeleteLoading(false)
    }
  }

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
          <div>${new Date(repair.received_date).toLocaleDateString('es-ES')}</div>
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
        
        ${repair.warranty_days > 0 ? `
        <div class="space">
          <div class="bold">GARANTÍA:</div>
          <div>${repair.warranty_days} días</div>
        </div>
        ` : ''}
        
        ${repair.internal_notes ? `
        <div class="space">
          <div class="bold">NOTAS INTERNAS:</div>
          <div>${repair.internal_notes}</div>
        </div>
        ` : ''}
        
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

  const allStats = {
    total: stats.total,
    pending: stats.received + stats.diagnosed,
    inProgress: stats.inProgress,
    completed: stats.completed + stats.delivered
  }

  const renderCell = React.useCallback((repair: Repair, columnKey: React.Key) => {
    const customerName = getCustomerName(repair.customers, repair.unregistered_customer_name)
    const deviceName = getDeviceName(repair.devices, repair.unregistered_device_info)

    switch (columnKey) {
      case 'dispositivo':
        const isUnregisteredDevice = !repair.devices && repair.unregistered_device_info
        const deviceInfo = isUnregisteredDevice ? 'Dispositivo no registrado' : 
                          repair.devices?.device_type || 'Tipo desconocido'
        
        return (
          <div className="flex items-center gap-4">
            <Avatar 
              icon={<Smartphone />} 
              className="bg-primary-100 text-primary-600"
            />
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{repair.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{deviceName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">{deviceInfo}</p>
            </div>
          </div>
        )
      case 'cliente':
        const isUnregistered = !repair.customers && repair.unregistered_customer_name
        const customerType = isUnregistered ? 'No registrado' : 
                           repair.customers?.customer_type === 'anonymous' ? 'Anónimo' : 'Registrado'
        const contactInfo = isUnregistered ? 
                           (repair.unregistered_customer_phone || 'Sin contacto') :
                           (repair.customers?.phone || repair.customers?.email || 'Sin contacto')
        
        return (
          <div className="flex items-center gap-3">
            <Avatar icon={<User />} className="bg-gray-200 text-gray-700" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{customerName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{customerType}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{contactInfo}</p>
            </div>
          </div>
        )
      case 'estado':
        return (
          <Chip 
            color={getStatusColor(repair.status) as any} 
            variant="light"
            startContent={
              repair.status === 'in_progress' ? <Clock className="w-4 h-4" /> :
              repair.status === 'completed' ? <CheckCircle className="w-4 h-4" /> :
              repair.status === 'cancelled' ? <AlertCircle className="w-4 h-4" /> :
              <Wrench className="w-4 h-4" />
            }
          >
            {getStatusLabel(repair.status)}
          </Chip>
        )
      case 'costo':
        return (
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(repair.cost)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Estimado</p>
          </div>
        );
      case 'fecha':
        return (
          <div className="text-sm text-gray-600">
            <p>Recibido:</p>
            <p>{new Date(repair.received_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
        );
      case 'acciones':
        return (
          <div className="flex gap-1">
            <Tooltip content={t('common.view') + " " + t('common.details')} classNames={{ content: "bg-gray-900 text-white border-gray-700" }}>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={() => handleViewDetails(repair)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Cambiar estado" classNames={{ content: "bg-gray-900 text-white border-gray-700" }}>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                color="warning"
                onPress={() => handleStatusChange(repair)}
              >
                <ClipboardList className="h-4 w-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Imprimir Ticket" classNames={{ content: "bg-gray-900 text-white border-gray-700" }}>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                color="secondary"
                onPress={() => handlePrintTicket(repair)}
                isLoading={printLoading}
              >
                <Printer className="h-4 w-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Eliminar" classNames={{ content: "bg-red-600 text-white border-red-500" }}>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                color="danger"
                onPress={() => handleDeleteRepair(repair)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        )
      default:
        return <span>{repair[columnKey as keyof Repair]?.toString()}</span>
    }
  }, [])

  const columns = [
    { name: "DISPOSITIVO", uid: "dispositivo" },
    { name: "CLIENTE", uid: "cliente" },
    { name: "ESTADO", uid: "estado" },
    { name: "COSTO", uid: "costo" },
    { name: "FECHA", uid: "fecha" },
    { name: "ACCIONES", uid: "acciones" },
  ];

  if (loading) {
    return (
      <DashboardLayout>
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
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">{t('common.error')}: {error}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
                      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">{t('repairs.title')}</h1>
          <p className={`text-sm md:text-base ${textColors.secondary} mt-1`}>{t('repairs.description')}</p>
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

        {/* Filtros */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardBody className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 lg:flex-none lg:w-96">
                <Input
                  placeholder="Buscar por cliente, dispositivo..."
                  value={busqueda}
                  onChange={(e) => handleBusquedaChange(e.target.value)}
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
              <div className="flex flex-col sm:flex-row gap-4 lg:flex-1">
                <div className="flex gap-2">
                  <Input
                    type="date"
                    label={t('repairs.filters.from')}
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    variant="bordered"
                    size="lg"
                    className="w-40"
                    classNames={{
                      input: "text-sm text-gray-900",
                      inputWrapper: "border-gray-200 hover:border-gray-300",
                      label: "text-gray-700 font-medium"
                    }}
                  />
                  <Input
                    type="date"
                    label={t('repairs.filters.to')}
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    variant="bordered"
                    size="lg"
                    className="w-40"
                    classNames={{
                      input: "text-sm text-gray-900",
                      inputWrapper: "border-gray-200 hover:border-gray-300",
                      label: "text-gray-700 font-medium"
                    }}
                  />
                </div>
                <Select
                  placeholder="Estado"
                  selectedKeys={[filtroEstado]}
                  onSelectionChange={handleFiltroChange}
                  startContent={<Filter className="h-4 w-4 text-gray-400" />}
                  variant="bordered"
                  size="lg"
                  className="w-full sm:w-48"
                  classNames={{
                    trigger: "border-gray-200 hover:border-gray-300",
                    value: "text-gray-900"
                  }}
                >
                  <SelectItem key="todos" className="text-gray-900">{t('filters.all')}</SelectItem>
                  <SelectItem key="received" className="text-gray-900">{t('repairs.status.received')}</SelectItem>
                  <SelectItem key="diagnosed" className="text-gray-900">{t('repairs.status.diagnosed')}</SelectItem>
                  <SelectItem key="in_progress" className="text-gray-900">{t('repairs.status.in_progress')}</SelectItem>
                  <SelectItem key="waiting_parts" className="text-gray-900">{t('repairs.status.waiting_parts')}</SelectItem>
                  <SelectItem key="completed" className="text-gray-900">{t('repairs.status.completed')}</SelectItem>
                  <SelectItem key="delivered" className="text-gray-900">{t('repairs.status.delivered')}</SelectItem>
                  <SelectItem key="cancelled" className="text-gray-900">{t('repairs.status.cancelled')}</SelectItem>
                </Select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:scale-105 transition-all duration-300 border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100">
            <CardBody className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <Chip color="primary" variant="flat" className="font-semibold">Total</Chip>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-700">{t('repairs.total')}</p>
                <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border-0 shadow-xl bg-gradient-to-br from-orange-50 to-orange-100">
            <CardBody className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <Chip color="warning" variant="flat" className="font-semibold">Pendientes</Chip>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-orange-700">Pendientes</p>
                <p className="text-2xl font-bold text-orange-800">{stats.received + stats.diagnosed}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-100">
            <CardBody className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <Chip color="primary" variant="flat" className="font-semibold">Proceso</Chip>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-700">En Proceso</p>
                <p className="text-2xl font-bold text-blue-800">{stats.inProgress}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-100">
            <CardBody className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <Chip color="success" variant="flat" className="font-semibold">Completadas</Chip>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-700">Completadas</p>
                <p className="text-2xl font-bold text-green-800">{stats.completed + stats.delivered}</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Lista de Reparaciones */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardBody className="p-0">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <Table 
                aria-label="Tabla de reparaciones"
                classNames={{
                  wrapper: "shadow-none rounded-none",
                  th: "bg-gray-50 text-gray-700 font-semibold",
                  td: "border-b border-gray-100"
                }}
              >
                <TableHeader>
                  <TableColumn>REPARACIÓN</TableColumn>
                  <TableColumn>CLIENTE</TableColumn>
                  <TableColumn>DISPOSITIVO</TableColumn>
                  <TableColumn>ESTADO</TableColumn>
                  <TableColumn>PRIORIDAD</TableColumn>
                  <TableColumn>COSTO</TableColumn>
                  <TableColumn>FECHA</TableColumn>
                  <TableColumn>ACCIONES</TableColumn>
                </TableHeader>
                <TableBody>
                  {repairs.map((repair) => (
                    <TableRow key={repair.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <p className="font-semibold text-gray-900">{repair.title}</p>
                          <p className="text-sm text-gray-600 truncate max-w-[200px]">{repair.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar size="sm" name={getCustomerName(repair.customers, repair.unregistered_customer_name)} />
                          <div>
                            <p className="font-medium text-gray-900">{getCustomerName(repair.customers, repair.unregistered_customer_name)}</p>
                            <p className="text-sm text-gray-600">{repair.customers?.phone || repair.unregistered_customer_phone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{getDeviceName(repair.devices, repair.unregistered_device_info)}</p>
                          <p className="text-sm text-gray-600">{repair.devices?.serial_number || 'S/N no disponible'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          color={getStatusColor(repair.status)} 
                          variant="flat" 
                          size="sm"
                          className="font-medium"
                        >
                          {getStatusLabel(repair.status)}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          color={getPriorityColor(repair.priority)} 
                          variant="dot" 
                          size="sm"
                          className="font-medium"
                          classNames={{
                            content: "text-gray-900 font-semibold"
                          }}
                        >
                          {getPriorityLabel(repair.priority)}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-gray-900">{formatCurrency(repair.cost)}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600">{new Date(repair.created_at).toLocaleDateString()}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Tooltip content={t('common.view') + " " + t('common.details')} classNames={{ content: "bg-gray-900 text-white border-gray-700" }}>
                            <Button
                              isIconOnly
                              variant="light"
                              size="sm"
                              onPress={() => handleViewDetails(repair)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Cambiar estado" classNames={{ content: "bg-gray-900 text-white border-gray-700" }}>
                            <Button
                              isIconOnly
                              variant="light"
                              size="sm"
                              color="warning"
                              onPress={() => handleStatusChange(repair)}
                            >
                              <ClipboardList className="h-4 w-4" />
                            </Button>
                          </Tooltip>

                          <Tooltip content="Eliminar" classNames={{ content: "bg-red-600 text-white border-red-500" }}>
                            <Button
                              isIconOnly
                              variant="light"
                              size="sm"
                              color="danger"
                              onPress={() => handleDeleteRepair(repair)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden p-4 space-y-4">
              {repairs.map((repair) => (
                <Card key={repair.id} className="shadow-md border border-gray-200 hover:shadow-lg transition-all">
                  <CardBody className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{repair.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{repair.description}</p>
                        </div>
                        <Chip 
                          color={getStatusColor(repair.status)} 
                          variant="flat" 
                          size="sm"
                          className="ml-2 flex-shrink-0"
                        >
                          {getStatusLabel(repair.status)}
                        </Chip>
                      </div>

                      {/* Customer & Device */}
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {getCustomerName(repair.customers, repair.unregistered_customer_name)}
                            </p>
                            <p className="text-xs text-gray-600">{repair.customers?.phone || repair.unregistered_customer_phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {getDeviceName(repair.devices, repair.unregistered_device_info)}
                            </p>
                            <p className="text-xs text-gray-600">{repair.devices?.serial_number || 'S/N no disponible'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                          <Chip 
                            color={getPriorityColor(repair.priority)} 
                            variant="dot" 
                            size="sm"
                            classNames={{
                              content: "text-gray-900 font-semibold"
                            }}
                          >
                            {getPriorityLabel(repair.priority)}
                          </Chip>
                          <p className="text-sm font-semibold text-gray-900">{formatCurrency(repair.cost)}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            onPress={() => handleViewDetails(repair)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            color="warning"
                            onPress={() => handleStatusChange(repair)}
                          >
                            <ClipboardList className="h-4 w-4" />
                          </Button>
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            color="secondary"
                            onPress={() => handlePrintTicket(repair)}
                            isLoading={printLoading}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            color="danger"
                            onPress={() => handleDeleteRepair(repair)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {repairs.length === 0 && (
              <div className="text-center py-12">
                <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('repairs.noRepairs')}</h3>
                <p className="text-gray-600 mb-6">Comienza creando tu primera reparación</p>
                <Button 
                  color="primary" 
                  startContent={<Plus className="h-4 w-4" />}
                  onPress={onCreateOpen}
                >
                  Nueva Reparación
                </Button>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination
              total={pagination.totalPages}
              page={pagination.page}
              onChange={(page) => fetchRepairs(page)}
              size="lg"
              showControls
              color="primary"
              className="gap-2"
            />
          </div>
        )}

        {/* Modal para crear reparación */}
        <Modal 
          isOpen={isCreateOpen} 
          onClose={onCreateClose}
          size="2xl"
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
            <ModalHeader>
                              <h2 className={`text-xl font-bold ${textColors.primary}`}>{t('repairs.createTitle')}</h2>
            </ModalHeader>
            <ModalBody>
              <form onSubmit={handleCreateRepair} className="space-y-4">
                <div className="flex items-center gap-4">
                  <label htmlFor="unregistered-switch" className="text-gray-700 dark:text-gray-300">
                    Cliente no registrado
                  </label>
                  <Switch
                    id="unregistered-switch"
                    isSelected={isUnregistered}
                    onChange={() => setIsUnregistered(!isUnregistered)}
                  />
                </div>

                {isUnregistered ? (
                  <>
                    <Input
                      label="Nombre del Cliente"
                      placeholder="Ej: Juan Pérez"
                      value={newRepair.unregistered_customer_name}
                      onChange={(e) => setNewRepair({ ...newRepair, unregistered_customer_name: e.target.value })}
                      isRequired
                    />
                    <Input
                      label="Teléfono del Cliente (Opcional)"
                      placeholder="Ej: +123456789"
                      value={newRepair.unregistered_customer_phone}
                      onChange={(e) => setNewRepair({ ...newRepair, unregistered_customer_phone: e.target.value })}
                    />
                    <Textarea
                      label="Información del Dispositivo"
                      placeholder="Ej: iPhone 13 Pro, color azul, con la pantalla rota."
                      value={newRepair.unregistered_device_info}
                      onChange={(e) => setNewRepair({ ...newRepair, unregistered_device_info: e.target.value })}
                      isRequired
                    />
                  </>
                ) : (
                  <>
                    <Select
                      label="Cliente"
                      placeholder="Seleccione un cliente"
                      onSelectionChange={(keys) => handleCustomerChange(Array.from(keys)[0] as string)}
                      isRequired
                      className="text-gray-900 dark:text-gray-100"
                    >
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} textValue={`${customer.name} (${customer.email || customer.phone})`} className="text-gray-900 dark:text-gray-100">
                          {customer.name} ({customer.email || customer.phone})
                        </SelectItem>
                      ))}
                    </Select>
                    <Input
                      label="Descripción del Dispositivo"
                      placeholder="Ej: iPhone 13 Pro Max 256GB Azul"
                      value={newRepair.device_description}
                      onChange={(e) => setNewRepair({ ...newRepair, device_description: e.target.value })}
                      isDisabled={!newRepair.customer_id}
                      isRequired
                      startContent={<Smartphone className="w-4 h-4 text-gray-400" />}
                    />
                  </>
                )}
                
                <Input
                  label="Título de la Reparación"
                  placeholder="Ej: Cambio de pantalla iPhone 13"
                  value={newRepair.title}
                  onChange={(e) => setNewRepair({ ...newRepair, title: e.target.value })}
                  isRequired
                />
                <Textarea
                  label="Descripción del Problema"
                  placeholder="El cliente reporta que el dispositivo no enciende..."
                  value={newRepair.problem_description}
                  onChange={(e) => setNewRepair({ ...newRepair, problem_description: e.target.value })}
                  isRequired
                />
                <Select
                  label="Prioridad"
                  selectedKeys={[newRepair.priority]}
                  onSelectionChange={(keys) => setNewRepair({ ...newRepair, priority: Array.from(keys)[0] as string })}
                  className="text-gray-900 dark:text-gray-100"
                >
                  <SelectItem key="low" className="text-gray-900 dark:text-gray-100">Baja</SelectItem>
                  <SelectItem key="medium" className="text-gray-900 dark:text-gray-100">Media</SelectItem>
                  <SelectItem key="high" className="text-gray-900 dark:text-gray-100">Alta</SelectItem>
                </Select>
                <Input
                  type="number"
                  label="Costo"
                  placeholder="0.00"
                  value={String(newRepair.cost)}
                  onChange={(e) => setNewRepair({ ...newRepair, cost: parseFloat(e.target.value) || 0 })}
                  startContent={<DollarSign className="w-4 h-4 text-gray-400" />}
                />
                <Textarea
                  label="Notas Internas (Opcional)"
                  placeholder="Recordar pedir la pieza X..."
                  value={newRepair.internal_notes}
                  onChange={(e) => setNewRepair({ ...newRepair, internal_notes: e.target.value })}
                />
              </form>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onClick={onCreateClose}>Cancelar</Button>
              <Button color="primary" onClick={handleCreateRepair} isLoading={createLoading}>
                Crear Reparación
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal para ver detalles */}
        <Modal 
          isOpen={isDetailOpen} 
          onClose={onDetailClose} 
          size="3xl"
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
            {(onDetailClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h2 className={`text-xl font-bold ${textColors.primary}`}>
                    Detalles de la Reparación: {selectedRepair?.title}
                  </h2>
                </ModalHeader>
                <ModalBody>
                  {selectedRepair && (
                   <div className="space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <p className={`text-sm font-medium ${textColors.tertiary}`}>Título</p>
                         <p className={`text-lg font-semibold ${textColors.primary}`}>{selectedRepair.title}</p>
                       </div>
                       <div>
                         <p className={`text-sm font-medium ${textColors.tertiary}`}>Estado</p>
                         <Chip color={getStatusColor(selectedRepair.status)} variant="flat">
                           {getStatusLabel(selectedRepair.status)}
                         </Chip>
                       </div>
                     </div>

                     {/* Información del creador */}
                     <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                       <div className="flex items-center gap-3">
                         <div className="p-2 bg-blue-100 rounded-full">
                           {selectedRepair.technician?.email.includes('admin') || selectedRepair.technician?.name?.toLowerCase().includes('admin') ? (
                             <Shield className="w-4 h-4 text-blue-600" />
                           ) : (
                             <User className="w-4 h-4 text-blue-600" />
                           )}
                         </div>
                         <div className="flex-1">
                           <p className="text-sm font-medium text-blue-800">Creado por</p>
                           <p className="text-base font-semibold text-blue-900">
                             {selectedRepair.technician ? selectedRepair.technician.name : 'Usuario desconocido'}
                           </p>
                           <p className="text-xs text-blue-600">
                             {selectedRepair.technician ? selectedRepair.technician.email : 'Sin información de contacto'}
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
                         <div className="ml-auto">
                           <Chip 
                             color={selectedRepair.technician?.email.includes('admin') || selectedRepair.technician?.name?.toLowerCase().includes('admin') ? 'warning' : 'primary'}
                             variant="flat" 
                             size="sm"
                             startContent={selectedRepair.technician?.email.includes('admin') || selectedRepair.technician?.name?.toLowerCase().includes('admin') ? 
                               <Shield className="w-3 h-3" /> : 
                               <User className="w-3 h-3" />
                             }
                           >
                             {selectedRepair.technician?.email.includes('admin') || selectedRepair.technician?.name?.toLowerCase().includes('admin') ? 
                               'Administrador' : 
                               'Técnico'
                             }
                           </Chip>
                         </div>
                       </div>
                     </div>
                     
                     <div>
                       <p className={`text-sm font-medium ${textColors.tertiary} mb-2`}>Cliente</p>
                       <p className={`text-base ${textColors.primary}`}>{getCustomerName(selectedRepair.customers, selectedRepair.unregistered_customer_name)}</p>
                     </div>

                     <div>
                       <p className={`text-sm font-medium ${textColors.tertiary} mb-2`}>Dispositivo</p>
                       <p className={`text-base ${textColors.primary}`}>{getDeviceName(selectedRepair.devices, selectedRepair.unregistered_device_info)}</p>
                     </div>

                     <div>
                       <p className={`text-sm font-medium ${textColors.tertiary} mb-2`}>Problema Reportado</p>
                       <p className={`text-base ${textColors.primary}`}>{selectedRepair.problem_description}</p>
                     </div>

                     {selectedRepair.solution_description && (
                       <div>
                         <p className={`text-sm font-medium ${textColors.tertiary} mb-2`}>Solución</p>
                         <p className={`text-base ${textColors.primary}`}>{selectedRepair.solution_description}</p>
                       </div>
                     )}

                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <p className={`text-sm font-medium ${textColors.tertiary}`}>Costo</p>
                         <p className={`text-lg font-semibold ${textColors.primary}`}>{formatCurrency(selectedRepair.cost)}</p>
                       </div>
                       <div>
                         <p className={`text-sm font-medium ${textColors.tertiary}`}>Estado</p>
                         <p className={`text-lg font-semibold ${textColors.primary}`}>{selectedRepair.status}</p>
                       </div>
                     </div>
                   </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="default" variant="light" onPress={onDetailClose}>
                    Cerrar
                  </Button>
                  <Button 
                    color="secondary" 
                    startContent={<Printer className="h-4 w-4" />}
                    onPress={() => selectedRepair && handlePrintTicket(selectedRepair)}
                    isLoading={printLoading}
                  >
                    Imprimir Ticket
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Modal de eliminación */}
        <Modal 
          isOpen={isDeleteOpen} 
          onClose={onDeleteClose}
          size="md"
          scrollBehavior="inside"
          classNames={{
            wrapper: "z-[1000]",
            backdrop: "z-[999]",
            base: "max-h-[95vh] my-2 mx-2 sm:mx-6",
            body: "max-h-[60vh] overflow-y-auto py-4",
            header: "border-b border-gray-200 pb-4",
            footer: "border-t border-gray-200 pt-4"
          }}
        >
          <ModalContent>
            <ModalHeader>
              <h3 className={`text-xl font-bold ${textColors.primary}`}>Confirmar Eliminación</h3>
            </ModalHeader>
            <ModalBody>
              {selectedRepair && (
                <div className="space-y-4">
                  <p className={textColors.secondary}>{t('repairs.deleteMessage')}</p>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className={`font-medium ${textColors.primary}`}>{selectedRepair.title}</p>
                    <p className={`text-sm ${textColors.secondary}`}>Cliente: {getCustomerName(selectedRepair.customers, selectedRepair.unregistered_customer_name)}</p>
                    <p className={`text-sm ${textColors.secondary}`}>Dispositivo: {getDeviceName(selectedRepair.devices, selectedRepair.unregistered_device_info)}</p>
                  </div>
                  <p className="text-sm text-red-600">Esta acción no se puede deshacer.</p>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onDeleteClose}>
                Cancelar
              </Button>
              <Button 
                color="danger" 
                onPress={confirmDeleteRepair}
                isLoading={deleteLoading}
              >
                                  {t('common.delete')}
              </Button>
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
            <ModalHeader>
              <h2 className={`text-xl font-bold ${textColors.primary}`}>Actualizar Estado de la Reparación</h2>
            </ModalHeader>
            <ModalBody>
              {selectedRepair && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${textColors.secondary}`}>Estado actual:</p>
                    <Chip color={getStatusColor(selectedRepair.status) as any} size="sm">
                      {getStatusLabel(selectedRepair.status)}
                    </Chip>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <p className={`text-sm font-medium ${textColors.primary}`}>Seleccionar nuevo estado:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['received', 'diagnosed', 'in_progress', 'completed', 'delivered', 'cancelled'].map(status => (
                        <Button
                          key={status}
                          variant={selectedRepair.status === status ? "solid" : "bordered"}
                          color={getStatusColor(status) as any}
                          onClick={() => confirmUpdateStatus(status)}
                          className="w-full"
                          size="sm"
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
              <Button variant="light" onClick={onStatusClose}>
                Cancelar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

      </div>
    </DashboardLayout>
  )
} 