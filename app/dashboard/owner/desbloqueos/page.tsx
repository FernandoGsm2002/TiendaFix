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
import { textColors } from '@/lib/utils/colors'
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
      case 'pending': return `${baseClass} bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100 hover:border-orange-400`
      case 'in_progress': return `${baseClass} bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100 hover:border-blue-400`
      case 'completed': return `${baseClass} bg-green-50 text-green-700 border-green-300 hover:bg-green-100 hover:border-green-400`
      case 'failed': return `${baseClass} bg-red-50 text-red-700 border-red-300 hover:bg-red-100 hover:border-red-400`
      default: return `${baseClass} bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400`
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#4ca771] to-[#013237] bg-clip-text text-transparent">
              Servicios de Desbloqueo
            </h1>
            <p className="text-[#4ca771] text-lg">
              Gestión de servicios de unlock y liberación de dispositivos
            </p>
          </div>
          
          <Button
            onPress={onCreateOpen}
            startContent={<Plus className="w-4 h-4" />}
            className="bg-gradient-to-r from-[#4ca771] to-[#013237] text-white hover:from-[#013237] hover:to-[#4ca771] transition-all shadow-lg"
          >
            Nuevo Desbloqueo
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="hover:scale-105 transition-all duration-300 border border-gray-200 shadow-lg bg-gradient-to-br from-blue-100 to-blue-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-blue-500 shadow-lg">
                  <Unlock className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">+18%</span>
                  </div>
                  <Chip variant="flat" size="sm" className="font-semibold bg-white/60 text-blue-800 border border-white/30">
                    Total
                  </Chip>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-base font-bold text-blue-800 opacity-90 uppercase tracking-wider">Total</p>
                <p className="text-4xl font-extrabold text-blue-800 mb-2 tracking-tight">{stats.total}</p>
                <p className="text-sm font-medium text-blue-800 opacity-70">Desbloqueos procesados</p>
              </div>
            </CardBody>
          </Card>



          <Card className="hover:scale-105 transition-all duration-300 border border-gray-200 shadow-lg bg-gradient-to-br from-purple-100 to-purple-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-purple-500 shadow-lg">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">+25%</span>
                  </div>
                  <Chip variant="flat" size="sm" className="font-semibold bg-white/60 text-purple-800 border border-white/30">
                    Proceso
                  </Chip>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-base font-bold text-purple-800 opacity-90 uppercase tracking-wider">En Proceso</p>
                <p className="text-4xl font-extrabold text-purple-800 mb-2 tracking-tight">{stats.enProceso}</p>
                <Progress 
                  value={(stats.enProceso / Math.max(stats.total, 1)) * 100} 
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
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">+30%</span>
                  </div>
                  <Chip variant="flat" size="sm" className="font-semibold bg-white/60 text-emerald-800 border border-white/30">
                    Completados
                  </Chip>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-base font-bold text-emerald-800 opacity-90 uppercase tracking-wider">Completados</p>
                <p className="text-4xl font-extrabold text-emerald-800 mb-2 tracking-tight">{stats.completados}</p>
                <Progress 
                  value={(stats.completados / Math.max(stats.total, 1)) * 100} 
                  classNames={{
                    indicator: "bg-emerald-500",
                  }}
                  size="sm" 
                  className="max-w-md"
                />
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border border-gray-200 shadow-lg bg-gradient-to-br from-teal-100 to-teal-200">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-teal-500 shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">+42%</span>
                  </div>
                  <Chip variant="flat" size="sm" className="font-semibold bg-white/60 text-teal-800 border border-white/30">
                    Ingresos
                  </Chip>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-base font-bold text-teal-800 opacity-90 uppercase tracking-wider">Ingresos</p>
                <p className="text-3xl font-extrabold text-teal-800 mb-2 tracking-tight">{formatCurrency(stats.totalIngresos)}</p>
                <Progress 
                  value={85} 
                  classNames={{
                    indicator: "bg-teal-500",
                  }}
                  size="sm" 
                  className="max-w-md"
                />
                <p className="text-sm font-medium text-teal-800 opacity-70">Meta: {formatCurrency(stats.totalIngresos * 1.2)}</p>
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
                  startContent={<Search className="w-4 h-4 text-gray-400" />}
                  value={busqueda}
                  onValueChange={(value) => {
                    setBusqueda(value)
                  }}
                  variant="bordered"
                  size="lg"
                  classNames={{
                    input: "text-gray-900 placeholder:text-gray-500",
                    inputWrapper: "border-gray-300",
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
                  th: "bg-gray-50 text-gray-700 font-semibold",
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
                              base: "bg-gradient-to-br from-cyan-400 to-blue-600",
                              icon: "text-white"
                            }}
                            size="sm"
                          />
                          <div>
                            <p className={`font-semibold ${textColors.primary}`}>
                              {getUnlockTypeLabel(unlock.unlock_type)}
                            </p>
                            <p className={`text-sm ${textColors.secondary}`}>
                              {unlock.brand} {unlock.model}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className={`text-sm font-medium ${textColors.primary}`}>
                              {getCustomerName(unlock.customers)}
                            </p>
                            {unlock.customers?.phone && (
                              <p className={`text-xs ${textColors.muted}`}>
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
                              <Smartphone className="w-3 h-3 text-gray-400" />
                              <span className={`text-xs ${textColors.secondary}`}>
                                IMEI: {unlock.imei}
                              </span>
                            </div>
                          )}
                          {unlock.serial_number && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span className={`text-xs ${textColors.secondary}`}>
                                SN: {unlock.serial_number}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={getStatusInfo(unlock.status).color as any}
                          variant="flat"
                          startContent={React.createElement(getStatusInfo(unlock.status).icon, { className: "w-4 h-4" })}
                        >
                          {getStatusInfo(unlock.status).label}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(unlock.cost)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className={`text-sm ${textColors.primary}`}>
                            {formatDate(unlock.created_at)}
                          </p>
                          {unlock.completion_time && (
                            <p className={`text-xs ${textColors.muted}`}>
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
                              onPress={() => handleStatusChange(unlock)}
                              className={`text-${getStatusButtonColor(unlock.status)} hover:text-${getStatusButtonHoverColor(unlock.status)} hover:bg-${getStatusButtonBgColor(unlock.status)}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Tooltip>

                          {unlock.status === 'pending' ? (
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
                                onPress={() => handleCompleteUnlock(unlock.id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            </Tooltip>
                          ) : (
                            <Tooltip 
                              content="Eliminar"
                              classNames={{
                                content: "bg-gray-900 text-white"
                              }}
                            >
                              <Button
                                isIconOnly
                                size="sm"
                                variant="flat"
                                color="danger"
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
                  <h3 className={`text-lg font-semibold ${textColors.primary} mb-2`}>
                    No hay desbloqueos
                  </h3>
                  <p className={`${textColors.muted} mb-6`}>
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
                              <h4 className={`font-semibold ${textColors.primary}`}>
                                {getUnlockTypeLabel(unlock.unlock_type)}
                              </h4>
                              <p className={`text-sm ${textColors.secondary}`}>
                                {unlock.brand} {unlock.model}
                              </p>
                              <p className={`text-xs ${textColors.muted}`}>
                                {formatDate(unlock.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600 mb-1">
                              {formatCurrency(unlock.cost)}
                            </p>
                            <Chip
                              color={getStatusInfo(unlock.status).color as any}
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
                            <p className={`text-xs font-medium ${textColors.tertiary} uppercase tracking-wide`}>
                              Cliente
                            </p>
                          </div>
                          <p className={`text-sm font-medium ${textColors.primary}`}>
                            {getCustomerName(unlock.customers)}
                          </p>
                          {unlock.customers?.phone && (
                            <p className={`text-xs ${textColors.muted}`}>
                              {unlock.customers.phone}
                            </p>
                          )}
                        </div>

                        {/* Identificadores */}
                        {(unlock.imei || unlock.serial_number) && (
                          <div className="bg-blue-50 rounded-lg p-3 mb-4">
                            <p className={`text-xs font-medium ${textColors.tertiary} uppercase tracking-wide mb-2`}>
                              Identificadores
                            </p>
                            <div className="space-y-2">
                              {unlock.imei && (
                                <div className="flex items-center gap-2">
                                  <Smartphone className="w-3 h-3 text-gray-600" />
                                  <span className={`text-sm ${textColors.primary}`}>
                                    IMEI: {unlock.imei}
                                  </span>
                                </div>
                              )}
                              {unlock.serial_number && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-3 h-3 text-gray-600" />
                                  <span className={`text-sm ${textColors.primary}`}>
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
                            <p className={`text-xs font-medium ${textColors.tertiary} uppercase tracking-wide mb-1`}>
                              Fecha de Completado
                            </p>
                            <p className={`text-sm ${textColors.primary}`}>
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
                            className="flex-1"
                          >
                            Ver
                          </Button>
                          <Button 
                            variant="flat" 
                            size="sm" 
                            startContent={<Edit className="w-4 h-4" />}
                            onPress={() => handleStatusChange(unlock)}
                            className={`flex-1 text-${getStatusButtonColor(unlock.status)} hover:text-${getStatusButtonHoverColor(unlock.status)} hover:bg-${getStatusButtonBgColor(unlock.status)}`}
                          >
                            Estado
                          </Button>
                          {unlock.status === 'pending' ? (
                            <Button 
                              variant="flat" 
                              size="sm" 
                              color="success"
                              startContent={<Check className="w-4 h-4" />}
                              onPress={() => handleCompleteUnlock(unlock.id)}
                              className="flex-1"
                            >
                              Completar
                            </Button>
                          ) : (
                            <Button 
                              variant="flat" 
                              size="sm" 
                              color="danger"
                              startContent={<Trash2 className="w-4 h-4" />}
                              onPress={() => handleDeleteUnlock(unlock)}
                              className="flex-1"
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
            backdrop: "z-[999]",
            base: "max-h-[100vh] h-full sm:max-h-[95vh] sm:h-auto my-0 mx-0 sm:my-1 sm:mx-1 md:mx-6 sm:rounded-lg",
            body: "max-h-[calc(100vh-180px)] sm:max-h-[75vh] overflow-y-auto py-2 px-2 sm:py-4 sm:px-6",
            header: "border-b border-gray-200 pb-2 px-2 sm:pb-4 sm:px-6",
            footer: "border-t border-gray-200 pt-2 px-2 sm:pt-4 sm:px-6"
          }}
        >
          <ModalContent>
            <ModalHeader>
              <h2 className={`text-lg sm:text-xl md:text-2xl font-bold ${textColors.primary}`}>Nuevo Servicio de Desbloqueo</h2>
              <p className={`text-sm sm:text-base ${textColors.secondary}`}>Complete la información del servicio</p>
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
                  <Button color="danger" variant="light" onClick={() => onCreateOpenChange()} size="md" className="text-base font-medium">
                    Cancelar
                  </Button>
                  <Button type="submit" size="md" className="bg-gradient-to-r from-[#4ca771] to-[#013237] text-white hover:from-[#013237] hover:to-[#4ca771] transition-all text-base font-medium px-6">
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
            backdrop: "z-[999]",
            base: "max-h-[95vh] my-2 mx-2 sm:mx-6",
            body: "max-h-[70vh] overflow-y-auto py-4",
            header: "border-b border-gray-200 pb-4",
            footer: "border-t border-gray-200 pt-4"
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h2 className={`text-xl font-bold ${textColors.primary}`}>Cambiar Estado del Desbloqueo</h2>
                  {selectedUnlock && (
                    <p className={textColors.secondary}>
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
            backdrop: "z-[999]",
            base: "max-h-[95vh] my-1 mx-1 sm:my-2 sm:mx-2 md:mx-6 w-full",
            body: "max-h-[75vh] overflow-y-auto py-2 px-2 sm:py-4 sm:px-6",
            header: "border-b border-gray-200 pb-2 px-2 sm:pb-4 sm:px-6",
            footer: "border-t border-gray-200 pt-2 px-2 sm:pt-4 sm:px-6"
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h2 className={`text-xl font-bold ${textColors.primary}`}>Editar Servicio de Desbloqueo</h2>
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
                    className="bg-gradient-to-r from-[#4ca771] to-[#013237] text-white hover:from-[#013237] hover:to-[#4ca771] transition-all"
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
            backdrop: "z-[999]",
            base: "max-h-[100vh] h-full w-full m-0 sm:max-h-[95vh] sm:h-auto sm:w-auto sm:my-2 sm:mx-2 md:mx-6 md:max-w-4xl",
            body: "max-h-[calc(100vh-120px)] sm:max-h-[75vh] overflow-y-auto p-3 sm:p-4 md:p-6",
            header: "border-b border-gray-200 p-3 sm:p-4 md:p-6",
            footer: "border-t border-gray-200 p-3 sm:p-4 md:p-6"
          }}
        >
          <ModalContent>
            <ModalHeader>
              <h2 className={`text-xl font-bold ${textColors.primary}`}>Detalles del Desbloqueo</h2>
            </ModalHeader>
            <ModalBody>
              {selectedUnlock && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm font-medium ${textColors.tertiary}`}>Tipo</p>
                      <p className={`text-base font-semibold ${textColors.primary}`}>{getUnlockTypeLabel(selectedUnlock.unlock_type)}</p>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${textColors.tertiary}`}>Estado</p>
                      <Chip 
                        color={getStatusInfo(selectedUnlock.status).color as any}
                        variant="flat"
                        startContent={React.createElement(getStatusInfo(selectedUnlock.status).icon, { className: "w-4 h-4" })}
                      >
                        {getStatusInfo(selectedUnlock.status).label}
                      </Chip>
                    </div>
                  </div>

                  {/* Información del creador */}
                  <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-100 rounded-full">
                        {selectedUnlock.technician?.email.includes('admin') || selectedUnlock.technician?.name?.toLowerCase().includes('admin') ? (
                          <Shield className="w-4 h-4 text-cyan-600" />
                        ) : (
                          <User className="w-4 h-4 text-cyan-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-cyan-800">Creado por</p>
                        <p className="text-base font-semibold text-cyan-900">
                          {selectedUnlock.technician ? selectedUnlock.technician.name : 'Usuario desconocido'}
                        </p>
                        <p className="text-xs text-cyan-600">
                          {selectedUnlock.technician ? selectedUnlock.technician.email : 'Sin información de contacto'}
                        </p>
                        <p className="text-xs text-cyan-500 mt-1">
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
                          color={selectedUnlock.technician?.email.includes('admin') || selectedUnlock.technician?.name?.toLowerCase().includes('admin') ? 'warning' : 'primary'}
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
                    <p className={`text-sm font-medium ${textColors.tertiary} mb-2`}>Dispositivo</p>
                    <p className={`text-base ${textColors.primary}`}>{selectedUnlock.brand} {selectedUnlock.model}</p>
                  </div>

                  <div>
                    <p className={`text-sm font-medium ${textColors.tertiary} mb-2`}>Cliente</p>
                    <p className={`text-base ${textColors.primary}`}>{getCustomerName(selectedUnlock.customers)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm font-medium ${textColors.tertiary}`}>Costo</p>
                      <p className={`text-lg font-semibold ${textColors.primary}`}>{formatCurrency(selectedUnlock.cost)}</p>
                    </div>
                    {selectedUnlock.provider && (
                      <div>
                        <p className={`text-sm font-medium ${textColors.tertiary}`}>Proveedor</p>
                        <p className={`text-base ${textColors.primary}`}>{selectedUnlock.provider}</p>
                      </div>
                    )}
                  </div>

                  {selectedUnlock.notes && (
                    <div>
                      <p className={`text-sm font-medium ${textColors.tertiary} mb-2`}>Notas</p>
                      <p className={`text-base ${textColors.primary}`}>{selectedUnlock.notes}</p>
                    </div>
                  )}
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
              {selectedUnlock && (
                <div className="space-y-4">
                  <p className={textColors.secondary}>¿Estás seguro de que deseas eliminar este desbloqueo?</p>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className={`font-medium ${textColors.primary}`}>{getUnlockTypeLabel(selectedUnlock.unlock_type)}</p>
                    <p className={`text-sm ${textColors.secondary}`}>Dispositivo: {selectedUnlock.brand} {selectedUnlock.model}</p>
                    <p className={`text-sm ${textColors.secondary}`}>Cliente: {getCustomerName(selectedUnlock.customers)}</p>
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
                onPress={confirmDeleteUnlock}
                isLoading={deleteLoading}
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
