'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { 
  Card, 
  CardBody, 
  Button, 
  Input,
  Divider,
  Progress,
  Image
} from '@heroui/react'
import { 
  Eye, EyeOff, ArrowLeft, Lock, Mail, CheckCircle
} from 'lucide-react'
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

    // Interceptar login demo
    if (email === 'demo' && password === 'demo') {
      console.log('✅ Demo login detected, redirecting to demo dashboard...')
      setTimeout(() => {
        router.push('/dashboard/demo')
      }, 100)
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
    setEmail('demo')
    setPassword('demo')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
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

        <Card className="shadow-xl border-0 bg-white">
          <CardBody className="p-8">
            {/* Header simple y profesional */}
            <div className="text-center mb-8">
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
                Iniciar Sesión
              </h1>
              <p className="text-gray-600">
                Accede a tu cuenta de TiendaFix
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Card className="bg-red-50 border border-red-200">
                  <CardBody className="p-4">
                    <p className="text-red-600 text-sm">{error}</p>
                  </CardBody>
                </Card>
              )}

              <Input
                type="text"
                label="Usuario o Email"
                placeholder="Ingresa tu usuario o email"
                value={email}
                onValueChange={setEmail}
                startContent={<Mail className="w-4 h-4 text-gray-400" />}
                variant="bordered"
                size="lg"
                isRequired
                classNames={{
                  input: "text-gray-900",
                  inputWrapper: "border-gray-300 focus-within:border-gray-600"
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
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                variant="bordered"
                size="lg"
                isRequired
                classNames={{
                  input: "text-gray-900",
                  inputWrapper: "border-gray-300 focus-within:border-gray-600"
                }}
              />

              {loading && (
                <Progress 
                  size="sm"
                  isIndeterminate 
                  color="default"
                  className="max-w-md"
                />
              )}

              <Button
                type="submit"
                color="default"
                size="lg"
                className="w-full font-semibold bg-gray-900 text-white hover:bg-gray-800"
                isLoading={loading}
                isDisabled={!email || !password}
                endContent={!loading && <CheckCircle className="w-4 h-4" />}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            {/* Enlace para recuperar contraseña */}
            <div className="mt-4 text-center">
              <Link href="/auth/reset-password">
                <span className="text-sm text-gray-600 hover:text-gray-900 underline cursor-pointer">
                  ¿Olvidaste tu contraseña?
                </span>
              </Link>
            </div>

            <Divider className="my-6" />

            {/* Sección de registro simple */}
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                ¿No tienes una cuenta?
              </p>
              <Link href="/auth/register">
                <Button
                  variant="flat"
                  color="default"
                  className="font-medium bg-gray-100 text-gray-900 hover:bg-gray-200"
                >
                  Registrar Nueva Tienda
                </Button>
              </Link>
            </div>

            <Divider className="my-4" />

            {/* Demo simple */}
            <div className="text-center">
              <Button
                variant="light"
                size="sm"
                onClick={fillDemoCredentials}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Probar Demo (demo/demo)
              </Button>
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