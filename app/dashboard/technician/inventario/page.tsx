'use client'

import React, { useState, useEffect } from 'react'
import TechnicianDashboardLayout from '../components/TechnicianDashboardLayout'
import { 
  Card, 
  CardBody, 
  Input,
  Select,
  SelectItem,
  Chip,
  Skeleton,
  Avatar,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Alert,
  Button
} from '@heroui/react'
import { useCurrency, useTranslations } from '@/lib/contexts/TranslationContext'
import { 
  Search, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  TrendingDown,
  Eye,
  Info,
  Archive,
  ShoppingBag,
  DollarSign,
  MapPin
} from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  category: string
  brand: string
  model: string
  stock_quantity: number
  min_stock: number
  enduser_price: number
  unit_cost: number
  location: string
  sku: string
  supplier: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function TechnicianInventoryPage() {
  const { formatCurrency } = useCurrency()
  const { t } = useTranslations()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todos')

  // Cargar productos del inventario
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filtroCategoria !== 'todos') params.append('category', filtroCategoria)
      if (busqueda) params.append('search', busqueda)

      const response = await fetch(`/api/inventory?${params}`)
      if (!response.ok) throw new Error('Error al cargar inventario')
      
      const data = await response.json()
      setProducts(data.data || [])
    } catch (error) {
      console.error('Error fetching inventory:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Aplicar filtros cuando cambien
  useEffect(() => {
    fetchProducts()
  }, [filtroCategoria, busqueda])

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'pantallas': 'Pantallas',
      'baterias': 'Baterías',
      'accesorios': 'Accesorios',
      'repuestos': 'Repuestos',
      'herramientas': 'Herramientas'
    }
    return labels[category] || category
  }

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: 'Sin stock', color: 'danger' as const, icon: AlertTriangle }
    if (stock <= minStock) return { label: 'Stock bajo', color: 'warning' as const, icon: TrendingDown }
    return { label: 'En stock', color: 'success' as const, icon: CheckCircle }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(busqueda.toLowerCase()) ||
                         product.brand.toLowerCase().includes(busqueda.toLowerCase()) ||
                         product.model.toLowerCase().includes(busqueda.toLowerCase())
    const matchesCategory = filtroCategoria === 'todos' || product.category === filtroCategoria
    return matchesSearch && matchesCategory
  })

  const stats = {
    total: products.length,
    bajoStock: products.filter(p => p.stock_quantity <= p.min_stock && p.stock_quantity > 0).length,
    sinStock: products.filter(p => p.stock_quantity === 0).length,
    disponibles: products.filter(p => p.stock_quantity > p.min_stock).length,
    valorTotal: products.reduce((sum, p) => sum + (p.stock_quantity * p.unit_cost), 0)
  }

  if (loading) {
    return (
      <TechnicianDashboardLayout>
        <div className="space-y-8">
          <Skeleton className="h-12 w-80 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="shadow-xl">
                <CardBody className="p-6">
                  <Skeleton className="h-32 w-full rounded-lg" />
                </CardBody>
              </Card>
            ))}
          </div>
          <Card className="shadow-xl">
            <CardBody className="p-6">
              <Skeleton className="h-80 w-full rounded-lg" />
            </CardBody>
          </Card>
        </div>
      </TechnicianDashboardLayout>
    )
  }

  return (
    <TechnicianDashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Inventario de Productos
            </h1>
            <p className="text-gray-600 font-medium">
              Consulta de stock disponible • Repuestos y accesorios
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500 font-medium">Solo lectura</span>
              </div>
              <Chip 
                color="primary" 
                variant="flat"
                startContent={<Package className="w-4 h-4" />}
                className="font-semibold"
              >
                {stats.total} productos registrados
              </Chip>
            </div>
          </div>
        </div>

        {/* Alerta de solo lectura */}
        <Alert 
          color="primary" 
          variant="bordered"
          startContent={
            <div className="p-1 rounded-md bg-blue-100">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
          }
          title="Modo Consulta"
          description="Como técnico, puedes consultar el inventario completo pero no modificar el stock. Contacta al administrador para solicitar repuestos o reportar faltantes."
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="hover:scale-105 transition-all duration-300 border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Archive className="w-6 h-6 text-white" />
                </div>
                <Chip color="primary" variant="flat" className="font-semibold">Total</Chip>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-700">Total Productos</p>
                <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-100">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <Chip color="success" variant="flat" className="font-semibold">Disponibles</Chip>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-700">Stock Normal</p>
                <p className="text-2xl font-bold text-green-800">{stats.disponibles}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border-0 shadow-xl bg-gradient-to-br from-orange-50 to-orange-100">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
                <Chip color="warning" variant="flat" className="font-semibold">Stock Bajo</Chip>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-orange-700">Requieren Atención</p>
                <p className="text-2xl font-bold text-orange-800">{stats.bajoStock}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border-0 shadow-xl bg-gradient-to-br from-red-50 to-red-100">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <Chip color="danger" variant="flat" className="font-semibold">Sin Stock</Chip>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-700">Productos Agotados</p>
                <p className="text-2xl font-bold text-red-800">{stats.sinStock}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border-0 shadow-xl bg-gradient-to-br from-purple-50 to-indigo-100">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <Chip color="secondary" variant="flat" className="font-semibold">Valor Total</Chip>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-purple-700">Valor Inventario</p>
                <p className="text-2xl font-bold text-purple-800">{formatCurrency(stats.valorTotal)}</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="shadow-xl border-0 bg-gradient-to-r from-white to-gray-50">
          <CardBody className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1 w-full">
                <Input
                  placeholder="Buscar productos, marcas, modelos o categorías..."
                  value={busqueda}
                  onValueChange={setBusqueda}
                  startContent={
                    <div className="p-1 rounded-md bg-gradient-to-br from-purple-100 to-indigo-100">
                      <Search className="w-4 h-4 text-purple-600" />
                    </div>
                  }
                  variant="bordered"
                  size="lg"
                  classNames={{
                    input: "text-gray-900 placeholder:text-gray-500",
                    inputWrapper: "border-gray-300 hover:border-purple-400 focus-within:border-purple-500 bg-white shadow-md",
                  }}
                />
              </div>
              <div className="w-full md:w-60">
                <Select
                  placeholder="Filtrar por Categoría"
                  selectedKeys={new Set([filtroCategoria])}
                  onSelectionChange={(keys) => setFiltroCategoria(Array.from(keys)[0] as string)}
                  variant="bordered"
                  size="lg"
                  classNames={{
                    trigger: "text-gray-900 border-gray-300 hover:border-purple-400 bg-white shadow-md",
                    value: "text-gray-900",
                    popoverContent: "bg-white shadow-2xl border border-gray-200",
                  }}
                >
                  <SelectItem key="todos" className="text-gray-900">{t('filters.allCategories')}</SelectItem>
                  <SelectItem key="pantallas" className="text-gray-900">Pantallas</SelectItem>
                  <SelectItem key="baterias" className="text-gray-900">Baterías</SelectItem>
                  <SelectItem key="accesorios" className="text-gray-900">Accesorios</SelectItem>
                  <SelectItem key="repuestos" className="text-gray-900">Repuestos</SelectItem>
                  <SelectItem key="herramientas" className="text-gray-900">Herramientas</SelectItem>
                </Select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Tabla de productos */}
        <Card className="shadow-xl border-0 bg-white">
          <CardBody className="p-0">
            {/* Vista Desktop - Tabla */}
            <div className="hidden lg:block">
              <Table 
                aria-label="Tabla de inventario"
                classNames={{
                  wrapper: "min-h-[400px] shadow-none",
                  th: "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-bold text-sm border-b border-gray-200",
                  td: "py-5 border-b border-gray-100"
                }}
              >
                <TableHeader>
                  <TableColumn>PRODUCTO & DESCRIPCIÓN</TableColumn>
                  <TableColumn>CATEGORÍA</TableColumn>
                  <TableColumn>MARCA/MODELO</TableColumn>
                  <TableColumn>STOCK ACTUAL</TableColumn>
                  <TableColumn>UBICACIÓN</TableColumn>
                  <TableColumn>PRECIOS</TableColumn>
                  <TableColumn>ESTADO</TableColumn>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stock_quantity, product.min_stock)
                    return (
                      <TableRow key={product.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <Avatar
                              icon={<ShoppingBag className="w-5 h-5" />}
                              size="lg"
                              classNames={{
                                base: "bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg",
                                icon: "text-white"
                              }}
                            />
                            <div>
                              <p className="font-bold text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {product.description}
                              </p>
                              <Chip size="sm" color="default" variant="flat" className="mt-1">
                                SKU: {product.sku}
                              </Chip>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip
                            color="primary"
                            variant="flat"
                            size="md"
                            className="font-semibold"
                          >
                            {getCategoryLabel(product.category)}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-bold text-gray-900">{product.brand}</p>
                            <p className="text-sm text-gray-600">{product.model}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <p className="text-xl font-bold text-gray-900">{product.stock_quantity}</p>
                            <p className="text-xs text-gray-500">
                              Mínimo: {product.min_stock}
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  product.stock_quantity <= product.min_stock 
                                    ? 'bg-red-500' 
                                    : 'bg-green-500'
                                }`}
                                style={{
                                  width: `${Math.min((product.stock_quantity / (product.min_stock * 2)) * 100, 100)}%`
                                }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <p className="text-sm font-medium text-gray-700">
                              {product.location}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-bold text-green-600">
                              {formatCurrency(product.enduser_price)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Costo: {formatCurrency(product.unit_cost)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={stockStatus.color}
                            variant="flat"
                            size="md"
                            startContent={React.createElement(stockStatus.icon, { className: "w-4 h-4" })}
                            className="font-semibold"
                          >
                            {stockStatus.label}
                          </Chip>
                        </TableCell>
                      </TableRow>
                    )
                  })}
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
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No se encontraron productos
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {busqueda || filtroCategoria !== 'todos'
                      ? 'No hay productos que coincidan con los filtros aplicados.'
                      : 'No hay productos en el inventario.'}
                  </p>
                  {(busqueda || filtroCategoria !== 'todos') && (
                    <Button
                      color="primary"
                      variant="flat"
                      onPress={() => {
                        setBusqueda('')
                        setFiltroCategoria('todos')
                      }}
                    >
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4 p-4">
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stock_quantity, product.min_stock)
                    return (
                      <Card key={product.id} className="shadow-sm hover:shadow-md transition-shadow">
                        <CardBody className="p-4">
                          {/* Header del producto */}
                          <div className="flex items-start gap-3 mb-4">
                            <Avatar
                              icon={<ShoppingBag className="w-5 h-5" />}
                              size="md"
                              classNames={{
                                base: "bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg",
                                icon: "text-white"
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 truncate mb-1">
                                {product.name}
                              </h4>
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                {product.description}
                              </p>
                              <div className="flex gap-2 flex-wrap">
                                <Chip size="sm" color="default" variant="flat">
                                  SKU: {product.sku}
                                </Chip>
                                <Chip
                                  color="primary"
                                  variant="flat"
                                  size="sm"
                                >
                                  {getCategoryLabel(product.category)}
                                </Chip>
                              </div>
                            </div>
                            <Chip
                              color={stockStatus.color}
                              variant="flat"
                              size="sm"
                              startContent={React.createElement(stockStatus.icon, { className: "w-3 h-3" })}
                            >
                              {stockStatus.label}
                            </Chip>
                          </div>

                          {/* Información del producto */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            {/* Marca/Modelo */}
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Marca/Modelo
                              </p>
                              <p className="font-bold text-gray-900">{product.brand}</p>
                              <p className="text-sm text-gray-600">{product.model}</p>
                            </div>

                            {/* Ubicación */}
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Ubicación
                              </p>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-gray-500" />
                                <p className="text-sm font-medium text-gray-700">
                                  {product.location}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Stock */}
                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Stock Actual
                              </p>
                              <p className="text-xl font-bold text-gray-900">{product.stock_quantity}</p>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">
                              Mínimo: {product.min_stock}
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  product.stock_quantity <= product.min_stock 
                                    ? 'bg-red-500' 
                                    : 'bg-green-500'
                                }`}
                                style={{
                                  width: `${Math.min((product.stock_quantity / (product.min_stock * 2)) * 100, 100)}%`
                                }}
                              />
                            </div>
                          </div>

                          {/* Precios */}
                          <div className="bg-green-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                              Precios
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Precio Venta</p>
                                <p className="font-bold text-green-600">
                                  {formatCurrency(product.enduser_price)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Costo</p>
                                <p className="text-sm text-gray-700">
                                  {formatCurrency(product.unit_cost)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
            
            {/* Empty state solo para desktop cuando está dentro de la tabla */}
            {filteredProducts.length === 0 && !loading && (
              <div className="hidden lg:block text-center py-16">
                <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No se encontraron productos</h3>
                <p className="text-gray-600 text-lg">
                  {busqueda || filtroCategoria !== 'todos'
                    ? 'No hay productos que coincidan con los filtros aplicados.'
                    : 'No hay productos en el inventario.'}
                </p>
                {(busqueda || filtroCategoria !== 'todos') && (
                  <Button
                    color="primary"
                    variant="flat"
                    className="mt-4"
                    onPress={() => {
                      setBusqueda('')
                      setFiltroCategoria('todos')
                    }}
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Productos con stock bajo */}
        {stats.bajoStock > 0 && (
          <Card className="shadow-xl border-0 bg-gradient-to-br from-orange-50 to-red-50">
            <CardBody className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-orange-800">
                    ⚠️ Productos con Stock Bajo
                  </h3>
                  <p className="text-orange-600">
                    {stats.bajoStock} productos requieren reposición urgente
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products
                  .filter(p => p.stock_quantity <= p.min_stock && p.stock_quantity > 0)
                  .map((product) => (
                    <Card key={product.id} className="border-orange-300 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardBody className="p-5 bg-gradient-to-br from-orange-50 to-orange-100">
                        <div className="flex items-center gap-3 mb-3">
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                          <p className="font-bold text-orange-900 text-lg">{product.name}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-orange-700">Stock actual:</span>
                            <span className="font-bold text-orange-800">{product.stock_quantity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-orange-700">Mínimo:</span>
                            <span className="font-bold text-orange-800">{product.min_stock}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-orange-700">Ubicación:</span>
                            <span className="font-medium text-orange-800">{product.location}</span>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </TechnicianDashboardLayout>
  )
} 