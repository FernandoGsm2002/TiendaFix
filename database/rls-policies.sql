-- ================================
-- ROW LEVEL SECURITY POLICIES
-- ================================

-- Habilitar RLS en todas las tablas principales
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para organizaciones (solo dueños pueden ver su propia organización)
CREATE POLICY "Users can view their own organization" ON organizations
    FOR SELECT USING (id = (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Políticas RLS para usuarios
CREATE POLICY "Users can view users in their organization" ON users
    FOR SELECT USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = auth.uid());

-- Políticas RLS para todas las tablas con organization_id
CREATE POLICY "Organization data isolation" ON customers
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Organization data isolation" ON devices
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Organization data isolation" ON repairs
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Organization data isolation" ON inventory
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Organization data isolation" ON repair_parts
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Organization data isolation" ON inventory_movements
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Organization data isolation" ON sales
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Organization data isolation" ON sale_items
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Organization data isolation" ON unlocks
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Organization data isolation" ON organization_settings
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

-- ================================
-- TRIGGERS Y FUNCIONES
-- ================================

-- Función para actualizar el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_repairs_updated_at BEFORE UPDATE ON repairs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_unlocks_updated_at BEFORE UPDATE ON unlocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organization_settings_updated_at BEFORE UPDATE ON organization_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar stock cuando se usan repuestos
CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Reducir stock cuando se usa un repuesto
        UPDATE inventory 
        SET stock_quantity = stock_quantity - NEW.quantity
        WHERE id = NEW.inventory_id;
        
        -- Registrar movimiento de inventario
        INSERT INTO inventory_movements (
            organization_id, inventory_id, movement_type, quantity, 
            reason, reference_id, reference_type, user_id
        ) VALUES (
            NEW.organization_id, NEW.inventory_id, 'out', NEW.quantity,
            'Usado en reparación', NEW.repair_id, 'repair', 
            (SELECT created_by FROM repairs WHERE id = NEW.repair_id)
        );
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger para actualización de stock
CREATE TRIGGER trigger_update_inventory_stock 
    AFTER INSERT ON repair_parts 
    FOR EACH ROW EXECUTE FUNCTION update_inventory_stock();

-- Función para actualizar stock en ventas
CREATE OR REPLACE FUNCTION update_inventory_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Reducir stock cuando se vende un producto
        UPDATE inventory 
        SET stock_quantity = stock_quantity - NEW.quantity
        WHERE id = NEW.inventory_id;
        
        -- Registrar movimiento de inventario
        INSERT INTO inventory_movements (
            organization_id, inventory_id, movement_type, quantity, 
            reason, reference_id, reference_type, user_id
        ) VALUES (
            NEW.organization_id, NEW.inventory_id, 'out', NEW.quantity,
            'Venta de producto', NEW.sale_id, 'sale', 
            (SELECT created_by FROM sales WHERE id = NEW.sale_id)
        );
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger para ventas
CREATE TRIGGER trigger_update_inventory_on_sale 
    AFTER INSERT ON sale_items 
    FOR EACH ROW EXECUTE FUNCTION update_inventory_on_sale();

-- Función para establecer organization_id automáticamente
CREATE OR REPLACE FUNCTION set_organization_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Obtener organization_id del usuario actual
    IF NEW.organization_id IS NULL THEN
        NEW.organization_id := (SELECT organization_id FROM users WHERE id = auth.uid());
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger para establecer organization_id automáticamente
CREATE TRIGGER set_organization_id_customers BEFORE INSERT ON customers FOR EACH ROW EXECUTE FUNCTION set_organization_id();
CREATE TRIGGER set_organization_id_devices BEFORE INSERT ON devices FOR EACH ROW EXECUTE FUNCTION set_organization_id();
CREATE TRIGGER set_organization_id_repairs BEFORE INSERT ON repairs FOR EACH ROW EXECUTE FUNCTION set_organization_id();
CREATE TRIGGER set_organization_id_inventory BEFORE INSERT ON inventory FOR EACH ROW EXECUTE FUNCTION set_organization_id();
CREATE TRIGGER set_organization_id_sales BEFORE INSERT ON sales FOR EACH ROW EXECUTE FUNCTION set_organization_id();
CREATE TRIGGER set_organization_id_unlocks BEFORE INSERT ON unlocks FOR EACH ROW EXECUTE FUNCTION set_organization_id(); 