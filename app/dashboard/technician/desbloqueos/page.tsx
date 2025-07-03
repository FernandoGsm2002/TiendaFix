'use client'

import React, { useState, useEffect } from 'react'
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
  Button,
  Textarea
} from '@heroui/react'
import FormField from '@/app/components/ui/FormField'
import { textColors } from '@/lib/utils/colors'
import { useCurrency } from '@/lib/contexts/TranslationContext'
import { 
  Search, 
  Eye, 
  Edit,
  Check,
  Unlock, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  User,
  Play,
  Plus,
  CheckCircle2,
  X,
  DollarSign
} from 'lucide-react'

interface Customer {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  anonymous_identifier: string | null
  customer_type: string
}

interface UnlockService {
  id: string
  customer_name: string
  customer_phone?: string
  brand: string
  model: string
  imei: string
  carrier: string
  country: string
  service_type: string
  status: string
  price: number
  cost?: number
  estimated_time: string
  notes?: string
  assigned_technician_id?: string
  created_at: string
  updated_at: string
  completion_date?: string
}

export default function TechnicianUnlocksPage() {
  const { formatCurrency } = useCurrency()
  const [unlocks, setUnlocks] = useState<UnlockService[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroMarca, setFiltroMarca] = useState('todas')
  const [selectedUnlock, setSelectedUnlock] = useState<UnlockService | null>(null)
  const [progressNotes, setProgressNotes] = useState('')
  const [statusLoading, setStatusLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  
  const [formData, setFormData] = useState({
    unlock_type: '',
    custom_unlock_type: '',
    brand: '',
    model: '',
    imei: '',
    serial_number: '',
    customer_id: '',
    cost: 0,
    provider: '',
    notes: ''
  })

  const unlockTypes = [
    { value: 'mdm', label: 'MDM' },
    { value: 'frp', label: 'FRP' },
    { value: 'f4', label: 'F4' },
    { value: 'mi_account', label: 'MI ACCOUNT' },
    { value: 'icloud_bypass', label: 'ICLOUD BYPASS' },
    { value: 'custom', label: 'Personalizado' }
  ]

  const statusOptions = [
    { value: 'pending', label: 'Pendiente', color: 'warning', icon: Clock },
    { value: 'in_progress', label: 'En Proceso', color: 'primary', icon: Play },
    { value: 'completed', label: 'Completado', color: 'success', icon: CheckCircle2 },
    { value: 'failed', label: 'Fallido', color: 'danger', icon: X }
  ]

  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure()
  const { isOpen: isProgressOpen, onOpen: onProgressOpen, onClose: onProgressClose } = useDisclosure()
  const { isOpen: isNewUnlockOpen, onOpen: onNewUnlockOpen, onClose: onNewUnlockClose } = useDisclosure()
  const { isOpen: isStatusOpen, onOpen: onStatusOpen, onOpenChange: onStatusOpenChange } = useDisclosure()


  // Cargar desbloqueos asignados al técnico
  useEffect(() => {
    fetchUnlocks()
    fetchCustomers()
  }, [page, filtroEstado, filtroMarca, busqueda])

  const fetchUnlocks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })
      
      if (filtroEstado !== 'todos') params.append('status', filtroEstado)
      if (busqueda) params.append('search', busqueda)

      // Usar la API principal de unlocks que filtra automáticamente por usuario
      const response = await fetch(`/api/unlocks?${params}`)
      if (!response.ok) throw new Error('Error al cargar desbloqueos')
      
      const data = await response.json()
      // Transformar los datos del formato owner al formato que espera la interfaz del técnico
      const transformedUnlocks = (data.data || []).map((unlock: any) => ({
        id: unlock.id,
        customer_name: unlock.customers?.name || 'Cliente General',
        customer_phone: unlock.customers?.phone || '',
        brand: unlock.brand,
        model: unlock.model,
        imei: unlock.imei || '',
        carrier: '', // Campo legacy
        country: 'Peru', // Campo legacy
        service_type: unlock.unlock_type,
        status: unlock.status,
        price: unlock.cost,
        cost: unlock.cost,
        estimated_time: '24-48 horas', // Campo legacy
        notes: unlock.notes || '',
        assigned_technician_id: unlock.created_by,
        created_at: unlock.created_at,
        updated_at: unlock.updated_at,
        completion_date: unlock.completion_time
      }))
      
      setUnlocks(transformedUnlocks)
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error fetching unlocks:', error)
      setUnlocks([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      const result = await response.json()
      if (result.success) {
        setCustomers(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdateLoading(true)
    
    try {
      // Usar la misma lógica que el owner - enviar directamente a la API principal
      const ownerData = {
        unlock_type: formData.unlock_type === 'custom' ? formData.custom_unlock_type : formData.unlock_type,
        brand: formData.brand,
        model: formData.model,
        imei: formData.imei,
        serial_number: formData.serial_number,
        customer_id: formData.customer_id === 'general' ? null : formData.customer_id,
        cost: formData.cost,
        provider: formData.provider,
        notes: formData.notes
      }

      // Usar la API principal de unlocks en lugar de la específica del técnico
      const response = await fetch('/api/unlocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ownerData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear el desbloqueo')
      }

      // Resetear formulario
      setFormData({
        unlock_type: '',
        custom_unlock_type: '',
        brand: '',
        model: '',
        imei: '',
        serial_number: '',
        customer_id: '',
        cost: 0,
        provider: '',
        notes: ''
      })
      
      onNewUnlockClose()
      fetchUnlocks()
    } catch (error) {
      console.error('Error creating unlock:', error)
      alert(error instanceof Error ? error.message : 'Error al crear el desbloqueo')
    } finally {
      setUpdateLoading(false)
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'Pendiente',
      'in_progress': 'En Proceso',
      'waiting_confirmation': 'Esperando Confirmación',
      'completed': 'Completado',
      'failed': 'Fallido',
      'cancelled': 'Cancelado'
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      'pending': 'warning',
      'in_progress': 'primary',
      'waiting_confirmation': 'secondary',
      'completed': 'success',
      'failed': 'danger',
      'cancelled': 'default'
    }
    return colors[status] || 'default'
  }

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'Factory Unlock': 'Desbloqueo de Fábrica',
      'Network Unlock': 'Desbloqueo de Red',
      'Bootloader Unlock': 'Desbloqueo de Bootloader',
      'FRP Unlock': 'Desbloqueo FRP',
      'SIM Unlock': 'Desbloqueo SIM'
    }
    return labels[type] || type
  }

  const getStatusInfo = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const updateUnlockStatus = async (unlockId: string, newStatus: string, completionTime?: string) => {
    try {
      setStatusLoading(true)
      
      const response = await fetch(`/api/unlocks/${unlockId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          completion_time: completionTime
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar estado')
      }

      onStatusOpenChange()
      fetchUnlocks()

    } catch (error) {
      console.error('Error updating status:', error)
      alert(error instanceof Error ? error.message : 'Error al actualizar estado')
    } finally {
      setStatusLoading(false)
    }
  }

  const filteredUnlocks = unlocks.filter(unlock => {
    const matchesSearch = unlock.customer_name.toLowerCase().includes(busqueda.toLowerCase()) ||
                         unlock.brand.toLowerCase().includes(busqueda.toLowerCase()) ||
                         unlock.model.toLowerCase().includes(busqueda.toLowerCase()) ||
                         unlock.imei.includes(busqueda)
    const matchesStatus = filtroEstado === 'todos' || unlock.status === filtroEstado
    const matchesBrand = filtroMarca === 'todas' || unlock.brand.toLowerCase() === filtroMarca.toLowerCase()
    return matchesSearch && matchesStatus && matchesBrand
  })

  const stats = {
    total: unlocks.length,
    pendientes: unlocks.filter(u => u.status === 'pending').length,
    enProceso: unlocks.filter(u => u.status === 'in_progress').length,
    completados: unlocks.filter(u => u.status === 'completed').length,
    totalIngresos: unlocks.filter(u => u.status === 'completed').reduce((sum, u) => sum + u.price, 0)
  }

  const uniqueBrands = Array.from(new Set(unlocks.map(u => u.brand)))

  const handleViewDetails = (unlock: UnlockService) => {
    setSelectedUnlock(unlock)
    onDetailOpen()
  }

  const handleStartProgress = (unlock: UnlockService) => {
    setSelectedUnlock(unlock)
    setProgressNotes('')
    onProgressOpen()
  }

  const handleStatusChange = (unlock: UnlockService) => {
    setSelectedUnlock(unlock)
    onStatusOpen()
  }

  const handleCompleteUnlock = (unlock: UnlockService) => {
    updateUnlockStatus(unlock.id, 'completed', new Date().toISOString())
  }

  const submitProgress = () => {
    if (!selectedUnlock) return
    
    let newStatus = selectedUnlock.status
    if (selectedUnlock.status === 'pending') {
      newStatus = 'in_progress'
    }
    
    updateUnlockStatus(selectedUnlock.id, newStatus)
    onProgressClose()
  }



  if (loading) {
    return (
      <TechnicianDashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardBody className="p-6">
                  <Skeleton className="h-24 w-full rounded" />
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </TechnicianDashboardLayout>
    )
  }

  return (
    <TechnicianDashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Servicios de Desbloqueo
            </h1>
            <p className="text-gray-600 font-medium">
              Gestiona los desbloqueos de dispositivos móviles • Panel Técnico
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500 font-medium">Sistema operativo</span>
            </div>
          </div>
          <Button
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onPress={onNewUnlockOpen}
            className="shadow-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 font-semibold"
          >
            Nuevo Desbloqueo
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="hover:scale-105 transition-all duration-300 border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100">
            <CardBody className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Unlock className="w-5 h-5 text-white" />
                </div>
                <Chip color="primary" variant="flat" className="font-semibold">Total</Chip>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-700">Total de Desbloqueos</p>
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
                <p className="text-2xl font-bold text-orange-800">{stats.pendientes}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-100">
            <CardBody className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <Chip color="primary" variant="flat" className="font-semibold">Proceso</Chip>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-700">En Proceso</p>
                <p className="text-2xl font-bold text-blue-800">{stats.enProceso}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-100">
            <CardBody className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <Chip color="success" variant="flat" className="font-semibold">Completados</Chip>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-700">Completados</p>
                <p className="text-2xl font-bold text-green-800">{stats.completados}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-100">
            <CardBody className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <Chip color="success" variant="flat" className="font-semibold">Ingresos</Chip>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-emerald-700">Ingresos Totales</p>
                <p className="text-2xl font-bold text-emerald-800">{formatCurrency(stats.totalIngresos)}</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-8 shadow-xl border-0 bg-gradient-to-r from-white to-gray-50">
          <CardBody className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1 w-full">
              <Input
                  placeholder="Buscar por cliente, IMEI, marca, modelo..."
                value={busqueda}
                onValueChange={setBusqueda}
                  startContent={
                    <div className="p-1 rounded-md bg-gradient-to-br from-blue-100 to-purple-100">
                      <Search className="w-4 h-4 text-blue-600" />
                    </div>
                  }
                variant="bordered"
                  size="lg"
                  classNames={{
                    input: "text-gray-900 placeholder:text-gray-500",
                    inputWrapper: "border-gray-300 hover:border-blue-400 focus-within:border-blue-500 bg-white shadow-md",
                  }}
              />
              </div>
              <div className="w-full md:w-60">
              <Select
                  placeholder="Filtrar por Estado"
                selectedKeys={new Set([filtroEstado])}
                onSelectionChange={(keys) => setFiltroEstado(Array.from(keys)[0] as string)}
                variant="bordered"
                  size="lg"
                  classNames={{
                    trigger: "text-gray-900 border-gray-300 hover:border-blue-400 bg-white shadow-md",
                    value: "text-gray-900",
                    popoverContent: "bg-white shadow-2xl border border-gray-200",
                  }}
              >
                  <SelectItem key="todos" className="text-gray-900">Todos los estados</SelectItem>
                                  <SelectItem key="pending" className="text-gray-900">Pendiente</SelectItem>
                <SelectItem key="in_progress" className="text-gray-900">En Proceso</SelectItem>
                <SelectItem key="completed" className="text-gray-900">Completado</SelectItem>
                  <SelectItem key="failed" className="text-gray-900">Fallido</SelectItem>
              </Select>
              </div>
              <div className="w-full md:w-60">
              <Select
                  placeholder="Filtrar por Marca"
                selectedKeys={new Set([filtroMarca])}
                onSelectionChange={(keys) => setFiltroMarca(Array.from(keys)[0] as string)}
                variant="bordered"
                  size="lg"
                  classNames={{
                    trigger: "text-gray-900 border-gray-300 hover:border-blue-400 bg-white shadow-md",
                    value: "text-gray-900",
                    popoverContent: "bg-white shadow-2xl border border-gray-200",
                  }}
                items={[{key: 'todas', label: 'Todas las marcas'}, ...uniqueBrands.map(brand => ({key: brand.toLowerCase(), label: brand}))]}
              >
                  {(item) => <SelectItem key={item.key} className="text-gray-900">{item.label}</SelectItem>}
              </Select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Vista Desktop - Tabla */}
        <div className="hidden lg:block">
          <Card className="shadow-xl border-0 bg-white">
            <CardBody className="p-0">
              <Table 
                aria-label="Tabla de desbloqueos" 
                classNames={{
                  wrapper: "min-h-[400px] shadow-none",
                  th: "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-bold text-sm border-b border-gray-200",
                  td: "py-4 border-b border-gray-100"
                }}
              >
                <TableHeader>
                  <TableColumn>CLIENTE & DISPOSITIVO</TableColumn>
                  <TableColumn>IMEI & OPERADORA</TableColumn>
                  <TableColumn>SERVICIO</TableColumn>
                  <TableColumn>ESTADO</TableColumn>
                  <TableColumn>PRECIO</TableColumn>
                  <TableColumn>TIEMPO ESTIMADO</TableColumn>
                  <TableColumn>FECHA</TableColumn>
                  <TableColumn>ACCIONES</TableColumn>
                </TableHeader>
                <TableBody>
                  {filteredUnlocks.map((unlock) => (
                    <TableRow key={unlock.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            icon={<Smartphone className="w-4 h-4" />}
                            classNames={{
                              base: "bg-gradient-to-br from-purple-400 to-indigo-600",
                              icon: "text-white"
                            }}
                          />
                          <div>
                            <p className={`font-semibold ${textColors.primary}`}>{unlock.customer_name}</p>
                            <p className={`text-sm ${textColors.muted}`}>
                              {unlock.brand} {unlock.model}
                            </p>
                            {unlock.customer_phone && (
                              <p className={`text-xs ${textColors.muted}`}>{unlock.customer_phone}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className={`text-sm font-mono ${textColors.primary}`}>{unlock.imei}</p>
                          <p className={`text-sm ${textColors.secondary}`}>{unlock.carrier}</p>
                          <p className={`text-xs ${textColors.muted}`}>{unlock.country}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          color="secondary"
                          variant="flat"
                          size="sm"
                        >
                          {getServiceTypeLabel(unlock.service_type)}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={getStatusColor(unlock.status)}
                          variant="flat"
                          size="sm"
                        >
                          {getStatusLabel(unlock.status)}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <p className={`font-semibold ${textColors.primary}`}>
                          {formatCurrency(unlock.price)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className={`text-sm ${textColors.secondary}`}>
                          {unlock.estimated_time}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className={`text-sm ${textColors.secondary}`}>
                            {formatDate(unlock.created_at)}
                          </p>
                          {unlock.completion_date && (
                            <p className={`text-xs ${textColors.muted}`}>
                              Completado: {formatDate(unlock.completion_date)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Tooltip 
                            content="Ver detalles"
                            classNames={{
                              content: "bg-gray-900 text-white"
                            }}
                          >
                            <Button 
                              isIconOnly 
                              size="sm" 
                              variant="flat"
                              color="primary"
                              onPress={() => handleViewDetails(unlock)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                          
                          <Tooltip 
                            content="Cambiar estado"
                            classNames={{
                              content: "bg-gray-900 text-white"
                            }}
                          >
                              <Button 
                                isIconOnly 
                                size="sm" 
                              variant="flat"
                              color="warning"
                              onPress={() => handleStatusChange(unlock)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Tooltip>

                          {unlock.status === 'in_progress' && (
                            <Tooltip 
                              content="Marcar como completado"
                              classNames={{
                                content: "bg-gray-900 text-white"
                              }}
                            >
                              <Button 
                                isIconOnly 
                                size="sm"
                                variant="flat" 
                                color="success" 
                                onPress={() => handleCompleteUnlock(unlock)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
                <Card key={i} className="h-64">
                  <CardBody className="p-4">
                    <Skeleton className="h-full w-full rounded" />
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : filteredUnlocks.length === 0 ? (
            <Card className="shadow-xl border-0 bg-white">
              <CardBody className="p-8">
                <div className="text-center">
                  <Unlock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay servicios de desbloqueo</h3>
                  <p className="text-gray-600">
                    {busqueda || filtroEstado !== 'todos' || filtroMarca !== 'todas'
                      ? 'No se encontraron servicios con los filtros aplicados.'
                      : 'Aún no has creado servicios de desbloqueo. Haz clic en "Nuevo Desbloqueo" para comenzar.'}
                  </p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredUnlocks.map((unlock) => (
                <Card key={unlock.id} className="shadow-xl hover:shadow-2xl transition-shadow">
                  <CardBody className="p-0">
                    {/* Header del Card */}
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 border-b">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar
                          icon={<Unlock className="w-4 h-4" />}
                          classNames={{
                            base: "bg-gradient-to-br from-purple-400 to-indigo-600",
                            icon: "text-white"
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 truncate text-sm md:text-base">
                            {getServiceTypeLabel(unlock.service_type)}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {formatDate(unlock.created_at)}
                          </p>
                        </div>
                      </div>
                      <Chip
                        color={getStatusColor(unlock.status)}
                        variant="flat"
                        size="sm"
                      >
                        {getStatusLabel(unlock.status)}
                      </Chip>
                    </div>

                    {/* Cliente */}
                    <div className="bg-green-50 p-3 border-b">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-green-800">CLIENTE</span>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {unlock.customer_name}
                      </p>
                      {unlock.customer_phone && (
                        <p className="text-xs text-gray-600">{unlock.customer_phone}</p>
                      )}
                    </div>

                    {/* Dispositivo */}
                    <div className="bg-blue-50 p-3 border-b">
                      <div className="flex items-center gap-2 mb-1">
                        <Smartphone className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-800">DISPOSITIVO</span>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {unlock.brand} {unlock.model}
                      </p>
                      <p className="text-xs text-gray-600 font-mono">
                        IMEI: {unlock.imei}
                      </p>
                    </div>

                    {/* Operadora */}
                    <div className="bg-purple-50 p-3 border-b">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-medium text-purple-800">OPERADORA & TIEMPO</span>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {unlock.carrier} - {unlock.country}
                      </p>
                      <p className="text-xs text-gray-600">
                        Tiempo estimado: {unlock.estimated_time}
                      </p>
                    </div>

                    {/* Precio */}
                    <div className="bg-gray-50 p-3 border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-500">PRECIO</p>
                          <p className="font-bold text-lg text-green-600">
                            {formatCurrency(unlock.price)}
                          </p>
                        </div>
                        {unlock.completion_date && (
                          <div className="text-right">
                            <p className="text-xs font-medium text-gray-500">COMPLETADO</p>
                            <p className="text-xs text-gray-700">
                              {formatDate(unlock.completion_date)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="p-3">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="flat" 
                          color="primary"
                          className="flex-1"
                          startContent={<Eye className="w-4 h-4" />}
                          onPress={() => handleViewDetails(unlock)}
                        >
                          Ver
                        </Button>
                        <Button 
                          size="sm" 
                          variant="flat" 
                          color="warning"
                          className="flex-1"
                          startContent={<Edit className="w-4 h-4" />}
                          onPress={() => handleStatusChange(unlock)}
                        >
                          Estado
                        </Button>
                        {unlock.status === 'in_progress' && (
                          <Button 
                            size="sm" 
                            variant="flat" 
                            color="success"
                            className="flex-1"
                            startContent={<Check className="w-4 h-4" />}
                            onPress={() => handleCompleteUnlock(unlock)}
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
        {!loading && filteredUnlocks.length === 0 && (
          <div className="hidden lg:block">
            <Card className="shadow-xl border-0 bg-white">
              <CardBody className="p-0">
                <div className="text-center py-12">
                  <Unlock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay servicios de desbloqueo</h3>
                  <p className="text-gray-600">
                    {busqueda || filtroEstado !== 'todos' || filtroMarca !== 'todas'
                      ? 'No se encontraron servicios con los filtros aplicados.'
                      : 'Aún no has creado servicios de desbloqueo. Haz clic en "Nuevo Desbloqueo" para comenzar.'}
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Modal para ver detalles */}
        <Modal isOpen={isDetailOpen} onOpenChange={onDetailClose} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h2 className={`text-xl font-bold ${textColors.primary}`}>Detalles del Desbloqueo</h2>
                </ModalHeader>
                <ModalBody>
                  {selectedUnlock && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className={`text-sm font-medium ${textColors.secondary}`}>Cliente</p>
                          <p className={`text-base ${textColors.primary}`}>{selectedUnlock.customer_name}</p>
                          {selectedUnlock.customer_phone && (
                            <p className={`text-sm ${textColors.muted}`}>{selectedUnlock.customer_phone}</p>
                          )}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${textColors.secondary}`}>Dispositivo</p>
                          <p className={`text-base ${textColors.primary}`}>
                            {selectedUnlock.brand} {selectedUnlock.model}
                          </p>
                          <p className={`text-sm ${textColors.muted}`}>IMEI: {selectedUnlock.imei}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className={`text-sm font-medium ${textColors.secondary}`}>Operadora</p>
                          <p className={`text-base ${textColors.primary}`}>{selectedUnlock.carrier}</p>
                          <p className={`text-sm ${textColors.muted}`}>{selectedUnlock.country}</p>
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${textColors.secondary}`}>Tipo de Servicio</p>
                          <Chip color="secondary" variant="flat">
                            {getServiceTypeLabel(selectedUnlock.service_type)}
                          </Chip>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className={`text-sm font-medium ${textColors.secondary}`}>Estado</p>
                          <Chip color={getStatusColor(selectedUnlock.status)} variant="flat">
                            {getStatusLabel(selectedUnlock.status)}
                          </Chip>
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${textColors.secondary}`}>Precio</p>
                          <p className={`text-base font-semibold ${textColors.primary}`}>
                            {formatCurrency(selectedUnlock.price)}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${textColors.secondary}`}>Tiempo Estimado</p>
                          <p className={`text-base ${textColors.primary}`}>{selectedUnlock.estimated_time}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className={`text-sm font-medium ${textColors.secondary}`}>Fecha de solicitud</p>
                          <p className={`text-base ${textColors.primary}`}>{formatDate(selectedUnlock.created_at)}</p>
                        </div>
                        {selectedUnlock.completion_date && (
                          <div>
                            <p className={`text-sm font-medium ${textColors.secondary}`}>Fecha de completado</p>
                            <p className={`text-base ${textColors.primary}`}>
                              {formatDate(selectedUnlock.completion_date)}
                            </p>
                          </div>
                        )}
                      </div>

                      {selectedUnlock.notes && (
                        <div>
                          <p className={`text-sm font-medium ${textColors.secondary}`}>Notas</p>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className={`text-sm ${textColors.primary}`}>{selectedUnlock.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Cerrar
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Modal para actualizar progreso */}
        <Modal isOpen={isProgressOpen} onOpenChange={onProgressClose} size="lg">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h2 className={`text-xl font-bold ${textColors.primary}`}>Actualizar Progreso</h2>
                  {selectedUnlock && (
                    <p className={`text-sm ${textColors.secondary}`}>
                      {selectedUnlock.brand} {selectedUnlock.model} - {selectedUnlock.customer_name}
                    </p>
                  )}
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    <Textarea
                      label="Notas de progreso"
                      placeholder="Describe el avance del desbloqueo, herramientas utilizadas, tiempo invertido, etc."
                      value={progressNotes}
                      onValueChange={setProgressNotes}
                      minRows={4}
                      variant="bordered"
                    />
                    {selectedUnlock && selectedUnlock.status === 'pending' && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          💡 Al guardar, este desbloqueo será marcado como "En Proceso"
                        </p>
                      </div>
                    )}
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Cancelar
                  </Button>
                  <Button 
                    color="primary" 
                    onPress={submitProgress}
                    isLoading={updateLoading}
                    isDisabled={!progressNotes.trim()}
                  >
                    Guardar Progreso
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Modal para cambiar estado */}
        <Modal isOpen={isStatusOpen} onOpenChange={onStatusOpenChange} size="lg">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h2 className={`text-xl font-bold ${textColors.primary}`}>Cambiar Estado del Desbloqueo</h2>
                  {selectedUnlock && (
                    <p className={textColors.secondary}>
                      {selectedUnlock.brand} {selectedUnlock.model} - {getServiceTypeLabel(selectedUnlock.service_type)}
                    </p>
                  )}
                </ModalHeader>
                <ModalBody>
                  <div className="grid grid-cols-2 gap-4">
                    {statusOptions.map((status) => (
                      <Button
                        key={status.value}
                        variant="flat"
                        color={status.color as any}
                        size="lg"
                        startContent={React.createElement(status.icon, { className: "w-5 h-5" })}
                        onPress={() => {
                          if (selectedUnlock) {
                            const completionTime = status.value === 'completed' ? new Date().toISOString() : undefined
                            updateUnlockStatus(selectedUnlock.id, status.value, completionTime)
                          }
                        }}
                        isLoading={statusLoading}
                        className="h-16 flex-col"
                      >
                        <span className="font-semibold">{status.label}</span>
                        <span className="text-xs opacity-70">
                          {status.value === 'pending' && 'En espera de inicio'}
                          {status.value === 'in_progress' && 'Trabajo en progreso'}
                          {status.value === 'completed' && 'Trabajo finalizado'}
                          {status.value === 'failed' && 'No se pudo completar'}
                        </span>
                      </Button>
                    ))}
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Cancelar
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Modal para nuevo desbloqueo */}
        <Modal isOpen={isNewUnlockOpen} onClose={onNewUnlockClose} size="3xl">
          <ModalContent>
            <ModalHeader>
              <h2 className={`text-xl font-bold ${textColors.primary}`}>Nuevo Servicio de Desbloqueo</h2>
              <p className={textColors.secondary}>Complete la información del servicio</p>
            </ModalHeader>
            <ModalBody>
              <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Tipo de Desbloqueo"
                    name="unlock_type"
                    type="select"
                    value={formData.unlock_type}
                    onChange={(value) => setFormData(prev => ({ ...prev, unlock_type: value }))}
                    options={unlockTypes.map(type => ({ value: type.value, label: type.label }))}
                    required
                      />
                  {formData.unlock_type === 'custom' && (
                    <FormField
                      label="Nombre Personalizado"
                      name="custom_unlock_type"
                      type="text"
                      placeholder="Ej: Samsung Factory Unlock"
                      value={formData.custom_unlock_type}
                      onChange={(value) => setFormData(prev => ({ ...prev, custom_unlock_type: value }))}
                      required
                      />
                  )}
                    </div>
                <FormField
                  label="Cliente"
                  name="customer_id"
                  type="select"
                  value={formData.customer_id}
                  onChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}
                  options={[
                    { value: 'general', label: 'Cliente General (No recurrente)' },
                    ...customers.map(c => ({ value: c.id, label: c.name || c.anonymous_identifier || 'Anónimo' }))
                  ]}
                  required
                />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Marca"
                    name="brand"
                    type="text"
                    placeholder="Ej: Apple"
                    value={formData.brand}
                    onChange={(value) => setFormData(prev => ({ ...prev, brand: value }))}
                    required
                      />
                  <FormField
                    label="Modelo"
                    name="model"
                    type="text"
                    placeholder="Ej: iPhone 14"
                    value={formData.model}
                    onChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
                    required
                      />
                    </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                      label="IMEI"
                    name="imei"
                    type="text"
                    placeholder="Ej: 123456789012345"
                    value={formData.imei}
                    onChange={(value) => setFormData(prev => ({ ...prev, imei: value }))}
                  />
                  <FormField
                    label="Número de Serie"
                    name="serial_number"
                    type="text"
                    placeholder="Ej: C02X1234J1WV"
                    value={formData.serial_number}
                    onChange={(value) => setFormData(prev => ({ ...prev, serial_number: value }))}
                  />
                    </div>
                <FormField
                  label="Costo"
                  name="cost"
                        type="number"
                        placeholder="0.00"
                  value={formData.cost.toString()}
                  onChange={(value) => setFormData(prev => ({ ...prev, cost: parseFloat(value) || 0 }))}
                  required
                      />
                <FormField
                  label="Notas"
                  name="notes"
                  type="textarea"
                  placeholder="Notas adicionales..."
                  value={formData.notes}
                  onChange={(value) => setFormData(prev => ({ ...prev, notes: value }))}
                    />
                <div className="flex justify-end gap-2 pt-4">
                  <Button color="danger" variant="light" onPress={onNewUnlockClose}>
                    Cancelar
                  </Button>
                  <Button color="primary" type="submit" isLoading={updateLoading}>
                    Registrar Desbloqueo
                  </Button>
                </div>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>
      </div>
    </TechnicianDashboardLayout>
  )
} 