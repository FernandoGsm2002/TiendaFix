'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { 
  Card, 
  CardBody, 
  Button, 
  Input,
  Image
} from '@heroui/react'
import { 
  ArrowLeft, Lock, Eye, EyeOff, CheckCircle, Shield
} from 'lucide-react'
import Link from 'next/link'

export default function ResetPasswordConfirmPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const { updatePassword, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Si no hay usuario autenticado, redirigir al login
    if (!user) {
      router.push('/auth/login')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!newPassword || !confirmPassword) {
      setError('Por favor completa todos los campos')
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    try {
      const { error } = await updatePassword(newPassword)
      
      if (error) {
        console.error('❌ Error actualizando contraseña:', error)
        setError(`Error actualizando contraseña: ${error.message}`)
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
      console.log('✅ Contraseña actualizada exitosamente')

      // Redirigir al dashboard después de 3 segundos
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)

    } catch (err) {
      console.error('❌ Error inesperado:', err)
      setError('Error inesperado. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0 bg-white">
            <CardBody className="p-8">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  ¡Contraseña actualizada!
                </h1>
                <p className="text-gray-600 mb-4">
                  Tu contraseña ha sido actualizada exitosamente
                </p>
                <p className="text-sm text-gray-500">
                  Serás redirigido al dashboard en unos segundos...
                </p>
              </div>

              <div className="space-y-4">
                <Link href="/dashboard">
                  <Button
                    color="default"
                    size="lg"
                    className="w-full font-semibold bg-gray-900 text-white hover:bg-gray-800"
                  >
                    Ir al dashboard
                  </Button>
                </Link>

                <Link href="/auth/login">
                  <Button
                    variant="flat"
                    color="default"
                    size="lg"
                    className="w-full font-medium bg-gray-100 text-gray-900 hover:bg-gray-200"
                  >
                    Volver al login
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/auth/login">
            <Button
              variant="light"
              startContent={<ArrowLeft className="w-4 h-4" />}
              className="text-gray-600 hover:text-gray-900"
            >
              Volver al login
            </Button>
          </Link>
        </div>

        <Card className="shadow-xl border-0 bg-white">
          <CardBody className="p-8">
            <div className="text-center mb-8">
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
                Nueva Contraseña
              </h1>
              <p className="text-gray-600">
                Ingresa tu nueva contraseña segura
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
                type={showPassword ? 'text' : 'password'}
                label="Nueva contraseña"
                placeholder="Ingresa tu nueva contraseña"
                value={newPassword}
                onValueChange={setNewPassword}
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

              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirmar contraseña"
                placeholder="Confirma tu nueva contraseña"
                value={confirmPassword}
                onValueChange={setConfirmPassword}
                startContent={<Shield className="w-4 h-4 text-gray-400" />}
                endContent={
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

              {newPassword && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Requisitos de la contraseña:</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li className={`flex items-center ${newPassword.length >= 6 ? 'text-green-600' : 'text-red-500'}`}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Al menos 6 caracteres
                    </li>
                    <li className={`flex items-center ${newPassword === confirmPassword && confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Las contraseñas coinciden
                    </li>
                  </ul>
                </div>
              )}

              <Button
                type="submit"
                color="default"
                size="lg"
                className="w-full font-semibold bg-gray-900 text-white hover:bg-gray-800"
                isLoading={loading}
                isDisabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
                endContent={!loading && <Shield className="w-4 h-4" />}
              >
                {loading ? 'Actualizando...' : 'Actualizar contraseña'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                ¿Recordaste tu contraseña?{' '}
                <Link href="/auth/login" className="font-medium text-gray-900 hover:text-gray-700 underline">
                  Volver al login
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
} 