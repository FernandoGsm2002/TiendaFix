
-- Índices para tabla customers
CREATE INDEX IF NOT EXISTS idx_customers_organization_id ON customers(organization_id);
CREATE INDEX IF NOT EXISTS idx_customers_org_type ON customers(organization_id, customer_type);
CREATE INDEX IF NOT EXISTS idx_customers_org_created ON customers(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_search ON customers USING gin(to_tsvector('spanish', name || ' ' || COALESCE(phone, '') || ' ' || COALESCE(email, '')));

-- Índices para tabla repairs
CREATE INDEX IF NOT EXISTS idx_repairs_organization_id ON repairs(organization_id);
CREATE INDEX IF NOT EXISTS idx_repairs_org_status ON repairs(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_repairs_org_created_by ON repairs(organization_id, created_by);
CREATE INDEX IF NOT EXISTS idx_repairs_org_created ON repairs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_repairs_org_customer ON repairs(organization_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_repairs_search ON repairs USING gin(to_tsvector('spanish', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(problem_description, '')));

-- Índices para tabla inventory
CREATE INDEX IF NOT EXISTS idx_inventory_organization_id ON inventory(organization_id);
CREATE INDEX IF NOT EXISTS idx_inventory_org_active ON inventory(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_inventory_org_low_stock ON inventory(organization_id, stock_quantity, min_stock) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_inventory_search ON inventory USING gin(to_tsvector('spanish', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(brand, '') || ' ' || COALESCE(model, '')));

-- Índices para tabla unlocks
CREATE INDEX IF NOT EXISTS idx_unlocks_organization_id ON unlocks(organization_id);
CREATE INDEX IF NOT EXISTS idx_unlocks_org_status ON unlocks(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_unlocks_org_created_by ON unlocks(organization_id, created_by);
CREATE INDEX IF NOT EXISTS idx_unlocks_org_created ON unlocks(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_unlocks_org_customer ON unlocks(organization_id, customer_id);

-- Índices para tabla sales
CREATE INDEX IF NOT EXISTS idx_sales_organization_id ON sales(organization_id);
CREATE INDEX IF NOT EXISTS idx_sales_org_created_by ON sales(organization_id, created_by);
CREATE INDEX IF NOT EXISTS idx_sales_org_created ON sales(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_org_customer ON sales(organization_id, customer_id);

-- Índices para tabla devices
CREATE INDEX IF NOT EXISTS idx_devices_organization_id ON devices(organization_id);
CREATE INDEX IF NOT EXISTS idx_devices_org_customer ON devices(organization_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_devices_search ON devices USING gin(to_tsvector('spanish', brand || ' ' || model || ' ' || COALESCE(serial_number, '') || ' ' || COALESCE(imei, '')));

-- Índices para tabla users (optimización de autenticación)
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_organization_role ON users(organization_id, role);

-- Índices para tabla sale_items
CREATE INDEX IF NOT EXISTS idx_sale_items_organization_id ON sale_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_inventory_id ON sale_items(inventory_id);

-- Índices para tabla repair_parts
CREATE INDEX IF NOT EXISTS idx_repair_parts_organization_id ON repair_parts(organization_id);
CREATE INDEX IF NOT EXISTS idx_repair_parts_repair_id ON repair_parts(repair_id);
CREATE INDEX IF NOT EXISTS idx_repair_parts_inventory_id ON repair_parts(inventory_id);

-- Estadísticas para el optimizador de consultas
ANALYZE customers;
ANALYZE repairs;
ANALYZE inventory;
ANALYZE unlocks;
ANALYZE sales;
ANALYZE devices;
ANALYZE users;
ANALYZE sale_items;
ANALYZE repair_parts;

-- Comentarios para documentación
COMMENT ON INDEX idx_customers_org_type IS 'Índice compuesto para filtrar clientes por organización y tipo';
COMMENT ON INDEX idx_repairs_org_status IS 'Índice compuesto para filtrar reparaciones por organización y estado';
COMMENT ON INDEX idx_inventory_org_low_stock IS 'Índice parcial para inventario con bajo stock por organización';
COMMENT ON INDEX idx_customers_search IS 'Índice GIN para búsqueda de texto completo en clientes';
COMMENT ON INDEX idx_repairs_search IS 'Índice GIN para búsqueda de texto completo en reparaciones';
COMMENT ON INDEX idx_inventory_search IS 'Índice GIN para búsqueda de texto completo en inventario';
COMMENT ON INDEX idx_devices_search IS 'Índice GIN para búsqueda de texto completo en dispositivos'; 