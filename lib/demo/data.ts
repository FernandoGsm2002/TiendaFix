// Datos estáticos completos para el modo demo
export const DEMO_STATS = {
  totalRevenue: 45280,
  dailyRevenue: 2850,
  weeklyRevenue: 18450,
  monthlyRevenue: 45280,
  totalRepairs: 287,
  completedRepairs: 235,
  pendingRepairs: 28,
  inProgressRepairs: 18,
  diagnosedRepairs: 6,
  totalCustomers: 156,
  totalDevices: 298,
  totalUnlocks: 67,
  todayRepairs: 12,
  todayUnlocks: 4,
  lowStockItems: 8,
  outOfStockItems: 3,
  totalProducts: 145,
  totalTechnicians: 6,
  activeTechnicians: 5
}

export const DEMO_CUSTOMERS = [
  {
    id: 'demo-customer-1',
    name: 'Juan Carlos Mendoza',
    email: 'juan.mendoza@email.com',
    phone: '+51 987 654 321',
    address: 'Av. Brasil 234, Magdalena del Mar',
    customer_type: 'identified',
    is_recurrent: true,
    notes: 'Cliente VIP, siempre puntual con los pagos',
    created_at: '2024-01-15T10:30:00Z',
    total_spent: 3420,
    total_repairs: 8
  },
  {
    id: 'demo-customer-2',
    name: 'María Elena García',
    email: 'maria.garcia@gmail.com',
    phone: '+51 912 345 678',
    address: 'Jr. Cusco 567, Breña',
    customer_type: 'identified',
    is_recurrent: true,
    notes: 'Profesora, cuida mucho sus equipos',
    created_at: '2024-02-10T14:20:00Z',
    total_spent: 1850,
    total_repairs: 5
  },
  {
    id: 'demo-customer-3',
    name: 'TechSolutions SAC',
    email: 'ventas@techsolutions.pe',
    phone: '+51 945 678 912',
    address: 'Av. Arequipa 1234, San Isidro',
    customer_type: 'identified',
    is_recurrent: true,
    notes: 'Empresa cliente, compras al por mayor',
    created_at: '2024-01-05T09:15:00Z',
    total_spent: 12450,
    total_repairs: 24
  },
  {
    id: 'demo-customer-4',
    name: 'Ana Sofía Vargas',
    email: 'ana.vargas@hotmail.com',
    phone: '+51 923 456 789',
    address: 'Calle Las Flores 890, San Miguel',
    customer_type: 'identified',
    is_recurrent: false,
    notes: 'Cliente nuevo, primera reparación',
    created_at: '2024-03-18T16:45:00Z',
    total_spent: 280,
    total_repairs: 1
  },
  {
    id: 'demo-customer-5',
    name: 'Carlos Rodriguez',
    email: 'carlos.r@gmail.com',
    phone: '+51 956 789 123',
    address: 'Jr. Lima 456, Pueblo Libre',
    customer_type: 'identified',
    is_recurrent: true,
    notes: 'Ingeniero, conoce del tema técnico',
    created_at: '2024-03-01T11:30:00Z',
    total_spent: 850,
    total_repairs: 3
  },
  {
    id: 'demo-customer-6',
    name: null,
    email: null,
    phone: '+51 998 765 432',
    address: null,
    customer_type: 'anonymous',
    is_recurrent: false,
    notes: 'Cliente anónimo - reparación express',
    created_at: '2024-03-20T14:30:00Z',
    total_spent: 120,
    total_repairs: 1
  }
]

export const DEMO_REPAIRS = [
  {
    id: 'demo-repair-1',
    title: 'Cambio de pantalla completa',
    description: 'Reemplazo de display OLED y touch por caída',
    problem_description: 'Cliente reporta caída del dispositivo, pantalla completamente rota',
    solution_description: 'Cambio completo del módulo de pantalla OLED original',
    status: 'delivered',
    priority: 'medium',
    cost: 450,
    estimated_days: 2,
    warranty_days: 90,
    customer_name: 'Juan Carlos Mendoza',
    device_info: 'iPhone 14 Pro - 256GB - Azul Profundo',
    technician: 'Miguel Torres',
    received_date: '2024-03-18T09:00:00Z',
    delivery_date: '2024-03-20T16:30:00Z'
  },
  {
    id: 'demo-repair-2',
    title: 'Cambio de batería',
    description: 'Batería agotada, no retiene carga',
    problem_description: 'Batería se agota en menos de 2 horas, indicador de salud al 65%',
    solution_description: 'Instalación de batería original Samsung con calibración',
    status: 'completed',
    priority: 'high',
    cost: 180,
    estimated_days: 1,
    warranty_days: 180,
    customer_name: 'María Elena García',
    device_info: 'Samsung Galaxy S23 - 128GB - Negro',
    technician: 'Ana Sofía Chen',
    received_date: '2024-03-19T14:15:00Z',
    delivery_date: null
  },
  {
    id: 'demo-repair-3',
    title: 'Reparación puerto de carga',
    description: 'Puerto USB-C dañado, carga intermitente',
    problem_description: 'El cable no hace buen contacto, hay que moverlo para cargar',
    solution_description: 'Reemplazo del flex de carga USB-C',
    status: 'in_progress',
    priority: 'medium',
    cost: 150,
    estimated_days: 3,
    warranty_days: 90,
    customer_name: 'Carlos Rodriguez',
    device_info: 'Xiaomi Redmi Note 12 Pro - 256GB - Azul',
    technician: 'Roberto Silva',
    received_date: '2024-03-20T10:30:00Z',
    delivery_date: null
  },
  {
    id: 'demo-repair-4',
    title: 'Limpieza por daño de líquido',
    description: 'Equipo mojado, no enciende',
    problem_description: 'Se mojó con lluvia, no da señales de vida',
    solution_description: null,
    status: 'diagnosed',
    priority: 'urgent',
    cost: 80,
    estimated_days: 2,
    warranty_days: 30,
    customer_name: 'Ana Sofía Vargas',
    device_info: 'iPhone 13 - 128GB - Rosa',
    technician: 'Luis Mendoza',
    received_date: '2024-03-20T16:00:00Z',
    delivery_date: null
  },
  {
    id: 'demo-repair-5',
    title: 'Cambio de cámara posterior',
    description: 'Cámara principal no enfoca',
    problem_description: 'Fotos salen borrosas, cámara no enfoca correctamente',
    solution_description: 'Reemplazo del módulo de cámara principal',
    status: 'pending',
    priority: 'low',
    cost: 220,
    estimated_days: 5,
    warranty_days: 90,
    customer_name: 'TechSolutions SAC',
    device_info: 'Samsung Galaxy A54 - 128GB - Verde',
    technician: null,
    received_date: '2024-03-21T11:20:00Z',
    delivery_date: null
  }
]

export const DEMO_TECHNICIANS = [
  {
    id: 'demo-tech-1',
    name: 'Miguel Torres',
    email: 'miguel.torres@tiendafix.com',
    phone: '+51 987 123 456',
    role: 'technician',
    status: 'active',
    specializations: ['iPhone', 'Samsung', 'Xiaomi', 'Pantallas'],
    experience_years: 5,
    rating: 4.8,
    total_repairs: 486,
    created_at: '2023-06-15T00:00:00Z'
  },
  {
    id: 'demo-tech-2',
    name: 'Ana Sofía Chen',
    email: 'ana.chen@tiendafix.com',
    phone: '+51 912 234 567',
    role: 'technician',
    status: 'active',
    specializations: ['Samsung', 'Huawei', 'Baterías', 'Carga'],
    experience_years: 3,
    rating: 4.9,
    total_repairs: 298,
    created_at: '2023-08-20T00:00:00Z'
  },
  {
    id: 'demo-tech-3',
    name: 'Roberto Silva',
    email: 'roberto.silva@tiendafix.com',
    phone: '+51 945 345 678',
    role: 'technician',
    status: 'active',
    specializations: ['Xiaomi', 'OnePlus', 'Motherboards', 'Soldadura'],
    experience_years: 7,
    rating: 4.7,
    total_repairs: 624,
    created_at: '2023-03-10T00:00:00Z'
  },
  {
    id: 'demo-tech-4',
    name: 'Luis Mendoza',
    email: 'luis.mendoza@tiendafix.com',
    phone: '+51 923 456 789',
    role: 'technician',
    status: 'active',
    specializations: ['iPhone', 'iPad', 'Líquidos', 'Diagnóstico'],
    experience_years: 4,
    rating: 4.6,
    total_repairs: 356,
    created_at: '2023-09-05T00:00:00Z'
  },
  {
    id: 'demo-tech-5',
    name: 'Carmen Díaz',
    email: 'carmen.diaz@tiendafix.com',
    phone: '+51 956 567 890',
    role: 'technician',
    status: 'inactive',
    specializations: ['Tablets', 'Laptops', 'Accesorios'],
    experience_years: 2,
    rating: 4.5,
    total_repairs: 167,
    created_at: '2024-01-12T00:00:00Z'
  }
]

export const DEMO_INVENTORY = [
  {
    id: 'demo-inv-1',
    name: 'Pantalla iPhone 14 Pro',
    description: 'Display OLED original con touch integrado',
    category: 'Pantallas',
    brand: 'Apple',
    model: 'iPhone 14 Pro',
    sku: 'APL-14P-SCR-001',
    stock_quantity: 8,
    min_stock: 3,
    unit_cost: 380,
    sale_price: 520,
    supplier: 'TechParts Global',
    location: 'Estante A-2',
    status: 'active'
  },
  {
    id: 'demo-inv-2',
    name: 'Batería Samsung Galaxy S23',
    description: 'Batería Li-ion 3900mAh original',
    category: 'Baterías',
    brand: 'Samsung',
    model: 'Galaxy S23',
    sku: 'SAM-S23-BAT-001',
    stock_quantity: 15,
    min_stock: 5,
    unit_cost: 45,
    sale_price: 85,
    supplier: 'Samsung Parts Peru',
    location: 'Estante B-1',
    status: 'active'
  },
  {
    id: 'demo-inv-3',
    name: 'Flex de Carga USB-C Xiaomi',
    description: 'Módulo de carga completo con micrófonos',
    category: 'Conectores',
    brand: 'Xiaomi',
    model: 'Redmi Note 12 Pro',
    sku: 'XIA-RN12P-CHG-001',
    stock_quantity: 2,
    min_stock: 5,
    unit_cost: 25,
    sale_price: 60,
    supplier: 'Xiaomi Parts',
    location: 'Estante C-3',
    status: 'low_stock'
  },
  {
    id: 'demo-inv-4',
    name: 'Cargador USB-C 65W Anker',
    description: 'Cargador rápido universal certificado',
    category: 'Accesorios',
    brand: 'Anker',
    model: 'PowerPort III',
    sku: 'ANK-65W-USC-001',
    stock_quantity: 12,
    min_stock: 8,
    unit_cost: 35,
    sale_price: 65,
    supplier: 'Anker Peru',
    location: 'Vitrina Principal',
    status: 'active'
  },
  {
    id: 'demo-inv-5',
    name: 'Protector Pantalla Tempered Glass',
    description: 'Cristal templado 9H con instalación fácil',
    category: 'Accesorios',
    brand: 'Generic',
    model: 'Universal',
    sku: 'GEN-TMP-UNI-001',
    stock_quantity: 0,
    min_stock: 20,
    unit_cost: 4,
    sale_price: 15,
    supplier: 'Glass Pro',
    location: 'Cajón D-3',
    status: 'out_of_stock'
  }
]

export const DEMO_SALES = [
  {
    id: 'demo-sale-1',
    customer_name: 'Juan Carlos Mendoza',
    total: 585,
    payment_method: 'card',
    sale_type: 'mixed',
    notes: 'Reparación + accesorios',
    created_at: '2024-03-20T16:30:00Z',
    items: [
      { name: 'Reparación: Cambio de pantalla iPhone 14 Pro', quantity: 1, price: 520 },
      { name: 'Cargador USB-C 65W', quantity: 1, price: 65 }
    ]
  },
  {
    id: 'demo-sale-2',
    customer_name: 'María Elena García',
    total: 180,
    payment_method: 'cash',
    sale_type: 'service',
    notes: 'Pago por cambio de batería',
    created_at: '2024-03-19T17:45:00Z',
    items: [
      { name: 'Servicio: Cambio de batería Samsung S23', quantity: 1, price: 180 }
    ]
  },
  {
    id: 'demo-sale-3',
    customer_name: 'Carlos Rodriguez',
    total: 75,
    payment_method: 'yape',
    sale_type: 'product',
    notes: 'Compra de accesorios',
    created_at: '2024-03-20T12:15:00Z',
    items: [
      { name: 'Protector Pantalla Tempered Glass', quantity: 3, price: 15 },
      { name: 'Cable USB-C', quantity: 2, price: 15 }
    ]
  }
]

export const DEMO_UNLOCKS = [
  {
    id: 'demo-unlock-1',
    customer_name: 'Carlos Rodriguez',
    brand: 'Samsung',
    model: 'Galaxy A54',
    imei: '359842097531468',
    unlock_type: 'Network Unlock',
    status: 'completed',
    cost: 150,
    provider: 'UnlockTool Pro',
    notes: 'Desbloqueo exitoso, todas las redes compatibles',
    created_at: '2024-03-18T10:00:00Z',
    completion_date: '2024-03-19T14:30:00Z'
  },
  {
    id: 'demo-unlock-2',
    customer_name: 'TechSolutions SAC',
    brand: 'iPhone',
    model: '13 Pro Max',
    imei: '359842097531469',
    unlock_type: 'iCloud Bypass',
    status: 'in_progress',
    cost: 280,
    provider: 'iOS Unlock Service',
    notes: 'En proceso, tiempo estimado 48-72 horas',
    created_at: '2024-03-19T09:20:00Z',
    completion_date: null
  },
  {
    id: 'demo-unlock-3',
    customer_name: 'Ana Sofía Vargas',
    brand: 'Xiaomi',
    model: 'Redmi Note 11',
    imei: '359842097531470',
    unlock_type: 'Bootloader Unlock',
    status: 'completed',
    cost: 80,
    provider: 'Mi Unlock',
    notes: 'Bootloader desbloqueado correctamente',
    created_at: '2024-03-17T15:45:00Z',
    completion_date: '2024-03-17T16:30:00Z'
  }
]

export const DEMO_CHARTS = {
  weeklyRepairs: [
    { date: '2024-03-15', count: 8 },
    { date: '2024-03-16', count: 12 },
    { date: '2024-03-17', count: 15 },
    { date: '2024-03-18', count: 18 },
    { date: '2024-03-19', count: 22 },
    { date: '2024-03-20', count: 16 },
    { date: '2024-03-21', count: 14 }
  ],
  weeklyRevenue: [
    { date: '2024-03-15', revenue: 2400 },
    { date: '2024-03-16', revenue: 3200 },
    { date: '2024-03-17', revenue: 2800 },
    { date: '2024-03-18', revenue: 4100 },
    { date: '2024-03-19', revenue: 3600 },
    { date: '2024-03-20', revenue: 4200 },
    { date: '2024-03-21', revenue: 2850 }
  ],
  deviceTypes: {
    'iPhone': 145,
    'Samsung': 89,
    'Xiaomi': 67,
    'Huawei': 45,
    'OnePlus': 23,
    'Otros': 31
  },
  statusDistribution: {
    'completed': 235,
    'in_progress': 18,
    'pending': 28,
    'diagnosed': 6
  }
} 