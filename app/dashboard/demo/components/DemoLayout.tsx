'use client'

import React from 'react'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import DemoHeader from './DemoHeader'
import DemoSidebar from './DemoSidebar'

interface DemoLayoutProps {
  children: React.ReactNode
}

export default function DemoLayout({ children }: DemoLayoutProps) {
  const { t } = useTranslations()

  return (
    <div className="min-h-screen bg-gray-50">
      <DemoHeader />
      <div className="flex">
        <DemoSidebar />
        <main className="flex-1 p-6 ml-64">
          {children}
        </main>
      </div>
    </div>
  )
} 