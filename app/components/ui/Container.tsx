'use client'

import React from 'react'
import { cn } from '@heroui/react'
import { useBreakpoint } from '@/lib/hooks/useBreakpoint'

interface ContainerProps {
  children: React.ReactNode
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'fluid'
  center?: boolean
  fluid?: boolean
  animate?: boolean
  safeArea?: boolean | 'top' | 'bottom' | 'horizontal' | 'vertical' | 'all'
  as?: keyof JSX.IntrinsicElements
  style?: React.CSSProperties
  id?: string
}

const sizeVariants = {
  xs: 'max-w-sm',      // 384px
  sm: 'max-w-md',      // 448px
  md: 'max-w-2xl',     // 672px
  lg: 'max-w-4xl',     // 896px
  xl: 'max-w-6xl',     // 1152px
  full: 'max-w-none'   // sin límite
}

const paddingVariants = {
  none: '',
  xs: 'px-4 py-2',
  sm: 'px-6 py-3',
  md: 'px-8 py-4',
  lg: 'px-10 py-6',
  xl: 'px-12 py-8',
  fluid: 'px-container-xs py-fluid-sm sm:px-container-sm md:px-container-md lg:px-container-lg'
}

// Container principal ultra-responsivo
export function Container({
  children,
  className,
  size = 'xl',
  padding = 'fluid',
  center = true,
  fluid = false,
  animate = false,
  safeArea = false,
  as: Component = 'div',
  style,
  id,
  ...props
}: ContainerProps) {
  const { isMobile, isTablet } = useBreakpoint()

  // Calcular clases de safe area
  const safeAreaClasses = React.useMemo(() => {
    if (!safeArea) return ''
    
    const safeClasses = []
    
    if (safeArea === true || safeArea === 'all') {
      return 'safe-area-all'
    }
    
    if (safeArea === 'top') return 'safe-area-top'
    if (safeArea === 'bottom') return 'safe-area-bottom' 
    if (safeArea === 'horizontal') return 'safe-area-left safe-area-right'
    if (safeArea === 'vertical') return 'safe-area-top safe-area-bottom'
    
    return ''
  }, [safeArea])

  return (
    <Component
      id={id}
      style={style}
      className={cn(
        // Base styles
        'w-full',
        
        // Size variants
        !fluid && sizeVariants[size],
        
        // Centering
        center && 'mx-auto',
        
        // Padding
        paddingVariants[padding],
        
        // Safe area
        safeAreaClasses,
        
        // Animations
        animate && 'animate-fade-in',
        
        // Responsive adjustments
        isMobile && 'min-h-0', // Prevenir overflow en móvil
        
        // Custom className
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

// Container específico para páginas principales
export function PageContainer({ 
  children, 
  className,
  title,
  description,
  ...props 
}: ContainerProps & {
  title?: string
  description?: string
}) {
  return (
    <Container
      className={cn('min-h-screen flex flex-col', className)}
      safeArea="vertical"
      animate
      {...props}
    >
      {title && (
        <header className="mb-fluid-lg">
          <h1 className="text-fluid-4xl font-bold text-gray-900 dark:text-white mb-fluid-xs">
            {title}
          </h1>
          {description && (
            <p className="text-fluid-lg text-gray-600 dark:text-gray-300">
              {description}
            </p>
          )}
        </header>
      )}
      <main className="flex-1">
        {children}
      </main>
    </Container>
  )
}

// Container para contenido de dashboard
export function DashboardContainer({ 
  children, 
  className,
  ...props 
}: ContainerProps) {
  const { isMobile } = useBreakpoint()
  
  return (
    <Container
      size="full"
      padding={isMobile ? 'sm' : 'md'}
      className={cn(
        'relative',
        // Grid layout profesional
        'grid grid-cols-1',
        // Spacing fluido
        'gap-fluid-md',
        className
      )}
      {...props}
    >
      {children}
    </Container>
  )
}

// Container para cards y componentes
export function CardContainer({ 
  children, 
  className,
  hover = true,
  ...props 
}: ContainerProps & {
  hover?: boolean
}) {
  return (
    <Container
      as="section"
      padding="md"
      className={cn(
        // Base card styles
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'rounded-xl',
        'shadow-card',
        
        // Hover effects
        hover && [
          'transition-all duration-300 ease-smooth',
          'hover:shadow-card-hover hover:scale-[1.01]',
          'hover:border-gray-300 dark:hover:border-gray-600'
        ],
        
        // Responsive adjustments
        'overflow-hidden',
        
        className
      )}
      {...props}
    >
      {children}
    </Container>
  )
}

// Container para secciones de landing page
export function SectionContainer({ 
  children, 
  className,
  variant = 'default',
  ...props 
}: ContainerProps & {
  variant?: 'default' | 'feature' | 'hero' | 'cta'
}) {
  const variantStyles = {
    default: 'py-fluid-xl',
    feature: 'py-fluid-2xl',
    hero: 'py-fluid-3xl min-h-screen flex items-center',
    cta: 'py-fluid-xl bg-gradient-to-r from-primary-500 to-primary-600'
  }
  
  return (
    <Container
      as="section"
      size="xl"
      className={cn(
        'relative',
        variantStyles[variant],
        variant === 'cta' && 'text-white',
        className
      )}
      {...props}
    >
      {children}
    </Container>
  )
}

// Container para grids de productos/items
export function GridContainer({ 
  children, 
  className,
  columns,
  ...props 
}: ContainerProps & {
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
}) {
  const { isMobile, isTablet } = useBreakpoint()
  
  const getGridCols = () => {
    if (isMobile) return columns?.mobile || 1
    if (isTablet) return columns?.tablet || 2
    return columns?.desktop || 3
  }
  
  const gridCols = getGridCols()
  
  return (
    <Container
      className={cn(
        'grid gap-fluid-md',
        `grid-cols-${gridCols}`,
        // Auto-fit para contenido dinámico
        gridCols > 1 && 'auto-rows-fr',
        className
      )}
      {...props}
    >
      {children}
    </Container>
  )
}

// Container para modales y overlays
export function ModalContainer({ 
  children, 
  className,
  ...props 
}: ContainerProps) {
  return (
    <Container
      size="md"
      padding="lg"
      center
      className={cn(
        'relative',
        'bg-white dark:bg-gray-900',
        'rounded-2xl',
        'shadow-2xl',
        'border border-gray-200 dark:border-gray-700',
        'max-h-[90vh] overflow-y-auto',
        'animate-scale-in',
        className
      )}
      {...props}
    >
      {children}
    </Container>
  )
}

// Container para navegación móvil
export function MobileNavContainer({ 
  children, 
  className,
  ...props 
}: ContainerProps) {
  return (
    <Container
      size="full"
      padding="xs"
      safeArea="bottom"
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-white/90 dark:bg-gray-900/90',
        'backdrop-blur-lg',
        'border-t border-gray-200 dark:border-gray-700',
        'animate-slide-up',
        className
      )}
      {...props}
    >
      {children}
    </Container>
  )
} 