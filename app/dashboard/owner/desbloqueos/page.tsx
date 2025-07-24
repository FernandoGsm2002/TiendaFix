'use client'

import React, { useState, useEffect, useCallback } from 'react'
import debounce from 'lodash.debounce'
import DashboardLayout from '../components/DashboardLayout'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import { 
  Card, 
  CardBody, 
  CardHeader,
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
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
      Textarea
  } from '@heroui/react'
import FormField from '@/app/components/ui/FormField'

import { useCurrency } from '@/lib/contexts/TranslationContext'
import { 
  Unlock, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Check, 
  Clock, 
  AlertTriangle, 
  Smartphone, 
  DollarSign,
  ShieldCheck,
  Shield,
  Zap,
  Play,
  Pause,
  CheckCircle2,
  X,
  User,
  Calendar,
  Phone,
  Settings,
  Trash2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface Customer {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  anonymous_identifier: string | null
  customer_type: string
  cedula_dni: string | null
  country_code: string | null
}

interface UnlockItem {
  id: string
  unlock_type: string
  brand: string
  model: string
  imei: string | null
  serial_number: string | null
  status: string
  cost: number
  provider: string | null
  provider_order_id: string | null
  completion_time: string | null
  notes: string | null
  created_at: string
  updated_at: string
  customers: Customer | null
  technician: {
    id: string
    name: string
    email: string
  } | null
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function DesbloqueoPage() {
  const { t } = useTranslations()
  const { formatCurrency } = useCurrency()
  const [unlocks, setUnlocks] = useState<UnlockItem[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateOpenChange } = useDisclosure()
  const { isOpen: isStatusOpen, onOpen: onStatusOpen, onOpenChange: onStatusOpenChange } = useDisclosure()
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const [selectedUnlock, setSelectedUnlock] = useState<UnlockItem | null>(null)
  const [editingUnlock, setEditingUnlock] = useState<UnlockItem | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

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

  const fetchUnlocks = async (page = 1, status = filtroEstado, tipo = filtroTipo, search = busqueda) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })
      
      if (status !== 'todos') params.append('status', status)
      if (tipo !== 'todos') params.append('unlock_type', tipo)
      if (search.trim()) params.append('search', search.trim())

      const response = await fetch(`/api/unlocks?${params}`)
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error desconocido')
      }
      
      setUnlocks(result.data || [])
      setPagination(result.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      })
      
    } catch (fetchError) {
      console.error('Error fetching unlocks:', fetchError)
      setError(fetchError instanceof Error ? fetchError.message : 'Error desconocido')
      setUnlocks([])
      setPagination({ page: 1, limit: 10, total: 0, totalPages: 0 })
    } finally {
      setLoading(false)
    }
  }

  const debouncedFetch = useCallback(
    debounce((search: string) => {
      fetchUnlocks(1, filtroEstado, filtroTipo, search);
    }, 300),
    [filtroEstado, filtroTipo]
  );

  useEffect(() => {
    debouncedFetch(busqueda);
  }, [busqueda, debouncedFetch]);

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

  useEffect(() => {
    fetchUnlocks()
    fetchCustomers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const submissionData = {
      ...formData,
      customer_id: formData.customer_id === 'general' ? null : formData.customer_id,
      unlock_type: formData.unlock_type === 'custom' 
        ? formData.custom_unlock_type 
        : unlockTypes.find(t => t.value === formData.unlock_type)?.label || formData.unlock_type,
    };
    delete (submissionData as any).custom_unlock_type;

    try {
      const response = await fetch('/api/unlocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al crear el desbloqueo')
      }

      onCreateOpenChange()
      setFormData({
        unlock_type: '', custom_unlock_type: '', brand: '', model: '',
        imei: '', serial_number: '', customer_id: '', cost: 0,
        provider: '', notes: ''
      })
      fetchUnlocks()
    } catch (error) {
      console.error('Error creating unlock:', error)
      alert(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  const getStatusInfo = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0]
  }

  // Funciones para colores de botones de cambio de estado
  const getStatusButtonColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange-500'
      case 'in_progress': return 'blue-500'
      case 'completed': return 'green-500'
      case 'failed': return 'red-500'
      default: return 'gray-500'
    }
  }

  const getStatusButtonHoverColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange-600'
      case 'in_progress': return 'blue-600'
      case 'completed': return 'green-600'
      case 'failed': return 'red-600'
      default: return 'gray-600'
    }
  }

  const getStatusButtonBgColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange-100'
      case 'in_progress': return 'blue-100'
      case 'completed': return 'green-100'
      case 'failed': return 'red-100'
      default: return 'gray-100'
    }
  }

  // Nueva función para obtener colores CSS específicos para los botones del modal
  const getModalButtonClass = (status: string) => {
    const baseClass = 'h-16 flex-col font-semibold transition-all duration-200 min-w-0'
    
    switch (status) {
      case 'pending': return `${baseClass} bg-[#FFF8E1] text-[#FF8C00] border-[#FF8C00]/20 hover:bg-[#FFE8B3] hover:border-[#FF8C00]/40`
      case 'in_progress': return `${baseClass} bg-[#E8F0FE] text-[#004085] border-[#004085]/20 hover:bg-[#D1E7FF] hover:border-[#004085]/40`
      case 'completed': return `${baseClass} bg-[#F0FFF4] text-[#28A745] border-[#28A745]/20 hover:bg-[#E8F5E8] hover:border-[#28A745]/40`
      case 'failed': return `${baseClass} bg-[#FFF5F5] text-[#DC3545] border-[#DC3545]/20 hover:bg-[#FFEBEE] hover:border-[#DC3545]/40`
      default: return `${baseClass} bg-[#F8F9FA] text-[#6C757D] border-[#6C757D]/20 hover:bg-[#E9ECEF] hover:border-[#6C757D]/40`
    }
  }

  const getUnlockTypeLabel = (type: string) => {
    return unlockTypes.find(t => t.value === type)?.label || type
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

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al actualizar estado')
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

  const handleStatusChange = (unlock: UnlockItem) => {
    setSelectedUnlock(unlock)
    onStatusOpen()
  }

  const handleCompleteUnlock = async (unlockId: string) => {
    await updateUnlockStatus(unlockId, 'completed', new Date().toISOString())
  }

  const getCustomerName = (customer: Customer | null) => {
    if (!customer) return 'Cliente General'
    return customer.name || customer.anonymous_identifier || 'Cliente Anónimo'
  }

  const getUnlockTypeIcon = (type: string) => {
    switch (type) {
      case 'icloud': return <ShieldCheck className="w-4 h-4" />
      case 'frp': return <Shield className="w-4 h-4" />
      case 'network': return <Zap className="w-4 h-4" />
      case 'bootloader': return <Settings className="w-4 h-4" />
      default: return <Unlock className="w-4 h-4" />
    }
  }

  const stats = {
    total: unlocks.length,
    pendientes: unlocks.filter(u => u.status === 'pending').length,
    enProceso: unlocks.filter(u => u.status === 'in_progress').length,
    completados: unlocks.filter(u => u.status === 'completed').length,
    totalIngresos: unlocks.filter(u => u.status === 'completed').reduce((sum, u) => sum + u.cost, 0)
  }

  // Funciones CRUD
  const handleViewDetails = (unlock: UnlockItem) => {
    setSelectedUnlock(unlock)
    onDetailOpen()
  }

  const handleEditUnlock = (unlock: UnlockItem) => {
    setEditingUnlock(unlock)
    onEditOpen()
  }

  const handleUpdateUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUnlock) return
    
    setUpdateLoading(true)
    try {
      const response = await fetch(`/api/unlocks/${editingUnlock.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingUnlock),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar el desbloqueo')
      }

      onEditClose()
      fetchUnlocks()
      alert('Desbloqueo actualizado exitosamente')
    } catch (err) {
      console.error('Error updating unlock:', err)
      alert(err instanceof Error ? err.message : 'Error al actualizar el desbloqueo')
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleDeleteUnlock = (unlock: UnlockItem) => {
    setSelectedUnlock(unlock)
    onDeleteOpen()
  }

  const confirmDeleteUnlock = async () => {
    if (!selectedUnlock) return
    
    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/unlocks/${selectedUnlock.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar el desbloqueo')
      }

      onDeleteClose()
      fetchUnlocks()
      alert('Desbloqueo eliminado exitosamente')
    } catch (err) {
      console.error('Error deleting unlock:', err)
      alert(err instanceof Error ? err.message : 'Error al eliminar el desbloqueo')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading && unlocks.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64 rounded-lg" />
              <Skeleton className="h-4 w-96 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardBody className="p-6 space-y-3">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-8 w-16 rounded" />
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#004085] to-[#003366] bg-clip-text text-transparent">
              Servicios de Desbloqueo
            </h1>
            <p className="text-[#6C757D] text-lg">
              Gestión de servicios de unlock y liberación de dispositivos
            </p>
          </div>
          
          <Button
            onPress={onCreateOpen}
            startContent={<Plus className="w-4 h-4" />}
            className="bg-gradient-to-r from-[#004085] to-[#003366] text-white hover:from-[#003366] hover:to-[#004085] transition-all shadow-lg"
          >
            Nuevo Desbloqueo
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="hover:scale-105 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] border border-[#6C757D]/20">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#6C757D] to-[#495057] shadow-lg">
                  <Unlock className="w-6 h-6 text-white" />
                </div>
                <Chip variant="flat" size="sm" className="bg-[#F8F9FA] text-[#6C757D]">
                  Total
                </Chip>
              </div>
              <div className="space-y-2">
                <p className="text-base font-bold text-[#6C757D] uppercase tracking-wider">Total</p>
                <p className="text-4xl font-extrabold text-[#343A40] mb-2 tracking-tight">{stats.total}</p>
                <p className="text-sm font-medium text-[#6C757D]">Desbloqueos procesados</p>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-[#E8F0FE] to-[#D1E7FF] border border-[#004085]/20">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#004085] to-[#003366] shadow-lg">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <Chip variant="flat" size="sm" className="bg-[#004085] text-white">
                  Proceso
                </Chip>
              </div>
              <div className="space-y-2">
                <p className="text-base font-bold text-[#6C757D] uppercase tracking-wider">En Proceso</p>
                <p className="text-4xl font-extrabold text-[#343A40] mb-2 tracking-tight">{stats.enProceso}</p>
                <Progress 
                  value={(stats.enProceso / Math.max(stats.total, 1)) * 100} 
                  classNames={{
                    indicator: "bg-[#004085]",
                  }}
                  size="sm" 
                  className="max-w-md"
                />
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] border border-[#6C757D]/20">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#6C757D] to-[#495057] shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <Chip variant="flat" size="sm" className="bg-[#F8F9FA] text-[#6C757D]">
                  Completados
                </Chip>
              </div>
              <div className="space-y-2">
                <p className="text-base font-bold text-[#6C757D] uppercase tracking-wider">Completados</p>
                <p className="text-4xl font-extrabold text-[#343A40] mb-2 tracking-tight">{stats.completados}</p>
                <Progress 
                  value={(stats.completados / Math.max(stats.total, 1)) * 100} 
                  classNames={{
                    indicator: "bg-[#6C757D]",
                  }}
                  size="sm" 
                  className="max-w-md"
                />
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-[#E8F0FE] to-[#D1E7FF] border border-[#004085]/20">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#004085] to-[#003366] shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <Chip variant="flat" size="sm" className="bg-[#004085] text-white">
                  Ingresos
                </Chip>
              </div>
              <div className="space-y-2">
                <p className="text-base font-bold text-[#6C757D] uppercase tracking-wider">Ingresos</p>
                <p className="text-3xl font-extrabold text-[#343A40] mb-2 tracking-tight">{formatCurrency(stats.totalIngresos)}</p>
                <Progress 
                  value={85} 
                  classNames={{
                    indicator: "bg-[#004085]",
                  }}
                  size="sm" 
                  className="max-w-md"
                />
                <p className="text-sm font-medium text-[#6C757D]">Meta: {formatCurrency(stats.totalIngresos * 1.2)}</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardBody className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por cliente, marca, modelo, IMEI..."
                  startContent={<Search className="w-4 h-4 text-[#6C757D]" />}
                  value={busqueda}
                  onValueChange={(value) => {
                    setBusqueda(value)
                  }}
                  variant="bordered"
                  size="lg"
                  classNames={{
                    input: "text-[#343A40] placeholder:text-[#6C757D]",
                    inputWrapper: "border-[#E8F0FE] hover:border-[#004085] focus-within:border-[#004085]",
                  }}
                />
              </div>
              <div className="w-full md:w-48">
                <Select
                  placeholder="Estado"
                  selectedKeys={new Set([filtroEstado])}
                  onSelectionChange={(keys) => {
                    const estado = Array.from(keys)[0] as string
                    setFiltroEstado(estado)
                    fetchUnlocks(1, estado, filtroTipo, busqueda)
                  }}
                  variant="bordered"
                  size="lg"
                  startContent={<Filter className="w-4 h-4" />}
                  classNames={{
                    trigger: "text-gray-900",
                    value: "text-gray-900",
                    popoverContent: "bg-white",
                  }}
                >
                  {[{ value: "todos", label: "Todos los estados" }, ...statusOptions].map(status => (
                    <SelectItem key={status.value} className="text-gray-900">
                      {status.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select
                  placeholder="Tipo"
                  selectedKeys={new Set([filtroTipo])}
                  onSelectionChange={(keys) => {
                    const tipo = Array.from(keys)[0] as string
                    setFiltroTipo(tipo)
                    fetchUnlocks(1, filtroEstado, tipo, busqueda)
                  }}
                  variant="bordered"
                  size="lg"
                  classNames={{
                    trigger: "text-gray-900",
                    value: "text-gray-900",
                    popoverContent: "bg-white",
                  }}
                >
                  {[{ value: "todos", label: "Todos los tipos" }, ...unlockTypes].map(type => (
                    <SelectItem key={type.value} className="text-gray-900">
                      {type.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Tabla de desbloqueos */}
        <Card>
          <CardBody className="p-0">
            {/* Vista Desktop - Tabla */}
            <div className="hidden lg:block">
              <Table
                aria-label="Tabla de desbloqueos"
                classNames={{
                  wrapper: "min-h-[400px]",
                  th: "bg-[#004085] text-white font-bold text-base",
                  td: "py-4"
                }}
              >
                <TableHeader>
                  <TableColumn>TIPO/DISPOSITIVO</TableColumn>
                  <TableColumn>CLIENTE</TableColumn>
                  <TableColumn>IDENTIFICADORES</TableColumn>
                  <TableColumn>ESTADO</TableColumn>
                  <TableColumn>COSTO</TableColumn>
                  <TableColumn>FECHA</TableColumn>
                  <TableColumn>ACCIONES</TableColumn>
                </TableHeader>
                <TableBody 
                  emptyContent="No hay desbloqueos registrados"
                  isLoading={loading}
                  loadingContent={<Skeleton className="w-full h-12" />}
                >
                  {unlocks.map((unlock) => (
                    <TableRow key={unlock.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            icon={getUnlockTypeIcon(unlock.unlock_type)}
                            classNames={{
                              base: "bg-gradient-to-br from-[#E8F0FE] to-[#D1E7FF]",
                              icon: "text-[#004085]"
                            }}
                            size="sm"
                          />
                          <div>
                            <p className="font-semibold text-[#343A40]">
                              {getUnlockTypeLabel(unlock.unlock_type)}
                            </p>
                            <p className="text-sm text-[#6C757D]">
                              {unlock.brand} {unlock.model}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                                                      <User className="w-4 h-4 text-[#6C757D]" />
                          <div>
                            <p className="text-sm font-medium text-[#343A40]">
                              {getCustomerName(unlock.customers)}
                            </p>
                            {unlock.customers?.phone && (
                              <p className="text-xs text-[#6C757D]">
                                {unlock.customers.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {unlock.imei && (
                            <div className="flex items-center gap-2">
                                                              <Smartphone className="w-3 h-3 text-[#004085]" />
                              <span className="text-xs text-[#6C757D]">
                                IMEI: {unlock.imei}
                              </span>
                            </div>
                          )}
                          {unlock.serial_number && (
                            <div className="flex items-center gap-2">
                                                              <Phone className="w-3 h-3 text-[#004085]" />
                              <span className="text-xs text-[#6C757D]">
                                SN: {unlock.serial_number}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          className={
                            unlock.status === 'pending' ? "bg-[#FFF8E1] text-[#FF8C00]" :
                            unlock.status === 'in_progress' ? "bg-[#E8F0FE] text-[#004085]" :
                            unlock.status === 'completed' ? "bg-[#F0FFF4] text-[#28A745]" :
                            unlock.status === 'failed' ? "bg-[#FFF5F5] text-[#DC3545]" :
                            "bg-[#F8F9FA] text-[#6C757D]"
                          }
                          variant="flat"
                          startContent={React.createElement(getStatusInfo(unlock.status).icon, { className: "w-4 h-4" })}
                        >
                          {getStatusInfo(unlock.status).label}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(unlock.cost)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-[#343A40]">
                            {formatDate(unlock.created_at)}
                          </p>
                          {unlock.completion_time && (
                            <p className="text-xs text-[#6C757D]">
                              Completado: {formatDate(unlock.completion_time)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="grid grid-cols-3 gap-1 w-fit">
                                                      <Tooltip 
                              content="Ver detalles"
                              classNames={{
                                content: "bg-[#343A40] text-white"
                              }}
                            >
                              <Button
                                isIconOnly
                                size="sm"
                                variant="flat"
                                className="hover:bg-[#E8F0FE] text-[#004085]"
                                onPress={() => handleViewDetails(unlock)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Tooltip>
                            
                            <Tooltip 
                              content="Cambiar estado"
                              classNames={{
                                content: "bg-[#343A40] text-white"
                              }}
                            >
                              <Button
                                isIconOnly
                                size="sm"
                                variant="flat"
                                className="hover:bg-[#E8F0FE] text-[#004085]"
                                onPress={() => handleStatusChange(unlock)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Tooltip>

                            {unlock.status === 'pending' ? (
                              <Tooltip 
                                content="Marcar como completado"
                                classNames={{
                                  content: "bg-[#343A40] text-white"
                                }}
                              >
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="flat"
                                  className="hover:bg-[#E8F0FE] text-[#004085]"
                                  onPress={() => handleCompleteUnlock(unlock.id)}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              </Tooltip>
                            ) : (
                              <Tooltip 
                                content="Eliminar"
                                classNames={{
                                  content: "bg-[#343A40] text-white"
                                }}
                              >
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="flat"
                                  className="hover:bg-[#F8F9FA] text-[#6C757D]"
                                  onPress={() => handleDeleteUnlock(unlock)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </Tooltip>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Vista Móvil - Cards */}
            <div className="lg:hidden">
              {loading ? (
                <div className="space-y-4 p-4">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="shadow-sm">
                      <CardBody className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-12 h-12 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-32 rounded" />
                              <Skeleton className="h-3 w-24 rounded" />
                            </div>
                          </div>
                          <Skeleton className="h-16 w-full rounded" />
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              ) : unlocks.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Unlock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#343A40] mb-2">
                    No hay desbloqueos
                  </h3>
                  <p className="text-[#6C757D] mb-6">
                    No se encontraron servicios de desbloqueo con los filtros aplicados
                  </p>
                  <Button color="primary" startContent={<Plus className="w-4 h-4" />} onPress={onCreateOpen}>
                    Nuevo Desbloqueo
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 p-4">
                  {unlocks.map((unlock) => (
                    <Card key={unlock.id} className="shadow-sm hover:shadow-md transition-shadow">
                      <CardBody className="p-4">
                        {/* Header del desbloqueo */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              icon={getUnlockTypeIcon(unlock.unlock_type)}
                              classNames={{
                                base: "bg-gradient-to-br from-cyan-400 to-blue-600",
                                icon: "text-white"
                              }}
                              size="md"
                            />
                            <div>
                                                          <h4 className="font-semibold text-[#343A40]">
                              {getUnlockTypeLabel(unlock.unlock_type)}
                            </h4>
                            <p className="text-sm text-[#6C757D]">
                              {unlock.brand} {unlock.model}
                            </p>
                            <p className="text-xs text-[#6C757D]">
                              {formatDate(unlock.created_at)}
                            </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900 mb-1">
                              {formatCurrency(unlock.cost)}
                            </p>
                            <Chip
                              className={
                                unlock.status === 'pending' ? "bg-[#FFF8E1] text-[#FF8C00]" :
                                unlock.status === 'in_progress' ? "bg-[#E8F0FE] text-[#004085]" :
                                unlock.status === 'completed' ? "bg-[#F0FFF4] text-[#28A745]" :
                                unlock.status === 'failed' ? "bg-[#FFF5F5] text-[#DC3545]" :
                                "bg-[#F8F9FA] text-[#6C757D]"
                              }
                              variant="flat"
                              size="sm"
                              startContent={React.createElement(getStatusInfo(unlock.status).icon, { className: "w-3 h-3" })}
                            >
                              {getStatusInfo(unlock.status).label}
                            </Chip>
                          </div>
                        </div>

                        {/* Información del cliente */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-gray-600" />
                            <p className="text-xs font-medium text-[#6C757D] uppercase tracking-wide">
                              Cliente
                            </p>
                          </div>
                          <p className="text-sm font-medium text-[#343A40]">
                            {getCustomerName(unlock.customers)}
                          </p>
                          {unlock.customers?.phone && (
                            <p className="text-xs text-[#6C757D]">
                              {unlock.customers.phone}
                            </p>
                          )}
                        </div>

                        {/* Identificadores */}
                        {(unlock.imei || unlock.serial_number) && (
                          <div className="bg-blue-50 rounded-lg p-3 mb-4">
                            <p className="text-xs font-medium text-[#6C757D] uppercase tracking-wide mb-2">
                              Identificadores
                            </p>
                            <div className="space-y-2">
                              {unlock.imei && (
                                <div className="flex items-center gap-2">
                                  <Smartphone className="w-3 h-3 text-[#004085]" />
                                  <span className="text-sm text-[#343A40]">
                                    IMEI: {unlock.imei}
                                  </span>
                                </div>
                              )}
                              {unlock.serial_number && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-3 h-3 text-[#004085]" />
                                  <span className="text-sm text-[#343A40]">
                                    Serial: {unlock.serial_number}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Información adicional */}
                        {unlock.completion_time && (
                          <div className="mb-4">
                            <p className="text-xs font-medium text-[#6C757D] uppercase tracking-wide mb-1">
                              Fecha de Completado
                            </p>
                            <p className="text-sm text-[#343A40]">
                              {formatDate(unlock.completion_time)}
                            </p>
                          </div>
                        )}

                        {/* Acciones */}
                        <div className="flex gap-2">
                          <Button 
                            variant="flat" 
                            size="sm" 
                            startContent={<Eye className="w-4 h-4" />}
                            onPress={() => handleViewDetails(unlock)}
                            className="flex-1 hover:bg-[#E8F0FE] text-[#004085]"
                          >
                            Ver
                          </Button>
                          <Button 
                            variant="flat" 
                            size="sm" 
                            startContent={<Edit className="w-4 h-4" />}
                            onPress={() => handleStatusChange(unlock)}
                            className="flex-1 hover:bg-[#E8F0FE] text-[#004085]"
                          >
                            Estado
                          </Button>
                          {unlock.status === 'pending' ? (
                            <Button 
                              variant="flat" 
                              size="sm" 
                              startContent={<Check className="w-4 h-4" />}
                              onPress={() => handleCompleteUnlock(unlock.id)}
                              className="flex-1 hover:bg-[#E8F0FE] text-[#004085]"
                            >
                              Completar
                            </Button>
                          ) : (
                            <Button 
                              variant="flat" 
                              size="sm" 
                              startContent={<Trash2 className="w-4 h-4" />}
                              onPress={() => handleDeleteUnlock(unlock)}
                              className="flex-1 hover:bg-[#F8F9FA] text-[#6C757D]"
                            >
                              Eliminar
                            </Button>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination
              total={pagination.totalPages}
              page={pagination.page}
              onChange={(page) => fetchUnlocks(page)}
              showControls
              color="primary"
              size="lg"
            />
          </div>
        )}

        {/* Modal para crear nuevo desbloqueo */}
        <Modal 
          isOpen={isCreateOpen} 
          onOpenChange={onCreateOpenChange} 
          size="xl"
          scrollBehavior="inside"
          classNames={{
            wrapper: "z-[1000]",
            backdrop: "z-[999] bg-black/40 backdrop-blur-sm",
            base: "rounded-3xl shadow-2xl border-0 bg-white my-4 mx-4 sm:my-6 sm:mx-6 md:mx-8 lg:mx-12",
            body: "max-h-[calc(100vh-180px)] sm:max-h-[75vh] overflow-y-auto p-6 md:p-8",
            header: "border-b border-gray-200/50 p-6 md:p-8 bg-gradient-to-r from-blue-50/50 to-white rounded-t-3xl",
            footer: "border-t border-gray-200/50 p-6 md:p-8 bg-gradient-to-r from-blue-50/50 to-white rounded-b-3xl"
          }}
        >
          <ModalContent>
            <ModalHeader>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#343A40]">Nuevo Servicio de Desbloqueo</h2>
              <p className="text-sm sm:text-base text-[#6C757D]">Complete la información del servicio</p>
            </ModalHeader>
            <ModalBody>
              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="flex justify-end gap-3 pt-6">
                                  <Button 
                  variant="light" 
                  onClick={() => onCreateOpenChange()} 
                  size="md" 
                  className="text-base font-medium text-[#6C757D] hover:bg-[#E8F0FE]"
                >
                  Cancelar
                </Button>
                  <Button type="submit" size="md" className="bg-gradient-to-r from-[#004085] to-[#003366] text-white hover:from-[#003366] hover:to-[#004085] transition-all text-base font-medium px-6">
                    Registrar Desbloqueo
                  </Button>
                </div>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Modal para cambiar estado */}
        <Modal 
          isOpen={isStatusOpen} 
          onOpenChange={onStatusOpenChange} 
          size="lg"
          scrollBehavior="inside"
          classNames={{
            wrapper: "z-[1000]",
            backdrop: "z-[999] bg-black/40 backdrop-blur-sm",
            base: "!rounded-3xl shadow-2xl border-0 bg-white my-4 mx-4 sm:my-6 sm:mx-6 md:mx-8 lg:mx-12",
            body: "max-h-[calc(100vh-180px)] sm:max-h-[75vh] overflow-y-auto p-6 md:p-8",
            header: "border-b border-gray-200/50 p-6 md:p-8 bg-gradient-to-r from-blue-50/50 to-white !rounded-t-3xl",
            footer: "border-t border-gray-200/50 p-6 md:p-8 bg-gradient-to-r from-blue-50/50 to-white !rounded-b-3xl"
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold text-[#343A40]">Cambiar Estado del Desbloqueo</h2>
                  {selectedUnlock && (
                    <p className="text-[#6C757D]">
                      {selectedUnlock.brand} {selectedUnlock.model} - {getUnlockTypeLabel(selectedUnlock.unlock_type)}
                    </p>
                  )}
                </ModalHeader>
                <ModalBody>
                  <div className="grid grid-cols-2 gap-4">
                    {statusOptions.map((status) => (
                      <Button
                        key={status.value}
                        variant="bordered"
                        size="lg"
                        startContent={React.createElement(status.icon, { className: "w-5 h-5" })}
                        onPress={() => {
                          if (selectedUnlock) {
                            const completionTime = status.value === 'completed' ? new Date().toISOString() : undefined
                            updateUnlockStatus(selectedUnlock.id, status.value, completionTime)
                          }
                        }}
                        isLoading={statusLoading}
                        className={getModalButtonClass(status.value)}
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

        {/* Modal para editar desbloqueo */}
        <Modal 
          isOpen={isEditOpen} 
          onClose={onEditClose} 
          size="xl"
          scrollBehavior="inside"
          classNames={{
            wrapper: "z-[1000]",
            backdrop: "z-[999] bg-black/40 backdrop-blur-sm",
            base: "rounded-3xl shadow-2xl border-0 bg-white my-1 mx-1 sm:my-2 sm:mx-2 md:mx-6 w-full",
            body: "max-h-[75vh] overflow-y-auto py-2 px-2 sm:py-4 sm:px-6",
            header: "border-b border-gray-200 pb-2 px-2 sm:pb-4 sm:px-6",
            footer: "border-t border-gray-200 pt-2 px-2 sm:pt-4 sm:px-6"
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold text-[#343A40]">Editar Servicio de Desbloqueo</h2>
                </ModalHeader>
                <ModalBody>
                  {editingUnlock && (
                    <form id="edit-unlock-form" onSubmit={handleUpdateUnlock} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          label="Tipo de Desbloqueo"
                          name="unlock_type"
                          type="select"
                          value={editingUnlock.unlock_type}
                          onChange={(value) => setEditingUnlock(prev => prev ? { ...prev, unlock_type: value } : null)}
                          options={unlockTypes.map(type => ({
                            value: type.value,
                            label: type.label
                          }))}
                          required
                        />
                        <FormField
                          label="Cliente"
                          name="customer_id"
                          type="select"
                          value={editingUnlock.customers?.id || 'general'}
                          onChange={(value) => setEditingUnlock(prev => prev ? { ...prev, customers: customers.find(c => c.id === value) || null } : null)}
                          options={[
                            { value: 'general', label: 'Cliente General (Sin registrar)' },
                            ...customers.map(customer => ({
                              value: customer.id,
                              label: customer.name || customer.anonymous_identifier || 'Cliente Anónimo'
                            }))
                          ]}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          label="Marca"
                          name="brand"
                          value={editingUnlock.brand}
                          onChange={(value) => setEditingUnlock(prev => prev ? { ...prev, brand: value } : null)}
                          required
                        />
                        <FormField
                          label="Modelo"
                          name="model"
                          value={editingUnlock.model}
                          onChange={(value) => setEditingUnlock(prev => prev ? { ...prev, model: value } : null)}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          label="IMEI"
                          name="imei"
                          value={editingUnlock.imei || ''}
                          onChange={(value) => setEditingUnlock(prev => prev ? { ...prev, imei: value } : null)}
                        />
                        <FormField
                          label="Número de Serie"
                          name="serial_number"
                          value={editingUnlock.serial_number || ''}
                          onChange={(value) => setEditingUnlock(prev => prev ? { ...prev, serial_number: value } : null)}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          label="Costo"
                          name="cost"
                          type="number"
                          value={editingUnlock.cost.toString()}
                          onChange={(value) => setEditingUnlock(prev => prev ? { ...prev, cost: parseFloat(value) || 0 } : null)}
                          required
                        />
                        <FormField
                          label="Proveedor (Opcional)"
                          name="provider"
                          value={editingUnlock.provider || ''}
                          onChange={(value) => setEditingUnlock(prev => prev ? { ...prev, provider: value } : null)}
                        />
                      </div>
                      <FormField
                        label="Notas"
                        name="notes"
                        type="textarea"
                        value={editingUnlock.notes || ''}
                        onChange={(value) => setEditingUnlock(prev => prev ? { ...prev, notes: value } : null)}
                      />
                    </form>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    form="edit-unlock-form"
                    isLoading={updateLoading}
                    className="bg-gradient-to-r from-[#004085] to-[#003366] text-white hover:from-[#003366] hover:to-[#004085] transition-all"
                  >
                    Actualizar Desbloqueo
                  </Button>
                </ModalFooter>
              </>
            )}
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
            backdrop: "z-[999] bg-black/40 backdrop-blur-sm",
            base: "!rounded-3xl shadow-2xl border-0 bg-white max-h-[100vh] h-full w-full m-0 sm:max-h-[95vh] sm:h-auto sm:w-auto sm:my-6 sm:mx-6 md:mx-8 lg:mx-12 md:max-w-4xl",
            body: "max-h-[calc(100vh-120px)] sm:max-h-[75vh] overflow-y-auto p-4 sm:p-6 md:p-8",
            header: "border-b border-gray-200/50 p-4 sm:p-6 md:p-8 bg-gradient-to-r from-green-50/50 to-white !rounded-t-3xl",
            footer: "border-t border-gray-200/50 p-4 sm:p-6 md:p-8 bg-gradient-to-r from-green-50/50 to-white !rounded-b-3xl"
          }}
        >
          <ModalContent>
            <ModalHeader>
              <h2 className="text-xl font-bold text-[#343A40]">Detalles del Desbloqueo</h2>
            </ModalHeader>
            <ModalBody>
              {selectedUnlock && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-[#6C757D]">Tipo</p>
                      <p className="text-base font-semibold text-[#343A40]">{getUnlockTypeLabel(selectedUnlock.unlock_type)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#6C757D]">Estado</p>
                      <Chip 
                        className={
                          selectedUnlock.status === 'pending' ? "bg-[#FFF8E1] text-[#FF8C00]" :
                          selectedUnlock.status === 'in_progress' ? "bg-[#E8F0FE] text-[#004085]" :
                          selectedUnlock.status === 'completed' ? "bg-[#F0FFF4] text-[#28A745]" :
                          selectedUnlock.status === 'failed' ? "bg-[#FFF5F5] text-[#DC3545]" :
                          "bg-[#F8F9FA] text-[#6C757D]"
                        }
                        variant="flat"
                        startContent={React.createElement(getStatusInfo(selectedUnlock.status).icon, { className: "w-4 h-4" })}
                      >
                        {getStatusInfo(selectedUnlock.status).label}
                      </Chip>
                    </div>
                  </div>

                  {/* Información del creador */}
                  <div className="bg-[#E8F0FE] p-4 rounded-lg border border-[#004085]/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#004085]/10 rounded-full">
                        {selectedUnlock.technician?.email.includes('admin') || selectedUnlock.technician?.name?.toLowerCase().includes('admin') ? (
                          <Shield className="w-4 h-4 text-[#004085]" />
                        ) : (
                          <User className="w-4 h-4 text-[#004085]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#6C757D]">Creado por</p>
                        <p className="text-base font-semibold text-[#343A40]">
                          {selectedUnlock.technician ? selectedUnlock.technician.name : 'Usuario desconocido'}
                        </p>
                        <p className="text-xs text-[#6C757D]">
                          {selectedUnlock.technician ? selectedUnlock.technician.email : 'Sin información de contacto'}
                        </p>
                        <p className="text-xs text-[#6C757D] mt-1">
                          {new Date(selectedUnlock.created_at).toLocaleString('es-ES', {
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
                          className="bg-[#004085] text-white"
                          variant="flat" 
                          size="sm"
                          startContent={selectedUnlock.technician?.email.includes('admin') || selectedUnlock.technician?.name?.toLowerCase().includes('admin') ? 
                            <Shield className="w-3 h-3" /> : 
                            <User className="w-3 h-3" />
                          }
                        >
                          {selectedUnlock.technician?.email.includes('admin') || selectedUnlock.technician?.name?.toLowerCase().includes('admin') ? 
                            'Administrador' : 
                            'Técnico'
                          }
                        </Chip>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-[#6C757D] mb-2">Dispositivo</p>
                    <p className="text-base text-[#343A40]">{selectedUnlock.brand} {selectedUnlock.model}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-[#6C757D] mb-2">Cliente</p>
                    <p className="text-base text-[#343A40]">{getCustomerName(selectedUnlock.customers)}</p>
                  </div>

                                      <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-[#6C757D]">Costo</p>
                        <p className="text-lg font-semibold text-[#343A40]">{formatCurrency(selectedUnlock.cost)}</p>
                      </div>
                      {selectedUnlock.provider && (
                        <div>
                          <p className="text-sm font-medium text-[#6C757D]">Proveedor</p>
                          <p className="text-base text-[#343A40]">{selectedUnlock.provider}</p>
                        </div>
                      )}
                    </div>

                    {selectedUnlock.notes && (
                      <div>
                        <p className="text-sm font-medium text-[#6C757D] mb-2">Notas</p>
                        <p className="text-base text-[#343A40]">{selectedUnlock.notes}</p>
                      </div>
                    )}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button 
                variant="light" 
                onPress={onDetailClose}
                className="text-[#6C757D] hover:bg-[#E8F0FE]"
              >
                Cerrar
              </Button>
              
              {/* Botón de WhatsApp en el footer */}
              {selectedUnlock?.customers?.phone && selectedUnlock?.customers?.country_code && (
                <Button 
                  className="bg-green-500 hover:bg-green-600 text-white"
                  startContent={
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.570-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  }
                  onPress={() => {
                    if (selectedUnlock?.customers?.phone && selectedUnlock?.customers?.country_code) {
                      // Obtener nombre del cliente
                      const customerName = selectedUnlock.customers.name || selectedUnlock.customers.anonymous_identifier || 'Cliente'
                      
                      // Obtener tipo de desbloqueo
                      const unlockTypeLabel = getUnlockTypeLabel(selectedUnlock.unlock_type)
                      
                      // Obtener información del dispositivo
                      const deviceInfo = `${selectedUnlock.brand} ${selectedUnlock.model}`
                      
                      // Generar mensaje específico para desbloqueos basado en el estado
                      let statusMessage = ''
                      switch (selectedUnlock.status) {
                        case 'pending':
                          statusMessage = `hemos recibido tu solicitud de ${unlockTypeLabel} y está en proceso de revisión`
                          break
                        case 'in_progress':
                          statusMessage = `estamos trabajando en el ${unlockTypeLabel} de tu dispositivo`
                          break
                        case 'completed':
                          statusMessage = `el ${unlockTypeLabel} de tu dispositivo ha sido completado exitosamente`
                          break
                        case 'failed':
                          statusMessage = `hemos tenido dificultades con el ${unlockTypeLabel} de tu dispositivo. Te contactaremos para más detalles`
                          break
                        default:
                          statusMessage = `hay una actualización sobre el ${unlockTypeLabel} de tu dispositivo`
                      }
                      
                      const message = `Hola ${customerName}, te escribimos desde nuestra tienda para informarte que ${statusMessage} (${deviceInfo}). ¡Gracias por confiar en nosotros!`
                      
                      // Usar código de país del cliente si está disponible, sino usar +51 por defecto
                      const countryCode = (selectedUnlock.customers as any).country_code || '+51'
                      const phoneNumber = selectedUnlock.customers.phone.replace(/\D/g, '')
                      const countryCodeClean = countryCode.replace(/\D/g, '')
                      const whatsappUrl = `https://wa.me/${countryCodeClean}${phoneNumber}?text=${encodeURIComponent(message)}`
                      
                      window.open(whatsappUrl, '_blank')
                    }
                  }}
                >
                  Enviar WhatsApp
                </Button>
              )}
            </ModalFooter>
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
            backdrop: "z-[999] bg-black/40 backdrop-blur-sm",
            base: "!rounded-3xl shadow-2xl border-0 bg-white my-4 mx-4 sm:my-6 sm:mx-6 md:mx-8 lg:mx-12",
            body: "p-6 md:p-8",
            header: "border-b border-gray-200/50 p-6 md:p-8 bg-gradient-to-r from-red-50/50 to-white !rounded-t-3xl",
            footer: "border-t border-gray-200/50 p-6 md:p-8 bg-gradient-to-r from-red-50/50 to-white !rounded-b-3xl"
          }}
        >
          <ModalContent>
            <ModalHeader>
              <h3 className="text-xl font-bold text-[#343A40]">Confirmar Eliminación</h3>
            </ModalHeader>
            <ModalBody>
              {selectedUnlock && (
                <div className="space-y-4">
                  <p className="text-[#6C757D]">¿Estás seguro de que deseas eliminar este desbloqueo?</p>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="font-medium text-[#343A40]">{getUnlockTypeLabel(selectedUnlock.unlock_type)}</p>
                    <p className="text-sm text-[#6C757D]">Dispositivo: {selectedUnlock.brand} {selectedUnlock.model}</p>
                    <p className="text-sm text-[#6C757D]">Cliente: {getCustomerName(selectedUnlock.customers)}</p>
                  </div>
                  <p className="text-sm text-red-600">Esta acción no se puede deshacer.</p>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button 
                variant="light" 
                onPress={onDeleteClose}
                className="text-[#6C757D] hover:bg-[#E8F0FE]"
              >
                Cancelar
              </Button>
              <Button 
                onPress={confirmDeleteUnlock}
                isLoading={deleteLoading}
                className="bg-gradient-to-r from-[#6C757D] to-[#495057] text-white hover:from-[#495057] hover:to-[#6C757D]"
              >
                Eliminar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </DashboardLayout>
  )
} 
