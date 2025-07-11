'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Spinner } from '@heroui/react'

export default function DashboardPage() {
  const { user, userProfile, loading, isSuperAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      console.log('🔄 Dashboard redirect logic:')
      console.log('User:', user?.email)
      console.log('UserProfile:', userProfile)
      console.log('isSuperAdmin:', isSuperAdmin)
      console.log('Loading:', loading)
      
      if (!user) {
        console.log('❌ No user, redirecting to login')
        router.push('/auth/login')
        return
      }

      // Verificación específica para super admin
      if (user.email === 'admin@demo.com' || user.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
        console.log('✅ Super admin detected, redirecting to super-admin dashboard')
        router.push('/dashboard/super-admin')
        return
      }

      // Redirigir según el tipo de usuario
      if (isSuperAdmin) {
        console.log('✅ isSuperAdmin true, redirecting to super-admin')
        router.push('/dashboard/super-admin')
      } else if (userProfile?.role === 'owner') {
        console.log('✅ Owner detected, redirecting to owner dashboard')
        router.push('/dashboard/owner')
      } else if (userProfile?.role === 'technician') {
        console.log('✅ Technician detected, redirecting to technician dashboard')
        router.push('/dashboard/technician')
      } else {
        console.log('⏳ No specific role, redirecting to pending')
        // Usuario sin perfil (cuenta nueva pendiente)
        router.push('/dashboard/pending')
      }
    }
  }, [user, userProfile, loading, isSuperAdmin, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return null
} 