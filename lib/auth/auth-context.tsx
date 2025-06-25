'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, userData: SignUpData) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  isSuperAdmin: boolean
  isOwner: boolean
  isTechnician: boolean
}

interface UserProfile {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'owner' | 'technician'
  organization_id: string | null
  organization_name?: string
}

interface SignUpData {
  name: string
  organizationName: string
  organizationSlug: string
  phone?: string
  address?: string
  subscriptionPlan: 'monthly_3' | 'monthly_6' | 'yearly'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Verificar si es super admin
  const isSuperAdmin = userProfile?.role === 'super_admin' || 
    user?.email === 'fernandoapple2002@gmail.com'

  const isOwner = userProfile?.role === 'owner'
  const isTechnician = userProfile?.role === 'technician'

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await fetchUserProfile(session.user.id, session.user.email || '')
      }
      setLoading(false)
    }

    getInitialSession()

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await fetchUserProfile(session.user.id, session.user.email || '')
        } else {
          setUser(null)
          setUserProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      console.log('🔍 Fetching user profile for:', email)
      
      // Usar API route para obtener perfil
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          authUserId: userId,
          email: email
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ Error fetching profile:', result.error)
        return
      }

      console.log('✅ Profile loaded:', result.data.role)
      setUserProfile(result.data)

    } catch (error) {
      console.error('❌ Error fetching user profile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  }

  const signUp = async (email: string, password: string, userData: SignUpData) => {
    try {
      console.log('🔄 Starting signup process...')
      console.log('Email:', email)
      console.log('Organization data:', userData)

      // Usar la API directamente para evitar problemas de RLS
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: userData.organizationName,
          slug: userData.organizationSlug,
          email: email,
          phone: userData.phone || '',
          address: userData.address || '',
          owner_name: userData.name,
          owner_email: email,
          owner_phone: userData.phone || '',
          owner_password_hash: password,
          subscription_plan: userData.subscriptionPlan,
          status: 'pending'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('❌ Error creating organization request:', result.error)
        return { error: { message: result.error } as any }
      }

      console.log('✅ Organization request created successfully:', result.data.id)
      
      return { error: null }
    } catch (error) {
      console.error('❌ Signup error:', error)
      return { error: error as AuthError }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setUserProfile(null)
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    isSuperAdmin,
    isOwner,
    isTechnician
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 