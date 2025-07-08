export interface Currency {
  code: string
  symbol: string
  name: string
  locale: string
  decimals: number
}

export const CURRENCIES: Record<string, Currency> = {
  PEN: {
    code: 'PEN',
    symbol: 'S/',
    name: 'Sol Peruano',
    locale: 'es-PE',
    decimals: 2
  },
  CLP: {
    code: 'CLP',
    symbol: '$',
    name: 'Peso Chileno',
    locale: 'es-CL',
    decimals: 0 // CLP generalmente no usa decimales
  },
  COP: {
    code: 'COP',
    symbol: '$',
    name: 'Peso Colombiano',
    locale: 'es-CO',
    decimals: 0 // COP generalmente no usa decimales
  },
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    name: 'Real Brasileño',
    locale: 'pt-BR',
    decimals: 2
  },
  MXN: {
    code: 'MXN',
    symbol: '$',
    name: 'Peso Mexicano',
    locale: 'es-MX',
    decimals: 2
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'Dólar Americano',
    locale: 'en-US',
    decimals: 2
  }
}

// Función para obtener la moneda configurada por el usuario
function getUserCurrency(): string {
  if (typeof window === 'undefined') return 'PEN'
  return localStorage.getItem('currency') || 'PEN'
}

export function formatCurrency(
  amount: number | null | undefined,
  currencyCode?: string,
  showSymbol: boolean = true
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0.00'
  }

  // Si no se especifica moneda, usar la configurada por el usuario
  const currency = CURRENCIES[currencyCode || getUserCurrency()] || CURRENCIES.PEN
  const finalCurrencyCode = currencyCode || getUserCurrency()
  
  try {
    // Usar Intl.NumberFormat para formateo automático según locale
    const formatter = new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: finalCurrencyCode,
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals
    })
    
    return formatter.format(amount)
  } catch (error) {
    // Fallback manual si Intl.NumberFormat falla
    const formatted = amount.toFixed(currency.decimals)
    return showSymbol ? `${currency.symbol} ${formatted}` : formatted
  }
}

export function parseCurrency(value: string, currencyCode?: string): number {
  if (!value) return 0
  
  const finalCurrencyCode = currencyCode || getUserCurrency()
  const currency = CURRENCIES[finalCurrencyCode] || CURRENCIES.PEN
  
  // Remover símbolos de moneda y espacios
  const cleaned = value
    .replace(new RegExp(`\\${currency.symbol}`, 'g'), '')
    .replace(/[^\d.,]/g, '')
    .replace(',', '.')
  
  return parseFloat(cleaned) || 0
}

export function getCurrencySymbol(currencyCode?: string): string {
  const finalCurrencyCode = currencyCode || getUserCurrency()
  return CURRENCIES[finalCurrencyCode]?.symbol || 'S/'
}

export function getCurrencyName(currencyCode?: string, locale: string = 'es'): string {
  const finalCurrencyCode = currencyCode || getUserCurrency()
  const currency = CURRENCIES[finalCurrencyCode]
  if (!currency) return 'Sol Peruano'
  
  // Traducir nombres según idioma
  const translations: Record<string, Record<string, string>> = {
    es: {
      PEN: 'Sol Peruano',
      CLP: 'Peso Chileno',
      COP: 'Peso Colombiano', 
      BRL: 'Real Brasileño',
      MXN: 'Peso Mexicano',
      USD: 'Dólar Americano'
    },
    en: {
      PEN: 'Peruvian Sol',
      CLP: 'Chilean Peso',
      COP: 'Colombian Peso',
      BRL: 'Brazilian Real', 
      MXN: 'Mexican Peso',
      USD: 'US Dollar'
    },
    pt: {
      PEN: 'Sol Peruano',
      CLP: 'Peso Chileno',
      COP: 'Peso Colombiano',
      BRL: 'Real Brasileiro',
      MXN: 'Peso Mexicano', 
      USD: 'Dólar Americano'
    }
  }
  
  return translations[locale]?.[finalCurrencyCode] || currency.name
}

// DEPRECATED: Use useCurrency from TranslationContext instead
// This hook is kept for backward compatibility but should not be used in new code
// The TranslationContext provides reactive currency updates
export function useCurrency() {
  console.warn('⚠️ DEPRECATED: useCurrency from currency.ts is deprecated. Use useCurrency from TranslationContext instead for reactive updates.')
  const currentCurrency = getUserCurrency()
  
  return {
    currency: CURRENCIES[currentCurrency],
    currencyCode: currentCurrency,
    format: (amount: number | null | undefined) => formatCurrency(amount),
    parse: (value: string) => parseCurrency(value),
    symbol: getCurrencySymbol(),
    name: getCurrencyName(),
    changeCurrency: (newCurrency: string) => {
      console.warn('⚠️ Currency change through currency.ts will not update components reactively. Use TranslationContext instead.')
      if (typeof window !== 'undefined') {
        localStorage.setItem('currency', newCurrency)
      }
    }
  }
} 