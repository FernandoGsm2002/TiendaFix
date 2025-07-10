'use client'

import { useMemo } from 'react'
import { useBreakpoint } from './useBreakpoint'

interface GridConfig {
  minItemWidth: number
  maxColumns?: number
  gap?: number
  aspectRatio?: number
}

interface GridResult {
  columns: number
  gridClass: string
  containerClass: string
  itemClass: string
  shouldUseList: boolean
}

// Hook para grid adaptativo inteligente como en las mejores apps modernas
export function useAdaptiveGrid(config: GridConfig): GridResult {
  const { windowSize, isMobile, isTablet, isDesktop, isClient } = useBreakpoint()
  
  const {
    minItemWidth = 280,
    maxColumns = 6,
    gap = 16,
    aspectRatio = 1
  } = config

  const gridCalculation = useMemo(() => {
    if (!isClient || windowSize.width === 0) {
      return {
        columns: 1,
        shouldUseList: true
      }
    }

    // Calcular columnas disponibles basado en ancho de ventana
    const availableWidth = windowSize.width - (gap * 2) // Padding lateral
    const possibleColumns = Math.floor(availableWidth / (minItemWidth + gap))
    
    // Aplicar límites y lógica específica por dispositivo
    let columns: number
    
    if (isMobile) {
      // Móvil: Priorizar legibilidad, máximo 2 columnas
      columns = Math.min(possibleColumns, 2)
      // Si es muy estrecho, usar lista
      if (availableWidth < minItemWidth * 1.5) {
        columns = 1
      }
    } else if (isTablet) {
      // Tablet: Balance entre aprovechamiento y usabilidad
      columns = Math.min(possibleColumns, 3)
    } else {
      // Desktop: Máximo aprovechamiento con límite sensato
      columns = Math.min(possibleColumns, maxColumns)
    }

    // Asegurar mínimo de 1 columna
    columns = Math.max(1, columns)

    // Determinar si usar lista en lugar de grid
    const shouldUseList = isMobile && columns === 1

    return { columns, shouldUseList }
  }, [windowSize.width, isMobile, isTablet, isDesktop, minItemWidth, maxColumns, gap, isClient])

  // Generar clases CSS dinámicas
  const gridClasses = useMemo(() => {
    const { columns, shouldUseList } = gridCalculation
    
    if (shouldUseList) {
      return {
        gridClass: 'flex flex-col',
        containerClass: 'space-y-4',
        itemClass: 'w-full'
      }
    }

    // Grid responsivo moderno con auto-fit
    const gridClass = `grid grid-cols-${columns} gap-${Math.ceil(gap / 4)}`
    
    // Clases adicionales para mejor layout
    const containerClass = `
      w-full 
      ${isMobile ? 'px-4' : isTablet ? 'px-6' : 'px-8'}
      ${isMobile ? 'py-4' : 'py-6'}
    `.trim()

    const itemClass = `
      w-full 
      transition-all 
      duration-300 
      ease-out
      ${!isMobile ? 'hover:scale-[1.02] hover:shadow-lg' : ''}
    `.trim()

    return {
      gridClass,
      containerClass,
      itemClass
    }
  }, [gridCalculation, gap, isMobile, isTablet])

  return {
    columns: gridCalculation.columns,
    shouldUseList: gridCalculation.shouldUseList,
    ...gridClasses
  }
}

// Hook específico para cards de productos/dispositivos
export function useProductGrid(minWidth = 320) {
  return useAdaptiveGrid({
    minItemWidth: minWidth,
    maxColumns: 5,
    gap: 20,
    aspectRatio: 1.2
  })
}

// Hook para dashboard con métricas
export function useDashboardGrid() {
  const { isMobile, isTablet } = useBreakpoint()
  
  return useAdaptiveGrid({
    minItemWidth: isMobile ? 280 : 320,
    maxColumns: isMobile ? 2 : isTablet ? 3 : 4,
    gap: isMobile ? 12 : 16,
    aspectRatio: 1
  })
}

// Hook para layout de tabla responsiva
export function useTableLayout() {
  const { isMobile, isTablet, windowSize } = useBreakpoint()
  
  const layout = useMemo(() => {
    if (isMobile) {
      return {
        type: 'cards' as const,
        showColumns: 0,
        stackVertically: true
      }
    } else if (isTablet) {
      return {
        type: 'condensed' as const,
        showColumns: 4,
        stackVertically: false
      }
    } else {
      return {
        type: 'full' as const,
        showColumns: windowSize.width > 1400 ? 8 : 6,
        stackVertically: false
      }
    }
  }, [isMobile, isTablet, windowSize.width])

  return layout
}

// Hook para navigation layout adaptativo
export function useNavigationLayout() {
  const { isMobile, isTablet, isDesktop, windowSize } = useBreakpoint()
  
  return useMemo(() => {
    if (isMobile) {
      return {
        type: 'bottom' as const,
        collapsible: false,
        showLabels: false,
        maxItems: 5
      }
    } else if (isTablet) {
      return {
        type: 'side' as const,
        collapsible: true,
        showLabels: true,
        maxItems: 8,
        collapsed: windowSize.width < 900
      }
    } else {
      return {
        type: 'side' as const,
        collapsible: true,
        showLabels: true,
        maxItems: 12,
        collapsed: windowSize.width < 1200
      }
    }
  }, [isMobile, isTablet, isDesktop, windowSize.width])
} 