'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { useTranslations, useCurrency } from '@/lib/contexts/TranslationContext'
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
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
      TableCell
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
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  X,
  DollarSign,
  Archive,
  ShoppingCart,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react'

interface InventoryItem {
  id: string
  name: string
  description: string | null
  sku: string | null
  category: string
  brand: string | null
  model: string | null
  stock_quantity: number
  min_stock: number
  unit_cost: number | null
  enduser_price: number | null
  supplier: string | null
  location: string | null
  is_active: boolean
  created_at: string
}

interface InventoryStats {
  totalItems: number
  stockBajo: number
  agotados: number
  valorTotal: number
  valorVenta: number
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface NewProductForm {
  name: string
  description: string
  category: string
  brand: string
  model: string
  stock_quantity: number
  min_stock: number
  unit_cost: number
  enduser_price: number
  supplier: string
  sku: string
  location: string
}

export default function InventarioPage() {
  const { t } = useTranslations()
  const { formatCurrency } = useCurrency()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [stats, setStats] = useState<InventoryStats>({
    totalItems: 0,
    stockBajo: 0,
    agotados: 0,
    valorTotal: 0,
    valorVenta: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  const [newProduct, setNewProduct] = useState<NewProductForm>({
    name: '',
    description: '',
    category: '',
    brand: '',
    model: '',
    stock_quantity: 0,
    min_stock: 0,
    unit_cost: 0,
    enduser_price: 0,
    supplier: '',
    sku: '',
    location: ''
  })

  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure()
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()

  const fetchInventory = async (page = 1, categoria = filtroCategoria, estado = filtroEstado, search = busqueda) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })
      
      if (categoria !== 'todas') params.append('category', categoria)
      if (estado !== 'todos') params.append('stockStatus', estado)
      if (search.trim()) params.append('search', search.trim())

      const response = await fetch(`/api/inventory?${params}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar inventario')
      }
      
      const data = await response.json()
      setItems(data.data)
      setStats(data.stats)
      setPagination(data.pagination)
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const handleCategoriaChange = (keys: any) => {
    const categoria = Array.from(keys)[0] as string || 'todas'
    setFiltroCategoria(categoria)
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchInventory(1, categoria, filtroEstado, busqueda)
  }

  const handleEstadoChange = (keys: any) => {
    const estado = Array.from(keys)[0] as string || 'todos'
    setFiltroEstado(estado)
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchInventory(1, filtroCategoria, estado, busqueda)
  }

  const handleBusquedaChange = (search: string) => {
    setBusqueda(search)
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchInventory(1, filtroCategoria, filtroEstado, search)
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)

    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      })

      if (!response.ok) {
        throw new Error('Error al crear el producto')
      }

      setNewProduct({
        name: '',
        description: '',
        category: '',
        brand: '',
        model: '',
        stock_quantity: 0,
        min_stock: 0,
        unit_cost: 0,
        enduser_price: 0,
        supplier: '',
        sku: '',
        location: ''
      })
      onCreateClose()
      fetchInventory()
      
    } catch (err) {
      console.error('Error creating product:', err)
      alert(err instanceof Error ? err.message : 'Error al crear el producto')
    } finally {
      setCreateLoading(false)
    }
  }

  const getStatusColor = (item: InventoryItem) => {
    if (item.stock_quantity === 0) return 'danger'
    if (item.stock_quantity <= item.min_stock) return 'warning'
    return 'success'
  }

  const getStatusLabel = (item: InventoryItem) => {
    if (item.stock_quantity === 0) return t('inventory.outOfStockStatus')
    if (item.stock_quantity <= item.min_stock) return t('inventory.lowStock')
    return t('inventory.available')
  }

  const getCategoryColor = (category: string): "primary" | "secondary" | "success" | "warning" | "danger" | "default" => {
    const colors: Record<string, "primary" | "secondary" | "success" | "warning" | "danger" | "default"> = {
      'pantallas': 'primary',
      'baterias': 'success',
      'accesorios': 'secondary',
      'puertos': 'warning',
      'cables': 'danger',
      'cargadores': 'warning',
      'herramientas': 'default',
      'componentes': 'primary'
    }
    return colors[category] || 'default'
  }



  const calculateMargin = (cost: number | null, price: number | null) => {
    if (!cost || !price || cost === 0) return '0%'
    const margin = ((price - cost) / price) * 100
    return `${margin.toFixed(1)}%`
  }

  const categorias = [
    'todas', 'pantallas', 'baterias', 'accesorios', 'puertos', 
    'cables', 'cargadores', 'herramientas', 'componentes'
  ]

  // Funciones CRUD
  const handleViewDetails = (item: InventoryItem) => {
    setSelectedItem(item)
    onDetailOpen()
  }

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item)
    onEditOpen()
  }

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return
    
    setUpdateLoading(true)
    try {
      const response = await fetch(`/api/inventory/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingItem),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar el producto')
      }

      onEditClose()
      fetchInventory()
      alert('Producto actualizado exitosamente')
    } catch (err) {
      console.error('Error updating item:', err)
      alert(err instanceof Error ? err.message : 'Error al actualizar el producto')
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleDeleteItem = (item: InventoryItem) => {
    setSelectedItem(item)
    onDeleteOpen()
  }

  const confirmDeleteItem = async () => {
    if (!selectedItem) return
    
    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/inventory/${selectedItem.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar el producto')
      }

      onDeleteClose()
      fetchInventory()
      alert('Producto eliminado exitosamente')
    } catch (err) {
      console.error('Error deleting item:', err)
      alert(err instanceof Error ? err.message : 'Error al eliminar el producto')
    } finally {
      setDeleteLoading(false)
    }
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
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
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
            <h1 className={`text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent`}>
              {t('inventory.title')}
            </h1>
            <p className={`${textColors.secondary} text-lg`}>
              {t('inventory.description')}
            </p>
          </div>
          
          <Button
            color="primary"
            size="lg"
            startContent={<Plus className="w-5 h-5" />}
            onPress={onCreateOpen}
            className="shadow-lg"
          >
            {t('inventory.newProduct')}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
          <Card className="hover:scale-105 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-blue-50/60 to-blue-100/40 backdrop-blur-sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400/80 to-blue-600/80 shadow-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">+8%</span>
                  </div>
                  <Chip color="primary" variant="flat" size="sm" className="font-medium">
                    Total
                  </Chip>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">{t('inventory.totalProducts')}</p>
                <p className="text-3xl font-bold text-blue-700">{stats.totalItems}</p>
                <Progress value={100} color="primary" size="sm" />
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-green-50/60 to-emerald-100/40 backdrop-blur-sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-400/80 to-green-600/80 shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">+15%</span>
                  </div>
                  <Chip color="success" variant="flat" size="sm" className="font-medium">
                    Disponibles
                  </Chip>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">{t('inventory.availableProducts')}</p>
                <p className="text-3xl font-bold text-green-700">{stats.totalItems - stats.stockBajo - stats.agotados}</p>
                <Progress value={((stats.totalItems - stats.stockBajo - stats.agotados) / Math.max(stats.totalItems, 1)) * 100} color="success" size="sm" />
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-yellow-50/60 to-amber-100/40 backdrop-blur-sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400/80 to-yellow-600/80 shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <ArrowDownRight className="w-3 h-3 text-red-500" />
                    <span className="text-xs text-red-600 font-medium">-3%</span>
                  </div>
                  <Chip color="warning" variant="flat" size="sm" className="font-medium">
                    Bajo
                  </Chip>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">{t('inventory.lowStock')}</p>
                <p className="text-3xl font-bold text-yellow-700">{stats.stockBajo}</p>
                <Progress value={(stats.stockBajo / Math.max(stats.totalItems, 1)) * 100} color="warning" size="sm" />
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-red-50/60 to-pink-100/40 backdrop-blur-sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-400/80 to-red-600/80 shadow-lg">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Minus className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-600 font-medium">0%</span>
                  </div>
                  <Chip color="danger" variant="flat" size="sm" className="font-medium">
                    Agotados
                  </Chip>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">{t('inventory.outOfStock')}</p>
                <p className="text-3xl font-bold text-red-700">{stats.agotados}</p>
                <Progress value={(stats.agotados / Math.max(stats.totalItems, 1)) * 100} color="danger" size="sm" />
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-purple-50/60 to-violet-100/40 backdrop-blur-sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-400/80 to-purple-600/80 shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600 font-medium">+12%</span>
                  </div>
                  <Chip color="secondary" variant="flat" size="sm" className="font-medium">
                    Valor
                  </Chip>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">{t('inventory.totalValue')}</p>
                <p className="text-lg font-bold text-purple-700">{formatCurrency(stats.valorTotal)}</p>
                <Progress value={75} color="secondary" size="sm" />
                <p className="text-xs text-gray-500">Venta: {formatCurrency(stats.valorVenta)}</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardBody className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder={t('inventory.searchPlaceholder')}
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
                placeholder="Categoría"
                selectedKeys={new Set([filtroCategoria])}
                onSelectionChange={handleCategoriaChange}
                className="w-full md:w-56"
                variant="bordered"
                classNames={{
                  trigger: "text-gray-900",
                  value: "text-gray-900",
                  popoverContent: "bg-white",
                }}
              >
                                  <SelectItem key="todas" className="text-gray-900">{t('inventory.allCategories')}</SelectItem>
                <SelectItem key="Repuestos" className="text-gray-900">Repuestos</SelectItem>
                <SelectItem key="Accesorios" className="text-gray-900">Accesorios</SelectItem>
                <SelectItem key="Dispositivos" className="text-gray-900">Dispositivos</SelectItem>
                <SelectItem key="Herramientas" className="text-gray-900">Herramientas</SelectItem>
              </Select>
              <Select
                placeholder="Estado de Stock"
                selectedKeys={new Set([filtroEstado])}
                onSelectionChange={handleEstadoChange}
                className="w-full md:w-56"
                variant="bordered"
                classNames={{
                  trigger: "text-gray-900",
                  value: "text-gray-900",
                  popoverContent: "bg-white",
                }}
              >
                                  <SelectItem key="todos" className="text-gray-900">{t('inventory.allStates')}</SelectItem>
                                  <SelectItem key="disponible" className="text-gray-900">{t('inventory.available')}</SelectItem>
                                  <SelectItem key="stock_bajo" className="text-gray-900">{t('inventory.lowStock')}</SelectItem>
                                  <SelectItem key="agotado" className="text-gray-900">{t('inventory.outOfStockStatus')}</SelectItem>
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* Tabla de productos */}
        <Card>
          <CardBody className="p-0">
            {/* Vista Desktop - Tabla */}
            <div className="hidden lg:block">
              <Table
                aria-label="Tabla de inventario"
                classNames={{
                  wrapper: "min-h-[400px]",
                  th: "bg-gray-50 text-gray-700 font-semibold",
                  td: "py-4"
                }}
              >
                <TableHeader>
                  <TableColumn>PRODUCTO</TableColumn>
                  <TableColumn>STOCK</TableColumn>
                  <TableColumn>PRECIOS</TableColumn>
                  <TableColumn>UBICACIÓN</TableColumn>
                  <TableColumn>ESTADO</TableColumn>
                  <TableColumn>ACCIONES</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No hay productos en el inventario">
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            icon={<Package className="w-5 h-5" />}
                            classNames={{
                              base: `bg-gradient-to-br ${getCategoryColor(item.category)}`,
                              icon: "text-white"
                            }}
                            size="md"
                          />
                          <div>
                            <p className={`font-semibold ${textColors.primary}`}>{item.name}</p>
                            {item.brand && item.model && (
                              <p className={`text-sm ${textColors.secondary}`}>
                                {item.brand} {item.model}
                              </p>
                            )}
                            <div className="flex gap-2 mt-1">
                              <Chip size="sm" variant="flat" color="default">
                                {item.category}
                              </Chip>
                              {item.sku && (
                                <Chip size="sm" variant="flat" color="primary">
                                  {item.sku}
                                </Chip>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {item.stock_quantity === 0 ? (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            ) : item.stock_quantity <= item.min_stock ? (
                              <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            ) : (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            )}
                            <span className={`font-medium ${textColors.primary}`}>
                              {item.stock_quantity} unidades
                            </span>
                          </div>
                          <p className={`text-xs ${textColors.muted}`}>
                            Mín: {item.min_stock}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${textColors.secondary}`}>Costo:</span>
                            <span className="text-sm font-medium">{formatCurrency(item.unit_cost)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${textColors.secondary}`}>Venta:</span>
                            <span className="text-sm font-medium text-green-600">{formatCurrency(item.enduser_price)}</span>
                          </div>
                          {item.unit_cost && item.enduser_price && (
                            <Chip size="sm" color="success" variant="flat">
                              {calculateMargin(item.unit_cost, item.enduser_price)}
                            </Chip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {item.location && (
                            <p className={`text-sm ${textColors.primary}`}>{item.location}</p>
                          )}
                          {item.supplier && (
                            <p className={`text-xs ${textColors.muted}`}>
                              Proveedor: {item.supplier}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={getStatusColor(item)}
                          variant="flat"
                          size="sm"
                        >
                          {getStatusLabel(item)}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Tooltip content="Ver detalles" classNames={{ content: "bg-gray-900 text-white" }}>
                            <Button isIconOnly variant="flat" size="sm" onPress={() => handleViewDetails(item)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Editar" classNames={{ content: "bg-gray-900 text-white" }}>
                            <Button isIconOnly variant="flat" size="sm" onPress={() => handleEditItem(item)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Eliminar" classNames={{ content: "bg-gray-900 text-white" }}>
                            <Button isIconOnly variant="flat" size="sm" color="danger" onPress={() => handleDeleteItem(item)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
              ) : items.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className={`text-lg font-semibold ${textColors.primary} mb-2`}>
                    No hay productos
                  </h3>
                  <p className={`${textColors.muted} mb-6`}>
                    No se encontraron productos en el inventario
                  </p>
                  <Button color="primary" startContent={<Plus className="w-4 h-4" />} onPress={onCreateOpen}>
                    {t('inventory.newProduct')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 p-4">
                  {items.map((item) => (
                    <Card key={item.id} className="shadow-sm hover:shadow-md transition-shadow">
                      <CardBody className="p-4">
                        {/* Header del producto */}
                        <div className="flex items-start gap-3 mb-4">
                          <Avatar
                            icon={<Package className="w-5 h-5" />}
                            classNames={{
                              base: `bg-gradient-to-br ${getCategoryColor(item.category)}`,
                              icon: "text-white"
                            }}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-semibold ${textColors.primary} truncate`}>
                              {item.name}
                            </h4>
                            {item.brand && item.model && (
                              <p className={`text-sm ${textColors.secondary} truncate`}>
                                {item.brand} {item.model}
                              </p>
                            )}
                            <div className="flex gap-2 mt-2">
                              <Chip size="sm" variant="flat" color="default">
                                {item.category}
                              </Chip>
                              {item.sku && (
                                <Chip size="sm" variant="flat" color="primary">
                                  {item.sku}
                                </Chip>
                              )}
                            </div>
                          </div>
                          <Chip
                            color={getStatusColor(item)}
                            variant="flat"
                            size="sm"
                          >
                            {getStatusLabel(item)}
                          </Chip>
                        </div>

                        {/* Información del producto */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {/* Stock */}
                          <div className="space-y-1">
                            <p className={`text-xs font-medium ${textColors.tertiary} uppercase tracking-wide`}>
                              Stock
                            </p>
                            <div className="flex items-center gap-2">
                              {item.stock_quantity === 0 ? (
                                <TrendingDown className="w-3 h-3 text-red-500" />
                              ) : item.stock_quantity <= item.min_stock ? (
                                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                              ) : (
                                <TrendingUp className="w-3 h-3 text-green-500" />
                              )}
                              <span className={`font-medium ${textColors.primary}`}>
                                {item.stock_quantity}
                              </span>
                            </div>
                            <p className={`text-xs ${textColors.muted}`}>
                              Mín: {item.min_stock}
                            </p>
                          </div>

                          {/* Ubicación */}
                          <div className="space-y-1">
                            <p className={`text-xs font-medium ${textColors.tertiary} uppercase tracking-wide`}>
                              {t('inventory.location')}
                            </p>
                            <p className={`text-sm ${textColors.primary}`}>
                              {item.location || t('inventory.location')}
                            </p>
                            {item.supplier && (
                              <p className={`text-xs ${textColors.muted}`}>
                                {item.supplier}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Precios */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className={`text-xs font-medium ${textColors.tertiary} mb-1`}>
                                {t('inventory.unitCost')}
                              </p>
                              <p className="text-sm font-medium">
                                {formatCurrency(item.unit_cost)}
                              </p>
                            </div>
                            <div>
                              <p className={`text-xs font-medium ${textColors.tertiary} mb-1`}>
                                {t('inventory.endUserPrice')}
                              </p>
                              <p className="text-sm font-medium text-green-600">
                                {formatCurrency(item.enduser_price)}
                              </p>
                            </div>
                          </div>
                          {item.unit_cost && item.enduser_price && (
                            <div className="mt-3">
                              <Chip size="sm" color="success" variant="flat">
                                {t('inventory.margin')}: {calculateMargin(item.unit_cost, item.enduser_price)}
                              </Chip>
                            </div>
                          )}
                        </div>

                        {/* Acciones */}
                        <div className="flex justify-between gap-2">
                          <Button 
                            variant="flat" 
                            size="sm" 
                            startContent={<Eye className="w-4 h-4" />}
                            onPress={() => handleViewDetails(item)}
                            className="flex-1"
                          >
                            {t('common.view')}
                          </Button>
                          <Button 
                            variant="flat" 
                            size="sm" 
                            startContent={<Edit className="w-4 h-4" />}
                            onPress={() => handleEditItem(item)}
                            className="flex-1"
                          >
                            {t('common.edit')}
                          </Button>
                          <Button 
                            variant="flat" 
                            size="sm" 
                            color="danger"
                            startContent={<Trash2 className="w-4 h-4" />}
                            onPress={() => handleDeleteItem(item)}
                            className="flex-1"
                          >
                            {t('common.delete')}
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination
              total={pagination.totalPages}
              page={pagination.page}
              onChange={(page) => fetchInventory(page, filtroCategoria, filtroEstado, busqueda)}
              showControls
              color="primary"
              size="lg"
            />
          </div>
        )}

        {/* Modal de nuevo producto */}
        <Modal 
          isOpen={isCreateOpen} 
          onClose={onCreateClose} 
          size="full"
          scrollBehavior="inside"
          classNames={{
            wrapper: "z-[1000]",
            backdrop: "z-[999]",
            base: "max-h-[100vh] h-full sm:max-h-[95vh] sm:h-auto my-0 mx-0 sm:my-2 sm:mx-2 md:mx-6 sm:rounded-lg",
            body: "max-h-[calc(100vh-180px)] sm:max-h-[75vh] overflow-y-auto py-3 px-3 sm:py-4 sm:px-6",
            header: "border-b border-gray-200 pb-3 px-3 sm:pb-4 sm:px-6",
            footer: "border-t border-gray-200 pt-3 px-3 sm:pt-4 sm:px-6"
          }}
        >
          <ModalContent>
            <form onSubmit={handleCreateProduct}>
              <ModalHeader>
                <h2 className={`text-xl md:text-2xl font-bold ${textColors.primary}`}>{t('inventory.createTitle')}</h2>
              </ModalHeader>
              <ModalBody className="space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Nombre del Producto"
                    name="name"
                    value={newProduct.name}
                    onChange={(value) => setNewProduct(prev => ({ ...prev, name: value }))}
                    placeholder="Ej: Pantalla iPhone 14 Pro"
                    required
                  />
                  <FormField
                    label="SKU"
                    name="sku"
                    value={newProduct.sku}
                    onChange={(value) => setNewProduct(prev => ({ ...prev, sku: value }))}
                    placeholder="Código único del producto"
                  />
                </div>

                <FormField
                  label="Descripción"
                  name="description"
                  type="textarea"
                  value={newProduct.description}
                  onChange={(value) => setNewProduct(prev => ({ ...prev, description: value }))}
                  placeholder="Descripción detallada del producto..."
                  rows={3}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    label="Categoría"
                    name="category"
                    type="select"
                    value={newProduct.category}
                    onChange={(value) => setNewProduct(prev => ({ ...prev, category: value }))}
                    required
                    options={categorias.filter(cat => cat !== 'todas').map(cat => ({
                      value: cat,
                      label: cat.charAt(0).toUpperCase() + cat.slice(1)
                    }))}
                  />
                  <FormField
                    label="Marca"
                    name="brand"
                    value={newProduct.brand}
                    onChange={(value) => setNewProduct(prev => ({ ...prev, brand: value }))}
                    placeholder="Ej: Apple, Samsung, Xiaomi"
                  />
                  <FormField
                    label="Modelo"
                    name="model"
                    value={newProduct.model}
                    onChange={(value) => setNewProduct(prev => ({ ...prev, model: value }))}
                    placeholder="Ej: iPhone 14 Pro, Galaxy S23"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Stock Actual"
                    name="stock_quantity"
                    type="number"
                    value={newProduct.stock_quantity.toString()}
                    onChange={(value) => setNewProduct(prev => ({ ...prev, stock_quantity: Number(value) || 0 }))}
                    min="0"
                    placeholder="0"
                  />
                  <FormField
                    label="Stock Mínimo"
                    name="min_stock"
                    type="number"
                    value={newProduct.min_stock.toString()}
                    onChange={(value) => setNewProduct(prev => ({ ...prev, min_stock: Number(value) || 0 }))}
                    min="0"
                    placeholder="0"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Costo Unitario (S/)"
                    name="unit_cost"
                    type="number"
                    value={newProduct.unit_cost.toString()}
                    onChange={(value) => setNewProduct(prev => ({ ...prev, unit_cost: Number(value) || 0 }))}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                  <FormField
                    label="Precio de Venta (S/)"
                    name="enduser_price"
                    type="number"
                    value={newProduct.enduser_price.toString()}
                    onChange={(value) => setNewProduct(prev => ({ ...prev, enduser_price: Number(value) || 0 }))}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                {newProduct.unit_cost > 0 && newProduct.enduser_price > 0 && (
                  <Card className="bg-green-50 border border-green-200">
                    <CardBody className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-700">Margen de ganancia:</span>
                        <Chip color="success" variant="flat">
                          {calculateMargin(newProduct.unit_cost, newProduct.enduser_price)}
                        </Chip>
                      </div>
                    </CardBody>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Proveedor"
                    name="supplier"
                    value={newProduct.supplier}
                    onChange={(value) => setNewProduct(prev => ({ ...prev, supplier: value }))}
                    placeholder="Nombre del proveedor"
                  />
                  <                    FormField
                      label={t('inventory.location')}
                    name="location"
                    value={newProduct.location}
                    onChange={(value) => setNewProduct(prev => ({ ...prev, location: value }))}
                    placeholder="Ej: Estante A1, Gaveta 3"
                  />
                </div>
              </ModalBody>
              <ModalFooter className="gap-3 py-4">
                <Button variant="flat" onPress={onCreateClose} size="md" className="text-base font-medium">{t('common.cancel')}</Button>
                <Button 
                  type="submit" 
                  color="primary" 
                  isLoading={createLoading}
                  startContent={!createLoading ? <Plus className="w-4 h-4" /> : null}
                  size="md"
                  className="text-base font-medium px-6"
                >
                  {t('inventory.newProduct')}
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>

        {/* Modal de detalles del producto */}
        <Modal 
          isOpen={isDetailOpen} 
          onClose={onDetailClose} 
          size="xl"
          scrollBehavior="inside"
          classNames={{
            wrapper: "z-[1000]",
            backdrop: "z-[999]",
            base: "max-h-[95vh] my-1 mx-1 sm:my-2 sm:mx-2 md:mx-6",
            body: "max-h-[75vh] overflow-y-auto py-2 md:py-4",
            header: "border-b border-gray-200 pb-2 md:pb-4",
            footer: "border-t border-gray-200 pt-2 md:pt-4"
          }}
        >
          <ModalContent>
            {selectedItem && (
              <>
                <ModalHeader>
                  <h2 className={`text-lg md:text-xl font-bold ${textColors.primary}`}>{selectedItem.name}</h2>
                </ModalHeader>
                <ModalBody className="space-y-3 md:space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <Chip color={getCategoryColor(selectedItem.category)} variant="flat" size="sm">{selectedItem.category}</Chip>
                    <Chip color={getStatusColor(selectedItem)} variant="flat" size="sm">{getStatusLabel(selectedItem)}</Chip>
                  </div>
                  {selectedItem.description && <p className="text-sm md:text-base">{selectedItem.description}</p>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <p className={`text-xs md:text-sm ${textColors.tertiary}`}>Precio de Costo</p>
                      <p className={`text-sm md:text-base font-bold ${textColors.primary}`}>{formatCurrency(selectedItem.unit_cost)}</p>
                    </div>
                    <div>
                      <p className={`text-xs md:text-sm ${textColors.tertiary}`}>Precio de Venta</p>
                      <p className={`text-sm md:text-base font-bold ${textColors.primary}`}>{formatCurrency(selectedItem.enduser_price)}</p>
                    </div>
                    <div>
                      <p className={`text-xs md:text-sm ${textColors.tertiary}`}>Cantidad en Stock</p>
                      <p className={`text-sm md:text-base font-bold ${textColors.primary}`}>{selectedItem.stock_quantity}</p>
                    </div>
                    <div>
                      <p className={`text-xs md:text-sm ${textColors.tertiary}`}>Stock Mínimo</p>
                      <p className={`text-sm md:text-base font-bold ${textColors.primary}`}>{selectedItem.min_stock}</p>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter className="gap-2">
                  <Button variant="flat" onPress={onDetailClose} size="sm">{t('common.close')}</Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Modal de edición del producto */}
        <Modal 
          isOpen={isEditOpen} 
          onClose={onEditClose} 
          size="2xl"
          scrollBehavior="inside"
          classNames={{
            wrapper: "z-[1000]",
            backdrop: "z-[999]",
            base: "max-h-[95vh] my-1 mx-1 sm:my-2 sm:mx-2 md:mx-6",
            body: "max-h-[75vh] overflow-y-auto py-2 md:py-4",
            header: "border-b border-gray-200 pb-2 md:pb-4",
            footer: "border-t border-gray-200 pt-2 md:pt-4"
          }}
        >
          <ModalContent>
            <form id="edit-item-form" onSubmit={handleUpdateItem}>
              <ModalHeader>
                <h2 className={`text-lg md:text-xl font-bold ${textColors.primary}`}>{t('inventory.editTitle')}</h2>
              </ModalHeader>
              {editingItem && (
                <ModalBody className="space-y-3 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                    <FormField
                      label="Nombre del Producto"
                      name="name"
                      value={editingItem.name}
                      onChange={(value) => setEditingItem(prev => prev ? { ...prev, name: value } : null)}
                      required
                    />
                    <FormField
                      label="Categoría"
                      name="category"
                      type="select"
                      value={editingItem.category}
                      onChange={(value) => setEditingItem(prev => prev ? { ...prev, category: value } : null)}
                      options={categorias.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
                      required
                    />
                  </div>
                  <FormField
                    label="Descripción"
                    name="description"
                    type="textarea"
                    value={editingItem.description || ''}
                    onChange={(value) => setEditingItem(prev => prev ? { ...prev, description: value } : null)}
                    rows={3}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                    <FormField
                      label="Stock"
                      name="stock_quantity"
                      type="number"
                      value={editingItem.stock_quantity.toString()}
                      onChange={(value) => setEditingItem(prev => prev ? { ...prev, stock_quantity: parseInt(value) || 0 } : null)}
                    />
                    <FormField
                      label="Stock Mínimo"
                      name="min_stock"
                      type="number"
                      value={editingItem.min_stock.toString()}
                      onChange={(value) => setEditingItem(prev => prev ? { ...prev, min_stock: parseInt(value) || 0 } : null)}
                    />
                    <FormField
                      label="Costo Unitario"
                      name="unit_cost"
                      type="number"
                      value={editingItem.unit_cost?.toString() || ''}
                      onChange={(value) => setEditingItem(prev => prev ? { ...prev, unit_cost: parseFloat(value) || 0 } : null)}
                    />
                    <FormField
                      label="Precio Venta"
                      name="enduser_price"
                      type="number"
                      value={editingItem.enduser_price?.toString() || ''}
                      onChange={(value) => setEditingItem(prev => prev ? { ...prev, enduser_price: parseFloat(value) || 0 } : null)}
                    />
                  </div>
                </ModalBody>
              )}
              <ModalFooter className="gap-2">
                <Button variant="flat" onPress={onEditClose} size="sm">{t('common.cancel')}</Button>
                <Button 
                  type="submit" 
                  form="edit-item-form"
                  color="primary" 
                  isLoading={updateLoading}
                  startContent={!updateLoading ? <Plus className="w-4 h-4" /> : null}
                  size="sm"
                >
                  {t('common.update')} {t('common.name').toLowerCase()}
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>

        {/* Modal de confirmación de eliminación del producto */}
        <Modal 
          isOpen={isDeleteOpen} 
          onClose={onDeleteClose} 
          size="md"
          scrollBehavior="inside"
          classNames={{
            wrapper: "z-[1000]",
            backdrop: "z-[999]",
            base: "max-h-[95vh] my-2 mx-2 sm:mx-6",
            body: "max-h-[60vh] overflow-y-auto py-4",
            header: "border-b border-gray-200 pb-4",
            footer: "border-t border-gray-200 pt-4"
          }}
        >
          <ModalContent>
            <ModalHeader>
              <h2 className={`text-xl font-bold ${textColors.primary}`}>{t('inventory.deleteTitle')}</h2>
            </ModalHeader>
            <ModalBody className="space-y-6">
              <p className={textColors.secondary}>{t('inventory.deleteMessage')}</p>
              {selectedItem && <p className={`font-bold ${textColors.primary}`}>{selectedItem.name}</p>}
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onDeleteClose}>{t('common.cancel')}</Button>
              <Button 
                color="danger" 
                isLoading={deleteLoading}
                onPress={confirmDeleteItem}
              >
                Eliminar Producto
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </DashboardLayout>
  )
} 
