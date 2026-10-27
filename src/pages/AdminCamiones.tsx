import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CamionMarcador from "@/components/alquiler/CamionMarcador";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Loader2, MessageCircle, Plus, Truck, X, Clock, Route } from "lucide-react";
import {
  HORAS_ALQUILER, cancelarAlquiler, crearAlquiler, enlaceConductor, escucharPosiciones, estadoAlquiler, estaEnVivo,
  listarAlquileres, listarPosiciones, recorridoKm, tiempoRestante, ultimasPosiciones,
  type Alquiler, type EstadoAlquiler, type Posicion,
} from "@/lib/alquiler";
import { cn } from "@/lib/utils";

// ============================================
// /admin/camiones — Panel del dueño.
// Crea alquileres de 24 h, comparte el enlace con el conductor y ve
// cada camión moverse en el mapa en tiempo real.
// ============================================

const COLORES = ["#3B82F6", "#F59E0B", "#10B981", "#EF4444", "#A855F7", "#06B6D4"];
const CENTRO_INICIAL: [number, number] = [-12.0464, -77.0428]; // Lima

const ETIQUETA_ESTADO: Record<EstadoAlquiler, { texto: string; clase: string }> = {
  activo: { texto: "Activo", clase: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  pendiente: { texto: "Por empezar", clase: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  vencido: { texto: "Terminado", clase: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30" },
  cancelado: { texto: "Cancelado", clase: "bg-red-500/15 text-red-300 border-red-500/30" },
};

const hace = (iso: string) => {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `hace ${Math.max(s, 1)} s`;
  const m = Math.round(s / 60);
  return m < 60 ? `hace ${m} min` : new Date(iso).toLocaleString("es-PE", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" });
};

const soloDigitos = (t: string) => t.replace(/\D/g, "");
const paraWhatsapp = (t: string) => (soloDigitos(t).length === 9 ? `51${soloDigitos(t)}` : soloDigitos(t));

/** Encuadra los camiones la primera vez que aparecen; después el dueño mueve el mapa a su gusto. */
function Encuadrar({ puntos }: { puntos: [number, number][] }) {
  const map = useMap();
  const hecho = useRef(false);
  useEffect(() => {
    if (hecho.current || !puntos.length) return;
    hecho.current = true;
    if (puntos.length === 1) map.setView(puntos[0], 15);
    else map.fitBounds(puntos, { padding: [60, 60], maxZoom: 16 });
  }, [puntos, map]);
  return null;
}

function IrA({ destino }: { destino: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (destino) map.flyTo(destino, 16, { duration: 0.8 });
  }, [destino, map]);
  return null;
}

export default function AdminCamiones() {
  const queryClient = useQueryClient();
  const [ultimas, setUltimas] = useState<Record<string, Posicion>>({});
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [recorrido, setRecorrido] = useState<Posicion[]>([]);
  const [ahora, setAhora] = useState(() => new Date());
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const { data: alquileres = [], isLoading } = useQuery({ queryKey: ["alquileres"], queryFn: listarAlquileres });

  const activos = useMemo(() => alquileres.filter((a) => estadoAlquiler(a, ahora) === "activo"), [alquileres, ahora]);
  const color = (id: string) => COLORES[Math.max(0, alquileres.findIndex((a) => a.id === id)) % COLORES.length];

  // Reloj para "en vivo" y tiempo restante.
  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);

  // Última posición conocida de cada alquiler + todo lo que llegue en vivo.
  useEffect(() => {
    if (!alquileres.length) return;
    ultimasPosiciones(alquileres.map((a) => a.id)).then(setUltimas).catch(() => toast.error("No se pudieron leer las posiciones"));
  }, [alquileres]);

  useEffect(() => {
    return escucharPosiciones((p) => {
      setUltimas((prev) => ({ ...prev, [p.alquiler_id]: p }));
      setRecorrido((prev) => (prev.length && prev[0].alquiler_id === p.alquiler_id ? [...prev, p] : prev));
    });
  }, []);

  // Recorrido completo del camión elegido.
  useEffect(() => {
    if (!seleccionado) {
      setRecorrido([]);
      return;
    }
    listarPosiciones(seleccionado).then(setRecorrido).catch(() => toast.error("No se pudo leer el recorrido"));
  }, [seleccionado]);

  const enMapa = alquileres.filter((a) => ultimas[a.id] && (estadoAlquiler(a, ahora) === "activo" || a.id === seleccionado));
  const puntosIniciales = enMapa.map((a) => [ultimas[a.id].lat, ultimas[a.id].lng] as [number, number]);
  const linea = recorrido.map((p) => [p.lat, p.lng] as [number, number]);
  const posSeleccionado = seleccionado && ultimas[seleccionado] ? ([ultimas[seleccionado].lat, ultimas[seleccionado].lng] as [number, number]) : null;

  const cancelar = async (a: Alquiler) => {
    if (!confirm(`¿Cancelar el alquiler de ${a.camion} (${a.cliente_nombre})? El celular dejará de enviar su ubicación.`)) return;
    try {
      await cancelarAlquiler(a.id);
      toast.success("Alquiler cancelado");
      queryClient.invalidateQueries({ queryKey: ["alquileres"] });
    } catch {
      toast.error("No se pudo cancelar");
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Camiones en vivo</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {activos.length} {activos.length === 1 ? "alquiler activo" : "alquileres activos"} ·{" "}
              {activos.filter((a) => estaEnVivo(ultimas[a.id]?.at, ahora)).length} transmitiendo ahora
            </p>
          </div>
          <Button onClick={() => setMostrarFormulario((v) => !v)} className="bg-blue-600 hover:bg-blue-500 font-bold">
            {mostrarFormulario ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {mostrarFormulario ? "Cerrar" : "Nuevo alquiler"}
          </Button>
        </div>

        {mostrarFormulario && (
          <FormularioAlquiler
            alCrear={(a) => {
              queryClient.invalidateQueries({ queryKey: ["alquileres"] });
              setSeleccionado(a.id);
            }}
          />
        )}

        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          <Card className="relative overflow-hidden border-white/10 bg-[#060E20] h-[420px] lg:h-[620px] rounded-3xl">
            <MapContainer center={puntosIniciales[0] ?? CENTRO_INICIAL} zoom={12} className="w-full h-full">
              <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <Encuadrar puntos={puntosIniciales} />
              <IrA destino={posSeleccionado} />
              {linea.length > 1 && <Polyline positions={linea} pathOptions={{ color: seleccionado ? color(seleccionado) : "#3B82F6", weight: 5, opacity: 0.85 }} />}
              {enMapa.map((a) => {
                const p = ultimas[a.id];
                return (
                  <CamionMarcador
                    key={a.id}
                    posicion={{ lat: p.lat, lng: p.lng }}
                    rumbo={p.rumbo}
                    color={color(a.id)}
                    etiqueta={a.camion}
                    enVivo={estaEnVivo(p.at, ahora)}
                    alTocar={() => setSeleccionado(a.id)}
                  />
                );
              })}
            </MapContainer>
            {!enMapa.length && !isLoading && (
              <div className="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none">
                <p className="bg-black/80 text-zinc-300 text-sm px-4 py-3 rounded-2xl border border-white/10 max-w-xs text-center">
                  Ningún camión está enviando su ubicación todavía. Crea un alquiler y manda el enlace al conductor.
                </p>
              </div>
            )}
          </Card>

          <div className="space-y-3 lg:max-h-[620px] lg:overflow-y-auto pr-1">
            {isLoading && <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto mt-10" />}
            {!isLoading && !alquileres.length && <p className="text-sm text-zinc-500 text-center mt-10">Aún no hay alquileres.</p>}
            {alquileres.map((a) => {
              const estado = estadoAlquiler(a, ahora);
              const p = ultimas[a.id];
              const vivo = estaEnVivo(p?.at, ahora);
              const restante = tiempoRestante(a.fin, ahora);
              const elegido = seleccionado === a.id;
              return (
                <Card
                  key={a.id}
                  onClick={() => setSeleccionado(elegido ? null : a.id)}
                  className={cn(
                    "p-4 rounded-2xl cursor-pointer border transition-colors bg-white/[0.03]",
                    elegido ? "border-blue-500/60 bg-blue-500/[0.06]" : "border-white/10 hover:border-white/20",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color(a.id)}22` }}>
                      <Truck className="w-5 h-5" style={{ color: color(a.id) }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-bold truncate">{a.camion}</p>
                        <Badge variant="outline" className={cn("text-[10px]", ETIQUETA_ESTADO[estado].clase)}>
                          {ETIQUETA_ESTADO[estado].texto}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-400 truncate">{a.cliente_nombre}{a.cliente_telefono ? ` · ${a.cliente_telefono}` : ""}</p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-500">
                        {estado === "activo" && (
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {restante.horas}h {restante.minutos}m</span>
                        )}
                        {p ? (
                          <span className={cn("flex items-center gap-1", vivo ? "text-emerald-400" : "text-zinc-500")}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", vivo ? "bg-emerald-400 animate-pulse" : "bg-zinc-600")} />
                            {vivo ? "En vivo" : `Visto ${hace(p.at)}`}
                          </span>
                        ) : (
                          estado === "activo" && <span className="text-amber-400">Sin ubicación aún</span>
                        )}
                        {elegido && recorrido.length > 1 && (
                          <span className="flex items-center gap-1"><Route className="w-3 h-3" /> {recorridoKm(recorrido).toFixed(1)} km</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {elegido && (estado === "activo" || estado === "pendiente") && (
                    <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                      <CompartirEnlace alquiler={a} />
                      <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => cancelar(a)}>
                        Cancelar
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function CompartirEnlace({ alquiler }: { alquiler: Alquiler }) {
  const enlace = enlaceConductor(alquiler.codigo);
  const mensaje = `Hola ${alquiler.cliente_nombre}, este es el enlace de tu alquiler del camión ${alquiler.camion} (24 h). Ábrelo en tu celular, instala la app y activa tu ubicación: ${enlace}`;
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(enlace);
      toast.success("Enlace copiado");
    } catch {
      toast.info(enlace);
    }
  };
  return (
    <>
      <Button size="sm" variant="secondary" onClick={copiar} className="font-bold">
        <Copy className="w-3.5 h-3.5 mr-1.5" /> Copiar enlace
      </Button>
      {alquiler.cliente_telefono && (
        <Button size="sm" asChild className="bg-emerald-600 hover:bg-emerald-500 font-bold">
          <a href={`https://wa.me/${paraWhatsapp(alquiler.cliente_telefono)}?text=${encodeURIComponent(mensaje)}`} target="_blank" rel="noreferrer">
            <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> WhatsApp
          </a>
        </Button>
      )}
    </>
  );
}

function FormularioAlquiler({ alCrear }: { alCrear: (a: Alquiler) => void }) {
  const [camion, setCamion] = useState("");
  const [cliente, setCliente] = useState("");
  const [telefono, setTelefono] = useState("");
  const [horas, setHoras] = useState(String(HORAS_ALQUILER));
  const [guardando, setGuardando] = useState(false);
  const [creado, setCreado] = useState<Alquiler | null>(null);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!camion.trim() || !cliente.trim()) return;
    setGuardando(true);
    try {
      const a = await crearAlquiler({
        camion: camion.trim(),
        cliente_nombre: cliente.trim(),
        cliente_telefono: telefono.trim(),
        horas: Math.min(168, Math.max(1, Number(horas) || HORAS_ALQUILER)),
      });
      setCreado(a);
      alCrear(a);
      toast.success("Alquiler creado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo crear el alquiler");
    } finally {
      setGuardando(false);
    }
  };

  if (creado) {
    return (
      <Card className="p-5 rounded-3xl border-emerald-500/30 bg-emerald-500/5">
        <p className="text-white font-bold">Listo: {creado.camion} para {creado.cliente_nombre}</p>
        <p className="text-xs text-zinc-400 mt-1">Manda este enlace al conductor. Al abrirlo instala la app y activa su ubicación.</p>
        <p className="mt-3 font-mono text-sm text-blue-300 break-all bg-black/40 rounded-xl px-3 py-2">{enlaceConductor(creado.codigo)}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <CompartirEnlace alquiler={creado} />
          <Button size="sm" variant="ghost" onClick={() => { setCreado(null); setCamion(""); setCliente(""); setTelefono(""); }}>
            Crear otro
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 rounded-3xl border-white/10 bg-white/[0.03]">
      <form onSubmit={enviar} className="grid sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_110px_auto] gap-4 items-end">
        <div className="space-y-1.5">
          <Label htmlFor="camion">Camión (placa o nombre)</Label>
          <Input id="camion" value={camion} onChange={(e) => setCamion(e.target.value)} placeholder="ABC-123" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cliente">Quién lo alquila</Label>
          <Input id="cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Nombre" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="telefono">Celular (opcional)</Label>
          <Input id="telefono" type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="987654321" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="horas">Horas</Label>
          <Input id="horas" type="number" min={1} max={168} value={horas} onChange={(e) => setHoras(e.target.value)} />
        </div>
        <Button type="submit" disabled={guardando} className="bg-blue-600 hover:bg-blue-500 font-bold">
          {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear y obtener enlace"}
        </Button>
      </form>
    </Card>
  );
}
