'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { useTranslations, useCurrency } from '@/lib/contexts/TranslationContext'
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
  ShoppingBag,
  Wrench,
  Unlock,
  Clock,
  CheckCircle,
  Calendar,
  DollarSign,
  CreditCard,
  Activity,
  FileText,
  History
} from 'lucide-react'

interface Customer {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  address: string | null
  customer_type: string
  anonymous_identifier: string | null
  created_at: string
  updated_at: string
  is_recurrent: boolean
  stats: {
    totalGastado: number
    totalReparaciones: number
    reparaciones: number
    desbloqueos: number
    ventas: number
  }
}

interface CustomerService {
  id: string
  type: 'repair' | 'unlock' | 'sale'
  title: string
  description?: string
  status: string
  cost: number
  created_at: string
  completed_at?: string
  device_info?: string
  items?: Array<{
    name: string
    quantity: number
    price: number
  }>
}

interface CustomerDetail extends Customer {
  services: CustomerService[]
  financialSummary: {
    totalSpent: number
    totalPending: number
    totalPaid: number
    lastPayment?: string
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
  const { t } = useTranslations()
  const { formatCurrency } = useCurrency()
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
  const [customerDetail, setCustomerDetail] = useState<CustomerDetail | null>(null)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

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
  const fetchCustomerDetail = async (customerId: string) => {
    setLoadingDetail(true)
    try {
      const response = await fetch(`/api/customers/${customerId}/details`)
      if (!response.ok) {
        throw new Error('Error al cargar detalles del cliente')
      }
      const data = await response.json()
      setCustomerDetail(data.data)
    } catch (err) {
      console.error('Error fetching customer detail:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar detalles')
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCustomerDetail(null)
    onDetailOpen()
    fetchCustomerDetail(customer.id)
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
          if (isRecurrent) return t('customers.vipClients')
    switch (type) {
              case 'identified': return t('customers.identified')
      case 'anonymous': return t('customers.anonymous')
      default: return type
    }
  }



  const getCustomerDisplayName = (customer: Customer) => {
          return customer.name || customer.anonymous_identifier || t('customers.anonymous')
  }

  const getServiceTypeLabel = (type: string) => {
    switch (type) {
      case 'repair': return 'Reparación'
      case 'unlock': return 'Desbloqueo'
      case 'sale': return 'Venta'
      default: return type
    }
  }

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'repair': return 'primary'
      case 'unlock': return 'secondary'
      case 'sale': return 'success'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'completed': return 'success'
      case 'delivered': return 'success'
      case 'cancelled': return 'danger'
      case 'in_progress': return 'primary'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente'
      case 'completed': return 'Completado'
      case 'delivered': return 'Entregado'
      case 'cancelled': return 'Cancelado'
      case 'in_progress': return 'En Proceso'
      default: return status
    }
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
              {t('customers.title')}
            </h1>
            <p className={`${textColors.secondary} text-lg`}>
              {t('customers.description')}
            </p>
          </div>
          
          <Button
            color="primary"
            size="lg"
            startContent={<Plus className="w-5 h-5" />}
            onPress={onCreateOpen}
            className="shadow-lg"
          >
            {t('customers.new')}
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
                <p className={`text-sm font-medium ${textColors.tertiary}`}>{t('customers.totalClients')}</p>
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
                <p className={`text-sm font-medium ${textColors.tertiary}`}>{t('customers.registeredClients')}</p>
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
                <p className={`text-sm font-medium ${textColors.tertiary}`}>{t('customers.vipClients')}</p>
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
                <p className={`text-sm font-medium ${textColors.tertiary}`}>{t('customers.anonymousClients')}</p>
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
                  placeholder={t('customers.searchPlaceholder')}
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
                  placeholder={t('customers.customerType')}
                  selectedKeys={new Set([filtroTipo])}
                  onSelectionChange={handleTipoChange}
                  variant="bordered"
                  classNames={{
                    trigger: "text-gray-900",
                    value: "text-gray-900",
                    popoverContent: "bg-white",
                  }}
                >
                  <SelectItem key="todos" className="text-gray-900">{t('customers.allTypes')}</SelectItem>
                                      <SelectItem key="identified" className="text-gray-900">{t('customers.identified')}</SelectItem>
                                      <SelectItem key="anonymous" className="text-gray-900">{t('customers.anonymous')}</SelectItem>
                                      <SelectItem key="recurrent" className="text-gray-900">{t('customers.recurrent')}</SelectItem>
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
                    <span className={`text-sm ${textColors.muted}`}>Servicios:</span>
                    <span className={`text-sm font-semibold ${textColors.primary}`}>
                      {customer.stats?.totalReparaciones || 0}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Tooltip content={t('common.view') + " " + t('common.details')} classNames={{ content: "bg-gray-900 text-white" }}>
                    <Button isIconOnly variant="flat" size="sm" onPress={() => handleViewDetails(customer)}>
                      <Eye className="w-5 h-5" />
                    </Button>
                  </Tooltip>
                  <Tooltip content={t('common.edit') + " " + t('common.customer')} classNames={{ content: "bg-gray-900 text-white" }}>
                    <Button isIconOnly variant="flat" size="sm" onPress={() => handleEditCustomer(customer)}>
                      <Edit className="w-5 h-5" />
                    </Button>
                  </Tooltip>
                                      <Tooltip content={t('common.delete') + " " + t('common.customer')} classNames={{ content: "bg-gray-900 text-white" }}>
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
                <h2 className={`text-xl font-bold ${textColors.primary}`}>{t('customers.createTitle')}</h2>
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
                    { value: 'identified', label: t('customers.identified') },
                    { value: 'anonymous', label: t('customers.anonymous') }
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
                  {t('customers.new')}
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>

        {/* Modal de ver detalles mejorado */}
        <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="5xl" scrollBehavior="inside">
          <ModalContent>
            <ModalHeader className="border-b">
              <div className="flex items-center gap-3">
                <Avatar
                  name={selectedCustomer ? getCustomerDisplayName(selectedCustomer).charAt(0) : '?'}
                  size="lg"
                  className="bg-gradient-to-br from-blue-500 to-purple-600"
                />
                <div>
                  <h2 className={`text-xl font-bold ${textColors.primary}`}>
                    {selectedCustomer ? getCustomerDisplayName(selectedCustomer) : 'Cliente'}
                  </h2>
                  <p className={`text-sm ${textColors.muted}`}>Perfil completo del cliente</p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody className="p-6">
              {selectedCustomer && (
                <div className="space-y-6">
                  {/* Información básica mejorada */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Información personal */}
                    <Card>
                      <CardHeader className="pb-3">
                        <h3 className={`text-lg font-semibold flex items-center gap-2 ${textColors.primary}`}>
                          <User className="w-5 h-5 text-blue-500" />
                          Información Personal
                        </h3>
                      </CardHeader>
                      <CardBody className="pt-0 space-y-3">
                        <div>
                          <label className={`text-sm font-medium ${textColors.tertiary}`}>Nombre:</label>
                          <p className={`text-base font-medium ${textColors.primary}`}>{getCustomerDisplayName(selectedCustomer)}</p>
                        </div>
                        {selectedCustomer.email && (
                          <div>
                            <label className={`text-sm font-medium ${textColors.tertiary}`}>Email:</label>
                            <p className={`text-base ${textColors.primary}`}>{selectedCustomer.email}</p>
                          </div>
                        )}
                        {selectedCustomer.phone && (
                          <div>
                            <label className={`text-sm font-medium ${textColors.tertiary}`}>Teléfono:</label>
                            <p className={`text-base ${textColors.primary}`}>{selectedCustomer.phone}</p>
                          </div>
                        )}
                        {selectedCustomer.address && (
                          <div>
                            <label className={`text-sm font-medium ${textColors.tertiary}`}>Dirección:</label>
                            <p className={`text-base ${textColors.primary}`}>{selectedCustomer.address}</p>
                          </div>
                        )}
                        <div>
                          <label className={`text-sm font-medium ${textColors.tertiary}`}>Tipo:</label>
                          <div className="mt-1">
                            <Chip
                              color={getBadgeColor(selectedCustomer.customer_type, selectedCustomer.is_recurrent)}
                              variant="flat"
                            >
                              {getBadgeLabel(selectedCustomer.customer_type, selectedCustomer.is_recurrent)}
                            </Chip>
                          </div>
                        </div>
                        <div>
                          <label className={`text-sm font-medium ${textColors.tertiary}`}>Registro:</label>
                          <p className={`text-sm ${textColors.primary}`}>{new Date(selectedCustomer.created_at).toLocaleDateString('es-ES')}</p>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Estadísticas actuales */}
                    <Card>
                      <CardHeader className="pb-3">
                        <h3 className={`text-lg font-semibold flex items-center gap-2 ${textColors.primary}`}>
                          <Activity className="w-5 h-5 text-green-500" />
                          Estadísticas Básicas
                        </h3>
                      </CardHeader>
                      <CardBody className="pt-0">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-xl font-bold text-blue-600">
                              {customerDetail?.services?.length || 0}
                            </p>
                            <p className="text-xs text-gray-600">Total Servicios</p>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-xl font-bold text-green-600">
                              {formatCurrency(customerDetail?.financialSummary?.totalSpent || 0)}
                            </p>
                            <p className="text-xs text-gray-600">Total Gastado</p>
                          </div>
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <p className="text-xl font-bold text-orange-600">
                              {customerDetail?.services?.filter(s => ['pending', 'received', 'diagnosed', 'in_progress'].includes(s.status)).length || 0}
                            </p>
                            <p className="text-xs text-gray-600">Pendientes</p>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-xl font-bold text-purple-600">
                              {customerDetail?.services?.filter(s => ['completed', 'delivered'].includes(s.status)).length || 0}
                            </p>
                            <p className="text-xs text-gray-600">Completadas</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Resumen financiero */}
                    <Card>
                      <CardHeader className="pb-3">
                        <h3 className={`text-lg font-semibold flex items-center gap-2 ${textColors.primary}`}>
                          <CreditCard className="w-5 h-5 text-green-500" />
                          Resumen Financiero
                        </h3>
                      </CardHeader>
                      <CardBody className="pt-0">
                        {loadingDetail ? (
                          <div className="space-y-3">
                            <Skeleton className="h-4 rounded" />
                            <Skeleton className="h-4 rounded" />
                            <Skeleton className="h-4 rounded" />
                          </div>
                        ) : customerDetail ? (
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className={`text-sm ${textColors.secondary}`}>Total gastado:</span>
                              <span className="font-semibold text-green-600">
                                {formatCurrency(customerDetail.financialSummary.totalSpent)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className={`text-sm ${textColors.secondary}`}>Pendiente:</span>
                              <span className="font-semibold text-orange-600">
                                {formatCurrency(customerDetail.financialSummary.totalPending)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className={`text-sm ${textColors.secondary}`}>Pagado:</span>
                              <span className="font-semibold text-blue-600">
                                {formatCurrency(customerDetail.financialSummary.totalPaid)}
                              </span>
                            </div>
                            {customerDetail.financialSummary.lastPayment && (
                              <div className={`pt-2 border-t text-xs ${textColors.muted}`}>
                                Último pago: {new Date(customerDetail.financialSummary.lastPayment).toLocaleDateString('es-ES')}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className={`text-sm ${textColors.muted}`}>Sin datos financieros</p>
                        )}
                      </CardBody>
                    </Card>
                  </div>

                  {/* Historial de servicios */}
                  <Card>
                    <CardHeader>
                      <h3 className={`text-xl font-semibold flex items-center gap-2 ${textColors.primary}`}>
                        <History className="w-6 h-6 text-purple-500" />
                        Historial de Servicios
                      </h3>
                    </CardHeader>
                    <CardBody>
                      {loadingDetail ? (
                        <div className="space-y-4">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="p-4 border rounded-lg space-y-2">
                              <Skeleton className="h-4 w-1/4 rounded" />
                              <Skeleton className="h-3 w-3/4 rounded" />
                              <Skeleton className="h-3 w-1/2 rounded" />
                            </div>
                          ))}
                        </div>
                      ) : customerDetail && customerDetail.services.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {customerDetail.services
                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .map((service) => (
                            <div key={service.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  {service.type === 'repair' && <Wrench className="w-4 h-4 text-blue-500" />}
                                  {service.type === 'unlock' && <Unlock className="w-4 h-4 text-purple-500" />}
                                  {service.type === 'sale' && <ShoppingBag className="w-4 h-4 text-green-500" />}
                                  <Chip
                                    size="sm"
                                    color={getServiceTypeColor(service.type)}
                                    variant="flat"
                                  >
                                    {getServiceTypeLabel(service.type)}
                                  </Chip>
                                  <Chip
                                    size="sm"
                                    color={getStatusColor(service.status)}
                                    variant="flat"
                                  >
                                    {getStatusLabel(service.status)}
                                  </Chip>
                                </div>
                                <span className="font-semibold text-green-600">
                                  {formatCurrency(service.cost)}
                                </span>
                              </div>
                              <h4 className={`font-medium mb-1 ${textColors.primary}`}>{service.title}</h4>
                              {service.description && (
                                <p className={`text-sm mb-2 ${textColors.secondary}`}>{service.description}</p>
                              )}
                              {service.device_info && (
                                <p className={`text-sm mb-2 ${textColors.secondary}`}>
                                  <strong>Dispositivo:</strong> {service.device_info}
                                </p>
                              )}
                              {service.items && service.items.length > 0 && (
                                <div className={`text-sm mb-2 ${textColors.secondary}`}>
                                  <strong>Productos:</strong> {service.items.map(item => 
                                    `${item.name} (${item.quantity}x)`
                                  ).join(', ')}
                                </div>
                              )}
                              <div className={`flex justify-between text-xs ${textColors.muted}`}>
                                <span>Creado: {new Date(service.created_at).toLocaleDateString('es-ES')}</span>
                                {service.completed_at && (
                                  <span>Completado: {new Date(service.completed_at).toLocaleDateString('es-ES')}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className={textColors.muted}>No hay servicios registrados para este cliente</p>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </div>
              )}
            </ModalBody>
            <ModalFooter className="border-t">
              <Button variant="flat" onPress={onDetailClose}>
                Cerrar
              </Button>
              {selectedCustomer && (
                <Button 
                  color="primary" 
                  startContent={<Edit className="w-4 h-4" />}
                  onPress={() => {
                    handleEditCustomer(selectedCustomer)
                    onDetailClose()
                  }}
                >
                  Editar Cliente
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal de editar cliente */}
        <Modal isOpen={isEditOpen} onClose={onEditClose} size="2xl">
          <ModalContent>
            <form onSubmit={handleUpdateCustomer}>
              <ModalHeader>
                <h2 className={`text-xl font-bold ${textColors.primary}`}>{t('customers.editTitle')}</h2>
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
              <h2 className={`text-xl font-bold ${textColors.error}`}>Confirmar Eliminación</h2>
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
                {t('customers.deleteTitle')}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </DashboardLayout>
  )
} 