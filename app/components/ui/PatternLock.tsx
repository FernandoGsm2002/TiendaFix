'use client'

import React, { useState, useRef, useEffect } from 'react'

interface PatternLockProps {
  value?: number[]
  onChange?: (pattern: number[]) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const PatternLock: React.FC<PatternLockProps> = ({
  value = [],
  onChange,
  disabled = false,
  size = 'md',
  className = ''
}) => {
  const [selectedPoints, setSelectedPoints] = useState<number[]>(value)
  const [isDrawing, setIsDrawing] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  // Tamaños según el prop size
  const sizes = {
    sm: { container: 120, point: 8, spacing: 40 },
    md: { container: 180, point: 12, spacing: 60 },
    lg: { container: 240, point: 16, spacing: 80 }
  }

  const currentSize = sizes[size]

  // Coordenadas de los 9 puntos (3x3 grid)
  const points = [
    { x: currentSize.spacing, y: currentSize.spacing, id: 1 },     // Top-left
    { x: currentSize.spacing * 2, y: currentSize.spacing, id: 2 }, // Top-center
    { x: currentSize.spacing * 3, y: currentSize.spacing, id: 3 }, // Top-right
    { x: currentSize.spacing, y: currentSize.spacing * 2, id: 4 }, // Middle-left
    { x: currentSize.spacing * 2, y: currentSize.spacing * 2, id: 5 }, // Middle-center
    { x: currentSize.spacing * 3, y: currentSize.spacing * 2, id: 6 }, // Middle-right
    { x: currentSize.spacing, y: currentSize.spacing * 3, id: 7 }, // Bottom-left
    { x: currentSize.spacing * 2, y: currentSize.spacing * 3, id: 8 }, // Bottom-center
    { x: currentSize.spacing * 3, y: currentSize.spacing * 3, id: 9 }  // Bottom-right
  ]

  // Actualizar el estado cuando cambie el valor externo
  useEffect(() => {
    setSelectedPoints(value)
  }, [value])

  const handlePointClick = (pointId: number) => {
    if (disabled) return

    let newPattern: number[]

    if (selectedPoints.includes(pointId)) {
      // Si el punto ya está seleccionado, remover desde ese punto en adelante
      const index = selectedPoints.indexOf(pointId)
      newPattern = selectedPoints.slice(0, index)
    } else {
      // Agregar punto al patrón
      newPattern = [...selectedPoints, pointId]
    }

    setSelectedPoints(newPattern)
    onChange?.(newPattern)
  }

  const handleClear = () => {
    if (disabled) return
    setSelectedPoints([])
    onChange?.([])
  }

  // Generar líneas entre puntos conectados
  const generateLines = () => {
    if (selectedPoints.length < 2) return []

    const lines = []
    for (let i = 0; i < selectedPoints.length - 1; i++) {
      const currentPoint = points.find(p => p.id === selectedPoints[i])
      const nextPoint = points.find(p => p.id === selectedPoints[i + 1])

      if (currentPoint && nextPoint) {
        lines.push(
          <line
            key={`line-${i}`}
            x1={currentPoint.x}
            y1={currentPoint.y}
            x2={nextPoint.x}
            y2={nextPoint.y}
            stroke="#22c55e"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )
      }
    }
    return lines
  }

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="relative">
        <svg
          ref={svgRef}
          width={currentSize.container + currentSize.spacing}
          height={currentSize.container + currentSize.spacing}
          className="border border-gray-200 rounded-lg bg-gray-50"
        >
          {/* Líneas conectoras */}
          {generateLines()}

          {/* Puntos */}
          {points.map((point) => {
            const isSelected = selectedPoints.includes(point.id)
            const selectionOrder = selectedPoints.indexOf(point.id) + 1

            return (
              <g key={point.id}>
                {/* Círculo del punto */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={currentSize.point}
                  fill={isSelected ? '#22c55e' : '#e5e7eb'}
                  stroke={isSelected ? '#16a34a' : '#d1d5db'}
                  strokeWidth="2"
                  className={`cursor-pointer transition-all duration-200 ${
                    disabled ? 'cursor-not-allowed opacity-50' : 'hover:stroke-gray-400'
                  }`}
                  onClick={() => handlePointClick(point.id)}
                />

                {/* Número de orden si está seleccionado */}
                {isSelected && (
                  <text
                    x={point.x}
                    y={point.y + 4}
                    textAnchor="middle"
                    className="fill-white text-xs font-bold pointer-events-none"
                    style={{ fontSize: size === 'sm' ? '10px' : size === 'md' ? '12px' : '14px' }}
                  >
                    {selectionOrder}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Información del patrón */}
      <div className="text-center space-y-2">
        {selectedPoints.length > 0 ? (
          <div className="text-sm text-gray-600">
            <p>Patrón: {selectedPoints.join(' → ')}</p>
            <p className="text-xs text-gray-500">
              {selectedPoints.length} punto{selectedPoints.length !== 1 ? 's' : ''} seleccionado{selectedPoints.length !== 1 ? 's' : ''}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Haz clic en los puntos para crear el patrón
          </p>
        )}

        {/* Botón de limpiar */}
        {selectedPoints.length > 0 && !disabled && (
          <button
            onClick={handleClear}
            className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
          >
            Limpiar patrón
          </button>
        )}
      </div>
    </div>
  )
}

export default PatternLock 