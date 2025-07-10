'use client'

import { useState, useEffect, useCallback } from 'react'

// Breakpoints modernos consistentes con diseño de apps profesionales
const breakpoints = {
  xs: 0,      // Mobile portrait
  sm: 640,    // Mobile landscape / Small tablet
  md: 768,    // Tablet portrait
  lg: 1024,   // Tablet landscape / Small desktop
  xl: 1280,   // Desktop
  '2xl': 1536, // Large desktop
  '3xl': 1920, // Ultra-wide
} as const

export type Breakpoint = keyof typeof breakpoints
export type BreakpointValues = typeof breakpoints

// Hook principal para detección inteligente de breakpoints
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('md')
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [isClient, setIsClient] = useState(false)

  const updateBreakpoint = useCallback(() => {
    if (typeof window === 'undefined') return

    const width = window.innerWidth
    const height = window.innerHeight
    
    setWindowSize({ width, height })

    // Determinar breakpoint actual con lógica optimizada
    let newBreakpoint: Breakpoint = 'xs'
    
    if (width >= breakpoints['3xl']) newBreakpoint = '3xl'
    else if (width >= breakpoints['2xl']) newBreakpoint = '2xl'
    else if (width >= breakpoints.xl) newBreakpoint = 'xl'
    else if (width >= breakpoints.lg) newBreakpoint = 'lg'
    else if (width >= breakpoints.md) newBreakpoint = 'md'
    else if (width >= breakpoints.sm) newBreakpoint = 'sm'
    else newBreakpoint = 'xs'

    setBreakpoint(newBreakpoint)
  }, [])

  useEffect(() => {
    setIsClient(true)
    updateBreakpoint()

    // Optimizar listener con throttle para mejor performance
    let timeoutId: NodeJS.Timeout
    const throttledUpdate = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updateBreakpoint, 100)
    }

    window.addEventListener('resize', throttledUpdate)
    window.addEventListener('orientationchange', throttledUpdate)
    
    return () => {
      window.removeEventListener('resize', throttledUpdate)
      window.removeEventListener('orientationchange', throttledUpdate)
      clearTimeout(timeoutId)
    }
  }, [updateBreakpoint])

  // Computed properties para uso fácil
  const isMobile = breakpoint === 'xs' || breakpoint === 'sm'
  const isTablet = breakpoint === 'md'
  const isDesktop = breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl' || breakpoint === '3xl'
  const isLargeScreen = breakpoint === 'xl' || breakpoint === '2xl' || breakpoint === '3xl'
  const isUltraWide = breakpoint === '3xl'

  return {
    breakpoint,
    windowSize,
    isClient,
    isMobile,
    isTablet, 
    isDesktop,
    isLargeScreen,
    isUltraWide,
    // Utilidades adicionales
    width: windowSize.width,
    height: windowSize.height,
    aspectRatio: windowSize.width / windowSize.height,
  }
}

// Hook para verificar breakpoint específico o mayor
export function useBreakpointUp(targetBreakpoint: Breakpoint) {
  const { breakpoint } = useBreakpoint()
  return breakpoints[breakpoint] >= breakpoints[targetBreakpoint]
}

// Hook para verificar breakpoint específico o menor  
export function useBreakpointDown(targetBreakpoint: Breakpoint) {
  const { breakpoint } = useBreakpoint()
  return breakpoints[breakpoint] <= breakpoints[targetBreakpoint]
}

// Hook para verificar rango entre breakpoints
export function useBreakpointBetween(min: Breakpoint, max: Breakpoint) {
  const { breakpoint } = useBreakpoint()
  const current = breakpoints[breakpoint]
  return current >= breakpoints[min] && current <= breakpoints[max]
}

// Hook para orientación del dispositivo
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const { windowSize } = useBreakpoint()

  useEffect(() => {
    const newOrientation = windowSize.height > windowSize.width ? 'portrait' : 'landscape'
    setOrientation(newOrientation)
  }, [windowSize])

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
  }
}

// Hook para detectar dispositivo táctil
export function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      )
    }
    
    checkTouch()
    window.addEventListener('resize', checkTouch)
    
    return () => window.removeEventListener('resize', checkTouch)
  }, [])

  return isTouchDevice
}

// Hook para detectar preferencias del usuario
export function useUserPreferences() {
  const [preferences, setPreferences] = useState({
    reducedMotion: false,
    highContrast: false,
    darkMode: false,
  })

  useEffect(() => {
    const updatePreferences = () => {
      setPreferences({
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        highContrast: window.matchMedia('(prefers-contrast: high)').matches,
        darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      })
    }

    updatePreferences()

    // Listeners para cambios en preferencias
    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(prefers-color-scheme: dark)'),
    ]

    mediaQueries.forEach(mq => {
      mq.addEventListener('change', updatePreferences)
    })

    return () => {
      mediaQueries.forEach(mq => {
        mq.removeEventListener('change', updatePreferences)
      })
    }
  }, [])

  return preferences
} 