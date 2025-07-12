// Códigos de país para Sudamérica
export interface CountryInfo {
  code: string
  name: string
  flag: string
  whatsappCode: string
}

export const SOUTH_AMERICAN_COUNTRIES: CountryInfo[] = [
  {
    code: 'PE',
    name: 'Perú',
    flag: '🇵🇪',
    whatsappCode: '+51'
  },
  {
    code: 'AR',
    name: 'Argentina',
    flag: '🇦🇷',
    whatsappCode: '+54'
  },
  {
    code: 'BO',
    name: 'Bolivia',
    flag: '🇧🇴',
    whatsappCode: '+591'
  },
  {
    code: 'BR',
    name: 'Brasil',
    flag: '🇧🇷',
    whatsappCode: '+55'
  },
  {
    code: 'CL',
    name: 'Chile',
    flag: '🇨🇱',
    whatsappCode: '+56'
  },
  {
    code: 'CO',
    name: 'Colombia',
    flag: '🇨🇴',
    whatsappCode: '+57'
  },
  {
    code: 'EC',
    name: 'Ecuador',
    flag: '🇪🇨',
    whatsappCode: '+593'
  },
  {
    code: 'PY',
    name: 'Paraguay',
    flag: '🇵🇾',
    whatsappCode: '+595'
  },
  {
    code: 'UY',
    name: 'Uruguay',
    flag: '🇺🇾',
    whatsappCode: '+598'
  },
  {
    code: 'VE',
    name: 'Venezuela',
    flag: '🇻🇪',
    whatsappCode: '+58'
  }
]

export const getCountryByCode = (code: string): CountryInfo | undefined => {
  return SOUTH_AMERICAN_COUNTRIES.find(country => country.whatsappCode === code)
}

export const getCountryByName = (name: string): CountryInfo | undefined => {
  return SOUTH_AMERICAN_COUNTRIES.find(country => country.name === name)
}

export const formatPhoneNumber = (phone: string, countryCode: string): string => {
  // Limpiar el número de teléfono
  const cleanPhone = phone.replace(/\D/g, '')
  
  // Si el número ya incluye el código de país, devolverlo tal como está
  if (phone.startsWith(countryCode)) {
    return phone
  }
  
  // Agregar el código de país
  return `${countryCode}${cleanPhone}`
}

export const generateWhatsAppURL = (phone: string, countryCode: string, message: string): string => {
  const formattedPhone = formatPhoneNumber(phone, countryCode)
  const cleanPhone = formattedPhone.replace(/\D/g, '')
  const encodedMessage = encodeURIComponent(message)
  
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}

export const generateRepairStatusMessage = (
  customerName: string,
  deviceInfo: string,
  status: string,
  organizationName: string
): string => {
  const statusMessages = {
    'received': 'hemos recibido tu dispositivo y está en proceso de diagnóstico',
    'diagnosed': 'hemos diagnosticado tu dispositivo y pronto comenzaremos con la reparación',
    'in_progress': 'estamos trabajando en la reparación de tu dispositivo',
    'completed': 'la reparación de tu dispositivo ha sido completada exitosamente',
    'delivered': 'tu dispositivo ha sido entregado',
    'cancelled': 'lamentablemente, hemos tenido que cancelar la reparación de tu dispositivo'
  }

  const statusMessage = statusMessages[status as keyof typeof statusMessages] || 'hay una actualización sobre tu dispositivo'

  return `Hola ${customerName}, te escribimos desde ${organizationName} para informarte que ${statusMessage} (${deviceInfo}). ¡Gracias por confiar en nosotros!`
}

export const generateUnlockStatusMessage = (
  customerName: string,
  deviceInfo: string,
  status: string,
  organizationName: string
): string => {
  const statusMessages = {
    'received': 'hemos recibido tu solicitud de desbloqueo y está en proceso',
    'in_progress': 'estamos trabajando en el desbloqueo de tu dispositivo',
    'completed': 'el desbloqueo de tu dispositivo ha sido completado exitosamente',
    'delivered': 'tu dispositivo desbloqueado ha sido entregado',
    'cancelled': 'lamentablemente, no hemos podido completar el desbloqueo de tu dispositivo'
  }

  const statusMessage = statusMessages[status as keyof typeof statusMessages] || 'hay una actualización sobre tu desbloqueo'

  return `Hola ${customerName}, te escribimos desde ${organizationName} para informarte que ${statusMessage} (${deviceInfo}). ¡Gracias por confiar en nosotros!`
}

export const isValidPhoneNumber = (phone: string): boolean => {
  // Validar que el número tenga al menos 7 dígitos
  const cleanPhone = phone.replace(/\D/g, '')
  return cleanPhone.length >= 7 && cleanPhone.length <= 15
}

export const formatDisplayPhone = (phone: string, countryCode: string): string => {
  if (!phone) return ''
  
  const formattedPhone = formatPhoneNumber(phone, countryCode)
  return formattedPhone
} 