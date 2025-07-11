import { useState, useCallback, useRef, useEffect } from 'react'

interface UseOptimizedLoadingOptions {
  /** Delay mínimo antes de mostrar loading (ms) */
  minDelay?: number
  /** Delay mínimo que debe durar el loading una vez iniciado (ms) */
  minDuration?: number
  /** Si debe mostrar skeleton en lugar de spinner básico */
  useSkeleton?: boolean
}

interface UseOptimizedLoadingReturn {
  /** Estado de loading visible al usuario */
  loading: boolean
  /** Estado de loading interno (real) */
  isLoading: boolean
  /** Función para iniciar loading */
  startLoading: () => void
  /** Función para terminar loading */
  stopLoading: () => void
  /** Función wrapper para operaciones async */
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>
}

/**
 * Hook optimizado para manejar estados de loading sin parpadeos
 * 
 * Características:
 * - Evita parpadeos en operaciones rápidas
 * - Garantiza duración mínima del loading para UX consistente
 * - Soporte para skeleton loaders
 * - Wrapper para operaciones async
 */
export function useOptimizedLoading(options: UseOptimizedLoadingOptions = {}): UseOptimizedLoadingReturn {
  const {
    minDelay = 150, // No mostrar loading si la operación dura menos de 150ms
    minDuration = 300, // Una vez mostrado, mantener al menos 300ms
    useSkeleton = false
  } = options

  const [loading, setLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const loadingStartTime = useRef<number | null>(null)
  const delayTimer = useRef<NodeJS.Timeout | null>(null)
  const durationTimer = useRef<NodeJS.Timeout | null>(null)

  // Limpiar timers al desmontar
  useEffect(() => {
    return () => {
      if (delayTimer.current) clearTimeout(delayTimer.current)
      if (durationTimer.current) clearTimeout(durationTimer.current)
    }
  }, [])

  const startLoading = useCallback(() => {
    setIsLoading(true)
    loadingStartTime.current = Date.now()

    // Delay antes de mostrar loading visual
    delayTimer.current = setTimeout(() => {
      setLoading(true)
    }, minDelay)
  }, [minDelay])

  const stopLoading = useCallback(() => {
    setIsLoading(false)

    // Limpiar delay timer si aún está pendiente
    if (delayTimer.current) {
      clearTimeout(delayTimer.current)
      delayTimer.current = null
    }

    // Calcular si necesitamos esperar para cumplir duración mínima
    if (loadingStartTime.current && loading) {
      const elapsed = Date.now() - loadingStartTime.current
      const remaining = Math.max(0, minDuration - elapsed)

      if (remaining > 0) {
        durationTimer.current = setTimeout(() => {
          setLoading(false)
          loadingStartTime.current = null
        }, remaining)
      } else {
        setLoading(false)
        loadingStartTime.current = null
      }
    } else {
      setLoading(false)
      loadingStartTime.current = null
    }
  }, [loading, minDuration])

  const withLoading = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    startLoading()
    try {
      const result = await fn()
      return result
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading])

  return {
    loading,
    isLoading,
    startLoading,
    stopLoading,
    withLoading
  }
}

/**
 * Hook simplificado para operaciones de fetch con optimización anti-parpadeo
 */
export function useOptimizedFetch<T>() {
  const { loading, withLoading } = useOptimizedLoading({
    minDelay: 200,
    minDuration: 400,
    useSkeleton: true
  })

  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (fetchFn: () => Promise<T>) => {
    setError(null)
    
    try {
      const result = await withLoading(fetchFn)
      setData(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      throw err
    }
  }, [withLoading])

  return {
    data,
    error,
    loading,
    fetchData,
    setData,
    setError
  }
}

/**
 * Hook para operaciones de mutación (create, update, delete) con loading optimizado
 */
export function useOptimizedMutation() {
  const { loading, withLoading } = useOptimizedLoading({
    minDelay: 100,
    minDuration: 500
  })

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const mutate = useCallback(async <T>(
    mutateFn: () => Promise<T>,
    successMessage?: string
  ): Promise<T> => {
    setError(null)
    setSuccess(null)

    try {
      const result = await withLoading(mutateFn)
      if (successMessage) {
        setSuccess(successMessage)
        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => setSuccess(null), 3000)
      }
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      throw err
    }
  }, [withLoading])

  return {
    loading,
    error,
    success,
    mutate,
    setError,
    setSuccess
  }
} 