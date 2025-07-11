'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '@/lib/auth/auth-context'
import { 
  Card, 
  CardBody, 
  CardHeader,
  Avatar,
  Divider,
  Chip,
  Skeleton,
  Select,
  SelectItem,
  Button,
  Input
} from '@heroui/react'
import { textColors } from '@/lib/utils/colors'
import { SUPPORTED_LOCALES, LOCALE_NAMES, type Locale } from '@/lib/utils/i18n'
import { CURRENCIES, getCurrencyName } from '@/lib/utils/currency'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import { 
  getAllCountries, 
  getTaxIdType, 
  getTaxIdFullName, 
  getTaxIdDescription, 
  formatCountryOption,
  type CountryCode,
  isValidCountry
} from '@/lib/utils/tax-identification'
import { 
  Building, 
  User, 
  Globe,
  CreditCard,
  Mail,
  CheckCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  Shield,
  Eye,
  EyeOff,
  ImageIcon,
  Upload,
  X,
  FileText,
  MapPin
} from 'lucide-react'

interface OrganizationData {
  id: string
  name: string
  slug: string
  email: string
  phone: string | null
  address: string | null
  logo_url: string | null
  subscription_plan: string
  subscription_status: string
  subscription_start_date: string | null
  subscription_end_date: string | null
  max_users: number
  max_devices: number
  country: string | null
  tax_id: string | null
  tax_id_type: string | null
  created_at: string
  updated_at: string
}

export default function ConfiguracionPage() {
  const { userProfile } = useAuth()
  const { t, locale, currency, changeLanguage, changeCurrency } = useTranslations()
  const [dataLoading, setDataLoading] = useState(true)
  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  
  // Estados para la carga de logo
  const [logoLoading, setLogoLoading] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [logoSuccess, setLogoSuccess] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  // Estados para la identificación tributaria
  const [taxIdLoading, setTaxIdLoading] = useState(false)
  const [taxIdError, setTaxIdError] = useState<string | null>(null)
  const [taxIdSuccess, setTaxIdSuccess] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('PE')
  const [taxIdValue, setTaxIdValue] = useState<string>('')

  // Debug logging
  console.log('🔍 ConfiguracionPage - userProfile:', userProfile)
  console.log('🔍 ConfiguracionPage - organization_id:', userProfile?.organization_id)
  console.log('🔍 ConfiguracionPage - currency:', currency)
  console.log('🔍 ConfiguracionPage - locale:', locale)

  // Función para forzar recarga del perfil
  const forceProfileReload = async () => {
    try {
      console.log('🔄 Forzando recarga del perfil...')
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })

      const result = await response.json()
      console.log('🔍 Profile reload result:', result)
      
      if (result.success) {
        console.log('✅ Profile reloaded, refreshing page...')
        window.location.reload()
      } else {
        console.error('❌ Profile reload failed:', result.error)
        alert('Error al recargar perfil: ' + result.error)
      }
    } catch (error) {
      console.error('❌ Error in profile reload:', error)
      alert('Error al recargar perfil: ' + error)
    }
  }

  // Función para cargar datos de la organización
  const fetchOrganizationData = async () => {
    try {
      setDataLoading(true)
      setError(null)

      console.log('🔍 UserProfile:', userProfile)
      console.log('🔍 Organization ID:', userProfile?.organization_id)

      if (!userProfile?.organization_id) {
        throw new Error(`No se encontró ID de organización para el usuario ${userProfile?.email || 'desconocido'}. Contacte al administrador.`)
      }

      // Obtener datos reales de la organización
      const response = await fetch(`/api/organizations/${userProfile.organization_id}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error:', response.status, errorText)
        throw new Error(`Error al cargar datos de la organización (${response.status})`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Error al cargar datos')
      }

      console.log('✅ Organization data loaded:', result.data)
      setOrganizationData(result.data)
      
      // Cargar información tributaria en los estados
      if (result.data.country && isValidCountry(result.data.country)) {
        setSelectedCountry(result.data.country as CountryCode)
      }
      if (result.data.tax_id) {
        setTaxIdValue(result.data.tax_id)
      }
    } catch (err) {
      console.error('Error loading configuration data:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    if (userProfile) {
      fetchOrganizationData()
    }
  }, [userProfile])

  const handleLanguageChange = async (newLocale: Locale) => {
    await changeLanguage(newLocale)
  }

  const handleCurrencyChange = (newCurrency: string) => {
    changeCurrency(newCurrency)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones
    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden')
      return
    }
    
    setPasswordLoading(true)
    setPasswordError(null)
    setPasswordSuccess(null)
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newPassword: passwordData.newPassword
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al cambiar la contraseña')
      }
      
      setPasswordSuccess('Contraseña cambiada exitosamente')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
      // Limpiar mensaje de éxito después de 5 segundos
      setTimeout(() => {
        setPasswordSuccess(null)
      }, 5000)
      
    } catch (error) {
      console.error('Error changing password:', error)
      setPasswordError(error instanceof Error ? error.message : 'Error al cambiar la contraseña')
    } finally {
      setPasswordLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSubscriptionColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'warning'
      case 'expired': return 'danger'
      default: return 'default'
    }
  }

  const getSubscriptionLabel = (plan: string) => {
    switch (plan) {
      case 'monthly_3': return 'Plan Básico (3 meses)'
      case 'monthly_6': return 'Plan Estándar (6 meses)'
      case 'yearly': return 'Plan Premium (1 año)'
      default: return plan
    }
  }

  // Funciones para manejar la carga de logo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setLogoError('Tipo de archivo no permitido. Solo se permiten: JPG, PNG, GIF, WEBP')
      return
    }

    // Validar tamaño del archivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setLogoError('El archivo es demasiado grande. Máximo permitido: 5MB')
      return
    }

    setSelectedFile(file)
    setLogoError(null)
    
    // Crear preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUploadLogo = async () => {
    if (!selectedFile || !userProfile?.organization_id) {
      setLogoError('No se ha seleccionado archivo o no hay organización')
      return
    }

    setLogoLoading(true)
    setLogoError(null)
    setLogoSuccess(null)

    try {
      const formData = new FormData()
      formData.append('logo', selectedFile)

      const response = await fetch(`/api/organizations/${userProfile.organization_id}/upload-logo`, {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al subir el logo')
      }

      setLogoSuccess('Logo subido exitosamente')
      setSelectedFile(null)
      setPreviewUrl(null)
      
      // Recargar datos de la organización para obtener la nueva URL
      await fetchOrganizationData()
      
      // Limpiar mensaje de éxito después de 5 segundos
      setTimeout(() => {
        setLogoSuccess(null)
      }, 5000)

    } catch (error) {
      console.error('Error uploading logo:', error)
      setLogoError(error instanceof Error ? error.message : 'Error al subir el logo')
    } finally {
      setLogoLoading(false)
    }
  }

  const handleRemoveLogo = async () => {
    if (!userProfile?.organization_id) {
      setLogoError('No hay organización disponible')
      return
    }

    if (!confirm('¿Está seguro de que desea eliminar el logo?')) {
      return
    }

    setLogoLoading(true)
    setLogoError(null)
    setLogoSuccess(null)

    try {
      const response = await fetch(`/api/organizations/${userProfile.organization_id}/upload-logo`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar el logo')
      }

      setLogoSuccess('Logo eliminado exitosamente')
      
      // Recargar datos de la organización
      await fetchOrganizationData()
      
      // Limpiar mensaje de éxito después de 5 segundos
      setTimeout(() => {
        setLogoSuccess(null)
      }, 5000)

    } catch (error) {
      console.error('Error removing logo:', error)
      setLogoError(error instanceof Error ? error.message : 'Error al eliminar el logo')
    } finally {
      setLogoLoading(false)
    }
  }

  const clearPreview = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setLogoError(null)
  }

  // Función para actualizar la información tributaria
  const handleUpdateTaxId = async () => {
    if (!userProfile?.organization_id) {
      setTaxIdError('No hay organización disponible')
      return
    }

    setTaxIdLoading(true)
    setTaxIdError(null)
    setTaxIdSuccess(null)

    try {
      const response = await fetch(`/api/organizations/${userProfile.organization_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          country: selectedCountry,
          tax_id: taxIdValue.trim() || null,
          tax_id_type: getTaxIdType(selectedCountry)
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar información tributaria')
      }

      setTaxIdSuccess('Información tributaria actualizada exitosamente')
      
      // Recargar datos de la organización
      await fetchOrganizationData()
      
      // Limpiar mensaje de éxito después de 5 segundos
      setTimeout(() => {
        setTaxIdSuccess(null)
      }, 5000)

    } catch (error) {
      console.error('Error updating tax ID:', error)
      setTaxIdError(error instanceof Error ? error.message : 'Error al actualizar información tributaria')
    } finally {
      setTaxIdLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header simplificado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">{t('settings.title')}</h1>
            <p className={`text-sm md:text-base ${textColors.secondary} mt-1`}>{t('settings.description')}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="shadow-sm border-2 border-danger-200 bg-danger-50/30">
            <CardBody className="py-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-danger-600" />
                <span className="text-sm font-medium text-danger-700">Error de Configuración</span>
              </div>
              <div className="mt-2 text-xs text-danger-600">
                {error}
              </div>
                             <div className="mt-2 text-xs text-danger-500">
                 <strong>Información de depuración:</strong><br/>
                 Usuario: {userProfile?.email || 'No disponible'}<br/>
                 Rol: {userProfile?.role || 'No disponible'}<br/>
                 Organization ID: {userProfile?.organization_id || 'No asignado'}
               </div>
               <div className="mt-3 flex gap-2">
                 <Button
                   size="sm"
                   color="primary"
                   variant="flat"
                   onClick={forceProfileReload}
                 >
                   Recargar Perfil
                 </Button>
                 <Button
                   size="sm"
                   color="danger"
                   variant="flat"
                   onClick={() => {
                     if (confirm('¿Desea cerrar sesión y volver a iniciar?')) {
                       window.location.href = '/auth/login'
                     }
                   }}
                 >
                   Reiniciar Sesión
                 </Button>
               </div>
            </CardBody>
          </Card>
        )}

        {/* Contenido compacto */}
        <div className="space-y-6">
          {/* Configuraciones de Usuario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Idioma */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-gray-50 to-gray-100">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Globe className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{t('settings.language')}</h3>
                      <p className="text-sm text-gray-500">Idioma de la interfaz</p>
                    </div>
                  </div>
                  <div className="min-w-[140px]">
                    <Select
                      size="md"
                      variant="bordered"
                      selectedKeys={[locale]}
                      onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0] as Locale
                        if (selectedKey) handleLanguageChange(selectedKey)
                      }}
                      classNames={{
                        trigger: "border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500",
                        value: "text-gray-700 font-medium",
                        listbox: "bg-white shadow-lg",
                        popoverContent: "bg-white shadow-xl border border-gray-200"
                      }}
                    >
                      {SUPPORTED_LOCALES.map(locale => (
                        <SelectItem 
                          key={locale}
                          className="text-gray-700 hover:bg-gray-50"
                        >
                          {LOCALE_NAMES[locale].native}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Moneda */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-gray-50 to-gray-100">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{t('settings.currency')}</h3>
                      <p className="text-sm text-gray-500">Moneda predeterminada</p>
                    </div>
                  </div>
                  <div className="min-w-[140px]">
                    <Select
                      size="md"
                      variant="bordered"
                      selectedKeys={currency ? [currency] : ['PEN']}
                      defaultSelectedKeys={['PEN']}
                      placeholder="Seleccionar moneda"
                      onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0] as string
                        console.log('🔄 Currency changed to:', selectedKey)
                        if (selectedKey) handleCurrencyChange(selectedKey)
                      }}
                      classNames={{
                        trigger: "border-gray-300 bg-white hover:border-gray-400 focus:border-green-500 min-h-[40px]",
                        value: "text-gray-700 font-medium",
                        listbox: "bg-white shadow-lg",
                        popoverContent: "bg-white shadow-xl border border-gray-200 rounded-lg",
                        innerWrapper: "text-gray-700"
                      }}
                    >
                      {Object.entries(CURRENCIES).map(([code, currencyInfo]) => (
                        <SelectItem 
                          key={code}
                          className="text-gray-700 hover:bg-gray-50 data-[hover=true]:bg-gray-50"
                          textValue={`${getCurrencyName(code, locale)} (${code})`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-green-600">{currencyInfo.symbol}</span>
                            <span>{getCurrencyName(code, locale)} ({code})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Logo del Local */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardBody className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-indigo-100">
                  <ImageIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Logo del Local</h3>
                  <p className="text-sm text-gray-500">Imagen que aparecerá en las impresiones</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Logo actual */}
                {!dataLoading && organizationData?.logo_url && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={organizationData.logo_url}
                      alt="Logo actual"
                      className="w-16 h-16 object-contain bg-white rounded-lg border border-gray-200"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">Logo actual</p>
                      <p className="text-xs text-gray-500">Este logo aparece en las impresiones</p>
                    </div>
                    <Button
                      color="danger"
                      variant="flat"
                      size="sm"
                      startContent={<X className="w-4 h-4" />}
                      onPress={handleRemoveLogo}
                      isLoading={logoLoading}
                    >
                      Eliminar
                    </Button>
                  </div>
                )}

                {/* Preview del archivo seleccionado */}
                {previewUrl && (
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <img
                      src={previewUrl}
                      alt="Vista previa"
                      className="w-16 h-16 object-contain bg-white rounded-lg border border-blue-200"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800">Vista previa</p>
                      <p className="text-xs text-blue-600">
                        {selectedFile?.name} ({Math.round((selectedFile?.size || 0) / 1024)} KB)
                      </p>
                    </div>
                    <Button
                      color="default"
                      variant="flat"
                      size="sm"
                      startContent={<X className="w-4 h-4" />}
                      onPress={clearPreview}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}

                {/* Selector de archivo */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      variant="bordered"
                      classNames={{
                        label: "text-gray-700",
                        inputWrapper: "border-gray-300 hover:border-gray-400 focus-within:border-indigo-500"
                      }}
                    />
                  </div>
                  
                  {selectedFile && (
                    <Button
                      color="primary"
                      variant="solid"
                      startContent={<Upload className="w-4 h-4" />}
                      onPress={handleUploadLogo}
                      isLoading={logoLoading}
                      className="bg-gradient-to-r from-[#4ca771] to-[#013237] text-white hover:from-[#013237] hover:to-[#4ca771] transition-all font-semibold"
                    >
                      {logoLoading ? 'Subiendo...' : 'Subir Logo'}
                    </Button>
                  )}
                </div>

                {/* Mensajes de error y éxito */}
                {logoError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">Error</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">{logoError}</p>
                  </div>
                )}

                {logoSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Éxito</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">{logoSuccess}</p>
                  </div>
                )}

                {/* Información adicional */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">Recomendaciones:</p>
                      <ul className="text-xs space-y-1">
                        <li>• Tamaño recomendado: 200x200 píxeles</li>
                        <li>• Formato: JPG, PNG, GIF o WEBP</li>
                        <li>• Tamaño máximo: 5MB</li>
                        <li>• Fondo transparente para mejor presentación</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Identificación Tributaria */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardBody className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-cyan-100">
                  <FileText className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Identificación Tributaria</h3>
                  <p className="text-sm text-gray-500">Información fiscal para comprobantes</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Selector de país */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      País
                    </label>
                    <Select
                      size="md"
                      variant="bordered"
                      selectedKeys={[selectedCountry]}
                      onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0] as CountryCode
                        if (selectedKey) {
                          setSelectedCountry(selectedKey)
                          setTaxIdValue('') // Limpiar el valor cuando cambie el país
                        }
                      }}
                      startContent={<MapPin className="w-4 h-4 text-gray-400" />}
                      classNames={{
                        trigger: "border-gray-300 bg-white hover:border-gray-400 focus:border-cyan-500",
                        value: "text-gray-700 font-medium",
                        listbox: "bg-white shadow-lg",
                        popoverContent: "bg-white shadow-xl border border-gray-200"
                      }}
                    >
                      {getAllCountries().map(country => (
                        <SelectItem 
                          key={country.code}
                          className="text-gray-700 hover:bg-gray-50"
                        >
                          {formatCountryOption(country.code)}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  {/* Número de identificación tributaria */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {getTaxIdType(selectedCountry)} {organizationData?.tax_id && organizationData.tax_id.trim() !== '' ? '(Opcional)' : '(Opcional)'}
                    </label>
                    <Input
                      type="text"
                      placeholder={`Ejemplo: ${getTaxIdDescription(selectedCountry).replace('Formato: ', '')}`}
                      value={taxIdValue}
                      onChange={(e) => setTaxIdValue(e.target.value)}
                      variant="bordered"
                      startContent={<FileText className="w-4 h-4 text-gray-400" />}
                      classNames={{
                        label: "text-gray-700",
                        input: "text-gray-900",
                        inputWrapper: "border-gray-300 hover:border-gray-400 focus-within:border-cyan-500"
                      }}
                    />
                  </div>
                </div>

                {/* Información del tipo de identificación */}
                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-cyan-600 mt-0.5" />
                    <div className="text-sm text-cyan-800">
                      <p className="font-medium mb-1">Información sobre {getTaxIdType(selectedCountry)}:</p>
                      <p className="text-xs">{getTaxIdFullName(selectedCountry)}</p>
                      <p className="text-xs">{getTaxIdDescription(selectedCountry)}</p>
                      <p className="text-xs mt-1">Esta información aparecerá en los comprobantes de reparación, cotización y venta.</p>
                    </div>
                  </div>
                </div>

                {/* Botón de guardar */}
                <div className="flex justify-end">
                  <Button
                    color="primary"
                    variant="solid"
                    startContent={<CheckCircle className="w-4 h-4" />}
                    onPress={handleUpdateTaxId}
                    isLoading={taxIdLoading}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 transition-all font-semibold"
                  >
                    {taxIdLoading ? 'Guardando...' : 'Guardar Información'}
                  </Button>
                </div>

                {/* Mensajes de error y éxito */}
                {taxIdError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">Error</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">{taxIdError}</p>
                  </div>
                )}

                {taxIdSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Éxito</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">{taxIdSuccess}</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Seguridad - Cambio de Contraseña */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardBody className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-red-100">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Seguridad</h3>
                  <p className="text-sm text-gray-500">Cambiar contraseña de acceso</p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nueva Contraseña"
                    placeholder="Ingresa tu nueva contraseña"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    variant="bordered"
                    isRequired
                    minLength={6}
                    classNames={{
                      label: "text-gray-700",
                      input: "text-gray-900",
                      inputWrapper: "border-gray-300 hover:border-gray-400 focus-within:border-red-500"
                    }}
                    endContent={
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="focus:outline-none"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    }
                  />
                  
                  <Input
                    label="Confirmar Contraseña"
                    placeholder="Confirma tu nueva contraseña"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    variant="bordered"
                    isRequired
                    minLength={6}
                    classNames={{
                      label: "text-gray-700",
                      input: "text-gray-900",
                      inputWrapper: "border-gray-300 hover:border-gray-400 focus-within:border-red-500"
                    }}
                    endContent={
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="focus:outline-none"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    }
                  />
                </div>

                {/* Mensajes de error y éxito */}
                {passwordError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">Error</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">{passwordError}</p>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Éxito</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">{passwordSuccess}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="submit"
                    color="danger"
                    variant="solid"
                    isLoading={passwordLoading}
                    startContent={!passwordLoading ? <Shield className="w-4 h-4" /> : undefined}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {passwordLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => {
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      })
                      setPasswordError(null)
                      setPasswordSuccess(null)
                    }}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Limpiar
                  </Button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">Recomendaciones de seguridad:</p>
                      <ul className="text-xs space-y-1">
                        <li>• Usa al menos 8 caracteres</li>
                        <li>• Incluye números y símbolos</li>
                        <li>• No uses información personal</li>
                        <li>• Cambia tu contraseña regularmente</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </form>
            </CardBody>
          </Card>

          {/* Información de la Organización */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardBody className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Building className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{t('settings.organization')}</h3>
                  {dataLoading ? (
                    <Skeleton className="h-4 w-32 rounded mt-1" />
                  ) : organizationData ? (
                    <p className="text-sm text-gray-500">{organizationData.name}</p>
                  ) : null}
                </div>
              </div>
              
              {!dataLoading && organizationData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        <span className="font-medium">Email:</span> {organizationData.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 text-gray-400">📞</span>
                      <span className="text-sm text-gray-600">
                        <span className="font-medium">Teléfono:</span> {organizationData.phone || 'No especificado'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 text-gray-400 mt-0.5">📍</span>
                      <span className="text-sm text-gray-600">
                        <span className="font-medium">Dirección:</span> {organizationData.address || 'No especificada'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        <span className="font-medium">Registro:</span> {formatDate(organizationData.created_at).split(',')[0]}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Información de Suscripción */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100">
                    <CreditCard className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{t('settings.subscription')}</h3>
                    <p className="text-sm text-gray-500">Plan y estado de suscripción</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {dataLoading ? (
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                  ) : organizationData ? (
                    <>
                      <Chip 
                        color={getSubscriptionColor(organizationData.subscription_status) as any} 
                        variant="flat"
                        size="md"
                        className="font-medium"
                      >
                        {organizationData.subscription_status === 'active' ? t('settings.active') : 
                         organizationData.subscription_status === 'inactive' ? t('settings.inactive') : t('settings.expired')}
                      </Chip>
                      <Chip 
                        color="primary" 
                        variant="solid"
                        size="md"
                        className="font-medium text-white bg-blue-600 border-blue-600"
                      >
                        {getSubscriptionLabel(organizationData.subscription_plan)}
                      </Chip>
                    </>
                  ) : error ? (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  ) : null}
                </div>
              </div>
              
              {!dataLoading && organizationData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">Usuarios</div>
                    <div className="text-lg font-semibold text-blue-700">{organizationData.max_users}</div>
                    <div className="text-xs text-blue-500">Máximo permitido</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-xs text-green-600 font-medium uppercase tracking-wide">Dispositivos</div>
                    <div className="text-lg font-semibold text-green-700">{organizationData.max_devices}</div>
                    <div className="text-xs text-green-500">Máximo permitido</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-xs text-purple-600 font-medium uppercase tracking-wide">Inicio</div>
                    <div className="text-sm font-semibold text-purple-700">
                      {organizationData.subscription_start_date ? formatDate(organizationData.subscription_start_date).split(',')[0] : 'No configurado'}
                    </div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="text-xs text-orange-600 font-medium uppercase tracking-wide">Vencimiento</div>
                    <div className="text-sm font-semibold text-orange-700">
                      {organizationData.subscription_end_date ? formatDate(organizationData.subscription_end_date).split(',')[0] : 'No configurado'}
                    </div>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Perfil del Propietario */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{t('settings.ownerProfile')}</h3>
                    <p className="text-sm text-gray-500">Información del propietario</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {dataLoading ? (
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <Skeleton className="h-4 w-24 rounded" />
                    </div>
                  ) : userProfile ? (
                    <>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-800">{userProfile.name}</div>
                        <div className="text-sm text-gray-500">{userProfile.email}</div>
                      </div>
                      <Avatar
                        name={userProfile.name}
                        size="lg"
                        classNames={{
                          base: "bg-gradient-to-br from-indigo-400 to-purple-600 text-white",
                          icon: "text-white"
                        }}
                      />
                      <Chip 
                        color="secondary" 
                        variant="flat" 
                        size="md"
                        className="font-medium"
                      >
                        {userProfile.role === 'owner' ? t('settings.owner') : 
                         userProfile.role === 'technician' ? t('settings.technician') : userProfile.role}
                      </Chip>
                    </>
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
} 