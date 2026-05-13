-- =================================================================================
-- SICA (Sistema de Inventario y Control de Activos) - Supabase Schema
-- Ejecuta este script en el "SQL Editor" de tu panel de Supabase.
-- =================================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: ÁREAS / UBICACIONES FÍSICAS (Para el Mapa Interactivo)
CREATE TABLE IF NOT EXISTS public.areas (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  map_x_percent numeric, -- Coordenada X del mapa (0-100)
  map_y_percent numeric, -- Coordenada Y del mapa (0-100)
  created_at timestamp with time zone DEFAULT now()
);

-- 3. TABLA: ACTIVOS FÍSICOS (Hardware y Equipos)
CREATE TABLE IF NOT EXISTS public.assets (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  barcode text UNIQUE NOT NULL, -- Código de barras institucional (Ej. UTP-2023-001)
  name text NOT NULL,           -- Ej. Router Cisco 1941
  model text,
  serial_number text,
  status text DEFAULT 'operativo', -- operativo, en_prestamo, dañado, en_reparacion
  area_id uuid REFERENCES public.areas(id),
  created_at timestamp with time zone DEFAULT now()
);

-- 4. TABLA: CONSUMIBLES E INSUMOS
CREATE TABLE IF NOT EXISTS public.consumables (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  qrcode text UNIQUE NOT NULL,  -- Código asignado al estante/lote
  name text NOT NULL,           -- Ej. Pasta Térmica
  unit text NOT NULL,           -- Ej. Tubos, Botellas, Bobinas
  stock_current integer NOT NULL DEFAULT 0,
  stock_minimum integer NOT NULL DEFAULT 5,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. TABLA: MOVIMIENTOS (Salidas, Entradas, Consumo)
CREATE TABLE IF NOT EXISTS public.movements (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_type text NOT NULL,      -- 'asset' o 'consumable'
  item_id uuid NOT NULL,        -- ID del activo o consumible
  operation_type text NOT NULL, -- 'salida', 'devolucion', 'consumo'
  destination_area_id uuid REFERENCES public.areas(id),
  responsible_name text NOT NULL, -- Ej. Roberto Gómez
  quantity integer DEFAULT 1,     -- Siempre 1 para activos, variable para consumibles
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- 6. TABLA: MANTENIMIENTO PREVENTIVO Y TICKETS
CREATE TABLE IF NOT EXISTS public.maintenance_tickets (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  asset_id uuid REFERENCES public.assets(id),
  task_type text NOT NULL,        -- 'preventivo', 'reparacion', 'limpieza'
  scheduled_date timestamp with time zone NOT NULL,
  status text DEFAULT 'pending',  -- 'pending', 'scheduled', 'completed'
  resolution_notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- =================================================================================
-- DATOS DE PRUEBA (MOCKS INICIALES)
-- =================================================================================

INSERT INTO public.areas (name, map_x_percent, map_y_percent) VALUES
('Rack Principal A', 15, 10),
('Rack B (Switches)', 45, 10),
('Mesa de Taller', 75, 60),
('Escritorio Docente', 20, 80);

-- Insertar algunos insumos
INSERT INTO public.consumables (qrcode, name, unit, stock_current, stock_minimum) VALUES
('QR-CON-001', 'Pasta Térmica ArctiC', 'Tubos', 12, 5),
('QR-CON-002', 'Alcohol Isopropílico 1L', 'Botellas', 2, 5),
('QR-CON-003', 'Conectores RJ45', 'Unidades', 15, 50);

-- =================================================================================
-- POLÍTICAS DE SEGURIDAD (RLS - Row Level Security)
-- =================================================================================
-- NOTA: Como la plataforma funcionará internamente por ahora y para acelerar,
-- permitiremos Acceso Público (anon/authenticated). Luego lo restringiremos al Auth.

ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow All on Areas" ON public.areas FOR ALL USING (true);
CREATE POLICY "Allow All on Assets" ON public.assets FOR ALL USING (true);
CREATE POLICY "Allow All on Consumables" ON public.consumables FOR ALL USING (true);
CREATE POLICY "Allow All on Movements" ON public.movements FOR ALL USING (true);
CREATE POLICY "Allow All on Maintenance" ON public.maintenance_tickets FOR ALL USING (true);
