# Arquitectura Multi-Tenant de TiendaFix-Web

## 🎯 **Objetivo**
Sistema multi-tenant robusto y escalable capaz de manejar cientos de organizaciones con aislamiento completo de datos y rendimiento optimizado.

## 🏗️ **Arquitectura Implementada**

### **1. Aislamiento de Datos**
- **Nivel de Base de Datos**: Cada registro incluye `organization_id`
- **Nivel de API**: Validación automática de pertenencia de datos
- **Nivel de Autenticación**: Verificación de roles y permisos

### **2. Componentes Principales**

#### **Multi-Tenant Utility** (`lib/utils/multi-tenant.ts`)
```typescript
// Funciones principales
validateMultiTenantAccess()    // Validación completa de acceso
buildOrganizationQuery()       // Constructor de queries filtradas
validateResourceOwnership()    // Validación de propiedad de recursos
logApiCall()                  // Logging consistente
```

#### **Roles y Permisos**
- **super_admin**: Acceso global a todas las organizaciones
- **owner**: Acceso completo a su organización
- **technician**: Acceso limitado a sus propios registros

### **3. APIs Refactorizadas**

#### **Patrón Estándar**
```typescript
export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  
  try {
    // 1. Validar acceso multi-tenant
    const validation = await validateMultiTenantAccess(cookieStore)
    if (!validation.success) return validation.response

    const { userProfile, organizationId, supabase } = validation.context
    
    // 2. Log de la operación
    logApiCall('API_NAME', organizationId, { userRole: userProfile.role })

    // 3. Query con filtro de organización
    let query = supabase
      .from('table')
      .select('*')
      .eq('organization_id', organizationId)

    // 4. Filtros adicionales por rol
    if (userProfile.role === 'technician') {
      query = query.eq('created_by', userProfile.id)
    }

    // 5. Ejecutar y retornar
    const { data, error } = await query
    // ...
  } catch (error) {
    // Manejo de errores estandarizado
  }
}
```

### **4. Optimizaciones de Rendimiento**

#### **Índices de Base de Datos**
```sql
-- Índices compuestos por organización
CREATE INDEX idx_table_org_field ON table(organization_id, field);
CREATE INDEX idx_table_org_created ON table(organization_id, created_at DESC);

-- Índices de búsqueda de texto completo
CREATE INDEX idx_table_search ON table USING gin(to_tsvector('spanish', searchable_fields));
```

#### **Consultas Optimizadas**
- Uso de índices compuestos
- Límites en paginación (máximo 100 registros)
- Consultas paralelas con `Promise.all`
- Filtros a nivel de base de datos

### **5. Seguridad Multi-Tenant**

#### **Validaciones Implementadas**
1. **Autenticación**: Verificación de sesión válida
2. **Autorización**: Validación de rol y permisos
3. **Aislamiento**: Filtrado automático por organización
4. **Propiedad**: Verificación de pertenencia de recursos

#### **Prevención de Data Leakage**
```typescript
// Validar que un recurso pertenece a la organización
const hasAccess = await validateResourceOwnership(
  supabase, 
  'customers', 
  customerId, 
  organizationId,
  userProfile.role === 'super_admin'
)
```

## 📊 **APIs Refactorizadas**

### **✅ Completadas**
- `/api/repairs` - Reparaciones con filtrado por técnico
- `/api/customers` - Clientes con estadísticas optimizadas
- `/api/notifications` - Notificaciones con priorización
- `/api/user/profile` - Perfil de usuario multi-tenant

### **🔄 En Proceso**
- `/api/inventory` - Inventario con bajo stock
- `/api/unlocks` - Desbloqueos por organización
- `/api/sales` - Ventas con validación de items
- `/api/technicians` - Gestión de técnicos

## 🚀 **Escalabilidad**

### **Capacidad Estimada**
- **Organizaciones**: 500+ simultáneas
- **Usuarios por org**: 50+ técnicos
- **Transacciones**: 10,000+ por día
- **Tiempo de respuesta**: <200ms promedio

### **Métricas de Rendimiento**
```javascript
// Logging automático en cada API
logApiCall('Repairs', organizationId, { 
  userRole: userProfile.role,
  userId: userProfile.id,
  queryTime: Date.now() - startTime
})
```

## 🔧 **Implementación**

### **Pasos para Nueva API**
1. Importar utilidades multi-tenant
2. Implementar validación de acceso
3. Aplicar filtros de organización
4. Agregar validaciones de propiedad
5. Implementar logging consistente

### **Ejemplo de Migración**
```typescript
// ANTES - API sin multi-tenant
const { data } = await supabase.from('repairs').select('*')

// DESPUÉS - API multi-tenant
const validation = await validateMultiTenantAccess(cookieStore)
if (!validation.success) return validation.response

const { organizationId, supabase } = validation.context
const { data } = await supabase
  .from('repairs')
  .select('*')
  .eq('organization_id', organizationId)
```

## 🛡️ **Seguridad Adicional**

### **Rate Limiting** (Recomendado)
- Límite por organización: 1000 req/min
- Límite por usuario: 100 req/min
- Límite global: 10,000 req/min

### **Monitoring**
- Logs de acceso por organización
- Alertas de uso anómalo
- Métricas de rendimiento por tenant

## 📈 **Próximos Pasos**

1. **Completar refactorización** de APIs restantes
2. **Implementar rate limiting** por organización
3. **Agregar métricas avanzadas** de uso
4. **Optimizar consultas** más complejas
5. **Implementar cache** por organización

## 🔍 **Troubleshooting**

### **Errores Comunes**
- `Organization not found`: Usuario sin organización asignada
- `Access denied`: Intento de acceso a recursos de otra organización
- `Insufficient permissions`: Rol insuficiente para la operación

### **Debugging**
```javascript
// Logs automáticos disponibles
console.log('✅ Multi-tenant access validated:', { userId, role, organizationId })
console.log('🔧 API_NAME called - Organization:', organizationId)
console.log('❌ Access denied to resource:', { resourceOrg, userOrg })
```

---

**Fecha de última actualización**: 2024-12-19  
**Versión**: 1.0  
**Autor**: Sistema Multi-Tenant TiendaFix 