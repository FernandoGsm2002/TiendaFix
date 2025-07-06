'use client'

import React from 'react'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import { DEMO_STATS, DEMO_CHARTS } from '@/lib/demo/data'
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Chip,
  Progress,
  Avatar,
  Button,
  Badge,
  Tooltip,
  Divider
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
  Smartphone,
  Sparkles,
  Crown,
  Eye,
  Zap,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

export default function DemoDashboard() {
  const { t } = useTranslations()

  const statsCards = [
    { 
      title: 'Ingresos del Día', 
      value: `S/ ${DEMO_STATS.dailyRevenue.toLocaleString()}`, 
      icon: DollarSign, 
      gradient: 'from-green-400 to-emerald-600',
      change: '+12.5%',
      changeType: 'increase'
    },
    { 
      title: 'Reparaciones Hoy', 
      value: DEMO_STATS.todayRepairs.toString(), 
      icon: Wrench, 
      gradient: 'from-blue-400 to-blue-600',
      change: '+8.3%',
      changeType: 'increase'
    },
    { 
      title: 'Desbloqueos Hoy', 
      value: DEMO_STATS.todayUnlocks.toString(), 
      icon: Unlock, 
      gradient: 'from-purple-400 to-purple-600',
      change: '+15.2%',
      changeType: 'increase'
    },
    { 
      title: 'Reparaciones Pendientes', 
      value: DEMO_STATS.pendingRepairs.toString(), 
      icon: Clock, 
      gradient: 'from-orange-400 to-orange-600',
      change: '-5.1%',
      changeType: 'decrease'
    },
    { 
      title: 'En Progreso', 
      value: DEMO_STATS.inProgressRepairs.toString(), 
      icon: Activity, 
      gradient: 'from-yellow-400 to-yellow-600',
      change: '+3.2%',
      changeType: 'increase'
    },
    { 
      title: 'Total Clientes', 
      value: DEMO_STATS.totalCustomers.toString(), 
      icon: Users, 
      gradient: 'from-pink-400 to-pink-600',
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
      color: 'success',
      icon: DollarSign
    },
    {
      title: 'Reparaciones Completadas',
      value: DEMO_STATS.completedRepairs.toString(),
      subtitle: 'De 287 totales',
      progress: (DEMO_STATS.completedRepairs / DEMO_STATS.totalRepairs) * 100,
      color: 'primary',
      icon: CheckCircle
    },
    {
      title: 'Stock Bajo',
      value: DEMO_STATS.lowStockItems.toString(),
      subtitle: `${DEMO_STATS.outOfStockItems} agotados`,
      progress: ((DEMO_STATS.lowStockItems + DEMO_STATS.outOfStockItems) / DEMO_STATS.totalProducts) * 100,
      color: 'warning',
      icon: Package
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
      color: 'success',
      gradient: 'from-green-400 to-emerald-600'
    },
    {
      id: 2,
      type: 'unlock',
      title: 'Desbloqueo iniciado',
      description: 'Samsung Galaxy A54 - Network Unlock',
      customer: 'Carlos R.',
      time: 'Hace 32 min',
      icon: Unlock,
      color: 'secondary',
      gradient: 'from-purple-400 to-purple-600'
    },
    {
      id: 3,
      type: 'repair',
      title: 'Nueva reparación',
      description: 'Xiaomi Redmi Note 12 - Puerto de carga',
      customer: 'Ana S.',
      time: 'Hace 1 hora',
      icon: Wrench,
      color: 'primary',
      gradient: 'from-blue-400 to-blue-600'
    },
    {
      id: 4,
      type: 'sale',
      title: 'Venta realizada',
      description: 'Accesorios varios - S/ 185',
      customer: 'TechSolutions',
      time: 'Hace 2 horas',
      icon: Package,
      color: 'warning',
      gradient: 'from-orange-400 to-orange-600'
    }
  ]

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header con indicador demo ultra premium */}
      <div className="flex flex-col gap-3 md:gap-4">
        <div>
          <h1 className="text-lg md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard Principal
          </h1>
          <p className="text-gray-600 mt-1 flex items-center gap-2 text-xs md:text-base">
            <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
            Bienvenido al sistema de gestión TiendaFix
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <Chip 
            color="warning" 
            variant="shadow" 
            size="sm"
            className="font-bold animate-pulse"
            startContent={<Eye className="h-3 w-3 md:h-4 md:w-4" />}
          >
            🎭 MODO DEMO
          </Chip>
          <Chip 
            color="success" 
            variant="flat" 
            size="sm"
            startContent={<Activity className="h-3 w-3" />}
          >
            <span className="hidden sm:inline">Activo desde 10:30 AM</span>
            <span className="sm:hidden">Activo</span>
          </Chip>
          <Chip 
            color="primary" 
            variant="flat" 
            size="sm"
            startContent={<Zap className="h-3 w-3" />}
          >
            <span className="hidden sm:inline">Datos en tiempo real</span>
            <span className="sm:hidden">Live</span>
          </Chip>
        </div>
      </div>

      {/* Estadísticas principales con efectos premium */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="group hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-xl border-0 bg-gradient-to-br from-white via-gray-50/50 to-white backdrop-blur-sm">
              <CardBody className="p-3 md:p-4">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`p-2 md:p-3 rounded-xl bg-gradient-to-r ${stat.gradient} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs md:text-sm font-medium text-gray-600 line-clamp-2">
                      {stat.title}
                    </p>
                    <p className="text-lg md:text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <div className="flex items-center justify-center gap-1">
                      {stat.changeType === 'increase' ? (
                        <ArrowUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-red-600" />
                      )}
                      <span className={`text-xs font-medium ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )
        })}
      </div>

      {/* Estadísticas rápidas con progress bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="shadow-lg border-0 bg-gradient-to-br from-white via-gray-50/30 to-white backdrop-blur-sm">
              <CardBody className="p-3 md:p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${
                    stat.color === 'success' ? 'from-green-400 to-emerald-600' :
                    stat.color === 'primary' ? 'from-blue-400 to-blue-600' :
                    'from-orange-400 to-orange-600'
                  }`}>
                    <Icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm md:text-base font-semibold text-gray-900">
                      {stat.title}
                    </p>
                    <p className="text-xs md:text-sm text-gray-600">
                      {stat.subtitle}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg md:text-xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <Progress 
                  value={stat.progress} 
                  color={stat.color as 'success' | 'primary' | 'warning' | 'secondary' | 'default' | 'danger'}
                  size="sm"
                  className="max-w-full"
                />
              </CardBody>
            </Card>
          )
        })}
      </div>

      {/* Actividad reciente y estadísticas adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
        {/* Actividad reciente con efectos premium */}
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-white backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 w-full">
              <div className="flex items-center gap-3">
                <Avatar
                  icon={<Activity className="h-4 w-4 md:h-5 md:w-5" />}
                  size="sm"
                  color="primary"
                  classNames={{ 
                    base: "shadow-lg",
                    icon: "text-white"
                  }}
                />
                <h3 className="text-sm md:text-lg font-semibold text-gray-900">
                  Actividad Reciente
                </h3>
              </div>
              <Badge color="primary" variant="flat" size="sm">
                <span className="hidden sm:inline">En vivo</span>
                <span className="sm:hidden">Live</span>
              </Badge>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="space-y-3">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-2 md:p-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300 group">
                    <Avatar
                      icon={<Icon className="h-3 w-3 md:h-4 md:w-4" />}
                      size="sm"
                      color={activity.color as 'success' | 'primary' | 'warning' | 'secondary' | 'default' | 'danger'}
                      classNames={{ 
                        base: "shadow-md group-hover:shadow-lg transition-all flex-shrink-0",
                        icon: "text-white"
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-semibold text-gray-900 line-clamp-1">
                        {activity.title}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                        {activity.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-1 md:gap-2 mt-1">
                        <Chip size="sm" color="default" variant="flat" className="max-w-24 md:max-w-32 truncate text-xs">
                          {activity.customer}
                        </Chip>
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

        {/* Resumen de estado con gradientes premium */}
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-purple-50/30 to-white backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <Avatar
                  icon={<BarChart3 className="h-4 w-4 md:h-5 md:w-5" />}
                  size="sm"
                  color="secondary"
                  classNames={{ 
                    base: "shadow-lg",
                    icon: "text-white"
                  }}
                />
                <h3 className="text-sm md:text-lg font-semibold text-gray-900">
                  Estado General
                </h3>
              </div>
              <Tooltip content="Actualizado automáticamente" color="primary">
                <Badge color="success" variant="flat" size="sm">
                  <Sparkles className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Live</span>
                  <span className="sm:hidden">•</span>
                </Badge>
              </Tooltip>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="grid grid-cols-2 gap-2 md:gap-4">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 shadow-lg">
                <CardBody className="text-center p-2 md:p-4">
                  <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-lg md:text-2xl font-bold text-green-900">
                    {DEMO_STATS.completedRepairs}
                  </p>
                  <p className="text-xs md:text-sm text-green-700 font-medium">
                    Completadas
                  </p>
                </CardBody>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-50 border border-blue-200 shadow-lg">
                <CardBody className="text-center p-2 md:p-4">
                  <Clock className="h-6 w-6 md:h-8 md:w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-lg md:text-2xl font-bold text-blue-900">
                    {DEMO_STATS.inProgressRepairs}
                  </p>
                  <p className="text-xs md:text-sm text-blue-700 font-medium">
                    En Progreso
                  </p>
                </CardBody>
              </Card>
              <Card className="bg-gradient-to-br from-orange-50 to-orange-50 border border-orange-200 shadow-lg">
                <CardBody className="text-center p-2 md:p-4">
                  <AlertCircle className="h-6 w-6 md:h-8 md:w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-lg md:text-2xl font-bold text-orange-900">
                    {DEMO_STATS.pendingRepairs}
                  </p>
                  <p className="text-xs md:text-sm text-orange-700 font-medium">
                    Pendientes
                  </p>
                </CardBody>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-50 border border-purple-200 shadow-lg">
                <CardBody className="text-center p-2 md:p-4">
                  <Unlock className="h-6 w-6 md:h-8 md:w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-lg md:text-2xl font-bold text-purple-900">
                    {DEMO_STATS.totalUnlocks}
                  </p>
                  <p className="text-xs md:text-sm text-purple-700 font-medium">
                    Desbloqueos
                  </p>
                </CardBody>
              </Card>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Información del demo ultra premium */}
      <Card className="shadow-2xl border-0 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 backdrop-blur-xl">
        <CardBody className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Avatar
              icon={<Crown className="h-5 w-5 md:h-7 md:w-7" />}
              size="lg"
              color="warning"
              classNames={{ 
                base: "shadow-xl bg-gradient-to-br from-amber-500 to-orange-600 flex-shrink-0",
                icon: "text-white"
              }}
            />
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                ¡Bienvenido al Modo Demo de TiendaFix! 🎉
              </h3>
              <p className="text-sm md:text-base text-gray-700 mb-4">
                Estás explorando una versión completa del sistema con datos de ejemplo realistas. 
                <span className="hidden sm:inline"> Todas las secciones están disponibles para navegar y explorar la funcionalidad.</span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 mb-4">
                <div className="flex items-center gap-2 p-2 md:p-3 bg-white/60 rounded-lg backdrop-blur-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-xs md:text-sm font-medium text-gray-700">
                    {DEMO_STATS.totalCustomers} clientes
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2 md:p-3 bg-white/60 rounded-lg backdrop-blur-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span className="text-xs md:text-sm font-medium text-gray-700">
                    {DEMO_STATS.totalRepairs} reparaciones
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2 md:p-3 bg-white/60 rounded-lg backdrop-blur-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                  <span className="text-xs md:text-sm font-medium text-gray-700">
                    {DEMO_STATS.totalProducts} productos
                  </span>
                </div>
              </div>
              <Button 
                color="primary" 
                variant="shadow" 
                size="md"
                startContent={<Sparkles className="h-4 w-4" />}
                className="font-bold w-full sm:w-auto"
              >
                <span className="hidden sm:inline">Explorar Funcionalidades</span>
                <span className="sm:hidden">Explorar</span>
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
} 