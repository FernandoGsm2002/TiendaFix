# TiendaFix - Sistema de Gestión

Sistema moderno de gestión para talleres de reparación de dispositivos móviles.

## 🚀 Deployment en Vercel

### Variables de Entorno Requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_SUPER_ADMIN_EMAIL=admin@yourdomain.com
```

### Configuración Rápida

1. **Fork este repositorio**
2. **Conecta con Vercel**
3. **Configura las variables de entorno**
4. **Deploy automático** ✅

## 📋 Características

- ✅ Gestión de reparaciones
- ✅ Control de inventario
- ✅ Sistema de ventas (POS)
- ✅ Gestión de clientes
- ✅ Servicios de desbloqueo
- ✅ Panel de administración
- ✅ Multi-tenant
- ✅ Responsive design

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: HeroUI
- **Backend**: Supabase (PostgreSQL + Auth)
- **Deployment**: Vercel

## 🔧 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Ejecutar en desarrollo
npm run dev
```

## 📱 Responsive Design

- **Mobile First**: Optimizado para dispositivos móviles
- **Tablet & Desktop**: Interfaces adaptativas
- **PWA Ready**: Instalable como app

## 🔐 Configuración de Admin

1. Ejecuta el script SQL en tu proyecto Supabase:
   ```sql
   -- Ver: scripts/fix-superadmin-definitivo.sql
   ```

2. Configura tu usuario como super_admin en la tabla `users`

3. Inicia sesión con el email configurado en `NEXT_PUBLIC_SUPER_ADMIN_EMAIL`

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.

---

**🚀 Deploy fácil con Vercel - Zero Configuration** 