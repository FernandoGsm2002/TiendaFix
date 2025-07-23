# 🔍 Debug Checklist: Campos de Desbloqueo

## 🧪 Pasos para Diagnosticar

### Paso 1: Verificar que los logs aparecen
1. Abre **DevTools** (F12) → **Console**
2. Recarga la página de reparaciones del técnico
3. **Deberías ver**:
   ```
   🔍 API Response - First repair: {objeto con datos}
   🔍 API Response - Unlock fields for first repair: {unlock_type, device_pin, device_pattern}
   ```

### Paso 2: Verificar datos de una reparación
1. Haz clic en **"Ver"** en cualquier reparación
2. **Deberías ver**:
   ```
   🔍 Repair details: {id, unlock_type, device_pin, device_pattern}
   ```

### Paso 3: Verificar modal de impresión
1. Haz clic en **"Ticket"** o **"Imprimir Ticket"**
2. **Deberías ver**:
   ```
   🖨️ Print button clicked! Opening print modal for repair: {...}
   🖨️ Setting repairToPrint and opening modal...
   🖨️ Modal should be open now. isPrintModalOpen will be true.
   🖨️ Print modal state changed: {isPrintModalOpen: true, ...}
   ```
3. **Debería aparecer**: Un modal con "Opciones de Impresión"

### Paso 4: Verificar base de datos directamente
1. Ve a: `http://localhost:3000/api/test-repairs`
2. **Deberías ver**: JSON con datos de prueba de la tabla y vista

## 🐛 Problemas Posibles y Soluciones

### Si no aparecen los logs del Paso 1:
- ❌ **Problema**: La página no se está ejecutando o hay errores de JavaScript
- ✅ **Solución**: Revisar la consola por errores y refrescar

### Si los campos son `null` o `undefined`:
- ❌ **Problema**: Los datos no están en la base de datos o la vista no está actualizada
- ✅ **Solución**: 
  1. Ejecutar el script `scripts/update-repairs-with-unlock-fields.sql`
  2. Crear una nueva reparación con PIN/patrón para probar

### Si el modal no aparece:
- ❌ **Problema**: Error de JavaScript o componente no importado
- ✅ **Solución**: Revisar consola por errores y verificar imports

### Si los campos aparecen pero no se muestran en detalles:
- ❌ **Problema**: Interfaz TypeScript desactualizada o componente no renderizando
- ✅ **Solución**: Verificar que `selectedRepair` tiene los campos correctos

## 🔧 Comandos de Verificación Rápida

### En la consola del navegador:
```javascript
// Verificar estado de reparaciones cargadas
console.log('Repairs:', window.__REPAIRS_DEBUG__ || 'No disponible')

// Verificar estado del modal
console.log('Modal state:', {
  isPrintModalOpen: window.__PRINT_MODAL_DEBUG__,
  repairToPrint: window.__REPAIR_TO_PRINT_DEBUG__
})
```

### En Supabase SQL Editor:
```sql
-- Verificar campos en tabla
SELECT id, title, device_pin, device_pattern, unlock_type 
FROM repairs 
WHERE device_pin IS NOT NULL OR device_pattern IS NOT NULL 
LIMIT 5;

-- Verificar campos en vista
SELECT id, title, device_pin, device_pattern, unlock_type 
FROM repairs_view 
WHERE device_pin IS NOT NULL OR device_pattern IS NOT NULL 
LIMIT 5;
```

## 🎯 Próximos Pasos

1. **Ejecutar verificaciones** en orden
2. **Reportar resultados** de cada paso
3. **Identificar** dónde se detiene el flujo
4. **Aplicar solución** específica

---

**Nota**: Si todos los logs aparecen pero aún no funciona, puede ser un problema de caché del navegador. Prueba **Ctrl+Shift+R** para refrescar forzado. 