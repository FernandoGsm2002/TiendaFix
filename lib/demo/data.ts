// Datos estáticos para el modo demo
export const DEMO_STATS = {
  totalRevenue: 18750,
  dailyRevenue: 1250,
  totalRepairs: 127,
  completedRepairs: 95,
  pendingRepairs: 18,
  inProgressRepairs: 14,
  totalCustomers: 45,
  totalDevices: 89
}

export const DEMO_CUSTOMERS = [
  {
    id: 'demo-customer-1',
    name: 'Juan Carlos Mendoza',
    email: 'juan.mendoza@email.com',
    phone: '+51 987 654 321',
    customer_type: 'identified',
    is_recurrent: true,
    notes: 'Cliente VIP, siempre puntual con los pagos'
  },
  {
    id: 'demo-customer-2',
    name: 'María Elena García',
    email: 'maria.garcia@gmail.com',
    phone: '+51 912 345 678',
    customer_type: 'identified',
    is_recurrent: true,
    notes: 'Profesora, cuida mucho sus equipos'
  }
]

export const DEMO_REPAIRS = [
  {
    id: 'demo-repair-1',
    title: 'Cambio de pantalla completa',
    description: 'Reemplazo de display y touch por caída',
    status: 'delivered',
    priority: 'medium',
    cost: 380,
    customer_name: 'Juan Carlos Mendoza',
    device_info: 'iPhone 14 Pro - 256GB - Azul'
  },
  {
    id: 'demo-repair-2',
    title: 'Cambio de batería',
    description: 'Batería agotada, no retiene carga',
    status: 'completed',
    priority: 'high',
    cost: 180,
    customer_name: 'María Elena García',
    device_info: 'Samsung Galaxy S23 - 128GB - Negro'
  }
] 