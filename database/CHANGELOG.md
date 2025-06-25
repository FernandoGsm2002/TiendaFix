# Changelog - Base de Datos TiendaFix

## Versión 2.0 - Sistema Multi-tenant Avanzado

### 📋 Resumen de Cambios

Se implementó un sistema completo de gestión multi-tenant con las siguientes mejoras principales:

### 🆕 Nuevas Funcionalidades

#### 1. Sistema de Aprobación de Organizaciones
- **Nueva tabla**: `organization_requests`
- **Flujo**: Registro → Aprobación → Creación automática en Supabase Auth
- **Función**: `approve_organization_request()` para automatizar el proceso
- Solo el super admin (`admin@tiendafix.com`) puede aprobar solicitudes

#### 2. Roles Simplificados
- **Antes**: owner, admin, technician, employee
- **Ahora**: owner, technician (incluye employee)
- Los owners solo pueden crear técnicos, no otros admins
- Sistema de permisos más simple y seguro

#### 3. Clientes Anónimos/No Identificados
- Soporte para clientes que no quieren dar datos personales
- Generación automática de identificadores: `ANONIMO-001`, `ANONIMO-002`, etc.
- Tipos de cliente: `anonymous`, `identified`, `recurrent`
- Check constraint para garantizar identificación (nombre O anonymous_identifier)

#### 4. Sistema de Precios Duales
- **Antes**: Un solo precio de venta
- **Ahora**: `enduser_price` y `recurrent_price`
- Función `get_customer_price()` para obtener precio correcto automáticamente
- Los clientes se marcan como recurrentes automáticamente tras 3+ interacciones

### 🔧 Funciones Nuevas

#### `approve_organization_request(request_id)`
```sql
-- Aprueba una solicitud y crea la organización completa
SELECT approve_organization_request('uuid-de-solicitud');
```

#### `get_customer_price(inventory_id, customer_id)`
```sql
-- Obtiene el precio correcto según el tipo de cliente
SELECT get_customer_price('item-uuid', 'customer-uuid');
```

#### `generate_anonymous_identifier()`
```sql
-- Trigger que genera automáticamente identificadores para clientes anónimos
-- ANONIMO-001, ANONIMO-002, etc.
```

#### `check_recurrent_customer()`
```sql
-- Trigger que marca automáticamente clientes como recurrentes
-- Después de 3+ reparaciones o ventas
```

### 📊 Cambios en Tablas Existentes

#### `organizations`
- ✅ Agregado: `request_id` (referencia a solicitud original)
- ✅ Cambiado: `subscription_plan` default a `monthly_6`
- ✅ Cambiado: `subscription_start_date` default a NOW()

#### `users`
- ❌ Removido: `password_hash` (manejado por Supabase Auth)
- ✅ Agregado: `auth_user_id` (sincronización con Supabase Auth)
- ✅ Cambiado: `role` default a `technician`
- ✅ Simplificado: Solo roles `owner` y `technician`

#### `customers`
- ✅ Cambiado: `name` ahora puede ser NULL
- ✅ Agregado: `customer_type` (anonymous, identified, recurrent)
- ✅ Agregado: `is_recurrent` (para precios especiales)
- ✅ Agregado: `anonymous_identifier` (ANONIMO-XXX)
- ✅ Agregado: CHECK constraint para garantizar identificación

#### `inventory`
- ❌ Removido: `sale_price` (reemplazado por precios duales)
- ✅ Agregado: `enduser_price` (precio para usuarios finales)
- ✅ Agregado: `recurrent_price` (precio para clientes recurrentes)

### 🔒 Cambios en Seguridad (RLS)

#### Nuevas Políticas
- `organization_requests`: Solo super admin puede ver todas, usuarios solo la suya
- `users`: Owners pueden crear técnicos en su organización
- Todas las políticas actualizadas para usar `auth_user_id` en lugar de `id`

#### Políticas Actualizadas
- Cambio de `users.id = auth.uid()` a `users.auth_user_id = auth.uid()`
- Sincronización completa con Supabase Auth

### 🚀 Triggers Automáticos

#### Para Clientes Anónimos
```sql
CREATE TRIGGER trigger_generate_anonymous_identifier 
    BEFORE INSERT ON customers 
    FOR EACH ROW EXECUTE FUNCTION generate_anonymous_identifier();
```

#### Para Clientes Recurrentes
```sql
CREATE TRIGGER trigger_check_recurrent_customer_repairs
    AFTER INSERT ON repairs
    FOR EACH ROW EXECUTE FUNCTION check_recurrent_customer();
```

### 💡 Casos de Uso

#### 1. Registro de Nueva Tienda
```sql
-- Usuario llena formulario → Se crea organization_request
-- Admin aprueba → Se crea organization y user automáticamente
-- Frontend crea cuenta Supabase Auth → Se actualiza auth_user_id
```

#### 2. Cliente Anónimo
```sql
INSERT INTO customers (organization_id, customer_type) 
VALUES ('org-uuid', 'anonymous');
-- Resultado automático: anonymous_identifier = 'ANONIMO-001'
```

#### 3. Precios Automáticos
```sql
-- En una venta, el sistema aplica automáticamente:
-- Cliente recurrente: recurrent_price
-- Cliente nuevo: enduser_price
SELECT get_customer_price('item-uuid', 'customer-uuid');
```

#### 4. Cliente se Vuelve Recurrente
```sql
-- Automáticamente después de 3+ reparaciones/ventas:
-- is_recurrent = true, customer_type = 'recurrent'
```

### 📈 Reportes Nuevos

Ver archivo `database/examples_and_usage.sql` para consultas completas:

- Solicitudes pendientes de aprobación
- Clientes por tipo (anónimos, identificados, recurrentes)
- Productos con stock bajo
- Clientes que se volvieron recurrentes automáticamente
- Técnicos más productivos

### ⚠️ Notas de Migración

1. **Backup requerido** antes de aplicar cambios
2. Crear usuario super admin en Supabase Auth: `admin@tiendafix.com`
3. Migrar datos existentes si los hay:
   - Actualizar `users.auth_user_id` con IDs de Supabase Auth
   - Convertir `sale_price` a `enduser_price` en inventario
   - Clasificar clientes existentes por tipo

### 🔄 Próximos Pasos

1. Implementar frontend para solicitudes de organizaciones
2. Panel de super admin para aprobar tiendas
3. Sistema de notificaciones por email
4. Integración completa con Supabase Auth
5. Dashboard para métricas de clientes recurrentes

### 📚 Documentación

- `database/schema.sql` - Esquema completo actualizado
- `database/examples_and_usage.sql` - Ejemplos de uso
- `database/rls-policies.sql` - Políticas de seguridad
- `README.md` - Documentación general 