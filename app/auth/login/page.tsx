'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { 
  Card, 
  CardBody, 
  Button, 
  Input,
  Link as HeroLink,
  Divider
} from '@heroui/react'
import { Eye, EyeOff, ArrowLeft, Lock, Mail, Settings } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('🔐 Attempting login with:', { email: email, passwordLength: password.length })
    
    if (!email || !password) {
      setError('Por favor completa todos los campos')
      setLoading(false)
      return
    }

    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        console.error('❌ Login error:', error)
        setError(`Error de autenticación: ${error.message}`)
        setLoading(false)
      } else {
        console.log('✅ Login successful, redirecting...')
        // Pequeño delay para asegurar que la autenticación se procese
        setTimeout(() => {
          router.push('/dashboard')
        }, 100)
      }
    } catch (err) {
      console.error('💥 Unexpected error:', err)
      setError('Error inesperado al iniciar sesión. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  const fillDemoCredentials = () => {
    setEmail('admin@demo.com')
    setPassword('demo123')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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

        <Card className="shadow-2xl border-0">
          <CardBody className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido</h1>
              <p className="text-gray-600">Accede a tu cuenta de TiendaFix</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Card className="bg-danger-50 border border-danger-200">
                  <CardBody className="p-3">
                    <p className="text-danger-600 text-sm">{error}</p>
                  </CardBody>
                </Card>
              )}

              <Input
                type="email"
                label="Correo electrónico"
                placeholder="Ingresa tu email"
                value={email}
                onValueChange={setEmail}
                startContent={<Mail className="w-4 h-4 text-gray-400" />}
                variant="bordered"
                size="lg"
                isRequired
                classNames={{
                  label: "text-gray-700 font-medium",
                  input: "text-gray-900",
                  inputWrapper: "border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                }}
              />

              <Input
                type={showPassword ? 'text' : 'password'}
                label="Contraseña"
                placeholder="Ingresa tu contraseña"
                value={password}
                onValueChange={setPassword}
                startContent={<Lock className="w-4 h-4 text-gray-400" />}
                endContent={
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                variant="bordered"
                size="lg"
                isRequired
                classNames={{
                  label: "text-gray-700 font-medium",
                  input: "text-gray-900",
                  inputWrapper: "border-gray-300 hover:border-blue-400 focus-within:border-blue-500"
                }}
              />

              <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                isLoading={loading}
                isDisabled={!email || !password}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            <Divider className="my-6" />

            <div className="text-center">
              <p className="text-gray-600 mb-4">
                ¿No tienes una cuenta?
              </p>
              <Link href="/auth/register">
                <Button
                  variant="flat"
                  color="primary"
                  className="font-medium"
                >
                  Registra tu tienda
                </Button>
              </Link>
            </div>

            <Divider className="my-6" />

            {/* Botón sutil para llenar credenciales de demo */}
            <div className="text-center">
              <Button
                variant="light"
                size="sm"
                startContent={<Settings className="w-4 h-4" />}
                onClick={fillDemoCredentials}
                className="text-gray-500 hover:text-gray-700 text-xs"
              >
                Modo Demo
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
} 