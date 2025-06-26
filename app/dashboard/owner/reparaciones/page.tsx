'use client'

import React, { useState, useEffect, useCallback } from 'react'
import debounce from 'lodash.debounce'
import DashboardLayout from '../components/DashboardLayout'
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
  Edit, 
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
  Shield
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
  const [repairs, setRepairs] = useState<Repair[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
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
  const [editingRepair, setEditingRepair] = useState<Repair | null>(null)

  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure()
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const { isOpen: isStatusOpen, onOpen: onStatusOpen, onClose: onStatusClose } = useDisclosure()

  const fetchRepairs = async (page = 1, estado = filtroEstado, search = busqueda) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })
      
      if (estado !== 'todos') params.append('status', estado)
      if (search.trim()) params.append('search', search.trim())

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

  const debouncedFetch = useCallback(debounce(fetchRepairs, 300), []);

  useEffect(() => {
    fetchRepairs(1, filtroEstado, '');
  }, [filtroEstado]);

  useEffect(() => {
    debouncedFetch(1, filtroEstado, busqueda);
  }, [busqueda, filtroEstado, debouncedFetch]);

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
    switch (status) {
      case 'pending': return 'Pendiente'
      case 'diagnosed': return 'Diagnosticado'
      case 'in_progress': return 'En Proceso'
      case 'completed': return 'Completado'
      case 'delivered': return 'Entregado'
      case 'cancelled': return 'Cancelado'
      default: return status
    }
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

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'S/ 0.00'
    return `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
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

  const handleEditRepair = (repair: Repair) => {
    setEditingRepair(repair)
    onEditOpen()
  }

  const handleUpdateRepair = async (updateData: any) => {
    if (!editingRepair) return
    
    setUpdateLoading(true)
    try {
      const response = await fetch(`/api/repairs/${editingRepair.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar la reparación')
      }

      onEditClose()
      fetchRepairs()
      alert('Reparación actualizada exitosamente')
    } catch (err) {
      console.error('Error updating repair:', err)
      alert(err instanceof Error ? err.message : 'Error al actualizar la reparación')
    } finally {
      setUpdateLoading(false)
    }
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
      fetchRepairs(); // Recargar para ver el cambio
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
      fetchRepairs()
      alert('Reparación eliminada exitosamente')
    } catch (err) {
      console.error('Error deleting repair:', err)
      alert(err instanceof Error ? err.message : 'Error al eliminar la reparación')
    } finally {
      setDeleteLoading(false)
    }
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
          <div className="relative flex items-center gap-2">
            <Tooltip content="Cambiar estado" classNames={{ content: "bg-gray-900 text-white" }}>
              <Button isIconOnly variant="light" size="sm" onPress={() => handleStatusChange(repair)}>
                <ClipboardList className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </Button>
            </Tooltip>
            <Tooltip content="Ver detalles" classNames={{ content: "bg-gray-900 text-white" }}>
              <Button isIconOnly variant="light" size="sm" onPress={() => handleViewDetails(repair)}>
                <Eye className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </Button>
            </Tooltip>
            <Tooltip content="Editar" classNames={{ content: "bg-gray-900 text-white" }}>
              <Button isIconOnly variant="light" size="sm" onPress={() => handleEditRepair(repair)}>
                <Edit className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </Button>
            </Tooltip>
            <Tooltip content="Eliminar" classNames={{ content: "bg-gray-900 text-white" }}>
              <Button isIconOnly variant="light" size="sm" color="danger" onPress={() => handleDeleteRepair(repair)}>
                <Trash2 className="h-5 w-5" />
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
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64 rounded-lg" />
              <Skeleton className="h-4 w-96 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardBody className="p-6 space-y-3">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-8 w-12 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
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
            <h1 className={`text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent`}>
              Gestión de Reparaciones
            </h1>
            <p className={`${textColors.secondary} text-lg`}>
              Seguimiento de reparaciones y servicios técnicos
            </p>
          </div>
          
          <Button
            color="primary"
            size="lg"
            startContent={<Plus className="w-5 h-5" />}
            onPress={onCreateOpen}
            className="shadow-lg"
          >
            Nueva Reparación
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="hover:scale-105 transition-transform border-0 shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <Chip color="primary" variant="flat">Total</Chip>
              </div>
              <div className="space-y-2">
                <p className={`text-sm font-medium ${textColors.tertiary}`}>Total Reparaciones</p>
                <p className={`text-3xl font-bold ${textColors.primary}`}>{allStats.total}</p>
                <Progress value={100} color="primary" size="sm" />
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-transform border-0 shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <Chip color="default" variant="flat">Pendientes</Chip>
              </div>
              <div className="space-y-2">
                <p className={`text-sm font-medium ${textColors.tertiary}`}>Pendientes</p>
                <p className={`text-3xl font-bold text-gray-600`}>{allStats.pending}</p>
                <Progress value={(allStats.pending / Math.max(allStats.total, 1)) * 100} color="default" size="sm" />
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-transform border-0 shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <Chip color="warning" variant="flat">Proceso</Chip>
              </div>
              <div className="space-y-2">
                <p className={`text-sm font-medium ${textColors.tertiary}`}>En Proceso</p>
                <p className={`text-3xl font-bold text-orange-600`}>{allStats.inProgress}</p>
                <Progress value={(allStats.inProgress / Math.max(allStats.total, 1)) * 100} color="warning" size="sm" />
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-transform border-0 shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <Chip color="success" variant="flat">Listos</Chip>
              </div>
              <div className="space-y-2">
                <p className={`text-sm font-medium ${textColors.tertiary}`}>Completados</p>
                <p className={`text-3xl font-bold text-green-600`}>{allStats.completed}</p>
                <Progress value={(allStats.completed / Math.max(allStats.total, 1)) * 100} color="success" size="sm" />
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
                  placeholder="Buscar por título, cliente, dispositivo..."
                  startContent={<Search className="w-4 h-4 text-gray-400" />}
                  value={busqueda}
                  onValueChange={handleBusquedaChange}
                  variant="bordered"
                  size="lg"
                  classNames={{
                    input: "text-gray-900 placeholder:text-gray-500",
                    inputWrapper: "border-gray-300",
                  }}
                />
              </div>
              <div className="w-full md:w-64">
                <Select
                  placeholder="Filtrar por estado"
                  selectedKeys={new Set([filtroEstado])}
                  onSelectionChange={handleFiltroChange}
                  variant="bordered"
                  size="lg"
                  startContent={<Filter className="w-4 h-4" />}
                  className="text-gray-900 dark:text-gray-100"
                >
                  <SelectItem key="todos" className="text-gray-900">Todos los estados</SelectItem>
                  <SelectItem key="received" className="text-gray-900">Recibido</SelectItem>
                  <SelectItem key="diagnosed" className="text-gray-900">Diagnosticado</SelectItem>
                  <SelectItem key="in_progress" className="text-gray-900">En Proceso</SelectItem>
                  <SelectItem key="completed" className="text-gray-900">Completado</SelectItem>
                  <SelectItem key="delivered" className="text-gray-900">Entregado</SelectItem>
                  <SelectItem key="cancelled" className="text-gray-900">Cancelado</SelectItem>
                </Select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Lista de reparaciones */}
        <div className="mt-6">
          <Card>
            <CardBody>
              <Table 
                aria-label="Tabla de Reparaciones" 
                removeWrapper
                bottomContent={
                  !loading && pagination.totalPages > 1 ? (
                    <div className="flex w-full justify-center">
                      <Pagination
                        isCompact
                        showControls
                        showShadow
                        color="primary"
                        page={pagination.page}
                        total={pagination.totalPages}
                        onChange={(page) => fetchRepairs(page)}
                      />
                      </div>
                  ) : null
                }
              >
                <TableHeader columns={columns}>
                  {(column) => (
                    <TableColumn key={column.uid} className="bg-gray-100 text-gray-600 uppercase text-sm">
                      {column.name}
                    </TableColumn>
                  )}
                </TableHeader>
                <TableBody 
                  items={repairs} 
                  isLoading={loading}
                  loadingContent={<p>Cargando reparaciones...</p>}
                  emptyContent={"No se encontraron reparaciones que coincidan con los filtros."}
                >
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

        {/* Modal para crear reparación */}
        <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
          <ModalContent>
            <ModalHeader>
              <h2 className={`text-xl font-bold ${textColors.primary}`}>Nueva Reparación</h2>
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
        <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="3xl">
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
                           {selectedRepair.users?.email.includes('admin') || selectedRepair.users?.name?.toLowerCase().includes('admin') ? (
                             <Shield className="w-4 h-4 text-blue-600" />
                           ) : (
                             <User className="w-4 h-4 text-blue-600" />
                           )}
                         </div>
                         <div className="flex-1">
                           <p className="text-sm font-medium text-blue-800">Creado por</p>
                           <p className="text-base font-semibold text-blue-900">
                             {selectedRepair.users ? selectedRepair.users.name : 'Usuario desconocido'}
                           </p>
                           <p className="text-xs text-blue-600">
                             {selectedRepair.users ? selectedRepair.users.email : 'Sin información de contacto'}
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
                             color={selectedRepair.users?.email.includes('admin') || selectedRepair.users?.name?.toLowerCase().includes('admin') ? 'warning' : 'primary'}
                             variant="flat" 
                             size="sm"
                             startContent={selectedRepair.users?.email.includes('admin') || selectedRepair.users?.name?.toLowerCase().includes('admin') ? 
                               <Shield className="w-3 h-3" /> : 
                               <User className="w-3 h-3" />
                             }
                           >
                             {selectedRepair.users?.email.includes('admin') || selectedRepair.users?.name?.toLowerCase().includes('admin') ? 
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
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Modal de eliminación */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
          <ModalContent>
            <ModalHeader>
              <h3 className={`text-xl font-bold ${textColors.primary}`}>Confirmar Eliminación</h3>
            </ModalHeader>
            <ModalBody>
              {selectedRepair && (
                <div className="space-y-4">
                  <p className={textColors.secondary}>¿Estás seguro de que deseas eliminar esta reparación?</p>
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
                Eliminar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal para cambiar estado */}
        <Modal isOpen={isStatusOpen} onClose={onStatusClose}>
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