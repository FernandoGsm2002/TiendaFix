'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Spinner } from '@heroui/react'

export default function TechnicianPage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login')
        return
      }

      if (userProfile?.role !== 'technician') {
        router.push('/dashboard')
        return
      }

      // Redirigir al dashboard principal del técnico
      router.push('/dashboard/technician/dashboard')
    }
  }, [user, userProfile, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" color="primary" />
    </div>
  )
} 