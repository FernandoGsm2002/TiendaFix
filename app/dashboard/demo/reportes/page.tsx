'use client'

import React from 'react'
import DemoLayout from '../components/DemoLayout'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import { BarChart3 } from 'lucide-react'

export default function ReportesDemo() {
  const { t } = useTranslations()

  return (
    <DemoLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('sidebar.reports')}
              </h1>
              <p className="text-gray-600 mt-1">
                Reportes y análisis - Modo Demo
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-orange-700">
                  SOLO VISUALIZACIÓN
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Reportes Demo
            </h3>
            <p className="text-gray-500">
              Esta sección mostraría reportes y análisis en el modo completo.
            </p>
          </div>
        </div>
      </div>
    </DemoLayout>
  )
} 