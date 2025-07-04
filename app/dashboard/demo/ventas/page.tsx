'use client'

import React, { useState } from 'react'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import { DEMO_SALES } from '@/lib/demo/data'
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
  Avatar
} from '@heroui/react'
import { 
  Search, 
  Filter, 
  Eye, 
  Plus, 
  DollarSign, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  ShoppingCart, 
  TrendingUp, 
  Calendar,
  User,
  Receipt,
  Package,
  FileText
} from 'lucide-react'

export default function DemoVentasPage() {
  const { t } = useTranslations()
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all')
  const [saleTypeFilter, setSaleTypeFilter] = useState('all')
  const [selectedSale, setSelectedSale] = useState<any>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const filteredSales = DEMO_SALES.filter(sale => {
    const matchesSearch = sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesPayment = paymentMethodFilter === 'all' || sale.payment_method === paymentMethodFilter
    const matchesType = saleTypeFilter === 'all' || sale.sale_type === saleTypeFilter
    
    return matchesSearch && matchesPayment && matchesType
  })

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return Banknote
      case 'card': return CreditCard
      case 'yape': return Smartphone
      case 'plin': return Smartphone
      default: return DollarSign
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Efectivo'
      case 'card': return 'Tarjeta'
      case 'yape': return 'Yape'
      case 'plin': return 'Plin'
      default: return method
    }
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'success'
      case 'card': return 'primary'
      case 'yape': return 'secondary'
      case 'plin': return 'warning'
      default: return 'default'
    }
  }

  const getSaleTypeLabel = (type: string) => {
    switch (type) {
      case 'product': return 'Solo Productos'
      case 'service': return 'Solo Servicios'
      case 'mixed': return 'Mixta'
      default: return type
    }
  }

  const getSaleTypeColor = (type: string) => {
    switch (type) {
      case 'product': return 'primary'
      case 'service': return 'success'
      case 'mixed': return 'warning'
      default: return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return `S/ ${amount.toLocaleString()}`
  }

  const viewSaleDetails = (sale: any) => {
    setSelectedSale(sale)
    onOpen()
  }

  const salesStats = {
    totalSales: DEMO_SALES.length,
    totalRevenue: DEMO_SALES.reduce((sum, sale) => sum + sale.total, 0),
    avgSaleValue: DEMO_SALES.reduce((sum, sale) => sum + sale.total, 0) / DEMO_SALES.length,
    cashSales: DEMO_SALES.filter(s => s.payment_method === 'cash').length,
    cardSales: DEMO_SALES.filter(s => s.payment_method === 'card').length,
    digitalSales: DEMO_SALES.filter(s => ['yape', 'plin'].includes(s.payment_method)).length
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Gestión de Ventas
          </h1>
          <p className="text-gray-600 mt-1">
            Administra todas las ventas y facturación
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
            Nueva Venta
          </Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="shadow-lg hover:scale-105 transition-transform">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Ventas</p>
                <p className="text-2xl font-bold text-gray-900">{salesStats.totalSales}</p>
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
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(salesStats.totalRevenue)}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg hover:scale-105 transition-transform">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-xl">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Promedio Venta</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(salesStats.avgSaleValue)}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg hover:scale-105 transition-transform">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl">
                <Banknote className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Efectivo</p>
                <p className="text-2xl font-bold text-gray-900">{salesStats.cashSales}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg hover:scale-105 transition-transform">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tarjeta</p>
                <p className="text-2xl font-bold text-gray-900">{salesStats.cardSales}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg hover:scale-105 transition-transform">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-xl">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Digital</p>
                <p className="text-2xl font-bold text-gray-900">{salesStats.digitalSales}</p>
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
              placeholder="Buscar ventas..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              startContent={<Search className="h-4 w-4 text-gray-400" />}
              variant="bordered"
              className="flex-1"
            />
            <Select 
              placeholder="Método de pago" 
              selectedKeys={new Set([paymentMethodFilter])}
              onSelectionChange={(keys) => setPaymentMethodFilter(Array.from(keys)[0] as string)}
              variant="bordered"
              className="min-w-[150px]"
            >
              <SelectItem key="all">Todos</SelectItem>
              <SelectItem key="cash">Efectivo</SelectItem>
              <SelectItem key="card">Tarjeta</SelectItem>
              <SelectItem key="yape">Yape</SelectItem>
              <SelectItem key="plin">Plin</SelectItem>
            </Select>
            <Select 
              placeholder="Tipo de venta" 
              selectedKeys={new Set([saleTypeFilter])}
              onSelectionChange={(keys) => setSaleTypeFilter(Array.from(keys)[0] as string)}
              variant="bordered"
              className="min-w-[150px]"
            >
              <SelectItem key="all">Todos</SelectItem>
              <SelectItem key="product">Solo Productos</SelectItem>
              <SelectItem key="service">Solo Servicios</SelectItem>
              <SelectItem key="mixed">Mixta</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Lista de ventas en cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSales.map((sale) => {
          const PaymentIcon = getPaymentMethodIcon(sale.payment_method)
          
          return (
            <Card key={sale.id} className="hover:shadow-xl transition-shadow border-0">
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={sale.customer_name.charAt(0)}
                      className="bg-gradient-to-br from-blue-400 to-cyan-400"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{sale.customer_name}</p>
                      <p className="text-sm text-gray-500">{formatDate(sale.created_at)}</p>
                    </div>
                  </div>
                  <Chip 
                    color={getSaleTypeColor(sale.sale_type)}
                    variant="flat"
                    size="sm"
                  >
                    {getSaleTypeLabel(sale.sale_type)}
                  </Chip>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium text-gray-900">{sale.items.length} producto(s)</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Método de pago:</span>
                    <div className="flex items-center gap-2">
                      <PaymentIcon className="h-4 w-4 text-gray-600" />
                      <Chip 
                        color={getPaymentMethodColor(sale.payment_method)}
                        variant="flat"
                        size="sm"
                      >
                        {getPaymentMethodLabel(sale.payment_method)}
                      </Chip>
                    </div>
                  </div>

                  <Divider />

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-xl font-bold text-green-600">{formatCurrency(sale.total)}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Tooltip content="Ver detalles" color="primary">
                    <Button
                      isIconOnly
                      variant="ghost"
                      color="primary"
                      size="sm"
                      onPress={() => viewSaleDetails(sale)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Imprimir (Demo)" color="warning">
                    <Button
                      isIconOnly
                      variant="ghost"
                      color="warning"
                      size="sm"
                      className="cursor-not-allowed opacity-50"
                      disabled
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>

      {/* Modal de detalles */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          {selectedSale && (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold text-gray-900">Detalles de la Venta</h2>
                <p className="text-sm text-gray-500">ID: {selectedSale.id}</p>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-4 rounded-xl">
                      <ShoppingCart className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Venta a {selectedSale.customer_name}
                      </h3>
                      <p className="text-gray-600">{formatDate(selectedSale.created_at)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Chip 
                          color={getSaleTypeColor(selectedSale.sale_type)}
                          variant="flat"
                          size="sm"
                        >
                          {getSaleTypeLabel(selectedSale.sale_type)}
                        </Chip>
                        <div className="flex items-center gap-1">
                          {(() => {
                            const PaymentIcon = getPaymentMethodIcon(selectedSale.payment_method)
                            return <PaymentIcon className="h-3 w-3 text-gray-600" />
                          })()}
                          <span className="text-sm text-gray-600">
                            {getPaymentMethodLabel(selectedSale.payment_method)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Divider />
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Productos/Servicios</h4>
                    <div className="space-y-2">
                      {selectedSale.items.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <Package className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{formatCurrency(item.price)}</p>
                            <p className="text-sm text-gray-500">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Divider />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Información de Pago</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Método:</span>
                          <span className="font-medium text-gray-900">{getPaymentMethodLabel(selectedSale.payment_method)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tipo de venta:</span>
                          <span className="font-medium text-gray-900">{getSaleTypeLabel(selectedSale.sale_type)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total items:</span>
                          <span className="font-medium text-gray-900">{selectedSale.items.length}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Resumen</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(selectedSale.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">IGV (18%):</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(selectedSale.total * 0.18)}
                          </span>
                        </div>
                        <Divider />
                        <div className="flex justify-between text-lg font-bold">
                          <span className="text-gray-900">Total:</span>
                          <span className="text-green-600">{formatCurrency(selectedSale.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedSale.notes && (
                    <>
                      <Divider />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Notas</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedSale.notes}</p>
                      </div>
                    </>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Cerrar
                </Button>
                <Button color="primary" className="cursor-not-allowed opacity-50" disabled>
                  Imprimir Factura
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
} 