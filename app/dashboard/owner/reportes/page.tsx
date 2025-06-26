'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import DashboardLayout from '../components/DashboardLayout'
import { useCurrency } from '@/lib/utils/currency'
import { textColors } from '@/lib/utils/colors'
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Skeleton, 
  DateRangePicker, 
  Button,
  Divider,
  Chip,
  Progress
} from '@heroui/react'
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Wrench, 
  DollarSign, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Download
} from 'lucide-react'
import { ApexOptions } from 'apexcharts'
import { parseDate, getLocalTimeZone, today } from '@internationalized/date'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface ReportStats {
  totalRevenue: number
  totalSales: number
  avgSaleValue: number
  totalRepairs: number
  completedRepairs: number
  totalRepairRevenue: number
  avgCompletionTime: number
  newCustomers: number
  newDevices: number
}

interface TopProduct {
  id?: string
  name: string
  category?: string
  quantity?: number
  revenue?: number
  total?: number
  count?: number
}

interface SalesByCategory {
  category: string
  revenue: number
  count: number
}

interface SalesOverTime {
  date: string
  sales: number
  count: number
}

interface ReportCharts {
  repairs_by_status: Record<string, number>
  repairs_by_priority: Record<string, number>
  top_products?: TopProduct[]
  sales_by_category?: SalesByCategory[]
  sales_over_time?: SalesOverTime[]
}

interface ReportData {
  stats: ReportStats
  charts: ReportCharts
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { format, currencyCode, symbol } = useCurrency()
  
  // Estilos globales para el DateRangePicker y encabezados
  useEffect(() => {
    // Crear un elemento de estilo
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      /* Estilos para el calendario */
      .heroui-calendar button {
        color: #1f2937 !important;
      }
      .heroui-calendar-header-title {
        color: #1f2937 !important;
      }
      .heroui-calendar-header-cell {
        color: #4b5563 !important;
      }
      .heroui-calendar-cell[aria-selected="true"] button {
        color: white !important;
      }
      
      /* Estilos para encabezados */
      .heroui-card h3 {
        color: #1f2937 !important;
      }
      .heroui-card-header h3 {
        color: #1f2937 !important;
      }
    `;
    // Añadir el elemento al head
    document.head.appendChild(styleElement);
    
    // Limpiar al desmontar
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const [dateRange, setDateRange] = useState({
    start: today(getLocalTimeZone()).subtract({ days: 30 }),
    end: today(getLocalTimeZone()),
  })

  const fetchReportData = useCallback(async () => {
    if (!dateRange.start || !dateRange.end) return
    
    setLoading(true)
    setError(null)
    
    try {
      const startDate = dateRange.start.toDate('UTC').toISOString()
      const endDate = dateRange.end.toDate('UTC').toISOString()
      
      const response = await fetch(`/api/reports?start_date=${startDate}&end_date=${endDate}`)
      const result = await response.json()
      
      if (result.success) {
        console.log('Datos recibidos:', result.data)
        setData(result.data)
      } else {
        setError(result.error || 'Error al cargar los datos')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  const handleDateRangeChange = (value: any) => {
    if (value && value.start && value.end) {
      setDateRange({
        start: value.start,
        end: value.end
      })
    }
  }

  useEffect(() => {
    fetchReportData()
  }, [fetchReportData])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 p-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-12 w-64 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardBody>
                  <Skeleton className="h-20 w-full rounded" />
                </CardBody>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardBody>
                  <Skeleton className="h-80 w-full rounded" />
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Card className="bg-danger-50 border-danger-200">
            <CardBody>
              <div className="text-danger-700">
                <h3 className="text-lg font-semibold mb-2">Error al cargar reportes</h3>
                <p>{error || 'No se pudieron cargar los datos'}</p>
                <Button 
                  color="danger" 
                  variant="flat" 
                  className="mt-4"
                  onClick={fetchReportData}
                >
                  Reintentar
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const { stats, charts } = data

  // Configuración base para gráficos
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
    }
  }

  // Configuración para gráfico de ventas en el tiempo
  const salesTimeOptions: ApexOptions = {
    ...baseChartOptions,
    chart: { ...baseChartOptions.chart, type: 'area' },
    xaxis: {
      categories: charts.sales_over_time?.map(item => 
        new Date(item.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
      ) || [],
      labels: { style: { colors: '#6b7280' } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: [
      {
        title: { text: `Ingresos (${currencyCode})`, style: { color: '#6b7280' } },
        labels: {
          style: { colors: '#6b7280' },
          formatter: (val) => format(val)
        }
      },
      {
        opposite: true,
        title: { text: 'Cantidad', style: { color: '#6b7280' } },
        labels: {
          style: { colors: '#6b7280' },
          formatter: (val) => Math.round(val).toString()
        }
      }
    ],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100]
      }
    },
    colors: ['#4f46e5', '#10b981']
  }

  const salesTimeSeries = [
    {
      name: `Ingresos (${currencyCode})`,
      type: 'area',
      data: charts.sales_over_time?.map(item => item.sales) || []
    },
    {
      name: 'Cantidad de ventas',
      type: 'line',
      data: charts.sales_over_time?.map(item => item.count) || []
    }
  ]

  // Configuración para gráfico de reparaciones por estado
  const repairsStatusSeries = Object.values(charts.repairs_by_status || {})
  const repairsStatusOptions: ApexOptions = {
    ...baseChartOptions,
    chart: { ...baseChartOptions.chart, type: 'donut' },
    labels: Object.keys(charts.repairs_by_status || {}).map(status => {
      const statusLabels: Record<string, string> = {
        'received': 'Recibido',
        'diagnosed': 'Diagnosticado', 
        'in_progress': 'En Proceso',
        'waiting_parts': 'Esperando Repuestos',
        'completed': 'Completado',
        'delivered': 'Entregado',
        'cancelled': 'Cancelado'
      }
      return statusLabels[status] || status
    }),
    colors: ['#6b7280', '#f59e0b', '#3b82f6', '#f97316', '#10b981', '#22c55e', '#ef4444'],
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

  // Configuración para gráfico de reparaciones por prioridad
  const repairsPrioritySeries = Object.values(charts.repairs_by_priority || {})
  const repairsPriorityOptions: ApexOptions = {
    ...baseChartOptions,
    chart: { ...baseChartOptions.chart, type: 'pie' },
    labels: Object.keys(charts.repairs_by_priority || {}).map(priority => {
      const priorityLabels: Record<string, string> = {
        'low': 'Baja',
        'medium': 'Media',
        'high': 'Alta',
        'urgent': 'Urgente'
      }
      return priorityLabels[priority] || priority
    }),
    colors: ['#22c55e', '#f59e0b', '#f97316', '#ef4444']
  }

  // Configuración para gráfico de ventas por categoría
  const categoryOptions: ApexOptions = {
    ...baseChartOptions,
    chart: { ...baseChartOptions.chart, type: 'bar' },
    xaxis: {
      categories: charts.sales_by_category?.map(item => item.category) || [],
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
    colors: ['#4f46e5'],
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
      }
    }
  }

  const categorySeries = [{
    name: `Ingresos (${currencyCode})`,
    data: charts.sales_by_category?.map(item => item.revenue) || []
  }]

  // Stats cards data
  const statsCards = [
    {
      title: 'Ingresos Totales',
      value: format(stats.totalRevenue || 0),
      icon: DollarSign,
      color: 'success',
      description: 'Total de ingresos por ventas'
    },
    {
      title: 'Ventas Realizadas',
      value: (stats.totalSales || 0).toString(),
      icon: ShoppingCart,
      color: 'primary',
      description: 'Número total de ventas'
    },
    {
      title: 'Valor Promedio',
      value: format(stats.avgSaleValue || 0),
      icon: TrendingUp,
      color: 'secondary',
      description: 'Valor promedio por venta'
    },
    {
      title: 'Ingresos Reparaciones',
      value: format(stats.totalRepairRevenue || 0),
      icon: Wrench,
      color: 'warning',
      description: 'Total por reparaciones'
    },
    {
      title: 'Reparaciones Totales',
      value: (stats.totalRepairs || 0).toString(),
      icon: Activity,
      color: 'default',
      description: 'Número total de reparaciones'
    },
    {
      title: 'Reparaciones Completadas',
      value: (stats.completedRepairs || 0).toString(),
      icon: Activity,
      color: 'success',
      description: 'Reparaciones finalizadas'
    },
    {
      title: 'Nuevos Clientes',
      value: (stats.newCustomers || 0).toString(),
      icon: Users,
      color: 'primary',
      description: 'Clientes registrados'
    },
    {
      title: 'Tiempo Promedio',
      value: `${(stats.avgCompletionTime || 0).toFixed(1)}d`,
      icon: Calendar,
      color: 'secondary',
      description: 'Días promedio por reparación'
    }
  ]

  const topProducts = charts.top_products || []

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h1>
            <p className="text-gray-600 mt-1">Analiza el rendimiento de tu negocio</p>
          </div>
          <div className="flex items-center gap-3">
            <DateRangePicker
              label="Período de análisis"
              value={dateRange}
              onChange={handleDateRangeChange}
              className="w-64 text-gray-900"
              variant="bordered"
              color="primary"
              classNames={{
                base: "bg-white",
                calendar: "bg-white border-gray-200 shadow-lg",
                popoverContent: "bg-white border-gray-200",
                bottomContent: "text-gray-900",
                selectorIcon: "text-gray-900",
                selectorButton: "text-gray-900"
              }}
            />
            <Button
              color="primary"
              startContent={<Download size={16} />}
              variant="solid"
              className="shadow-sm"
            >
              Exportar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((card, index) => (
            <Card key={index} className="bg-gradient-to-br from-white to-gray-50">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className={`text-xs ${textColors.muted} mt-1`}>{card.description}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-${card.color}-100`}>
                    <card.icon className={`w-6 h-6 text-${card.color}-600`} />
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ventas en el tiempo */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Ventas en el Tiempo</h3>
              </div>
            </CardHeader>
            <CardBody>
              <Chart
                options={salesTimeOptions}
                series={salesTimeSeries}
                type="line"
                height={300}
              />
            </CardBody>
          </Card>

          {/* Reparaciones por estado */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-warning-600" />
                <h3 className="text-lg font-semibold text-gray-900">Reparaciones por Estado</h3>
              </div>
            </CardHeader>
            <CardBody>
              <Chart
                options={repairsStatusOptions}
                series={repairsStatusSeries}
                type="donut"
                height={300}
              />
            </CardBody>
          </Card>

          {/* Reparaciones por prioridad */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-danger-600" />
                <h3 className="text-lg font-semibold text-gray-900">Reparaciones por Prioridad</h3>
              </div>
            </CardHeader>
            <CardBody>
              <Chart
                options={repairsPriorityOptions}
                series={repairsPrioritySeries}
                type="pie"
                height={300}
              />
            </CardBody>
          </Card>

          {/* Ventas por categoría */}
          {charts.sales_by_category && charts.sales_by_category.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-success-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Ventas por Categoría</h3>
                </div>
              </CardHeader>
              <CardBody>
                <Chart
                  options={categoryOptions}
                  series={categorySeries}
                  type="bar"
                  height={300}
                />
              </CardBody>
            </Card>
          )}

          {/* Top productos */}
          {topProducts && topProducts.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-success-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Productos Más Vendidos</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  {topProducts.slice(0, 5).map((product, index) => {
                                         const maxRevenue = Math.max(...topProducts.map(p => p.revenue || p.total || 0))
                     const progressValue = ((product.revenue || product.total || 0) / maxRevenue) * 100
                    
                    return (
                      <div key={product.id || index} className="group">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <div className={`
                                w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm
                                ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                                  index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                                  index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                                  'bg-gradient-to-br from-blue-400 to-blue-600'}
                              `}>
                                #{index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                                  {product.name}
                                </h4>
                                <div className="flex items-center gap-4 mt-1">
                                  <Chip 
                                    size="sm" 
                                    variant="flat" 
                                    color="secondary"
                                    className="text-xs"
                                  >
                                    {product.category || 'Sin categoría'}
                                  </Chip>
                                                                     <p className="text-sm text-gray-600">
                                     {product.quantity || product.count || 0} vendidas
                                   </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                                                         <p className="text-lg font-bold text-gray-900">
                               {format(product.revenue || product.total || 0)}
                             </p>
                             <p className={`text-xs ${textColors.muted}`}>
                               {format((product.revenue || product.total || 0) / (product.quantity || product.count || 1))} c/u
                             </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Progress
                            value={progressValue}
                            className="flex-1"
                            size="sm"
                            color={
                              index === 0 ? 'warning' :
                              index === 1 ? 'default' :
                              index === 2 ? 'secondary' : 'primary'
                            }
                            showValueLabel={false}
                          />
                          <span className={`text-xs ${textColors.muted} font-medium min-w-[45px]`}>
                            {progressValue.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  
                  {topProducts.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className={textColors.muted}>No hay productos vendidos en este período</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Resumen de Rendimiento</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-success-600">
                  {stats.completedRepairs > 0 ? Math.round((stats.completedRepairs / stats.totalRepairs) * 100) : 0}%
                </div>
                <p className="text-sm text-gray-600 mt-1">Tasa de Finalización</p>
                <p className={`text-xs ${textColors.muted}`}>Reparaciones completadas vs total</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {format((stats.totalRevenue || 0) + (stats.totalRepairRevenue || 0))}
                </div>
                <p className="text-sm text-gray-600 mt-1">Ingresos Totales</p>
                <p className={`text-xs ${textColors.muted}`}>Ventas + Reparaciones</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning-600">
                  {stats.newCustomers}
                </div>
                <p className="text-sm text-gray-600 mt-1">Clientes Nuevos</p>
                <p className={`text-xs ${textColors.muted}`}>En el período seleccionado</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  )
}