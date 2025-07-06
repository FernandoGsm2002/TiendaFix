'use client'

import React, { useState } from 'react'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import { DEMO_INVENTORY } from '@/lib/demo/data'
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Chip, 
  Button, 
  Input, 
  Select, 
  SelectItem, 
  Table, 
  TableHeader, 
  TableBody, 
  TableColumn, 
  TableRow, 
  TableCell,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Progress
} from '@heroui/react'
import { 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  Plus, 
  Package, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Smartphone,
  Battery,
  Cpu,
  Zap,
  Tag,
  MapPin,
  Building
} from 'lucide-react'

export default function DemoInventarioPage() {
  const { t } = useTranslations()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const filteredProducts = DEMO_INVENTORY.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'low_stock': return 'warning'
      case 'out_of_stock': return 'danger'
      case 'discontinued': return 'default'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activo'
      case 'low_stock': return 'Stock Bajo'
      case 'out_of_stock': return 'Sin Stock'
      case 'discontinued': return 'Descontinuado'
      default: return status
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Pantallas': return Smartphone
      case 'Baterías': return Battery
      case 'Conectores': return Zap
      case 'Accesorios': return Package
      default: return Package
    }
  }

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity === 0) return 'out_of_stock'
    if (quantity <= minStock) return 'low_stock'
    return 'active'
  }

  const formatCurrency = (amount: number) => {
    return `S/ ${amount.toLocaleString()}`
  }

  const viewProductDetails = (product: any) => {
    setSelectedProduct(product)
    onOpen()
  }

  const inventoryStats = {
    totalProducts: DEMO_INVENTORY.length,
    activeProducts: DEMO_INVENTORY.filter(p => p.status === 'active').length,
    lowStockProducts: DEMO_INVENTORY.filter(p => p.status === 'low_stock').length,
    outOfStockProducts: DEMO_INVENTORY.filter(p => p.status === 'out_of_stock').length,
    totalValue: DEMO_INVENTORY.reduce((sum, p) => sum + (p.unit_cost * p.stock_quantity), 0),
    totalPotentialRevenue: DEMO_INVENTORY.reduce((sum, p) => sum + (p.sale_price * p.stock_quantity), 0)
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Gestión de Inventario
          </h1>
          <p className="text-gray-600 mt-1">
            Administra productos, repuestos y accesorios
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
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="shadow-lg">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Productos</p>
                <p className="text-2xl font-bold text-gray-900">{inventoryStats.totalProducts}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="shadow-lg">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">En Stock</p>
                <p className="text-2xl font-bold text-gray-900">{inventoryStats.activeProducts}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-3 rounded-xl">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                <p className="text-2xl font-bold text-gray-900">{inventoryStats.lowStockProducts}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-400 to-red-600 p-3 rounded-xl">
                <XCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Sin Stock</p>
                <p className="text-2xl font-bold text-gray-900">{inventoryStats.outOfStockProducts}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-xl">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(inventoryStats.totalValue)}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-teal-400 to-teal-600 p-3 rounded-xl">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Potenciales</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(inventoryStats.totalPotentialRevenue)}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="shadow-lg">
        <CardBody className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nombre, descripción, SKU o marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startContent={<Search className="h-4 w-4 text-gray-400" />}
                variant="bordered"
                className="w-full"
              />
            </div>
            <div className="flex gap-3">
              <Select 
                placeholder="Categoría" 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                variant="bordered"
                className="min-w-[150px]"
              >
                <SelectItem key="all">Todas las categorías</SelectItem>
                <SelectItem key="Pantallas">Pantallas</SelectItem>
                <SelectItem key="Baterías">Baterías</SelectItem>
                <SelectItem key="Conectores">Conectores</SelectItem>
                <SelectItem key="Accesorios">Accesorios</SelectItem>
              </Select>
              <Select 
                placeholder="Estado" 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                variant="bordered"
                className="min-w-[150px]"
              >
                <SelectItem key="all">Todos los estados</SelectItem>
                <SelectItem key="active">En stock</SelectItem>
                <SelectItem key="low_stock">Stock bajo</SelectItem>
                <SelectItem key="out_of_stock">Sin stock</SelectItem>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tabla de productos - Vista Desktop */}
      <Card className="shadow-lg hidden md:block">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-semibold text-gray-900">
              Catálogo de Productos ({filteredProducts.length})
            </h2>
            <Chip color="primary" variant="flat" size="sm">
              Solo visualización
            </Chip>
          </div>
        </CardHeader>
        <CardBody>
          <Table aria-label="Tabla de productos">
            <TableHeader>
              <TableColumn>PRODUCTO</TableColumn>
              <TableColumn>CATEGORÍA</TableColumn>
              <TableColumn>SKU</TableColumn>
              <TableColumn>STOCK</TableColumn>
              <TableColumn>COSTO</TableColumn>
              <TableColumn>PRECIO VENTA</TableColumn>
              <TableColumn>MARGEN</TableColumn>
              <TableColumn>ACCIONES</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const IconComponent = getCategoryIcon(product.category)
                const margin = ((product.sale_price - product.unit_cost) / product.unit_cost * 100)
                const stockStatus = getStockStatus(product.stock_quantity, product.min_stock)
                const stockProgress = (product.stock_quantity / (product.min_stock * 3)) * 100

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <IconComponent className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.brand} - {product.model}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip variant="flat" size="sm" color="primary">
                        {product.category}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tag className="h-3 w-3 text-blue-600" />
                        <span className="text-sm text-gray-900 font-mono">{product.sku}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">{product.stock_quantity}</span>
                          <Chip 
                            color={getStatusColor(stockStatus)}
                            variant="flat"
                            size="sm"
                          >
                            {getStatusLabel(stockStatus)}
                          </Chip>
                        </div>
                        <Progress 
                          value={Math.min(stockProgress, 100)} 
                          color={stockStatus === 'active' ? 'success' : stockStatus === 'low_stock' ? 'warning' : 'danger'}
                          size="sm"
                          className="max-w-20"
                        />
                        <p className="text-xs text-gray-500">Min: {product.min_stock}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{formatCurrency(product.unit_cost)}</p>
                        <p className="text-gray-500">por unidad</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{formatCurrency(product.sale_price)}</p>
                        <p className="text-gray-500">precio venta</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {margin > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`font-medium ${margin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {margin.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tooltip content="Ver detalles" color="primary">
                          <Button
                            isIconOnly
                            variant="ghost"
                            color="primary"
                            size="sm"
                            onPress={() => viewProductDetails(product)}
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
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Vista de Cards para Móvil */}
      <div className="md:hidden">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Catálogo de Productos ({filteredProducts.length})
          </h2>
          <Chip color="primary" variant="flat" size="sm">
            Solo visualización
          </Chip>
        </div>
        
        <div className="space-y-4">
          {filteredProducts.map((product) => {
            const IconComponent = getCategoryIcon(product.category)
            const margin = ((product.sale_price - product.unit_cost) / product.unit_cost * 100)
            const stockStatus = getStockStatus(product.stock_quantity, product.min_stock)
            const stockProgress = (product.stock_quantity / (product.min_stock * 3)) * 100

            return (
              <Card key={product.id} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardBody className="p-4">
                  {/* Header del producto */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="bg-blue-100 p-2 rounded-xl">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
                        <p className="text-xs text-gray-500">{product.brand} - {product.model}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Tag className="h-3 w-3 text-blue-600" />
                          <span className="text-xs text-gray-600 font-mono">{product.sku}</span>
                        </div>
                      </div>
                    </div>
                    <Chip variant="flat" size="sm" color="primary">
                      {product.category}
                    </Chip>
                  </div>

                  {/* Estado del Stock */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-600">Stock</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">{product.stock_quantity}</span>
                        <Chip 
                          color={getStatusColor(stockStatus)}
                          variant="flat"
                          size="sm"
                        >
                          {getStatusLabel(stockStatus)}
                        </Chip>
                      </div>
                    </div>
                    <Progress 
                      value={Math.min(stockProgress, 100)} 
                      color={stockStatus === 'active' ? 'success' : stockStatus === 'low_stock' ? 'warning' : 'danger'}
                      size="sm"
                      className="mb-1"
                    />
                    <p className="text-xs text-gray-500">Mínimo: {product.min_stock}</p>
                  </div>

                  {/* Información de Precios */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Costo</p>
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(product.unit_cost)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Precio Venta</p>
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(product.sale_price)}</p>
                    </div>
                  </div>

                  {/* Margen */}
                  <div className="flex items-center justify-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
                    {margin > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`font-medium ${margin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Margen: {margin.toFixed(1)}%
                    </span>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="ghost"
                      color="primary"
                      size="sm"
                      startContent={<Eye className="h-4 w-4" />}
                      onPress={() => viewProductDetails(product)}
                    >
                      Ver Detalles
                    </Button>
                    <Button
                      variant="ghost"
                      color="warning"
                      size="sm"
                      startContent={<Edit3 className="h-4 w-4" />}
                      className="cursor-not-allowed opacity-50"
                      disabled
                    >
                      Editar
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Modal de detalles */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          {selectedProduct && (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold text-gray-900">Detalles del Producto</h2>
                <p className="text-sm text-gray-500">SKU: {selectedProduct.sku}</p>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-4 rounded-xl">
                      {(() => {
                        const IconComponent = getCategoryIcon(selectedProduct.category)
                        return <IconComponent className="h-8 w-8 text-blue-600" />
                      })()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedProduct.name}
                      </h3>
                      <p className="text-gray-600">{selectedProduct.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Chip variant="flat" size="sm" color="primary">
                          {selectedProduct.category}
                        </Chip>
                        <Chip 
                          color={getStatusColor(selectedProduct.status)}
                          variant="flat"
                          size="sm"
                        >
                          {getStatusLabel(selectedProduct.status)}
                        </Chip>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Información del Producto</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Marca:</span>
                          <span className="font-medium">{selectedProduct.brand}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Modelo:</span>
                          <span className="font-medium">{selectedProduct.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Proveedor:</span>
                          <span className="font-medium">{selectedProduct.supplier}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ubicación:</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="font-medium">{selectedProduct.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Inventario y Precios</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Stock actual:</span>
                          <span className="font-medium">{selectedProduct.stock_quantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Stock mínimo:</span>
                          <span className="font-medium">{selectedProduct.min_stock}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Costo unitario:</span>
                          <span className="font-medium">{formatCurrency(selectedProduct.unit_cost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Precio venta:</span>
                          <span className="font-medium">{formatCurrency(selectedProduct.sale_price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Margen:</span>
                          <span className="font-medium text-green-600">
                            {(((selectedProduct.sale_price - selectedProduct.unit_cost) / selectedProduct.unit_cost) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Valor Total en Inventario</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Valor de costo:</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(selectedProduct.unit_cost * selectedProduct.stock_quantity)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Valor de venta:</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(selectedProduct.sale_price * selectedProduct.stock_quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Estado del Stock</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nivel de stock:</span>
                        <span className="font-medium">
                          {selectedProduct.stock_quantity > selectedProduct.min_stock ? 'Óptimo' : 
                           selectedProduct.stock_quantity > 0 ? 'Bajo' : 'Agotado'}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min((selectedProduct.stock_quantity / (selectedProduct.min_stock * 3)) * 100, 100)} 
                        color={
                          selectedProduct.stock_quantity > selectedProduct.min_stock ? 'success' : 
                          selectedProduct.stock_quantity > 0 ? 'warning' : 'danger'
                        }
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Cerrar
                </Button>
                <Button color="primary" className="cursor-not-allowed opacity-50" disabled>
                  Editar Producto
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
} 