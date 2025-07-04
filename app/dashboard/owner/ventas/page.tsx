'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import { useCurrency } from '@/lib/contexts/TranslationContext'
import { textColors } from '@/lib/utils/colors'
import { 
  Card, 
  CardBody, 
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Tabs,
  Tab,
  Skeleton,
  Pagination,
  Tooltip,
  Avatar,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/react'
import FormField from '@/app/components/ui/FormField'
import { 
  ShoppingCart, Plus, Minus, Search, Filter, CreditCard, 
  Calculator, Trash2, Receipt, Clock, DollarSign, TrendingUp,
  AlertTriangle, Package, Wrench, Unlock, X, User, Calendar,
  Camera, Eye, Printer
} from 'lucide-react'
import { useZxing } from 'react-zxing';
import { Result, Exception } from '@zxing/library';

interface Product {
  id: string
  name: string
  sku?: string;
  enduser_price: number
  stock_quantity: number
  category: string
  brand?: string
  model?: string
}

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  product_id: string
  max_stock: number
}

interface Sale {
  id: string
  sale_type: string
  total: number
  payment_method: string
  status: string
  created_at: string
  customer: {
    name: string | null
    phone: string | null
    anonymous_identifier: string | null
  } | null
  seller: {
    name: string
    email: string
  }
  sale_items: {
    quantity: number
    unit_price: number
    inventory: {
      name: string
      category: string
    } | null
  }[]
}

interface Customer {
  id: string
  name: string | null
  phone: string | null
  anonymous_identifier: string | null
  customer_type: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Componente del escáner
const BarcodeScannerComponent = ({ onScan }: { onScan: (result: string) => void }) => {
  const { ref } = useZxing({
    onResult: (result: Result) => {
      onScan(result.getText());
    },
    onError: (err: Error) => {
      // Ignorar errores de "Not Found" que ocurren cuando no hay código de barras
      if (err.message.includes('NotFoundException')) return;
      console.error(err);
    }
  });

  return (
    <div>
      <video ref={ref} className="w-full rounded-lg" />
    </div>
  );
};

export default function VentasPage() {
  const { t } = useTranslations()
  const { formatCurrency } = useCurrency()
  const [activeTab, setActiveTab] = useState<'pos' | 'ventas'>('pos')
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSales, setLoadingSales] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchProducts, setSearchProducts] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState('efectivo')
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [filtroMetodo, setFiltroMetodo] = useState('todos')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [printLoading, setPrintLoading] = useState(false)
  const [pendingSaleData, setPendingSaleData] = useState<any>(null)
  const { isOpen: isWarningOpen, onOpen: onWarningOpen, onClose: onWarningClose } = useDisclosure()
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure()

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/inventory?limit=100')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.data.filter((item: any) => item.stock_quantity > 0))
      }
    } catch (err) {
      console.error('Error al cargar productos:', err)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers?limit=100')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.data)
      }
    } catch (err) {
      console.error('Error al cargar clientes:', err)
    }
  }

  const fetchSales = async (page = 1) => {
    try {
      setLoadingSales(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      })
      
      if (filtroMetodo !== 'todos') params.append('payment_method', filtroMetodo)
      if (fechaInicio) params.append('dateFrom', fechaInicio)
      if (fechaFin) params.append('dateTo', fechaFin)

      const response = await fetch(`/api/sales?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSales(data.data)
        setPagination(data.pagination)
      }
    } catch (err) {
      console.error('Error al cargar ventas:', err)
    } finally {
      setLoadingSales(false)
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (activeTab === 'ventas') {
      fetchSales()
    }
  }, [activeTab])

  const addToCart = (item: Product) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id)
    
    if (existingItem) {
      if (existingItem.quantity < item.stock_quantity) {
        setCart(cart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        ))
      }
    } else {
      const cartItem: CartItem = {
        id: item.id,
        name: item.name,
        price: item.enduser_price,
        quantity: 1,
        product_id: item.id,
        max_stock: item.stock_quantity
      }
      setCart([...cart, cartItem])
    }
  }

  const handleScan = (result: any) => {
    if (result) {
      setIsScannerOpen(false);
      const foundProduct = products.find(p => p.sku === result);
      
      if (foundProduct) {
        addToCart(foundProduct);
        alert(`Producto "${foundProduct.name}" añadido al carrito.`);
      } else {
        alert(`No se encontró ningún producto con el SKU: ${result}`);
      }
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id)
      return
    }
    
    setCart(cart.map(item => {
      if (item.id === id) {
        const maxQuantity = item.max_stock
        return { ...item, quantity: Math.min(newQuantity, maxQuantity) }
      }
      return item
    }))
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
    setSelectedCustomer('')
    setPaymentMethod('efectivo')
  }

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getSubtotal = () => {
    return getTotal()
  }

  const processSale = async () => {
    if (cart.length === 0) {
      alert('El carrito está vacío')
      return
    }

    // Preparar datos de la venta
    const items = cart.map(item => ({
      inventory_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.price,
      item_name: item.name,
      item_type: 'product'
    }))

    const saleData = {
      sale_type: 'product',
      items,
      payment_method: paymentMethod,
      customer_id: selectedCustomer || null,
      total: getTotal()
    }

    // Guardar los datos y mostrar modal de advertencia primero
    setPendingSaleData(saleData)
    onWarningOpen()
  }

  // Función para proceder después de confirmar la advertencia
  const proceedToTicketConfirmation = () => {
    onWarningClose()
    onConfirmOpen()
  }

  // Función para procesar la venta sin comprobante
  const processSaleWithoutTicket = async () => {
    if (!pendingSaleData) return

    try {
      setLoading(true)
      
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pendingSaleData)
      })

      if (response.ok) {
        alert('¡Venta procesada exitosamente!')
        clearCart()
        fetchProducts() // Actualizar stock
        if (activeTab === 'ventas') {
          fetchSales() // Actualizar lista de ventas
        }
        onConfirmClose()
        setPendingSaleData(null)
      } else {
        throw new Error('Error al procesar la venta')
      }
    } catch (err) {
      console.error('Error:', err)
      alert(err instanceof Error ? err.message : 'Error al procesar la venta')
    } finally {
      setLoading(false)
    }
  }

  // Función para procesar la venta con comprobante
  const processSaleWithTicket = async () => {
    if (!pendingSaleData) return

    try {
      setLoading(true)
      
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pendingSaleData)
      })

      if (response.ok) {
        // Imprimir comprobante
        await handlePrintSaleTicket(pendingSaleData)
        
        alert('¡Venta procesada exitosamente y comprobante impreso!')
        clearCart()
        fetchProducts() // Actualizar stock
        if (activeTab === 'ventas') {
          fetchSales() // Actualizar lista de ventas
        }
        onConfirmClose()
        setPendingSaleData(null)
      } else {
        throw new Error('Error al procesar la venta')
      }
    } catch (err) {
      console.error('Error:', err)
      alert(err instanceof Error ? err.message : 'Error al procesar la venta')
    } finally {
      setLoading(false)
    }
  }

  const handleDateFilter = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchSales(1)
  }

  const getCustomerName = (customer: Sale['customer']) => {
    if (!customer) return t('sales.generalCustomer')
    return customer.name || customer.anonymous_identifier || 'Cliente Anónimo'
  }

  const getSaleTypeIcon = (type: string) => {
    switch (type) {
      case 'product': return <Package className="w-4 h-4" />
      case 'service': return <Wrench className="w-4 h-4" />
      case 'mixed': return <ShoppingCart className="w-4 h-4" />
      default: return <Receipt className="w-4 h-4" />
    }
  }

  const getSaleTypeColor = (type: string) => {
    switch (type) {
      case 'product': return 'primary'
      case 'service': return 'success'
      case 'mixed': return 'secondary'
      default: return 'default'
    }
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'efectivo': return 'success'
      case 'tarjeta': return 'primary'
      case 'transferencia': return 'success'
      case 'yape': return 'warning'
      case 'plin': return 'danger'
      default: return 'default'
    }
  }

  const getCategoryColor = (category: string): "primary" | "secondary" | "success" | "warning" | "danger" | "default" => {
    switch (category.toLowerCase()) {
      case 'celulares':
      case 'smartphones':
        return 'primary'
      case 'accesorios':
      case 'cargadores':
      case 'audifonos':
        return 'secondary'
      case 'repuestos':
      case 'pantallas':
        return 'warning'
      case 'tablets':
        return 'success'
      case 'laptops':
        return 'danger'
      default:
        return 'default'
    }
  }

  // Obtener información de la organización
  const fetchOrganizationInfo = async () => {
    try {
      // Primero obtenemos el organization_id del usuario actual
      const userResponse = await fetch('/api/user/profile')
      const userData = await userResponse.json()
      
      if (!userData.success) {
        throw new Error('No se pudo obtener el perfil del usuario')
      }

      const organizationId = userData.data.organization_id
      
      // Luego obtenemos la información de la organización
      const orgResponse = await fetch(`/api/organizations/${organizationId}`)
      const orgData = await orgResponse.json()
      
      if (!orgData.success) {
        throw new Error('No se pudo obtener la información de la organización')
      }

      return orgData.data
    } catch (error) {
      console.error('Error fetching organization info:', error)
      throw error
    }
  }

  // Generar el ticket de venta en formato térmico
  const generateSaleTicket = (saleData: any, organizationInfo: any) => {
    const currentDate = new Date().toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const customerName = selectedCustomer ? 
      customers.find(c => c.id === selectedCustomer)?.name || 'Cliente General' : 
      'Cliente General'

    // HTML para ticket térmico (ancho 80mm)
    const ticketHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.2;
            margin: 0;
            padding: 5mm;
            width: 70mm;
            color: black;
          }
          .center { text-align: center; }
          .left { text-align: left; }
          .right { text-align: right; }
          .bold { font-weight: bold; }
          .large { font-size: 14px; }
          .border-top { border-top: 1px dashed black; margin: 8px 0; padding-top: 8px; }
          .border-bottom { border-bottom: 1px dashed black; margin: 8px 0; padding-bottom: 8px; }
          .space { margin: 8px 0; }
          .flex-row { display: flex; justify-content: space-between; }
          .item-row { display: flex; justify-content: space-between; margin: 4px 0; }
        </style>
      </head>
      <body>
        <div class="center bold large">
          ${organizationInfo.name || 'TIENDA DE VENTAS'}
        </div>
        
        ${organizationInfo.address ? `<div class="center">${organizationInfo.address}</div>` : ''}
        ${organizationInfo.phone ? `<div class="center">Tel: ${organizationInfo.phone}</div>` : ''}
        ${organizationInfo.email ? `<div class="center">${organizationInfo.email}</div>` : ''}
        
        <div class="border-top"></div>
        
        <div class="center bold large">COMPROBANTE DE VENTA</div>
        <div class="center">No. ${Date.now().toString().slice(-8)}</div>
        
        <div class="border-top"></div>
        
        <div class="space">
          <div class="bold">FECHA:</div>
          <div>${currentDate}</div>
        </div>
        
        <div class="space">
          <div class="bold">CLIENTE:</div>
          <div>${customerName}</div>
        </div>
        
        <div class="space">
          <div class="bold">MÉTODO DE PAGO:</div>
          <div>${paymentMethod.toUpperCase()}</div>
        </div>
        
        <div class="border-top"></div>
        
        <div class="bold">PRODUCTOS:</div>
        ${cart.map(item => `
          <div class="item-row">
            <div>${item.name}</div>
          </div>
          <div class="item-row">
            <div>${item.quantity} x ${formatCurrency(item.price)}</div>
            <div>${formatCurrency(item.quantity * item.price)}</div>
          </div>
        `).join('')}
        
        <div class="border-top"></div>
        
        <div class="space">
          <div class="flex-row">
            <div class="bold">SUBTOTAL:</div>
            <div class="bold">${formatCurrency(getSubtotal())}</div>
          </div>
        </div>
        
        <div class="space">
          <div class="flex-row bold large">
            <div>TOTAL:</div>
            <div>${formatCurrency(getTotal())}</div>
          </div>
        </div>
        
        <div class="border-top"></div>
        
        <div class="center space">
          <div>¡Gracias por su compra!</div>
          <div>Conserve este comprobante</div>
          ${organizationInfo.phone ? `<div>Consultas: ${organizationInfo.phone}</div>` : ''}
        </div>
        
        <div class="border-top"></div>
        
        <div class="center">
          <div>Fecha de impresión: ${currentDate}</div>
        </div>
      </body>
      </html>
    `

    return ticketHTML
  }

  // Función para imprimir ticket de venta
  const handlePrintSaleTicket = async (saleData: any) => {
    try {
      setPrintLoading(true)
      
      // Obtener información de la organización
      const organizationInfo = await fetchOrganizationInfo()
      
      // Generar el HTML del ticket
      const ticketHTML = generateSaleTicket(saleData, organizationInfo)
      
      // Crear iframe para impresión
      const printFrame = document.createElement('iframe')
      printFrame.style.position = 'fixed'
      printFrame.style.top = '-1000px'
      printFrame.style.left = '-1000px'
      
      document.body.appendChild(printFrame)
      
      const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document
      if (frameDoc) {
        frameDoc.open()
        frameDoc.write(ticketHTML)
        frameDoc.close()
        
        // Esperar a que cargue el contenido
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Imprimir
        printFrame.contentWindow?.print()
        
        // Limpiar después de un tiempo
        setTimeout(() => {
          document.body.removeChild(printFrame)
        }, 1000)
      }
      
    } catch (error) {
      console.error('Error printing sale ticket:', error)
      
      // Fallback: descargar como archivo
      try {
        const organizationInfo = await fetchOrganizationInfo()
        const ticketHTML = generateSaleTicket(saleData, organizationInfo)
        downloadTicketAsFile(ticketHTML, 'venta')
      } catch (fallbackError) {
        console.error('Error in fallback download:', fallbackError)
        alert('Error al imprimir el comprobante. Por favor, intente nuevamente.')
      }
    } finally {
      setPrintLoading(false)
    }
  }

  // Descargar ticket como archivo HTML
  const downloadTicketAsFile = (ticketHTML: string, prefix: string) => {
    const blob = new Blob([ticketHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${prefix}_${Date.now()}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchProducts.toLowerCase()) ||
    (product.brand && product.brand.toLowerCase().includes(searchProducts.toLowerCase())) ||
    (product.model && product.model.toLowerCase().includes(searchProducts.toLowerCase()))
  )

  // Estadísticas rápidas para ventas
  const salesStats = {
    total: pagination.total,
    ventasHoy: sales.filter(s => {
      const today = new Date().toDateString()
      return new Date(s.created_at).toDateString() === today
    }).length,
    totalMonto: sales.reduce((sum, sale) => sum + sale.total, 0),
    efectivo: sales.filter(s => s.payment_method === 'efectivo').length,
    digital: sales.filter(s => ['tarjeta', 'yape', 'plin', 'transferencia'].includes(s.payment_method)).length
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <h1 className={`text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent`}>
              Sistema de Ventas
            </h1>
            <p className={`${textColors.secondary} text-lg`}>
              Punto de venta y gestión de transacciones
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs 
          selectedKey={activeTab} 
          onSelectionChange={(key) => setActiveTab(key as 'pos' | 'ventas')}
          variant="bordered"
          size="lg"
          classNames={{
            tabList: "grid w-full grid-cols-2",
            cursor: "w-full bg-gradient-to-r from-blue-500 to-purple-500",
            tab: "max-w-fit px-0 h-12",
            tabContent: "group-data-[selected=true]:text-white"
          }}
        >
          <Tab 
            key="pos" 
            title={
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5" />
                <span>{t('sales.title')}</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Columna Izquierda: Productos y Servicios */}
              <div className="lg:col-span-3 space-y-6">
                <Card>
                  <CardBody className="p-6">
                    <h3 className={`text-xl font-bold ${textColors.primary} mb-4`}>{t('sales.searchProducts')}</h3>
                    <div className="flex items-center">
                      <div className="flex-grow">
                        <Input
                          name="search"
                          placeholder={t('inventory.searchPlaceholder')}
                          value={searchProducts}
                          onValueChange={setSearchProducts}
                          startContent={<Search className="w-5 h-5 text-gray-400" />}
                          isClearable
                          variant="bordered"
                          classNames={{
                            input: "text-gray-900 placeholder:text-gray-500",
                            inputWrapper: "border-gray-300",
                          }}
                        />
                      </div>
                      <Tooltip content="Escanear código de barras">
                        <Button 
                          variant="light" 
                          isIconOnly 
                          onClick={() => setIsScannerOpen(true)}
                          className="ml-2"
                        >
                          <Camera className="w-6 h-6" />
                        </Button>
                      </Tooltip>
                    </div>
                  </CardBody>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-2">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} isPressable onPress={() => addToCart(product)} className="hover:scale-105 transition-transform">
                      <CardBody className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar
                            icon={<Package className="w-4 h-4" />}
                            classNames={{
                              base: "bg-gradient-to-br from-blue-400 to-purple-500",
                              icon: "text-white"
                            }}
                            size="sm"
                          />
                          <div className="flex-1">
                            <p className={`font-semibold text-sm ${textColors.primary}`}>{product.name}</p>
                            <p className={`text-xs ${textColors.secondary}`}>{product.brand} {product.model}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(product.enduser_price)}
                          </p>
                          <Chip size="sm" variant="bordered" color={getCategoryColor(product.category)}>
                            {product.category}
                          </Chip>
                        </div>
                        <p className={`text-xs text-right mt-1 ${textColors.tertiary}`}>
                          Stock: {product.stock_quantity}
                        </p>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Columna Derecha: Carrito */}
              <div className="lg:col-span-2">
                {/* Carrito de compras */}
                <Card>
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-xl font-bold ${textColors.primary}`}>{t('sales.cart')}</h3>
                      {cart.length > 0 && (
                        <Button
                          variant="flat"
                          color="danger"
                          size="sm"
                          startContent={<Trash2 className="w-4 h-4" />}
                          onPress={clearCart}
                        >
                          Limpiar
                        </Button>
                      )}
                    </div>

                    {cart.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className={textColors.muted}>El carrito está vacío</p>
                        <p className={`text-sm ${textColors.muted}`}>Agrega productos</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {cart.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className={`font-medium text-sm ${textColors.primary}`}>{item.name}</p>
                              <p className={`text-xs ${textColors.secondary}`}>
                                {formatCurrency(item.price)} x {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                isIconOnly
                                size="sm"
                                variant="flat"
                                onPress={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="flat"
                                onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                isDisabled={item.max_stock ? item.quantity >= item.max_stock : false}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="flat"
                                color="danger"
                                onPress={() => removeFromCart(item.id)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardBody>
                </Card>

                {/* Información del cliente y pago */}
                {cart.length > 0 && (
                  <Card>
                    <CardBody className="p-6 space-y-4">
                      <h3 className={`text-lg font-bold ${textColors.primary}`}>Información de venta</h3>
                      
                      <FormField
                        label="Cliente"
                        name="customer"
                        type="select"
                        value={selectedCustomer}
                        onChange={setSelectedCustomer}
                        placeholder="Seleccionar cliente..."
                        options={[
                          { value: '', label: t('sales.generalCustomer') },
                          ...customers.map(customer => ({
                            value: customer.id,
                            label: customer.name || customer.anonymous_identifier || 'Cliente Anónimo'
                          }))
                        ]}
                      />

                      <FormField
                        label="Método de Pago"
                        name="payment_method"
                        type="select"
                        value={paymentMethod}
                        onChange={setPaymentMethod}
                        options={[
                          { value: 'efectivo', label: t('sales.cash') },
                          { value: 'tarjeta', label: t('sales.card') },
                          { value: 'yape', label: t('sales.yape') },
                          { value: 'plin', label: t('sales.plin') },
                          { value: 'transferencia', label: t('sales.transfer') }
                        ]}
                      />

                      <Divider />

                      {/* Resumen de totales */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className={textColors.secondary}>{t('sales.subtotal')}:</span>
                          <span className={`font-medium ${textColors.primary}`}>{formatCurrency(getSubtotal())}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                          <span className={textColors.primary}>Total:</span>
                          <span className="text-green-600">{formatCurrency(getTotal())}</span>
                        </div>
                      </div>

                      <Button
                        color="primary"
                        size="lg"
                        className="w-full"
                        startContent={<CreditCard className="w-5 h-5" />}
                        onPress={processSale}
                        isLoading={loading}
                      >
                        {t('sales.checkout')}
                      </Button>
                    </CardBody>
                  </Card>
                )}
              </div>
            </div>
          </Tab>

          <Tab 
            key="ventas" 
            title={
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5" />
                <span>Historial de Ventas</span>
              </div>
            }
          >
            <div className="space-y-6 mt-6">
              {/* Stats Cards para ventas */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
                <Card className="hover:scale-105 transition-transform border-0 shadow-lg">
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg">
                        <Receipt className="w-6 h-6 text-white" />
                      </div>
                      <Chip color="primary" variant="flat">Total</Chip>
                    </div>
                    <div className="space-y-2">
                      <p className={`text-sm font-medium ${textColors.tertiary}`}>{t('sales.salesHistory')}</p>
                      <p className={`text-3xl font-bold ${textColors.primary}`}>{salesStats.total}</p>
                    </div>
                  </CardBody>
                </Card>

                <Card className="hover:scale-105 transition-transform border-0 shadow-lg">
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <Chip color="success" variant="flat">Hoy</Chip>
                    </div>
                    <div className="space-y-2">
                      <p className={`text-sm font-medium ${textColors.tertiary}`}>Ventas Hoy</p>
                      <p className={`text-3xl font-bold text-green-600`}>{salesStats.ventasHoy}</p>
                    </div>
                  </CardBody>
                </Card>

                <Card className="hover:scale-105 transition-transform border-0 shadow-lg">
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <Chip color="secondary" variant="flat">Monto</Chip>
                    </div>
                    <div className="space-y-2">
                      <p className={`text-sm font-medium ${textColors.tertiary}`}>Total Vendido</p>
                      <p className={`text-lg font-bold text-purple-600`}>{formatCurrency(salesStats.totalMonto)}</p>
                    </div>
                  </CardBody>
                </Card>

                <Card className="hover:scale-105 transition-transform border-0 shadow-lg">
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <Chip color="success" variant="flat">Efectivo</Chip>
                    </div>
                    <div className="space-y-2">
                      <p className={`text-sm font-medium ${textColors.tertiary}`}>Efectivo</p>
                      <p className={`text-3xl font-bold text-green-600`}>{salesStats.efectivo}</p>
                    </div>
                  </CardBody>
                </Card>

                <Card className="hover:scale-105 transition-transform border-0 shadow-lg">
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <Chip color="primary" variant="flat">Digital</Chip>
                    </div>
                    <div className="space-y-2">
                      <p className={`text-sm font-medium ${textColors.tertiary}`}>Digital</p>
                      <p className={`text-3xl font-bold text-blue-600`}>{salesStats.digital}</p>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Filtros */}
              <Card>
                <CardBody className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <Select
                      placeholder="Método de pago"
                      selectedKeys={new Set([filtroMetodo])}
                      onSelectionChange={(keys) => setFiltroMetodo(Array.from(keys)[0] as string)}
                      className="w-full md:w-56"
                      variant="bordered"
                      classNames={{
                        trigger: "text-gray-900",
                        value: "text-gray-900",
                        popoverContent: "bg-white",
                      }}
                    >
                      <SelectItem key="todos" className="text-gray-900">{t('sales.allPaymentMethods')}</SelectItem>
                      <SelectItem key="efectivo" className="text-gray-900">{t('sales.cash')}</SelectItem>
                      <SelectItem key="tarjeta" className="text-gray-900">{t('sales.card')}</SelectItem>
                      <SelectItem key="transferencia" className="text-gray-900">{t('sales.transfer')}</SelectItem>
                    </Select>
                    <Input
                      type="date"
                      value={fechaInicio}
                      onValueChange={setFechaInicio}
                      className="w-full md:w-56"
                      variant="bordered"
                      classNames={{
                        input: "text-gray-900",
                        inputWrapper: "border-gray-300",
                      }}
                    />
                    <Input
                      type="date"
                      value={fechaFin}
                      onValueChange={setFechaFin}
                      className="w-full md:w-56"
                      variant="bordered"
                      classNames={{
                        input: "text-gray-900",
                        inputWrapper: "border-gray-300",
                      }}
                    />
                    <Button onPress={handleDateFilter} color="primary">Filtrar</Button>
                  </div>
                </CardBody>
              </Card>

              {/* Tabla de ventas */}
              <Card>
                <CardBody className="p-0">
                  {/* Vista Desktop - Tabla */}
                  <div className="hidden lg:block">
                    <Table
                      aria-label="Tabla de ventas"
                      classNames={{
                        wrapper: "min-h-[400px]",
                        th: "bg-gray-50 text-gray-700 font-semibold",
                        td: "py-4"
                      }}
                    >
                      <TableHeader>
                        <TableColumn>TIPO</TableColumn>
                        <TableColumn>CLIENTE</TableColumn>
                        <TableColumn>VENDEDOR</TableColumn>
                        <TableColumn>PRODUCTOS</TableColumn>
                        <TableColumn>TOTAL</TableColumn>
                        <TableColumn>PAGO</TableColumn>
                        <TableColumn>FECHA</TableColumn>
                        <TableColumn>ACCIONES</TableColumn>
                      </TableHeader>
                      <TableBody 
                        emptyContent="No hay ventas registradas"
                        isLoading={loadingSales}
                        loadingContent={<Skeleton className="w-full h-12" />}
                      >
                        {sales.map((sale) => (
                          <TableRow key={sale.id}>
                            <TableCell>
                              <Chip
                                color={getSaleTypeColor(sale.sale_type)}
                                variant="flat"
                                startContent={getSaleTypeIcon(sale.sale_type)}
                                size="sm"
                              >
                                {sale.sale_type.charAt(0).toUpperCase() + sale.sale_type.slice(1)}
                              </Chip>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className={`text-sm ${textColors.primary}`}>{getCustomerName(sale.customer)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className={`text-sm font-medium ${textColors.primary}`}>{sale.seller.name}</p>
                                <p className={`text-xs ${textColors.muted}`}>{sale.seller.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className={`text-sm font-medium ${textColors.primary}`}>
                                  {sale.sale_items.length} item{sale.sale_items.length !== 1 ? 's' : ''}
                                </p>
                                <div className={`text-xs ${textColors.muted} space-y-1`}>
                                  {sale.sale_items.slice(0, 2).map((item, idx) => (
                                    <div key={idx}>
                                      {item.inventory?.name || 'Producto'} x{item.quantity}
                                    </div>
                                  ))}
                                  {sale.sale_items.length > 2 && (
                                    <div>+{sale.sale_items.length - 2} más...</div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-lg font-bold text-green-600">
                                {formatCurrency(sale.total)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Chip
                                color={getPaymentMethodColor(sale.payment_method)}
                                variant="flat"
                                size="sm"
                              >
                                {sale.payment_method.charAt(0).toUpperCase() + sale.payment_method.slice(1)}
                              </Chip>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className={`text-sm ${textColors.primary}`}>
                                  {new Date(sale.created_at).toLocaleDateString('es-PE')}
                                </p>
                                <p className={`text-xs ${textColors.muted}`}>
                                  {new Date(sale.created_at).toLocaleTimeString('es-PE', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Tooltip content="Ver detalles de la venta" classNames={{ content: "bg-gray-900 text-white" }}>
                                <Button isIconOnly variant="flat" size="sm">
                                  <Receipt className="w-5 h-5" />
                                </Button>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Vista Móvil - Cards */}
                  <div className="lg:hidden">
                    {loadingSales ? (
                      <div className="space-y-4 p-4">
                        {[...Array(5)].map((_, i) => (
                          <Card key={i} className="shadow-sm">
                            <CardBody className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <Skeleton className="w-10 h-10 rounded-full" />
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
                    ) : sales.length === 0 ? (
                      <div className="text-center py-12 px-4">
                        <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className={`text-lg font-semibold ${textColors.primary} mb-2`}>
                          No hay ventas
                        </h3>
                        <p className={`${textColors.muted} mb-6`}>
                          No se encontraron ventas con los filtros aplicados
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 p-4">
                        {sales.map((sale) => (
                          <Card key={sale.id} className="shadow-sm hover:shadow-md transition-shadow">
                            <CardBody className="p-4">
                              {/* Header de la venta */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-green-200">
                                    {getSaleTypeIcon(sale.sale_type)}
                                  </div>
                                  <div>
                                    <Chip
                                      color={getSaleTypeColor(sale.sale_type)}
                                      variant="flat"
                                      size="sm"
                                      className="mb-1"
                                    >
                                      {sale.sale_type.charAt(0).toUpperCase() + sale.sale_type.slice(1)}
                                    </Chip>
                                    <p className={`text-xs ${textColors.muted}`}>
                                      {new Date(sale.created_at).toLocaleDateString('es-PE')} - {new Date(sale.created_at).toLocaleTimeString('es-PE', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xl font-bold text-green-600">
                                    {formatCurrency(sale.total)}
                                  </p>
                                  <Chip
                                    color={getPaymentMethodColor(sale.payment_method)}
                                    variant="flat"
                                    size="sm"
                                  >
                                    {sale.payment_method.charAt(0).toUpperCase() + sale.payment_method.slice(1)}
                                  </Chip>
                                </div>
                              </div>

                              {/* Información de la venta */}
                              <div className="grid grid-cols-1 gap-4 mb-4">
                                {/* Cliente */}
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <User className="w-4 h-4 text-gray-600" />
                                    <p className={`text-xs font-medium ${textColors.tertiary} uppercase tracking-wide`}>
                                      Cliente
                                    </p>
                                  </div>
                                  <p className={`text-sm font-medium ${textColors.primary}`}>
                                    {getCustomerName(sale.customer)}
                                  </p>
                                </div>

                                {/* Vendedor */}
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <p className={`text-xs font-medium ${textColors.tertiary} uppercase tracking-wide mb-2`}>
                                    Vendedor
                                  </p>
                                  <p className={`text-sm font-medium ${textColors.primary}`}>
                                    {sale.seller.name}
                                  </p>
                                  <p className={`text-xs ${textColors.muted}`}>
                                    {sale.seller.email}
                                  </p>
                                </div>
                              </div>

                              {/* Productos */}
                              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                                <p className={`text-xs font-medium ${textColors.tertiary} uppercase tracking-wide mb-2`}>
                                  Productos ({sale.sale_items.length} item{sale.sale_items.length !== 1 ? 's' : ''})
                                </p>
                                <div className="space-y-2">
                                  {sale.sale_items.slice(0, 3).map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center">
                                      <span className={`text-sm ${textColors.primary}`}>
                                        {item.inventory?.name || 'Producto'}
                                      </span>
                                      <span className={`text-sm ${textColors.secondary}`}>
                                        x{item.quantity}
                                      </span>
                                    </div>
                                  ))}
                                  {sale.sale_items.length > 3 && (
                                    <div className={`text-xs ${textColors.muted} text-center pt-2 border-t border-blue-200`}>
                                      +{sale.sale_items.length - 3} producto{sale.sale_items.length - 3 !== 1 ? 's' : ''} más
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Acciones */}
                              <div className="flex gap-2">
                                <Button 
                                  variant="flat" 
                                  size="sm" 
                                  startContent={<Receipt className="w-4 h-4" />}
                                  className="flex-1"
                                >
                                  Ver Detalles
                                </Button>
                                <Button 
                                  variant="flat" 
                                  size="sm" 
                                  color="primary"
                                  startContent={<Eye className="w-4 h-4" />}
                                  className="flex-1"
                                >
                                  Factura
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
                    onChange={(page) => fetchSales(page)}
                    showControls
                    color="primary"
                    size="lg"
                  />
                </div>
              )}
            </div>
          </Tab>
        </Tabs>
      </div>
      {isScannerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-lg w-full relative">
            <h3 className="text-lg font-bold mb-4">Escanear Código de Barras</h3>
            <Button 
              isIconOnly 
              variant="light"
              onClick={() => setIsScannerOpen(false)} 
              className="absolute top-4 right-4"
            >
              <X className="w-6 h-6"/>
            </Button>
            <BarcodeScannerComponent onScan={handleScan} />
            <p className="text-center text-sm text-gray-600 mt-4">Apunta la cámara al código de barras del producto.</p>
          </div>
        </div>
      )}

      {/* Modal de advertencia inicial */}
      <Modal 
        isOpen={isWarningOpen} 
        onClose={onWarningClose} 
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
            <h2 className={`text-xl font-bold ${textColors.primary} flex items-center gap-2`}>
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              Confirmar Venta
            </h2>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className={`text-lg ${textColors.primary}`}>
                ¿Estás seguro de que deseas procesar esta venta?
              </p>
              
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-medium ${textColors.secondary}`}>Total a cobrar:</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {formatCurrency(getTotal())}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`${textColors.secondary}`}>Productos:</span>
                  <span className={`font-medium ${textColors.primary}`}>
                    {cart.length} item{cart.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${textColors.secondary}`}>Método de pago:</span>
                  <span className={`font-medium ${textColors.primary}`}>
                    {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <p className={`text-sm ${textColors.secondary}`}>
                  Una vez procesada, esta venta no se puede deshacer. Verifica que todos los datos sean correctos.
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={onWarningClose}
              className="font-medium"
            >
              No, cancelar
            </Button>
            <Button
              color="warning"
              onPress={proceedToTicketConfirmation}
              className="font-medium"
              startContent={<Receipt className="w-4 h-4" />}
            >
              Sí, continuar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de confirmación para comprobante */}
      <Modal 
        isOpen={isConfirmOpen} 
        onClose={onConfirmClose} 
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
            <h2 className={`text-xl font-bold ${textColors.primary} flex items-center gap-2`}>
              <Receipt className="w-6 h-6" />
              Confirmar Venta
            </h2>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className={`text-lg ${textColors.primary}`}>
                ¿Desea imprimir un comprobante de esta venta?
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-medium ${textColors.secondary}`}>Total de la venta:</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(getTotal())}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${textColors.secondary}`}>Método de pago:</span>
                  <span className={`font-medium ${textColors.primary}`}>
                    {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Printer className="w-5 h-5 text-blue-600" />
                <p className={`text-sm ${textColors.secondary}`}>
                  El comprobante será enviado a la impresora predeterminada en formato de ticket térmico (80mm).
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={processSaleWithoutTicket}
              isLoading={loading}
              disabled={printLoading}
            >
              No, solo procesar venta
            </Button>
            <Button
              color="primary"
              onPress={processSaleWithTicket}
              isLoading={loading || printLoading}
              startContent={<Printer className="w-4 h-4" />}
            >
              Sí, imprimir comprobante
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DashboardLayout>
  )
} 