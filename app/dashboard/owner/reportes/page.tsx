'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts'
import DashboardLayout from '../components/DashboardLayout'
import { Card, CardBody, CardHeader, Button, DateRangePicker, Chip } from '@heroui/react'
import { Download, DollarSign, Wrench, Users, ShoppingCart } from 'lucide-react'
import { today, getLocalTimeZone } from '@internationalized/date'
import { formatCurrency } from '@/lib/utils/currency'

// Añadir interfaces para los tipos
interface ChartItem {
  category: string;
  total_revenue: number;
  total_quantity: number;
}

interface RepairStatusItem {
  status: string;
  count: number;
}

interface SalesTimeItem {
  date: string;
  sales: number;
  count: number;
}

interface ChartData {
  category?: string;
  revenue?: number;
  total_revenue?: number;
  quantity?: number;
  total_quantity?: number;
  date?: string;
  sales?: number;
  count?: number;
  status?: string;
}

interface PieLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
  name: string;
}

function normalizeCharts(charts: any) {
  const repairsByStatus = charts.repairs_by_status
    ? Object.entries(charts.repairs_by_status).map(([status, count]: [string, any]) => ({
        status,
        count: Number(count) || 0
      }))
    : [];
  const repairsByPriority = charts.repairs_by_priority
    ? Object.entries(charts.repairs_by_priority).map(([priority, count]: [string, any]) => ({
        priority,
        count: Number(count) || 0
      }))
    : [];
  const salesByCategory = (charts.sales_by_category || []).map((item: ChartData) => ({
    category: item.category || 'Sin categoría',
    total_revenue: Number(item.revenue ?? item.total_revenue) || 0,
    total_quantity: Number(item.quantity ?? item.total_quantity) || 0,
  }));
  const salesOverTime = (charts.sales_over_time || []).map((item: ChartData) => ({
    date: item.date || new Date().toISOString(),
    sales: Number(item.sales) || 0,
    count: Number(item.count) || 0,
  })).filter((item: SalesTimeItem) => !isNaN(item.sales) && item.sales !== null);
  return { salesByCategory, salesOverTime, repairsByStatus, repairsByPriority };
}

const translateRepairStatus = (status: string): string => {
  const translations: { [key: string]: string } = {
    'pending': 'Pendiente',
    'in_progress': 'En Progreso',
    'completed': 'Completado',
    'cancelled': 'Cancelado',
    'received': 'Recibido',
    'diagnosed': 'Diagnosticado',
    'waiting_parts': 'Esperando Repuestos',
    'delivered': 'Entregado',
    'low': 'Baja',
    'medium': 'Media',
    'high': 'Alta',
  }
  return translations[status] || status
}

export default function ReportesPage() {
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<any>(null)
  const [selectedTab, setSelectedTab] = useState(0)
  const [dateRange, setDateRange] = useState<any>({
    start: today(getLocalTimeZone()).subtract({ weeks: 1 }),
    end: today(getLocalTimeZone()),
  });

  const fetchReportData = useCallback(async () => {
    if (!dateRange.start || !dateRange.end) return;
    setLoading(true);
    try {
      const startDate = dateRange.start.toDate('UTC').toISOString();
      const endDate = dateRange.end.toDate('UTC').toISOString();
      const response = await fetch(`/api/reports?start_date=${startDate}&end_date=${endDate}`);
      const data = await response.json();
      if (data.success) {
        setReportData(data.data);
      } else {
        setReportData(null);
      }
    } catch (error) {
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const COLORS = [
    '#6366F1', // Indigo
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#8B5CF6', // Violet
    '#14B8A6', // Teal
    '#F43F5E', // Rose
    '#6366F1', // Indigo (fallback)
  ];
  const charts = reportData ? normalizeCharts(reportData.charts) : null;

  const tabs = [
    { name: 'Resumen General', content: (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <Card className="shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">Ingresos Totales</p>
            <p className="text-3xl font-bold text-gray-900">
              {reportData ? formatCurrency(reportData.stats.total_revenue) : '...'}
            </p>
            <p className="text-xs text-gray-400">
              {reportData ? `${reportData.stats.total_sales} ventas` : '...'}
            </p>
          </CardBody>
        </Card>
        <Card className="shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              {reportData && <Chip color="primary" variant="flat">
                {reportData.stats.total_repairs - reportData.stats.completed_repairs} pendientes
              </Chip>}
            </div>
            <p className="text-sm font-medium text-gray-500">Reparaciones</p>
            <p className="text-3xl font-bold text-gray-900">{reportData?.stats.total_repairs || '...'}</p>
            <p className="text-xs text-gray-400">
              {reportData ? `${reportData.stats.completed_repairs} completadas` : '...'}
            </p>
          </CardBody>
        </Card>
        <Card className="shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">Nuevos Clientes</p>
            <p className="text-3xl font-bold text-gray-900">{reportData?.stats.new_customers || '...'}</p>
            <p className="text-xs text-gray-400">en el período</p>
          </CardBody>
        </Card>
        <Card className="shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 shadow-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500">Venta Promedio</p>
            <p className="text-3xl font-bold text-gray-900">
              {reportData ? formatCurrency(reportData.stats.avg_sale_value) : '...'}
            </p>
            <p className="text-xs text-gray-400">por transacción</p>
          </CardBody>
        </Card>
      </div>
    )},
    { name: 'Análisis de Ventas', content: (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader className="text-gray-900 dark:text-white">Ventas por Categoría</CardHeader>
          <CardBody>
            <div className="h-[400px]">
              {charts && charts.salesByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.salesByCategory.filter((item: ChartItem) => item.total_revenue > 0).map((item: ChartItem) => ({ 
                        name: item.category, 
                        value: item.total_revenue 
                      }))}
                      cx="50%" 
                      cy="50%" 
                      labelLine={false} 
                      outerRadius={120} 
                      fill="#6366f1" 
                      dataKey="value"
                      label={({ name, value, percent }) => percent ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {charts.salesByCategory.map((entry: ChartItem, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        padding: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-gray-600 dark:text-gray-400 text-center mt-16">No hay datos de ventas por categoría.</p>}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader className="text-gray-900 dark:text-white">Tendencia de Ventas</CardHeader>
          <CardBody>
            <div className="h-[400px]">
              {charts && charts.salesOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={charts.salesOverTime.filter((item: SalesTimeItem) => !isNaN(item.sales) && item.sales !== null)} 
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="#e5e7eb" 
                      opacity={0.5}
                    />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(tick) => new Date(tick).toLocaleDateString('es-ES', { 
                        day: 'numeric', 
                        month: 'short' 
                      })} 
                      stroke="#6b7280" 
                      tick={{ fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => {
                        if (typeof value !== 'number' || isNaN(value)) return '';
                        return formatCurrency(value);
                      }}
                      stroke="#6b7280"
                      tick={{ fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      width={80}
                    />
                    <Tooltip 
                      formatter={(value: any) => {
                        if (typeof value !== 'number' || isNaN(value)) return ['0', 'Ventas'];
                        return [formatCurrency(value), 'Ventas'];
                      }}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        padding: '12px'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      name="Ventas" 
                      stroke="#6366f1" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorVentas)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <p className="text-gray-600 dark:text-gray-400 text-center mt-16">No hay datos de tendencia de ventas.</p>}
            </div>
          </CardBody>
        </Card>
      </div>
    )},
    { name: 'Análisis de Reparaciones', content: (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader className="text-gray-900">Estado de Reparaciones</CardHeader>
          <CardBody>
            <div className="h-[400px]">
              {charts && charts.repairsByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.repairsByStatus.map((item: RepairStatusItem) => ({ 
                        name: translateRepairStatus(item.status), 
                        value: item.count 
                      }))}
                      cx="50%" 
                      cy="50%" 
                      innerRadius={80} 
                      outerRadius={120} 
                      fill="#10B981" 
                      paddingAngle={5} 
                      dataKey="value"
                      label={({ name, value, percent }) => percent ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {charts.repairsByStatus.map((entry: RepairStatusItem, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' }}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number, name) => [value, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-gray-600 text-center mt-16">No hay datos de estado de reparaciones.</p>}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader className="text-gray-900">Reparaciones por Prioridad</CardHeader>
          <CardBody>
            <div className="h-[400px]">
              {charts && charts.repairsByPriority.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={charts.repairsByPriority.map(item => ({ name: translateRepairStatus(item.priority), Reparaciones: item.count }))} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" stroke="#6b7280" />
                    <YAxis dataKey="name" type="category" stroke="#6b7280" />
                    <Tooltip formatter={(value: number) => [value, 'Total']} />
                    <Legend />
                    <Bar dataKey="Reparaciones" fill="#10B981" radius={[8, 8, 8, 8]} barSize={32}>
                      {charts.repairsByPriority.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ): <p className="text-gray-600 text-center mt-16">No hay datos de reparaciones por prioridad.</p>}
            </div>
          </CardBody>
        </Card>
      </div>
    )}
  ];

  if (loading) {
    return <DashboardLayout><div>Cargando reportes...</div></DashboardLayout>
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
            <p className="text-gray-500">Análisis detallado del rendimiento del negocio</p>
          </div>
          <div className="flex items-center gap-4">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              className="[&_input]:!text-black [&_button]:text-gray-700 [&_button]:dark:text-gray-200 [&_span]:text-gray-700 [&_span]:dark:text-gray-200 [&_div]:bg-white [&_div]:dark:bg-gray-800 [&_.selected]:!bg-blue-600 [&_.selected]:!text-white [&_.today]:border-blue-600 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            />
            <Button
              onClick={() => {/* Implementar exportación */}}
              variant="bordered"
              className="flex items-center gap-2 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </div>

        <div>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab, index) => (
                <button
                  key={tab.name}
                  onClick={() => setSelectedTab(index)}
                  className={`${
                    selectedTab === index
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
          <div className="mt-4">
            {reportData ? tabs[selectedTab].content : (
              <div className="text-center py-16">
                <p className="text-gray-600">No hay datos de reporte para el rango de fechas seleccionado.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}