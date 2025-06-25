'use client'

import { Button as HeroButton } from '@heroui/react'
import { ReactNode } from 'react'
import { formColors } from '@/lib/utils/colors'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  isDisabled?: boolean
  startContent?: ReactNode
  endContent?: ReactNode
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
  onPress?: () => void
  className?: string
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  startContent,
  endContent,
  fullWidth = false,
  type = 'button',
  onPress,
  className = ''
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          color: 'primary' as const,
          className: 'bg-blue-600 text-white hover:bg-blue-700 font-medium'
        }
      case 'secondary':
        return {
          color: 'default' as const,
          variant: 'bordered' as const,
          className: 'border-gray-300 text-gray-800 hover:bg-gray-50 font-medium'
        }
      case 'success':
        return {
          color: 'success' as const,
          className: 'bg-green-600 text-white hover:bg-green-700 font-medium'
        }
      case 'warning':
        return {
          color: 'warning' as const,
          className: 'bg-amber-600 text-white hover:bg-amber-700 font-medium'
        }
      case 'error':
        return {
          color: 'danger' as const,
          className: 'bg-red-600 text-white hover:bg-red-700 font-medium'
        }
      case 'ghost':
        return {
          variant: 'ghost' as const,
          className: 'text-gray-700 hover:bg-gray-100 font-medium'
        }
      case 'link':
        return {
          variant: 'light' as const,
          className: 'text-blue-700 hover:text-blue-800 underline font-medium'
        }
      default:
        return {
          color: 'primary' as const,
          className: 'bg-blue-600 text-white hover:bg-blue-700 font-medium'
        }
    }
  }

  const variantStyles = getVariantStyles()

  return (
    <HeroButton
      {...variantStyles}
      size={size}
      isLoading={isLoading}
      isDisabled={isDisabled}
      startContent={startContent}
      endContent={endContent}
      fullWidth={fullWidth}
      type={type}
      onPress={onPress}
      className={`${variantStyles.className} ${className}`}
    >
      {children}
    </HeroButton>
  )
} 