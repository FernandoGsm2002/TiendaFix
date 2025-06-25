'use client'

import { useState, useEffect } from 'react'
import type { Locale } from '@/lib/utils/i18n'

// Función para cargar traducciones dinámicamente
async function loadMessages(locale: Locale) {
  try {
    const messages = await import(`../../messages/${locale}.json`)
    return messages.default
  } catch (error) {
    console.warn(`No se pudieron cargar las traducciones para ${locale}, usando español por defecto`)
    const fallback = await import('../../messages/es.json')
    return fallback.default
  }
}

// Función para obtener valor anidado del objeto de traducciones
function getNestedValue(obj: any, key: string): string {
  return key.split('.').reduce((o, k) => o?.[k], obj) || key
}

export function useTranslations() {
  const [locale, setLocale] = useState<Locale>('es')
  const [messages, setMessages] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Cargar idioma guardado del localStorage
    const savedLocale = localStorage.getItem('locale') as Locale || 'es'
    setLocale(savedLocale)
    
    // Cargar traducciones
    loadMessages(savedLocale).then(msgs => {
      setMessages(msgs)
      setLoading(false)
    })
  }, [])

  const t = (key: string, variables?: Record<string, string | number>): string => {
    if (loading) return key
    
    let translation = getNestedValue(messages, key)
    
    // Reemplazar variables en la traducción
    if (variables && typeof translation === 'string') {
      Object.entries(variables).forEach(([varKey, value]) => {
        translation = translation.replace(`{{${varKey}}}`, String(value))
      })
    }
    
    return translation
  }

  const changeLanguage = async (newLocale: Locale) => {
    setLoading(true)
    setLocale(newLocale)
    localStorage.setItem('locale', newLocale)
    
    const newMessages = await loadMessages(newLocale)
    setMessages(newMessages)
    setLoading(false)
  }

  return {
    t,
    locale,
    changeLanguage,
    loading
  }
}

// Hook específico para configuración de moneda
export function useCurrency() {
  const [currency, setCurrency] = useState('PEN')

  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency') || 'PEN'
    setCurrency(savedCurrency)
  }, [])

  const changeCurrency = (newCurrency: string) => {
    setCurrency(newCurrency)
    localStorage.setItem('currency', newCurrency)
  }

  return {
    currency,
    changeCurrency
  }
} 