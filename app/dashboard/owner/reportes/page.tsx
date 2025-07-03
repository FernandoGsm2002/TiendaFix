'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import DashboardLayout from '../components/DashboardLayout'
import { useTranslations, useCurrency } from '@/lib/contexts/TranslationContext'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Skeleton, 
  DatePicker, 
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Avatar,
  Chip,
  Progress,
  Divider
} from '@heroui/react'
import { 
  TrendingUp, 
  Users, 
  Wrench, 
  DollarSign, 
  Calendar,
  BarChart3,
  PieChart,
  Download,
  AlertTriangle,
  Award,
  Box,
  ShoppingCart,
  Trophy,
  Target,
  Activity,
  Star
} from 'lucide-react'
import { ApexOptions } from 'apexcharts'
import { parseDate, getLocalTimeZone, today, CalendarDate } from '@internationalized/date'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

// --- INTERFACES DE DATOS ---
interface ReportStats {
  total_revenue: number
  total_sales: number
  avg_sale_value: number
  total_repairs: number
  completed_repairs: number
  total_repair_cost: number
  avg_completion_time: number
  new_customers: number
  total_devices: number
}

interface SalesData {
  day: string
  revenue: number
  count: number
}

interface RepairStatus {
  status: string
  count: number
}

interface TopTechnician {
  technician_name: string
  completed_repairs: number
}

interface TopProduct {
  name: string
  quantity_sold: number
  total_revenue: number
}

interface ReportData {
  stats: ReportStats
  sales_over_time: SalesData[]
  repairs_by_status: RepairStatus[]
  top_technicians: TopTechnician[]
  top_products: TopProduct[]
}

// --- COMPONENTE PRINCIPAL ---
export default function ReportsPage() {
  const { t } = useTranslations()
  const { formatCurrency, currencyCode } = useCurrency()
  const reportRef = useRef<HTMLDivElement>(null)
  
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [startDate, setStartDate] = useState<CalendarDate>(today(getLocalTimeZone()).subtract({ days: 30 }))
  const [endDate, setEndDate] = useState<CalendarDate>(today(getLocalTimeZone()))

  const fetchReportData = useCallback(async () => {
    if (!startDate || !endDate) return
    
    setLoading(true)
    setError(null)
    
    try {
      const startDateISO = startDate.toDate('UTC').toISOString()
      const endDateISO = endDate.toDate('UTC').toISOString()
      
      const response = await fetch(`/api/reports?start_date=${startDateISO}&end_date=${endDateISO}`)
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Error al cargar los datos')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    fetchReportData()
  }, [fetchReportData])

  const exportToPDF = async () => {
    if (!reportRef.current) return
    setExporting(true)
    
    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      onclone: (document) => {
        const actionButtons = document.querySelectorAll('.pdf-hide')
        actionButtons.forEach(el => (el as HTMLElement).style.display = 'none')
      }
    });

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    const ratio = canvasWidth / canvasHeight
    let imgWidth = pdfWidth - 20
    let imgHeight = imgWidth / ratio

    if (imgHeight > pdfHeight - 20) {
      imgHeight = pdfHeight - 20
      imgWidth = imgHeight * ratio
    }
    
    const x = (pdfWidth - imgWidth) / 2
    
    pdf.addImage(imgData, 'PNG', x, 10, imgWidth, imgHeight)
    
    const period = `${startDate.toString()}_${endDate.toString()}`
    pdf.save(`Reporte_TiendaFix_${period}.pdf`)
    setExporting(false)
  }
  
  // --- RENDERIZADO ---
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Spinner size="lg" color="primary" />
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
          <div className="bg-red-50 p-6 rounded-2xl">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-800 mb-2">Error al Cargar Reporte</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <Button color="primary" size="lg" onClick={fetchReportData}>
              <Activity className="h-5 w-5 mr-2" />
              Reintentar
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }
  
  const { 
    stats, 
    sales_over_time, 
    repairs_by_status, 
    top_technicians, 
    top_products 
  } = data;

  // Asegurar que los arrays no sean null
  const safeRepairsByStatus = repairs_by_status ?? [];
  const safeSalesOverTime = sales_over_time ?? [];
  const safeTopTechnicians = top_technicians ?? [];
  const safeTopProducts = top_products ?? [];

  // Métricas principales con iconos y colores mejorados
  const summaryCards = [
    { 
      label: 'Ingresos Totales', 
      value: formatCurrency(stats.total_revenue), 
      icon: DollarSign, 
      color: 'bg-gradient-to-r from-green-500 to-emerald-600',
      iconColor: 'text-white'
    },
    { 
      label: 'Ventas Realizadas', 
      value: stats.total_sales.toLocaleString(), 
      icon: ShoppingCart, 
      color: 'bg-gradient-to-r from-blue-500 to-cyan-600',
      iconColor: 'text-white'
    },
    { 
      label: 'Reparaciones', 
      value: stats.total_repairs.toLocaleString(), 
      icon: Wrench, 
      color: 'bg-gradient-to-r from-purple-500 to-violet-600',
      iconColor: 'text-white'
    },
    { 
      label: 'Valor Promedio', 
      value: formatCurrency(stats.avg_sale_value), 
      icon: TrendingUp, 
      color: 'bg-gradient-to-r from-orange-500 to-amber-600',
      iconColor: 'text-white'
    },
    { 
      label: 'Completadas', 
      value: stats.completed_repairs.toLocaleString(), 
      icon: Target, 
      color: 'bg-gradient-to-r from-teal-500 to-cyan-600',
      iconColor: 'text-white'
    },
    { 
      label: 'Nuevos Clientes', 
      value: stats.new_customers.toLocaleString(), 
      icon: Users, 
      color: 'bg-gradient-to-r from-pink-500 to-rose-600',
      iconColor: 'text-white'
    },
  ];

  // Configuración mejorada del gráfico de ventas
  const salesChartOptions: ApexOptions = {
    chart: { 
      type: 'area', 
      height: 400, 
      toolbar: { show: false },
      background: 'transparent'
    },
    dataLabels: { enabled: false },
    stroke: { 
      curve: 'smooth', 
      width: 4,
      colors: ['#4f46e5']
    },
    xaxis: {
      type: 'datetime',
      categories: safeSalesOverTime.map(s => s.day),
      labels: {
        style: { colors: '#6b7280' }
      }
    },
    yaxis: {
      labels: { 
        formatter: (val) => formatCurrency(val),
        style: { colors: '#6b7280' }
      }
    },
    tooltip: { 
      x: { format: 'dd MMM yyyy' },
      theme: 'light',
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const value = series[seriesIndex][dataPointIndex]
        const date = new Date(w.globals.categoryLabels[dataPointIndex]).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
        
        return `
          <div class="bg-white border border-primary-200 rounded-lg shadow-lg p-4 min-w-[200px]">
            <div class="flex items-center space-x-2 mb-2">
              <div class="w-3 h-3 bg-primary-500 rounded-full"></div>
              <span class="font-semibold text-primary-700">Ingresos del Día</span>
            </div>
            <div class="text-sm text-gray-600 mb-1">${date}</div>
            <div class="text-2xl font-bold text-primary-600">${formatCurrency(value)}</div>
          </div>
        `
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.8,
        opacityTo: 0.1,
        stops: [0, 90, 100],
        colorStops: [
          { offset: 0, color: '#4f46e5', opacity: 0.8 },
          { offset: 100, color: '#4f46e5', opacity: 0.1 }
        ]
      }
    },
    colors: ['#4f46e5'],
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 3
    }
  };

  const salesChartSeries = [{ name: 'Ingresos Diarios', data: safeSalesOverTime.map(s => s.revenue) }];
  
  // Configuración mejorada del gráfico de estados
  const repairsStatusChartOptions: ApexOptions = {
    chart: { 
      type: 'donut', 
      height: 350,
      background: 'transparent'
    },
    labels: safeRepairsByStatus.map(s => {
      const statusMap: Record<string, string> = {
        'completed': 'Completadas',
        'in_progress': 'En Progreso',
        'received': 'Recibidas',
        'cancelled': 'Canceladas',
        'delivered': 'Entregadas'
      }
      return statusMap[s.status] || s.status
    }),
    dataLabels: { 
      enabled: true, 
      formatter: (val) => `${Number(val).toFixed(1)}%`,
      style: { fontSize: '14px', fontWeight: 'bold' }
    },
    legend: { 
      position: 'bottom',
      fontSize: '14px'
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#374151'
            }
          }
        }
      }
    },
    colors: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'],
    stroke: { width: 2, colors: ['#ffffff'] }
  };

  const repairsStatusChartSeries = safeRepairsByStatus.map(s => s.count);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
        {/* Header Mejorado */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                📊 Reportes y Análisis
              </h1>
              <p className="text-gray-600 text-lg">Análisis detallado del rendimiento de tu negocio</p>
            </div>
            <div className="flex items-center gap-3 pdf-hide">
              <DatePicker 
                label="Desde" 
                value={startDate} 
                onChange={(date) => date && setStartDate(date)}
                className="w-40"
                color="primary"
              />
              <DatePicker 
                label="Hasta" 
                value={endDate} 
                onChange={(date) => date && setEndDate(date)}
                className="w-40"
                color="primary"
              />
              <Button 
                color="primary" 
                variant="ghost" 
                onClick={fetchReportData} 
                isLoading={loading}
                size="lg"
              >
                <BarChart3 className="h-5 w-5 mr-2" /> 
                Actualizar
              </Button>
              <Button 
                color="primary" 
                onClick={exportToPDF} 
                isLoading={exporting}
                size="lg"
              >
                <Download className="h-5 w-5 mr-2" /> 
                Exportar PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Contenido del Reporte */}
        <div ref={reportRef} className="space-y-8">

          {/* Tarjetas de Resumen Mejoradas */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Activity className="h-7 w-7 text-primary-600 mr-3" />
              Resumen Ejecutivo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {summaryCards.map((card, index) => (
                <Card key={card.label} className="hover:shadow-lg transition-all duration-300 border-0">
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600">{card.label}</p>
                        <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                      </div>
                      <div className={`p-4 rounded-2xl ${card.color}`}>
                        <card.icon className={`h-8 w-8 ${card.iconColor}`} />
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </section>

          {/* Gráfico de Ingresos Mejorado */}
          <section>
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Evolución de Ingresos</h2>
                      <p className="text-gray-600">Ingresos diarios durante el período seleccionado</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <Chart options={salesChartOptions} series={salesChartSeries} type="area" height={400} />
              </CardBody>
            </Card>
          </section>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Estado de Reparaciones Mejorado */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <PieChart className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Estado de Reparaciones</h2>
                    <p className="text-gray-600">Distribución por estado</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <Chart options={repairsStatusChartOptions} series={repairsStatusChartSeries} type="donut" height={350} />
              </CardBody>
            </Card>
            
            {/* Ranking de Técnicos Mejorado */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-xl">
                    <Trophy className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Mejores Técnicos</h2>
                    <p className="text-gray-600">Ranking por reparaciones completadas</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {safeTopTechnicians.length > 0 ? (
                  <div className="space-y-4">
                    {safeTopTechnicians.map((tech, index) => (
                      <div key={tech.technician_name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <Avatar 
                              name={tech.technician_name.charAt(0)} 
                              size="lg"
                              className="bg-primary-500 text-white font-bold"
                            />
                            {index < 3 && (
                              <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                              }`}>
                                {index + 1}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{tech.technician_name}</p>
                            <p className="text-sm text-gray-600">Técnico especializado</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary-600">{tech.completed_repairs}</p>
                          <p className="text-sm text-gray-500">completadas</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No hay datos de técnicos disponibles</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
          
          {/* Productos más vendidos Mejorado */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <Star className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Productos Más Vendidos</h2>
                    <p className="text-gray-600">Ranking de productos por cantidad vendida</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {safeTopProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table removeWrapper aria-label="Productos más vendidos" className="min-w-full">
                    <TableHeader>
                      <TableColumn className="bg-gray-50 text-gray-700 font-semibold">PRODUCTO</TableColumn>
                      <TableColumn className="bg-gray-50 text-gray-700 font-semibold text-center">CANTIDAD</TableColumn>
                      <TableColumn className="bg-gray-50 text-gray-700 font-semibold text-right">INGRESOS</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {safeTopProducts.map((prod, index) => (
                        <TableRow key={prod.name} className="hover:bg-gray-50 transition-colors duration-200">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                                index < 3 ? 'bg-primary-500' : 'bg-gray-400'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">{prod.name}</p>
                                <p className="text-sm text-gray-500">Producto de inventario</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Chip 
                              color="primary" 
                              variant="flat" 
                              size="lg"
                              className="font-bold"
                            >
                              {prod.quantity_sold}
                            </Chip>
                          </TableCell>
                          <TableCell className="text-right">
                            <p className="text-lg font-bold text-green-600">{formatCurrency(prod.total_revenue)}</p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Box className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No hay datos de productos disponibles</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}