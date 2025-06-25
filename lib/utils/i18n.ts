export const SUPPORTED_LOCALES = ['es', 'en', 'pt'] as const
export type Locale = typeof SUPPORTED_LOCALES[number]

export const LOCALE_NAMES: Record<Locale, { native: string; english: string }> = {
  es: { native: 'Español', english: 'Spanish' },
  en: { native: 'English', english: 'English' },
  pt: { native: 'Português', english: 'Portuguese' }
}

export const DEFAULT_LOCALE: Locale = 'es'

// Detección automática de idioma del navegador
export function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  
  const browserLang = navigator.language.split('-')[0] as Locale
  return SUPPORTED_LOCALES.includes(browserLang) ? browserLang : DEFAULT_LOCALE
}

// Configuración de fecha según idioma
export function getDateLocale(locale: Locale): string {
  const locales: Record<Locale, string> = {
    es: 'es-ES',
    en: 'en-US', 
    pt: 'pt-BR'
  }
  return locales[locale]
}

// Formatear fecha según idioma
export function formatDate(date: string | Date, locale: Locale = DEFAULT_LOCALE): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) return ''
  
  return new Intl.DateTimeFormat(getDateLocale(locale), {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(dateObj)
}

// Formatear fecha y hora según idioma
export function formatDateTime(date: string | Date, locale: Locale = DEFAULT_LOCALE): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) return ''
  
  return new Intl.DateTimeFormat(getDateLocale(locale), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj)
} 