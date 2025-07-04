// Datos estáticos para el modo demo
// Información de ejemplo que se muestra siempre de forma consistente

export const DEMO_ORGANIZATION = {
  id: 'demo-org-001',
  name: 'TechFix Pro - Demo',
  address: 'Av. Tecnología 456, Miraflores, Lima',
  phone: '+51 999 123 456',
  email: 'info@techfixpro-demo.com',
  website: 'www.techfixpro-demo.com',
  logo_url: '/demo-logo.png'
}

export const DEMO_CUSTOMERS = [
  {
    id: 'demo-customer-1',
    name: 'Juan Carlos Mendoza',
    email: 'juan.mendoza@email.com',
    phone: '+51 987 654 321',
    address: 'Av. Brasil 234, Magdalena',
    customer_type: 'identified',
    is_recurrent: true,
    anonymous_identifier: null,
    notes: 'Cliente VIP, siempre puntual con los pagos',
    created_at: '2024-01-15T10:30:00Z',
    stats: {
      totalGastado: 2850,
      totalReparaciones: 8,
      reparaciones: 6,
      desbloqueos: 1,
      ventas: 1
    }
  },
  {
    id: 'demo-customer-2',
    name: 'María Elena García',
    email: 'maria.garcia@gmail.com',
    phone: '+51 912 345 678',
    address: 'Jr. Cusco 567, Breña',
    customer_type: 'identified',
    is_recurrent: true,
    anonymous_identifier: null,
    notes: 'Profesora, cuida mucho sus equipos',
    created_at: '2024-02-10T14:20:00Z',
    stats: {
      totalGastado: 1650,
      totalReparaciones: 5,
      reparaciones: 4,
      desbloqueos: 0,
      ventas: 1
    }
  },
  {
    id: 'demo-customer-3',
    name: 'Soluciones Tech SAC',
    email: 'ventas@solucionestech.com',
    phone: '+51 945 678 912',
    address: 'Av. Arequipa 1234, San Isidro',
    customer_type: 'identified',
    is_recurrent: true,
    anonymous_identifier: null,
    notes: 'Empresa cliente, compras al por mayor',
    created_at: '2024-01-05T09:15:00Z',
    stats: {
      totalGastado: 8950,
      totalReparaciones: 15,
      reparaciones: 12,
      desbloqueos: 2,
      ventas: 1
    }
  },
  {
    id: 'demo-customer-4',
    name: null,
    email: null,
    phone: '+51 923 456 789',
    address: null,
    customer_type: 'anonymous',
    is_recurrent: false,
    anonymous_identifier: 'CUST-240320-001',
    notes: 'Cliente de paso, reparación rápida',
    created_at: '2024-03-20T16:45:00Z',
    stats: {
      totalGastado: 180,
      totalReparaciones: 1,
      reparaciones: 1,
      desbloqueos: 0,
      ventas: 0
    }
  },
  {
    id: 'demo-customer-5',
    name: 'Carlos Rodriguez',
    email: 'carlos.r@hotmail.com',
    phone: '+51 956 789 123',
    address: 'Calle Las Flores 890, San Miguel',
    customer_type: 'identified',
    is_recurrent: false,
    anonymous_identifier: null,
    notes: 'Ingeniero, conoce del tema técnico',
    created_at: '2024-03-01T11:30:00Z',
    stats: {
      totalGastado: 450,
      totalReparaciones: 2,
      reparaciones: 2,
      desbloqueos: 0,
      ventas: 0
    }
  }
]

export const DEMO_REPAIRS = [
  {
    id: 'demo-repair-1',
    title: 'Cambio de pantalla completa',
    description: 'Reemplazo de display y touch por caída',
    problem_description: 'Cliente reporta que se le cayó el teléfono y la pantalla se quebró completamente. Touch no responde.',
    solution_description: 'Se procedió al cambio completo del módulo de pantalla. Se realizaron pruebas de funcionalidad.',
    status: 'delivered',
    priority: 'medium',
    cost: 380,
    estimated_completion_date: '2024-03-15',
    actual_completion_date: '2024-03-14',
    received_date: '2024-03-12T09:30:00Z',
    delivered_date: '2024-03-14T16:20:00Z',
    warranty_days: 90,
    internal_notes: 'Pantalla original disponible en stock',
    customer_notes: 'Evitar caídas, usar protector de pantalla',
    customer_name: 'Juan Carlos Mendoza',
    device_info: 'iPhone 14 Pro - 256GB - Azul',
    created_at: '2024-03-12T09:30:00Z'
  },
  {
    id: 'demo-repair-2',
    title: 'Cambio de batería',
    description: 'Batería agotada, no retiene carga',
    problem_description: 'El equipo se apaga constantemente y la batería dura menos de 2 horas.',
    solution_description: 'Cambio de batería original. Calibración del sistema de carga.',
    status: 'completed',
    priority: 'high',
    cost: 180,
    estimated_completion_date: '2024-03-18',
    actual_completion_date: '2024-03-17',
    received_date: '2024-03-16T14:15:00Z',
    delivered_date: null,
    warranty_days: 180,
    internal_notes: 'Batería con 89% de salud',
    customer_notes: 'Nueva batería con 6 meses de garantía',
    customer_name: 'María Elena García',
    device_info: 'Samsung Galaxy S23 - 128GB - Negro',
    created_at: '2024-03-16T14:15:00Z'
  },
  {
    id: 'demo-repair-3',
    title: 'Limpieza por daño de líquido',
    description: 'Equipo expuesto a líquido, no enciende',
    problem_description: 'Cliente indica que el teléfono se mojó con agua de lluvia y ahora no enciende.',
    solution_description: null,
    status: 'in_progress',
    priority: 'urgent',
    cost: 120,
    estimated_completion_date: '2024-03-20',
    actual_completion_date: null,
    received_date: '2024-03-18T10:45:00Z',
    delivered_date: null,
    warranty_days: 30,
    internal_notes: 'En proceso de limpieza con ultrasonido',
    customer_notes: 'Pronóstico reservado por daño de líquido',
    customer_name: 'Carlos Rodriguez',
    device_info: 'Xiaomi Redmi Note 12 - 64GB - Azul',
    created_at: '2024-03-18T10:45:00Z'
  },
  {
    id: 'demo-repair-4',
    title: 'Reparación puerto de carga',
    description: 'Puerto USB-C dañado, no carga',
    problem_description: 'El cable no hace contacto bien y hay que moverlo para que cargue.',
    solution_description: 'Reemplazo del módulo de carga completo.',
    status: 'diagnosed',
    priority: 'medium',
    cost: 150,
    estimated_completion_date: '2024-03-22',
    actual_completion_date: null,
    received_date: '2024-03-19T13:20:00Z',
    delivered_date: null,
    warranty_days: 90,
    internal_notes: 'Módulo de carga en camino',
    customer_notes: 'Esperando repuesto, llegada estimada 2 días',
    customer_name: 'CUST-240320-001',
    device_info: 'Motorola Edge 40 - 256GB - Verde',
    created_at: '2024-03-19T13:20:00Z'
  },
  {
    id: 'demo-repair-5',
    title: 'Formateo y reinstalación OS',
    description: 'Sistema operativo corrupto',
    problem_description: 'El teléfono se reinicia constantemente y no completa el arranque.',
    solution_description: null,
    status: 'received',
    priority: 'low',
    cost: 80,
    estimated_completion_date: '2024-03-25',
    actual_completion_date: null,
    received_date: '2024-03-20T08:30:00Z',
    delivered_date: null,
    warranty_days: 30,
    internal_notes: 'Pendiente diagnóstico completo',
    customer_notes: 'Backup de datos solicitado por cliente',
    customer_name: 'Soluciones Tech SAC',
    device_info: 'OnePlus Nord 3 - 128GB - Gris',
    created_at: '2024-03-20T08:30:00Z'
  }
]

export const DEMO_INVENTORY = [
  {
    id: 'demo-product-1',
    name: 'Pantalla iPhone 14 Pro',
    description: 'Display OLED original con touch integrado',
    category: 'Pantallas',
    brand: 'Apple',
    model: 'iPhone 14 Pro',
    stock_quantity: 8,
    min_stock: 3,
    unit_cost: 280,
    sale_price: 380,
    sku: 'APL-14P-SCRN-001',
    supplier: 'TechParts Global',
    location: 'Estante A-2',
    is_active: true,
    created_at: '2024-01-10T00:00:00Z'
  },
  {
    id: 'demo-product-2',
    name: 'Batería Samsung Galaxy S23',
    description: 'Batería Li-ion 3900mAh original',
    category: 'Baterías',
    brand: 'Samsung',
    model: 'Galaxy S23',
    stock_quantity: 15,
    min_stock: 5,
    unit_cost: 45,
    sale_price: 80,
    sku: 'SAM-S23-BAT-001',
    supplier: 'Samsung Parts Peru',
    location: 'Estante B-1',
    is_active: true,
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'demo-product-3',
    name: 'Cargador USB-C 65W',
    description: 'Cargador rápido universal USB-C',
    category: 'Accesorios',
    brand: 'Anker',
    model: 'PowerPort III',
    stock_quantity: 2,
    min_stock: 5,
    unit_cost: 25,
    sale_price: 45,
    sku: 'ANK-65W-USC-001',
    supplier: 'Accesorios Lima',
    location: 'Vitrina Principal',
    is_active: true,
    created_at: '2024-02-01T00:00:00Z'
  },
  {
    id: 'demo-product-4',
    name: 'Protector Pantalla Tempered',
    description: 'Cristal templado 9H universal',
    category: 'Accesorios',
    brand: 'Generic',
    model: 'Universal',
    stock_quantity: 0,
    min_stock: 10,
    unit_cost: 3,
    sale_price: 8,
    sku: 'GEN-TMP-UNI-001',
    supplier: 'Accesorios Lima',
    location: 'Cajón D-3',
    is_active: true,
    created_at: '2024-02-15T00:00:00Z'
  },
  {
    id: 'demo-product-5',
    name: 'Kit Destornilladores iPhone',
    description: 'Set completo herramientas iPhone',
    category: 'Herramientas',
    brand: 'iFixit',
    model: 'Pro Tech Toolkit',
    stock_quantity: 3,
    min_stock: 2,
    unit_cost: 35,
    sale_price: 60,
    sku: 'IFX-KIT-IPH-001',
    supplier: 'iFixit Peru',
    location: 'Área Técnica',
    is_active: true,
    created_at: '2024-01-20T00:00:00Z'
  }
]

export const DEMO_SALES = [
  {
    id: 'demo-sale-1',
    customer_name: 'Juan Carlos Mendoza',
    total: 53,
    payment_method: 'card',
    sale_type: 'product',
    notes: 'Venta de accesorios',
    created_at: '2024-03-15T16:30:00Z',
    items: [
      { name: 'Cargador USB-C 65W', quantity: 1, price: 45 },
      { name: 'Protector Pantalla Tempered', quantity: 1, price: 8 }
    ]
  },
  {
    id: 'demo-sale-2',
    customer_name: 'María Elena García',
    total: 180,
    payment_method: 'cash',
    sale_type: 'service',
    notes: 'Pago por cambio de batería',
    created_at: '2024-03-17T17:45:00Z',
    items: [
      { name: 'Servicio: Cambio de batería', quantity: 1, price: 180 }
    ]
  },
  {
    id: 'demo-sale-3',
    customer_name: 'Cliente General',
    total: 24,
    payment_method: 'yape',
    sale_type: 'product',
    notes: 'Compra rápida',
    created_at: '2024-03-18T12:15:00Z',
    items: [
      { name: 'Protector Pantalla Tempered', quantity: 3, price: 8 }
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
    cost: 120,
    provider: 'UnlockTool Pro',
    notes: 'Desbloqueo exitoso, todas las redes',
    created_at: '2024-03-10T10:00:00Z',
    completion_time: '2024-03-12T14:30:00Z'
  },
  {
    id: 'demo-unlock-2',
    customer_name: 'Soluciones Tech SAC',
    brand: 'iPhone',
    model: '13 Pro Max',
    imei: '359842097531469',
    unlock_type: 'iCloud Bypass',
    status: 'in_progress',
    cost: 250,
    provider: 'iOS Unlock Service',
    notes: 'En proceso, tiempo estimado 48-72 horas',
    created_at: '2024-03-18T09:20:00Z',
    completion_time: null
  }
]

export const DEMO_TECHNICIANS = [
  {
    id: 'demo-tech-1',
    name: 'Miguel Ángel Torres',
    email: 'miguel.torres@techfixpro.com',
    phone: '+51 987 123 456',
    role: 'technician',
    status: 'active',
    specializations: ['iPhone', 'Samsung', 'Xiaomi'],
    created_at: '2024-01-01T00:00:00Z',
    stats: {
      totalRepairs: 145,
      completedRepairs: 138,
      avgTime: '2.1 días',
      satisfaction: 4.8
    }
  },
  {
    id: 'demo-tech-2',
    name: 'Ana Sofía Vargas',
    email: 'ana.vargas@techfixpro.com',
    phone: '+51 912 234 567',
    role: 'technician',
    status: 'active',
    specializations: ['Laptops', 'Tablets', 'Smartwatch'],
    created_at: '2024-01-15T00:00:00Z',
    stats: {
      totalRepairs: 89,
      completedRepairs: 84,
      avgTime: '1.8 días',
      satisfaction: 4.9
    }
  },
  {
    id: 'demo-tech-3',
    name: 'Roberto Chen',
    email: 'roberto.chen@techfixpro.com',
    phone: '+51 945 345 678',
    role: 'technician',
    status: 'inactive',
    specializations: ['Motherboards', 'Soldadura', 'Diagnóstico'],
    created_at: '2024-02-01T00:00:00Z',
    stats: {
      totalRepairs: 67,
      completedRepairs: 62,
      avgTime: '3.2 días',
      satisfaction: 4.7
    }
  }
]

export const DEMO_STATS = {
  // Dashboard principal
  totalRevenue: 18750,
  dailyRevenue: 1250,
  totalRepairs: 127,
  completedRepairs: 95,
  pendingRepairs: 18,
  inProgressRepairs: 14,
  totalCustomers: 45,
  totalDevices: 89,
  todayRepairs: 8,
  totalUnlocks: 23,
  todayUnlocks: 2,
  weeklyRevenue: 8950,
  weeklyRepairs: 34,
  
  // Estadísticas específicas
  customerStats: {
    identified: 35,
    anonymous: 10,
    recurrent: 18,
    vip: 8
  },
  
  repairStats: {
    received: 5,
    diagnosed: 8,
    inProgress: 14,
    waitingParts: 6,
    completed: 32,
    delivered: 58,
    cancelled: 4
  },
  
  inventoryStats: {
    totalProducts: 89,
    lowStock: 8,
    outOfStock: 3,
    totalValue: 45600
  },
  
  salesStats: {
    thisMonth: 234,
    lastMonth: 198,
    avgTicket: 156,
    topPaymentMethod: 'card'
  }
}

// Función helper para obtener todos los datos demo
export function getAllDemoData() {
  return {
    organization: DEMO_ORGANIZATION,
    customers: DEMO_CUSTOMERS,
    repairs: DEMO_REPAIRS,
    inventory: DEMO_INVENTORY,
    sales: DEMO_SALES,
    unlocks: DEMO_UNLOCKS,
    technicians: DEMO_TECHNICIANS,
    stats: DEMO_STATS
  }
} 