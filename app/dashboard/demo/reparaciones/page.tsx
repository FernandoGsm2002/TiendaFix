'use client'

import React from 'react'
import DemoLayout from '../components/DemoLayout'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import { DEMO_REPAIRS } from '@/lib/demo/data'
import { Wrench, Plus } from 'lucide-react'

export default function ReparacionesDemo() {
  const { t } = useTranslations()

  return (
    <DemoLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('sidebar.repairs')}
              </h1>
              <p className="text-gray-600 mt-1">
                Gestión de reparaciones - Modo Demo
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
                <span>Nueva Reparación</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lista de reparaciones */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Lista de Reparaciones ({DEMO_REPAIRS.length})
            </h2>
          </div>
          <div className="p-6">
            <div className="grid gap-4">
              {DEMO_REPAIRS.map((repair) => (
                <div key={repair.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Wrench className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {repair.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {repair.customer_name} - {repair.device_info}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-900">
                        S/ {repair.cost.toLocaleString()}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        repair.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        repair.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        repair.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {repair.status === 'delivered' ? 'Entregado' :
                         repair.status === 'completed' ? 'Completado' :
                         repair.status === 'in_progress' ? 'En Progreso' :
                         'Recibido'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DemoLayout>
  )
} 