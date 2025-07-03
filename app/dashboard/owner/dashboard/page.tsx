'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import DashboardLayout from '../components/DashboardLayout'
import { useCurrency } from '@/lib/contexts/TranslationContext'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import { Card, CardBody, CardHeader, Skeleton } from '@heroui/react'
import { 
  Users, Wrench, DollarSign, Package, Clock, CheckCircle, Smartphone, TrendingUp, BarChart, PieChart, AlertTriangle, Activity
} from 'lucide-react'
import { ApexOptions } from 'apexcharts'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

// Interfaces
interface Counters {
  todayRepairs: number;
  totalDevices: number;
  totalRepairs: number;
  totalRevenue: number;
  pendingRepairs: number;
  totalCustomers: number;
  completedRepairs: number;
  inProgressRepairs: number;
  dailyRevenue: number; 
  totalUnlocks: number; 
  todayUnlocks: number;
}

interface Charts {
  deviceTypes: Record<string, number>;
  weeklyRepairs: { date: string; count: number }[];
  weeklyRevenue: { date: string; revenue: number }[];
  statusDistribution: Record<string, number>;
}

interface Activity {
  id: string;
  type: 'reparacion' | 'desbloqueo';
  title: string;
  timestamp: string;
}

interface DashboardData {
  counters: Counters;
  charts: Charts;
  recentActivity: Activity[];
}

export default function DashboardPage() {
  const { t } = useTranslations()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { format, currencyCode } = useCurrency()
  const [refreshKey, setRefreshKey] = useState(0)

  const compactFormatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
    notation: 'compact'
  });

  useEffect(() => {
    const handleStorageChange = () => setRefreshKey(prev => prev + 1)
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/stats')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar estadísticas')
      }
      const result = await response.json()
      console.log('📊 Dashboard response:', result)
      
      // Validar estructura de datos
      if (!result.success || !result.data) {
        throw new Error('Respuesta inválida del servidor')
      }
      
      if (!result.data.counters) {
        throw new Error('Datos de contadores no disponibles')
      }
      
      setData(result.data) 
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-6 space-y-6">
          <Skeleton className="h-10 w-1/2 rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}><CardBody><Skeleton className="h-28 w-full rounded-lg" /></CardBody></Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card><CardBody><Skeleton className="h-72 w-full rounded-lg" /></CardBody></Card>
            <Card><CardBody><Skeleton className="h-72 w-full rounded-lg" /></CardBody></Card>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full p-4">
          <Card className="max-w-md w-full">
            <CardBody className="text-center p-8">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">Error al Cargar el Dashboard</h2>
              <p className="text-gray-600 mb-6">{error || 'No se pudieron obtener los datos. Inténtalo de nuevo más tarde.'}</p>
              <button
                onClick={fetchStats}
                className="bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-300"
              >
                Reintentar
              </button>
            </CardBody>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const { counters, charts, recentActivity } = data

  // Validación adicional para prevenir errores
  if (!counters) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full p-4">
          <Card className="max-w-md w-full">
            <CardBody className="text-center p-8">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">Datos Incompletos</h2>
              <p className="text-gray-600 mb-6">Los datos del dashboard no están disponibles. Inténtalo de nuevo.</p>
              <button
                onClick={fetchStats}
                className="bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-300"
              >
                Reintentar
              </button>
            </CardBody>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const statsCards = [
    { title: t('dashboard.dailyRevenue'), value: format(counters.dailyRevenue || 0), icon: DollarSign, bg: 'bg-gradient-to-br from-green-400 to-green-600' },
    { title: t('dashboard.todayRepairs'), value: counters.todayRepairs || 0, icon: Wrench, bg: 'bg-gradient-to-br from-blue-400 to-blue-600' },
    { title: t('dashboard.todayUnlocks'), value: counters.todayUnlocks || 0, icon: Package, bg: 'bg-gradient-to-br from-purple-400 to-purple-600' },
    { title: t('dashboard.pendingRepairs'), value: counters.pendingRepairs || 0, icon: Clock, bg: 'bg-gradient-to-br from-orange-400 to-orange-600' },
    { title: t('dashboard.inProgressRepairs'), value: counters.inProgressRepairs || 0, icon: Wrench, bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600' },
    { title: t('dashboard.totalCustomers'), value: counters.totalCustomers || 0, icon: Users, bg: 'bg-gradient-to-br from-pink-400 to-pink-600' },
  ]
  
  const statusLabels: Record<string, string> = { 
    'pending': t('repairs.status.pending'), 
    'in_progress': t('repairs.status.in_progress'), 
    'completed': t('repairs.status.completed'), 
    'delivered': t('repairs.status.delivered'),
    'cancelled': t('repairs.status.cancelled'),
    'diagnosed': t('repairs.status.diagnosed'),
    'received': t('repairs.status.received'),
    'waiting_parts': t('repairs.status.waiting_parts')
  };

  const baseChartOptions: ApexOptions = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'inherit',
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    grid: {
      show: true,
      borderColor: '#e5e7eb',
      strokeDashArray: 4,
      padding: { left: 10, right: 10, top: 10 }
    },
    tooltip: {
      theme: 'dark'
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      offsetY: 10,
      labels: {
        colors: '#4b5563' 
      },
      itemMargin: { horizontal: 10 }
    }
  }

  const revenueChartSeries = [{
    name: `${t('dashboard.weeklyRevenue')} (${currencyCode})`,
    data: (charts?.weeklyRevenue || []).map(d => d.revenue || 0),
  }]
  
  const revenueChartOptions: ApexOptions = {
    ...baseChartOptions,
    chart: { ...baseChartOptions.chart, type: 'area' },
    xaxis: {
      categories: (charts?.weeklyRevenue || []).map(d => new Date(d.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric'})),
      labels: { style: { colors: '#6b7280', fontWeight: 600 } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: '#6b7280', fontWeight: 600 },
        formatter: (val) => compactFormatter.format(val)
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100],
        colorStops: [
            {
              offset: 0,
              color: 'rgba(52, 211, 153, 0.4)',
              opacity: 1
            },
            {
              offset: 100,
              color: 'rgba(52, 211, 153, 0)',
              opacity: 1
            }
        ]
      }
    },
    colors: ['#34D399'],
    stroke: { width: 3, curve: 'smooth' },
    tooltip: { ...baseChartOptions.tooltip, y: { formatter: val => format(val) }}
  }
  
  const repairsChartSeries = [{
    name: t('dashboard.weeklyRepairs'),
    data: (charts?.weeklyRepairs || []).map(d => d.count || 0),
  }]

  const repairsChartOptions: ApexOptions = {
    ...baseChartOptions,
    chart: { ...baseChartOptions.chart, type: 'bar' },
    xaxis: {
      categories: (charts?.weeklyRepairs || []).map(d => new Date(d.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric'})),
      labels: { style: { colors: '#6b7280', fontWeight: 600 } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: '#6b7280', fontWeight: 600 },
        formatter: (val) => String(Math.round(val))
      }
    },
    plotOptions: { bar: { columnWidth: '45%', borderRadius: 6, distributed: true }},
    colors: ['#60a5fa', '#818cf8', '#a78bfa', '#f472b6', '#fb923c', '#facc15', '#4ade80'],
    tooltip: { ...baseChartOptions.tooltip, y: { formatter: val => `${Math.round(val)} Reparaciones` }}
  }

  const statusChartSeries = Object.values(charts?.statusDistribution || {});
  const statusChartLabels = Object.keys(charts?.statusDistribution || {}).map(s => statusLabels[s] || s);

  const statusChartOptions: ApexOptions = {
    ...baseChartOptions,
    chart: { ...baseChartOptions.chart, type: 'donut' },
    labels: statusChartLabels,
    colors: ['#f97316', '#eab308', '#22c55e'],
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          background: 'transparent',
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: t('common.total'),
              fontSize: '18px',
              fontWeight: 600,
              color: '#374151',
              formatter: (w) => w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toString()
            }
          }
        }
      }
    },
    stroke: { width: 0 },
    tooltip: { ...baseChartOptions.tooltip, y: { formatter: (val) => String(val), title: { formatter: (seriesName) => seriesName } } },
  };
  
  const deviceTypesSeries = Object.values(charts?.deviceTypes || {});
  const deviceTypesLabels = Object.keys(charts?.deviceTypes || {}).map(type => t(`devices.${type}`) || type);

  const deviceTypesChartOptions: ApexOptions = {
      ...baseChartOptions,
      chart: { ...baseChartOptions.chart, type: 'pie' },
      labels: deviceTypesLabels,
      colors: ['#38bdf8', '#a78bfa', '#f472b6', '#34d399', '#fbbf24'],
      stroke: { width: 0 },
      plotOptions: { pie: {
        dataLabels: {
          offset: -15,
        }
      } },
      tooltip: { ...baseChartOptions.tooltip, y: { formatter: (val) => String(val) } },
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds > 86400 * 30) return new Date(date).toLocaleDateString();
    let interval = seconds / 86400;
    if (interval > 1) return t('time.daysAgo', { count: Math.floor(interval) });
    interval = seconds / 3600;
    if (interval > 1) return t('time.hoursAgo', { count: Math.floor(interval) });
    interval = seconds / 60;
    if (interval > 1) return t('time.minutesAgo', { count: Math.floor(interval) });
    return t('time.secondsAgo', { count: Math.floor(seconds) });
  }
  
  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'reparacion': return <Wrench className="h-5 w-5 text-white" />;
      case 'desbloqueo': return <Package className="h-5 w-5 text-white" />;
      default: return <Activity className="h-5 w-5 text-white" />;
    }
  }

  const getActivityColor = (type: string) => {
    switch(type) {
      case 'reparacion': return 'bg-blue-500';
      case 'desbloqueo': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8 space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-gray-500 mt-2 text-lg">{t('dashboard.subtitle')}</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsCards.map((stat) => (
            <Card key={stat.title} className={`${stat.bg} text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
              <CardBody className="flex items-center p-6">
                <div className="flex-shrink-0 mr-4">
                   <stat.icon className="h-10 w-10" />
                </div>
                <div>
                   <p className="text-4xl font-bold">{stat.value}</p>
                   <p className="text-sm font-medium opacity-80 uppercase tracking-wider">{stat.title}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
        
        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary-600"/>
                <h2 className="text-xl font-bold text-gray-700">{t('dashboard.weeklyRevenue')}</h2>
            </CardHeader>
            <CardBody>
              <Chart options={revenueChartOptions} series={revenueChartSeries} type="area" height={300} />
            </CardBody>
          </Card>
          <Card className="lg:col-span-2 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex items-center gap-2">
                <BarChart className="h-6 w-6 text-primary-600"/>
                <h2 className="text-xl font-bold text-gray-700">{t('dashboard.weeklyRepairs')}</h2>
            </CardHeader>
            <CardBody>
              <Chart options={repairsChartOptions} series={repairsChartSeries} type="bar" height={300} />
            </CardBody>
          </Card>
        </div>

        {/* Donut & Pie Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex items-center gap-2">
                <PieChart className="h-6 w-6 text-primary-600"/>
                <h2 className="text-xl font-bold text-gray-700">{t('dashboard.statusDistribution')}</h2>
            </CardHeader>
            <CardBody className="flex justify-center items-center">
              <div className="w-full max-w-xs">
                 <Chart options={statusChartOptions} series={statusChartSeries} type="donut" height={350} />
              </div>
            </CardBody>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex items-center gap-2">
                <BarChart className="h-6 w-6 text-primary-600"/>
                <h2 className="text-xl font-bold text-gray-700">{t('dashboard.recentActivity')}</h2>
            </CardHeader>
            <CardBody>
              {recentActivity && recentActivity.length > 0 ? (
                <ul className="space-y-4">
                  {recentActivity.map((activity) => (
                    <li key={activity.id} className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm">{activity.title}</p>
                        <p className="text-xs text-gray-500">{timeAgo(activity.timestamp)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                   <Activity className="h-12 w-12 mb-2"/>
                   <p>{t('dashboard.noRecentActivity')}</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
} 