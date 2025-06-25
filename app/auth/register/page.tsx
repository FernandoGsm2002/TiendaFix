'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { 
  Eye, EyeOff, Lock, Mail, ArrowLeft, Building, User, 
  Phone, MapPin, CreditCard, Check 
} from 'lucide-react'
import Link from 'next/link'

const SUBSCRIPTION_PLANS = [
  { key: 'monthly_3', label: '3 Meses - $99', price: '$99' },
  { key: 'monthly_6', label: '6 Meses - $179', price: '$179' },
  { key: 'yearly', label: '1 Año - $299', price: '$299' }
]

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [isVisible, setIsVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    // Paso 1: Datos personales
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    
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
    setFormData(prev => ({ ...prev, [field]: value }))
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
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Todos los campos son obligatorios')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return false
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
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

    const { error } = await signUp(formData.email, formData.password, {
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
    }
  }

  const toggleVisibility = () => setIsVisible(!isVisible)

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Solicitud Enviada!</h1>
          <p className="text-gray-600 mb-6">
            Tu solicitud de registro ha sido enviada correctamente. 
            Un administrador la revisará y te contactará pronto.
          </p>
          <button 
            onClick={() => router.push('/auth/login')}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Ir al Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Botón de regreso */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Registrar Nueva Tienda</h1>
            <p className="text-gray-600">Paso {step} de 3</p>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Paso 1: Datos Personales */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos Personales</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                    placeholder="Tu nombre completo"
                    required
                    style={{ color: '#000000' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                    placeholder="tu@email.com"
                    required
                    style={{ color: '#000000' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={isVisible ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                    placeholder="Mínimo 6 caracteres"
                    required
                    style={{ color: '#000000' }}
                  />
                  <button 
                    type="button" 
                    onClick={toggleVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar contraseña *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={isVisible ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                    placeholder="Repite tu contraseña"
                    required
                    style={{ color: '#000000' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Paso 2: Datos de la Tienda */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos de la Tienda</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la tienda *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => handleOrganizationNameChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                    placeholder="Ej: TecnoFix Lima Centro"
                    required
                    style={{ color: '#000000' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Identificador único de la tienda
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.organizationSlug}
                    onChange={(e) => updateFormData('organizationSlug', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                    placeholder="tecnofix-lima-centro"
                    style={{ color: '#000000' }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  💡 Esto será tu identificador único en el sistema. Se genera automáticamente basado en el nombre de tu tienda.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                    placeholder="+51 999 888 777"
                    style={{ color: '#000000' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white resize-none"
                    placeholder="Dirección completa de tu tienda"
                    rows={2}
                    style={{ color: '#000000' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Paso 3: Plan de Suscripción */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan de Suscripción</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecciona tu plan *
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.subscriptionPlan}
                    onChange={(e) => updateFormData('subscriptionPlan', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                    style={{ color: '#000000' }}
                  >
                    {SUBSCRIPTION_PLANS.map((plan) => (
                      <option key={plan.key} value={plan.key}>
                        {plan.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-3">¿Qué incluye tu plan?</h4>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-center">
                    <Check className="w-4 h-4 mr-2 text-blue-600" />
                    Gestión completa de reparaciones
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 mr-2 text-blue-600" />
                    Control de inventario y stock
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 mr-2 text-blue-600" />
                    Base de datos de clientes
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 mr-2 text-blue-600" />
                    Sistema POS integrado
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 mr-2 text-blue-600" />
                    Reportes y estadísticas
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 mr-2 text-blue-600" />
                    Soporte técnico 24/7
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 mr-3 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Anterior
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className={`bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors ${step === 1 ? 'w-full' : 'flex-1 ml-3'}`}
              >
                Siguiente
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 ml-3 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando solicitud...' : 'Enviar Solicitud'}
              </button>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 