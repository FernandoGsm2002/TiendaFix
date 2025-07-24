'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import DashboardLayout from '../components/DashboardLayout'
import { useCurrency } from '@/lib/contexts/TranslationContext'
import { useTranslations } from '@/lib/contexts/TranslationContext'
import WelcomeHeader from '@/app/components/ui/WelcomeHeader'
import { 
  Card, CardBody, CardHeader, Skeleton, Chip, Progress, Button 
} from '@heroui/react'
import { 
  Users, Wrench, DollarSign, Package, Clock, CheckCircle, Smartphone, 
  TrendingUp, BarChart, PieChart, AlertTriangle, Activity, ArrowUpRight, 
  ArrowDownRight, Minus, Zap, UserCheck, Eye, EyeOff
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
  const [isRevenueHidden, setIsRevenueHidden] = useState(false)

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
              <h2 className="text-xl font-bold text-slate-800 mb-2">Error al Cargar el Dashboard</h2>
              <p className="text-slate-600 mb-6">{error || 'No se pudieron obtener los datos. Inténtalo de nuevo más tarde.'}</p>
              <button
                onClick={fetchStats}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
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
              <h2 className="text-xl font-bold text-slate-800 mb-2">Datos Incompletos</h2>
              <p className="text-slate-600 mb-6">Los datos del dashboard no están disponibles. Inténtalo de nuevo.</p>
              <button
                onClick={fetchStats}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
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
    { 
      title: t('dashboard.dailyRevenue'), 
      value: format(counters.dailyRevenue || 0), 
      icon: DollarSign, 
      trend: '+12%',
      trendDirection: 'up' as const,
      color: 'default' as const,
      bgClass: 'bg-gradient-to-br from-[#E8F0FE] to-[#D1E7FF] border border-[#004085]/20',
      iconBg: 'bg-gradient-to-br from-[#004085] to-[#003366]',
      textColor: 'text-[#343A40]',
      description: 'Ingresos de hoy'
    },
    { 
      title: t('dashboard.todayRepairs'), 
      value: counters.todayRepairs || 0, 
      icon: Wrench, 
      trend: '+8%',
      trendDirection: 'up' as const,
      color: 'primary' as const,
          bgClass: 'bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] border border-[#6C757D]/20',
    iconBg: 'bg-gradient-to-br from-[#004085] to-[#003366]',
    textColor: 'text-[#343A40]',
      description: 'Reparaciones iniciadas'
    },
    { 
      title: t('dashboard.todayUnlocks'), 
      value: counters.todayUnlocks || 0, 
      icon: Zap, 
      trend: '+15%',
      trendDirection: 'up' as const,
      color: 'secondary' as const,
      bgClass: 'bg-gradient-to-br from-[#E8F0FE] to-[#D1E7FF] border border-[#004085]/20',
      iconBg: 'bg-gradient-to-br from-[#004085] to-[#003366]',
      textColor: 'text-[#343A40]',
      description: 'Desbloqueos completados'
    },
    { 
      title: t('dashboard.pendingRepairs'), 
      value: counters.pendingRepairs || 0, 
      icon: Clock, 
      trend: '-3%',
      trendDirection: 'down' as const,
      color: 'warning' as const,
      bgClass: 'bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] border border-[#6C757D]/20',
      iconBg: 'bg-gradient-to-br from-[#6C757D] to-[#495057]',
      textColor: 'text-[#343A40]',
      description: 'Trabajos pendientes'
    },
    { 
      title: t('dashboard.inProgressRepairs'), 
      value: counters.inProgressRepairs || 0, 
      icon: Activity, 
      trend: '0%',
      trendDirection: 'neutral' as const,
      color: 'success' as const,
      bgClass: 'bg-gradient-to-br from-[#E8F0FE] to-[#D1E7FF] border border-[#004085]/20',
      iconBg: 'bg-gradient-to-br from-[#004085] to-[#003366]',
      textColor: 'text-[#343A40]',
      description: 'En progreso activo'
    },
    { 
      title: t('dashboard.totalCustomers'), 
      value: counters.totalCustomers || 0, 
      icon: UserCheck, 
      trend: '+5%',
      trendDirection: 'up' as const,
      color: 'default' as const,
      bgClass: 'bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] border border-[#6C757D]/20',
      iconBg: 'bg-gradient-to-br from-[#6C757D] to-[#495057]',
      textColor: 'text-[#343A40]',
      description: 'Base de clientes'
    },
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
              color: 'rgba(34, 197, 94, 0.4)',
              opacity: 1
            },
            {
              offset: 100,
              color: 'rgba(34, 197, 94, 0)',
              opacity: 1
            }
        ]
      }
    },
    colors: ['#10b981'],
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
    colors: ['#004085', '#6C757D', '#28A745', '#FF8C00', '#004085', '#6C757D', '#28A745'],
    tooltip: { ...baseChartOptions.tooltip, y: { formatter: val => `${Math.round(val)} Reparaciones` }}
  }

  const statusChartSeries = Object.values(charts?.statusDistribution || {});
  const statusChartLabels = Object.keys(charts?.statusDistribution || {}).map(s => statusLabels[s] || s);

  const statusChartOptions: ApexOptions = {
    ...baseChartOptions,
    chart: { ...baseChartOptions.chart, type: 'donut' },
    labels: statusChartLabels,
    colors: ['#64748b', '#3b82f6', '#475569', '#2563eb', '#1d4ed8'],
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
      colors: ['#3b82f6', '#64748b', '#475569', '#334155', '#1e293b'],
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
      case 'reparacion': return 'bg-[#004085]';
      case 'desbloqueo': return 'bg-[#28A745]';
      default: return 'bg-[#6C757D]';
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 w-full h-full">
        <WelcomeHeader />

        {/* Enhanced Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsCards.map((stat, index) => (
            <Card 
              key={stat.title} 
              className={`${stat.bgClass} shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-200 relative overflow-hidden group`}
              isHoverable
            >
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardBody className="p-6 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.iconBg} shadow-lg`}>
                    <stat.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Botón de ocultar/mostrar solo para el card de ingresos diarios (primer card) */}
                    {index === 0 && (
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => setIsRevenueHidden(!isRevenueHidden)}
                        className={`${stat.textColor} hover:bg-white/20 transition-all`}
                        aria-label={isRevenueHidden ? "Mostrar monto" : "Ocultar monto"}
                      >
                        {isRevenueHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    )}
                    <Chip 
                      size="sm"
                      color={stat.trendDirection === 'up' ? 'success' : stat.trendDirection === 'down' ? 'danger' : 'default'}
                      variant="flat"
                      className={`text-xs font-semibold bg-white/60 ${stat.textColor} border border-white/30`}
                      startContent={
                        stat.trendDirection === 'up' ? <ArrowUpRight className="h-3 w-3" /> :
                        stat.trendDirection === 'down' ? <ArrowDownRight className="h-3 w-3" /> :
                        <Minus className="h-3 w-3" />
                      }
                    >
                      {stat.trend}
                    </Chip>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className={`text-4xl font-extrabold ${stat.textColor} mb-2 tracking-tight`}>
                      {/* Mostrar asteriscos si es el primer card y está oculto */}
                      {index === 0 && isRevenueHidden ? '******' : stat.value}
                    </p>
                    <p className={`text-base font-bold ${stat.textColor} opacity-90 uppercase tracking-wider`}>
                      {stat.title}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${stat.textColor} opacity-70`}>{stat.description}</p>
                    <Chip 
                      size="sm" 
                      variant="flat" 
                      className={`${stat.textColor} bg-white/60 border border-white/30 font-semibold`}
                    >
                      Hoy
                    </Chip>
                  </div>
                  
                  {/* Progress indicator for some cards */}
                  {(stat.title.includes('pendientes') || stat.title.includes('progreso')) && (
                    <Progress 
                      value={stat.trendDirection === 'up' ? 75 : stat.trendDirection === 'down' ? 45 : 60}
                      size="sm"
                      className="mt-2"
                      classNames={{
                        base: "max-w-full",
                        track: "drop-shadow-md border border-white/20",
                        indicator: stat.iconBg.replace('bg-gradient-to-br', '').replace('from-', 'bg-').split(' ')[0],
                      }}
                    />
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
        
        {/* Enhanced Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3 shadow-xl hover:shadow-2xl transition-all duration-300 border border-[#6C757D]/20 bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] backdrop-blur-sm">
            <CardHeader className="flex items-center gap-3 pb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#6C757D] to-[#495057] shadow-lg">
                <TrendingUp className="h-5 w-5 text-white"/>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#343A40]">{t('dashboard.weeklyRevenue')}</h2>
                <p className="text-sm text-[#6C757D]">Últimos 7 días</p>
              </div>
              <div className="ml-auto">
                <Chip 
                  size="sm" 
                  className="bg-gradient-to-r from-[#6C757D] to-[#495057] text-white shadow-sm"
                >
                  +12.5%
                </Chip>
              </div>
            </CardHeader>
            <CardBody>
              <Chart options={revenueChartOptions} series={revenueChartSeries} type="area" height={300} />
            </CardBody>
          </Card>
          
          <Card className="lg:col-span-2 shadow-xl hover:shadow-2xl transition-all duration-300 border border-[#004085]/20 bg-gradient-to-br from-[#E8F0FE] to-[#D1E7FF] backdrop-blur-sm">
            <CardHeader className="flex items-center gap-3 pb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#004085] to-[#003366] shadow-lg">
                <BarChart className="h-5 w-5 text-white"/>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#343A40]">{t('dashboard.weeklyRepairs')}</h2>
                <p className="text-sm text-[#6C757D]">Actividad semanal</p>
              </div>
            </CardHeader>
            <CardBody>
              <Chart options={repairsChartOptions} series={repairsChartSeries} type="bar" height={300} />
            </CardBody>
          </Card>
        </div>

        {/* Enhanced Donut & Pie Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border border-[#004085]/20 bg-gradient-to-br from-[#E8F0FE] to-[#D1E7FF] backdrop-blur-sm">
            <CardHeader className="flex items-center gap-3 pb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#004085] to-[#003366] shadow-lg">
                <PieChart className="h-5 w-5 text-white"/>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#343A40]">{t('dashboard.statusDistribution')}</h2>
                <p className="text-sm text-[#6C757D]">Estados de reparación</p>
              </div>
            </CardHeader>
            <CardBody className="flex justify-center items-center">
              <div className="w-full max-w-xs">
                 <Chart options={statusChartOptions} series={statusChartSeries} type="donut" height={350} />
              </div>
            </CardBody>
          </Card>
          
          <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border border-[#6C757D]/20 bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] backdrop-blur-sm">
            <CardHeader className="flex items-center gap-3 pb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#6C757D] to-[#495057] shadow-lg">
                <Activity className="h-5 w-5 text-white"/>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#343A40]">{t('dashboard.recentActivity')}</h2>
                <p className="text-sm text-[#6C757D]">Actividad reciente</p>
              </div>
            </CardHeader>
            <CardBody>
              {recentActivity && recentActivity.length > 0 ? (
                <ul className="space-y-4">
                  {recentActivity.map((activity) => (
                    <li key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-[#E8F0FE]/30 transition-colors duration-200">
                      <div className={`p-3 rounded-full shadow-lg ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[#343A40] text-sm">{activity.title}</p>
                        <p className="text-xs text-[#6C757D]">{timeAgo(activity.timestamp)}</p>
                      </div>
                      <Chip 
                        size="sm" 
                        variant="flat" 
                        className="bg-[#E8F0FE] text-[#004085] border border-[#004085]/20"
                      >
                        Nuevo
                      </Chip>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-[#6C757D] py-8">
                   <div className="p-4 rounded-full bg-[#E8F0FE] mb-4">
                     <Activity className="h-8 w-8 text-[#6C757D]"/>
                   </div>
                   <p className="font-medium text-[#343A40]">{t('dashboard.noRecentActivity')}</p>
                   <p className="text-sm text-[#6C757D] mt-1">La actividad aparecerá aquí</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
} 