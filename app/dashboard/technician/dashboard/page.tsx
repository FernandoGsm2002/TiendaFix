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
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardBody>
                  <Skeleton className="h-24 w-full rounded" />
                </CardBody>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardBody>
                <Skeleton className="h-64 w-full rounded" />
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Skeleton className="h-64 w-full rounded" />
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
      case 'repair_completed': return 'text-green-600';
      case 'repair_started': return 'text-blue-600';
      case 'repair_diagnosed': return 'text-orange-600';
      case 'unlock_completed': return 'text-emerald-600';
      case 'unlock_started': return 'text-purple-600';
      case 'unlock_received': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  }

  return (
    <TechnicianDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Dashboard</h1>
            <p className="text-gray-600">Resumen de tu actividad y rendimiento</p>
          </div>
          <div className="flex gap-2">
            <Chip 
              color="primary" 
              variant="flat"
              startContent={<Target className="w-4 h-4" />}
            >
              {stats.todayTasks} tareas hoy
            </Chip>
          </div>
        </div>

        {/* Cards de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="border-0 shadow-lg">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${textColors.secondary}`}>
                        {stat.title}
                      </p>
                      <p className={`text-3xl font-bold mt-2 ${textColors.primary}`}>
                        {stat.value}
                      </p>
                      <p className={`text-xs mt-1 ${textColors.muted}`}>
                        {stat.description}
                      </p>
                    </div>
                    <div className={`
                      w-14 h-14 rounded-xl bg-gradient-to-br ${stat.bgGradient} 
                      flex items-center justify-center shadow-lg
                    `}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>

        {/* Desglose de Ingresos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <h3 className={`text-lg font-semibold ${textColors.primary}`}>
                Ingresos por Reparaciones
              </h3>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-3xl font-bold ${textColors.primary}`}>
                    {format(stats.totalRepairRevenue)}
                  </p>
                  <p className={`text-sm ${textColors.secondary} mt-1`}>
                    {stats.completedRepairs} reparaciones completadas
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>
          
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <h3 className={`text-lg font-semibold ${textColors.primary}`}>
                Ingresos por Desbloqueos
              </h3>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-3xl font-bold ${textColors.primary}`}>
                    {format(stats.totalUnlockRevenue)}
                  </p>
                  <p className={`text-sm ${textColors.secondary} mt-1`}>
                    {stats.completedUnlocks} desbloqueos completados
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico de estado de reparaciones */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <h3 className={`text-lg font-semibold ${textColors.primary}`}>
                Estado de Mis Reparaciones
              </h3>
            </CardHeader>
            <CardBody className="pt-0">
              <Chart
                options={repairsChartOptions}
                series={repairsChartSeries}
                type="donut"
                height={280}
              />
            </CardBody>
          </Card>

          {/* Gráfico de eficiencia */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <h3 className={`text-lg font-semibold ${textColors.primary}`}>
                Mi Eficiencia Semanal
              </h3>
            </CardHeader>
            <CardBody className="pt-0">
              <Chart
                options={efficiencyChartOptions}
                series={efficiencyChartSeries}
                type="line"
                height={280}
              />
            </CardBody>
          </Card>

          {/* Actividad reciente */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <h3 className={`text-lg font-semibold ${textColors.primary}`}>
                Mi Actividad Reciente
              </h3>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = getActivityIcon(activity.type)
                  const colorClass = getActivityColor(activity.type)
                  
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`p-2 rounded-lg bg-gray-100`}>
                        <Icon className={`w-4 h-4 ${colorClass}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${textColors.primary}`}>
                          {activity.title}
                        </p>
                        {activity.customer && (
                          <p className={`text-xs ${textColors.secondary}`}>
                            Cliente: {activity.customer}
                          </p>
                        )}
                        {activity.repairId && (
                          <p className={`text-xs ${textColors.muted}`}>
                            {(activity as any).itemType === 'unlock' ? 'Desbloqueo' : 'Reparación'} #{activity.repairId}
                          </p>
                        )}
                        <p className={`text-xs ${textColors.muted}`}>
                          {timeAgo(activity.time)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Métricas de rendimiento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${textColors.primary}`}>
                  Mi Progreso Semanal
                </h3>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className={textColors.secondary}>Completadas</span>
                  <span className={textColors.primary}>{stats.completedRepairs + stats.completedUnlocks}/{stats.assignedRepairs + stats.assignedUnlocks + stats.completedRepairs + stats.completedUnlocks}</span>
                </div>
                <Progress 
                  value={stats.weeklyEfficiency} 
                  color="success"
                  size="md"
                  className="w-full"
                />
                <p className={`text-xs ${textColors.muted}`}>
                  {stats.weeklyEfficiency >= 80 ? '¡Excelente progreso!' : 
                   stats.weeklyEfficiency >= 60 ? 'Buen progreso' : 
                   'Puedes mejorar tu eficiencia'}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${textColors.primary}`}>
                  Resumen de Ingresos
                </h3>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="space-y-3">
                <div>
                  <p className={`text-2xl font-bold ${textColors.primary}`}>
                    {format(stats.monthlyRevenue)}
                  </p>
                  <p className={`text-sm ${textColors.secondary}`}>
                    Total este mes
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div className="text-center">
                    <p className={`text-sm font-semibold ${textColors.primary}`}>
                      {format(stats.totalRepairRevenue)}
                    </p>
                    <p className={`text-xs ${textColors.secondary}`}>
                      Reparaciones
                    </p>
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-semibold ${textColors.primary}`}>
                      {format(stats.totalUnlockRevenue)}
                    </p>
                    <p className={`text-xs ${textColors.secondary}`}>
                      Desbloqueos
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${textColors.primary}`}>
                  Mi Objetivo Mensual
                </h3>
                <Target className="w-5 h-5 text-blue-500" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className={textColors.secondary}>Trabajos Completados</span>
                  <span className={textColors.primary}>{stats.completedRepairs + stats.completedUnlocks}/30</span>
                </div>
                <Progress 
                  value={((stats.completedRepairs + stats.completedUnlocks) / 30) * 100} 
                  color="primary"
                  size="md"
                  className="w-full"
                />
                <p className={`text-xs ${textColors.muted}`}>
                  {Math.max(0, 30 - (stats.completedRepairs + stats.completedUnlocks))} trabajos restantes para la meta
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </TechnicianDashboardLayout>
  )
} 