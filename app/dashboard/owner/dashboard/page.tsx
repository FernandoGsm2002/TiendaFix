'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import DashboardLayout from '../components/DashboardLayout'
import { useCurrency } from '@/lib/utils/currency'
import LanguageCurrencySelector from '@/app/components/LanguageCurrencySelector'
import { Card, CardBody, CardHeader, Skeleton, Chip, Avatar } from '@heroui/react'
import { textColors } from '@/lib/utils/colors'
import { 
  Users, ShoppingCart, Wrench, DollarSign, Activity
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
        <div className="space-y-6">
          <div className="flex justify-between items-center"><Skeleton className="h-8 w-48 rounded-lg" /><Skeleton className="h-12 w-32 rounded-lg" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <Card key={i}><CardBody><Skeleton className="h-24 w-full rounded" /></CardBody></Card>)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-3"><CardBody><Skeleton className="h-64 w-full rounded" /></CardBody></Card>
            <Card className="lg:col-span-2"><CardBody><Skeleton className="h-64 w-full rounded" /></CardBody></Card>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !data) {
    return <DashboardLayout><div>Error al cargar datos...</div></DashboardLayout>
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
      case 'venta': return <ShoppingCart className="w-5 h-5 text-purple-500" />;
      case 'reparación': return <Wrench className="w-5 h-5 text-orange-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dashboard TiendaFix</h1>
            <p className={`${textColors.secondary} text-lg`}>Resumen de actividad y rendimiento.</p>
          </div>
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200"><CardBody className="p-4"><LanguageCurrencySelector compact={true} /></CardBody></Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {statsCards.map((card, index) => (
            <Card key={index} className={`border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br ${card.bgGradient}`}>
              <CardBody className="p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium uppercase tracking-wider opacity-80">{card.title}</p>
                    <p className="text-4xl font-bold">{card.value}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl"><card.icon className="w-6 h-6" /></div>
                  </div>
                <p className="text-xs opacity-70 mt-4">{card.description}</p>
                </CardBody>
              </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3">
            <CardHeader><h3 className={`text-lg font-semibold ${textColors.primary}`}>Ingresos de la Última Semana</h3></CardHeader>
            <CardBody>
              <div className="h-72">
                <Chart options={salesChartOptions} series={salesChartSeries} type="area" height="100%" />
              </div>
            </CardBody>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader><h3 className={`text-lg font-semibold ${textColors.primary}`}>Estado de Reparaciones</h3></CardHeader>
            <CardBody>
              <div className="h-72">
                <Chart options={repairsChartOptions} series={repairsChartSeries} type="donut" height="100%" />
              </div>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader><h3 className={`text-lg font-semibold ${textColors.primary}`}>Actividad Reciente</h3></CardHeader>
          <CardBody className="space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((act, i) => (
              <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
                <Avatar icon={getActivityIcon(act.type)} size="md" />
                <div className="flex-1">
                  <p className={`font-medium ${textColors.primary}`}>{act.title}</p>
                  <p className={`text-sm ${textColors.secondary}`}>{act.customer || 'Sistema'}</p>
                </div>
                <p className={`text-sm ${textColors.tertiary}`}>{timeAgo(act.time)}</p>
              </div>
            )) : <p className="text-center text-gray-500 py-4">No hay actividad reciente.</p>}
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  )
} 