'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Locale } from '@/lib/utils/i18n'
import { SUPPORTED_LOCALES } from '@/lib/utils/i18n'
import { CURRENCIES, type Currency } from '@/lib/utils/currency'

interface TranslationContextType {
  locale: Locale
  currency: string
  currencyInfo: Currency
  messages: any
  t: (key: string, variables?: Record<string, string | number>) => string
  formatCurrency: (amount: number | null | undefined, showSymbol?: boolean) => string
  getCurrencySymbol: () => string
  getCurrencyName: (locale?: string) => string
  changeLanguage: (newLocale: Locale) => Promise<void>
  changeCurrency: (newCurrency: string) => void
  loading: boolean
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

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

interface TranslationProviderProps {
  children: ReactNode
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const [locale, setLocale] = useState<Locale>('es')
  const [currency, setCurrency] = useState('PEN')
  const [messages, setMessages] = useState<any>({})
  const [loading, setLoading] = useState(true)

  // Inicializar desde localStorage
  useEffect(() => {
    const initializeSettings = async () => {
      // Cargar idioma guardado
      const savedLocale = localStorage.getItem('locale') as Locale
      const initialLocale = savedLocale && SUPPORTED_LOCALES.includes(savedLocale) ? savedLocale : 'es'
      
      // Cargar moneda guardada
      const savedCurrency = localStorage.getItem('currency')
      const initialCurrency = savedCurrency && CURRENCIES[savedCurrency] ? savedCurrency : 'PEN'
      
      setLocale(initialLocale)
      setCurrency(initialCurrency)
      
      // Cargar traducciones
      const initialMessages = await loadMessages(initialLocale)
      setMessages(initialMessages)
      setLoading(false)
    }

    initializeSettings()
  }, [])

  const t = (key: string, variables?: Record<string, string | number>): string => {
    if (loading) return key
    
    let translation = getNestedValue(messages, key)
    
    if (variables && typeof translation === 'string') {
      // Reemplazo de plurales (ICU-like)
      const pluralRegex = /\{(\w+),\s*plural,\s*(=1\s*\{([^}]+)\}|one\s*\{([^}]+)\})\s*other\s*\{([^}]+)\}\}/g;
      translation = translation.replace(pluralRegex, (match, varKey, p1, singleForm, p2, pluralForm) => {
        const count = Number(variables[varKey]);
        if (count === 1) {
          return singleForm || p2; // Soporta "=1" y "one"
        }
        return pluralForm.replace('#', String(count));
      });

      // Reemplazo de variables simples
      Object.entries(variables).forEach(([varKey, value]) => {
        translation = translation.replace(new RegExp(`\\{\\{${varKey}\\}\\}`, 'g'), String(value))
      })
    }
    
    return translation || key
  }

  const changeLanguage = async (newLocale: Locale) => {
    setLoading(true)
    setLocale(newLocale)
    localStorage.setItem('locale', newLocale)
    
    // Cargar nuevas traducciones
    const newMessages = await loadMessages(newLocale)
    setMessages(newMessages)
    setLoading(false)
    
    // Actualizar el atributo lang del HTML
    document.documentElement.lang = newLocale
  }

  const changeCurrency = (newCurrency: string) => {
    setCurrency(newCurrency)
    localStorage.setItem('currency', newCurrency)
  }

  // Funciones de moneda
  const currencyInfo = CURRENCIES[currency] || CURRENCIES.PEN

  const formatCurrency = (amount: number | null | undefined, showSymbol: boolean = true): string => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '0.00'
    }

    try {
      // Usar Intl.NumberFormat para formateo automático según locale
      const formatter = new Intl.NumberFormat(currencyInfo.locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: currencyInfo.decimals,
        maximumFractionDigits: currencyInfo.decimals
      })
      
      return formatter.format(amount)
    } catch (error) {
      // Fallback manual si Intl.NumberFormat falla
      const formatted = amount.toFixed(currencyInfo.decimals)
      return showSymbol ? `${currencyInfo.symbol} ${formatted}` : formatted
    }
  }

  const getCurrencySymbol = (): string => {
    return currencyInfo.symbol
  }

  const getCurrencyName = (targetLocale?: string): string => {
    const nameLocale = targetLocale || locale
    
    // Traducir nombres según idioma
    const translations: Record<string, Record<string, string>> = {
      es: {
        PEN: 'Sol Peruano',
        CLP: 'Peso Chileno',
        COP: 'Peso Colombiano', 
        BRL: 'Real Brasileño',
        MXN: 'Peso Mexicano',
        USD: 'Dólar Americano',
        CRC: 'Colón Costarricense'
      },
      en: {
        PEN: 'Peruvian Sol',
        CLP: 'Chilean Peso',
        COP: 'Colombian Peso',
        BRL: 'Brazilian Real', 
        MXN: 'Mexican Peso',
        USD: 'US Dollar',
        CRC: 'Costa Rican Colón'
      },
      pt: {
        PEN: 'Sol Peruano',
        CLP: 'Peso Chileno',
        COP: 'Peso Colombiano',
        BRL: 'Real Brasileiro',
        MXN: 'Peso Mexicano', 
        USD: 'Dólar Americano',
        CRC: 'Colón Costa-riquenho'
      }
    }
    
    return translations[nameLocale]?.[currency] || currencyInfo.name
  }

  const value: TranslationContextType = {
    locale,
    currency,
    currencyInfo,
    messages,
    t,
    formatCurrency,
    getCurrencySymbol,
    getCurrencyName,
    changeLanguage,
    changeCurrency,
    loading
  }

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}

// Hook para usar el contexto de traducciones
export function useTranslations() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error('useTranslations debe usarse dentro de un TranslationProvider')
  }
  return context
}

// Hook para usar solo las funciones de moneda
export function useCurrency() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error('useCurrency debe usarse dentro de un TranslationProvider')
  }
  return {
    currency: context.currencyInfo,
    currencyCode: context.currency,
    format: context.formatCurrency,
    formatCurrency: context.formatCurrency,
    symbol: context.getCurrencySymbol(),
    name: context.getCurrencyName(),
    changeCurrency: context.changeCurrency
  }
} 