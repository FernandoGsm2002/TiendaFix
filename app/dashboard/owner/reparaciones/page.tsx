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
  Printer,
  ArrowUpRight,
  ArrowDownRight
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

  const debouncedFetch = useCallback(
    debounce((search: string) => {
      fetchRepairs(1, filtroEstado, search, fechaInicio, fechaFin);
    }, 300),
    [filtroEstado, fechaInicio, fechaFin]
  );

  useEffect(() => {
    fetchRepairs(1, filtroEstado, busqueda, fechaInicio, fechaFin);
  }, [filtroEstado, fechaInicio, fechaFin]);

  useEffect(() => {
    debouncedFetch(busqueda);
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
          device_id: null,
          title: newRepair.title,
          description: newRepair.description,
          problem_description: newRepair.problem_description,
          priority: newRepair.priority,
          cost: newRepair.cost,
          internal_notes: newRepair.internal_notes,
          // Para clientes registrados, guardamos la info del dispositivo en unregistered_device_info
          // pero mantenemos customer_id para que se identifique como registrado
          unregistered_device_info: newRepair.device_description,
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
      case 'received': return 'default'
      case 'diagnosed': return 'warning'
      case 'in_progress': return 'primary'
      case 'completed': return 'success'
      case 'delivered': return 'success'
      case 'cancelled': return 'danger'
      default: return 'default'
    }
  }

  // Nueva función para obtener el color del botón de cambio de estado
  const getStatusButtonColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange-500'
      case 'diagnosed': return 'blue-500'
      case 'in_progress': return 'blue-600'
      case 'completed': return 'green-500'
      case 'delivered': return 'green-600'
      case 'cancelled': return 'red-500'
      default: return 'gray-500'
    }
  }

  // Nueva función para obtener el color de hover del botón de cambio de estado
  const getStatusButtonHoverColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange-600'
      case 'diagnosed': return 'blue-600'
      case 'in_progress': return 'blue-700'
      case 'completed': return 'green-600'
      case 'delivered': return 'green-700'
      case 'cancelled': return 'red-600'
      default: return 'gray-600'
    }
  }

  // Nueva función para obtener el color de fondo del botón de cambio de estado
  const getStatusButtonBgColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange-100'
      case 'diagnosed': return 'blue-100'
      case 'in_progress': return 'blue-100'
      case 'completed': return 'green-100'
      case 'delivered': return 'green-100'
      case 'cancelled': return 'red-100'
      default: return 'gray-100'
    }
  }

  // Nueva función para obtener colores específicos para los botones del modal
  const getModalButtonColor = (status: string) => {
    switch (status) {
      case 'received': return 'default'
      case 'diagnosed': return 'warning'
      case 'in_progress': return 'primary'
      case 'completed': return 'success'
      case 'delivered': return 'success'
      case 'cancelled': return 'danger'
      default: return 'default'
    }
  }

  // Nueva función para obtener colores CSS específicos para los botones del modal
  const getModalButtonClass = (status: string, isSelected: boolean) => {
    const baseClass = 'w-full text-sm font-medium transition-all duration-200'
    
    if (isSelected) {
      switch (status) {
        case 'received': return `${baseClass} bg-gray-500 text-white border-gray-500 hover:bg-gray-600`
        case 'diagnosed': return `${baseClass} bg-orange-500 text-white border-orange-500 hover:bg-orange-600`
        case 'in_progress': return `${baseClass} bg-blue-500 text-white border-blue-500 hover:bg-blue-600`
        case 'completed': return `${baseClass} bg-green-500 text-white border-green-500 hover:bg-green-600`
        case 'delivered': return `${baseClass} bg-green-600 text-white border-green-600 hover:bg-green-700`
        case 'cancelled': return `${baseClass} bg-red-500 text-white border-red-500 hover:bg-red-600`
        default: return `${baseClass} bg-gray-500 text-white border-gray-500 hover:bg-gray-600`
      }
    } else {
      switch (status) {
        case 'received': return `${baseClass} bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400`
        case 'diagnosed': return `${baseClass} bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100 hover:border-orange-400`
        case 'in_progress': return `${baseClass} bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100 hover:border-blue-400`
        case 'completed': return `${baseClass} bg-green-50 text-green-700 border-green-300 hover:bg-green-100 hover:border-green-400`
        case 'delivered': return `${baseClass} bg-green-50 text-green-800 border-green-400 hover:bg-green-100 hover:border-green-500`
        case 'cancelled': return `${baseClass} bg-red-50 text-red-700 border-red-300 hover:bg-red-100 hover:border-red-400`
        default: return `${baseClass} bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400`
      }
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
        const isUnregistered = !repair.customers
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
                className="text-gray-600 hover:text-[#4ca771] hover:bg-gray-100"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Cambiar estado" classNames={{ content: "bg-gray-900 text-white border-gray-700" }}>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={() => handleStatusChange(repair)}
                className={`text-${getStatusButtonColor(repair.status)} hover:text-${getStatusButtonHoverColor(repair.status)} hover:bg-${getStatusButtonBgColor(repair.status)}`}
              >
                <ClipboardList className="h-4 w-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Imprimir Ticket" classNames={{ content: "bg-gray-900 text-white border-gray-700" }}>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={() => handlePrintTicket(repair)}
                isLoading={printLoading}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
              >
                <Printer className="h-4 w-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Eliminar" classNames={{ content: "bg-red-600 text-white border-red-500" }}>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={() => handleDeleteRepair(repair)}
                className="text-red-600 hover:text-red-700 hover:bg-red-100"
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
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#4ca771] to-[#013237] bg-clip-text text-transparent">{t('repairs.title')}</h1>
            <p className="text-sm md:text-base text-[#4ca771] mt-1">{t('repairs.description')}</p>
          </div>
          <Button 
            startContent={<Plus className="h-4 w-4" />}
            onPress={onCreateOpen}
            className="w-full sm:w-auto font-semibold bg-gradient-to-r from-[#4ca771] to-[#013237] text-white hover:from-[#013237] hover:to-[#4ca771] transition-all"
            size="lg"
          >
            Nueva Reparación
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="hover:scale-105 transition-all duration-300 border border-gray-200 shadow-lg bg-gradient-to-br from-blue-100 to-blue-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-blue-500 shadow-lg">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">+12%</span>
                  </div>
                  <Chip variant="flat" size="sm" className="font-semibold bg-white/60 text-blue-800 border border-white/30">
                    Total
                  </Chip>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-base font-bold text-blue-800 opacity-90 uppercase tracking-wider">{t('repairs.total')}</p>
                <p className="text-4xl font-extrabold text-blue-800 mb-2 tracking-tight">{stats.total}</p>
                <p className="text-sm font-medium text-blue-800 opacity-70">Reparaciones registradas</p>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border border-gray-200 shadow-lg bg-gradient-to-br from-orange-100 to-orange-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-orange-500 shadow-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <ArrowDownRight className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-600 font-medium">-8%</span>
                  </div>
                  <Chip variant="flat" size="sm" className="font-semibold bg-white/60 text-orange-800 border border-white/30">
                    Pendientes
                  </Chip>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-base font-bold text-orange-800 opacity-90 uppercase tracking-wider">Pendientes</p>
                <p className="text-4xl font-extrabold text-orange-800 mb-2 tracking-tight">{stats.received + stats.diagnosed}</p>
                <Progress 
                  value={((stats.received + stats.diagnosed) / Math.max(stats.total, 1)) * 100} 
                  classNames={{
                    indicator: "bg-orange-500",
                  }}
                  size="sm" 
                  className="max-w-md"
                />
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border border-gray-200 shadow-lg bg-gradient-to-br from-purple-100 to-purple-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-purple-500 shadow-lg">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">+15%</span>
                  </div>
                  <Chip variant="flat" size="sm" className="font-semibold bg-white/60 text-purple-800 border border-white/30">
                    Proceso
                  </Chip>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-base font-bold text-purple-800 opacity-90 uppercase tracking-wider">En Proceso</p>
                <p className="text-4xl font-extrabold text-purple-800 mb-2 tracking-tight">{stats.inProgress}</p>
                <Progress 
                  value={(stats.inProgress / Math.max(stats.total, 1)) * 100} 
                  classNames={{
                    indicator: "bg-purple-500",
                  }}
                  size="sm" 
                  className="max-w-md"
                />
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border border-gray-200 shadow-lg bg-gradient-to-br from-emerald-100 to-emerald-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-emerald-500 shadow-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">+22%</span>
                  </div>
                  <Chip variant="flat" size="sm" className="font-semibold bg-white/60 text-emerald-800 border border-white/30">
                    Completadas
                  </Chip>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-base font-bold text-emerald-800 opacity-90 uppercase tracking-wider">Completadas</p>
                <p className="text-4xl font-extrabold text-emerald-800 mb-2 tracking-tight">{stats.completed + stats.delivered}</p>
                <Progress 
                  value={((stats.completed + stats.delivered) / Math.max(stats.total, 1)) * 100} 
                  classNames={{
                    indicator: "bg-emerald-500",
                  }}
                  size="sm" 
                  className="max-w-md"
                />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="shadow-lg border border-gray-200 bg-white/90">
          <CardBody className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 lg:flex-none lg:w-96">
                <Input
                  placeholder="Buscar por cliente, dispositivo, estado..."
                  value={busqueda}
                  onChange={(e) => handleBusquedaChange(e.target.value)}
                  startContent={<Search className="h-3 w-3 xs:h-4 xs:w-4 text-[#4ca771]" />}
                  variant="bordered"
                  size="md"
                  className="w-full xs:size-lg"
                  classNames={{
                    input: "text-xs xs:text-sm text-gray-800 placeholder:text-gray-400",
                    inputWrapper: "border-gray-300 hover:border-[#4ca771] focus-within:border-[#4ca771] min-h-10 xs:min-h-12"
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
                    size="sm"
                    className="w-32 xs:w-40 xs:size-md lg:size-lg"
                    classNames={{
                      input: "text-xs xs:text-sm text-gray-800",
                      inputWrapper: "border-gray-300 hover:border-[#4ca771] focus-within:border-[#4ca771] min-h-9 xs:min-h-10 lg:min-h-12",
                      label: "text-xs xs:text-sm text-gray-700 font-medium"
                    }}
                  />
                  <Input
                    type="date"
                    label={t('repairs.filters.to')}
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    variant="bordered"
                    size="sm"
                    className="w-32 xs:w-40 xs:size-md lg:size-lg"
                    classNames={{
                      input: "text-xs xs:text-sm text-gray-800",
                      inputWrapper: "border-gray-300 hover:border-[#4ca771] focus-within:border-[#4ca771] min-h-9 xs:min-h-10 lg:min-h-12",
                      label: "text-xs xs:text-sm text-gray-700 font-medium"
                    }}
                  />
                </div>
                <Select
                  placeholder="Estado"
                  selectedKeys={[filtroEstado]}
                  onSelectionChange={handleFiltroChange}
                  startContent={<Filter className="h-3 w-3 xs:h-4 xs:w-4 text-[#4ca771]" />}
                  variant="bordered"
                  size="md"
                  className="w-full xs:size-lg sm:w-48"
                  classNames={{
                    trigger: "border-gray-300 hover:border-[#4ca771] focus:border-[#4ca771] min-h-10 xs:min-h-12",
                    value: "text-xs xs:text-sm text-gray-800",
                    popoverContent: "bg-white border border-gray-200"
                  }}
                >
                  <SelectItem key="todos" className="text-gray-800 hover:bg-gray-50">{t('filters.all')}</SelectItem>
                  <SelectItem key="received" className="text-gray-800 hover:bg-gray-50">{t('repairs.status.received')}</SelectItem>
                  <SelectItem key="diagnosed" className="text-gray-800 hover:bg-gray-50">{t('repairs.status.diagnosed')}</SelectItem>
                  <SelectItem key="in_progress" className="text-gray-800 hover:bg-gray-50">{t('repairs.status.in_progress')}</SelectItem>
                  <SelectItem key="waiting_parts" className="text-gray-800 hover:bg-gray-50">{t('repairs.status.waiting_parts')}</SelectItem>
                  <SelectItem key="completed" className="text-gray-800 hover:bg-gray-50">{t('repairs.status.completed')}</SelectItem>
                  <SelectItem key="delivered" className="text-gray-800 hover:bg-gray-50">{t('repairs.status.delivered')}</SelectItem>
                  <SelectItem key="cancelled" className="text-gray-800 hover:bg-gray-50">{t('repairs.status.cancelled')}</SelectItem>
                </Select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Lista de Reparaciones */}
        <Card className="shadow-lg border border-gray-200 bg-white/90">
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
                              onPress={() => handleStatusChange(repair)}
                              className={`text-${getStatusButtonColor(repair.status)} hover:text-${getStatusButtonHoverColor(repair.status)} hover:bg-${getStatusButtonBgColor(repair.status)}`}
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
                            onPress={() => handleStatusChange(repair)}
                            className={`text-${getStatusButtonColor(repair.status)} hover:text-${getStatusButtonHoverColor(repair.status)} hover:bg-${getStatusButtonBgColor(repair.status)}`}
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
          size="full"
          scrollBehavior="inside"
          classNames={{
            wrapper: "z-[1000]",
            backdrop: "z-[999]",
            base: "max-h-[100vh] h-full w-full m-0 xs:max-h-[95vh] xs:h-auto xs:w-auto xs:my-1 xs:mx-1 sm:my-2 sm:mx-2 md:mx-4 lg:mx-6 xl:max-w-5xl",
            body: "max-h-[calc(100vh-120px)] xs:max-h-[80vh] sm:max-h-[75vh] overflow-y-auto p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6",
            header: "border-b border-gray-200 p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6",
            footer: "border-t border-gray-200 p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6"
          }}
        >
          <ModalContent>
            <ModalHeader>
              <h2 className={`text-lg sm:text-xl md:text-2xl font-bold ${textColors.primary}`}>{t('repairs.createTitle')}</h2>
            </ModalHeader>
            <ModalBody>
              <form onSubmit={handleCreateRepair} className="space-y-4 md:space-y-6">
                <div className="flex items-center gap-4 py-2">
                  <label htmlFor="unregistered-switch" className="text-base font-medium text-gray-700 dark:text-gray-300">
                    Cliente no registrado
                  </label>
                  <Switch
                    id="unregistered-switch"
                    isSelected={isUnregistered}
                    onChange={() => setIsUnregistered(!isUnregistered)}
                    size="md"
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
                      size="md"
                      variant="bordered"
                      classNames={{
                        label: "text-base",
                        input: "text-gray-900 dark:text-gray-100 text-base",
                        inputWrapper: "bg-white dark:bg-gray-800 min-h-12"
                      }}
                    />
                    <Input
                      label="Teléfono del Cliente (Opcional)"
                      placeholder="Ej: +123456789"
                      value={newRepair.unregistered_customer_phone}
                      onChange={(e) => setNewRepair({ ...newRepair, unregistered_customer_phone: e.target.value })}
                      size="md"
                      variant="bordered"
                      classNames={{
                        label: "text-base",
                        input: "text-gray-900 dark:text-gray-100 text-base",
                        inputWrapper: "bg-white dark:bg-gray-800 min-h-12"
                      }}
                    />
                    <Textarea
                      label="Información del Dispositivo"
                      placeholder="Ej: iPhone 13 Pro, color azul, con la pantalla rota."
                      value={newRepair.unregistered_device_info}
                      onChange={(e) => setNewRepair({ ...newRepair, unregistered_device_info: e.target.value })}
                      isRequired
                      size="md"
                      variant="bordered"
                      minRows={3}
                      maxRows={5}
                      classNames={{
                        label: "text-base",
                        input: "text-gray-900 dark:text-gray-100 text-base",
                        inputWrapper: "bg-white dark:bg-gray-800"
                      }}
                    />
                  </>
                ) : (
                  <>
                    <Select
                      label="Cliente"
                      placeholder="Seleccione un cliente"
                      onSelectionChange={(keys) => handleCustomerChange(Array.from(keys)[0] as string)}
                      isRequired
                      size="md"
                      variant="bordered"
                      classNames={{
                        label: "text-base",
                        trigger: "bg-white dark:bg-gray-800 min-h-12",
                        value: "text-gray-900 dark:text-gray-100 text-base"
                      }}
                    >
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} textValue={`${customer.name} (${customer.email || customer.phone})`} className="text-gray-900 dark:text-gray-100 text-base">
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
                      size="md"
                      variant="bordered"
                      startContent={<Smartphone className="w-4 h-4 text-gray-400" />}
                      classNames={{
                        label: "text-base",
                        input: "text-gray-900 dark:text-gray-100 text-base",
                        inputWrapper: "bg-white dark:bg-gray-800 min-h-12"
                      }}
                    />
                  </>
                )}
                
                <Input
                  label="Título de la Reparación"
                  placeholder="Ej: Cambio de pantalla iPhone 13"
                  value={newRepair.title}
                  onChange={(e) => setNewRepair({ ...newRepair, title: e.target.value })}
                  isRequired
                  size="md"
                  variant="bordered"
                  classNames={{
                    label: "text-base",
                    input: "text-gray-900 dark:text-gray-100 text-base",
                    inputWrapper: "bg-white dark:bg-gray-800 min-h-12"
                  }}
                />
                <Textarea
                  label="Descripción del Problema"
                  placeholder="El cliente reporta que el dispositivo no enciende..."
                  value={newRepair.problem_description}
                  onChange={(e) => setNewRepair({ ...newRepair, problem_description: e.target.value })}
                  isRequired
                  size="md"
                  variant="bordered"
                  minRows={3}
                  maxRows={5}
                  classNames={{
                    label: "text-base",
                    input: "text-gray-900 dark:text-gray-100 text-base",
                    inputWrapper: "bg-white dark:bg-gray-800"
                  }}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <Select
                    label="Prioridad"
                    selectedKeys={[newRepair.priority]}
                    onSelectionChange={(keys) => setNewRepair({ ...newRepair, priority: Array.from(keys)[0] as string })}
                    size="md"
                    variant="bordered"
                    classNames={{
                      label: "text-base",
                      trigger: "bg-white dark:bg-gray-800 min-h-12",
                      value: "text-gray-900 dark:text-gray-100 text-base"
                    }}
                  >
                    <SelectItem key="low" className="text-gray-900 dark:text-gray-100 text-base">Baja</SelectItem>
                    <SelectItem key="medium" className="text-gray-900 dark:text-gray-100 text-base">Media</SelectItem>
                    <SelectItem key="high" className="text-gray-900 dark:text-gray-100 text-base">Alta</SelectItem>
                  </Select>
                  <Input
                    type="number"
                    label="Costo"
                    placeholder="0.00"
                    value={String(newRepair.cost)}
                    onChange={(e) => setNewRepair({ ...newRepair, cost: parseFloat(e.target.value) || 0 })}
                    size="md"
                    variant="bordered"
                    startContent={<DollarSign className="w-4 h-4 text-gray-400" />}
                    classNames={{
                      label: "text-base",
                      input: "text-gray-900 dark:text-gray-100 text-base",
                      inputWrapper: "bg-white dark:bg-gray-800 min-h-12"
                    }}
                  />
                </div>
                <Textarea
                  label="Notas Internas (Opcional)"
                  placeholder="Recordar pedir la pieza X..."
                  value={newRepair.internal_notes}
                  onChange={(e) => setNewRepair({ ...newRepair, internal_notes: e.target.value })}
                  size="md"
                  variant="bordered"
                  minRows={3}
                  maxRows={4}
                  classNames={{
                    label: "text-base",
                    input: "text-gray-900 dark:text-gray-100 text-base",
                    inputWrapper: "bg-white dark:bg-gray-800"
                  }}
                />
              </form>
            </ModalBody>
            <ModalFooter className="gap-3 py-4">
              <Button variant="flat" onClick={onCreateClose} size="md" className="text-base font-medium">Cancelar</Button>
              <Button color="primary" onClick={handleCreateRepair} isLoading={createLoading} size="md" className="text-base font-medium px-6">
                Crear Reparación
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal para ver detalles */}
        <Modal 
          isOpen={isDetailOpen} 
          onClose={onDetailClose} 
          size="full"
          scrollBehavior="inside"
          classNames={{
            wrapper: "z-[1000]",
            backdrop: "z-[999]",
            base: "max-h-[100vh] h-full w-full m-0 xs:max-h-[95vh] xs:h-auto xs:w-auto xs:my-1 xs:mx-1 sm:my-2 sm:mx-2 md:mx-4 lg:mx-6 xl:max-w-4xl",
            body: "max-h-[calc(100vh-120px)] xs:max-h-[80vh] sm:max-h-[75vh] overflow-y-auto p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6",
            header: "border-b border-gray-200 p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6",
            footer: "border-t border-gray-200 p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6"
          }}
        >
          <ModalContent>
            {(onDetailClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h2 className={`text-lg md:text-xl font-bold ${textColors.primary}`}>
                    Detalles de la Reparación: {selectedRepair?.title}
                  </h2>
                </ModalHeader>
                <ModalBody>
                  {selectedRepair && (
                   <div className="space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6">
                     <div className="grid grid-cols-1 gap-3 xs:gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6">
                                                <div className="bg-gray-50 p-2 xs:p-3 rounded-lg">
                           <p className={`text-xs xs:text-sm font-medium ${textColors.tertiary} mb-1`}>Título</p>
                           <p className={`text-sm xs:text-base sm:text-lg font-semibold ${textColors.primary}`}>{selectedRepair.title}</p>
                         </div>
                         <div className="bg-gray-50 p-2 xs:p-3 rounded-lg">
                           <p className={`text-xs xs:text-sm font-medium ${textColors.tertiary} mb-1`}>Estado</p>
                           <Chip color={getStatusColor(selectedRepair.status)} variant="flat" size="sm" className="xs:text-sm">
                             {getStatusLabel(selectedRepair.status)}
                           </Chip>
                         </div>
                     </div>

                     {/* Información del creador */}
                     <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                       <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                         <div className="flex items-center gap-3 flex-1">
                           <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                             {selectedRepair.technician?.email.includes('admin') || selectedRepair.technician?.name?.toLowerCase().includes('admin') ? (
                               <Shield className="w-4 h-4 text-blue-600" />
                             ) : (
                               <User className="w-4 h-4 text-blue-600" />
                             )}
                           </div>
                           <div className="flex-1 min-w-0">
                             <p className="text-sm font-medium text-blue-800">Creado por</p>
                             <p className="text-base font-semibold text-blue-900 truncate">
                               {selectedRepair.technician ? selectedRepair.technician.name : 'Usuario desconocido'}
                             </p>
                             <p className="text-sm text-blue-600 truncate">
                               {selectedRepair.technician ? selectedRepair.technician.email : 'Sin información de contacto'}
                             </p>
                             <p className="text-sm text-blue-500 mt-1">
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
                         <div className="flex-shrink-0">
                           <Chip 
                             color={selectedRepair.technician?.email.includes('admin') || selectedRepair.technician?.name?.toLowerCase().includes('admin') ? 'warning' : 'primary'}
                             variant="flat" 
                             size="md"
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
                     
                     <div className="bg-gray-50 p-2 xs:p-3 rounded-lg">
                       <p className={`text-xs xs:text-sm font-medium ${textColors.tertiary} mb-1 xs:mb-2`}>Cliente</p>
                       <p className={`text-sm xs:text-base font-semibold ${textColors.primary}`}>{getCustomerName(selectedRepair.customers, selectedRepair.unregistered_customer_name)}</p>
                     </div>

                     <div className="bg-gray-50 p-2 xs:p-3 rounded-lg">
                       <p className={`text-xs xs:text-sm font-medium ${textColors.tertiary} mb-1 xs:mb-2`}>Dispositivo</p>
                       <p className={`text-sm xs:text-base font-semibold ${textColors.primary}`}>{getDeviceName(selectedRepair.devices, selectedRepair.unregistered_device_info)}</p>
                     </div>

                     <div className="bg-gray-50 p-2 xs:p-3 rounded-lg">
                       <p className={`text-xs xs:text-sm font-medium ${textColors.tertiary} mb-1 xs:mb-2`}>Problema Reportado</p>
                       <p className={`text-sm xs:text-base ${textColors.primary} leading-relaxed`}>{selectedRepair.problem_description}</p>
                     </div>

                     {selectedRepair.solution_description && (
                       <div className="bg-green-50 p-2 xs:p-3 rounded-lg border border-green-200">
                         <p className={`text-xs xs:text-sm font-medium ${textColors.tertiary} mb-1 xs:mb-2`}>Solución</p>
                         <p className={`text-sm xs:text-base ${textColors.primary} leading-relaxed`}>{selectedRepair.solution_description}</p>
                       </div>
                     )}

                     <div className="grid grid-cols-1 gap-3 xs:gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6">
                       <div className="bg-gray-50 p-2 xs:p-3 rounded-lg">
                         <p className={`text-xs xs:text-sm font-medium ${textColors.tertiary} mb-1`}>Costo</p>
                         <p className={`text-base xs:text-lg font-bold ${textColors.primary}`}>{formatCurrency(selectedRepair.cost)}</p>
                       </div>
                       <div className="bg-gray-50 p-2 xs:p-3 rounded-lg">
                         <p className={`text-xs xs:text-sm font-medium ${textColors.tertiary} mb-1`}>Estado</p>
                         <p className={`text-base xs:text-lg font-bold ${textColors.primary}`}>{selectedRepair.status}</p>
                       </div>
                     </div>
                   </div>
                  )}
                </ModalBody>
                <ModalFooter className="gap-2 xs:gap-3 flex flex-col xs:flex-row">
                  <Button 
                    color="default" 
                    variant="light" 
                    onPress={onDetailClose} 
                    size="sm"
                    className="w-full xs:w-auto xs:size-md"
                  >
                    Cerrar
                  </Button>
                  <Button 
                    color="secondary" 
                    startContent={<Printer className="h-3 w-3 xs:h-4 xs:w-4" />}
                    onPress={() => selectedRepair && handlePrintTicket(selectedRepair)}
                    isLoading={printLoading}
                    size="sm"
                    className="w-full xs:w-auto xs:size-md"
                  >
                    <span className="text-xs xs:text-sm">Imprimir Ticket</span>
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
            base: "max-h-[100vh] h-full w-full m-0 xs:max-h-[95vh] xs:h-auto xs:w-auto xs:my-1 xs:mx-1 sm:my-2 sm:mx-2 md:mx-4 lg:mx-6 xl:max-w-2xl",
            body: "max-h-[calc(100vh-120px)] xs:max-h-[70vh] sm:max-h-[60vh] overflow-y-auto p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6",
            header: "border-b border-gray-200 p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6",
            footer: "border-t border-gray-200 p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6"
          }}
        >
          <ModalContent>
            <ModalHeader>
              <h3 className={`text-lg md:text-xl font-bold ${textColors.primary}`}>Confirmar Eliminación</h3>
            </ModalHeader>
            <ModalBody>
              {selectedRepair && (
                <div className="space-y-3 md:space-y-4">
                  <p className={`text-sm md:text-base ${textColors.secondary}`}>{t('repairs.deleteMessage')}</p>
                  <div className="bg-red-50 p-3 md:p-4 rounded-lg">
                    <p className={`text-sm md:text-base font-medium ${textColors.primary}`}>{selectedRepair.title}</p>
                    <p className={`text-xs md:text-sm ${textColors.secondary}`}>Cliente: {getCustomerName(selectedRepair.customers, selectedRepair.unregistered_customer_name)}</p>
                    <p className={`text-xs md:text-sm ${textColors.secondary}`}>Dispositivo: {getDeviceName(selectedRepair.devices, selectedRepair.unregistered_device_info)}</p>
                  </div>
                  <p className="text-xs md:text-sm text-red-600">Esta acción no se puede deshacer.</p>
                </div>
              )}
            </ModalBody>
            <ModalFooter className="gap-2">
              <Button color="default" variant="light" onPress={onDeleteClose} size="sm">
                Cancelar
              </Button>
              <Button 
                color="danger" 
                onPress={confirmDeleteRepair}
                isLoading={deleteLoading}
                size="sm"
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
            base: "max-h-[100vh] h-full w-full m-0 xs:max-h-[95vh] xs:h-auto xs:w-auto xs:my-1 xs:mx-1 sm:my-2 sm:mx-2 md:mx-4 lg:mx-6 xl:max-w-3xl",
            body: "max-h-[calc(100vh-120px)] xs:max-h-[75vh] sm:max-h-[70vh] overflow-y-auto p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6",
            header: "border-b border-gray-200 p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6",
            footer: "border-t border-gray-200 p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6"
          }}
        >
          <ModalContent>
            <ModalHeader>
              <h2 className={`text-lg md:text-xl font-bold ${textColors.primary}`}>Actualizar Estado de la Reparación</h2>
            </ModalHeader>
            <ModalBody>
              {selectedRepair && (
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center gap-2">
                    <p className={`text-xs md:text-sm ${textColors.secondary}`}>Estado actual:</p>
                    <Chip color={getStatusColor(selectedRepair.status) as any} size="sm">
                      {getStatusLabel(selectedRepair.status)}
                    </Chip>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <p className={`text-xs md:text-sm font-medium ${textColors.primary}`}>Seleccionar nuevo estado:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {['received', 'diagnosed', 'in_progress', 'completed', 'delivered', 'cancelled'].map(status => (
                        <Button
                          key={status}
                          variant="bordered"
                          onClick={() => confirmUpdateStatus(status)}
                          size="md"
                          className={getModalButtonClass(status, selectedRepair.status === status)}
                        >
                          {getStatusLabel(status)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter className="gap-2">
              <Button variant="light" onClick={onStatusClose} size="sm">
                Cancelar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

      </div>
    </DashboardLayout>
  )
} 