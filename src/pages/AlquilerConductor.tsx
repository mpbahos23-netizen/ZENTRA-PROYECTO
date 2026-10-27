import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Loader2, MapPin, Truck, Clock, Gauge, Route, WifiOff, AlertTriangle, CheckCircle2, Crosshair } from "lucide-react";
import CamionMarcador from "@/components/alquiler/CamionMarcador";
import { useRastreoAlquiler } from "@/hooks/useRastreoAlquiler";
import { alquilerPorCodigo, estadoAlquiler, recorridoKm, tiempoRestante, type AlquilerPublico } from "@/lib/alquiler";
import { cn } from "@/lib/utils";

// ============================================
// /camion/:codigo — La app del conductor del camión alquilado.
// Se abre con el enlace que manda el dueño, se instala en el celular,
// pide la ubicación y muestra el camión 3D avanzando por el mapa.
// ============================================

/** Con esto la app instalada vuelve sola a este alquiler (ver InicioOAlquiler). */
export const CLAVE_CODIGO = "zentra-alquiler-codigo";
const CLAVE_ACTIVO = "zentra-alquiler-activo";

type EventoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const guardar = (k: string, v: string | null) => {
  try {
    if (v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, v);
  } catch {
    /* modo privado: no pasa nada */
  }
};
const leer = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};

const esInstalada = () =>
  window.matchMedia?.("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
const esIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent);

function useAhora(cadaMs = 30_000) {
  const [ahora, setAhora] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), cadaMs);
    return () => clearInterval(id);
  }, [cadaMs]);
  return ahora;
}

function BotonCentrar({ lat, lng, alTocar }: { lat: number; lng: number; alTocar: () => void }) {
  const map = useMap();
  return (
    <button
      onClick={() => {
        map.flyTo([lat, lng], 17, { duration: 0.8 });
        alTocar();
      }}
      className="absolute right-4 top-4 z-[1000] w-12 h-12 rounded-2xl bg-black/80 border border-white/10 flex items-center justify-center text-white"
      aria-label="Centrar en el camión"
    >
      <Crosshair className="w-5 h-5" />
    </button>
  );
}

function DejarDeSeguirAlArrastrar({ alArrastrar }: { alArrastrar: () => void }) {
  const map = useMap();
  useEffect(() => {
    map.on("dragstart", alArrastrar);
    return () => {
      map.off("dragstart", alArrastrar);
    };
  }, [map, alArrastrar]);
  return null;
}

export default function AlquilerConductor() {
  const { codigo } = useParams<{ codigo: string }>();
  const [alquiler, setAlquiler] = useState<AlquilerPublico | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(false);
  const [activo, setActivo] = useState(() => !!codigo && leer(CLAVE_ACTIVO) === codigo);
  const [seguir, setSeguir] = useState(true);
  const [instalador, setInstalador] = useState<EventoInstalar | null>(null);
  const [instalada, setInstalada] = useState(esInstalada);
  const ahora = useAhora();

  const { permiso, punto, recorrido, ultimoEnvio, sinConexion, vencido } = useRastreoAlquiler(codigo, activo);

  useEffect(() => {
    if (!codigo) return;
    guardar(CLAVE_CODIGO, codigo);
    alquilerPorCodigo(codigo)
      .then(setAlquiler)
      .catch(() => setErrorCarga(true))
      .finally(() => setCargando(false));
  }, [codigo]);

  useEffect(() => {
    const alPedir = (e: Event) => {
      e.preventDefault();
      setInstalador(e as EventoInstalar);
    };
    const alInstalar = () => setInstalada(true);
    window.addEventListener("beforeinstallprompt", alPedir);
    window.addEventListener("appinstalled", alInstalar);
    return () => {
      window.removeEventListener("beforeinstallprompt", alPedir);
      window.removeEventListener("appinstalled", alInstalar);
    };
  }, []);

  useEffect(() => {
    if (permiso === "denegado") {
      setActivo(false);
      guardar(CLAVE_ACTIVO, null);
    }
  }, [permiso]);

  const estado = alquiler ? (vencido ? "vencido" : estadoAlquiler(alquiler, ahora)) : null;
  const restante = alquiler ? tiempoRestante(alquiler.fin, ahora) : null;
  const km = useMemo(() => recorridoKm(recorrido), [recorrido]);
  const linea = useMemo(() => recorrido.map((p) => [p.lat, p.lng] as [number, number]), [recorrido]);

  const activar = () => {
    setActivo(true);
    if (codigo) guardar(CLAVE_ACTIVO, codigo);
  };

  const instalar = async () => {
    if (!instalador) return;
    await instalador.prompt();
    const { outcome } = await instalador.userChoice;
    if (outcome === "accepted") setInstalada(true);
    setInstalador(null);
  };

  if (cargando) {
    return (
      <Pantalla>
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
      </Pantalla>
    );
  }

  if (errorCarga || !alquiler) {
    return (
      <Pantalla>
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h1 className="text-xl font-black text-white text-center">{errorCarga ? "Sin conexión" : "Enlace no válido"}</h1>
        <p className="text-zinc-400 text-sm text-center mt-2">
          {errorCarga ? "Revisa tu internet y vuelve a abrir el enlace." : "Pide al dueño del camión que te vuelva a mandar el enlace."}
        </p>
      </Pantalla>
    );
  }

  if (estado !== "activo") {
    const textos = {
      pendiente: ["Tu alquiler aún no empieza", `Empieza el ${new Date(alquiler.inicio).toLocaleString("es-PE")}.`],
      vencido: ["Alquiler terminado", "Las 24 horas terminaron. Gracias por usar ZENTRA."],
      cancelado: ["Alquiler cancelado", "El dueño canceló este alquiler."],
    } as const;
    const [titulo, texto] = textos[estado as keyof typeof textos];
    return (
      <Pantalla>
        <Truck className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
        <h1 className="text-xl font-black text-white text-center">{titulo}</h1>
        <p className="text-zinc-400 text-sm text-center mt-2">{texto}</p>
      </Pantalla>
    );
  }

  // Antes de rastrear: instalar la app y activar la ubicación.
  if (!activo || !punto) {
    return (
      <Pantalla>
        <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
          <Truck className="w-9 h-9 text-white" />
        </div>
        <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-blue-400">ZENTRA · Alquiler 24 h</p>
        <h1 className="text-2xl font-black text-white text-center mt-2">Hola, {alquiler.cliente_nombre}</h1>
        <p className="text-zinc-400 text-sm text-center mt-1">
          Camión <span className="text-white font-bold">{alquiler.camion}</span> · quedan {restante?.horas} h {restante?.minutos} min
        </p>

        <div className="mt-8 space-y-3">
          <Paso numero={1} hecho={instalada} titulo="Instala la app" texto="Así la tienes en tu pantalla de inicio durante el alquiler.">
            {!instalada && instalador && (
              <Button onClick={instalar} variant="secondary" className="mt-3 w-full font-bold">
                <Download className="w-4 h-4 mr-2" /> Instalar ZENTRA
              </Button>
            )}
            {!instalada && !instalador && (
              <p className="text-xs text-zinc-500 mt-2">
                {esIOS()
                  ? "En Safari toca «Compartir» y luego «Agregar a inicio»."
                  : "En el menú ⋮ de Chrome toca «Instalar app» o «Agregar a la pantalla principal»."}
              </p>
            )}
          </Paso>

          <Paso numero={2} hecho={permiso === "concedido"} titulo="Activa tu ubicación" texto="El dueño verá el camión en el mapa mientras dure el alquiler.">
            {permiso === "denegado" ? (
              <p className="text-xs text-red-400 mt-2">
                Bloqueaste la ubicación. Actívala en los ajustes del navegador (candado junto a la dirección → Ubicación → Permitir) y vuelve a intentar.
              </p>
            ) : null}
            {permiso === "no_disponible" ? <p className="text-xs text-red-400 mt-2">Este celular no tiene GPS disponible.</p> : null}
            <Button
              onClick={activar}
              disabled={activo && permiso !== "denegado"}
              className="mt-3 w-full h-12 bg-blue-600 hover:bg-blue-500 font-black uppercase tracking-widest text-xs"
            >
              {activo && permiso !== "denegado" ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Buscando señal GPS…</>
              ) : (
                <><MapPin className="w-4 h-4 mr-2" /> Activar ubicación</>
              )}
            </Button>
          </Paso>
        </div>
      </Pantalla>
    );
  }

  const velocidadKmh = punto.velocidad != null ? Math.round(punto.velocidad * 3.6) : null;

  return (
    <div className="fixed inset-0 bg-[#060E20]">
      <MapContainer center={[punto.lat, punto.lng]} zoom={17} zoomControl={false} className="w-full h-full">
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {linea.length > 1 && <Polyline positions={linea} pathOptions={{ color: "#3B82F6", weight: 5, opacity: 0.8 }} />}
        <CamionMarcador posicion={punto} rumbo={punto.rumbo} seguir={seguir} etiqueta={alquiler.camion} />
        <BotonCentrar lat={punto.lat} lng={punto.lng} alTocar={() => setSeguir(true)} />
        <DejarDeSeguirAlArrastrar alArrastrar={() => setSeguir(false)} />
      </MapContainer>

      <div className="absolute top-4 left-4 right-20 z-[1000]">
        <div
          className={cn(
            "inline-flex items-center gap-2 px-3 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border",
            sinConexion ? "bg-amber-500/15 text-amber-300 border-amber-500/30" : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
          )}
        >
          {sinConexion ? <WifiOff className="w-3.5 h-3.5" /> : <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
          {sinConexion ? "Sin señal · reintentando" : "Ubicación compartida"}
        </div>
      </div>

      <Card className="absolute bottom-4 left-4 right-4 z-[1000] bg-black/85 backdrop-blur-xl border-white/10 rounded-3xl p-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <Dato icono={Clock} valor={`${restante?.horas}h ${restante?.minutos}m`} texto="Quedan" />
          <Dato icono={Route} valor={`${km.toFixed(1)} km`} texto="Recorrido" />
          <Dato icono={Gauge} valor={velocidadKmh != null ? `${velocidadKmh} km/h` : "—"} texto="Velocidad" />
        </div>
        <p className="text-[10px] text-zinc-500 text-center mt-3">
          Deja esta pantalla abierta para que el dueño vea el camión.
          {ultimoEnvio ? ` Último envío ${new Date(ultimoEnvio).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}.` : ""}
        </p>
      </Card>
    </div>
  );
}

function Pantalla({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#060E20] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}

function Paso({ numero, hecho, titulo, texto, children }: { numero: number; hecho: boolean; titulo: string; texto: string; children?: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl border p-4", hecho ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/10 bg-white/[0.03]")}>
      <div className="flex items-start gap-3">
        <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0", hecho ? "bg-emerald-500 text-black" : "bg-white/10 text-white")}>
          {hecho ? <CheckCircle2 className="w-4 h-4" /> : numero}
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-sm">{titulo}</p>
          <p className="text-zinc-400 text-xs mt-0.5">{texto}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

function Dato({ icono: Icono, valor, texto }: { icono: React.ElementType; valor: string; texto: string }) {
  return (
    <div>
      <Icono className="w-4 h-4 text-blue-400 mx-auto mb-1" />
      <p className="text-white font-black text-sm">{valor}</p>
      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{texto}</p>
    </div>
  );
}
