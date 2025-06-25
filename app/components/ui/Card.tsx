'use client'

import { Card as HeroCard, CardHeader, CardBody, CardFooter } from '@heroui/react'
import { backgroundColors, textColors } from '@/lib/utils/colors'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  title?: string
  subtitle?: string
  footer?: ReactNode
  className?: string
  isHoverable?: boolean
  isPressable?: boolean
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  onPress?: () => void
}

export default function Card({
  children,
  title,
  subtitle,
  footer,
  className = '',
  isHoverable = false,
  isPressable = false,
  shadow = 'sm',
  onPress
}: CardProps) {
  return (
    <HeroCard
      isHoverable={isHoverable}
      isPressable={isPressable}
      shadow={shadow}
      onPress={onPress}
      classNames={{
        base: `${backgroundColors.card} ${className}`,
        header: "pb-2",
        body: "pt-2",
        footer: "pt-2"
      }}
    >
      {(title || subtitle) && (
        <CardHeader className="flex flex-col items-start">
          {title && (
            <h3 className={`text-lg font-semibold ${textColors.primary}`}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className={`text-sm ${textColors.secondary}`}>
              {subtitle}
            </p>
          )}
        </CardHeader>
      )}
      
      <CardBody className={textColors.primary}>
        {children}
      </CardBody>
      
      {footer && (
        <CardFooter>
          {footer}
        </CardFooter>
      )}
    </HeroCard>
  )
} 