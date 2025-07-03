'use client'

import { SUPPORTED_LOCALES, LOCALE_NAMES, type Locale } from '@/lib/utils/i18n'
import { CURRENCIES } from '@/lib/utils/currency'
import { useTranslations, useCurrency } from '@/lib/contexts/TranslationContext'

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
  const { locale, currency, changeLanguage, changeCurrency } = useTranslations()
  const { formatCurrency } = useCurrency()

  const handleLanguageChange = async (newLocale: Locale) => {
    await changeLanguage(newLocale)
    onLanguageChange?.(newLocale)
  }

  const handleCurrencyChange = (newCurrency: string) => {
    changeCurrency(newCurrency)
    onCurrencyChange?.(newCurrency)
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {/* Selector de idioma compacto */}
        <select
          value={locale}
          onChange={(e) => handleLanguageChange(e.target.value as Locale)}
          className="text-sm border rounded px-2 py-1 bg-white"
        >
          {SUPPORTED_LOCALES.map(localeOption => (
            <option key={localeOption} value={localeOption}>
              {LOCALE_NAMES[localeOption].native}
            </option>
          ))}
        </select>

        {showCurrency && (
          <select
            value={currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="text-sm border rounded px-2 py-1 bg-white"
          >
            {Object.entries(CURRENCIES).map(([code, currencyInfo]) => (
              <option key={code} value={code}>
                {currencyInfo.symbol} {code}
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
          {SUPPORTED_LOCALES.map(localeOption => (
            <button
              key={localeOption}
              onClick={() => handleLanguageChange(localeOption)}
              className={`
                p-3 rounded-lg border-2 text-left transition-all
                ${locale === localeOption 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="font-medium">{LOCALE_NAMES[localeOption].native}</div>
              <div className="text-sm text-gray-500">{LOCALE_NAMES[localeOption].english}</div>
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
            {Object.entries(CURRENCIES).map(([code, currencyInfo]) => (
              <button
                key={code}
                onClick={() => handleCurrencyChange(code)}
                className={`
                  p-3 rounded-lg border-2 text-left transition-all
                  ${currency === code 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{currencyInfo.name}</div>
                    <div className="text-sm text-gray-500">{code}</div>
                  </div>
                  <div className="text-lg font-bold">{currencyInfo.symbol}</div>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Ejemplo: {currency === code ? formatCurrency(1250.75) : `${currencyInfo.symbol} ${(1250.75).toLocaleString(currencyInfo.locale, { minimumFractionDigits: currencyInfo.decimals })}`}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 