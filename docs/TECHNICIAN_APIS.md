# APIs para Técnicos - TiendaFix

## Resumen

Este documento describe las APIs específicas creadas para el rol de técnico en TiendaFix. Todas las APIs implementan validación de autenticación y autorización para técnicos.

## Estructura de Seguridad

Todas las APIs verifican:
1. **Autenticación**: Usuario autenticado válido
2. **Autorización**: Rol específico de `technician`
3. **Alcance**: Datos limitados al técnico actual

## APIs Implementadas

### 1. Dashboard - Estadísticas del Técnico
**Endpoint**: `GET /api/dashboard/technician-stats`

**Descripción**: Obtiene estadísticas personalizadas para el dashboard del técnico.

**Response**:
```json
{
  "success": true,
  "data": {
    "stats": {
      "assignedRepairs": 12,
      "completedRepairs": 8,
      "inProgressRepairs": 3,
      "pendingRepairs": 1,
      "avgCompletionTime": 2.5,
      "weeklyEfficiency": 75,
      "monthlyRevenue": 2450.00,
      "todayTasks": 4
    },
    "chartData": {
      "repairsByStatus": {...},
      "efficiencyTrend": [...],
      "completionTimeline": [...]
    },
    "recentActivity": [...]
  }
}
```

### 2. Notificaciones del Técnico
**Endpoint**: `GET /api/notifications/technician`

**Descripción**: Obtiene notificaciones específicas del técnico (reparaciones y desbloqueos asignados).

**Response**:
```json
{
  "success": true,
  "data": {
    "totalNotifications": 5,
    "items": {
      "assignedRepairs": [...],
      "pendingUnlocks": [...]
    }
  }
}
```

### 3. Reparaciones (Filtradas por Técnico)
**Endpoint**: `GET /api/repairs?assigned_to_me=true`

**Descripción**: API de reparaciones existente con soporte para filtrar por técnico asignado.

**Parámetros adicionales**:
- `assigned_to_me=true`: Filtra solo reparaciones asignadas al técnico actual
- `priority`: Filtrar por prioridad (`alta`, `media`, `baja`)

### 4. Actualización de Reparaciones
**Endpoint**: `PUT /api/repairs/[id]`

**Descripción**: API existente con soporte mejorado para actualizaciones de progreso por técnicos.

**Body para actualización de progreso**:
```json
{
  "status": "in_progress",
  "progress_notes": "Iniciando diagnóstico del dispositivo"
}
```

### 5. Ventas del Técnico
**Endpoint**: `POST /api/sales/technician` | `GET /api/sales/technician`

**Descripción**: Gestión completa de ventas/POS para técnicos.

**POST - Crear Venta**:
```json
{
  "customer_id": "uuid-opcional",
  "customer_name": "Cliente de mostrador",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2,
      "price": 25.50
    }
  ],
  "payment_method": "efectivo",
  "notes": "Venta rápida"
}
```

**GET - Listar Ventas**:
Retorna ventas realizadas por el técnico con paginación.

### 6. Desbloqueos del Técnico
**Endpoint**: `GET /api/unlocks/technician` | `PUT /api/unlocks/technician`

**Descripción**: Gestión de servicios de desbloqueo asignados al técnico.

**GET - Parámetros**:
- `status`: `pending`, `in_progress`, `completed`, `cancelled`, `all`
- `search`: Buscar por IMEI, marca o modelo
- `page`, `limit`: Paginación

**PUT - Actualizar Estado**:
```json
{
  "unlockId": "uuid",
  "status": "completed",
  "notes": "Desbloqueo realizado exitosamente",
  "actual_time": "2 horas"
}
```

## Códigos de Estado

- **200**: Operación exitosa
- **401**: No autorizado (no autenticado)
- **403**: Acceso denegado (no es técnico)
- **404**: Recurso no encontrado
- **500**: Error interno del servidor

## Características de Seguridad

### Validación de Rol
```typescript
const { data: userProfile } = await supabase
  .from('user_profiles')
  .select('role, id, organization_id')
  .eq('user_id', session.user.id)
  .single()

if (!userProfile || userProfile.role !== 'technician') {
  return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
}
```

### Filtrado de Datos
- Solo datos de la organización del técnico
- Solo reparaciones/desbloqueos asignados al técnico
- Sin acceso a reportes o configuración global

### Logging
Todas las APIs incluyen logging detallado para auditoría:
```typescript
console.log('🔧 Technician API called:', endpoint)
console.error('🚨 Error:', error)
```

## Integración con Frontend

Las APIs están diseñadas para integrarse directamente con los componentes del dashboard del técnico:

- `TechnicianDashboardLayout`: Validación de rol
- `TechnicianHeader`: Notificaciones
- Páginas específicas: Consumo de APIs correspondientes

## Datos Mock

Durante el desarrollo, algunas APIs incluyen datos mock para testing:
- Desbloqueos: Datos simulados hasta implementar tabla
- Estadísticas: Cálculos basados en datos reales cuando están disponibles

## Próximos Pasos

1. **Implementar tablas faltantes**: `unlocks`, `sales`, `sale_items`
2. **Conectar APIs reales**: Reemplazar datos mock
3. **Optimizar queries**: Agregar índices para performance
4. **Implementar cache**: Para estadísticas frecuentemente consultadas
5. **Notificaciones en tiempo real**: WebSockets o Server-Sent Events

## Ejemplos de Uso

### Dashboard
```typescript
const response = await fetch('/api/dashboard/technician-stats')
const { data } = await response.json()
// Usar data.stats, data.chartData, data.recentActivity
```

### Actualizar Reparación
```typescript
const response = await fetch(`/api/repairs/${repairId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'in_progress',
    progress_notes: 'Diagnóstico completado'
  })
})
```

### Crear Venta
```typescript
const response = await fetch('/api/sales/technician', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: cartItems,
    payment_method: 'efectivo',
    customer_name: 'Cliente mostrador'
  })
})
``` 