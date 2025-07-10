'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Card, 
  CardBody, 
  Button, 
  Input,
  Image
} from '@heroui/react'
import { 
  ArrowLeft, Mail, CheckCircle, Send
} from 'lucide-react'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!email) {
      setError('Por favor ingresa tu email')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Error enviando email de recuperación')
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
      console.log('✅ Email de recuperación enviado exitosamente')

    } catch (err) {
      console.error('❌ Error enviando email de recuperación:', err)
      setError('Error inesperado. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  if (success) {
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
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  ¡Email enviado!
                </h1>
                <p className="text-gray-600 mb-4">
                  Hemos enviado un enlace de recuperación a <strong>{email}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  Revisa tu bandeja de entrada y haz clic en el enlace para restablecer tu contraseña.
                </p>
              </div>

              <div className="space-y-4">
                <Link href="/auth/login">
                  <Button
                    color="default"
                    size="lg"
                    className="w-full font-semibold bg-gray-900 text-white hover:bg-gray-800"
                  >
                    Volver al login
                  </Button>
                </Link>

                <Button
                  variant="flat"
                  color="default"
                  size="lg"
                  className="w-full font-medium bg-gray-100 text-gray-900 hover:bg-gray-200"
                  onClick={() => {
                    setSuccess(false)
                    setEmail('')
                    setError('')
                  }}
                >
                  Enviar a otro email
                </Button>
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
                Recuperar Contraseña
              </h1>
              <p className="text-gray-600">
                Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
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
                type="email"
                label="Email"
                placeholder="Ingresa tu email"
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

              <Button
                type="submit"
                color="default"
                size="lg"
                className="w-full font-semibold bg-gray-900 text-white hover:bg-gray-800"
                isLoading={loading}
                isDisabled={!email}
                endContent={!loading && <Send className="w-4 h-4" />}
              >
                {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
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