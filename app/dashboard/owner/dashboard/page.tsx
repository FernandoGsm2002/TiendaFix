'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import DashboardLayout from '../components/DashboardLayout'
import { useCurrency } from '@/lib/utils/currency'
import LanguageCurrencySelector from '@/app/components/LanguageCurrencySelector'
import { Card, CardBody, CardHeader, Skeleton, Chip, Avatar } from '@heroui/react'
import { textColors } from '@/lib/utils/colors'
import { 
  Users, ShoppingCart, Wrench, DollarSign, Activity, AlertTriangle
} from 'lucide-react'
import { ApexOptions } from 'apexcharts'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface Stats {
  customers: number
  devices: number
  repairs: number
  potentialRevenue: number
  inventory: number
  unlocks: number
  dailySales: number
  dailyRevenue: number
}

interface ChartData {
  repairsByStatus: Record<string, number>
  salesLast7Days: { day: string; total: number }[]
}

interface Activity {
  type: string
  title: string
  time: string
  customer?: string
}

interface DashboardData {
  stats: Stats
  chartData: ChartData
  recentActivity: Activity[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { format, currencyCode, symbol } = useCurrency()

  const [refreshKey, setRefreshKey] = useState(0)
  
  useEffect(() => {
    const handleStorageChange = () => setRefreshKey(prev => prev + 1)
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  useEffect(() => {
    fetchStats()
  }, [refreshKey])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/stats')
      if (!response.ok) throw new Error('Error al cargar estadísticas')
      const result = await response.json()
      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Skeleton className="h-6 md:h-8 w-48 rounded-lg" />
            <Skeleton className="h-10 md:h-12 w-32 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardBody className="p-4 md:p-6">
                  <Skeleton className="h-20 md:h-24 w-full rounded" />
                </CardBody>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
            <Card className="lg:col-span-3">
              <CardBody className="p-4 md:p-6">
                <Skeleton className="h-48 md:h-64 w-full rounded" />
              </CardBody>
            </Card>
            <Card className="lg:col-span-2">
              <CardBody className="p-4 md:p-6">
                <Skeleton className="h-48 md:h-64 w-full rounded" />
              </CardBody>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Error al cargar datos del dashboard</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }
  
  const { stats, chartData, recentActivity } = data

  const statsCards = [
    { title: 'Clientes', value: stats.customers, icon: Users, bgGradient: 'from-blue-400 to-blue-600', description: 'Total de clientes registrados.' },
    { title: 'Ventas de Hoy', value: stats.dailySales, icon: ShoppingCart, bgGradient: 'from-purple-400 to-purple-600', description: 'Número de ventas realizadas hoy.' },
    { title: 'Ingresos de Hoy', value: format(stats.dailyRevenue), icon: DollarSign, bgGradient: 'from-emerald-400 to-green-600', description: `Total ingresado hoy en ${currencyCode}.` },
    { title: 'Ingresos Pendientes', value: format(stats.potentialRevenue), icon: Wrench, bgGradient: 'from-orange-400 to-red-500', description: 'Valor estimado de reparaciones activas.' },
    { title: 'Reparaciones Activas', value: stats.repairs, icon: Wrench, bgGradient: 'from-indigo-400 to-purple-500', description: 'Reparaciones pendientes o en proceso.' },
  ]
  
  const statusLabels: Record<string, string> = { 'received': 'Recibido', 'diagnosed': 'Diagnosticado', 'in_progress': 'En Proceso', 'waiting_parts': 'Esperando Repuestos', 'completed': 'Completado', 'delivered': 'Entregado', 'cancelled': 'Cancelado' }

  const baseChartOptions: ApexOptions = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'inherit',
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    legend: { position: 'bottom', horizontalAlign: 'center', offsetY: 10, labels: { colors: '#6b7280' } },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4,
    },
    tooltip: {
      theme: 'dark',
      x: { show: false }
    }
  }

  const salesChartSeries = [{
    name: `Ingresos (${currencyCode})`,
    data: chartData.salesLast7Days.map(d => d.total),
  }]
  
  const salesChartOptions: ApexOptions = {
    ...baseChartOptions,
    chart: { ...baseChartOptions.chart, type: 'area' },
    xaxis: {
      categories: chartData.salesLast7Days.map(d => d.day),
      labels: { style: { colors: '#6b7280' } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { colors: '#6b7280' },
        formatter: (val) => format(val)
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100]
      }
    },
    colors: ['#4f46e5'],
    stroke: { width: 2, curve: 'smooth' },
  }

  const repairsChartSeries = Object.values(chartData.repairsByStatus)
  const repairsChartOptions: ApexOptions = {
    ...baseChartOptions,
    chart: { ...baseChartOptions.chart, type: 'donut' },
    labels: Object.keys(chartData.repairsByStatus).map(s => statusLabels[s] || s),
    colors: ['#6b7280', '#f59e0b', '#3b82f6', '#f97316', '#10b981', '#22c55e', '#ef4444'],
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              color: '#6b7280',
              formatter: (w) => w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toString()
            }
          }
        }
      }
    }
  }

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds > 86400 * 30) return `${new Date(date).toLocaleDateString()}`;
    let interval = seconds / 86400;
    if (interval > 1) return `hace ${Math.floor(interval)}d`;
    interval = seconds / 3600;
    if (interval > 1) return `hace ${Math.floor(interval)}h`;
    interval = seconds / 60;
    if (interval > 1) return `hace ${Math.floor(interval)}m`;
    return `hace ${Math.floor(seconds)}s`;
  }
  
  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'venta': return ShoppingCart;
      case 'reparación': return Wrench;
      default: return Activity;
    }
  }

  const getActivityColor = (type: string) => {
    switch(type) {
      case 'venta': return 'purple';
      case 'reparación': return 'orange';
      default: return 'gray';
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
            <p className={`text-sm md:text-base ${textColors.secondary} mt-1`}>Resumen completo de tu negocio</p>
          </div>
          <div className="flex gap-2">
            <LanguageCurrencySelector />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardBody className="p-4 md:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs md:text-sm font-medium ${textColors.tertiary} uppercase tracking-wide truncate`}>
                        {stat.title}
                      </p>
                      <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mt-1 truncate">
                        {stat.value}
                      </p>
                      <p className={`text-xs md:text-sm ${textColors.muted} mt-2 line-clamp-2`}>
                        {stat.description}
                      </p>
                    </div>
                    <div className={`p-2 md:p-3 rounded-xl bg-gradient-to-br ${stat.bgGradient} shadow-lg flex-shrink-0 ml-3`}>
                      <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
          {/* Sales Chart */}
          <Card className="lg:col-span-3 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2 md:pb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900">Ingresos de los Últimos 7 Días</h3>
                  <p className={`text-xs md:text-sm ${textColors.secondary}`}>Evolución de ventas diarias</p>
                </div>
                <Chip color="primary" variant="flat" size="sm">
                  {currencyCode}
                </Chip>
              </div>
            </CardHeader>
            <CardBody className="pt-0 px-3 md:px-6 pb-4 md:pb-6">
              <div className="h-48 md:h-64">
                <Chart
                  options={salesChartOptions}
                  series={salesChartSeries}
                  type="area"
                  height="100%"
                />
              </div>
            </CardBody>
          </Card>

          {/* Repairs Status Chart */}
          <Card className="lg:col-span-2 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2 md:pb-4">
              <div>
                <h3 className="text-base md:text-lg font-bold text-gray-900">Estado de Reparaciones</h3>
                <p className={`text-xs md:text-sm ${textColors.secondary}`}>Distribución actual</p>
              </div>
            </CardHeader>
            <CardBody className="pt-0 px-3 md:px-6 pb-4 md:pb-6">
              <div className="h-48 md:h-64">
                <Chart
                  options={repairsChartOptions}
                  series={repairsChartSeries}
                  type="donut"
                  height="100%"
                />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2 md:pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-base md:text-lg font-bold text-gray-900">Actividad Reciente</h3>
                <p className={`text-xs md:text-sm ${textColors.secondary}`}>Últimas acciones en el sistema</p>
              </div>
              <Chip color="success" variant="flat" size="sm">
                {recentActivity.length} eventos
              </Chip>
            </div>
          </CardHeader>
          <CardBody className="pt-0 px-3 md:px-6 pb-4 md:pb-6">
            {recentActivity.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {recentActivity.slice(0, 8).map((activity, index) => {
                  const Icon = getActivityIcon(activity.type)
                  const color = getActivityColor(activity.type)
                  
                  return (
                    <div key={index} className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className={`p-2 rounded-lg bg-${color}-100 flex-shrink-0`}>
                        <Icon className={`h-4 w-4 md:h-5 md:w-5 text-${color}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm md:text-base font-medium text-gray-900 truncate">{activity.title}</p>
                        {activity.customer && (
                          <p className={`text-xs md:text-sm ${textColors.muted} truncate`}>Cliente: {activity.customer}</p>
                        )}
                      </div>
                      <p className={`text-xs md:text-sm ${textColors.tertiary} flex-shrink-0`}>
                        {timeAgo(activity.time)}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 md:py-12">
                <Activity className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 md:mb-4" />
                <p className={`text-sm md:text-base ${textColors.secondary}`}>No hay actividad reciente</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  )
} 