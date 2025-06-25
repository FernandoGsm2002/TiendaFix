'use client'

import { useState, useEffect } from 'react'
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
  Progress
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
  User, 
  Phone, 
  Mail, 
  Star, 
  AlertTriangle, 
  X,
  TrendingUp,
  Users,
  UserCheck,
  ShoppingBag
} from 'lucide-react'

interface Customer {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  address: string | null
  customer_type: string
  is_recurrent: boolean
  anonymous_identifier: string | null
  notes: string | null
  created_at: string
  updated_at: string
  stats: {
    totalReparaciones: number
    pendientes: number
    completadas: number
    entregadas: number
    totalGastado: number
  }
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface NewCustomerForm {
  name: string
  email: string
  phone: string
  address: string
  customer_type: string
  anonymous_identifier: string
}

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })

  // Estados para los modales
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  const [newCustomer, setNewCustomer] = useState<NewCustomerForm>({
    name: '',
    email: '',
    phone: '',
    address: '',
    customer_type: 'identified',
    anonymous_identifier: ''
  })

  // Controles para los modales
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure()
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()

  const fetchCustomers = async (page = 1, tipo = filtroTipo, search = busqueda) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      })
      
      if (tipo !== 'todos') params.append('type', tipo)
      if (search.trim()) params.append('search', search.trim())

      const response = await fetch(`/api/customers?${params}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar clientes')
      }
      
      const data = await response.json()
      setCustomers(data.data)
      setPagination(data.pagination)
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleTipoChange = (keys: any) => {
    const tipo = Array.from(keys)[0] as string || 'todos'
    setFiltroTipo(tipo)
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchCustomers(1, tipo, busqueda)
  }

  const handleBusquedaChange = (search: string) => {
    setBusqueda(search)
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchCustomers(1, filtroTipo, search)
  }

  const handlePageChange = (newPage: number) => {
    fetchCustomers(newPage, filtroTipo, busqueda)
  }

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCustomer),
      })

      if (!response.ok) {
        throw new Error('Error al crear el cliente')
      }

      const result = await response.json()
      
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        address: '',
        customer_type: 'identified',
        anonymous_identifier: ''
      })
      onCreateClose()
      fetchCustomers()
      
    } catch (err) {
      console.error('Error creating customer:', err)
      alert(err instanceof Error ? err.message : 'Error al crear el cliente')
    } finally {
      setCreateLoading(false)
    }
  }

  // Función para ver detalles
  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer)
    onDetailOpen()
  }

  // Función para editar
  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    onEditOpen()
  }

  // Función para actualizar cliente
  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCustomer) return
    
    setUpdateLoading(true)

    try {
      const response = await fetch(`/api/customers/${editingCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingCustomer),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el cliente')
      }

      onEditClose()
      setEditingCustomer(null)
      fetchCustomers()
      
    } catch (err) {
      console.error('Error updating customer:', err)
      alert(err instanceof Error ? err.message : 'Error al actualizar el cliente')
    } finally {
      setUpdateLoading(false)
    }
  }

  // Función para confirmar eliminación
  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    onDeleteOpen()
  }

  // Función para eliminar cliente
  const confirmDeleteCustomer = async () => {
    if (!selectedCustomer) return
    
    setDeleteLoading(true)

    try {
      const response = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar el cliente')
      }

      onDeleteClose()
      setSelectedCustomer(null)
      fetchCustomers()
      
    } catch (err) {
      console.error('Error deleting customer:', err)
      alert(err instanceof Error ? err.message : 'Error al eliminar el cliente')
    } finally {
      setDeleteLoading(false)
    }
  }

  const getBadgeColor = (type: string, isRecurrent: boolean) => {
    if (isRecurrent) return 'success'
    switch (type) {
      case 'identified': return 'primary'
      case 'anonymous': return 'default'
      default: return 'default'
    }
  }

  const getBadgeLabel = (type: string, isRecurrent: boolean) => {
    if (isRecurrent) return 'Cliente VIP'
    switch (type) {
      case 'identified': return 'Registrado'
      case 'anonymous': return 'Anónimo'
      default: return type
    }
  }

  const formatCurrency = (amount: number | undefined | null) => {
    if (!amount || amount === 0) return 'S/ 0.00'
    return `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
  }

  const getCustomerDisplayName = (customer: Customer) => {
    return customer.name || customer.anonymous_identifier || 'Cliente Anónimo'
  }

  // Estadísticas
  const stats = {
    total: pagination.total,
    identificados: customers.filter(c => c.customer_type === 'identified').length,
    vip: customers.filter(c => c.is_recurrent).length,
    anonimos: customers.filter(c => c.customer_type === 'anonymous').length
  }

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

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardBody className="p-6 space-y-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-6 w-32 rounded" />
                  <Skeleton className="h-4 w-48 rounded" />
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
        {/* Header mejorado */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <h1 className={`text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent`}>
              Gestión de Clientes
            </h1>
            <p className={`${textColors.secondary} text-lg`}>
              Administra tu base de clientes y sus datos
            </p>
          </div>
          
          <Button
            color="primary"
            size="lg"
            startContent={<Plus className="w-5 h-5" />}
            onPress={onCreateOpen}
            className="shadow-lg"
          >
            Nuevo Cliente
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="hover:scale-105 transition-transform border-0 shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <Chip color="primary" variant="flat">Total</Chip>
              </div>
              <div className="space-y-2">
                <p className={`text-sm font-medium ${textColors.tertiary}`}>Total de Clientes</p>
                <p className={`text-3xl font-bold ${textColors.primary}`}>{stats.total}</p>
                <Progress value={100} color="primary" size="sm" />
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-transform border-0 shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <Chip color="success" variant="flat">Registrados</Chip>
              </div>
              <div className="space-y-2">
                <p className={`text-sm font-medium ${textColors.tertiary}`}>Clientes Registrados</p>
                <p className={`text-3xl font-bold text-green-600`}>{stats.identificados}</p>
                <Progress value={(stats.identificados / Math.max(stats.total, 1)) * 100} color="success" size="sm" />
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-transform border-0 shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <Chip color="secondary" variant="flat">VIP</Chip>
              </div>
              <div className="space-y-2">
                <p className={`text-sm font-medium ${textColors.tertiary}`}>Clientes VIP</p>
                <p className={`text-3xl font-bold text-purple-600`}>{stats.vip}</p>
                <Progress value={(stats.vip / Math.max(stats.total, 1)) * 100} color="secondary" size="sm" />
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-transform border-0 shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <Chip color="warning" variant="flat">Anónimos</Chip>
              </div>
              <div className="space-y-2">
                <p className={`text-sm font-medium ${textColors.tertiary}`}>Clientes Anónimos</p>
                <p className={`text-3xl font-bold text-orange-600`}>{stats.anonimos}</p>
                <Progress value={(stats.anonimos / Math.max(stats.total, 1)) * 100} color="warning" size="sm" />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardBody>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <Input
                  placeholder="Buscar por nombre, correo, teléfono o identificador..."
                  value={busqueda}
                  onValueChange={handleBusquedaChange}
                  startContent={<Search className="w-4 h-4 text-gray-400" />}
                  variant="bordered"
                  classNames={{
                    input: "text-gray-900 placeholder:text-gray-500",
                    inputWrapper: "border-gray-300",
                  }}
                />
              </div>
              <div className="w-full md:w-auto">
                <Select
                  placeholder="Filtrar por tipo"
                  selectedKeys={new Set([filtroTipo])}
                  onSelectionChange={handleTipoChange}
                  variant="bordered"
                  classNames={{
                    trigger: "text-gray-900",
                    value: "text-gray-900",
                    popoverContent: "bg-white",
                  }}
                >
                  <SelectItem key="todos" className="text-gray-900">Todos los tipos</SelectItem>
                  <SelectItem key="identified" className="text-gray-900">Identificado</SelectItem>
                  <SelectItem key="anonymous" className="text-gray-900">Anónimo</SelectItem>
                  <SelectItem key="recurrent" className="text-gray-900">Recurrente</SelectItem>
                </Select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Lista de clientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-xl transition-shadow border-0">
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={getCustomerDisplayName(customer).charAt(0)}
                      classNames={{
                        base: customer.is_recurrent 
                          ? "bg-gradient-to-br from-purple-400 to-pink-400" 
                          : "bg-gradient-to-br from-blue-400 to-cyan-400",
                        name: "text-white font-bold"
                      }}
                      size="lg"
                    />
                    <div>
                      <h3 className={`text-lg font-semibold ${textColors.primary}`}>
                        {getCustomerDisplayName(customer)}
                      </h3>
                      <Chip
                        color={getBadgeColor(customer.customer_type, customer.is_recurrent)}
                        size="sm"
                        variant="flat"
                      >
                        {getBadgeLabel(customer.customer_type, customer.is_recurrent)}
                      </Chip>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {customer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className={`text-sm ${textColors.secondary}`}>{customer.email}</span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className={`text-sm ${textColors.secondary}`}>{customer.phone}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className={`text-sm ${textColors.muted}`}>Total gastado:</span>
                    <span className="text-sm font-semibold text-green-600">
                      {formatCurrency(customer.stats?.totalGastado || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${textColors.muted}`}>Reparaciones:</span>
                    <span className={`text-sm font-semibold ${textColors.primary}`}>
                      {customer.stats?.totalReparaciones || 0}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Tooltip content="Ver detalles" classNames={{ content: "bg-gray-900 text-white" }}>
                    <Button isIconOnly variant="flat" size="sm" onPress={() => handleViewDetails(customer)}>
                      <Eye className="w-5 h-5" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Editar cliente" classNames={{ content: "bg-gray-900 text-white" }}>
                    <Button isIconOnly variant="flat" size="sm" onPress={() => handleEditCustomer(customer)}>
                      <Edit className="w-5 h-5" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Eliminar cliente" classNames={{ content: "bg-gray-900 text-white" }}>
                    <Button isIconOnly variant="flat" size="sm" color="danger" onPress={() => handleDeleteCustomer(customer)}>
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </Tooltip>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination
              total={pagination.totalPages}
              page={pagination.page}
              onChange={handlePageChange}
              showControls
              color="primary"
              size="lg"
            />
          </div>
        )}

        {/* Modal de crear cliente */}
        <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="2xl">
          <ModalContent>
            <form onSubmit={handleCreateCustomer}>
              <ModalHeader>
                <h2 className="text-xl font-bold">Crear Nuevo Cliente</h2>
              </ModalHeader>
              <ModalBody className="space-y-4">
                <FormField
                  label="Nombre completo"
                  name="name"
                  value={newCustomer.name}
                  onChange={(value) => setNewCustomer(prev => ({ ...prev, name: value }))}
                  placeholder="Nombre del cliente"
                  required
                />
                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(value) => setNewCustomer(prev => ({ ...prev, email: value }))}
                  placeholder="email@ejemplo.com"
                />
                <FormField
                  label="Teléfono"
                  name="phone"
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(value) => setNewCustomer(prev => ({ ...prev, phone: value }))}
                  placeholder="+51 999 999 999"
                />
                <FormField
                  label="Dirección"
                  name="address"
                  value={newCustomer.address}
                  onChange={(value) => setNewCustomer(prev => ({ ...prev, address: value }))}
                  placeholder="Dirección del cliente"
                />
                <FormField
                  label="Tipo de cliente"
                  name="customer_type"
                  type="select"
                  value={newCustomer.customer_type}
                  onChange={(value) => setNewCustomer(prev => ({ ...prev, customer_type: value }))}
                  options={[
                    { value: 'identified', label: 'Cliente Registrado' },
                    { value: 'anonymous', label: 'Cliente Anónimo' }
                  ]}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onCreateClose}>Cancelar</Button>
                <Button 
                  type="submit" 
                  color="primary" 
                  isLoading={createLoading}
                  startContent={!createLoading ? <Plus className="w-4 h-4" /> : null}
                >
                  Crear Cliente
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>

        {/* Modal de ver detalles */}
        <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="3xl">
          <ModalContent>
            <ModalHeader>
              <h2 className="text-xl font-bold">Detalles del Cliente</h2>
            </ModalHeader>
            <ModalBody>
              {selectedCustomer && (
                <div className="space-y-6">
                  {/* Información básica */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className={`text-lg font-semibold ${textColors.primary}`}>Información Personal</h3>
                      <div className="space-y-3">
                        <div>
                          <label className={`text-sm font-medium ${textColors.secondary}`}>Nombre:</label>
                          <p className={`text-base ${textColors.primary}`}>
                            {getCustomerDisplayName(selectedCustomer)}
                          </p>
                        </div>
                        {selectedCustomer.email && (
                          <div>
                            <label className={`text-sm font-medium ${textColors.secondary}`}>Email:</label>
                            <p className={`text-base ${textColors.primary}`}>{selectedCustomer.email}</p>
                          </div>
                        )}
                        {selectedCustomer.phone && (
                          <div>
                            <label className={`text-sm font-medium ${textColors.secondary}`}>Teléfono:</label>
                            <p className={`text-base ${textColors.primary}`}>{selectedCustomer.phone}</p>
                          </div>
                        )}
                        {selectedCustomer.address && (
                          <div>
                            <label className={`text-sm font-medium ${textColors.secondary}`}>Dirección:</label>
                            <p className={`text-base ${textColors.primary}`}>{selectedCustomer.address}</p>
                          </div>
                        )}
                        <div>
                          <label className={`text-sm font-medium ${textColors.secondary}`}>Tipo:</label>
                          <div className="mt-1">
                            <Chip
                              color={getBadgeColor(selectedCustomer.customer_type, selectedCustomer.is_recurrent)}
                              variant="flat"
                            >
                              {getBadgeLabel(selectedCustomer.customer_type, selectedCustomer.is_recurrent)}
                            </Chip>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className={`text-lg font-semibold ${textColors.primary}`}>Estadísticas</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{selectedCustomer.stats.totalReparaciones}</p>
                          <p className={`text-sm ${textColors.muted}`}>Total Reparaciones</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedCustomer.stats.totalGastado)}</p>
                          <p className={`text-sm ${textColors.muted}`}>Total Gastado</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <p className="text-2xl font-bold text-orange-600">{selectedCustomer.stats.pendientes}</p>
                          <p className={`text-sm ${textColors.muted}`}>Pendientes</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">{selectedCustomer.stats.completadas}</p>
                          <p className={`text-sm ${textColors.muted}`}>Completadas</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="border-t pt-4">
                    <h3 className={`text-lg font-semibold ${textColors.primary} mb-3`}>Información Adicional</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`text-sm font-medium ${textColors.secondary}`}>Fecha de registro:</label>
                        <p className={`text-base ${textColors.primary}`}>
                          {new Date(selectedCustomer.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <label className={`text-sm font-medium ${textColors.secondary}`}>Última actualización:</label>
                        <p className={`text-base ${textColors.primary}`}>
                          {new Date(selectedCustomer.updated_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onPress={onDetailClose}>Cerrar</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal de editar cliente */}
        <Modal isOpen={isEditOpen} onClose={onEditClose} size="2xl">
          <ModalContent>
            <form onSubmit={handleUpdateCustomer}>
              <ModalHeader>
                <h2 className="text-xl font-bold">Editar Cliente</h2>
              </ModalHeader>
              <ModalBody className="space-y-4">
                {editingCustomer && (
                  <>
                    <FormField
                      label="Nombre completo"
                      name="name"
                      value={editingCustomer.name || ''}
                      onChange={(value) => setEditingCustomer(prev => prev ? ({ ...prev, name: value }) : null)}
                      placeholder="Nombre del cliente"
                      required
                    />
                    <FormField
                      label="Email"
                      name="email"
                      type="email"
                      value={editingCustomer.email || ''}
                      onChange={(value) => setEditingCustomer(prev => prev ? ({ ...prev, email: value }) : null)}
                      placeholder="email@ejemplo.com"
                    />
                    <FormField
                      label="Teléfono"
                      name="phone"
                      type="tel"
                      value={editingCustomer.phone || ''}
                      onChange={(value) => setEditingCustomer(prev => prev ? ({ ...prev, phone: value }) : null)}
                      placeholder="+51 999 999 999"
                    />
                    <FormField
                      label="Dirección"
                      name="address"
                      value={editingCustomer.address || ''}
                      onChange={(value) => setEditingCustomer(prev => prev ? ({ ...prev, address: value }) : null)}
                      placeholder="Dirección del cliente"
                    />
                    <FormField
                      label="Tipo de cliente"
                      name="customer_type"
                      type="select"
                      value={editingCustomer.customer_type}
                      onChange={(value) => setEditingCustomer(prev => prev ? ({ ...prev, customer_type: value }) : null)}
                      options={[
                        { value: 'identified', label: 'Cliente Registrado' },
                        { value: 'anonymous', label: 'Cliente Anónimo' }
                      ]}
                    />
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onEditClose}>Cancelar</Button>
                <Button 
                  type="submit" 
                  color="primary" 
                  isLoading={updateLoading}
                  startContent={!updateLoading ? <Edit className="w-4 h-4" /> : null}
                >
                  Actualizar Cliente
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>

        {/* Modal de confirmación de eliminación */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="md">
          <ModalContent>
            <ModalHeader>
              <h2 className="text-xl font-bold text-red-600">Confirmar Eliminación</h2>
            </ModalHeader>
            <ModalBody>
              {selectedCustomer && (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                    <p className={`text-lg font-semibold ${textColors.primary}`}>
                      ¿Estás seguro de que deseas eliminar este cliente?
                    </p>
                    <p className={`text-base ${textColors.secondary} mt-2`}>
                      <strong>{getCustomerDisplayName(selectedCustomer)}</strong>
                    </p>
                    <p className={`text-sm ${textColors.muted} mt-2`}>
                      Esta acción no se puede deshacer. Si el cliente tiene reparaciones o dispositivos asociados, no podrá ser eliminado.
                    </p>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onDeleteClose}>Cancelar</Button>
              <Button 
                color="danger" 
                isLoading={deleteLoading}
                onPress={confirmDeleteCustomer}
                startContent={!deleteLoading ? <Trash2 className="w-4 h-4" /> : null}
              >
                Eliminar Cliente
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </DashboardLayout>
  )
} 