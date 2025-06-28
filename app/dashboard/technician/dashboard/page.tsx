'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import TechnicianDashboardLayout from '../components/TechnicianDashboardLayout'
import { useCurrency } from '@/lib/utils/currency'
import { Card, CardBody, CardHeader, Skeleton, Chip, Avatar, Progress } from '@heroui/react'
import { textColors } from '@/lib/utils/colors'
import { 
  Wrench, Clock, CheckCircle, AlertTriangle, TrendingUp, Activity, Target, Calendar, DollarSign
} from 'lucide-react'
import { ApexOptions } from 'apexcharts'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface TechnicianStats {
  assignedRepairs: number
  completedRepairs: number
  inProgressRepairs: number
  pendingRepairs: number
  assignedUnlocks: number
  completedUnlocks: number
  inProgressUnlocks: number
  pendingUnlocks: number
  weeklyEfficiency: number
  monthlyRevenue: number
  totalRepairRevenue: number
  totalUnlockRevenue: number
  todayTasks: number
}

interface ChartData {
  repairsByStatus: Record<string, number>
  completionTimeline: { day: string; completed: number }[]
  efficiencyTrend: { week: string; efficiency: number }[]
}

interface Activity {
  type: string
  title: string
  time: string
  customer?: string
  repairId?: string
}

interface TechnicianDashboardData {
  stats: TechnicianStats
  chartData: ChartData
  recentActivity: Activity[]
}

// Datos mock por defecto (solo como fallback)
const defaultData: TechnicianDashboardData = {
  stats: {
    assignedRepairs: 0,
    completedRepairs: 0,
    inProgressRepairs: 0,
    pendingRepairs: 0,
    assignedUnlocks: 0,
    completedUnlocks: 0,
    inProgressUnlocks: 0,
    pendingUnlocks: 0,
    weeklyEfficiency: 0,
    monthlyRevenue: 0,
    totalRepairRevenue: 0,
    totalUnlockRevenue: 0,
    todayTasks: 0
  },
  chartData: {
    repairsByStatus: {
      'pending': 5,
      'in_progress': 3,
      'completed': 15,
      'waiting_parts': 2
    },
    completionTimeline: [
      { day: 'Lun', completed: 2 },
      { day: 'Mar', completed: 3 },
      { day: 'Mié', completed: 1 },
      { day: 'Jue', completed: 4 },
      { day: 'Vie', completed: 3 },
      { day: 'Sáb', completed: 1 },
      { day: 'Dom', completed: 1 }
    ],
    efficiencyTrend: [
      { week: 'S1', efficiency: 85 },
      { week: 'S2', efficiency: 89 },
      { week: 'S3', efficiency: 82 },
      { week: 'S4', efficiency: 87 }
    ]
  },
  recentActivity: [
    { type: 'repair_completed', title: 'Reparación completada', time: '2024-01-15T10:00:00Z', customer: 'Juan Pérez', repairId: '12345' },
    { type: 'repair_started', title: 'Nueva reparación iniciada', time: '2024-01-15T09:30:00Z', customer: 'María García', repairId: '12346' },
    { type: 'repair_diagnosed', title: 'Diagnóstico completado', time: '2024-01-15T08:45:00Z', customer: 'Carlos López', repairId: '12347' }
  ]
}

export default function TechnicianDashboardPage() {
  const [data, setData] = useState<TechnicianDashboardData>(defaultData)
  const [loading, setLoading] = useState(true)
  const { format, currencyCode, symbol } = useCurrency()

  useEffect(() => {
    fetchTechnicianStats()
  }, [])

  const fetchTechnicianStats = async () => {
    try {
      setLoading(true)
      
      // Intentar cargar estadísticas reales desde el API de estadísticas del técnico
      const response = await fetch('/api/dashboard/technician-stats')
      
      if (response.ok) {
        const result = await response.json()
        
        if (result.success && result.data) {
          setData(result.data)
        } else {
          console.warn('No se pudieron obtener estadísticas válidas, usando datos mock')
          setData(defaultData)
        }
      } else {
        // Usar datos mock si la API no está disponible
        console.warn('API de estadísticas no disponible, usando datos mock')
        setData(defaultData)
      }
    } catch (err) {
      console.warn('No se pudieron cargar las estadísticas, usando datos mock')
      setData(defaultData)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <TechnicianDashboardLayout>
        <div className="space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Skeleton className="h-6 md:h-8 w-48 rounded-lg" />
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <Card className="lg:col-span-2">
              <CardBody className="p-4 md:p-6">
                <Skeleton className="h-48 md:h-64 w-full rounded" />
              </CardBody>
            </Card>
            <Card>
              <CardBody className="p-4 md:p-6">
                <Skeleton className="h-48 md:h-64 w-full rounded" />
              </CardBody>
            </Card>
          </div>
        </div>
      </TechnicianDashboardLayout>
    )
  }

  const { stats, chartData, recentActivity } = data

  const statsCards = [
    { 
      title: 'Mis Reparaciones', 
      value: stats.assignedRepairs, 
      icon: Wrench, 
      bgGradient: 'from-blue-400 to-blue-600', 
      description: 'Trabajos actuales'
    },
    { 
      title: 'Completadas Este Mes', 
      value: stats.completedRepairs, 
      icon: CheckCircle, 
      bgGradient: 'from-green-400 to-green-600', 
      description: 'Reparaciones finalizadas'
    },
    { 
      title: 'Ingresos del Mes', 
      value: format(stats.monthlyRevenue), 
      icon: DollarSign, 
      bgGradient: 'from-emerald-400 to-emerald-600', 
      description: 'Reparaciones + Desbloqueos'
    },
    { 
      title: 'Eficiencia Semanal', 
      value: `${stats.weeklyEfficiency}%`, 
      icon: TrendingUp, 
      bgGradient: 'from-purple-400 to-purple-600', 
      description: 'Rendimiento de la semana'
    }
  ]
  
  const statusLabels: Record<string, string> = {
    'pending': 'Pendiente',
    'in_progress': 'En Proceso',
    'completed': 'Completado',
    'waiting_parts': 'Esperando Repuestos'
  }

  const baseChartOptions: ApexOptions = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'inherit',
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    legend: { 
      position: 'bottom', 
      horizontalAlign: 'center', 
      offsetY: 10, 
      labels: { colors: '#6b7280' } 
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4,
    },
    tooltip: {
      theme: 'dark',
      x: { show: false }
    }
  }

  // Gráfico de reparaciones por estado
  const repairsChartSeries = Object.values(chartData.repairsByStatus)
  const repairsChartOptions: ApexOptions = {
    ...baseChartOptions,
    chart: { ...baseChartOptions.chart, type: 'donut' },
    labels: Object.keys(chartData.repairsByStatus).map(s => statusLabels[s] || s),
    colors: ['#f59e0b', '#3b82f6', '#10b981', '#f97316'],
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
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

  // Gráfico de completadas por día
  const completionChartSeries = [{
    name: 'Completadas',
    data: chartData.completionTimeline.map(d => d.completed),
  }]
  
  const completionChartOptions: ApexOptions = {
    ...baseChartOptions,
    chart: { ...baseChartOptions.chart, type: 'bar' },
    xaxis: {
      categories: chartData.completionTimeline.map(d => d.day),
      labels: { style: { colors: '#6b7280' } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { colors: '#6b7280' },
        formatter: (val) => Math.floor(val).toString()
      },
      min: 0
    },
    colors: ['#10b981'],
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '60%',
      }
    }
  }

  // Gráfico de eficiencia
  const efficiencyChartSeries = [{
    name: 'Eficiencia (%)',
    data: chartData.efficiencyTrend.map(d => d.efficiency),
  }]
  
  const efficiencyChartOptions: ApexOptions = {
    ...baseChartOptions,
    chart: { ...baseChartOptions.chart, type: 'line' },
    xaxis: {
      categories: chartData.efficiencyTrend.map(d => d.week),
      labels: { style: { colors: '#6b7280' } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { colors: '#6b7280' },
        formatter: (val) => `${val}%`
      },
      min: 0,
      max: 100
    },
    colors: ['#8b5cf6'],
    stroke: { width: 3, curve: 'smooth' },
    markers: {
      size: 4,
      colors: ['#8b5cf6'],
      strokeColors: '#fff',
      strokeWidth: 2,
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
      case 'repair_completed': return CheckCircle;
      case 'repair_started': return Wrench;
      case 'repair_diagnosed': return Activity;
      case 'unlock_completed': return CheckCircle;
      case 'unlock_started': return Activity;
      case 'unlock_received': return Clock;
      default: return Clock;
    }
  }

  const getActivityColor = (type: string) => {
    switch(type) {
      case 'repair_completed': return 'green';
      case 'repair_started': return 'blue';
      case 'repair_diagnosed': return 'orange';
      case 'unlock_completed': return 'emerald';
      case 'unlock_started': return 'purple';
      case 'unlock_received': return 'yellow';
      default: return 'gray';
    }
  }

  return (
    <TechnicianDashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mi Panel de Trabajo
            </h1>
            <p className={`text-sm md:text-base ${textColors.secondary} mt-1`}>
              Gestiona tus reparaciones y seguimiento de tareas
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Completion Chart */}
          <Card className="lg:col-span-2 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-2 md:pb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900">Completadas Esta Semana</h3>
                  <p className={`text-xs md:text-sm ${textColors.secondary}`}>Reparaciones finalizadas por día</p>
                </div>
                <Chip color="success" variant="flat" size="sm">
                  Semanal
                </Chip>
              </div>
            </CardHeader>
            <CardBody className="pt-0 px-3 md:px-6 pb-4 md:pb-6">
              <div className="h-48 md:h-64">
                <Chart
                  options={completionChartOptions}
                  series={completionChartSeries}
                  type="bar"
                  height="100%"
                />
              </div>
            </CardBody>
          </Card>

          {/* Repairs Status Chart */}
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-2 md:pb-4">
              <div>
                <h3 className="text-base md:text-lg font-bold text-gray-900">Mis Reparaciones</h3>
                <p className={`text-xs md:text-sm ${textColors.secondary}`}>Estado actual</p>
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

        {/* Efficiency Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-2 md:pb-4">
              <div>
                <h3 className="text-base md:text-lg font-bold text-gray-900">Eficiencia Semanal</h3>
                <p className={`text-xs md:text-sm ${textColors.secondary}`}>Rendimiento actual</p>
              </div>
            </CardHeader>
            <CardBody className="pt-0 px-3 md:px-6 pb-4 md:pb-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm md:text-base font-medium text-gray-700">Progreso</span>
                  <span className="text-lg md:text-xl font-bold text-gray-900">{stats.weeklyEfficiency}%</span>
                </div>
                <Progress 
                  value={stats.weeklyEfficiency} 
                  color={stats.weeklyEfficiency >= 80 ? "success" : stats.weeklyEfficiency >= 60 ? "warning" : "danger"}
                  size="lg"
                  className="max-w-full"
                />
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <p className="text-xs md:text-sm text-gray-500">Completadas</p>
                    <p className="text-lg md:text-xl font-bold text-green-600">{stats.completedRepairs}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs md:text-sm text-gray-500">En Proceso</p>
                    <p className="text-lg md:text-xl font-bold text-blue-600">{stats.inProgressRepairs}</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-2 md:pb-4">
              <div>
                <h3 className="text-base md:text-lg font-bold text-gray-900">Ingresos del Mes</h3>
                <p className={`text-xs md:text-sm ${textColors.secondary}`}>Reparaciones y desbloqueos</p>
              </div>
            </CardHeader>
            <CardBody className="pt-0 px-3 md:px-6 pb-4 md:pb-6">
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {format(stats.monthlyRevenue)}
                  </p>
                  <p className={`text-xs md:text-sm ${textColors.muted}`}>Total generado este mes</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <p className="text-xs md:text-sm text-gray-500">Reparaciones</p>
                    <p className="text-sm md:text-base font-bold text-blue-600">{format(stats.totalRepairRevenue)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs md:text-sm text-gray-500">Desbloqueos</p>
                    <p className="text-sm md:text-base font-bold text-purple-600">{format(stats.totalUnlockRevenue)}</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-2 md:pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-base md:text-lg font-bold text-gray-900">Actividad Reciente</h3>
                <p className={`text-xs md:text-sm ${textColors.secondary}`}>Tus últimas acciones</p>
              </div>
              <Chip color="primary" variant="flat" size="sm">
                {recentActivity.length} eventos
              </Chip>
            </div>
          </CardHeader>
          <CardBody className="pt-0 px-3 md:px-6 pb-4 md:pb-6">
            {recentActivity.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {recentActivity.slice(0, 6).map((activity, index) => {
                  const Icon = getActivityIcon(activity.type)
                  const color = getActivityColor(activity.type)
                  
                  return (
                    <div key={index} className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
                      <div className={`p-2 rounded-lg bg-${color}-100 flex-shrink-0`}>
                        <Icon className={`h-4 w-4 md:h-5 md:w-5 text-${color}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm md:text-base font-medium text-gray-900 truncate">{activity.title}</p>
                        {activity.customer && (
                          <p className={`text-xs md:text-sm ${textColors.muted} truncate`}>Cliente: {activity.customer}</p>
                        )}
                        {activity.repairId && (
                          <p className={`text-xs md:text-sm ${textColors.muted}`}>Reparación #{activity.repairId}</p>
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
    </TechnicianDashboardLayout>
  )
} 