'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import debounce from 'lodash.debounce'
import DashboardLayout from '../components/DashboardLayout'
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
  CardFooter
} from '@heroui/react'
import FormField from '@/app/components/ui/FormField'
import { textColors } from '@/lib/utils/colors'
import { 
  Smartphone, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Battery, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Clock,
  Monitor,
  Tablet,
  Laptop,
  Watch,
  Calendar,
  User,
  MoreVertical
} from 'lucide-react'

interface Device {
  id: string
  brand: string
  model: string
  device_type: string
  status: 'in_store' | 'in_repair' | 'awaiting_parts' | 'ready_for_pickup' | 'delivered' | 'irreparable' | 'in_unlock'
  serial_number: string | null
  imei: string | null
  color: string | null
  storage_capacity: string | null
  operating_system: string | null
  notes: string | null
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
  repairs: Array<{
    id: string
    title: string
    status: string
    created_at: string
  }>
  totalReparaciones: number
  ultimaReparacion: string | null
  estadoActual: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function DispositivosPage() {
  const router = useRouter()

  // REDIRECCIÓN AUTOMÁTICA - Apartado de dispositivos temporalmente deshabilitado
  useEffect(() => {
    router.push('/dashboard/owner/clientes')
  }, [router])

  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroMarca, setFiltroMarca] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [updateLoading, setUpdateLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })
  
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    imei: '',
    color: '',
    storage_capacity: '',
    serial_number: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)

  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure()
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const { isOpen: isStatusOpen, onOpen: onStatusOpen, onClose: onStatusClose } = useDisclosure()

  const fetchDevices = async (page = 1, marca = filtroMarca, search = busqueda) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      })
      
      if (marca !== 'todos') params.append('marca', marca)
      if (search.trim()) params.append('search', search.trim())

      const response = await fetch(`/api/devices?${params}`)
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error desconocido')
      }
      
      setDevices(result.data || [])
      setPagination(result.pagination || {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0
      })
      
    } catch (fetchError) {
      console.error('Error fetching devices:', fetchError)
      setError(fetchError instanceof Error ? fetchError.message : 'Error desconocido')
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
    } catch (err) {
      console.error('Error fetching customers:', err)
    }
  }

  useEffect(() => {
    fetchDevices()
    fetchCustomers()
  }, [])

  const handleMarcaChange = (keys: any) => {
    const marca = Array.from(keys)[0] as string || 'todos'
    setFiltroMarca(marca)
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchDevices(1, marca, busqueda)
  }

  const debouncedFetch = useCallback(
    debounce((search: string) => {
      setPagination(prev => ({ ...prev, page: 1 }))
      fetchDevices(1, filtroMarca, search);
    }, 300),
    [filtroMarca]
  );

  useEffect(() => {
    debouncedFetch(busqueda);
  }, [busqueda, debouncedFetch]);

  const handleBusquedaChange = (search: string) => {
    setBusqueda(search)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomerId) {
      alert('Por favor selecciona un cliente')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          customer_id: selectedCustomerId
        }),
      })

      if (!response.ok) {
        throw new Error('Error al registrar dispositivo')
      }

      setFormData({
        brand: '',
        model: '',
        imei: '',
        color: '',
        storage_capacity: '',
        serial_number: '',
        notes: ''
      })
      setSelectedCustomerId('')
      onCreateClose()
      fetchDevices()
      
    } catch (err) {
      console.error('Error creating device:', err)
      alert(err instanceof Error ? err.message : 'Error al registrar el dispositivo')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'en_reparacion': return 'warning'
      case 'entregado': return 'success'
      case 'pendiente': return 'default'
      default: return 'default'
    }
  }

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'en_reparacion': return 'En Reparación'
      case 'entregado': return 'Entregado'
      case 'pendiente': return 'Pendiente'
      default: return estado
    }
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartphone': return Smartphone
      case 'tablet': return Tablet
      case 'laptop': return Laptop
      case 'console': return HardDrive
      case 'desktop': return Monitor
      default: return Watch
    }
  }

  const getBrandColor = (brand: string) => {
    const colors: { [key: string]: string } = {
      'Apple': 'bg-gradient-to-br from-gray-400 to-gray-600',
      'Samsung': 'bg-gradient-to-br from-blue-400 to-blue-600',
      'Huawei': 'bg-gradient-to-br from-red-400 to-red-600',
      'Xiaomi': 'bg-gradient-to-br from-orange-400 to-orange-600',
      'LG': 'bg-gradient-to-br from-purple-400 to-purple-600',
      'Sony': 'bg-gradient-to-br from-indigo-400 to-indigo-600',
      'Motorola': 'bg-gradient-to-br from-green-400 to-green-600',
      'Nokia': 'bg-gradient-to-br from-cyan-400 to-cyan-600',
      'OnePlus': 'bg-gradient-to-br from-pink-400 to-pink-600'
    }
    return colors[brand] || 'bg-gradient-to-br from-gray-400 to-gray-600'
  }

  const stats = {
    total: pagination.total,
    smartphones: devices.filter(d => d.device_type === 'smartphone').length,
    enReparacion: devices.filter(d => d.status === 'in_repair' || d.status === 'awaiting_parts').length,
    entregados: devices.filter(d => d.status === 'delivered').length
  }

  // Funciones CRUD
  const handleViewDetails = (device: Device) => {
    setSelectedDevice(device)
    onDetailOpen()
  }

  const handleEditDevice = (device: Device) => {
    setEditingDevice(device)
    onEditOpen()
  }

  const handleUpdateDevice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDevice) return
    
    setUpdateLoading(true)
    try {
      const response = await fetch(`/api/devices/${editingDevice.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingDevice),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar el dispositivo')
      }

      onEditClose()
      fetchDevices()
      alert('Dispositivo actualizado exitosamente')
    } catch (err) {
      console.error('Error updating device:', err)
      alert(err instanceof Error ? err.message : 'Error al actualizar el dispositivo')
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleDeleteDevice = (device: Device) => {
    setSelectedDevice(device)
    onDeleteOpen()
  }

  const confirmDeleteDevice = async () => {
    if (!selectedDevice) return
    
    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/devices/${selectedDevice.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar el dispositivo')
      }

      onDeleteClose()
      fetchDevices()
      alert('Dispositivo eliminado exitosamente')
    } catch (err) {
      console.error('Error deleting device:', err)
      alert(err instanceof Error ? err.message : 'Error al eliminar el dispositivo')
    } finally {
      setDeleteLoading(false)
    }
  }

  const getCustomerName = (customer: Device['customers']) => {
    if (!customer) return 'Sin cliente'
    return customer.name || customer.anonymous_identifier || 'Cliente Anónimo'
  }

  const handleStatusChangeClick = (device: Device) => {
    setSelectedDevice(device);
    onStatusOpen();
  };

  const handleStatusChange = async (deviceId: string, newStatus: Device['status']) => {
    // Optimistic UI update
    setDevices(prevDevices => 
      prevDevices.map(d => d.id === deviceId ? { ...d, status: newStatus } : d)
    );

    try {
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el estado');
      }
      
      // La UI ya está actualizada, opcionalmente podrías volver a hacer fetch
      // fetchDevices(pagination.page);

    } catch (error) {
      console.error('Failed to update status:', error);
      // Revertir en caso de error
      fetchDevices(pagination.page); 
      alert('No se pudo actualizar el estado. Reintentando...');
    }
  };

  const DeviceStatusBadge = ({ status }: { status: Device['status'] }) => {
    const statusConfig = {
      in_store: { label: 'En Tienda', color: 'default' as const },
      in_repair: { label: 'En Reparación', color: 'warning' as const },
      awaiting_parts: { label: 'Esperando Piezas', color: 'secondary' as const },
      ready_for_pickup: { label: 'Listo para Recoger', color: 'primary' as const },
      delivered: { label: 'Entregado', color: 'success' as const },
      irreparable: { label: 'Irreparable', color: 'danger' as const },
      in_unlock: { label: 'En Desbloqueo', color: 'secondary' as const },
    };

    const { label, color } = statusConfig[status] || { label: 'Desconocido', color: 'default' as const };

    return <Chip color={color} size="sm" className="ml-2">{label}</Chip>;
  };

  const DeviceActions = ({ device }: { device: Device }) => (
    <div className="flex justify-end gap-1">
      <Tooltip content="Cambiar Estado" classNames={{ content: "bg-gray-900 text-white" }}>
        <Button isIconOnly variant="flat" size="sm" onPress={() => handleStatusChangeClick(device)}>
          <Clock className="w-4 h-4" />
        </Button>
      </Tooltip>
      <Tooltip content="Ver Detalles" classNames={{ content: "bg-gray-900 text-white" }}>
        <Button isIconOnly variant="flat" size="sm" onPress={() => handleViewDetails(device)}>
          <Eye className="w-4 h-4" />
        </Button>
      </Tooltip>
      <Tooltip content="Editar" classNames={{ content: "bg-gray-900 text-white" }}>
        <Button isIconOnly variant="flat" size="sm" onPress={() => handleEditDevice(device)}>
          <Edit className="w-4 h-4" />
        </Button>
      </Tooltip>
      <Tooltip content="Eliminar" classNames={{ content: "bg-gray-900 text-white" }}>
        <Button isIconOnly variant="flat" size="sm" color="danger" onPress={() => handleDeleteDevice(device)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </Tooltip>
    </div>
  );

  const RenderDevices = () => (
    <>
      {/* Tabla para vista de escritorio */}
      <div className="hidden md:block">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dispositivo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cliente</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reparaciones</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Última Actualización</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {devices.map(device => {
              const Icon = getDeviceIcon(device.device_type);
              return (
                <tr key={device.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <Avatar 
                        icon={<Icon className="w-5 h-5" />}
                        size="sm"
                        classNames={{
                          base: getBrandColor(device.brand)
                        }}
                      />
                      <div className="ml-3">
                        <p className="font-semibold text-gray-800">{device.brand} {device.model}</p>
                        <p className="text-xs text-gray-500">{device.imei || device.serial_number || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{getCustomerName(device.customers)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <DeviceStatusBadge status={device.status} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{device.totalReparaciones > 0 ? `${device.totalReparaciones}` : '0'}</p>
                    {device.totalReparaciones > 0 && device.ultimaReparacion && (
                      <p className="text-xs text-gray-500">{new Date(device.ultimaReparacion).toLocaleDateString()}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{new Date(device.updated_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-3">
                    <DeviceActions device={device} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Tarjetas para vista móvil */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:hidden">
        {devices.map((device) => {
          const Icon = getDeviceIcon(device.device_type);
          return (
            <Card key={device.id} className="shadow-lg flex flex-col">
              <CardHeader className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="font-bold text-gray-800">{device.brand} {device.model}</h3>
                  <p className="text-sm text-gray-500 -mt-1">{getCustomerName(device.customers)}</p>
                </div>
                <Avatar 
                    icon={<Icon className="w-5 h-5" />}
                    size="sm"
                    classNames={{ base: getBrandColor(device.brand) }}
                  />
              </CardHeader>
              <CardBody className="py-2 px-3 flex-grow">
                <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>IMEI/Serie:</strong> {device.imei || device.serial_number || 'N/A'}</p>
                    <p><strong>Registrado:</strong> {new Date(device.created_at).toLocaleDateString()}</p>
                </div>
              </CardBody>
              <CardFooter className="p-2 border-t">
                <DeviceActions device={device} />
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </>
  );

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
            <h1 className={`text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent`}>
              Gestión de Dispositivos
            </h1>
            <p className={`${textColors.secondary} text-lg`}>
              Registro de dispositivos y equipos
            </p>
          </div>
          
          <Button
            color="primary"
            size="lg"
            startContent={<Plus className="w-5 h-5" />}
            onPress={onCreateOpen}
            className="shadow-lg"
          >
            Registrar Dispositivo
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="hover:scale-105 transition-transform border-0 shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <Chip color="primary" variant="flat">Total</Chip>
              </div>
              <div className="space-y-2">
                <p className={`text-sm font-medium ${textColors.tertiary}`}>Total Dispositivos</p>
                <p className={`text-3xl font-bold ${textColors.primary}`}>{stats.total}</p>
                <Progress value={100} color="primary" size="sm" />
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-transform border-0 shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <Chip color="primary" variant="flat">Móviles</Chip>
              </div>
              <div className="space-y-2">
                <p className={`text-sm font-medium ${textColors.tertiary}`}>Smartphones</p>
                <p className={`text-3xl font-bold text-blue-600`}>{stats.smartphones}</p>
                <Progress value={(stats.smartphones / Math.max(stats.total, 1)) * 100} color="primary" size="sm" />
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-transform border-0 shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <Chip color="warning" variant="flat">Proceso</Chip>
              </div>
              <div className="space-y-2">
                <p className={`text-sm font-medium ${textColors.tertiary}`}>En Reparación</p>
                <p className={`text-3xl font-bold text-orange-600`}>{stats.enReparacion}</p>
                <Progress value={(stats.enReparacion / Math.max(stats.total, 1)) * 100} color="warning" size="sm" />
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-transform border-0 shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <Chip color="success" variant="flat">Listos</Chip>
              </div>
              <div className="space-y-2">
                <p className={`text-sm font-medium ${textColors.tertiary}`}>Entregados</p>
                <p className={`text-3xl font-bold text-green-600`}>{stats.entregados}</p>
                <Progress value={(stats.entregados / Math.max(stats.total, 1)) * 100} color="success" size="sm" />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardBody className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
                <Input
                placeholder="Buscar por marca, modelo, serie, IMEI..."
                  value={busqueda}
                  onValueChange={handleBusquedaChange}
                startContent={<Search className="w-4 h-4 text-gray-400" />}
                className="flex-1"
                  variant="bordered"
                classNames={{
                  input: "text-gray-900 placeholder:text-gray-500",
                  inputWrapper: "border-gray-300",
                }}
                />
                <Select
                  placeholder="Filtrar por marca"
                  selectedKeys={new Set([filtroMarca])}
                  onSelectionChange={handleMarcaChange}
                className="w-full md:w-56"
                  variant="bordered"
                classNames={{
                  trigger: "text-gray-900",
                  value: "text-gray-900",
                  popoverContent: "bg-white",
                }}
              >
                <SelectItem key="todos" className="text-gray-900">Todas las marcas</SelectItem>
                <SelectItem key="Apple" className="text-gray-900">Apple</SelectItem>
                <SelectItem key="Samsung" className="text-gray-900">Samsung</SelectItem>
                <SelectItem key="Xiaomi" className="text-gray-900">Xiaomi</SelectItem>
                <SelectItem key="Huawei" className="text-gray-900">Huawei</SelectItem>
                <SelectItem key="Motorola" className="text-gray-900">Motorola</SelectItem>
                <SelectItem key="LG" className="text-gray-900">LG</SelectItem>
                <SelectItem key="Otro" className="text-gray-900">Otro</SelectItem>
                </Select>
            </div>
          </CardBody>
        </Card>

        {/* Lista de dispositivos */}
        <RenderDevices />

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination
              total={pagination.totalPages}
              page={pagination.page}
              onChange={(page) => fetchDevices(page, filtroMarca, busqueda)}
              showControls
              color="primary"
              size="lg"
            />
          </div>
        )}

        {/* Modal de registro */}
        <Modal 
          isOpen={isCreateOpen} 
          onClose={onCreateClose} 
          size="2xl"
          scrollBehavior="inside"
          classNames={{
            wrapper: "z-[1000]",
            backdrop: "z-[999] bg-black/40 backdrop-blur-sm",
            base: "!rounded-3xl shadow-2xl border-0 bg-white my-4 mx-4 sm:my-6 sm:mx-6 md:mx-8 lg:mx-12",
            body: "max-h-[70vh] overflow-y-auto p-6 md:p-8",
            header: "border-b border-gray-200/50 p-6 md:p-8 bg-gradient-to-r from-green-50/50 to-white !rounded-t-3xl",
            footer: "border-t border-gray-200/50 p-6 md:p-8 bg-gradient-to-r from-green-50/50 to-white !rounded-b-3xl"
          }}
        >
          <ModalContent>
            <form onSubmit={handleSubmit}>
              <ModalHeader>
                <h2 className="text-xl font-bold">Registrar Nuevo Dispositivo</h2>
              </ModalHeader>
              <ModalBody className="space-y-4">
                <FormField
                  label="Cliente propietario"
                  name="customer_id"
                  type="select"
                  value={selectedCustomerId}
                  onChange={setSelectedCustomerId}
                  required
                  options={customers.map(customer => ({
                    value: customer.id,
                    label: customer.name || customer.anonymous_identifier || `Cliente ${customer.id}`
                  }))}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Marca"
                    name="brand"
                    value={formData.brand}
                    onChange={(value) => setFormData(prev => ({ ...prev, brand: value }))}
                    placeholder="iPhone, Samsung, Xiaomi..."
                    required
                  />
                  <FormField
                    label="Modelo"
                    name="model"
                    value={formData.model}
                    onChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
                    placeholder="iPhone 14, Galaxy S23..."
                    required
                  />
                </div>

                <FormField
                  label="IMEI"
                  name="imei"
                  value={formData.imei}
                  onChange={(value) => setFormData(prev => ({ ...prev, imei: value }))}
                  placeholder="15 dígitos del IMEI"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Color"
                    name="color"
                    value={formData.color}
                    onChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
                    placeholder="Negro, Blanco, Azul..."
                  />
                  <FormField
                    label="Almacenamiento"
                    name="storage_capacity"
                    value={formData.storage_capacity}
                    onChange={(value) => setFormData(prev => ({ ...prev, storage_capacity: value }))}
                    placeholder="128GB, 256GB, 512GB..."
                  />
                </div>

                <FormField
                  label="Número de serie"
                  name="serial_number"
                  value={formData.serial_number}
                  onChange={(value) => setFormData(prev => ({ ...prev, serial_number: value }))}
                  placeholder="Número de serie del dispositivo"
                />

                <FormField
                  label="Notas adicionales"
                  name="notes"
                  type="textarea"
                  value={formData.notes}
                  onChange={(value) => setFormData(prev => ({ ...prev, notes: value }))}
                  placeholder="Condición del dispositivo, accesorios incluidos..."
                  rows={3}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onCreateClose}>Cancelar</Button>
                <Button 
                  type="submit" 
                  color="primary" 
                  isLoading={submitting}
                  startContent={!submitting ? <Plus className="w-4 h-4" /> : null}
                >
                  Registrar Dispositivo
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>

        {/* Modal de detalles */}
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
            header: "border-b border-gray-200/50 p-4 sm:p-6 md:p-8 bg-gradient-to-r from-blue-50/50 to-white !rounded-t-3xl",
            footer: "border-t border-gray-200/50 p-4 sm:p-6 md:p-8 bg-gradient-to-r from-blue-50/50 to-white !rounded-b-3xl"
          }}
        >
          <ModalContent>
            {selectedDevice && (
                             <React.Fragment>
                 <ModalHeader>
                   <h2 className="text-xl font-bold">Detalles del Dispositivo</h2>
                 </ModalHeader>
                <ModalBody className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar
                      icon={React.createElement(getDeviceIcon(selectedDevice.device_type), { className: "w-8 h-8" })}
                      classNames={{
                        base: `${getBrandColor(selectedDevice.brand)} p-2`,
                        icon: "text-white"
                      }}
                      size="lg"
                    />
                    <div>
                      <h3 className={`text-2xl font-semibold ${textColors.primary}`}>
                        {selectedDevice.brand} {selectedDevice.model}
                      </h3>
                      <DeviceStatusBadge status={selectedDevice.status} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedDevice.imei && (
                      <div className="flex justify-between">
                        <span className={`text-sm ${textColors.muted}`}>IMEI:</span>
                        <span className={`text-sm ${textColors.secondary}`}>{selectedDevice.imei}</span>
                      </div>
                    )}
                    {selectedDevice.color && (
                      <div className="flex justify-between">
                        <span className={`text-sm ${textColors.muted}`}>Color:</span>
                        <span className={`text-sm ${textColors.secondary}`}>{selectedDevice.color}</span>
                      </div>
                    )}
                    {selectedDevice.storage_capacity && (
                      <div className="flex justify-between">
                        <span className={`text-sm ${textColors.muted}`}>Almacenamiento:</span>
                        <span className={`text-sm ${textColors.secondary}`}>{selectedDevice.storage_capacity}</span>
                      </div>
                    )}
                  </div>

                  {selectedDevice.customers && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className={`text-sm font-medium ${textColors.primary}`}>
                          {getCustomerName(selectedDevice.customers)}
                        </span>
                      </div>
                    </div>
                  )}
                                 </ModalBody>
                 <ModalFooter>
                   <Button color="default" variant="light" onPress={onDetailClose}>
                     Cerrar
                   </Button>
                 </ModalFooter>
               </React.Fragment>
             )}
           </ModalContent>
        </Modal>

        {/* Modal de edición */}
        <Modal 
          isOpen={isEditOpen} 
          onClose={onEditClose} 
          size="2xl"
          scrollBehavior="inside"
          classNames={{
            wrapper: "z-[1000]",
            backdrop: "z-[999] bg-black/40 backdrop-blur-sm",
            base: "!rounded-3xl shadow-2xl border-0 bg-white my-4 mx-4 sm:my-6 sm:mx-6 md:mx-8 lg:mx-12",
            body: "max-h-[70vh] overflow-y-auto p-6 md:p-8",
            header: "border-b border-gray-200/50 p-6 md:p-8 bg-gradient-to-r from-yellow-50/50 to-white !rounded-t-3xl",
            footer: "border-t border-gray-200/50 p-6 md:p-8 bg-gradient-to-r from-yellow-50/50 to-white !rounded-b-3xl"
          }}
        >
          <ModalContent>
            {(onClose) => (
              <form id="edit-device-form" onSubmit={handleUpdateDevice}>
                <ModalHeader>
                  <h2 className="text-xl font-bold">Editar Dispositivo</h2>
                </ModalHeader>
                {editingDevice && (
                  <ModalBody className="space-y-4">
                    <FormField
                      label="Cliente propietario"
                      name="customer_id"
                      type="select"
                      value={editingDevice.customers?.id || ''}
                      onChange={(value) => setEditingDevice(prev => prev ? { ...prev, customers: customers.find(c => c.id === value) || null } : null)}
                      required
                      options={customers.map(customer => ({
                        value: customer.id,
                        label: customer.name || customer.anonymous_identifier || `Cliente ${customer.id}`
                      }))}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Marca"
                        name="brand"
                        value={editingDevice.brand}
                        onChange={(value) => setEditingDevice(prev => prev ? { ...prev, brand: value } : null)}
                        placeholder="iPhone, Samsung, Xiaomi..."
                        required
                      />
                      <FormField
                        label="Modelo"
                        name="model"
                        value={editingDevice.model}
                        onChange={(value) => setEditingDevice(prev => prev ? { ...prev, model: value } : null)}
                        placeholder="iPhone 14, Galaxy S23..."
                        required
                      />
                    </div>

                    <FormField
                      label="IMEI"
                      name="imei"
                      value={editingDevice.imei || ''}
                      onChange={(value) => setEditingDevice(prev => prev ? { ...prev, imei: value } : null)}
                      placeholder="15 dígitos del IMEI"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Color"
                        name="color"
                        value={editingDevice.color || ''}
                        onChange={(value) => setEditingDevice(prev => prev ? { ...prev, color: value } : null)}
                        placeholder="Negro, Blanco, Azul..."
                      />
                      <FormField
                        label="Almacenamiento"
                        name="storage_capacity"
                        value={editingDevice.storage_capacity || ''}
                        onChange={(value) => setEditingDevice(prev => prev ? { ...prev, storage_capacity: value } : null)}
                        placeholder="128GB, 256GB, 512GB..."
                      />
                    </div>

                    <FormField
                      label="Número de serie"
                      name="serial_number"
                      value={editingDevice.serial_number || ''}
                      onChange={(value) => setEditingDevice(prev => prev ? { ...prev, serial_number: value } : null)}
                      placeholder="Número de serie del dispositivo"
                    />

                    <FormField
                      label="Notas adicionales"
                      name="notes"
                      type="textarea"
                      value={editingDevice.notes || ''}
                      onChange={(value) => setEditingDevice(prev => prev ? { ...prev, notes: value } : null)}
                      placeholder="Condición del dispositivo, accesorios incluidos..."
                      rows={3}
                    />
                  </ModalBody>
                )}
                <ModalFooter>
                  <Button variant="flat" onPress={onClose}>Cancelar</Button>
                  <Button 
                    type="submit" 
                    form="edit-device-form"
                    color="primary" 
                    isLoading={updateLoading}
                    startContent={!updateLoading ? <Plus className="w-4 h-4" /> : null}
                  >
                    Actualizar Dispositivo
                  </Button>
                </ModalFooter>
              </form>
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
            backdrop: "z-[999] bg-black/40 backdrop-blur-sm",
            base: "!rounded-3xl shadow-2xl border-0 bg-white my-4 mx-4 sm:my-6 sm:mx-6 md:mx-8 lg:mx-12",
            body: "p-6 md:p-8",
            header: "border-b border-gray-200/50 p-6 md:p-8 bg-gradient-to-r from-red-50/50 to-white !rounded-t-3xl",
            footer: "border-t border-gray-200/50 p-6 md:p-8 bg-gradient-to-r from-red-50/50 to-white !rounded-b-3xl"
          }}
        >
          <ModalContent>
            <ModalHeader>
              <h2 className="text-xl font-bold">Eliminar Dispositivo</h2>
            </ModalHeader>
            <ModalBody className="space-y-4">
              <p>¿Estás seguro de que quieres eliminar este dispositivo?</p>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onDeleteClose}>Cancelar</Button>
              <Button 
                type="submit" 
                color="danger" 
                isLoading={deleteLoading}
                startContent={!deleteLoading ? <Trash2 className="w-4 h-4" /> : null}
                onPress={confirmDeleteDevice}
              >
                Eliminar Dispositivo
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal de cambio de estado */}
        <Modal 
          isOpen={isStatusOpen} 
          onClose={onStatusClose} 
          size="2xl"
          scrollBehavior="inside"
          classNames={{
            wrapper: "z-[1000]",
            backdrop: "z-[999] bg-black/40 backdrop-blur-sm",
            base: "!rounded-3xl shadow-2xl border-0 bg-white my-4 mx-4 sm:my-6 sm:mx-6 md:mx-8 lg:mx-12",
            body: "max-h-[70vh] overflow-y-auto p-6 md:p-8",
            header: "border-b border-gray-200/50 p-6 md:p-8 bg-gradient-to-r from-purple-50/50 to-white !rounded-t-3xl",
            footer: "border-t border-gray-200/50 p-6 md:p-8 bg-gradient-to-r from-purple-50/50 to-white !rounded-b-3xl"
          }}
        >
          <ModalContent>
            <ModalHeader>
              <h2 className="text-xl font-bold">Cambiar Estado del Dispositivo</h2>
            </ModalHeader>
            <ModalBody className="space-y-4">
              {selectedDevice && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar
                      icon={React.createElement(getDeviceIcon(selectedDevice.device_type), { className: "w-8 h-8" })}
                      classNames={{
                        base: `${getBrandColor(selectedDevice.brand)} p-2`,
                        icon: "text-white"
                      }}
                      size="lg"
                    />
                    <div>
                      <h3 className={`text-xl font-semibold ${textColors.primary}`}>
                        {selectedDevice.brand} {selectedDevice.model}
                      </h3>
                      <DeviceStatusBadge status={selectedDevice.status} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      color="default"
                      variant={selectedDevice.status === 'in_store' ? 'solid' : 'flat'}
                      onPress={() => handleStatusChange(selectedDevice.id, 'in_store')}
                      className="w-full"
                    >
                      En Tienda
                    </Button>
                    <Button
                      color="warning"
                      variant={selectedDevice.status === 'in_repair' ? 'solid' : 'flat'}
                      onPress={() => handleStatusChange(selectedDevice.id, 'in_repair')}
                      className="w-full"
                    >
                      En Reparación
                    </Button>
                    <Button
                      color="secondary"
                      variant={selectedDevice.status === 'awaiting_parts' ? 'solid' : 'flat'}
                      onPress={() => handleStatusChange(selectedDevice.id, 'awaiting_parts')}
                      className="w-full"
                    >
                      Esperando Piezas
                    </Button>
                    <Button
                      color="primary"
                      variant={selectedDevice.status === 'ready_for_pickup' ? 'solid' : 'flat'}
                      onPress={() => handleStatusChange(selectedDevice.id, 'ready_for_pickup')}
                      className="w-full"
                    >
                      Listo para Recoger
                    </Button>
                    <Button
                      color="success"
                      variant={selectedDevice.status === 'delivered' ? 'solid' : 'flat'}
                      onPress={() => handleStatusChange(selectedDevice.id, 'delivered')}
                      className="w-full"
                    >
                      Entregado
                    </Button>
                    <Button
                      color="danger"
                      variant={selectedDevice.status === 'irreparable' ? 'solid' : 'flat'}
                      onPress={() => handleStatusChange(selectedDevice.id, 'irreparable')}
                      className="w-full"
                    >
                      Irreparable
                    </Button>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onStatusClose}>
                Cerrar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </DashboardLayout>
  )
} 