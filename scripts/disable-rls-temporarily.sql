-- ================================
-- DESHABILITAR RLS TEMPORALMENTE
-- ================================

-- Deshabilitar RLS en las tablas problemáticas temporalmente
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE devices DISABLE ROW LEVEL SECURITY;
ALTER TABLE repairs DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE unlocks DISABLE ROW LEVEL SECURITY;

-- Nota: Esto es temporal para depuración
-- Se debe reactivar RLS con políticas corregidas 