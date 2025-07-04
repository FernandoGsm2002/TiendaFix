'use client'

import React from 'react'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import { DEMO_STATS, DEMO_CHARTS } from '@/lib/demo/data'
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Chip,
  Progress
} from '@heroui/react'
import { 
  BarChart3, 
  Users, 
  Wrench, 
  Package, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Activity, 
  Star, 
  Unlock,
  ShoppingCart,
  Phone,
  User,
  Smartphone
} from 'lucide-react'

export default function DemoDashboard() {
  const { t } = useTranslations()

  const statsCards = [
    { 
      title: 'Ingresos del Día', 
      value: `S/ ${DEMO_STATS.dailyRevenue.toLocaleString()}`, 
      icon: DollarSign, 
      bg: 'bg-gradient-to-br from-green-400 to-green-600',
      change: '+12.5%',
      changeType: 'increase'
    },
    { 
      title: 'Reparaciones Hoy', 
      value: DEMO_STATS.todayRepairs.toString(), 
      icon: Wrench, 
      bg: 'bg-gradient-to-br from-blue-400 to-blue-600',
      change: '+8.3%',
      changeType: 'increase'
    },
    { 
      title: 'Desbloqueos Hoy', 
      value: DEMO_STATS.todayUnlocks.toString(), 
      icon: Unlock, 
      bg: 'bg-gradient-to-br from-purple-400 to-purple-600',
      change: '+15.2%',
      changeType: 'increase'
    },
    { 
      title: 'Reparaciones Pendientes', 
      value: DEMO_STATS.pendingRepairs.toString(), 
      icon: Clock, 
      bg: 'bg-gradient-to-br from-orange-400 to-orange-600',
      change: '-5.1%',
      changeType: 'decrease'
    },
    { 
      title: 'En Progreso', 
      value: DEMO_STATS.inProgressRepairs.toString(), 
      icon: Activity, 
      bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      change: '+3.2%',
      changeType: 'increase'
    },
    { 
      title: 'Total Clientes', 
      value: DEMO_STATS.totalCustomers.toString(), 
      icon: Users, 
      bg: 'bg-gradient-to-br from-pink-400 to-pink-600',
      change: '+6.7%',
      changeType: 'increase'
    }
  ]

  const quickStats = [
    {
      title: 'Ingresos del Mes',
      value: `S/ ${DEMO_STATS.monthlyRevenue.toLocaleString()}`,
      subtitle: 'Meta: S/ 50,000',
      progress: (DEMO_STATS.monthlyRevenue / 50000) * 100,
      color: 'success'
    },
    {
      title: 'Reparaciones Completadas',
      value: DEMO_STATS.completedRepairs.toString(),
      subtitle: 'De 287 totales',
      progress: (DEMO_STATS.completedRepairs / DEMO_STATS.totalRepairs) * 100,
      color: 'primary'
    },
    {
      title: 'Stock Bajo',
      value: DEMO_STATS.lowStockItems.toString(),
      subtitle: `${DEMO_STATS.outOfStockItems} agotados`,
      progress: ((DEMO_STATS.lowStockItems + DEMO_STATS.outOfStockItems) / DEMO_STATS.totalProducts) * 100,
      color: 'warning'
    }
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'repair',
      title: 'Reparación completada',
      description: 'iPhone 14 Pro - Cambio de pantalla',
      customer: 'Juan Carlos M.',
      time: 'Hace 15 min',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'unlock',
      title: 'Desbloqueo iniciado',
      description: 'Samsung Galaxy A54 - Network Unlock',
      customer: 'Carlos R.',
      time: 'Hace 32 min',
      icon: Unlock,
      color: 'text-purple-600'
    },
    {
      id: 3,
      type: 'repair',
      title: 'Nueva reparación',
      description: 'Xiaomi Redmi Note 12 - Puerto de carga',
      customer: 'Ana S.',
      time: 'Hace 1 hora',
      icon: Wrench,
      color: 'text-blue-600'
    },
    {
      id: 4,
      type: 'sale',
      title: 'Venta realizada',
      description: 'Accesorios varios - S/ 185',
      customer: 'TechSolutions',
      time: 'Hace 2 horas',
      icon: Package,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header con indicador demo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Dashboard Principal
          </h1>
          <p className="text-gray-600 mt-1">
            Bienvenido al sistema de gestión TiendaFix
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Chip 
            color="warning" 
            variant="flat" 
            size="lg"
            className="font-semibold"
          >
            🎭 MODO DEMO
          </Chip>
          <Chip 
            color="success" 
            variant="flat" 
            size="sm"
          >
            Último acceso: Hoy 10:30 AM
          </Chip>
        </div>
      </div>

      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mb-2">
                      {stat.value}
                    </p>
                    <div className="flex items-center">
                      <span className={`text-xs font-medium ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.changeType === 'increase' ? '↗️' : '↘️'} {stat.change}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">vs mes pasado</span>
                    </div>
                  </div>
                  <div className={`${stat.bg} p-3 rounded-xl shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>

      {/* Estadísticas resumidas y progreso */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {stat.title}
                </h3>
                <Chip 
                  color={stat.color as any} 
                  variant="flat" 
                  size="sm"
                >
                  {Math.round(stat.progress)}%
                </Chip>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 mb-3">
                {stat.subtitle}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    stat.color === 'success' ? 'bg-green-500' :
                    stat.color === 'primary' ? 'bg-blue-500' :
                    'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min(stat.progress, 100)}%` }}
                ></div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Actividad reciente y estadísticas adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad reciente */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Actividad Reciente
              </h3>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`${activity.color} mt-1`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {activity.customer}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardBody>
        </Card>

        {/* Resumen de estado */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Estado General
              </h3>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">
                  {DEMO_STATS.completedRepairs}
                </p>
                <p className="text-sm text-green-700">
                  Completadas
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900">
                  {DEMO_STATS.inProgressRepairs}
                </p>
                <p className="text-sm text-blue-700">
                  En Progreso
                </p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-900">
                  {DEMO_STATS.pendingRepairs}
                </p>
                <p className="text-sm text-orange-700">
                  Pendientes
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Unlock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-900">
                  {DEMO_STATS.totalUnlocks}
                </p>
                <p className="text-sm text-purple-700">
                  Desbloqueos
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Información del demo */}
      <Card className="shadow-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
        <CardBody className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-orange-100 p-3 rounded-xl">
              <Smartphone className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¡Bienvenido al Modo Demo de TiendaFix! 🎉
              </h3>
              <p className="text-gray-700 mb-4">
                Estás explorando una versión completa del sistema con datos de ejemplo realistas. 
                Todas las secciones están disponibles para navegar y explorar la funcionalidad.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    {DEMO_STATS.totalCustomers} clientes registrados
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    {DEMO_STATS.totalRepairs} reparaciones en historial
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    {DEMO_STATS.totalProducts} productos en inventario
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
} 