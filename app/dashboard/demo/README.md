# Dashboard Demo - TiendaFix

## Descripción

Este es el modo demo de TiendaFix, diseñado para mostrar la funcionalidad y interfaz del sistema sin datos reales.

## Características

- **Solo visualización**: Todas las funcionalidades están deshabilitadas
- **Datos estáticos**: Se muestran siempre los mismos datos de ejemplo
- **Interfaz completa**: Réplica del dashboard owner con todas las secciones
- **Indicadores visuales**: Claramente marcado como "MODO DEMO"

## Estructura

```
app/dashboard/demo/
├── components/
│   ├── DemoLayout.tsx      # Layout principal
│   ├── DemoHeader.tsx      # Header con branding demo
│   └── DemoSidebar.tsx     # Sidebar con navegación
├── clientes/
│   └── page.tsx            # Gestión de clientes
├── reparaciones/
│   └── page.tsx            # Gestión de reparaciones
├── inventario/
│   └── page.tsx            # Gestión de inventario
├── ventas/
│   └── page.tsx            # Gestión de ventas
├── desbloqueos/
│   └── page.tsx            # Gestión de desbloqueos
├── personal/
│   └── page.tsx            # Gestión de personal
├── reportes/
│   └── page.tsx            # Reportes
├── configuracion/
│   └── page.tsx            # Configuración
├── layout.tsx              # Layout raíz
└── page.tsx                # Dashboard principal
```

## Datos Demo

Los datos estáticos se encuentran en:
- `lib/demo/data.ts`

Incluye:
- Estadísticas de ejemplo
- Clientes ficticios
- Reparaciones de muestra
- Datos de inventario, ventas, etc.

## Uso

El modo demo está accesible en: `/dashboard/demo`

## Próximos Pasos

1. Expandir datos de ejemplo en `lib/demo/data.ts`
2. Implementar más funcionalidades visuales
3. Integrar con autenticación para redireccionar usuarios demo
4. Agregar más secciones según sea necesario 