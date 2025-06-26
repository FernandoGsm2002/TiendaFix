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
import { formatCurrency } from '@/lib/utils/currency'
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
  Receipt
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
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [busquedaCliente, setBusquedaCliente] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [loading, setLoading] = useState(false)

  const { isOpen: isCustomerModalOpen, onOpen: onCustomerModalOpen, onClose: onCustomerModalClose } = useDisclosure()
  const { isOpen: isCheckoutModalOpen, onOpen: onCheckoutModalOpen, onClose: onCheckoutModalClose } = useDisclosure()

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

    setLoading(true)
    try {
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

      const response = await fetch('/api/sales/technician', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al procesar la venta')
      }

      const result = await response.json()
      alert(`¡Venta procesada exitosamente! ID: ${result.data.sale_id}`)
      clearCart()
      onCheckoutModalClose()
      
      // Recargar productos para actualizar stock
      fetchProducts()
    } catch (error) {
      console.error('Error processing sale:', error)
      alert(error instanceof Error ? error.message : 'Error al procesar la venta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <TechnicianDashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 p-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-1">
              Punto de Venta
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
              <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-emerald-50 sticky top-4">
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
                    <Divider className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    <div className="flex justify-between items-center text-xl">
                      <span className="font-bold text-gray-900">Total:</span>
                      <span className="font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {formatCurrency(total)}
                      </span>
                    </div>
                    <Button
                      color="success"
                      size="lg"
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 font-bold shadow-xl h-12"
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
        <Modal isOpen={isCustomerModalOpen} onOpenChange={onCustomerModalClose} size="md">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Seleccionar Cliente</ModalHeader>
                <ModalBody>
                  <Input
                    placeholder="Buscar cliente..."
                    value={busquedaCliente}
                    onValueChange={setBusquedaCliente}
                    startContent={<Search className="w-4 h-4 text-gray-400" />}
                    className="mb-4"
                  />
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    <div 
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setSelectedCustomer(null)
                        onClose()
                      }}
                    >
                      <p className="font-medium">Cliente de mostrador</p>
                      <p className="text-sm text-gray-500">Sin datos de cliente</p>
                    </div>
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          setSelectedCustomer(customer)
                          onClose()
                        }}
                      >
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-gray-500">
                          {customer.phone} • {customer.email}
                        </p>
                      </div>
                    ))}
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button variant="flat" onPress={onClose}>
                    Cancelar
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Modal de checkout */}
        <Modal isOpen={isCheckoutModalOpen} onOpenChange={onCheckoutModalClose} size="lg">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Procesar Venta</ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Resumen de la venta</h4>
                      <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                        {cart.map((item) => (
                          <div key={item.product.id} className="flex justify-between">
                            <span>{item.product.name} x{item.quantity}</span>
                            <span>{formatCurrency(item.subtotal)}</span>
                          </div>
                        ))}
                        <Divider />
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(subtotalSinIGV)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>IGV (18%):</span>
                          <span>{formatCurrency(igv)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span>{formatCurrency(total)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Cliente</h4>
                      {selectedCustomer ? (
                        <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                          <div>
                            <p className="font-medium">{selectedCustomer.name}</p>
                            <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                          </div>
                          <Button
                            size="sm"
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
                          className="w-full"
                          startContent={<User className="w-4 h-4" />}
                          onPress={onCustomerModalOpen}
                        >
                          Seleccionar Cliente (Opcional)
                        </Button>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Método de pago</h4>
                      <Select
                        placeholder="Seleccionar método de pago"
                        selectedKeys={new Set([paymentMethod])}
                        onSelectionChange={(keys) => setPaymentMethod(Array.from(keys)[0] as string)}
                        variant="bordered"
                      >
                        <SelectItem key="cash">Efectivo</SelectItem>
                        <SelectItem key="card">Tarjeta</SelectItem>
                        <SelectItem key="transfer">Transferencia</SelectItem>
                        <SelectItem key="yape">Yape/Plin</SelectItem>
                      </Select>
                    </div>


                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button variant="flat" onPress={onClose}>
                    Cancelar
                  </Button>
                  <Button 
                    color="success" 
                    onPress={processSale}
                    isLoading={loading}
                    startContent={!loading && <Receipt className="w-4 h-4" />}
                  >
                    {loading ? 'Procesando...' : 'Confirmar Venta'}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </TechnicianDashboardLayout>
  )
} 