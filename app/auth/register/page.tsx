'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { 
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Progress,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Image,
  Chip
} from '@heroui/react'
import { 
  ArrowLeft, Building, User, 
  Phone, MapPin, CreditCard, Check, 
  Mail, Sparkles, Key, Info, Clock,
  Calendar, DollarSign, MessageCircle
} from 'lucide-react'
import Link from 'next/link'

const SUBSCRIPTION_PLANS = [
  { key: 'monthly_3', label: 'Plan Básico', price: '$9.99', priceLocal: 'S/. 37', period: '3 meses', popular: false },
  { key: 'monthly_6', label: 'Plan Pro', price: '$15.99', priceLocal: 'S/. 59', period: '6 meses', popular: true },
  { key: 'yearly', label: 'Plan Ultra Pro', price: '$21.99', priceLocal: 'S/. 81', period: '12 meses', popular: false }
]

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  const [formData, setFormData] = useState({
    // Paso 1: Datos personales
    name: '',
    email: '',
    
    // Paso 2: Datos de la tienda
    organizationName: '',
    organizationSlug: '',
    phone: '',
    address: '',
    
    // Paso 3: Plan de suscripción
    subscriptionPlan: 'monthly_6'
  })
  
  const { signUp } = useAuth()
  const router = useRouter()

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
  }

  const handleOrganizationNameChange = (value: string) => {
    updateFormData('organizationName', value)
    updateFormData('organizationSlug', generateSlug(value))
  }

  const validateStep1 = () => {
    if (!formData.name || !formData.email) {
      setError('Todos los campos son obligatorios')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!formData.organizationName || !formData.organizationSlug) {
      setError('El nombre de la tienda es obligatorio')
      return false
    }
    return true
  }

  const handleNext = () => {
    setError('')
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    
    setStep(step + 1)
  }

  const handleBack = () => {
    setError('')
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    // Generar contraseña automática
    const autoPassword = '12345678'

    const { error } = await signUp(formData.email, autoPassword, {
      name: formData.name,
      organizationName: formData.organizationName,
      organizationSlug: formData.organizationSlug,
      phone: formData.phone,
      address: formData.address,
      subscriptionPlan: formData.subscriptionPlan as any
    })
    
    if (error) {
      setError('Error al crear la cuenta. Inténtalo de nuevo.')
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      onOpen() // Mostrar modal de éxito
    }
  }

  if (success) {
    // Encontrar el plan seleccionado
    const selectedPlan = SUBSCRIPTION_PLANS.find(plan => plan.key === formData.subscriptionPlan);
    const whatsappMessage = encodeURIComponent(
      `Hola, me registré en TiendaFix V2 y quiero proceder con el pago del ${selectedPlan?.label} (${selectedPlan?.price} USDT / ${selectedPlan?.priceLocal}) por ${selectedPlan?.period}. Mi email es: ${formData.email}`
    );
    const whatsappUrl = `https://wa.me/51998936755?text=${whatsappMessage}`;

    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-xl border-0 bg-white">
            <CardBody className="p-8 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                ¡Solicitud Enviada!
              </h1>
              
              <p className="text-gray-600 mb-6">
                Tu solicitud de registro ha sido enviada correctamente. 
                Un administrador la revisará y te contactará pronto.
              </p>

              {/* Información del plan seleccionado */}
              {selectedPlan && (
                <Card className="bg-gray-50 border border-gray-200 mb-6">
                  <CardBody className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2">Plan Seleccionado</h3>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold text-gray-900">{selectedPlan.label}</span>
                      {selectedPlan.popular && (
                        <Chip color="warning" size="sm">POPULAR</Chip>
                      )}
                    </div>
                    <div className="text-center mb-3">
                      <div className="text-xl font-bold text-gray-900">{selectedPlan.price} USDT</div>
                      <div className="text-sm text-gray-600">{selectedPlan.priceLocal}</div>
                      <div className="text-xs text-gray-500">por {selectedPlan.period}</div>
                    </div>
                    <div className="flex justify-center">
                      <Button 
                        as={Link}
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="success"
                        className="font-semibold bg-green-600 text-white hover:bg-green-700"
                        startContent={<MessageCircle className="w-4 h-4" />}
                      >
                        Pagar Ahora
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-700 font-medium">Tiempo de revisión</p>
                  <p className="text-sm font-bold text-gray-900">24-48 hrs</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-700 font-medium">Notificación</p>
                  <p className="text-sm font-bold text-gray-900">Por email</p>
                </div>
              </div>
              
              <Button 
                onClick={() => router.push('/auth/login')}
                color="default"
                className="w-full font-semibold bg-gray-900 text-white hover:bg-gray-800"
                endContent={<Sparkles className="w-4 h-4" />}
              >
                Ir al Login
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Modal de información sobre contraseña */}
        <Modal isOpen={isOpen} onClose={onClose} size="md">
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Información Importante</h2>
                  <p className="text-sm text-gray-600">Sobre tu cuenta</p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Contraseña Temporal</h3>
                    <p className="text-gray-800 text-sm mb-3">
                      Una vez aprobada tu cuenta, recibirás las credenciales de acceso:
                    </p>
                    <div className="bg-white p-3 rounded border border-gray-300 text-center">
                      <p className="text-xs text-gray-600 mb-1">Contraseña temporal:</p>
                      <Chip color="default" variant="flat" className="font-mono font-bold bg-gray-200 text-gray-900">
                        12345678
                      </Chip>
                    </div>
                    <p className="text-gray-700 text-xs mt-3">
                      ⚠️ <strong>Importante:</strong> Podrás cambiar esta contraseña en Configuraciones una vez que tengas acceso.
                    </p>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="default" onPress={onClose} className="font-semibold bg-gray-900 text-white">
                Entendido
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Botón de regreso */}
        <div className="mb-6">
          <Link href="/">
            <Button
              variant="light"
              startContent={<ArrowLeft className="w-4 h-4" />}
              className="text-gray-600 hover:text-gray-900"
            >
              Volver al inicio
            </Button>
          </Link>
        </div>

        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="text-center pb-6">
            <div className="w-full">
              {/* Logo centrado */}
              <div className="flex justify-center mb-6">
                <Image
                  src="/pngs/tiendafixlogo.png"
                  alt="TiendaFix Logo"
                  width={120}
                  height={120}
                  className="rounded-2xl shadow-lg"
                />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Registrar Nueva Tienda
              </h1>
              <p className="text-gray-600">
                Paso {step} de 3 - Comienza tu transformación digital
              </p>
              
              {/* Progress bar simple */}
              <Progress 
                value={(step / 3) * 100} 
                color="default"
                className="mt-4"
              />
            </div>
          </CardHeader>

          <CardBody className="p-8">
            {error && (
              <Card className="bg-red-50 border border-red-200 mb-6">
                <CardBody className="p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </CardBody>
              </Card>
            )}

            {/* Paso 1: Datos Personales */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Datos Personales</h3>
                  <p className="text-gray-600 text-sm">Información del propietario</p>
                </div>

                {/* Información sobre contraseña automática - centrada */}
                <div className="flex justify-center">
                  <Card className="bg-gray-50 border border-gray-200 max-w-lg">
                    <CardBody className="p-4">
                      <div className="text-center">
                        <div className="flex justify-center mb-3">
                          <Key className="w-5 h-5 text-gray-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">Contraseña Automática</h4>
                        <p className="text-gray-800 text-sm mb-3">
                          No necesitas crear una contraseña. Nosotros generamos una temporal para ti:
                        </p>
                        <div className="bg-white p-3 rounded border border-gray-300">
                          <p className="text-xs text-gray-600 mb-1">Tu contraseña temporal será:</p>
                          <Chip color="default" variant="flat" className="font-mono font-bold bg-gray-200 text-gray-900">
                            12345678
                          </Chip>
                        </div>
                        <p className="text-gray-700 text-xs mt-3">
                          💡 <strong>Tip:</strong> Podrás cambiar esta contraseña en Configuraciones una vez que tengas acceso.
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </div>
                
                <Input
                  type="text"
                  label="Nombre Completo"
                  placeholder="Tu nombre completo"
                  value={formData.name}
                  onValueChange={(value) => updateFormData('name', value)}
                  startContent={<User className="w-4 h-4 text-gray-400" />}
                  variant="bordered"
                  size="lg"
                  isRequired
                  classNames={{
                    input: "text-gray-900",
                    inputWrapper: "border-gray-300 focus-within:border-gray-600"
                  }}
                />

                <Input
                  type="email"
                  label="Correo Electrónico"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onValueChange={(value) => updateFormData('email', value)}
                  startContent={<Mail className="w-4 h-4 text-gray-400" />}
                  variant="bordered"
                  size="lg"
                  isRequired
                  classNames={{
                    input: "text-gray-900",
                    inputWrapper: "border-gray-300 focus-within:border-gray-600"
                  }}
                />
              </div>
            )}

            {/* Paso 2: Datos de la Tienda */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Datos de la Tienda</h3>
                  <p className="text-gray-600 text-sm">Información de tu negocio</p>
                </div>
                
                <Input
                  type="text"
                  label="Nombre de la Tienda"
                  placeholder="Ej: TecnoFix Lima Centro"
                  value={formData.organizationName}
                  onValueChange={handleOrganizationNameChange}
                  startContent={<Building className="w-4 h-4 text-gray-400" />}
                  variant="bordered"
                  size="lg"
                  isRequired
                  classNames={{
                    input: "text-gray-900",
                    inputWrapper: "border-gray-300 focus-within:border-gray-600"
                  }}
                />

                <div>
                  <Input
                    type="text"
                    label="Identificador Único"
                    placeholder="tecnofix-lima-centro"
                    value={formData.organizationSlug}
                    onValueChange={(value) => updateFormData('organizationSlug', value)}
                    variant="bordered"
                    size="lg"
                    classNames={{
                      input: "text-gray-900",
                      inputWrapper: "border-gray-300 focus-within:border-gray-600"
                    }}
                  />
                  <p className="text-gray-700 text-xs mt-2">
                    💡 Este será tu identificador único en el sistema. Se genera automáticamente.
                  </p>
                </div>

                <Input
                  type="tel"
                  label="Teléfono"
                  placeholder="+51 999 888 777"
                  value={formData.phone}
                  onValueChange={(value) => updateFormData('phone', value)}
                  startContent={<Phone className="w-4 h-4 text-gray-400" />}
                  variant="bordered"
                  size="lg"
                  classNames={{
                    input: "text-gray-900",
                    inputWrapper: "border-gray-300 focus-within:border-gray-600"
                  }}
                />

                <Textarea
                  label="Dirección"
                  placeholder="Dirección completa de tu tienda"
                  value={formData.address}
                  onValueChange={(value) => updateFormData('address', value)}
                  variant="bordered"
                  size="lg"
                  minRows={2}
                  classNames={{
                    input: "text-gray-900",
                    inputWrapper: "border-gray-300 focus-within:border-gray-600"
                  }}
                />
              </div>
            )}

            {/* Paso 3: Plan de Suscripción */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Plan de Suscripción</h3>
                  <p className="text-gray-600 text-sm">Elige el plan perfecto para ti</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {SUBSCRIPTION_PLANS.map((plan) => {
                    const isSelected = formData.subscriptionPlan === plan.key;
                    
                    return (
                      <Card 
                        key={plan.key}
                        isPressable
                        className={`cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${
                          isSelected
                            ? 'border-gray-600 bg-gray-50 shadow-lg' 
                            : 'border-gray-200 hover:border-gray-400'
                        } ${plan.popular ? 'ring-2 ring-orange-400 ring-offset-2' : ''}`}
                        onPress={() => updateFormData('subscriptionPlan', plan.key)}
                      >
                        <CardBody className="p-4 text-center">
                          {plan.popular && (
                            <Chip
                              color="warning"
                              className="mb-2"
                              size="sm"
                            >
                              POPULAR
                            </Chip>
                          )}
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-gray-600" />
                            <h4 className="font-bold text-gray-900">{plan.label}</h4>
                          </div>
                          <div className="mb-3">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <DollarSign className="w-4 h-4 text-gray-500" />
                              <span className="text-xl font-bold text-gray-900">{plan.price}</span>
                            </div>
                            <div className="text-sm text-gray-600">{plan.priceLocal}</div>
                            <div className="text-xs text-gray-500 mt-1">por {plan.period}</div>
                          </div>
                          {isSelected && (
                            <Chip color="default" size="sm" variant="flat" className="bg-gray-200 text-gray-900">
                              ✓ Seleccionado
                            </Chip>
                          )}
                        </CardBody>
                      </Card>
                    );
                  })}
                </div>

                <Card className="bg-gray-50 border border-gray-200">
                  <CardBody className="p-4">
                    <h4 className="font-bold text-gray-900 mb-3">¿Qué incluye tu plan?</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        'Gestión completa de reparaciones',
                        'Control de inventario y stock',
                        'Base de datos de clientes',
                        'Sistema POS integrado',
                        'Reportes y estadísticas',
                        'Soporte técnico 24/7'
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-gray-800 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>
            )}

            {/* Botones de navegación */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              {step > 1 ? (
                <Button
                  variant="light"
                  onPress={handleBack}
                  startContent={<ArrowLeft className="w-4 h-4" />}
                  className="font-semibold"
                >
                  Anterior
                </Button>
              ) : (
                <div /> // Spacer
              )}
              
              {step < 3 ? (
                <Button
                  color="default"
                  onPress={handleNext}
                  endContent={<Sparkles className="w-4 h-4" />}
                  className="font-semibold bg-gray-900 text-white hover:bg-gray-800"
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  color="default"
                  onPress={handleSubmit}
                  isLoading={loading}
                  endContent={!loading && <Check className="w-4 h-4" />}
                  className="font-semibold bg-gray-900 text-white hover:bg-gray-800"
                >
                  {loading ? 'Enviando solicitud...' : 'Crear Cuenta'}
                </Button>
              )}
            </div>

            <Divider className="my-6" />

            {/* Link al login simple */}
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-3">
                ¿Ya tienes una cuenta?
              </p>
              <Link href="/auth/login">
                <Button
                  variant="flat"
                  color="default"
                  className="font-medium bg-gray-100 text-gray-900 hover:bg-gray-200"
                >
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Footer simple */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            © 2025 TiendaFix - Sistema de Gestión para Talleres
          </p>
        </div>
      </div>
    </div>
  )
} 