'use client'

import React, { useState, useEffect } from 'react'
import TechnicianDashboardLayout from '../components/TechnicianDashboardLayout'
import { 
  Card, 
  CardBody, 
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Divider,
  Avatar
} from '@heroui/react'
import { textColors } from '@/lib/utils/colors'
import { useCurrency } from '@/lib/contexts/TranslationContext'
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Calculator,
  CreditCard,
  DollarSign,
  Package,
  User,
  Search,
  Receipt,
  Printer,
  AlertTriangle
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

interface CartItem {
  product: Product
  quantity: number
  subtotal: number
}

interface Customer {
  id: string
  name: string
  phone?: string
  email?: string
}

export default function TechnicianSalesPage() {
  const { formatCurrency } = useCurrency()
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [busquedaCliente, setBusquedaCliente] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [loading, setLoading] = useState(false)
  const [printLoading, setPrintLoading] = useState(false)
  const [pendingSaleData, setPendingSaleData] = useState<any>(null)

  const { isOpen: isCustomerModalOpen, onOpen: onCustomerModalOpen, onClose: onCustomerModalClose } = useDisclosure()
  const { isOpen: isCheckoutModalOpen, onOpen: onCheckoutModalOpen, onClose: onCheckoutModalClose } = useDisclosure()
  const { isOpen: isWarningOpen, onOpen: onWarningOpen, onClose: onWarningClose } = useDisclosure()
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure()

  // Cargar productos del inventario
  useEffect(() => {
    fetchProducts()
    fetchCustomers()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/inventory')
      if (!response.ok) throw new Error('Error al cargar productos')
      
      const data = await response.json()
      setProducts(data.data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (!response.ok) throw new Error('Error al cargar clientes')
      
      const data = await response.json()
      setCustomers(data.data || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
      setCustomers([])
    }
  }

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id)
    
    if (existingItem) {
      if (existingItem.quantity < product.stock_quantity) {
        setCart(cart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * product.enduser_price }
            : item
        ))
      }
    } else {
      setCart([...cart, {
        product,
        quantity: 1,
        subtotal: product.enduser_price
      }])
    }
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId)
      return
    }

    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.product.enduser_price }
        : item
    ))
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId))
  }

  const clearCart = () => {
    setCart([])
    setSelectedCustomer(null)
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
    product.category.toLowerCase().includes(busquedaProducto.toLowerCase())
  )

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
    (customer.phone && customer.phone.includes(busquedaCliente))
  )

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  
  // El precio ya incluye IGV (18%), calculamos subtotal sin IGV
  const subtotalSinIGV = total / 1.18
  const igv = total - subtotalSinIGV

  const processSale = async () => {
    if (cart.length === 0) {
      alert('El carrito está vacío')
      return
    }

    if (!paymentMethod) {
      alert('Selecciona un método de pago')
      return
    }

    // Preparar datos de la venta
    const saleData = {
      customer_id: selectedCustomer?.id || null,
      customer_name: selectedCustomer?.name || 'Cliente de mostrador',
      items: cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.enduser_price
      })),
      payment_method: paymentMethod,
      notes: `Venta realizada por técnico. ${selectedCustomer ? 'Cliente: ' + selectedCustomer.name : 'Venta de mostrador'}`
    }

    // Guardar los datos y mostrar modal de advertencia primero
    setPendingSaleData(saleData)
    onCheckoutModalClose()
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

    setLoading(true)
    try {
      const response = await fetch('/api/sales/technician', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pendingSaleData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al procesar la venta')
      }

      const result = await response.json()
      alert(`¡Venta procesada exitosamente! ID: ${result.data.sale_id}`)
      clearCart()
      onConfirmClose()
      setPendingSaleData(null)
      
      // Recargar productos para actualizar stock
      fetchProducts()
    } catch (error) {
      console.error('Error processing sale:', error)
      alert(error instanceof Error ? error.message : 'Error al procesar la venta')
    } finally {
      setLoading(false)
    }
  }

  // Función para procesar la venta con comprobante
  const processSaleWithTicket = async () => {
    if (!pendingSaleData) return

    setLoading(true)
    try {
      const response = await fetch('/api/sales/technician', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pendingSaleData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al procesar la venta')
      }

      const result = await response.json()
      
      // Imprimir comprobante (función simplificada)
      await handlePrintSaleTicket()
      
      alert(`¡Venta procesada exitosamente y comprobante impreso! ID: ${result.data.sale_id}`)
      clearCart()
      onConfirmClose()
      setPendingSaleData(null)
      
      // Recargar productos para actualizar stock
      fetchProducts()
    } catch (error) {
      console.error('Error processing sale:', error)
      alert(error instanceof Error ? error.message : 'Error al procesar la venta')
    } finally {
      setLoading(false)
    }
  }

  // Función simplificada para imprimir ticket
  const handlePrintSaleTicket = async () => {
    try {
      setPrintLoading(true)
      
      const customerName = selectedCustomer?.name || 'Cliente de mostrador'
      const currentDate = new Date().toLocaleString('es-ES')
      
      // Generar ticket simplificado
      const ticketHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @page { size: 80mm auto; margin: 0; }
            body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 5mm; width: 70mm; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .large { font-size: 14px; }
            .border-top { border-top: 1px dashed black; margin: 8px 0; padding-top: 8px; }
            .space { margin: 8px 0; }
            .item-row { display: flex; justify-content: space-between; margin: 4px 0; }
          </style>
        </head>
        <body>
          <div class="center bold large">COMPROBANTE DE VENTA</div>
          <div class="center">TÉCNICO</div>
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
              <div>${item.product.name}</div>
            </div>
            <div class="item-row">
              <div>${item.quantity} x ${formatCurrency(item.product.enduser_price)}</div>
              <div>${formatCurrency(item.subtotal)}</div>
            </div>
          `).join('')}
          <div class="border-top"></div>
          <div class="space">
            <div class="item-row bold large">
              <div>TOTAL:</div>
              <div>${formatCurrency(total)}</div>
            </div>
          </div>
          <div class="border-top"></div>
          <div class="center space">
            <div>¡Gracias por su compra!</div>
            <div>Técnico de servicio</div>
          </div>
        </body>
        </html>
      `
      
      // Crear iframe para impresión
      const printFrame = document.createElement('iframe')
      printFrame.style.position = 'fixed'
      printFrame.style.top = '-1000px'
      
      document.body.appendChild(printFrame)
      const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document
      
      if (frameDoc) {
        frameDoc.open()
        frameDoc.write(ticketHTML)
        frameDoc.close()
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        printFrame.contentWindow?.print()
        
        setTimeout(() => {
          document.body.removeChild(printFrame)
        }, 1000)
      }
      
    } catch (error) {
      console.error('Error printing ticket:', error)
      alert('Error al imprimir el comprobante')
    } finally {
      setPrintLoading(false)
    }
  }

  return (
    <TechnicianDashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 p-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-1">
              🛒 Punto de Venta
            </h1>
            <p className="text-gray-600 text-sm">
              Sistema de ventas integrado
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Chip 
              color="primary" 
              variant="flat"
              startContent={<ShoppingCart className="w-4 h-4" />}
              className="font-semibold"
            >
              {totalItems} productos
            </Chip>
            <Chip 
              color="success" 
              variant="flat"
              startContent={<DollarSign className="w-4 h-4" />}
              className="font-semibold"
            >
              {formatCurrency(total)}
            </Chip>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Lista de productos */}
          <div className="xl:col-span-3 space-y-6">
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="pb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-xl">
                <div className="flex items-center gap-3">
                                      <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Catálogo de Productos</h3>
                      <p className="text-blue-100 text-sm">Productos disponibles en inventario</p>
                    </div>
                </div>
              </CardHeader>
              <CardBody className="p-4">
                <Input
                  placeholder="Buscar productos por nombre o categoría..."
                  value={busquedaProducto}
                  onValueChange={setBusquedaProducto}
                  startContent={
                    <div className="p-1 rounded-md bg-gradient-to-br from-blue-100 to-purple-100">
                      <Search className="w-4 h-4 text-blue-600" />
                    </div>
                  }
                  className="mb-4"
                  variant="bordered"
                  classNames={{
                    input: "text-gray-900 placeholder:text-gray-500",
                    inputWrapper: "border-gray-300 hover:border-blue-400 focus-within:border-blue-500 bg-white shadow-md",
                  }}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-white to-gray-50">
                      <CardBody className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-sm mb-1">{product.name}</h4>
                            <p className="text-xs text-gray-600 mb-2">{product.category}</p>
                            <div className="flex items-center gap-2">
                              <Chip 
                                size="sm" 
                                color={product.stock_quantity > 0 ? "success" : "danger"} 
                                variant="flat"
                                className="font-medium text-xs"
                              >
                                {product.stock_quantity}
                              </Chip>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                              {formatCurrency(product.enduser_price)}
                            </p>
                          </div>
                        </div>
                        <Button
                          color="primary"
                          size="md"
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 font-semibold shadow-lg"
                          startContent={<Plus className="w-4 h-4" />}
                          onPress={() => addToCart(product)}
                          isDisabled={product.stock_quantity === 0}
                        >
                          {product.stock_quantity === 0 ? 'Sin stock' : 'Agregar al carrito'}
                        </Button>
                      </CardBody>
                    </Card>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg font-medium">No se encontraron productos</p>
                      <p className="text-gray-400">Intenta con otros términos de búsqueda</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Carrito de compras */}
          <div className="xl:col-span-1 space-y-4">
            {/* Carrito */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-green-50">
              <CardHeader className="pb-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-xl">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                      <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Carrito de Compras</h3>
                      <p className="text-green-100 text-sm">{totalItems} productos seleccionados</p>
                    </div>
                  </div>
                  {cart.length > 0 && (
                    <Button
                      color="danger"
                      variant="light"
                      size="sm"
                      startContent={<Trash2 className="w-4 h-4" />}
                      onPress={clearCart}
                      className="bg-red-500/20 text-white hover:bg-red-500/30"
                    >
                      Limpiar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardBody className="p-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">Carrito vacío</p>
                    <p className="text-gray-400">Agrega productos para comenzar</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                    {cart.map((item) => (
                      <Card key={item.product.id} className="border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
                        <CardBody className="p-3">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 text-sm truncate">{item.product.name}</p>
                              <p className="text-xs text-gray-500 line-clamp-1">{item.product.description}</p>
                              <p className="text-xs text-gray-500">{item.product.brand} {item.product.model}</p>
                              <p className="text-sm text-gray-600 mt-1 font-medium">
                                {formatCurrency(item.product.enduser_price)} c/u
                              </p>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="flat"
                                  onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                                  className="w-6 h-6 min-w-6"
                                  aria-label="Disminuir cantidad"
                                >
                                  <Minus className="w-2 h-2" />
                                </Button>
                                <span className="w-6 text-center text-xs font-bold">
                                  {item.quantity}
                                </span>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="flat"
                                  onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                                  isDisabled={item.quantity >= item.product.stock_quantity}
                                  className="w-6 h-6 min-w-6"
                                  aria-label="Aumentar cantidad"
                                >
                                  <Plus className="w-2 h-2" />
                                </Button>
                              </div>
                              <div className="text-center">
                                <p className="font-bold text-sm text-green-600">
                                  {formatCurrency(item.subtotal)}
                                </p>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  color="danger"
                                  variant="light"
                                  onPress={() => removeFromCart(item.product.id)}
                                  className="w-6 h-6 min-w-6 mt-1"
                                  aria-label="Eliminar del carrito"
                                >
                                  <Trash2 className="w-2 h-2" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>



            {/* Total y checkout */}
            {cart.length > 0 && (
              <Card className="shadow-xl border-0 bg-gradient-to-br from-primary-50 to-blue-50 sticky top-4">
                <CardBody className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700 font-medium">Subtotal:</span>
                      <span className="font-bold">{formatCurrency(subtotalSinIGV)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700 font-medium">IGV (18%):</span>
                      <span className="font-bold">{formatCurrency(igv)}</span>
                    </div>
                    <Divider className="bg-gradient-to-r from-transparent via-primary-300 to-transparent" />
                    <div className="flex justify-between items-center text-xl">
                      <span className="font-bold text-gray-900">Total:</span>
                      <span className="font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                        {formatCurrency(total)}
                      </span>
                    </div>
                    <Button
                      color="primary"
                      size="lg"
                      className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 font-bold shadow-xl h-12"
                      startContent={<CreditCard className="w-5 h-5" />}
                      onPress={onCheckoutModalOpen}
                    >
                      Procesar Venta
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>

        {/* Modal para seleccionar cliente */}
        <Modal 
          isOpen={isCustomerModalOpen} 
          onOpenChange={onCustomerModalClose} 
          size="sm"
          scrollBehavior="inside"
          classNames={{
            wrapper: "z-[1000]",
            backdrop: "z-[999]",
            base: "max-h-[95vh] my-1 mx-1 sm:my-2 sm:mx-2 md:mx-6",
            body: "max-h-[70vh] overflow-y-auto py-2 md:py-4",
            header: "border-b border-gray-200 pb-2 md:pb-4",
            footer: "border-t border-gray-200 pt-2 md:pt-4"
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-xl">
                      <User className="w-4 h-4 md:w-6 md:h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-primary-700">Seleccionar Cliente</h3>
                      <p className="text-xs md:text-sm text-gray-600">Busca y selecciona un cliente</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  <Input
                    placeholder="Buscar cliente..."
                    value={busquedaCliente}
                    onValueChange={setBusquedaCliente}
                    startContent={<Search className="w-4 h-4 text-primary-400" />}
                    className="mb-3 md:mb-4"
                    color="primary"
                    variant="bordered"
                    size="sm"
                    classNames={{
                      input: "text-gray-800",
                      inputWrapper: "border-primary-200 hover:border-primary-300 focus-within:border-primary-500"
                    }}
                  />
                  <div className="space-y-2 md:space-y-3 max-h-40 md:max-h-60 overflow-y-auto">
                    <div 
                      className="p-3 md:p-4 border border-primary-200 rounded-xl cursor-pointer hover:bg-primary-50 hover:border-primary-300 transition-all duration-200"
                      onClick={() => {
                        setSelectedCustomer(null)
                        onClose()
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar 
                          name="?" 
                          className="bg-gray-400 text-white"
                          size="sm"
                        />
                        <div>
                          <p className="text-sm md:text-base font-semibold text-gray-800">Cliente de mostrador</p>
                          <p className="text-xs md:text-sm text-gray-500">Sin datos de cliente</p>
                        </div>
                      </div>
                    </div>
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className="p-3 md:p-4 border border-primary-200 rounded-xl cursor-pointer hover:bg-primary-50 hover:border-primary-300 transition-all duration-200"
                        onClick={() => {
                          setSelectedCustomer(customer)
                          onClose()
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar 
                            name={customer.name.charAt(0)} 
                            className="bg-primary-500 text-white"
                            size="sm"
                          />
                          <div>
                            <p className="text-sm md:text-base font-semibold text-gray-800">{customer.name}</p>
                            <p className="text-xs md:text-sm text-gray-500">
                              {customer.phone} • {customer.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ModalBody>
                <ModalFooter className="gap-2">
                  <Button 
                    variant="flat" 
                    onPress={onClose}
                    size="sm"
                    className="font-medium"
                  >
                    Cancelar
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Modal de checkout */}
        <Modal 
          isOpen={isCheckoutModalOpen} 
          onOpenChange={onCheckoutModalClose} 
          size="md"
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
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-xl">
                      <Receipt className="w-4 h-4 md:w-6 md:h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold text-primary-700">Procesar Venta</h3>
                      <p className="text-xs md:text-sm text-gray-600">Confirma los detalles de la venta</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-3 md:space-y-6">
                    <div>
                      <h4 className="text-sm md:text-base font-semibold mb-3 text-gray-800 flex items-center gap-2">
                        <Calculator className="w-3 h-3 md:w-4 md:h-4 text-primary-600" />
                        Resumen de la venta
                      </h4>
                      <div className="bg-gradient-to-br from-primary-50 to-blue-50 p-3 md:p-4 rounded-xl border border-primary-100 space-y-2 md:space-y-3">
                        {cart.map((item) => (
                          <div key={item.product.id} className="flex justify-between items-center">
                            <div className="flex-1">
                              <span className="text-sm md:text-base font-medium text-gray-800">{item.product.name}</span>
                              <span className="text-primary-600 ml-2 text-sm">x{item.quantity}</span>
                            </div>
                            <span className="text-sm md:text-base font-semibold text-gray-800">{formatCurrency(item.subtotal)}</span>
                          </div>
                        ))}
                        <Divider className="bg-primary-200" />
                        <div className="flex justify-between text-xs md:text-sm text-gray-700">
                          <span>Subtotal:</span>
                          <span className="font-medium">{formatCurrency(subtotalSinIGV)}</span>
                        </div>
                        <div className="flex justify-between text-xs md:text-sm text-gray-700">
                          <span>IGV (18%):</span>
                          <span className="font-medium">{formatCurrency(igv)}</span>
                        </div>
                        <div className="flex justify-between text-sm md:text-lg font-bold">
                          <span className="text-gray-800">Total:</span>
                          <span className="text-primary-600 text-lg md:text-xl">{formatCurrency(total)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm md:text-base font-semibold mb-3 text-gray-800 flex items-center gap-2">
                        <User className="w-3 h-3 md:w-4 md:h-4 text-primary-600" />
                        Cliente
                      </h4>
                      {selectedCustomer ? (
                        <div className="bg-gradient-to-br from-primary-50 to-blue-50 p-3 md:p-4 rounded-xl border border-primary-100 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <Avatar 
                              name={selectedCustomer.name.charAt(0)} 
                              className="bg-primary-500 text-white"
                              size="sm"
                            />
                            <div>
                              <p className="text-sm md:text-base font-semibold text-gray-800">{selectedCustomer.name}</p>
                              <p className="text-xs md:text-sm text-gray-600">{selectedCustomer.phone}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            color="primary"
                            variant="light"
                            onPress={() => setSelectedCustomer(null)}
                          >
                            Cambiar
                          </Button>
                        </div>
                      ) : (
                        <Button
                          color="primary"
                          variant="flat"
                          className="w-full h-10 md:h-12"
                          size="sm"
                          startContent={<User className="w-4 h-4" />}
                          onPress={onCustomerModalOpen}
                        >
                          Seleccionar Cliente (Opcional)
                        </Button>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-primary-600" />
                        Método de pago
                      </h4>
                      <Select
                        placeholder="Seleccionar método de pago"
                        selectedKeys={new Set([paymentMethod])}
                        onSelectionChange={(keys) => setPaymentMethod(Array.from(keys)[0] as string)}
                        variant="bordered"
                        color="primary"
                        size="lg"
                        classNames={{
                          trigger: "border-primary-200 hover:border-primary-300 focus:border-primary-500",
                          value: "text-primary-700 font-medium",
                          listbox: "bg-white",
                          popoverContent: "bg-white border border-primary-200 shadow-xl rounded-xl",
                          innerWrapper: "text-primary-600",
                        }}
                      >
                        <SelectItem 
                          key="cash" 
                          classNames={{
                            base: "hover:bg-primary-50 focus:bg-primary-100 data-[selected=true]:bg-primary-100",
                            title: "text-gray-800 font-medium",
                          }}
                        >
                          💵 Efectivo
                        </SelectItem>
                        <SelectItem 
                          key="card"
                          classNames={{
                            base: "hover:bg-primary-50 focus:bg-primary-100 data-[selected=true]:bg-primary-100",
                            title: "text-gray-800 font-medium",
                          }}
                        >
                          💳 Tarjeta
                        </SelectItem>
                        <SelectItem 
                          key="transfer"
                          classNames={{
                            base: "hover:bg-primary-50 focus:bg-primary-100 data-[selected=true]:bg-primary-100",
                            title: "text-gray-800 font-medium",
                          }}
                        >
                          🏦 Transferencia
                        </SelectItem>
                        <SelectItem 
                          key="yape"
                          classNames={{
                            base: "hover:bg-primary-50 focus:bg-primary-100 data-[selected=true]:bg-primary-100",
                            title: "text-gray-800 font-medium",
                          }}
                        >
                          📱 Yape/Plin
                        </SelectItem>
                      </Select>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter className="gap-3">
                  <Button 
                    variant="flat" 
                    onPress={onClose}
                    size="lg"
                    className="font-medium"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    color="primary" 
                    onPress={processSale}
                    isLoading={loading}
                    startContent={!loading && <Receipt className="w-4 h-4" />}
                    size="lg"
                    className="font-bold px-8 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                  >
                    {loading ? 'Procesando...' : 'Confirmar Venta'}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

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
                      {formatCurrency(total)}
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
                      {formatCurrency(total)}
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
      </div>
    </TechnicianDashboardLayout>
  )
} 