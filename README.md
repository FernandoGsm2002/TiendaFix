# TiendaFix Web

Sistema web completo para gestión de tiendas de reparación de dispositivos electrónicos con arquitectura multi-tenant.

## 🚀 Características

- **Multi-tenant**: Cada tienda tiene sus datos completamente aislados
- **Dashboard**: Panel de control con métricas y estadísticas
- **Inventario**: Control completo de stock y repuestos
- **Clientes**: Gestión de clientes y dispositivos
- **Reparaciones**: Flujo completo desde recepción hasta entrega
- **Unlocks**: Gestión de servicios de desbloqueo (iCloud, FRP, Network, Bootloader)
- **POS**: Sistema de punto de venta integrado
- **Técnicos**: Asignación y seguimiento de trabajo
- **Configuraciones**: Personalización por organización

## 🛠 Tecnologías

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Base de datos**: PostgreSQL con Row Level Security (RLS)
- **Suscripciones**: Sistema de planes (3 meses, 6 meses, 1 año)

## 📋 Prerequisitos

- Node.js 18+ 
- Cuenta de Supabase
- Git

## 🔧 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/tiendafix-web.git
cd tiendafix-web
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

1. Crear un proyecto en [Supabase](https://supabase.com)
2. Ir a Settings > API y copiar:
   - Project URL
   - Anon key
   - Service role key

### 4. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=TiendaFix

OWNER_EMAIL=admin@tiendafix.com
OWNER_PASSWORD=tu_contraseña_segura
```

### 5. Configurar la base de datos

Ejecutar las migraciones en Supabase SQL Editor:

```sql
-- Ejecutar el contenido de database/migrations/001_initial_schema.sql
```

### 6. Configurar Row Level Security (RLS)

Ejecutar en Supabase SQL Editor:

```sql
-- Habilitar RLS en todas las tablas
-- (Contenido del archivo database/rls-policies.sql)
```

### 7. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🏗 Estructura del Proyecto

```
tiendafix-web/
├── app/                    # Aplicación Next.js 14 (App Router)
│   ├── auth/              # Páginas de autenticación
│   ├── dashboard/         # Panel principal de cada tienda
│   ├── owner/            # Panel del dueño para aprobar tiendas
│   └── globals.css       # Estilos globales
├── components/            # Componentes reutilizables
├── lib/                  # Utilidades y configuraciones
│   ├── supabase/         # Cliente Supabase
│   └── utils/            # Funciones auxiliares
├── database/             # Esquemas y migraciones
│   ├── migrations/       # Migraciones SQL
│   └── schema.sql        # Esquema completo
└── types/               # Tipos TypeScript
```

## 🗄 Estructura de la Base de Datos

### Tablas principales:

- **organizations**: Tiendas registradas
- **users**: Usuarios del sistema por organización
- **customers**: Clientes de cada tienda
- **devices**: Dispositivos de los clientes
- **repairs**: Reparaciones en proceso
- **inventory**: Inventario de repuestos
- **sales**: Ventas y servicios
- **unlocks**: Servicios de desbloqueo
- **organization_settings**: Configuraciones por tienda

### Características de seguridad:

- **UUID**: Todos los IDs son UUID para seguridad
- **RLS**: Row Level Security para aislamiento de datos
- **Multi-tenant**: Cada organización solo ve sus datos
- **Triggers**: Automatización de stock y movimientos

## 🔐 Sistema Multi-tenant

El sistema usa Row Level Security (RLS) de PostgreSQL para garantizar que:

1. Cada organización solo puede acceder a sus propios datos
2. Los usuarios solo ven información de su organización
3. Las políticas se aplican automáticamente a nivel de base de datos
4. No es posible acceder a datos de otras organizaciones

## 📱 Funcionalidades por Módulo

### Dashboard
- Métricas de reparaciones
- Estadísticas de ventas
- Dispositivos en proceso
- Alertas de stock bajo

### Inventario
- Control de stock
- Movimientos de inventario
- Categorías y proveedores
- Alertas de stock mínimo

### Clientes
- Base de datos de clientes
- Historial de dispositivos
- Documentos y contacto
- Notas personalizadas

### Reparaciones
- Estados del proceso
- Asignación de técnicos
- Costos y presupuestos
- Repuestos utilizados

### Unlocks
- iCloud removal
- FRP bypass
- Network unlock
- Bootloader unlock

### POS
- Ventas de productos
- Facturación de servicios
- Múltiples métodos de pago
- Historial de transacciones

### Técnicos
- Asignación de trabajos
- Seguimiento de productividad
- Horarios y turnos
- Estadísticas personales

## 🔧 Configuraciones

Cada organización puede personalizar:

- Información de la empresa
- Horarios de atención
- Tipos de impuestos
- Días de garantía
- Métodos de pago
- Categorías de dispositivos

## 📊 Planes de Suscripción

- **3 Meses**: $99 - Hasta 5 usuarios y 100 dispositivos
- **6 Meses**: $179 - Hasta 10 usuarios y 200 dispositivos
- **1 Año**: $299 - Usuarios y dispositivos ilimitados

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conectar el repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático

### Variables de entorno para producción:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url_produccion
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key_produccion
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key_produccion
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para la nueva feature (`git checkout -b feature/nueva-feature`)
3. Commit los cambios (`git commit -am 'Agregar nueva feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si necesitas ayuda:

1. Revisar la documentación
2. Buscar en issues existentes
3. Crear un nuevo issue con detalles del problema
4. Contactar a través de email: soporte@tiendafix.com

## 🔄 Roadmap

- [ ] App móvil (React Native)
- [ ] Notificaciones push
- [ ] Reportes avanzados
- [ ] Integración con proveedores de unlock
- [ ] API pública
- [ ] Webhook para integraciones
- [ ] Backup automático
- [ ] Multi-idioma

---

Desarrollado con ❤️ para la comunidad de reparación de dispositivos electrónicos. 