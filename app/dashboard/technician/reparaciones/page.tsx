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
  Printer,
  MessageCircle,
  AlertCircle,
  Settings
} from 'lucide-react'
import PatternLock from '@/app/components/ui/PatternLock'
import DeviceTicket from '@/app/components/ui/DeviceTicket'
import {
  generateWhatsAppURL,
  generateRepairStatusMessage,
  formatDisplayPhone,
  isValidPhoneNumber
} from '@/lib/utils/country-codes'

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
  device_pin: string | null
  device_pattern: string | null
  unlock_type: string | null
  customers: {
    id: string
    name: string | null
    phone: string | null
    email: string | null
    anonymous_identifier: string | null
    customer_type: string
    customer_tax_id: string | null
    customer_tax_id_type: string | null
    cedula_dni: string | null
    country_code: string | null
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
  customer_tax_id: string | null
  customer_tax_id_type: string | null
  cedula_dni: string | null
  country_code: string | null
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
  unlock_type: string
  device_pin: string
  device_pattern: number[]
}

// Componente wrapper para DeviceTicket que obtiene la información de la organización
const DeviceTicketWrapper: React.FC<{
  repair: Repair
  customerName: string
}> = ({ repair, customerName }) => {
  const [orgInfo, setOrgInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrgInfo = async () => {
      try {
        const response = await fetch('/api/user/profile')
        const userData = await response.json()
        
        if (userData.success) {
          const orgResponse = await fetch(`/api/organizations/${userData.data.organization_id}`)
          const orgData = await orgResponse.json()
          
          if (orgData.success) {
            setOrgInfo(orgData.data)
          }
        }
      } catch (error) {
        console.error('Error fetching organization info:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrgInfo()
  }, [])

  if (loading) {
    return <div className="text-center py-4">Cargando vista previa...</div>
  }

  let devicePattern: number[] = []
  try {
    if (repair.device_pattern) {
      devicePattern = JSON.parse(repair.device_pattern)
    }
  } catch (error) {
    console.error('Error parsing device pattern:', error)
  }

  return (
    <DeviceTicket
      organizationInfo={{
        name: orgInfo?.name || 'TiendaFix',
        logo_url: orgInfo?.logo_url
      }}
      customerName={customerName}
      repairId={repair.id}
      unlockType={(repair.unlock_type as any) || 'none'}
      devicePin={repair.device_pin || ''}
      devicePattern={devicePattern}
    />
  )
}

export default function TechnicianRepairsPage() {
  const { formatCurrency, symbol } = useCurrency()
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
  const [repairToPrint, setRepairToPrint] = useState<Repair | null>(null)
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
    unregistered_customer_phone: '',
    unlock_type: 'none',
    device_pin: '',
    device_pattern: []
  })

  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure()
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure()
  const { isOpen: isStatusOpen, onOpen: onStatusOpen, onClose: onStatusClose } = useDisclosure()
  const { isOpen: isPrintModalOpen, onOpen: onPrintModalOpen, onClose: onPrintModalClose } = useDisclosure()

  useEffect(() => {
    fetchRepairs()
    fetchCustomers()
    // Eliminado: Ya no necesitamos cargar dispositivos
  }, [filtroEstado, busqueda])

  // Debug para el modal de impresión
  useEffect(() => {
    // Modal state tracking removed for production
  }, [isPrintModalOpen, repairToPrint])

  // Debug adicional para verificar cuando se abre el modal de detalles
  useEffect(() => {
    // Detail modal tracking removed for production
  }, [isDetailOpen, selectedRepair])

  // Debug adicional para verificar renders
  useEffect(() => {
    // Component render tracking removed for production
  })

  const fetchRepairs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filtroEstado !== 'todos') params.append('status', filtroEstado)
      if (busqueda) params.append('search', busqueda)

      const response = await fetch(`/api/repairs?${params}`)
      if (!response.ok) throw new Error('Error al cargar reparaciones')
      
      const data = await response.json()
      console.log('🔍 API Response - First repair:', data.data?.[0])
      console.log('🔍 API Response - Unlock fields for first repair:', {
        unlock_type: data.data?.[0]?.unlock_type,
        device_pin: data.data?.[0]?.device_pin,
        device_pattern: data.data?.[0]?.device_pattern
      })
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
          unlock_type: newRepair.unlock_type,
          device_pin: newRepair.device_pin,
          device_pattern: JSON.stringify(newRepair.device_pattern),
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
          unlock_type: newRepair.unlock_type,
          device_pin: newRepair.device_pin,
          device_pattern: JSON.stringify(newRepair.device_pattern),
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
        unregistered_customer_phone: '',
        unlock_type: 'none',
        device_pin: '',
        device_pattern: []
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

  const getStatusColor = (status: string): "default" | "warning" | "primary" | "success" | "danger" | "secondary" => {
    switch (status) {
      case 'received': return 'default'
      case 'diagnosed': return 'warning'
      case 'in_progress': return 'secondary'
      case 'completed': return 'success'
      case 'delivered': return 'success'
      case 'cancelled': return 'danger'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received': return Clock
      case 'diagnosed': return AlertTriangle
      case 'in_progress': return Settings
      case 'completed': return CheckCircle
      case 'delivered': return CheckCircle
      case 'cancelled': return AlertCircle
      default: return Clock
    }
  }

  const getStatusInfo = (status: string) => {
    return {
      color: getStatusColor(status),
      icon: getStatusIcon(status),
      label: getStatusLabel(status)
    }
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
        ${organizationInfo.logo_url ? `
        <div class="center" style="margin-bottom: 8px;">
          <img src="${organizationInfo.logo_url}" alt="Logo" style="max-width: 60mm; max-height: 30mm; object-fit: contain;" />
        </div>
        ` : ''}
        
        <div class="center bold large">
          ${organizationInfo.name || 'TIENDA DE REPARACIONES'}
        </div>
        
        ${organizationInfo.address ? `<div class="center">${organizationInfo.address}</div>` : ''}
        ${organizationInfo.phone ? `<div class="center">Tel: ${organizationInfo.phone}</div>` : ''}
        ${organizationInfo.email ? `<div class="center">${organizationInfo.email}</div>` : ''}
        ${organizationInfo.tax_id ? `<div class="center">${organizationInfo.tax_id_type || 'RUC'}: ${organizationInfo.tax_id}</div>` : ''}
        
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
          ${repair.customers?.cedula_dni ? `<div>Cédula/DNI: ${repair.customers.cedula_dni}</div>` : ''}
          ${repair.customers?.customer_tax_id ? `<div>${repair.customers.customer_tax_id_type || 'RUC'}: ${repair.customers.customer_tax_id}</div>` : ''}
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

  // Función para abrir el modal de impresión
  const handlePrintTicket = (repair: Repair) => {
    setRepairToPrint(repair)
    onPrintModalOpen()
  }

  // Función para imprimir ticket del dispositivo  
  const handlePrintDeviceTicket = (repair: Repair) => {
    // Simplemente cerrar el modal por ahora y usar la vista previa existente
    onPrintModalClose()
    
    // Mostrar mensaje al usuario sobre cómo imprimir
    setTimeout(() => {
      alert('Use Ctrl+P (o Cmd+P en Mac) en la vista previa del ticket del dispositivo para imprimir.')
    }, 100)
  }

  // Función para imprimir el ticket del cliente (tradicional)
  const handlePrintCustomerTicket = async (repair: Repair) => {
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

  // Función para enviar mensaje de WhatsApp
  const handleSendWhatsApp = async (repair: Repair) => {
    try {
      // Verificar que el cliente tenga teléfono y código de país
      if (!repair.customers?.phone || !repair.customers?.country_code) {
        alert('El cliente no tiene información de teléfono o código de país configurado.')
        return
      }

      // Validar que el número de teléfono sea válido
      if (!isValidPhoneNumber(repair.customers.phone)) {
        alert('El número de teléfono del cliente no es válido.')
        return
      }

      // Obtener información de la organización para el mensaje
      const organizationInfo = await fetchOrganizationInfo()
      
      // Generar el mensaje automático
      const customerName = getCustomerName(repair.customers, repair.unregistered_customer_name)
      const deviceInfo = getDeviceName(repair.devices, repair.unregistered_device_info)
      const organizationName = organizationInfo.name || 'TiendaFix'
      
      const message = generateRepairStatusMessage(
        customerName,
        deviceInfo,
        repair.status,
        organizationName
      )

      // Generar URL de WhatsApp
      const whatsappURL = generateWhatsAppURL(
        repair.customers.phone,
        repair.customers.country_code,
        message
      )

      // Abrir WhatsApp en una nueva ventana
      window.open(whatsappURL, '_blank')
      
    } catch (error) {
      console.error('Error al enviar WhatsApp:', error)
      alert('Error al generar el mensaje de WhatsApp. Por favor, intente nuevamente.')
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
              color={getStatusInfo(repair.status).color}
              variant="solid"
              size="sm"
              startContent={React.createElement(getStatusInfo(repair.status).icon, { className: "w-4 h-4" })}
            >
              {getStatusInfo(repair.status).label}
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
                          color={getStatusInfo(repair.status).color}
                          variant="solid"
                          size="sm"
                          startContent={React.createElement(getStatusInfo(repair.status).icon, { className: "w-4 h-4" })}
                        >
                          {getStatusInfo(repair.status).label}
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
            base: "max-h-[95vh] my-1 mx-1 sm:my-2 sm:mx-2 md:mx-6 w-full max-w-4xl",
            body: "max-h-[75vh] overflow-y-auto py-2 px-2 sm:py-4 sm:px-6",
            header: "border-b border-gray-200 pb-2 px-2 sm:pb-4 sm:px-6",
            footer: "border-t border-gray-200 pt-2 px-2 sm:pt-4 sm:px-6"
          }}
        >
          <ModalContent>
            <form onSubmit={handleCreateRepair}>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Nueva Reparación</h2>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">Crea una nueva reparación para un cliente</p>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
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
                      label={`Costo (${symbol})`}
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

                  {/* Campos de desbloqueo del dispositivo */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">
                      Información de Desbloqueo del Dispositivo
                    </h4>
                    
                    <Select
                      label="Tipo de Desbloqueo"
                      placeholder="Seleccionar tipo de bloqueo"
                      selectedKeys={new Set([newRepair.unlock_type])}
                      onSelectionChange={(keys) => {
                        const unlockType = Array.from(keys)[0] as string
                        setNewRepair(prev => ({ 
                          ...prev, 
                          unlock_type: unlockType,
                          device_pin: unlockType !== 'pin' ? '' : prev.device_pin,
                          device_pattern: unlockType !== 'pattern' ? [] : prev.device_pattern
                        }))
                      }}
                      variant="bordered"
                      size="md"
                      className="mb-4"
                      classNames={{
                        label: "text-gray-700 text-base",
                        value: "text-gray-900 text-base",
                        trigger: "border-gray-300 min-h-12",
                      }}
                    >
                      <SelectItem key="none">Sin bloqueo</SelectItem>
                      <SelectItem key="pin">PIN numérico</SelectItem>
                      <SelectItem key="pattern">Patrón de puntos</SelectItem>
                      <SelectItem key="fingerprint">Huella dactilar</SelectItem>
                      <SelectItem key="face">Reconocimiento facial</SelectItem>
                      <SelectItem key="other">Otro método</SelectItem>
                    </Select>

                    {newRepair.unlock_type === 'pin' && (
                      <Input
                        label="PIN del Dispositivo"
                        placeholder="Ej: 1234, 123456"
                        value={newRepair.device_pin}
                        onValueChange={(value) => setNewRepair(prev => ({ ...prev, device_pin: value }))}
                        variant="bordered"
                        size="md"
                        maxLength={20}
                        classNames={{
                          label: "text-gray-700 text-base",
                          input: "text-gray-900 placeholder:text-gray-500 text-base text-center",
                          inputWrapper: "border-gray-300 min-h-12",
                        }}
                      />
                    )}

                    {newRepair.unlock_type === 'pattern' && (
                      <div className="space-y-3">
                        <label className="block text-base font-medium text-gray-700">
                          Patrón de Desbloqueo
                        </label>
                        <div className="flex justify-center">
                          <PatternLock
                            value={newRepair.device_pattern}
                            onChange={(pattern) => setNewRepair(prev => ({ ...prev, device_pattern: pattern }))}
                            size="md"
                          />
                        </div>
                      </div>
                    )}
                  </div>
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
                     <Chip color={getStatusInfo(selectedRepair.status).color} variant="flat" size="sm">
                       {getStatusInfo(selectedRepair.status).label}
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

                 {/* Información de desbloqueo */}
                 {selectedRepair.unlock_type && selectedRepair.unlock_type !== 'none' && (
                   <div>
                     <p className="text-xs md:text-sm font-medium text-gray-500 mb-2">Información de Desbloqueo</p>
                     <div className="space-y-2">
                       <div>
                         <span className="text-xs font-medium text-gray-600">Tipo: </span>
                         <Chip size="sm" variant="flat" color="secondary">
                           {selectedRepair.unlock_type === 'pin' ? 'PIN' :
                            selectedRepair.unlock_type === 'pattern' ? 'Patrón' :
                            selectedRepair.unlock_type === 'fingerprint' ? 'Huella' :
                            selectedRepair.unlock_type === 'face' ? 'Facial' :
                            'Otro'}
                         </Chip>
                       </div>
                       
                       {selectedRepair.unlock_type === 'pin' && selectedRepair.device_pin && (
                         <div>
                           <span className="text-xs font-medium text-gray-600">PIN: </span>
                           <span className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                             {selectedRepair.device_pin}
                           </span>
                         </div>
                       )}
                       
                       {selectedRepair.unlock_type === 'pattern' && selectedRepair.device_pattern && (
                         <div>
                           <span className="text-xs font-medium text-gray-600 block mb-2">Patrón:</span>
                           <div className="flex justify-start">
                             <PatternLock
                               value={
                                 (() => {
                                   try {
                                     return JSON.parse(selectedRepair.device_pattern)
                                   } catch {
                                     return []
                                   }
                                 })()
                               }
                               size="sm"
                               disabled={true}
                             />
                           </div>
                         </div>
                       )}
                     </div>
                   </div>
                 )}

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
                 
                 {/* Botón de WhatsApp */}

               </div>
              )}
            </ModalBody>
            <ModalFooter className="gap-2">
              <Button color="default" variant="light" onPress={onDetailClose} size="sm">
                Cerrar
              </Button>
              
              {/* Botón de WhatsApp - Solo si el cliente tiene teléfono registrado */}
              {selectedRepair?.customers?.phone && selectedRepair?.customers?.country_code && (
                <Button 
                  className="bg-green-500 hover:bg-green-600 text-white"
                  startContent={<MessageCircle className="w-3 h-3 md:w-4 md:h-4" />}
                  onPress={() => selectedRepair && handleSendWhatsApp(selectedRepair)}
                  size="sm"
                >
                  Enviar WhatsApp
                </Button>
              )}
              
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
                    <Chip color={getStatusInfo(selectedRepair.status).color} size="sm">
                      {getStatusInfo(selectedRepair.status).label}
                    </Chip>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Seleccionar nuevo estado:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['received', 'diagnosed', 'in_progress', 'completed', 'delivered', 'cancelled'].map(status => (
                        <Button
                          key={status}
                          variant={selectedRepair.status === status ? "solid" : "bordered"}
                          color={getStatusInfo(status).color}
                          onPress={() => confirmUpdateStatus(status)}
                          className="w-full"
                          size="sm"
                          isLoading={updateLoading && selectedRepair.status !== status}
                        >
                          {getStatusInfo(status).label}
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

        {/* Modal de selección de tickets */}
        <Modal 
          isOpen={isPrintModalOpen} 
          onClose={onPrintModalClose}
          size="3xl"
          scrollBehavior="inside"
          classNames={{
            wrapper: "z-[1000]",
            backdrop: "z-[999]",
            base: "max-h-[95vh] my-2 mx-2 sm:mx-6 bg-white border border-gray-200",
            body: "max-h-[75vh] overflow-y-auto py-6",
            header: "border-b border-gray-200 pb-4",
            footer: "border-t border-gray-200 pt-4"
          }}
        >
          <ModalContent>
            <ModalHeader>
              <h2 className="text-xl font-bold text-gray-800">
                Opciones de Impresión - Reparación #{repairToPrint?.id.slice(0, 8).toUpperCase()}
              </h2>
            </ModalHeader>
            <ModalBody>
              {repairToPrint && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Ticket del Cliente */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <ClipboardList className="w-5 h-5" />
                        Ticket del Cliente
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Ticket completo con todos los detalles para el cliente
                      </p>
                      <Button
                        color="primary"
                        onPress={() => {
                          handlePrintCustomerTicket(repairToPrint)
                          onPrintModalClose()
                        }}
                        isLoading={printLoading}
                        className="w-full"
                        startContent={<Printer className="w-4 h-4" />}
                      >
                        Imprimir Ticket Cliente
                      </Button>
                    </div>

                    {/* Ticket del Dispositivo */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Smartphone className="w-5 h-5" />
                        Ticket del Dispositivo
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Ticket horizontal para pegar al dispositivo con PIN/patrón
                      </p>
                      <Button
                        color="secondary"
                        onPress={() => repairToPrint && handlePrintDeviceTicket(repairToPrint)}
                        className="w-full"
                        startContent={<Smartphone className="w-4 h-4" />}
                      >
                        Ver/Imprimir Ticket Dispositivo
                      </Button>
                    </div>
                  </div>

                  {/* Vista previa del ticket del dispositivo */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Vista Previa - Ticket del Dispositivo
                    </h3>
                                         <DeviceTicketWrapper
                       repair={repairToPrint}
                       customerName={getCustomerName(repairToPrint.customers, repairToPrint.unregistered_customer_name)}
                     />
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button 
                color="danger" 
                variant="flat" 
                onPress={onPrintModalClose}
              >
                Cerrar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

      </div>
    </TechnicianDashboardLayout>
  )
}