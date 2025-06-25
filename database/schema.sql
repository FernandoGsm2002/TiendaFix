-- ================================
-- TIENDAFIX - ESQUEMA MULTI-TENANT
-- ================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================
-- TABLAS PRINCIPALES
-- ================================

-- Tabla de solicitudes de organizaciones (pendientes de aprobación)
CREATE TABLE organization_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    subscription_plan VARCHAR(50) DEFAULT 'monthly_6', -- monthly_3, monthly_6, yearly
    
    -- Datos del propietario
    owner_name VARCHAR(255) NOT NULL,
    owner_email VARCHAR(255) UNIQUE NOT NULL,
    owner_phone VARCHAR(20),
    owner_password_hash VARCHAR(255) NOT NULL,
    
    -- Estado de la solicitud
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de organizaciones (tiendas aprobadas)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    logo_url TEXT,
    subscription_plan VARCHAR(50) DEFAULT 'monthly_6', -- monthly_3, monthly_6, yearly
    subscription_status VARCHAR(20) DEFAULT 'active', -- active, inactive, expired
    subscription_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    max_users INTEGER DEFAULT 5,
    max_devices INTEGER DEFAULT 100,
    
    -- Referencia a la solicitud original
    request_id UUID REFERENCES organization_requests(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de usuarios del sistema
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'technician', -- owner, technician (incluye employee)
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Sincronización con Supabase Auth
    auth_user_id UUID UNIQUE, -- Referencia al auth.users de Supabase
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Información básica (puede ser anónima)
    name VARCHAR(255), -- Puede ser NULL para clientes anónimos
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    document_type VARCHAR(20), -- dni, ruc, passport
    document_number VARCHAR(50),
    
    -- Tipo de cliente
    customer_type VARCHAR(20) DEFAULT 'anonymous', -- anonymous, identified, recurrent
    is_recurrent BOOLEAN DEFAULT false, -- Para precios especiales
    
    -- Para clientes anónimos generar identificador temporal
    anonymous_identifier VARCHAR(50), -- Ej: "ANONIMO-001", "WALK-IN-123"
    
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: O tiene nombre o tiene anonymous_identifier
    CHECK (
        (name IS NOT NULL) OR 
        (anonymous_identifier IS NOT NULL)
    )
);

-- Tabla de dispositivos en reparación
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    device_type VARCHAR(50) NOT NULL, -- smartphone, tablet, laptop, desktop, console
    serial_number VARCHAR(100),
    imei VARCHAR(20),
    color VARCHAR(50),
    storage_capacity VARCHAR(20),
    operating_system VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reparaciones
CREATE TABLE repairs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    assigned_technician_id UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    problem_description TEXT NOT NULL,
    solution_description TEXT,
    status VARCHAR(50) DEFAULT 'received', -- received, diagnosed, in_progress, waiting_parts, completed, delivered, cancelled
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    estimated_cost DECIMAL(10,2),
    final_cost DECIMAL(10,2),
    estimated_completion_date DATE,
    actual_completion_date DATE,
    received_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_date TIMESTAMP WITH TIME ZONE,
    warranty_days INTEGER DEFAULT 30,
    internal_notes TEXT,
    customer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de inventario
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100),
    category VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(100),
    
    -- Control de stock
    stock_quantity INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    
    -- Precios
    unit_cost DECIMAL(10,2), -- Costo de compra
    enduser_price DECIMAL(10,2), -- Precio para usuarios finales/nuevos
    recurrent_price DECIMAL(10,2), -- Precio para clientes recurrentes
    
    -- Información adicional
    supplier VARCHAR(255),
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de repuestos usados en reparaciones
CREATE TABLE repair_parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    repair_id UUID REFERENCES repairs(id) ON DELETE CASCADE,
    inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de movimientos de inventario
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) NOT NULL, -- in, out, adjustment
    quantity INTEGER NOT NULL,
    reason VARCHAR(255),
    reference_id UUID, -- ID de la reparación o venta relacionada
    reference_type VARCHAR(50), -- repair, sale, purchase, adjustment
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ventas/servicios en POS
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),
    created_by UUID REFERENCES users(id),
    sale_type VARCHAR(20) DEFAULT 'product', -- product, service, repair
    reference_id UUID, -- ID de la reparación si es una venta de servicio
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50), -- cash, card, transfer, mixed
    payment_status VARCHAR(20) DEFAULT 'paid', -- pending, paid, partial
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items de ventas
CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de unlocks de dispositivos
CREATE TABLE unlocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),
    unlock_type VARCHAR(50) NOT NULL, -- icloud, frp, network, bootloader
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    imei VARCHAR(20),
    serial_number VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, failed
    cost DECIMAL(10,2),
    provider VARCHAR(100),
    provider_order_id VARCHAR(100),
    completion_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuraciones por organización
CREATE TABLE organization_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(20) DEFAULT 'string', -- string, number, boolean, json
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, setting_key)
);

-- ================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_customers_organization_id ON customers(organization_id);
CREATE INDEX idx_devices_organization_id ON devices(organization_id);
CREATE INDEX idx_repairs_organization_id ON repairs(organization_id);
CREATE INDEX idx_repairs_status ON repairs(status);
CREATE INDEX idx_repairs_technician ON repairs(assigned_technician_id);
CREATE INDEX idx_inventory_organization_id ON inventory(organization_id);
CREATE INDEX idx_sales_organization_id ON sales(organization_id);
CREATE INDEX idx_unlocks_organization_id ON unlocks(organization_id);

-- Índices para búsquedas de texto
CREATE INDEX idx_customers_name ON customers USING gin(to_tsvector('spanish', name));
CREATE INDEX idx_devices_search ON devices USING gin(to_tsvector('spanish', brand || ' ' || model));
CREATE INDEX idx_inventory_search ON inventory USING gin(to_tsvector('spanish', name || ' ' || description));

-- ================================
-- ROW LEVEL SECURITY (RLS)
-- ================================

-- Habilitar RLS en todas las tablas principales
ALTER TABLE organization_requests ENABLE ROW LEVEL SECURITY;
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

-- Políticas RLS para solicitudes de organizaciones
-- Solo el super admin puede ver todas las solicitudes
CREATE POLICY "Super admin can manage organization requests" ON organization_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND email = 'admin@tiendafix.com'
        )
    );

-- Los solicitantes pueden ver su propia solicitud
CREATE POLICY "Users can view their own organization request" ON organization_requests
    FOR SELECT USING (owner_email = auth.email());

-- Políticas RLS para organizaciones (solo dueños pueden ver su propia organización)
CREATE POLICY "Users can view their own organization" ON organizations
    FOR SELECT USING (id = (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

-- Políticas RLS para usuarios
CREATE POLICY "Users can view users in their organization" ON users
    FOR SELECT USING (organization_id = (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth_user_id = auth.uid());

-- Política para que owners puedan crear técnicos
CREATE POLICY "Owners can create technicians" ON users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.auth_user_id = auth.uid()
            AND u.role = 'owner'
            AND u.organization_id = organization_id
        )
        AND role = 'technician'
    );

-- Políticas RLS para todas las tablas con organization_id
CREATE POLICY "Organization data isolation" ON customers
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Organization data isolation" ON devices
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Organization data isolation" ON repairs
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Organization data isolation" ON inventory
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Organization data isolation" ON repair_parts
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Organization data isolation" ON inventory_movements
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Organization data isolation" ON sales
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Organization data isolation" ON sale_items
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Organization data isolation" ON unlocks
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Organization data isolation" ON organization_settings
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE auth_user_id = auth.uid()));

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
    UPDATE inventory
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.inventory_id;

    -- Registrar el movimiento
    INSERT INTO inventory_movements (
        organization_id, inventory_id, movement_type, quantity, 
        reason, reference_id, reference_type, user_id
    ) VALUES (
        NEW.organization_id, NEW.inventory_id, 'out', NEW.quantity,
        'Venta de producto', NEW.sale_id, 'sale', 
        (SELECT created_by FROM sales WHERE id = NEW.sale_id)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger para ventas
CREATE TRIGGER trigger_update_inventory_on_sale 
    AFTER INSERT ON sale_items 
    FOR EACH ROW EXECUTE FUNCTION update_inventory_on_sale();

-- Función para generar identificador anónimo automáticamente
CREATE OR REPLACE FUNCTION generate_anonymous_identifier()
RETURNS TRIGGER AS $$
DECLARE
    org_count INTEGER;
    new_identifier VARCHAR(50);
BEGIN
    -- Solo generar si no tiene nombre y no tiene anonymous_identifier
    IF NEW.name IS NULL AND NEW.anonymous_identifier IS NULL THEN
        -- Contar clientes anónimos existentes en la organización
        SELECT COUNT(*) INTO org_count 
        FROM customers 
        WHERE organization_id = NEW.organization_id 
        AND anonymous_identifier IS NOT NULL;
        
        -- Generar nuevo identificador
        new_identifier := 'ANONIMO-' || LPAD((org_count + 1)::TEXT, 3, '0');
        
        -- Asegurar que no existe
        WHILE EXISTS(SELECT 1 FROM customers WHERE organization_id = NEW.organization_id AND anonymous_identifier = new_identifier) LOOP
            org_count := org_count + 1;
            new_identifier := 'ANONIMO-' || LPAD((org_count + 1)::TEXT, 3, '0');
        END LOOP;
        
        NEW.anonymous_identifier := new_identifier;
        NEW.customer_type := 'anonymous';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger para generar identificadores anónimos
CREATE TRIGGER trigger_generate_anonymous_identifier 
    BEFORE INSERT ON customers 
    FOR EACH ROW EXECUTE FUNCTION generate_anonymous_identifier();

-- Función para aprobar una organización y crear cuenta en Supabase
CREATE OR REPLACE FUNCTION approve_organization_request(request_id_param UUID)
RETURNS UUID AS $$
DECLARE
    request_record organization_requests%ROWTYPE;
    new_org_id UUID;
    new_user_id UUID;
    subscription_end_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Obtener la solicitud
    SELECT * INTO request_record FROM organization_requests WHERE id = request_id_param;
    
    IF request_record.id IS NULL THEN
        RAISE EXCEPTION 'Request not found';
    END IF;
    
    IF request_record.status != 'pending' THEN
        RAISE EXCEPTION 'Request already processed';
    END IF;
    
    -- Calcular fecha de fin de suscripción
    CASE request_record.subscription_plan
        WHEN 'monthly_3' THEN subscription_end_date := NOW() + INTERVAL '3 months';
        WHEN 'monthly_6' THEN subscription_end_date := NOW() + INTERVAL '6 months';
        WHEN 'yearly' THEN subscription_end_date := NOW() + INTERVAL '1 year';
        ELSE subscription_end_date := NOW() + INTERVAL '6 months';
    END CASE;
    
    -- Crear la organización
    INSERT INTO organizations (
        name, slug, email, phone, address, subscription_plan, 
        subscription_end_date, request_id
    ) VALUES (
        request_record.name, request_record.slug, request_record.email, 
        request_record.phone, request_record.address, request_record.subscription_plan,
        subscription_end_date, request_record.id
    ) RETURNING id INTO new_org_id;
    
    -- Marcar solicitud como aprobada
    UPDATE organization_requests 
    SET status = 'approved', approved_by = auth.uid(), approved_at = NOW()
    WHERE id = request_id_param;
    
    -- Crear usuario owner (se creará la cuenta de Supabase desde el frontend)
    INSERT INTO users (
        organization_id, email, name, role, phone
    ) VALUES (
        new_org_id, request_record.owner_email, request_record.owner_name, 
        'owner', request_record.owner_phone
    ) RETURNING id INTO new_user_id;
    
    -- Crear configuraciones por defecto
    INSERT INTO organization_settings (organization_id, setting_key, setting_value, setting_type) VALUES
    (new_org_id, 'currency', 'PEN', 'string'),
    (new_org_id, 'tax_rate', '18', 'number'),
    (new_org_id, 'warranty_days', '30', 'number'),
    (new_org_id, 'business_hours', '{"monday": "9:00-18:00", "tuesday": "9:00-18:00", "wednesday": "9:00-18:00", "thursday": "9:00-18:00", "friday": "9:00-18:00", "saturday": "9:00-14:00", "sunday": "closed"}', 'json');
    
    RETURN new_org_id;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener el precio correcto según el tipo de cliente
CREATE OR REPLACE FUNCTION get_customer_price(inventory_id_param UUID, customer_id_param UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    customer_is_recurrent BOOLEAN;
    enduser_price DECIMAL(10,2);
    recurrent_price DECIMAL(10,2);
BEGIN
    -- Obtener información del cliente
    SELECT is_recurrent INTO customer_is_recurrent 
    FROM customers 
    WHERE id = customer_id_param;
    
    -- Obtener precios del inventario
    SELECT i.enduser_price, i.recurrent_price 
    INTO enduser_price, recurrent_price
    FROM inventory i 
    WHERE i.id = inventory_id_param;
    
    -- Retornar precio según tipo de cliente
    IF customer_is_recurrent AND recurrent_price IS NOT NULL THEN
        RETURN recurrent_price;
    ELSE
        RETURN COALESCE(enduser_price, recurrent_price);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Función para marcar cliente como recurrente automáticamente
CREATE OR REPLACE FUNCTION check_recurrent_customer()
RETURNS TRIGGER AS $$
DECLARE
    repair_count INTEGER;
    sale_count INTEGER;
    total_interactions INTEGER;
BEGIN
    -- Contar reparaciones del cliente
    SELECT COUNT(*) INTO repair_count 
    FROM repairs 
    WHERE customer_id = NEW.customer_id;
    
    -- Contar ventas del cliente
    SELECT COUNT(*) INTO sale_count 
    FROM sales 
    WHERE customer_id = NEW.customer_id;
    
    total_interactions := repair_count + sale_count;
    
    -- Si tiene 3 o más interacciones, marcarlo como recurrente
    IF total_interactions >= 3 THEN
        UPDATE customers 
        SET is_recurrent = true, customer_type = 'recurrent'
        WHERE id = NEW.customer_id AND is_recurrent = false;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger para marcar clientes recurrentes
CREATE TRIGGER trigger_check_recurrent_customer_repairs
    AFTER INSERT ON repairs
    FOR EACH ROW EXECUTE FUNCTION check_recurrent_customer();

CREATE TRIGGER trigger_check_recurrent_customer_sales
    AFTER INSERT ON sales
    FOR EACH ROW EXECUTE FUNCTION check_recurrent_customer();

-- ================================
-- DATOS INICIALES
-- ================================

-- Crear usuario super admin inicial (debe ejecutarse solo una vez)
-- Este usuario será creado manualmente en Supabase Auth con email admin@tiendafix.com 

-- Función auxiliar para actualizar estado recurrente de un cliente específico
-- Esta función se puede llamar directamente desde el frontend
CREATE OR REPLACE FUNCTION update_customer_recurrent_status(customer_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
    repair_count INTEGER;
    sale_count INTEGER;
    total_interactions INTEGER;
    was_updated BOOLEAN := false;
BEGIN
    -- Contar reparaciones del cliente
    SELECT COUNT(*) INTO repair_count 
    FROM repairs 
    WHERE customer_id = customer_id_param;
    
    -- Contar ventas del cliente
    SELECT COUNT(*) INTO sale_count 
    FROM sales 
    WHERE customer_id = customer_id_param;
    
    total_interactions := repair_count + sale_count;
    
    -- Si tiene 3 o más interacciones, marcarlo como recurrente
    IF total_interactions >= 3 THEN
        UPDATE customers 
        SET is_recurrent = true, customer_type = 'recurrent'
        WHERE id = customer_id_param AND is_recurrent = false;
        
        GET DIAGNOSTICS was_updated = ROW_COUNT;
        was_updated := was_updated > 0;
    END IF;
    
    RETURN was_updated;
END;
$$ LANGUAGE plpgsql;

-- Función para recalcular el estado recurrente de todos los clientes de una organización
CREATE OR REPLACE FUNCTION recalculate_all_recurrent_customers(org_id UUID DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER := 0;
    customer_record RECORD;
    current_org_id UUID;
BEGIN
    -- Si no se especifica organización, usar la del usuario actual
    IF org_id IS NULL THEN
        SELECT organization_id INTO current_org_id 
        FROM users 
        WHERE auth_user_id = auth.uid();
    ELSE
        current_org_id := org_id;
    END IF;
    
    -- Recorrer todos los clientes de la organización
    FOR customer_record IN 
        SELECT id FROM customers WHERE organization_id = current_org_id
    LOOP
        IF update_customer_recurrent_status(customer_record.id) THEN
            updated_count := updated_count + 1;
        END IF;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql; 