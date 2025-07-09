// Sistema de colores Poppins - Paleta moderna y profesional
export const colors = {
  // Colores principales Poppins - Verde profesional
  primary: {
    50: '#f0fdf9', // Verde muy claro
    100: '#eafae7', // #EAF9E7 - Fondos suaves
    200: '#d1f0cb',
    300: '#c0e6ba', // #C0E6BA - Elementos secundarios  
    400: '#86d19a',
    500: '#4ca771', // #4CA771 - Verde principal
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#013237'  // #013237 - Verde oscuro para texto
  },
  
  // Grises con mejor contraste
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280', // Para texto secundario
    600: '#4b5563', // Para texto principal
    700: '#374151', // Muy legible
    800: '#1f2937', // Excelente contraste
    900: '#111827'  // Máximo contraste
  },
  
  // Estados con mejor visibilidad
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a', // Verde legible
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706', // Naranja legible
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626', // Rojo legible
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  }
}

// Clases CSS con paleta Poppins
export const textColors = {
  // Texto principal - Verde oscuro Poppins
  primary: 'text-[#013237]',
  
  // Texto secundario - Verde medio
  secondary: 'text-[#4ca771]',
  
  // Texto terciario - Verde suave
  tertiary: 'text-gray-600',
  
  // Texto de ayuda/placeholder - Gris suave
  muted: 'text-gray-500',
  
  // Textos de estado con nueva paleta
  success: 'text-[#4ca771]',
  warning: 'text-amber-700',
  error: 'text-red-700',
  info: 'text-[#4ca771]'
}

// Fondos con texto legible
export const backgroundColors = {
  // Fondos claros con texto oscuro
  light: 'bg-white text-gray-900',
  lightGray: 'bg-gray-50 text-gray-900',
  
  // Fondos de estado con texto contrastante
  success: 'bg-green-50 text-green-800 border-green-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  
  // Fondos para tarjetas
  card: 'bg-white border border-gray-200 text-gray-900',
  cardHover: 'bg-white border border-gray-300 text-gray-900 hover:shadow-md'
}

// Labels y formularios con mejor contraste
export const formColors = {
  label: 'text-gray-800 font-medium', // Más oscuro que antes
  labelRequired: 'text-gray-800 font-medium after:content-["*"] after:text-red-600',
  
  input: 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500',
  inputError: 'border-red-300 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:ring-red-500',
  
  helpText: 'text-gray-600 text-sm', // Más oscuro que text-gray-500
  errorText: 'text-red-700 text-sm font-medium',
  
  select: 'border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500',
  
  button: {
    primary: 'bg-[#4ca771] text-white hover:bg-[#013237] border-transparent transition-colors',
    secondary: 'bg-[#eafae7] text-[#013237] hover:bg-[#c0e6ba] border-[#c0e6ba] transition-colors',
    success: 'bg-[#4ca771] text-white hover:bg-[#013237] border-transparent transition-colors',
    warning: 'bg-amber-600 text-white hover:bg-amber-700 border-transparent transition-colors',
    error: 'bg-red-600 text-white hover:bg-red-700 border-transparent transition-colors'
  }
}

// Badges y estados con mejor legibilidad
export const badgeColors = {
  default: 'bg-gray-100 text-gray-800 border border-gray-200',
  primary: 'bg-blue-100 text-blue-800 border border-blue-200',
  success: 'bg-green-100 text-green-800 border border-green-200',
  warning: 'bg-amber-100 text-amber-800 border border-amber-200',
  error: 'bg-red-100 text-red-800 border border-red-200',
  info: 'bg-blue-100 text-blue-800 border border-blue-200'
}

// Utilidad para generar clases CSS completas
export const getTextClass = (type: keyof typeof textColors): string => {
  return textColors[type]
}

export const getBackgroundClass = (type: keyof typeof backgroundColors): string => {
  return backgroundColors[type]
}

export const getBadgeClass = (type: keyof typeof badgeColors): string => {
  return `${badgeColors[type]} px-2 py-1 rounded-full text-xs font-medium`
} 