'use client'

import React from 'react'
import DemoLayout from '../components/DemoLayout'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import { ShoppingCart, Plus } from 'lucide-react'

export default function VentasDemo() {
  const { t } = useTranslations()

  return (
    <DemoLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('sidebar.sales')}
              </h1>
              <p className="text-gray-600 mt-1">
                Gestión de ventas - Modo Demo
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-orange-700">
                  SOLO VISUALIZACIÓN
                </span>
              </div>
              <button className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg flex items-center space-x-2 cursor-not-allowed">
                <Plus className="h-4 w-4" />
                <span>Nueva Venta</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ventas Demo
            </h3>
            <p className="text-gray-500">
              Esta sección mostraría la gestión de ventas en el modo completo.
            </p>
          </div>
        </div>
      </div>
    </DemoLayout>
  )
} 