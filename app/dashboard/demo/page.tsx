'use client'

import React from 'react'
import DemoLayout from './components/DemoLayout'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import { DEMO_STATS } from '@/lib/demo/data'
import { 
  DollarSign, 
  Wrench, 
  Users, 
  Smartphone,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function DemoDashboard() {
  const { t } = useTranslations()

  const statCards = [
    {
      title: t('dashboard.totalRevenue'),
      value: `S/ ${DEMO_STATS.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+12.5%'
    },
    {
      title: t('dashboard.totalRepairs'),
      value: DEMO_STATS.totalRepairs.toString(),
      icon: Wrench,
      color: 'bg-blue-500',
      change: '+8.3%'
    },
    {
      title: t('dashboard.totalCustomers'),
      value: DEMO_STATS.totalCustomers.toString(),
      icon: Users,
      color: 'bg-purple-500',
      change: '+15.2%'
    },
    {
      title: t('dashboard.totalDevices'),
      value: DEMO_STATS.totalDevices.toString(),
      icon: Smartphone,
      color: 'bg-orange-500',
      change: '+6.7%'
    }
  ]

  const repairStatusCards = [
    {
      title: 'Completadas',
      value: DEMO_STATS.completedRepairs.toString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'En Progreso',
      value: DEMO_STATS.inProgressRepairs.toString(),
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Pendientes',
      value: DEMO_STATS.pendingRepairs.toString(),
      icon: AlertCircle,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ]

  return (
    <DemoLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('dashboard.title')}
              </h1>
              <p className="text-gray-600 mt-1">
                Bienvenido al modo demo de TiendaFix
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-orange-700">
                  MODO DEMO
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Último acceso: Hoy 10:30 AM
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      {stat.change} vs mes anterior
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Estado de reparaciones */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Estado de Reparaciones
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {repairStatusCards.map((card, index) => {
              const Icon = card.icon
              return (
                <div key={index} className={`${card.bg} rounded-lg p-4`}>
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-8 w-8 ${card.color}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {card.title}
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {card.value}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Información del demo */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Smartphone className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                ¡Bienvenido al Modo Demo!
              </h3>
              <p className="text-gray-600 mt-1">
                Estás viendo una versión de demostración de TiendaFix con datos de ejemplo.
                Todas las funcionalidades están disponibles para explorar, pero no se guardan cambios reales.
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    {DEMO_STATS.totalCustomers} clientes de ejemplo
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    {DEMO_STATS.totalRepairs} reparaciones simuladas
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DemoLayout>
  )
} 