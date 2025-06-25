'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { waitForConnection } from '@/lib/supabase/health-check'

export default function ReconnectPage() {
  const router = useRouter()

  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await waitForConnection()
      if (isConnected) {
        router.back()
      }
    }

    checkConnection()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Reconectando...
        </h1>
        <p className="text-gray-600 mb-4">
          Estamos intentando restablecer la conexión con el servidor.
        </p>
        <p className="text-sm text-gray-500">
          Si el problema persiste, por favor verifica tu conexión a internet.
        </p>
      </div>
    </div>
  )
} 