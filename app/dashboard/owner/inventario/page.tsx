'use client'

import { useState, useEffect, useCallback } from 'react'
import debounce from 'lodash.debounce'
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
  customCategory: string
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
    customCategory: '',
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

  const debouncedFetch = useCallback(
    debounce((search: string) => {
      setPagination(prev => ({ ...prev, page: 1 }))
      fetchInventory(1, filtroCategoria, filtroEstado, search);
    }, 300),
    [filtroCategoria, filtroEstado]
  );

  useEffect(() => {
    debouncedFetch(busqueda);
  }, [busqueda, debouncedFetch]);

  const handleBusquedaChange = (search: string) => {
    setBusqueda(search)
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)

    try {
      // Usar categoría personalizada si fue seleccionada
      const productData = {
        ...newProduct,
        category: newProduct.category === 'personalizado' ? newProduct.customCategory : newProduct.category
      }

      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        throw new Error('Error al crear el producto')
      }

      setNewProduct({
        name: '',
        description: '',
        category: '',
        customCategory: '',
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
    return 'primary'
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
      'componentes': 'primary',
      'personalizado': 'secondary'
    }
    return colors[category] || 'secondary'
  }



  const calculateMargin = (cost: number | null, price: number | null) => {
    if (!cost || !price || cost === 0) return '0%'
    const margin = ((price - cost) / price) * 100
    return `${margin.toFixed(1)}%`
  }

  const categorias = [
    'todas', 'pantallas', 'baterias', 'accesorios', 'puertos', 
    'cables', 'cargadores', 'herramientas', 'componentes', 'personalizado'
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#004085] to-[#003366] bg-clip-text text-transparent">
              {t('inventory.title')}
            </h1>
            <p className="text-[#6C757D] text-lg">
              {t('inventory.description')}
            </p>
          </div>
          
          <Button
            size="lg"
            startContent={<Plus className="w-5 h-5" />}
            onPress={onCreateOpen}
            className="bg-gradient-to-r from-[#004085] to-[#003366] text-white hover:from-[#003366] hover:to-[#004085] transition-all shadow-lg"
          >
            {t('inventory.newProduct')}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="hover:scale-105 transition-all duration-300 border border-[#6C757D]/20 shadow-lg bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF]">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#6C757D] to-[#495057] shadow-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-[#004085]" />
                    <span className="text-xs text-[#004085] font-medium">+8%</span>
                  </div>
                  <Chip variant="flat" size="sm" className="font-semibold bg-white/60 text-[#343A40] border border-white/30">
                    Total
                  </Chip>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-base font-bold text-[#343A40] opacity-90 uppercase tracking-wider">{t('inventory.totalProducts')}</p>
                <p className="text-4xl font-extrabold text-[#343A40] mb-2 tracking-tight">{stats.totalItems}</p>
                <Progress 
                  value={100} 
                  classNames={{
                    indicator: "bg-[#6C757D]",
                  }}
                  size="sm" 
                />
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border border-[#004085]/20 shadow-lg bg-gradient-to-br from-[#E8F0FE] to-[#D1E7FF]">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#004085] to-[#003366] shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-[#004085]" />
                    <span className="text-xs text-[#004085] font-medium">+15%</span>
                  </div>
                  <Chip variant="flat" size="sm" className="font-semibold bg-white/60 text-[#343A40] border border-white/30">
                    Disponibles
                  </Chip>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-base font-bold text-[#343A40] opacity-90 uppercase tracking-wider">{t('inventory.availableProducts')}</p>
                <p className="text-4xl font-extrabold text-[#343A40] mb-2 tracking-tight">{stats.totalItems - stats.stockBajo - stats.agotados}</p>
                <Progress 
                  value={((stats.totalItems - stats.stockBajo - stats.agotados) / Math.max(stats.totalItems, 1)) * 100} 
                  classNames={{
                    indicator: "bg-[#004085]",
                  }}
                  size="sm" 
                />
              </div>
            </CardBody>
          </Card>

          <Card className="hover:scale-105 transition-all duration-300 border border-[#6C757D]/20 shadow-lg bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF]">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#6C757D] to-[#495057] shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <ArrowDownRight className="w-3 h-3 text-[#FF8C00]" />
                    <span className="text-xs text-[#FF8C00] font-medium">-3%</span>
                  </div>
                  <Chip variant="flat" size="sm" className="font-semibold bg-white/60 text-[#343A40] border border-white/30">
                    Bajo
                  </Chip>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-base font-bold text-[#343A40] opacity-90 uppercase tracking-wider">{t('inventory.lowStock')}</p>
                <p className="text-4xl font-extrabold text-[#343A40] mb-2 tracking-tight">{stats.stockBajo}</p>
                <Progress 
                  value={(stats.stockBajo / Math.max(stats.totalItems, 1)) * 100} 
                  classNames={{
                    indicator: "bg-[#6C757D]",
                  }}
                  size="sm" 
                />
              </div>
            </CardBody>
          </Card>



          <Card className="hover:scale-105 transition-all duration-300 border border-[#004085]/20 shadow-lg bg-gradient-to-br from-[#E8F0FE] to-[#D1E7FF]">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#004085] to-[#003366] shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-[#004085]" />
                    <span className="text-xs text-[#004085] font-medium">+12%</span>
                  </div>
                  <Chip variant="flat" size="sm" className="font-semibold bg-white/60 text-[#343A40] border border-white/30">
                    Valor
                  </Chip>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-base font-bold text-[#343A40] opacity-90 uppercase tracking-wider">{t('inventory.totalValue')}</p>
                <p className="text-3xl font-extrabold text-[#343A40] mb-2 tracking-tight">{formatCurrency(stats.valorTotal)}</p>
                <Progress 
                  value={75} 
                  classNames={{
                    indicator: "bg-[#004085]",
                  }}
                  size="sm" 
                />
                <p className="text-sm font-medium text-[#6C757D] opacity-70">Venta: {formatCurrency(stats.valorVenta)}</p>
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
                startContent={<Search className="w-4 h-4 text-[#6C757D]" />}
                className="flex-1"
                variant="bordered"
                                  classNames={{
                    input: "text-[#343A40] placeholder:text-[#6C757D]",
                    inputWrapper: "border-[#E8F0FE] hover:border-[#004085] focus-within:border-[#004085]",
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
                {categorias.map(categoria => (
                  <SelectItem key={categoria} className="text-gray-900">
                    {categoria === 'todas' ? t('inventory.allCategories') : categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                  </SelectItem>
                ))}
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
                  th: "bg-[#004085] text-white font-bold text-base",
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
                            icon={<Package className="w-5 h-5 text-[#004085]" />}
                            classNames={{
                              base: `bg-gradient-to-br from-[#E8F0FE] to-[#D1E7FF]`,
                              icon: "text-[#004085]"
                            }}
                            size="md"
                          />
                          <div>
                            <p className={`font-semibold text-[#343A40]`}>{item.name}</p>
                            {item.brand && item.model && (
                              <p className={`text-sm text-[#6C757D]`}>
                                {item.brand} {item.model}
                              </p>
                            )}
                            <div className="flex gap-2 mt-1">
                              <Chip size="sm" variant="flat" color="primary" className="bg-[#E8F0FE] text-[#004085]">
                                {item.category}
                              </Chip>
                              {item.sku && (
                                <Chip size="sm" variant="flat" color="primary" className="bg-[#004085] text-white">
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
                              <TrendingUp className="w-4 h-4 text-[#004085]" />
                            )}
                            <span className={`font-medium text-[#343A40]`}>
                              {item.stock_quantity} unidades
                            </span>
                          </div>
                          <p className={`text-xs text-[#6C757D]`}>
                            Mín: {item.min_stock}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#6C757D]">Precio de Venta:</span>
                            <span className="text-sm font-medium text-[#343A40]">{formatCurrency(item.enduser_price)}</span>
                          </div>
                                                      <div className="flex items-center gap-2">
                              <span className="text-sm text-[#6C757D]">Total:</span>
                              <span className="text-sm font-medium text-[#343A40]">{formatCurrency((item.enduser_price || 0) * item.stock_quantity)}</span>
                            </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {item.location && (
                            <p className={`text-sm text-[#343A40]`}>{item.location}</p>
                          )}
                          {item.supplier && (
                            <p className={`text-xs text-[#6C757D]`}>
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
                          className={item.stock_quantity > 0 && item.stock_quantity > item.min_stock ? "bg-[#E8F0FE] text-[#004085]" : ""}
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
                  <Package className="w-16 h-16 text-[#6C757D] mx-auto mb-4" />
                  <h3 className={`text-lg font-semibold text-[#343A40] mb-2`}>
                    No hay productos
                  </h3>
                  <p className={`text-[#6C757D] mb-6`}>
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
                            icon={<Package className="w-5 h-5 text-[#004085]" />}
                            classNames={{
                              base: `bg-gradient-to-br from-[#E8F0FE] to-[#D1E7FF]`,
                              icon: "text-[#004085]"
                            }}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-semibold text-[#343A40] truncate`}>
                              {item.name}
                            </h4>
                            {item.brand && item.model && (
                              <p className={`text-sm text-[#6C757D] truncate`}>
                                {item.brand} {item.model}
                              </p>
                            )}
                            <div className="flex gap-2 mt-2">
                              <Chip size="sm" variant="flat" color="primary" className="bg-[#E8F0FE] text-[#004085]">
                                {item.category}
                              </Chip>
                              {item.sku && (
                                <Chip size="sm" variant="flat" color="primary" className="bg-[#004085] text-white">
                                  {item.sku}
                                </Chip>
                              )}
                            </div>
                          </div>
                          <Chip
                            color={getStatusColor(item)}
                            variant="flat"
                            size="sm"
                            className={item.stock_quantity > 0 && item.stock_quantity > item.min_stock ? "bg-[#E8F0FE] text-[#004085]" : ""}
                          >
                            {getStatusLabel(item)}
                          </Chip>
                        </div>

                        {/* Información del producto */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {/* Stock */}
                          <div className="space-y-1">
                            <p className={`text-xs font-medium text-[#6C757D] uppercase tracking-wide`}>
                              Stock
                            </p>
                            <div className="flex items-center gap-2">
                              {item.stock_quantity === 0 ? (
                                <TrendingDown className="w-3 h-3 text-red-500" />
                              ) : item.stock_quantity <= item.min_stock ? (
                                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                              ) : (
                                <TrendingUp className="w-3 h-3 text-[#004085]" />
                              )}
                              <span className={`font-medium text-[#343A40]`}>
                                {item.stock_quantity}
                              </span>
                            </div>
                            <p className={`text-xs text-[#6C757D]`}>
                              Mín: {item.min_stock}
                            </p>
                          </div>

                          {/* Ubicación */}
                          <div className="space-y-1">
                            <p className={`text-xs font-medium text-[#6C757D] uppercase tracking-wide`}>
                              {t('inventory.location')}
                            </p>
                            <p className={`text-sm text-[#343A40]`}>
                              {item.location || t('inventory.location')}
                            </p>
                            {item.supplier && (
                              <p className={`text-xs text-[#6C757D]`}>
                                {item.supplier}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Precios */}
                        <div className="bg-[#E8F0FE] rounded-lg p-3 mb-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className={`text-xs font-medium text-[#6C757D] mb-1`}>
                                Precio de Venta
                              </p>
                              <p className="text-sm font-medium text-[#343A40]">
                                {formatCurrency(item.enduser_price)}
                              </p>
                            </div>
                            <div>
                              <p className={`text-xs font-medium text-[#6C757D] mb-1`}>
                                Total en Stock
                              </p>
                              <p className="text-sm font-medium text-[#343A40]">
                                {formatCurrency((item.enduser_price || 0) * item.stock_quantity)}
                              </p>
                            </div>
                          </div>
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
          size="xl"
          scrollBehavior="inside"
          classNames={{
            wrapper: "z-[1000]",
            backdrop: "z-[999] bg-black/40 backdrop-blur-sm",
            base: "!rounded-3xl shadow-2xl border-0 bg-white max-h-[100vh] h-full sm:max-h-[95vh] sm:h-auto my-0 mx-0 sm:my-6 sm:mx-6 md:mx-8 lg:mx-12",
            body: "max-h-[calc(100vh-180px)] sm:max-h-[75vh] overflow-y-auto p-4 sm:p-6 md:p-8",
            header: "border-b border-[#E8F0FE]/50 p-4 sm:p-6 md:p-8 bg-gradient-to-r from-[#F8F9FA]/50 to-white !rounded-t-3xl",
            footer: "border-t border-[#E8F0FE]/50 p-4 sm:p-6 md:p-8 bg-gradient-to-r from-[#F8F9FA]/50 to-white !rounded-b-3xl"
          }}
        >
          <ModalContent>
            <form onSubmit={handleCreateProduct}>
              <ModalHeader>
                <h2 className={`text-lg sm:text-xl md:text-2xl font-bold text-[#343A40]`}>{t('inventory.createTitle')}</h2>
              </ModalHeader>
              <ModalBody className="space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <FormField
                    label="Categoría"
                    name="category"
                    type="select"
                    value={newProduct.category}
                    onChange={(value) => setNewProduct(prev => ({ ...prev, category: value, customCategory: '' }))}
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

                {/* Campo de categoría personalizada */}
                {newProduct.category === 'personalizado' && (
                  <FormField
                    label="Escriba la categoría personalizada"
                    name="customCategory"
                    value={newProduct.customCategory}
                    onChange={(value) => setNewProduct(prev => ({ ...prev, customCategory: value }))}
                    placeholder="Ej: Mouse, Teclado, Auriculares, etc."
                    required
                  />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                {/* Margen de ganancia - Siempre visible */}
                <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">💰 Margen de ganancia:</span>
                        {newProduct.unit_cost > 0 && newProduct.enduser_price > 0 && newProduct.enduser_price > newProduct.unit_cost && (
                          <span className="text-xs text-[#004085]">
                            (Ganancia: S/ {(newProduct.enduser_price - newProduct.unit_cost).toFixed(2)})
                          </span>
                        )}
                      </div>
                      <Chip 
                        color={newProduct.unit_cost > 0 && newProduct.enduser_price > 0 && newProduct.enduser_price > newProduct.unit_cost ? "primary" : "default"} 
                        variant="flat"
                        size="lg"
                        className={`font-bold ${newProduct.unit_cost > 0 && newProduct.enduser_price > 0 && newProduct.enduser_price > newProduct.unit_cost ? "bg-[#E8F0FE] text-[#004085]" : ""}`}
                      >
                        {newProduct.unit_cost > 0 && newProduct.enduser_price > 0 
                          ? calculateMargin(newProduct.unit_cost, newProduct.enduser_price)
                          : '0%'
                        }
                      </Chip>
                    </div>
                    {newProduct.unit_cost > 0 && newProduct.enduser_price > 0 && newProduct.enduser_price <= newProduct.unit_cost && (
                      <p className="text-xs text-red-600 mt-2">
                        ⚠️ El precio de venta debe ser mayor al costo para obtener ganancia
                      </p>
                    )}
                  </CardBody>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <ModalFooter className="gap-3 py-4 bg-[#F8F9FA] border-t border-[#E8F0FE]/50">
                <Button variant="flat" onPress={onCreateClose} size="md" className="text-base font-medium text-[#6C757D] hover:bg-[#E8F0FE]">{t('common.cancel')}</Button>
                <Button 
                  type="submit" 
                  isLoading={createLoading}
                  startContent={!createLoading ? <Plus className="w-4 h-4" /> : null}
                  size="md"
                  className="bg-gradient-to-r from-[#004085] to-[#003366] text-white hover:from-[#003366] hover:to-[#004085] transition-all text-base font-medium px-6"
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
          size="full"
          scrollBehavior="inside"
          classNames={{
            wrapper: "z-[1000]",
            backdrop: "z-[999] bg-black/40 backdrop-blur-sm",
            base: "!rounded-3xl shadow-2xl border-0 bg-white max-h-[100vh] h-full w-full m-0 sm:max-h-[95vh] sm:h-auto sm:w-auto sm:my-6 sm:mx-6 md:mx-8 lg:mx-12 md:max-w-4xl",
            body: "max-h-[calc(100vh-120px)] sm:max-h-[75vh] overflow-y-auto p-4 sm:p-6 md:p-8",
            header: "border-b border-gray-200/50 p-4 sm:p-6 md:p-8 bg-gradient-to-r from-gray-50/50 to-white !rounded-t-3xl",
            footer: "border-t border-gray-200/50 p-4 sm:p-6 md:p-8 bg-gradient-to-r from-gray-50/50 to-white !rounded-b-3xl"
          }}
        >
          <ModalContent>
            {selectedItem && (
              <>
                <ModalHeader>
                  <h2 className={`text-lg md:text-xl font-bold text-[#343A40]`}>{selectedItem.name}</h2>
                </ModalHeader>
                <ModalBody className="space-y-3 md:space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                            <Chip color="primary" variant="flat" size="sm" className="bg-[#E8F0FE] text-[#004085]">{selectedItem.category}</Chip>
                                          <Chip color={getStatusColor(selectedItem)} variant="flat" size="sm" className={selectedItem.stock_quantity > 0 && selectedItem.stock_quantity > selectedItem.min_stock ? "bg-[#E8F0FE] text-[#004085]" : ""}>{getStatusLabel(selectedItem)}</Chip>
                  </div>
                  {selectedItem.description && <p className="text-sm md:text-base">{selectedItem.description}</p>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <p className={`text-xs md:text-sm text-[#6C757D]`}>Precio de Costo</p>
                      <p className={`text-sm md:text-base font-bold text-[#343A40]`}>{formatCurrency(selectedItem.unit_cost)}</p>
                    </div>
                    <div>
                      <p className={`text-xs md:text-sm text-[#6C757D]`}>Precio de Venta</p>
                      <p className={`text-sm md:text-base font-bold text-[#343A40]`}>{formatCurrency(selectedItem.enduser_price)}</p>
                    </div>
                    <div>
                      <p className={`text-xs md:text-sm text-[#6C757D]`}>Cantidad en Stock</p>
                      <p className={`text-sm md:text-base font-bold text-[#343A40]`}>{selectedItem.stock_quantity}</p>
                    </div>
                    <div>
                      <p className={`text-xs md:text-sm text-[#6C757D]`}>Stock Mínimo</p>
                      <p className={`text-sm md:text-base font-bold text-[#343A40]`}>{selectedItem.min_stock}</p>
                    </div>
                  </div>
                  
                  {/* Margen de Ganancia */}
                  {selectedItem.unit_cost && selectedItem.enduser_price && (
                    <div className="bg-[#E8F0FE] rounded-lg p-4 border border-[#004085]/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs md:text-sm font-medium text-[#343A40]">Margen de Ganancia</p>
                          <p className="text-xs text-[#6C757D]">
                            Diferencia entre precio de venta y costo
                          </p>
                        </div>
                        <Chip color="primary" variant="flat" size="md" className="font-bold bg-[#004085] text-white">
                          {calculateMargin(selectedItem.unit_cost, selectedItem.enduser_price)}
                        </Chip>
                      </div>
                    </div>
                  )}
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
                <h2 className={`text-lg md:text-xl font-bold text-[#343A40]`}>{t('inventory.editTitle')}</h2>
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
              <ModalFooter className="gap-2 bg-[#F8F9FA] border-t border-[#E8F0FE]/50">
                <Button variant="flat" onPress={onEditClose} size="sm" className="text-[#6C757D] hover:bg-[#E8F0FE]">{t('common.cancel')}</Button>
                <Button 
                  type="submit" 
                  form="edit-item-form"
                  isLoading={updateLoading}
                  startContent={!updateLoading ? <Plus className="w-4 h-4" /> : null}
                  size="sm"
                  className="bg-gradient-to-r from-[#004085] to-[#003366] text-white hover:from-[#003366] hover:to-[#004085] transition-all"
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
            backdrop: "z-[999] bg-black/40 backdrop-blur-sm",
            base: "!rounded-3xl shadow-2xl border-0 bg-white my-4 mx-4 sm:my-6 sm:mx-6 md:mx-8 lg:mx-12",
            body: "p-6 md:p-8",
            header: "border-b border-gray-200/50 p-6 md:p-8 bg-gradient-to-r from-red-50/50 to-white !rounded-t-3xl",
            footer: "border-t border-gray-200/50 p-6 md:p-8 bg-gradient-to-r from-red-50/50 to-white !rounded-b-3xl"
          }}
        >
          <ModalContent>
            <ModalHeader>
              <h2 className={`text-xl font-bold text-[#343A40]`}>{t('inventory.deleteTitle')}</h2>
            </ModalHeader>
            <ModalBody className="space-y-6">
              <p className="text-[#6C757D]">{t('inventory.deleteMessage')}</p>
              {selectedItem && <p className={`font-bold text-[#343A40]`}>{selectedItem.name}</p>}
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
