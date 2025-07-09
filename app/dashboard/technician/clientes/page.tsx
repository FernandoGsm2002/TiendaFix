'use client'

import { useState, useEffect } from 'react'
import TechnicianDashboardLayout from '../components/TechnicianDashboardLayout'
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
import { textColors } from '@/lib/utils/colors'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import { 
  Search, 
  Filter, 
  Eye, 
  User, 
  Phone,
  Mail,
  Star, 
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
  is_recurrent: boolean
  anonymous_identifier: string | null
  notes?: string | null
  created_at: string
  updated_at: string
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

export default function ClientesPage() {
  const { t } = useTranslations()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })

  // Estados para el modal de detalles (solo lectura)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerDetail, setCustomerDetail] = useState<CustomerDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Solo modal de detalles para técnicos
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure()

  // Estados para filtros de historial en el modal de detalles
  const [dateFilter, setDateFilter] = useState('all') // 7d, 30d, 3m, 6m, year, all, custom
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  })
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all') // all, repair, unlock, sale
  const [serviceStatusFilter, setServiceStatusFilter] = useState('all') // all, pending, completed

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
    // Resetear filtros al abrir modal
    setDateFilter('all')
    setCustomDateRange({ start: '', end: '' })
    setServiceTypeFilter('all')
    setServiceStatusFilter('all')
    onDetailOpen()
    fetchCustomerDetail(customer.id)
  }

  const getBadgeColor = (type: string, isRecurrent: boolean) => {
    if (isRecurrent) return 'warning'
    if (type === 'identified') return 'success'
    return 'default'
  }

  const getBadgeLabel = (type: string, isRecurrent: boolean) => {
    if (isRecurrent) return 'VIP'
    if (type === 'identified') return 'Registrado'
    return 'Anónimo'
  }

  const formatCurrency = (amount: number | undefined | null) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount || 0)
  }

  const getCustomerDisplayName = (customer: Customer) => {
    return customer.name || customer.anonymous_identifier || 'Cliente Anónimo'
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
      case 'completed': return 'success'
      case 'in_progress': return 'primary'
      case 'pending': return 'warning'
      case 'delivered': return 'success'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado'
      case 'in_progress': return 'En Proceso'
      case 'pending': return 'Pendiente'
      case 'delivered': return 'Entregado'
      case 'received': return 'Recibido'
      default: return status
    }
  }

  // Funciones para filtrado de historial
  const getDateRangeFromFilter = (filter: string) => {
    const now = new Date()
    const ranges = {
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '3m': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      '6m': new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
      'year': new Date(now.getFullYear(), 0, 1),
      'all': null
    }
    
    return ranges[filter as keyof typeof ranges] || null
  }

  const isServiceInDateRange = (service: CustomerService) => {
    if (dateFilter === 'all') return true
    
    if (dateFilter === 'custom') {
      if (!customDateRange.start && !customDateRange.end) return true
      
      const serviceDate = new Date(service.created_at)
      const start = customDateRange.start ? new Date(customDateRange.start) : null
      const end = customDateRange.end ? new Date(customDateRange.end + 'T23:59:59') : null
      
      if (start && serviceDate < start) return false
      if (end && serviceDate > end) return false
      return true
    }
    
    const startDate = getDateRangeFromFilter(dateFilter)
    if (!startDate) return true
    
    return new Date(service.created_at) >= startDate
  }

  const isServiceTypeMatch = (service: CustomerService) => {
    if (serviceTypeFilter === 'all') return true
    return service.type === serviceTypeFilter
  }

  const isServiceStatusMatch = (service: CustomerService) => {
    if (serviceStatusFilter === 'all') return true
    
    const pendingStatuses = ['pending', 'received', 'diagnosed', 'in_progress']
    const completedStatuses = ['completed', 'delivered']
    
    if (serviceStatusFilter === 'pending') {
      return pendingStatuses.includes(service.status)
    }
    if (serviceStatusFilter === 'completed') {
      return completedStatuses.includes(service.status)
    }
    
    return true
  }

  // Función principal de filtrado
  const getFilteredServices = () => {
    if (!customerDetail?.services) return []
    
    return customerDetail.services.filter(service => 
      isServiceInDateRange(service) && 
      isServiceTypeMatch(service) && 
      isServiceStatusMatch(service)
    ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  // Función para calcular estadísticas filtradas
  const getFilteredStats = () => {
    const filteredServices = getFilteredServices()
    
    const totalServices = filteredServices.length
    const totalSpent = filteredServices.reduce((sum, service) => sum + service.cost, 0)
    const pendingServices = filteredServices.filter(s => 
      ['pending', 'received', 'diagnosed', 'in_progress'].includes(s.status)
    ).length
    const completedServices = filteredServices.filter(s => 
      ['completed', 'delivered'].includes(s.status)
    ).length
    
    return {
      totalServices,
      totalSpent,
      pendingServices,
      completedServices
    }
  }

  // Resetear filtros cuando se cierra el modal
  const handleDetailClose = () => {
    setDateFilter('all')
    setCustomDateRange({ start: '', end: '' })
    setServiceTypeFilter('all')
    setServiceStatusFilter('all')
    onDetailClose()
  }

  // Calcular estadísticas
  const stats = {
    total: customers.length,
    registrados: customers.filter(c => c.customer_type === 'identified').length,
    vip: customers.filter(c => c.is_recurrent).length,
    anonimos: customers.filter(c => c.customer_type === 'anonymous').length
  }

  if (loading) {
    return (
      <TechnicianDashboardLayout>
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64 rounded-lg" />
              <Skeleton className="h-4 w-96 rounded-lg" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="shadow-lg">
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
              <Card key={i} className="shadow-lg">
                <CardBody className="p-6 space-y-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-6 w-32 rounded" />
                  <Skeleton className="h-4 w-48 rounded" />
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </TechnicianDashboardLayout>
    )
  }

  if (error) {
    return (
      <TechnicianDashboardLayout>
        <div className="text-center py-8">
          <p className="text-red-500">Error: {error}</p>
          <Button onPress={() => fetchCustomers()} className="mt-4">
            Reintentar
          </Button>
        </div>
      </TechnicianDashboardLayout>
    )
  }

  return (
    <TechnicianDashboardLayout>
      <div className="space-y-8">
        {/* Header mejorado */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <h1 className={`text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent`}>
              Base de Clientes
            </h1>
            <p className={`${textColors.secondary} text-lg`}>
              Consulta y visualiza información de clientes • Solo lectura
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500 font-medium">Modo consulta</span>
            </div>
          </div>
        </div>

        {/* Stats Cards mejoradas */}
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
                <p className={`text-3xl font-bold text-green-600`}>{stats.registrados}</p>
                <Progress value={(stats.registrados / Math.max(stats.total, 1)) * 100} color="success" size="sm" />
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

        {/* Filtros y búsqueda mejorados */}
        <Card className="shadow-lg">
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
                  <SelectItem key="todos" className="text-gray-900">{t('filters.allTypes')}</SelectItem>
                  <SelectItem key="identified" className="text-gray-900">Registrados</SelectItem>
                  <SelectItem key="anonymous" className="text-gray-900">Anónimos</SelectItem>
                </Select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Lista de clientes mejorada */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-xl transition-shadow border-0 shadow-lg">
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
                      <Mail className="w-4 h-4 text-blue-500" />
                            <span className={`text-sm ${textColors.secondary}`}>{customer.email}</span>
                          </div>
                  )}
                  {customer.phone && (
                          <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-green-500" />
                            <span className={`text-sm ${textColors.secondary}`}>{customer.phone}</span>
                          </div>
                          )}
                        </div>

                <div className="bg-gray-50 rounded-lg p-3 space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-medium ${textColors.secondary}`}>Total gastado:</span>
                    <span className={`text-lg font-bold text-green-600`}>
                      {formatCurrency(customer.stats?.totalGastado)}
                              </span>
                            </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${textColors.secondary}`}>Servicios totales:</span>
                    <Chip color="primary" size="sm" variant="flat">
                      {customer.stats?.totalReparaciones || 0}
                              </Chip>
                          </div>
                  <Progress 
                    value={Math.min((customer.stats?.totalGastado || 0) / 1000 * 100, 100)} 
                    color="success" 
                          size="sm"
                    className="mt-2"
                  />
                </div>

                <div className="flex justify-end">
                  <Tooltip content="Ver detalles completos" classNames={{ content: "bg-gray-900 text-white" }}>
                            <Button 
                      color="primary" 
                              variant="flat" 
                              size="sm" 
                              onPress={() => handleViewDetails(customer)}
                      startContent={<Eye className="w-4 h-4" />}
                            >
                      Ver Detalles
                            </Button>
                          </Tooltip>
                        </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Paginación mejorada */}
        {pagination.totalPages > 1 && (
          <Card className="shadow-lg">
            <CardBody className="py-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} clientes
                </div>
                <Pagination
                  total={pagination.totalPages}
                  page={pagination.page}
                  onChange={handlePageChange}
                  showControls
                  color="primary"
                  size="lg"
                  classNames={{
                    wrapper: "gap-2",
                    item: "w-10 h-10 text-sm",
                    cursor: "bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold",
                  }}
                />
              </div>
          </CardBody>
        </Card>
        )}

        {/* Modal de ver detalles - Copia exacta del owner */}
        <Modal 
          isOpen={isDetailOpen} 
          onClose={handleDetailClose} 
          size="2xl" 
          scrollBehavior="inside"
          classNames={{
            wrapper: "z-[1000]",
            backdrop: "z-[999]",
            base: "max-h-[95vh] my-2 mx-2 sm:mx-6 w-full max-w-4xl",
            body: "max-h-[80vh] overflow-y-auto py-4",
            header: "border-b border-gray-200 pb-4",
            footer: "border-t border-gray-200 pt-4"
          }}
        >
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
                              {getFilteredStats().totalServices}
                            </p>
                            <p className="text-xs text-gray-600">Total Servicios</p>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-xl font-bold text-green-600">
                              {formatCurrency(getFilteredStats().totalSpent)}
                            </p>
                            <p className="text-xs text-gray-600">Total Gastado</p>
                          </div>
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <p className="text-xl font-bold text-orange-600">
                              {getFilteredStats().pendingServices}
                            </p>
                            <p className="text-xs text-gray-600">Pendientes</p>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-xl font-bold text-purple-600">
                              {getFilteredStats().completedServices}
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
                      <div className="flex flex-col gap-4">
                        <h3 className={`text-xl font-semibold flex items-center gap-2 ${textColors.primary}`}>
                          <History className="w-6 h-6 text-purple-500" />
                          Historial de Servicios
                        </h3>
                        
                        {/* Filtros de fecha */}
                        <div className="flex flex-wrap gap-2">
                          <div className="flex flex-wrap gap-2">
                            {[
                              { key: 'all', label: 'Todo' },
                              { key: '7d', label: '7 días' },
                              { key: '30d', label: '30 días' },
                              { key: '3m', label: '3 meses' },
                              { key: '6m', label: '6 meses' },
                              { key: 'year', label: 'Este año' },
                              { key: 'custom', label: 'Personalizado' }
                            ].map(filter => (
                              <Button
                                key={filter.key}
                                size="sm"
                                variant={dateFilter === filter.key ? "solid" : "bordered"}
                                color={dateFilter === filter.key ? "primary" : "default"}
                                onPress={() => setDateFilter(filter.key)}
                                className={dateFilter === filter.key ? 
                                  "bg-gray-900 text-white border-gray-900" : 
                                  "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}
                              >
                                {filter.label}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Filtro de rango personalizado */}
                        {dateFilter === 'custom' && (
                          <div className="flex gap-2 flex-wrap">
                            <Input
                              type="date"
                              label="Desde"
                              value={customDateRange.start}
                              onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                              size="sm"
                              className="max-w-36"
                              classNames={{
                                input: "text-gray-700",
                                inputWrapper: "bg-white border-gray-300 hover:bg-gray-50",
                                label: "text-gray-600",
                              }}
                            />
                            <Input
                              type="date"
                              label="Hasta"
                              value={customDateRange.end}
                              onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                              size="sm"
                              className="max-w-36"
                              classNames={{
                                input: "text-gray-700",
                                inputWrapper: "bg-white border-gray-300 hover:bg-gray-50",
                                label: "text-gray-600",
                              }}
                            />
                          </div>
                        )}

                        {/* Filtros adicionales */}
                        <div className="flex flex-wrap gap-2">
                          <Select
                            size="sm"
                            label="Tipo de servicio"
                            selectedKeys={[serviceTypeFilter]}
                            onSelectionChange={(keys) => setServiceTypeFilter(Array.from(keys)[0] as string)}
                            className="max-w-48"
                            classNames={{
                              trigger: "bg-white border-gray-300 text-gray-700 hover:bg-gray-50",
                              value: "text-gray-700",
                              label: "text-gray-600",
                              popoverContent: "bg-white border-gray-300",
                            }}
                          >
                            <SelectItem key="all" className="text-gray-700">Todos los tipos</SelectItem>
                            <SelectItem key="repair" className="text-gray-700">Reparaciones</SelectItem>
                            <SelectItem key="unlock" className="text-gray-700">Desbloqueos</SelectItem>
                            <SelectItem key="sale" className="text-gray-700">Ventas</SelectItem>
                          </Select>
                          
                          <Select
                            size="sm"
                            label="Estado"
                            selectedKeys={[serviceStatusFilter]}
                            onSelectionChange={(keys) => setServiceStatusFilter(Array.from(keys)[0] as string)}
                            className="max-w-48"
                            classNames={{
                              trigger: "bg-white border-gray-300 text-gray-700 hover:bg-gray-50",
                              value: "text-gray-700",
                              label: "text-gray-600",
                              popoverContent: "bg-white border-gray-300",
                            }}
                          >
                            <SelectItem key="all" className="text-gray-700">Todos los estados</SelectItem>
                            <SelectItem key="pending" className="text-gray-700">Pendientes</SelectItem>
                            <SelectItem key="completed" className="text-gray-700">Completados</SelectItem>
                          </Select>
                        </div>
                      </div>
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
                      ) : customerDetail && getFilteredServices().length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {getFilteredServices().map((service) => (
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
                          <p className={textColors.muted}>
                            {customerDetail && customerDetail.services.length > 0 
                              ? "No hay servicios que coincidan con los filtros seleccionados" 
                              : "No hay servicios registrados para este cliente"}
                          </p>
                          {customerDetail && customerDetail.services.length > 0 && (
                            <Button 
                              size="sm" 
                              variant="light" 
                              onPress={() => {
                                setDateFilter('all')
                                setServiceTypeFilter('all')
                                setServiceStatusFilter('all')
                                setCustomDateRange({ start: '', end: '' })
                              }}
                              className="mt-2 text-gray-700 hover:bg-gray-100"
                            >
                              Limpiar filtros
                            </Button>
                          )}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                    </div>
                  )}
                </ModalBody>
            <ModalFooter className="border-t">
              <Button variant="flat" onPress={handleDetailClose}>
                    Cerrar
                  </Button>
                </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </TechnicianDashboardLayout>
  )
} 