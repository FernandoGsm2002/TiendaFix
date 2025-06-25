'use client'

import { Chip } from '@heroui/react'
import { ReactNode } from 'react'
import { getBadgeClass } from '@/lib/utils/colors'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  startContent?: ReactNode
  endContent?: ReactNode
  onClose?: () => void
  className?: string
}

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  startContent,
  endContent,
  onClose,
  className = ''
}: BadgeProps) {
  const getHeroUIColor = () => {
    switch (variant) {
      case 'primary':
        return 'primary'
      case 'success':
        return 'success'
      case 'warning':
        return 'warning'
      case 'error':
        return 'danger'
      case 'info':
        return 'primary'
      default:
        return 'default'
    }
  }

  const getCustomStyles = () => {
    switch (variant) {
      case 'default':
        return 'bg-gray-100 text-gray-800 border border-gray-200'
      case 'primary':
        return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'success':
        return 'bg-green-100 text-green-800 border border-green-200'
      case 'warning':
        return 'bg-amber-100 text-amber-800 border border-amber-200'
      case 'error':
        return 'bg-red-100 text-red-800 border border-red-200'
      case 'info':
        return 'bg-blue-100 text-blue-800 border border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  return (
    <Chip
      color={getHeroUIColor() as any}
      size={size}
      variant="flat"
      startContent={startContent}
      endContent={endContent}
      onClose={onClose}
      classNames={{
        base: `${getCustomStyles()} font-medium ${className}`,
        content: "font-medium px-1"
      }}
    >
      {children}
    </Chip>
  )
} 