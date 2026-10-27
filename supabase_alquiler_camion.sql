-- =========================================================
-- ZENTRA — Alquiler de camión por 24 horas con rastreo en vivo
-- =========================================================
-- El dueño (admin) crea un alquiler y comparte un enlace con su código.
-- El celular del conductor abre ese enlace (sin cuenta), activa la
-- ubicación y manda su posición por la función registrar_posicion().
-- Solo los admin leen alquileres y posiciones; el conductor solo puede
-- escribir posiciones mientras su alquiler esté vigente.

-- 1. ALQUILERES
CREATE TABLE IF NOT EXISTS public.alquileres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo TEXT NOT NULL UNIQUE DEFAULT lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
    camion TEXT NOT NULL,
    cliente_nombre TEXT NOT NULL,
    cliente_telefono TEXT,
    inicio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fin TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours',
    cancelado BOOLEAN NOT NULL DEFAULT FALSE,
    creado_por UUID REFERENCES public.profiles(id) DEFAULT auth.uid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (fin > inicio)
);

-- 2. POSICIONES (una fila por punto GPS enviado)
CREATE TABLE IF NOT EXISTS public.alquiler_posiciones (
    id BIGSERIAL PRIMARY KEY,
    alquiler_id UUID NOT NULL REFERENCES public.alquileres(id) ON DELETE CASCADE,
    lat FLOAT8 NOT NULL CHECK (lat BETWEEN -90 AND 90),
    lng FLOAT8 NOT NULL CHECK (lng BETWEEN -180 AND 180),
    precision_m FLOAT8,
    velocidad FLOAT8,          -- m/s, como la da el GPS
    rumbo FLOAT8,              -- grados desde el norte
    at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS alquiler_posiciones_alquiler_at
    ON public.alquiler_posiciones (alquiler_id, at DESC);

-- 3. SEGURIDAD
CREATE OR REPLACE FUNCTION public.es_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$;

ALTER TABLE public.alquileres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alquiler_posiciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin gestiona alquileres" ON public.alquileres;
CREATE POLICY "Admin gestiona alquileres" ON public.alquileres
    FOR ALL USING (public.es_admin()) WITH CHECK (public.es_admin());

DROP POLICY IF EXISTS "Admin ve posiciones" ON public.alquiler_posiciones;
CREATE POLICY "Admin ve posiciones" ON public.alquiler_posiciones
    FOR SELECT USING (public.es_admin());

-- 4. LO QUE PUEDE HACER EL CELULAR DEL CONDUCTOR (solo con el código)

-- Datos mínimos del alquiler para su pantalla.
CREATE OR REPLACE FUNCTION public.alquiler_por_codigo(p_codigo TEXT)
RETURNS TABLE (camion TEXT, cliente_nombre TEXT, inicio TIMESTAMPTZ, fin TIMESTAMPTZ, cancelado BOOLEAN)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT a.camion, a.cliente_nombre, a.inicio, a.fin, a.cancelado
    FROM alquileres a WHERE a.codigo = p_codigo;
$$;

-- Guarda un punto solo si el alquiler está vigente; ignora ráfagas (< 3 s).
CREATE OR REPLACE FUNCTION public.registrar_posicion(
    p_codigo TEXT, p_lat FLOAT8, p_lng FLOAT8,
    p_precision FLOAT8 DEFAULT NULL, p_velocidad FLOAT8 DEFAULT NULL, p_rumbo FLOAT8 DEFAULT NULL
)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_id UUID;
BEGIN
    SELECT id INTO v_id FROM alquileres
    WHERE codigo = p_codigo AND NOT cancelado AND NOW() BETWEEN inicio AND fin;
    IF v_id IS NULL THEN
        RETURN FALSE;
    END IF;

    IF EXISTS (SELECT 1 FROM alquiler_posiciones
               WHERE alquiler_id = v_id AND at > NOW() - INTERVAL '3 seconds') THEN
        RETURN TRUE;
    END IF;

    INSERT INTO alquiler_posiciones (alquiler_id, lat, lng, precision_m, velocidad, rumbo)
    VALUES (v_id, p_lat, p_lng, p_precision, p_velocidad, p_rumbo);
    RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.alquiler_por_codigo(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.registrar_posicion(TEXT, FLOAT8, FLOAT8, FLOAT8, FLOAT8, FLOAT8) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.alquiler_por_codigo(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.registrar_posicion(TEXT, FLOAT8, FLOAT8, FLOAT8, FLOAT8, FLOAT8) TO anon, authenticated;

-- 5. TIEMPO REAL para el panel del dueño
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.alquiler_posiciones;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
