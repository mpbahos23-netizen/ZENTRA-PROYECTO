-- =========================================================
-- ZENTRA LOGISTICS OS - SCHEMA REPLICATION (V2)
-- FROM: zlvdrafdptwwozfusrsm
-- TO: zxybhfpzopjcyjemifob (mpbahos23-netizen)
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (RELACIÓN CON AUTH.USERS)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT DEFAULT 'client' CHECK (role IN ('carrier', 'client', 'admin')),
    rating NUMERIC DEFAULT 5.0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SHIPMENTS (EL CORAZÓN DE ZENTRA)
CREATE TABLE IF NOT EXISTS public.shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.profiles(id),
    carrier_id UUID REFERENCES public.profiles(id),
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    distance NUMERIC,
    weight NUMERIC NOT NULL,
    cargo_type TEXT NOT NULL,
    is_express BOOLEAN DEFAULT FALSE,
    has_insurance BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'searching', 'accepted', 'in_transit', 'delivered', 'cancelled')),
    price NUMERIC NOT NULL,
    eta TIMESTAMPTZ,
    estimated_arrival_time TIMESTAMPTZ,
    cargo_photo_url TEXT,
    load_optimization_data JSONB DEFAULT '{}'::jsonb,
    delivery_pin TEXT,
    is_shared BOOLEAN DEFAULT FALSE,
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. VEHICLES & DRIVERS (FLOTA)
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plate TEXT UNIQUE NOT NULL,
    model TEXT,
    status TEXT DEFAULT 'available' CHECK (status IN ('active', 'maintenance', 'available')),
    carrier_id UUID REFERENCES public.profiles(id),
    fuel_level NUMERIC DEFAULT 100,
    last_mileage NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    license TEXT,
    status TEXT DEFAULT 'available' CHECK (status IN ('active', 'resting', 'available')),
    vehicle_id UUID REFERENCES public.vehicles(id),
    carrier_id UUID REFERENCES public.profiles(id),
    phone TEXT,
    rating NUMERIC DEFAULT 5.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LOGÍSTICA & OPERACIONES
CREATE TABLE IF NOT EXISTS public.job_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES public.shipments(id),
    carrier_id UUID REFERENCES public.profiles(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 seconds'),
    responded_at TIMESTAMPTZ,
    bid_amount NUMERIC,
    bid_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.location_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES public.shipments(id),
    carrier_id UUID NOT NULL REFERENCES public.profiles(id),
    lat FLOAT8 NOT NULL,
    lng FLOAT8 NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES public.shipments(id),
    carrier_id UUID REFERENCES public.profiles(id),
    name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    direction TEXT CHECK (direction IN ('in', 'out')),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FINANZAS & PAGOS
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES public.shipments(id),
    amount NUMERIC NOT NULL,
    commission NUMERIC NOT NULL,
    net_amount NUMERIC NOT NULL,
    provider TEXT DEFAULT 'stripe' CHECK (provider IN ('stripe', 'mercadopago')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'held', 'released', 'refunded', 'failed')),
    stripe_payment_intent_id TEXT,
    mercadopago_preference_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. NOTIFICACIONES & REVIEWS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    type TEXT NOT NULL CHECK (type IN ('job_assigned', 'carrier_en_route', 'arrived_origin', 'cargo_picked_up', 'in_transit', 'delivered', 'payment_processed', 'rating_received', 'system')),
    title TEXT NOT NULL,
    body TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES public.shipments(id),
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
    reviewed_id UUID NOT NULL REFERENCES public.profiles(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.demand_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zona TEXT NOT NULL,
    hora INTEGER CHECK (hora >= 0 AND hora <= 23),
    dia_semana INTEGER CHECK (dia_semana >= 0 AND dia_semana <= 6),
    num_requests INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carrier_id UUID REFERENCES public.profiles(id),
    status TEXT DEFAULT 'pending',
    stops JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- SEGURIDAD RLS (COPIADA DE PROYECTO ORIGINAL)
-- =========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demand_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE PERFILES
CREATE POLICY "Profiles view universal" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- POLÍTICAS DE ENVÍOS
CREATE POLICY "Shipments client view" ON public.shipments FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Shipments carrier view" ON public.shipments FOR SELECT USING (
    (auth.uid() = carrier_id) OR (status = 'pending')
);
CREATE POLICY "Shipments admin view" ON public.shipments FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Shipments insert client" ON public.shipments FOR INSERT WITH CHECK (auth.uid() = client_id);

-- PAGOS Y NOTIFICACIONES
CREATE POLICY "Payments view own" ON public.payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM shipments s WHERE s.id = payments.shipment_id AND (s.client_id = auth.uid() OR s.carrier_id = auth.uid()))
);
CREATE POLICY "Notifications view own" ON public.notifications FOR SELECT USING (user_id = auth.uid());

-- ROLDES DE ADMIN ACCESO TOTAL
CREATE POLICY "Admin full access profiles" ON public.profiles FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin full access shipments" ON public.shipments FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =========================================================
-- FIN DEL SCRIPT. COPIA Y PEGA EN EL SQL EDITOR.
-- =========================================================
