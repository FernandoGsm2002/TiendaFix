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
import { 
  getTaxIdType, 
  getTaxIdDescription, 
  type CountryCode,
  isValidCountry
} from '@/lib/utils/tax-identification'
import { 
  SOUTH_AMERICAN_COUNTRIES, 
  type CountryInfo,
  formatPhoneNumber,
  isValidPhoneNumber
} from '@/lib/utils/country-codes'

interface Customer {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  address: string | null
  customer_type: string
  anonymous_identifier: string | null
  customer_tax_id: string | null
  customer_tax_id_type: string | null
  cedula_dni: string | null
  country_code: string | null
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
  customer_tax_id: string
  customer_tax_id_type: string
  cedula_dni: string
  country_code: string
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
    anonymous_identifier: '',
    customer_tax_id: '',
    customer_tax_id_type: '',
    cedula_dni: '',
    country_code: '+51'
  })

  // Controles para los modales
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure()
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()

  // Estados para filtros de historial en el modal de detalles
  const [dateFilter, setDateFilter] = useState('all') // 7d, 30d, 3m, 6m, year, all, custom
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  })
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all') // all, repair, unlock, sale
  const [serviceStatusFilter, setServiceStatusFilter] = useState('all') // all, pending, completed
  
  // Estados para información de la organización (para identificación tributaria)
  const [organizationCountry, setOrganizationCountry] = useState<CountryCode>('PE')
  const [organizationTaxIdType, setOrganizationTaxIdType] = useState<string>('RUC')

  // Función para obtener información de la organización
  const fetchOrganizationInfo = async () => {
    try {
      // Obtener el organization_id del usuario actual
      const userResponse = await fetch('/api/user/profile')
      const userData = await userResponse.json()
      
      if (!userData.success) {
        console.error('No se pudo obtener el perfil del usuario')
        return
      }

      const organizationId = userData.data.organization_id
      
      // Obtener la información de la organización
      const orgResponse = await fetch(`/api/organizations/${organizationId}`)
      const orgData = await orgResponse.json()
      
      if (orgData.success && orgData.data) {
        const { country, tax_id_type } = orgData.data
        if (country && isValidCountry(country)) {
          setOrganizationCountry(country as CountryCode)
          setOrganizationTaxIdType(tax_id_type || getTaxIdType(country as CountryCode))
        }
      }
    } catch (error) {
      console.error('Error fetching organization info:', error)
    }
  }

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
    fetchOrganizationInfo()
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
      // Preparar datos del cliente con información tributaria
      const customerData = {
        ...newCustomer,
        customer_tax_id_type: newCustomer.customer_tax_id.trim() ? organizationTaxIdType : null,
        customer_tax_id: newCustomer.customer_tax_id.trim() || null
      }

      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
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
        anonymous_identifier: '',
        customer_tax_id: '',
        customer_tax_id_type: '',
        cedula_dni: '',
        country_code: '+51'
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
    // Resetear filtros al abrir modal
    setDateFilter('all')
    setCustomDateRange({ start: '', end: '' })
    setServiceTypeFilter('all')
    setServiceStatusFilter('all')
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
      // Preparar datos del cliente con información tributaria
      const customerData = {
        ...editingCustomer,
        customer_tax_id_type: editingCustomer.customer_tax_id?.trim() ? organizationTaxIdType : null,
        customer_tax_id: editingCustomer.customer_tax_id?.trim() || null
      }

      const response = await fetch(`/api/customers/${editingCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
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
            <h1 className={`text-4xl font-bold bg-gradient-to-r from-[#004085] to-[#003366] bg-clip-text text-transparent`}>
              {t('customers.title')}
            </h1>
            <p className={`text-[#6C757D] text-lg`}>
              {t('customers.description')}
            </p>
          </div>
          
          <Button
            size="lg"
            startContent={<Plus className="w-5 h-5" />}
            onPress={onCreateOpen}
            className="bg-gradient-to-r from-[#004085] to-[#003366] text-white shadow-lg hover:from-[#003366] hover:to-[#004085] transition-all"
          >
            {t('customers.new')}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="hover:scale-105 transition-all duration-300 border border-[#6C757D]/20 shadow-lg bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF]">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#6C757D] to-[#495057] shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <Chip variant="flat" size="sm" className="font-semibold bg-white/60 text-[#343A40] border border-white/30">Total</Chip>
              </div>
              <div className="space-y-2">
                <p className="text-base font-bold text-[#343A40] opacity-90 uppercase tracking-wider">{t('customers.totalClients')}</p>
                <p className="text-4xl font-extrabold text-[#343A40] mb-2 tracking-tight">{stats.total}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border border-[#004085]/20 shadow-lg bg-gradient-to-br from-[#E8F0FE] to-[#D1E7FF]">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#004085] to-[#003366] shadow-lg">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <Chip variant="flat" size="sm" className="font-semibold bg-white/60 text-[#343A40] border border-white/30">Registrados</Chip>
              </div>
              <div className="space-y-2">
                <p className="text-base font-bold text-[#343A40] opacity-90 uppercase tracking-wider">{t('customers.registeredClients')}</p>
                <p className="text-4xl font-extrabold text-[#343A40] mb-2 tracking-tight">{stats.identificados}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border border-[#6C757D]/20 shadow-lg bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF]">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#6C757D] to-[#495057] shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <Chip variant="flat" size="sm" className="font-semibold bg-white/60 text-[#343A40] border border-white/30">VIP</Chip>
              </div>
              <div className="space-y-2">
                <p className="text-base font-bold text-[#343A40] opacity-90 uppercase tracking-wider">{t('customers.vipClients')}</p>
                <p className="text-4xl font-extrabold text-[#343A40] mb-2 tracking-tight">{stats.vip}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border border-[#004085]/20 shadow-lg bg-gradient-to-br from-[#E8F0FE] to-[#D1E7FF]">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#004085] to-[#003366] shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <Chip variant="flat" size="sm" className="font-semibold bg-white/60 text-[#343A40] border border-white/30">Anónimos</Chip>
              </div>
              <div className="space-y-2">
                <p className="text-base font-bold text-[#343A40] opacity-90 uppercase tracking-wider">{t('customers.anonymousClients')}</p>
                <p className="text-4xl font-extrabold text-[#343A40] mb-2 tracking-tight">{stats.anonimos}</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="border border-gray-200 bg-white/90 shadow-sm">
          <CardBody>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <Input
                  placeholder={t('customers.searchPlaceholder')}
                  value={busqueda}
                  onValueChange={handleBusquedaChange}
                  startContent={<Search className="w-4 h-4 text-[#6C757D]" />}
                  variant="bordered"
                  classNames={{
                    input: "text-[#343A40] placeholder:text-[#6C757D]",
                    inputWrapper: "border-[#E8F0FE] hover:border-[#004085] focus-within:border-[#004085]",
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
                    trigger: "text-[#343A40] border-[#E8F0FE] hover:border-[#004085] focus:border-[#004085]",
                    value: "text-[#343A40]",
                    popoverContent: "bg-white border border-[#E8F0FE]",
                  }}
                >
                  <SelectItem key="todos" className="text-[#343A40] hover:bg-[#E8F0FE]">{t('customers.allTypes')}</SelectItem>
                  <SelectItem key="identified" className="text-[#343A40] hover:bg-[#E8F0FE]">{t('customers.identified')}</SelectItem>
                  <SelectItem key="anonymous" className="text-[#343A40] hover:bg-[#E8F0FE]">{t('customers.anonymous')}</SelectItem>
                  <SelectItem key="recurrent" className="text-[#343A40] hover:bg-[#E8F0FE]">{t('customers.recurrent')}</SelectItem>
                </Select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Lista de clientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white/95 shadow-sm">
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={getCustomerDisplayName(customer).charAt(0)}
                      classNames={{
                        base: customer.is_recurrent 
                          ? "bg-gradient-to-br from-[#6C757D] to-[#495057]" 
                          : "bg-gradient-to-br from-[#004085] to-[#003366]",
                        name: "text-white font-bold"
                      }}
                      size="lg"
                    />
                    <div>
                      <h3 className={`text-lg font-semibold text-gray-800`}>
                        {getCustomerDisplayName(customer)}
                      </h3>
                      <Chip
                        color={getBadgeColor(customer.customer_type, customer.is_recurrent)}
                        size="sm"
                        variant="flat"
                        className="bg-gray-100 text-gray-700 border border-gray-200"
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
                      <span className={`text-sm text-gray-600`}>{customer.email}</span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className={`text-sm text-gray-600`}>{customer.phone}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className={`text-sm text-gray-500`}>Total gastado:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(customer.stats?.totalGastado || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm text-gray-500`}>Servicios:</span>
                    <span className={`text-sm font-semibold text-gray-800`}>
                      {customer.stats?.totalReparaciones || 0}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Tooltip content={t('common.view') + " " + t('common.details')} classNames={{ content: "bg-gray-800 text-white" }}>
                    <Button isIconOnly variant="flat" size="sm" onPress={() => handleViewDetails(customer)} className="hover:bg-gray-100 text-gray-600">
                      <Eye className="w-5 h-5" />
                    </Button>
                  </Tooltip>
                  <Tooltip content={t('common.edit') + " " + t('common.customer')} classNames={{ content: "bg-gray-800 text-white" }}>
                    <Button isIconOnly variant="flat" size="sm" onPress={() => handleEditCustomer(customer)} className="hover:bg-gray-100 text-gray-600">
                      <Edit className="w-5 h-5" />
                    </Button>
                  </Tooltip>
                  <Tooltip content={t('common.delete') + " " + t('common.customer')} classNames={{ content: "bg-gray-800 text-white" }}>
                    <Button isIconOnly variant="flat" size="sm" color="danger" onPress={() => handleDeleteCustomer(customer)} className="hover:bg-red-50 text-red-600">
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
              size="lg"
              classNames={{
                wrapper: "gap-0 overflow-visible h-fit rounded-lg border border-[#E8F0FE]",
                item: "w-10 h-10 text-small rounded-none bg-transparent text-[#6C757D] hover:bg-[#E8F0FE]",
                cursor: "bg-gradient-to-r from-[#004085] to-[#003366] shadow-lg font-bold text-white",
                prev: "bg-transparent hover:bg-[#E8F0FE] text-[#6C757D]",
                next: "bg-transparent hover:bg-[#E8F0FE] text-[#6C757D]",
              }}
            />
          </div>
        )}

        {/* Modal para crear cliente */}
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
            <form onSubmit={handleCreateCustomer}>
              <ModalHeader>
                <h2 className={`text-xl font-bold text-gray-800`}>{t('customers.createTitle')}</h2>
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
                
                {/* Campo de cédula/DNI */}
                <FormField
                  label="Cédula / DNI (Opcional)"
                  name="cedula_dni"
                  value={newCustomer.cedula_dni}
                  onChange={(value) => setNewCustomer(prev => ({ ...prev, cedula_dni: value }))}
                  placeholder="Número de cédula o DNI"
                />
                
                {/* Campo de código de país para WhatsApp */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Código de País WhatsApp
                  </label>
                  <Select
                    selectedKeys={new Set([newCustomer.country_code])}
                    defaultSelectedKeys={new Set([newCustomer.country_code])}
                    placeholder="Seleccionar país"
                    onSelectionChange={(keys) => {
                      const selectedCode = Array.from(keys)[0] as string
                      setNewCustomer(prev => ({ ...prev, country_code: selectedCode }))
                    }}
                    variant="bordered"
                    classNames={{
                      trigger: "border-gray-300 hover:border-gray-400 focus-within:border-blue-500",
                      value: "text-gray-900"
                    }}
                  >
                    {SOUTH_AMERICAN_COUNTRIES.map((country) => (
                      <SelectItem key={country.whatsappCode}>
                        {country.flag} {country.name} ({country.whatsappCode})
                      </SelectItem>
                    ))}
                  </Select>
                  <p className="text-xs text-gray-500">
                    Código de país para enviar mensajes de WhatsApp automáticos
                  </p>
                </div>
                
                {/* Campo de identificación tributaria */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {organizationTaxIdType} (Opcional)
                  </label>
                  <Input
                    type="text"
                    placeholder={`Ejemplo: ${getTaxIdDescription(organizationCountry).replace('Formato: ', '')}`}
                    value={newCustomer.customer_tax_id}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, customer_tax_id: e.target.value }))}
                    variant="bordered"
                    startContent={<FileText className="w-4 h-4 text-gray-400" />}
                    classNames={{
                      input: "text-gray-900",
                      inputWrapper: "border-gray-300 hover:border-gray-400 focus-within:border-blue-500"
                    }}
                  />
                  <p className="text-xs text-gray-500">
                    Solo para clientes empresariales que requieren facturación formal
                  </p>
                </div>
                
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
              <ModalFooter className="bg-[#F8F9FA] border-t border-[#E8F0FE]/50">
                <Button variant="flat" onPress={onCreateClose} className="hover:bg-[#E8F0FE] text-[#6C757D]">Cancelar</Button>
                <Button 
                  type="submit" 
                  isLoading={createLoading}
                  startContent={!createLoading ? <Plus className="w-4 h-4" /> : null}
                  className="bg-gradient-to-r from-[#004085] to-[#003366] text-white hover:from-[#003366] hover:to-[#004085]"
                >
                  {t('customers.new')}
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>

        {/* Modal de ver detalles mejorado */}
        <Modal 
          isOpen={isDetailOpen} 
          onClose={handleDetailClose} 
          size="full" 
          scrollBehavior="inside"
          classNames={{
            wrapper: "z-[1000]",
            backdrop: "z-[999] bg-black/40 backdrop-blur-sm",
            base: "!rounded-3xl shadow-2xl border-0 bg-white max-h-[100vh] h-full w-full m-0 sm:max-h-[95vh] sm:h-auto sm:w-auto sm:my-6 sm:mx-6 md:mx-8 lg:mx-12 md:max-w-4xl",
            body: "max-h-[calc(100vh-120px)] sm:max-h-[80vh] overflow-y-auto p-4 sm:p-6 md:p-8",
            header: "border-b border-[#E8F0FE]/50 p-4 sm:p-6 md:p-8 bg-gradient-to-r from-[#F8F9FA]/50 to-white !rounded-t-3xl",
            footer: "border-t border-[#E8F0FE]/50 p-4 sm:p-6 md:p-8 bg-gradient-to-r from-[#F8F9FA]/50 to-white !rounded-b-3xl"
          }}
        >
          <ModalContent>
            <ModalHeader className="border-b">
              <div className="flex items-center gap-3">
                <Avatar
                  name={selectedCustomer ? getCustomerDisplayName(selectedCustomer).charAt(0) : '?'}
                  size="lg"
                  className="bg-gradient-to-br from-[#004085] to-[#003366]"
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
                        {selectedCustomer.cedula_dni && (
                          <div>
                            <label className={`text-sm font-medium ${textColors.tertiary}`}>Cédula / DNI:</label>
                            <p className={`text-base ${textColors.primary}`}>{selectedCustomer.cedula_dni}</p>
                          </div>
                        )}
                        {selectedCustomer.country_code && (
                          <div>
                            <label className={`text-sm font-medium ${textColors.tertiary}`}>Código País WhatsApp:</label>
                            <p className={`text-base ${textColors.primary}`}>{selectedCustomer.country_code}</p>
                          </div>
                        )}
                        {selectedCustomer.customer_tax_id && (
                          <div>
                            <label className={`text-sm font-medium ${textColors.tertiary}`}>
                              {selectedCustomer.customer_tax_id_type || 'ID Tributario'}:
                            </label>
                            <p className={`text-base ${textColors.primary}`}>{selectedCustomer.customer_tax_id}</p>
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
                          <Activity className="w-5 h-5 text-gray-500" />
                          Estadísticas Básicas
                        </h3>
                      </CardHeader>
                      <CardBody className="pt-0">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 bg-[#E8F0FE] rounded-lg">
                            <p className="text-xl font-bold text-[#343A40]">
                              {getFilteredStats().totalServices}
                            </p>
                            <p className="text-xs text-[#6C757D]">Total Servicios</p>
                          </div>
                          <div className="text-center p-3 bg-[#F8F9FA] rounded-lg">
                            <p className="text-xl font-bold text-[#343A40]">
                              {formatCurrency(getFilteredStats().totalSpent)}
                            </p>
                            <p className="text-xs text-[#6C757D]">Total Gastado</p>
                          </div>
                          <div className="text-center p-3 bg-[#E8F0FE] rounded-lg">
                            <p className="text-xl font-bold text-[#343A40]">
                              {getFilteredStats().pendingServices}
                            </p>
                            <p className="text-xs text-[#6C757D]">Pendientes</p>
                          </div>
                          <div className="text-center p-3 bg-[#F8F9FA] rounded-lg">
                            <p className="text-xl font-bold text-[#343A40]">
                              {getFilteredStats().completedServices}
                            </p>
                            <p className="text-xs text-[#6C757D]">Completadas</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Resumen financiero */}
                    <Card>
                      <CardHeader className="pb-3">
                        <h3 className={`text-lg font-semibold flex items-center gap-2 ${textColors.primary}`}>
                          <CreditCard className="w-5 h-5 text-gray-500" />
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
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(customerDetail.financialSummary.totalSpent)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className={`text-sm ${textColors.secondary}`}>Pendiente:</span>
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(customerDetail.financialSummary.totalPending)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className={`text-sm ${textColors.secondary}`}>Pagado:</span>
                              <span className="font-semibold text-gray-900">
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
                                  {service.type === 'sale' && <ShoppingBag className="w-4 h-4 text-gray-500" />}
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
                                <span className="font-semibold text-gray-900">
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
              {selectedCustomer && (
                <Button 
                  color="primary" 
                  startContent={<Edit className="w-4 h-4" />}
                  onPress={() => {
                    handleEditCustomer(selectedCustomer)
                    handleDetailClose()
                  }}
                >
                  Editar Cliente
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal de editar cliente */}
        <Modal 
          isOpen={isEditOpen} 
          onClose={onEditClose} 
          size="2xl"
          scrollBehavior="inside"
          classNames={{
            wrapper: "z-[1000]",
            backdrop: "z-[999] bg-black/40 backdrop-blur-sm",
            base: "!rounded-3xl shadow-2xl border-0 bg-white my-4 mx-4 sm:my-6 sm:mx-6 md:mx-8 lg:mx-12",
            body: "max-h-[75vh] overflow-y-auto p-6 md:p-8",
            header: "border-b border-gray-200/50 p-6 md:p-8 bg-gradient-to-r from-yellow-50/50 to-white !rounded-t-3xl",
            footer: "border-t border-gray-200/50 p-6 md:p-8 bg-gradient-to-r from-yellow-50/50 to-white !rounded-b-3xl"
          }}
        >
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
                    
                    {/* Campo de cédula/DNI */}
                    <FormField
                      label="Cédula / DNI (Opcional)"
                      name="cedula_dni"
                      value={editingCustomer.cedula_dni || ''}
                      onChange={(value) => setEditingCustomer(prev => prev ? ({ ...prev, cedula_dni: value }) : null)}
                      placeholder="Número de cédula o DNI"
                    />
                    
                    {/* Campo de código de país para WhatsApp */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Código de País WhatsApp
                      </label>
                      <Select
                        selectedKeys={new Set([editingCustomer.country_code || '+51'])}
                        defaultSelectedKeys={new Set([editingCustomer.country_code || '+51'])}
                        placeholder="Seleccionar país"
                        onSelectionChange={(keys) => {
                          const selectedCode = Array.from(keys)[0] as string
                          setEditingCustomer(prev => prev ? ({ ...prev, country_code: selectedCode }) : null)
                        }}
                        variant="bordered"
                        classNames={{
                          trigger: "border-gray-300 hover:border-gray-400 focus-within:border-blue-500",
                          value: "text-gray-900"
                        }}
                      >
                        {SOUTH_AMERICAN_COUNTRIES.map((country) => (
                          <SelectItem key={country.whatsappCode}>
                            {country.flag} {country.name} ({country.whatsappCode})
                          </SelectItem>
                        ))}
                      </Select>
                      <p className="text-xs text-gray-500">
                        Código de país para enviar mensajes de WhatsApp automáticos
                      </p>
                    </div>
                    
                    {/* Campo de identificación tributaria */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {organizationTaxIdType} (Opcional)
                      </label>
                      <Input
                        type="text"
                        placeholder={`Ejemplo: ${getTaxIdDescription(organizationCountry).replace('Formato: ', '')}`}
                        value={editingCustomer.customer_tax_id || ''}
                        onChange={(e) => setEditingCustomer(prev => prev ? ({ ...prev, customer_tax_id: e.target.value }) : null)}
                        variant="bordered"
                        startContent={<FileText className="w-4 h-4 text-gray-400" />}
                        classNames={{
                          input: "text-gray-900",
                          inputWrapper: "border-gray-300 hover:border-gray-400 focus-within:border-blue-500"
                        }}
                      />
                      <p className="text-xs text-gray-500">
                        Solo para clientes empresariales que requieren facturación formal
                      </p>
                    </div>
                    
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
              <ModalFooter className="bg-[#F8F9FA] border-t border-[#E8F0FE]/50">
                <Button variant="flat" onPress={onEditClose} className="hover:bg-[#E8F0FE] text-[#6C757D]">Cancelar</Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-[#004085] to-[#003366] text-white hover:from-[#003366] hover:to-[#004085]"
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