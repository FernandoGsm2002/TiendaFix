'use client'

import React, { useState } from 'react'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import { DEMO_STATS, DEMO_CHARTS } from '@/lib/demo/data'
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Chip, 
  Button, 
  Select, 
  SelectItem,
  DatePicker,
  Progress
} from '@heroui/react'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Wrench, 
  Package, 
  Calendar, 
  Download, 
  FileText, 
  BarChart3, 
  PieChart,
  Activity,
  Target,
  Award,
  Clock
} from 'lucide-react'

export default function DemoReportesPage() {
  const { t } = useTranslations()
  const [dateRange, setDateRange] = useState('thisMonth')
  const [reportType, setReportType] = useState('general')

  const formatCurrency = (amount: number) => {
    return `S/ ${amount.toLocaleString()}`
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const reportStats = {
    revenue: {
      current: DEMO_STATS.monthlyRevenue,
      previous: 38520,
      growth: ((DEMO_STATS.monthlyRevenue - 38520) / 38520) * 100
    },
    repairs: {
      current: DEMO_STATS.totalRepairs,
      previous: 245,
      growth: ((DEMO_STATS.totalRepairs - 245) / 245) * 100
    },
    customers: {
      current: DEMO_STATS.totalCustomers,
      previous: 142,
      growth: ((DEMO_STATS.totalCustomers - 142) / 142) * 100
    },
    unlocks: {
      current: DEMO_STATS.totalUnlocks,
      previous: 58,
      growth: ((DEMO_STATS.totalUnlocks - 58) / 58) * 100
    }
  }

  const topProducts = [
    { name: 'Pantalla iPhone 14 Pro', sales: 28, revenue: 14560 },
    { name: 'Batería Samsung Galaxy S23', sales: 24, revenue: 4320 },
    { name: 'Cargador USB-C 65W', sales: 18, revenue: 1170 },
    { name: 'Protector Pantalla', sales: 15, revenue: 225 },
    { name: 'Flex de Carga Xiaomi', sales: 12, revenue: 720 }
  ]

  const topTechnicians = [
    { name: 'Roberto Silva', repairs: 84, rating: 4.7, revenue: 8920 },
    { name: 'Miguel Torres', repairs: 76, rating: 4.8, revenue: 8150 },
    { name: 'Ana Sofía Chen', repairs: 68, rating: 4.9, revenue: 7240 },
    { name: 'Luis Mendoza', repairs: 52, rating: 4.6, revenue: 5680 },
    { name: 'Carmen Díaz', repairs: 45, rating: 4.5, revenue: 4850 }
  ]

  const performanceMetrics = [
    {
      title: 'Tasa de Finalización',
      value: 92.5,
      target: 95,
      color: 'success'
    },
    {
      title: 'Tiempo Promedio de Reparación',
      value: 2.3,
      target: 2.0,
      color: 'warning',
      unit: 'días'
    },
    {
      title: 'Satisfacción del Cliente',
      value: 88.7,
      target: 90,
      color: 'primary',
      unit: '%'
    },
    {
      title: 'Margen de Ganancia',
      value: 67.8,
      target: 65,
      color: 'success',
      unit: '%'
    }
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Reportes y Analíticas
          </h1>
          <p className="text-gray-600 mt-1">
            Visualiza métricas y estadísticas del negocio
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
          <Button
            color="primary"
            startContent={<Download className="h-4 w-4" />}
            className="font-semibold cursor-not-allowed"
            disabled
          >
            Exportar Reporte
          </Button>
        </div>
      </div>

      {/* Filtros de reporte */}
      <Card className="shadow-lg">
        <CardBody className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-3">
              <Select 
                placeholder="Período" 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                variant="bordered"
                className="min-w-[150px]"
              >
                <SelectItem key="today">Hoy</SelectItem>
                <SelectItem key="thisWeek">Esta Semana</SelectItem>
                <SelectItem key="thisMonth">Este Mes</SelectItem>
                <SelectItem key="thisQuarter">Este Trimestre</SelectItem>
                <SelectItem key="thisYear">Este Año</SelectItem>
              </Select>
              <Select 
                placeholder="Tipo de Reporte" 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                variant="bordered"
                className="min-w-[150px]"
              >
                <SelectItem key="general">General</SelectItem>
                <SelectItem key="financial">Financiero</SelectItem>
                <SelectItem key="operations">Operaciones</SelectItem>
                <SelectItem key="inventory">Inventario</SelectItem>
                <SelectItem key="technicians">Técnicos</SelectItem>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Ingresos del Mes</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(reportStats.revenue.current)}</p>
                <div className="flex items-center mt-2">
                  {reportStats.revenue.growth > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${reportStats.revenue.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(Math.abs(reportStats.revenue.growth))}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs mes anterior</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Reparaciones</p>
                <p className="text-3xl font-bold text-gray-900">{reportStats.repairs.current}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">
                    {formatPercentage(reportStats.repairs.growth)}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">crecimiento</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl">
                <Wrench className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Clientes Activos</p>
                <p className="text-3xl font-bold text-gray-900">{reportStats.customers.current}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">
                    {formatPercentage(reportStats.customers.growth)}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">nuevos</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Desbloqueos</p>
                <p className="text-3xl font-bold text-gray-900">{reportStats.unlocks.current}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">
                    {formatPercentage(reportStats.unlocks.growth)}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">incremento</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-3 rounded-xl">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Métricas de rendimiento */}
      <Card className="shadow-lg">
        <CardHeader className="pb-0">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Métricas de Rendimiento</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-900">{metric.title}</h4>
                  <Chip color={metric.color as any} variant="flat" size="sm">
                    {metric.value}{metric.unit || ''}
                  </Chip>
                </div>
                <Progress 
                  value={metric.title === 'Tiempo Promedio de Reparación' ? 
                         ((metric.target / metric.value) * 100) : 
                         (metric.value / metric.target * 100)} 
                  color={metric.color as any}
                  size="sm"
                />
                <div className="text-sm text-gray-500">
                  Meta: {metric.target}{metric.unit || ''}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Gráficos y análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Productos */}
        <Card className="shadow-lg">
          <CardHeader className="pb-0">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Productos Más Vendidos</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 text-green-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sales} unidades vendidas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(product.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Top Técnicos */}
        <Card className="shadow-lg">
          <CardHeader className="pb-0">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Técnicos Top</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {topTechnicians.map((tech, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 text-purple-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{tech.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{tech.repairs} reparaciones</span>
                        <span className="text-sm text-yellow-600">★ {tech.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(tech.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Resumen de actividad semanal */}
      <Card className="shadow-lg">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Actividad Semanal</h3>
            </div>
            <Chip color="primary" variant="flat" size="sm">
              Últimos 7 días
            </Chip>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-7 gap-2">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, index) => {
              const dailyRevenue = DEMO_CHARTS.weeklyRevenue[index]?.revenue || 0
              const maxRevenue = Math.max(...DEMO_CHARTS.weeklyRevenue.map(d => d.revenue))
              const heightPercentage = (dailyRevenue / maxRevenue) * 100
              
              return (
                <div key={day} className="text-center">
                  <div className="mb-2">
                    <div 
                      className="bg-blue-500 rounded-t mx-auto"
                      style={{ 
                        height: `${Math.max(heightPercentage, 10)}px`,
                        width: '40px'
                      }}
                    ></div>
                  </div>
                  <p className="text-xs font-medium text-gray-700">{day}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(dailyRevenue)}</p>
                </div>
              )
            })}
          </div>
        </CardBody>
      </Card>

      {/* Información del demo */}
      <Card className="shadow-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardBody className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <PieChart className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Reportes y Análisis Avanzados 📊
              </h3>
              <p className="text-gray-700 mb-4">
                Esta sección incluye datos de ejemplo que muestran las capacidades de análisis y reportes del sistema. 
                En la versión completa tendrías gráficos interactivos, exportación de datos y análisis predictivo.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    Análisis de tendencias en tiempo real
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    Reportes personalizables y exportables
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    Dashboard de métricas de rendimiento
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