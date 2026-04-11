-- Ejecutar en Supabase SQL Editor
CREATE TABLE truck_location (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Realtime en esta tabla
ALTER TABLE truck_location REPLICA IDENTITY FULL;

-- Insertar fila inicial (solo habrá 1 fila siempre para entorno In-House)
INSERT INTO truck_location (latitude, longitude)
VALUES (-14.0755, -75.7288); -- Ica, Perú como coordenada default

-- Habilitar RLS permisivo (Ojo: Para producción esto debiese revisarse, pero para in-house está bien)
ALTER TABLE truck_location ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON truck_location FOR ALL USING (true);
