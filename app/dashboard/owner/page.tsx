'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OwnerPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir automáticamente al dashboard
    router.push('/dashboard/owner/dashboard')
  }, [router])

  return null
} 