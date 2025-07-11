# 📦 Configuración de Supabase Storage para Logos

## 🚨 Importante
Este paso es **OBLIGATORIO** para que la funcionalidad de logos funcione en producción.

## 📋 Pasos a Seguir

### 1. **Acceder al Dashboard de Supabase**
1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto TiendaFix

### 2. **Ejecutar la Migración de Storage**
1. En el dashboard, ve a **SQL Editor** (lado izquierdo)
2. Crea una nueva query
3. Copia y pega el contenido del archivo: `database/migrations/010_setup_storage_bucket.sql`
4. Ejecuta la query haciendo clic en **RUN**

### 3. **Verificar la Configuración**
1. Ve a **Storage** en el menú lateral
2. Deberías ver un bucket llamado `organization-logos`
3. Haz clic en el bucket para verificar que está configurado como público

### 4. **Configurar Variables de Entorno**
Asegúrate de que tu archivo `.env.local` tenga estas variables:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key
```

## ✅ Verificación
Después de completar estos pasos:

1. Ve a tu aplicación → Dashboard Owner → Configuración
2. Sube una imagen de prueba
3. Verifica que aparezca en las impresiones

## 📁 Estructura del Bucket
```
organization-logos/
├── logo-uuid1-timestamp1.jpg
├── logo-uuid2-timestamp2.png
└── logo-uuid3-timestamp3.webp
```

## 🔒 Seguridad Implementada
- ✅ Solo owners pueden subir logos de su organización
- ✅ Archivos públicamente accesibles para impresiones
- ✅ Límite de 5MB por archivo
- ✅ Solo formatos de imagen permitidos
- ✅ Eliminación automática de logos antiguos

## 🆘 Troubleshooting

### Error: "Bucket not found"
- Asegúrate de haber ejecutado la migración SQL
- Verifica que el bucket existe en Storage

### Error: "Policy violation"
- Verifica que el usuario tenga rol 'owner'
- Confirma que las políticas RLS se aplicaron correctamente

### Error: "File too large"
- El límite es 5MB
- Comprime la imagen antes de subirla

## 📞 Soporte
Si tienes problemas con la configuración, revisa:
1. Los logs de Supabase en el dashboard
2. La consola del navegador para errores específicos
3. Que todas las variables de entorno estén configuradas

---

**⚠️ Nota**: Sin esta configuración, la funcionalidad de logos **NO funcionará** en producción. 