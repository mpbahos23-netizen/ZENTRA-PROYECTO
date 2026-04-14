import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,       // Captura tokens de recovery/magic links en la URL
    storageKey: 'zentra-v2-token', // Cambiado de 'zentra-auth-token' para forzar sesión limpia
    flowType: 'implicit',           // Necesario para recovery links en SPA
  },
});

// Helper: URL base de producción para redirects
export const SITE_URL =
  import.meta.env.VITE_SITE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'https://zentra-proyecto.vercel.app');
