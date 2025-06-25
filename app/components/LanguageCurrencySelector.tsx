'use client'

import { useState, useEffect } from 'react'
import { SUPPORTED_LOCALES, LOCALE_NAMES, type Locale } from '@/lib/utils/i18n'
import { CURRENCIES, formatCurrency } from '@/lib/utils/currency'

interface LanguageCurrencySelectorProps {
  onLanguageChange?: (locale: Locale) => void
  onCurrencyChange?: (currency: string) => void
  showCurrency?: boolean
  compact?: boolean
}

export default function LanguageCurrencySelector({
  onLanguageChange,
  onCurrencyChange,
  showCurrency = true,
  compact = false
}: LanguageCurrencySelectorProps) {
  const [currentLocale, setCurrentLocale] = useState<Locale>('es')
  const [currentCurrency, setCurrentCurrency] = useState('PEN')

  useEffect(() => {
    // Cargar configuración guardada del localStorage
    const savedLocale = localStorage.getItem('locale') as Locale
    const savedCurrency = localStorage.getItem('currency')
    
    if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
      setCurrentLocale(savedLocale)
    }
    
    if (savedCurrency && CURRENCIES[savedCurrency]) {
      setCurrentCurrency(savedCurrency)
    }
  }, [])

  const handleLanguageChange = (locale: Locale) => {
    setCurrentLocale(locale)
    localStorage.setItem('locale', locale)
    onLanguageChange?.(locale)
    
    // Recargar la página para aplicar el nuevo idioma
    window.location.reload()
  }

  const handleCurrencyChange = (currency: string) => {
    setCurrentCurrency(currency)
    localStorage.setItem('currency', currency)
    onCurrencyChange?.(currency)
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {/* Selector de idioma compacto */}
        <select
          value={currentLocale}
          onChange={(e) => handleLanguageChange(e.target.value as Locale)}
          className="text-sm border rounded px-2 py-1 bg-white"
        >
          {SUPPORTED_LOCALES.map(locale => (
            <option key={locale} value={locale}>
              {LOCALE_NAMES[locale].native}
            </option>
          ))}
        </select>

        {showCurrency && (
          <select
            value={currentCurrency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="text-sm border rounded px-2 py-1 bg-white"
          >
            {Object.entries(CURRENCIES).map(([code, currency]) => (
              <option key={code} value={code}>
                {currency.symbol} {code}
              </option>
            ))}
          </select>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Selector de idioma completo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Idioma / Language / Idioma
        </label>
        <div className="grid grid-cols-1 gap-2">
          {SUPPORTED_LOCALES.map(locale => (
            <button
              key={locale}
              onClick={() => handleLanguageChange(locale)}
              className={`
                p-3 rounded-lg border-2 text-left transition-all
                ${currentLocale === locale 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="font-medium">{LOCALE_NAMES[locale].native}</div>
              <div className="text-sm text-gray-500">{LOCALE_NAMES[locale].english}</div>
            </button>
          ))}
        </div>
      </div>

      {showCurrency && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Moneda / Currency / Moeda
          </label>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(CURRENCIES).map(([code, currency]) => (
              <button
                key={code}
                onClick={() => handleCurrencyChange(code)}
                className={`
                  p-3 rounded-lg border-2 text-left transition-all
                  ${currentCurrency === code 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{currency.name}</div>
                    <div className="text-sm text-gray-500">{code}</div>
                  </div>
                  <div className="text-lg font-bold">{currency.symbol}</div>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Ejemplo: {formatCurrency(1250.75, code)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 