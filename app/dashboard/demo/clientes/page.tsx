'use client'

import React, { useState } from 'react'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import { DEMO_CUSTOMERS } from '@/lib/demo/data'
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Chip, 
  Button, 
  Input, 
  Select, 
  SelectItem, 
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Divider,
  Avatar,
  Progress
} from '@heroui/react'
import { 
  Search, 
  Filter, 
  Eye, 
  Plus, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Star, 
  Users,
  UserCheck,
  ShoppingBag,
  Activity,
  TrendingUp,
  Wrench,
  Unlock,
  Package
} from 'lucide-react'

export default function DemoClientesPage() {
  const { t } = useTranslations()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [recurrentFilter, setRecurrentFilter] = useState('all')
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const filteredCustomers = DEMO_CUSTOMERS.filter(customer => {
    const matchesSearch = (customer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || customer.customer_type === typeFilter
    const matchesRecurrent = recurrentFilter === 'all' || 
                           (recurrentFilter === 'recurrent' && customer.is_recurrent) ||
                           (recurrentFilter === 'non_recurrent' && !customer.is_recurrent)
    
    return matchesSearch && matchesType && matchesRecurrent
  })

  const getBadgeColor = (type: string, isRecurrent: boolean) => {
    if (isRecurrent) return 'secondary'
    return type === 'identified' ? 'success' : 'warning'
  }

  const getBadgeLabel = (type: string, isRecurrent: boolean) => {
    if (isRecurrent) return 'Cliente VIP'
    return type === 'identified' ? 'Identificado' : 'Anónimo'
  }

  const getCustomerDisplayName = (customer: any) => {
    return customer.name || customer.anonymous_identifier || 'Cliente Anónimo'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return `S/ ${amount.toLocaleString()}`
  }

  const viewCustomerDetails = (customer: any) => {
    setSelectedCustomer(customer)
    onOpen()
  }

  const customerStats = {
    total: DEMO_CUSTOMERS.length,
    identified: DEMO_CUSTOMERS.filter(c => c.customer_type === 'identified').length,
    anonymous: DEMO_CUSTOMERS.filter(c => c.customer_type === 'anonymous').length,
    recurrent: DEMO_CUSTOMERS.filter(c => c.is_recurrent).length,
    totalRevenue: DEMO_CUSTOMERS.reduce((sum, c) => sum + c.total_spent, 0),
    totalServices: DEMO_CUSTOMERS.reduce((sum, c) => sum + c.total_repairs, 0)
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Gestión de Clientes
          </h1>
          <p className="text-gray-600 mt-1">
            Administra la información de todos los clientes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Chip 
            color="warning" 
            variant="flat" 
            size="lg"
            className="font-semibold"
          >
            🎭 MODO DEMO
          </Chip>
          <Button
            color="primary"
            startContent={<Plus className="h-4 w-4" />}
            className="font-semibold cursor-not-allowed"
            disabled
          >
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="shadow-lg hover:scale-105 transition-transform">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{customerStats.total}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="shadow-lg hover:scale-105 transition-transform">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Identificados</p>
                <p className="text-2xl font-bold text-gray-900">{customerStats.identified}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg hover:scale-105 transition-transform">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-3 rounded-xl">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Anónimos</p>
                <p className="text-2xl font-bold text-gray-900">{customerStats.anonymous}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg hover:scale-105 transition-transform">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-xl">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Recurrentes</p>
                <p className="text-2xl font-bold text-gray-900">{customerStats.recurrent}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg hover:scale-105 transition-transform">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(customerStats.totalRevenue)}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg hover:scale-105 transition-transform">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Servicios Total</p>
                <p className="text-2xl font-bold text-gray-900">{customerStats.totalServices}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="shadow-lg">
        <CardBody className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              startContent={<Search className="h-4 w-4 text-gray-400" />}
              variant="bordered"
              className="flex-1"
            />
            <Select 
              placeholder="Tipo de cliente" 
              selectedKeys={new Set([typeFilter])}
              onSelectionChange={(keys) => setTypeFilter(Array.from(keys)[0] as string)}
              variant="bordered"
              className="min-w-[150px]"
            >
              <SelectItem key="all">Todos</SelectItem>
              <SelectItem key="identified">Identificados</SelectItem>
              <SelectItem key="anonymous">Anónimos</SelectItem>
            </Select>
            <Select 
              placeholder="Recurrencia" 
              selectedKeys={new Set([recurrentFilter])}
              onSelectionChange={(keys) => setRecurrentFilter(Array.from(keys)[0] as string)}
              variant="bordered"
              className="min-w-[150px]"
            >
              <SelectItem key="all">Todos</SelectItem>
              <SelectItem key="recurrent">Recurrentes</SelectItem>
              <SelectItem key="non_recurrent">No Recurrentes</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Lista de clientes en cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-xl transition-shadow border-0">
            <CardBody className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={getCustomerDisplayName(customer).charAt(0)}
                    className={
                      customer.is_recurrent 
                        ? "bg-gradient-to-br from-purple-400 to-pink-400" 
                        : "bg-gradient-to-br from-blue-400 to-cyan-400"
                    }
                  />
                  <div>
                    <p className="font-medium text-gray-900">{getCustomerDisplayName(customer)}</p>
                    <p className="text-sm text-gray-500">{formatDate(customer.created_at)}</p>
                  </div>
                </div>
                <Chip 
                  color={getBadgeColor(customer.customer_type, customer.is_recurrent)}
                  variant="flat"
                  size="sm"
                >
                  {getBadgeLabel(customer.customer_type, customer.is_recurrent)}
                </Chip>
              </div>

              <div className="space-y-3">
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{customer.phone}</span>
                  </div>
                )}
                
                {customer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{customer.email}</span>
                  </div>
                )}
                
                {customer.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700 truncate">{customer.address}</span>
                  </div>
                )}

                <Divider />

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{customer.total_repairs}</p>
                    <p className="text-xs text-gray-500">Servicios</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{formatCurrency(customer.total_spent)}</p>
                    <p className="text-xs text-gray-500">Gastado</p>
                  </div>
                </div>

                {customer.is_recurrent && (
                  <div className="mt-2">
                    <Progress 
                      value={85} 
                      color="secondary" 
                      size="sm" 
                      label="Fidelidad"
                      className="max-w-md"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Tooltip content="Ver detalles" color="primary">
                  <Button
                    isIconOnly
                    variant="ghost"
                    color="primary"
                    size="sm"
                    onPress={() => viewCustomerDetails(customer)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </Tooltip>
                <Tooltip content="Editar (Demo)" color="warning">
                  <Button
                    isIconOnly
                    variant="ghost"
                    color="warning"
                    size="sm"
                    className="cursor-not-allowed opacity-50"
                    disabled
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </Tooltip>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Modal de detalles */}
      <Modal isOpen={isOpen} onClose={onClose} size="3xl">
        <ModalContent>
          {selectedCustomer && (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold text-gray-900">Perfil del Cliente</h2>
                <p className="text-sm text-gray-500">ID: {selectedCustomer.id}</p>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-6">
                  {/* Información básica */}
                  <div className="flex items-center gap-4">
                    <Avatar
                      name={getCustomerDisplayName(selectedCustomer).charAt(0)}
                      size="lg"
                      className={
                        selectedCustomer.is_recurrent 
                          ? "bg-gradient-to-br from-purple-400 to-pink-400" 
                          : "bg-gradient-to-br from-blue-400 to-cyan-400"
                      }
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getCustomerDisplayName(selectedCustomer)}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Chip 
                          color={getBadgeColor(selectedCustomer.customer_type, selectedCustomer.is_recurrent)}
                          variant="flat"
                          size="sm"
                        >
                          {getBadgeLabel(selectedCustomer.customer_type, selectedCustomer.is_recurrent)}
                        </Chip>
                        <span className="text-sm text-gray-500">
                          Cliente desde {formatDate(selectedCustomer.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Divider />

                  {/* Información de contacto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Información de Contacto</h4>
                      <div className="space-y-3">
                        {selectedCustomer.phone && (
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <Phone className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Teléfono</p>
                              <p className="font-medium text-gray-900">{selectedCustomer.phone}</p>
                            </div>
                          </div>
                        )}
                        
                        {selectedCustomer.email && (
                          <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                              <Mail className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="font-medium text-gray-900">{selectedCustomer.email}</p>
                            </div>
                          </div>
                        )}
                        
                        {selectedCustomer.address && (
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-100 p-2 rounded-lg">
                              <MapPin className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Dirección</p>
                              <p className="font-medium text-gray-900">{selectedCustomer.address}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Estadísticas</h4>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Total Gastado</span>
                            <span className="text-lg font-bold text-green-600">
                              {formatCurrency(selectedCustomer.total_spent)}
                            </span>
                          </div>
                          <Progress 
                            value={(selectedCustomer.total_spent / 2000) * 100} 
                            color="success" 
                            size="sm"
                          />
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Servicios Totales</span>
                            <span className="text-lg font-bold text-blue-600">
                              {selectedCustomer.total_repairs}
                            </span>
                          </div>
                          <Progress 
                            value={(selectedCustomer.total_repairs / 15) * 100} 
                            color="primary" 
                            size="sm"
                          />
                        </div>

                        {selectedCustomer.is_recurrent && (
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Star className="h-4 w-4 text-purple-600" />
                              <span className="text-sm font-medium text-purple-800">Cliente VIP</span>
                            </div>
                            <p className="text-xs text-purple-600">
                              Este cliente tiene un historial de servicios recurrentes
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Divider />

                  {/* Historial de servicios */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Historial de Servicios</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Wrench className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-blue-900">
                              {selectedCustomer.service_history?.repairs || 0}
                            </p>
                            <p className="text-sm text-blue-600">Reparaciones</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <Unlock className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-green-900">
                              {selectedCustomer.service_history?.unlocks || 0}
                            </p>
                            <p className="text-sm text-green-600">Desbloqueos</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-100 p-2 rounded-lg">
                            <Package className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-purple-900">
                              {selectedCustomer.service_history?.sales || 0}
                            </p>
                            <p className="text-sm text-purple-600">Ventas</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Cerrar
                </Button>
                <Button color="primary" className="cursor-not-allowed opacity-50" disabled>
                  Editar Cliente
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
} 