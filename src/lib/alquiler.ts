import { supabase } from "@/lib/supabase";

// ============================================
// Alquiler de camión por 24 h (supabase_alquiler_camion.sql)
// Cuentas puras (se prueban sin red) + consultas a Supabase.
// ============================================

export interface Punto {
  lat: number;
  lng: number;
}

export interface PuntoConHora extends Punto {
  at: string;
}

export interface Alquiler {
  id: string;
  codigo: string;
  camion: string;
  cliente_nombre: string;
  cliente_telefono: string | null;
  inicio: string;
  fin: string;
  cancelado: boolean;
  created_at: string;
}

export interface AlquilerPublico {
  camion: string;
  cliente_nombre: string;
  inicio: string;
  fin: string;
  cancelado: boolean;
}

export interface Posicion extends PuntoConHora {
  id: number;
  alquiler_id: string;
  precision_m: number | null;
  velocidad: number | null;
  rumbo: number | null;
}

export type EstadoAlquiler = "pendiente" | "activo" | "vencido" | "cancelado";

/** Horas que dura un alquiler si no se dice otra cosa. */
export const HORAS_ALQUILER = 24;

/** Cada cuánto se manda un punto: no antes de MIN_MS (si se movió MIN_M) ni más tarde que MAX_MS. */
export const ENVIO = { MIN_MS: 5_000, MAX_MS: 30_000, MIN_M: 15 };

/** Una posición sin noticias en este tiempo ya no es "en vivo". */
export const VIVO_MS = 90_000;

/** Metros entre dos puntos (haversine). */
export function distanciaM(a: Punto, b: Punto): number {
  const R = 6_371_000;
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Kilómetros recorridos sumando los tramos. */
export function recorridoKm(puntos: Punto[]): number {
  let m = 0;
  for (let i = 1; i < puntos.length; i += 1) m += distanciaM(puntos[i - 1], puntos[i]);
  return m / 1000;
}

/** ¿Vale la pena mandar este punto? Sí si se movió y pasó el mínimo, o si pasó el máximo aunque esté quieto. */
export function debeEnviar(ultimo: PuntoConHora | null, nuevo: PuntoConHora): boolean {
  if (!ultimo) return true;
  const dt = new Date(nuevo.at).getTime() - new Date(ultimo.at).getTime();
  if (dt >= ENVIO.MAX_MS) return true;
  return dt >= ENVIO.MIN_MS && distanciaM(ultimo, nuevo) >= ENVIO.MIN_M;
}

/** Rumbo en grados (0 = norte, 90 = este) para ir de a hacia b. */
export function rumboEntre(a: Punto, b: Punto): number {
  const rad = (g: number) => (g * Math.PI) / 180;
  const y = Math.sin(rad(b.lng - a.lng)) * Math.cos(rad(b.lat));
  const x = Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) - Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lng - a.lng));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Punto intermedio entre a y b (t de 0 a 1), para que el camión avance suave. */
export function interpolar(a: Punto, b: Punto, t: number): Punto {
  const k = Math.min(1, Math.max(0, t));
  return { lat: a.lat + (b.lat - a.lat) * k, lng: a.lng + (b.lng - a.lng) * k };
}

/** Horas y minutos que faltan para que termine el alquiler. */
export function tiempoRestante(fin: string, ahora: Date = new Date()) {
  const ms = new Date(fin).getTime() - ahora.getTime();
  if (ms <= 0) return { horas: 0, minutos: 0, vencido: true };
  const totalMin = Math.floor(ms / 60_000);
  return { horas: Math.floor(totalMin / 60), minutos: totalMin % 60, vencido: false };
}

export function estadoAlquiler(a: Pick<Alquiler, "inicio" | "fin" | "cancelado">, ahora: Date = new Date()): EstadoAlquiler {
  if (a.cancelado) return "cancelado";
  const t = ahora.getTime();
  if (t < new Date(a.inicio).getTime()) return "pendiente";
  if (t > new Date(a.fin).getTime()) return "vencido";
  return "activo";
}

export function estaEnVivo(at: string | null | undefined, ahora: Date = new Date()): boolean {
  if (!at) return false;
  return ahora.getTime() - new Date(at).getTime() < VIVO_MS;
}

/** Enlace que se le comparte al conductor. */
export function enlaceConductor(codigo: string, origen: string = window.location.origin): string {
  return `${origen}/camion/${codigo}`;
}

// ── Consultas ─────────────────────────────────────────

export async function alquilerPorCodigo(codigo: string): Promise<AlquilerPublico | null> {
  const { data, error } = await supabase.rpc("alquiler_por_codigo", { p_codigo: codigo });
  if (error) throw error;
  return (data as AlquilerPublico[] | null)?.[0] ?? null;
}

export async function registrarPosicion(codigo: string, pos: GeolocationPosition): Promise<boolean> {
  const { data, error } = await supabase.rpc("registrar_posicion", {
    p_codigo: codigo,
    p_lat: pos.coords.latitude,
    p_lng: pos.coords.longitude,
    p_precision: pos.coords.accuracy,
    p_velocidad: pos.coords.speed,
    p_rumbo: pos.coords.heading,
  });
  if (error) throw error;
  return data === true;
}

export async function listarAlquileres(): Promise<Alquiler[]> {
  const { data, error } = await supabase
    .from("alquileres")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as Alquiler[];
}

export async function crearAlquiler(datos: { camion: string; cliente_nombre: string; cliente_telefono?: string; horas?: number }): Promise<Alquiler> {
  const inicio = new Date();
  const fin = new Date(inicio.getTime() + (datos.horas ?? HORAS_ALQUILER) * 3_600_000);
  const { data, error } = await supabase
    .from("alquileres")
    .insert({
      camion: datos.camion,
      cliente_nombre: datos.cliente_nombre,
      cliente_telefono: datos.cliente_telefono || null,
      inicio: inicio.toISOString(),
      fin: fin.toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data as Alquiler;
}

export async function cancelarAlquiler(id: string): Promise<void> {
  const { error } = await supabase.from("alquileres").update({ cancelado: true }).eq("id", id);
  if (error) throw error;
}

/** Recorrido de un alquiler, del más viejo al más nuevo. */
export async function listarPosiciones(alquilerId: string): Promise<Posicion[]> {
  const { data, error } = await supabase
    .from("alquiler_posiciones")
    .select("*")
    .eq("alquiler_id", alquilerId)
    .order("at", { ascending: true })
    .limit(5000);
  if (error) throw error;
  return (data ?? []) as Posicion[];
}

/** Última posición de cada alquiler de la lista. */
export async function ultimasPosiciones(alquilerIds: string[]): Promise<Record<string, Posicion>> {
  if (!alquilerIds.length) return {};
  const desde = new Date(Date.now() - (HORAS_ALQUILER + 1) * 3_600_000).toISOString();
  const { data, error } = await supabase
    .from("alquiler_posiciones")
    .select("*")
    .in("alquiler_id", alquilerIds)
    .gte("at", desde)
    .order("at", { ascending: false })
    .limit(1000);
  if (error) throw error;
  const ultimas: Record<string, Posicion> = {};
  for (const p of (data ?? []) as Posicion[]) {
    if (!ultimas[p.alquiler_id]) ultimas[p.alquiler_id] = p;
  }
  return ultimas;
}

/** Escucha cada punto nuevo que llega (cualquier alquiler). Devuelve cómo dejar de escuchar. */
export function escucharPosiciones(alLlegar: (p: Posicion) => void): () => void {
  const canal = supabase
    .channel("alquiler-posiciones-en-vivo")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "alquiler_posiciones" }, (payload) => {
      alLlegar(payload.new as Posicion);
    })
    .subscribe();
  return () => {
    supabase.removeChannel(canal);
  };
}
