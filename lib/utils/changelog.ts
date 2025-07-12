export interface ChangelogEntry {
  id: string
  type: 'feature' | 'fix' | 'improvement' | 'security'
  title: string
  description: string
  icon?: string
}

export interface VersionInfo {
  version: string
  releaseDate: string
  title: string
  description: string
  changes: ChangelogEntry[]
  priority: 'low' | 'medium' | 'high'
  showAnnouncement: boolean
}

export const APP_VERSION = '1.2.2'

export const CHANGELOG: VersionInfo[] = [
  {
    version: '1.2.2',
    releaseDate: '2025-07-11',
    title: 'Integración Completa de WhatsApp',
    description: 'Implementación completa de WhatsApp para reparaciones y desbloqueos con mensajes personalizados y soporte multi-país',
    priority: 'high',
    showAnnouncement: true,
    changes: [
      {
        id: 'whatsapp-unlocks',
        type: 'feature',
        title: 'WhatsApp para Desbloqueos',
        description: 'Agregamos botones de WhatsApp en modales de desbloqueos con mensajes específicos según el tipo y estado del desbloqueo',
        icon: 'star'
      },
      {
        id: 'whatsapp-messages',
        type: 'improvement',
        title: 'Mensajes WhatsApp Personalizados',
        description: 'Mensajes específicos para cada tipo de desbloqueo (iCloud, FRP, Network, etc.) con estados contextuales (Pendiente, En Proceso, Completado, Fallido)',
        icon: 'star'
      },
      {
        id: 'duplicate-buttons-fix',
        type: 'fix',
        title: 'Eliminación de Botones Duplicados',
        description: 'Corregimos los botones de WhatsApp duplicados en modales de reparaciones y desbloqueos, manteniendo solo uno por modal',
        icon: 'bug'
      },
      {
        id: 'country-code-support',
        type: 'feature',
        title: 'Soporte Multi-País',
        description: 'Implementamos soporte completo para códigos de país en clientes con validación adecuada para mostrar WhatsApp',
        icon: 'globe'
      },
      {
        id: 'database-views-update',
        type: 'improvement',
        title: 'Actualización de Vistas de Base de Datos',
        description: 'Actualizamos las vistas de repairs y unlocks para incluir campos de cédula/DNI y código de país del cliente',
        icon: 'database'
      },
      {
        id: 'api-optimization',
        type: 'improvement',
        title: 'Optimización de APIs',
        description: 'Mejoramos las APIs de técnicos para usar vistas optimizadas en lugar de consultas directas a tablas',
        icon: 'zap'
      },
      {
        id: 'typescript-fixes',
        type: 'fix',
        title: 'Correcciones TypeScript',
        description: 'Corregimos interfaces de Customer para incluir campos de cédula/DNI y código de país, eliminando errores de TypeScript',
        icon: 'tool'
      }
    ]
  },
  {
    version: '1.2.0',
    releaseDate: '2025-07-11',
    title: 'Sistema de Identificación Tributaria',
    description: 'Implementación completa del sistema de identificación tributaria para organizaciones y clientes',
    priority: 'high',
    showAnnouncement: false,
    changes: [
      {
        id: 'org-tax-id',
        type: 'feature',
        title: 'Identificación Tributaria de Organizaciones',
        description: 'Agregamos soporte para todos los países de Sudamérica con sus respectivos tipos de identificación tributaria (RUC, CUIT, NIT, etc.)',
        icon: 'building'
      },
      {
        id: 'customer-tax-id',
        type: 'feature',
        title: 'Identificación Tributaria de Clientes',
        description: 'Los clientes ahora pueden tener identificación tributaria que se adapta automáticamente al país de la organización',
        icon: 'users'
      },
      {
        id: 'tax-id-tickets',
        type: 'feature',
        title: 'Identificación en Tickets',
        description: 'Todos los tickets de reparación, cotización y ventas ahora incluyen la información tributaria de la organización y cliente',
        icon: 'receipt'
      },
      {
        id: 'upload-logo-fix',
        type: 'fix',
        title: 'Corrección Botón Subir Logo',
        description: 'Corregimos el problema de visibilidad del botón "Subir Logo" en la configuración',
        icon: 'image'
      },
      {
        id: 'update-customer-fix',
        type: 'fix',
        title: 'Corrección Botón Actualizar Cliente',
        description: 'Corregimos el problema de visibilidad del botón "Actualizar Cliente" en el modal de edición',
        icon: 'edit'
      },
      {
        id: 'adaptive-tax-system',
        type: 'improvement',
        title: 'Sistema Adaptativo por País',
        description: 'El sistema se adapta automáticamente al país seleccionado mostrando solo los tipos de identificación tributaria relevantes',
        icon: 'globe'
      }
    ]
  },
  {
    version: '1.1.8',
    releaseDate: '2024-01-10',
    title: 'Mejoras de Estabilidad',
    description: 'Correcciones importantes en la base de datos y optimizaciones',
    priority: 'medium',
    showAnnouncement: false,
    changes: [
      {
        id: 'db-fixes',
        type: 'fix',
        title: 'Correcciones de Base de Datos',
        description: 'Corregimos errores en las políticas RLS y migraciones de storage',
        icon: 'database'
      },
      {
        id: 'performance-improvements',
        type: 'improvement',
        title: 'Mejoras de Rendimiento',
        description: 'Optimizamos las consultas de dashboard y carga de datos',
        icon: 'zap'
      }
    ]
  }
]

export const getChangeTypeLabel = (type: string): string => {
  const labels = {
    'feature': 'Nueva Funcionalidad',
    'fix': 'Corrección',
    'improvement': 'Mejora',
    'security': 'Seguridad'
  }
  return labels[type as keyof typeof labels] || type
}

export const getChangeTypeColor = (type: string): string => {
  const colors = {
    'feature': 'bg-blue-100 text-blue-800 border-blue-200',
    'fix': 'bg-green-100 text-green-800 border-green-200',
    'improvement': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'security': 'bg-red-100 text-red-800 border-red-200'
  }
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
}

export const getChangeIcon = (iconName: string): string => {
  const icons = {
    'building': '🏢',
    'users': '👥',
    'receipt': '🧾',
    'image': '🖼️',
    'edit': '✏️',
    'globe': '🌍',
    'database': '💾',
    'zap': '⚡',
    'shield': '🛡️',
    'star': '⭐',
    'tool': '🔧',
    'bug': '🐛'
  }
  return icons[iconName as keyof typeof icons] || '📝'
}

export const getLatestVersion = (): VersionInfo | null => {
  return CHANGELOG.find(version => version.showAnnouncement) || null
}

export const shouldShowAnnouncement = (lastSeenVersion?: string): boolean => {
  if (!lastSeenVersion) return true
  
  const latest = getLatestVersion()
  if (!latest) return false
  
  return latest.version !== lastSeenVersion
}

export const getPriorityLabel = (priority: string): string => {
  const labels = {
    'low': 'Baja',
    'medium': 'Media',
    'high': 'Alta'
  }
  return labels[priority as keyof typeof labels] || priority
}

export const getPriorityColor = (priority: string): string => {
  const colors = {
    'low': 'text-gray-600',
    'medium': 'text-yellow-600',
    'high': 'text-red-600'
  }
  return colors[priority as keyof typeof colors] || 'text-gray-600'
} 