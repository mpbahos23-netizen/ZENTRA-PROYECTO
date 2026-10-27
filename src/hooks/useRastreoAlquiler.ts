import { useEffect, useRef, useState } from "react";
import { debeEnviar, registrarPosicion, type PuntoConHora } from "@/lib/alquiler";

// ============================================
// Hook: el celular del conductor del camión alquilado.
// Lee el GPS mientras está activo, manda la posición al dueño y
// mantiene la pantalla encendida (el navegador deja de leer el GPS
// cuando el celular se bloquea).
// ============================================

export type Permiso = "sin_pedir" | "pidiendo" | "concedido" | "denegado" | "no_disponible";

export interface PuntoGPS extends PuntoConHora {
  precision: number;
  velocidad: number | null;
  rumbo: number | null;
}

type WakeLock = { release: () => Promise<void> };

export function useRastreoAlquiler(codigo: string | undefined, activo: boolean) {
  const [permiso, setPermiso] = useState<Permiso>("sin_pedir");
  const [punto, setPunto] = useState<PuntoGPS | null>(null);
  const [recorrido, setRecorrido] = useState<PuntoGPS[]>([]);
  const [ultimoEnvio, setUltimoEnvio] = useState<string | null>(null);
  const [enviados, setEnviados] = useState(0);
  const [sinConexion, setSinConexion] = useState(false);
  const [vencido, setVencido] = useState(false);
  const ultimoEnviado = useRef<PuntoConHora | null>(null);
  const enviando = useRef(false);

  useEffect(() => {
    if (!activo || !codigo) return;
    if (!("geolocation" in navigator)) {
      setPermiso("no_disponible");
      return;
    }
    setPermiso((p) => (p === "concedido" ? p : "pidiendo"));

    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        setPermiso("concedido");
        const nuevo: PuntoGPS = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          at: new Date(pos.timestamp || Date.now()).toISOString(),
          precision: pos.coords.accuracy,
          velocidad: pos.coords.speed,
          rumbo: pos.coords.heading,
        };
        setPunto(nuevo);
        setRecorrido((r) => (r.length && r[r.length - 1].at === nuevo.at ? r : [...r.slice(-2000), nuevo]));

        if (enviando.current || !debeEnviar(ultimoEnviado.current, nuevo)) return;
        enviando.current = true;
        try {
          const aceptado = await registrarPosicion(codigo, pos);
          ultimoEnviado.current = nuevo;
          setSinConexion(false);
          if (aceptado) {
            setEnviados((n) => n + 1);
            setUltimoEnvio(nuevo.at);
          } else {
            setVencido(true);
          }
        } catch {
          setSinConexion(true);
        } finally {
          enviando.current = false;
        }
      },
      (err) => {
        setPermiso(err.code === err.PERMISSION_DENIED ? "denegado" : "concedido");
        if (err.code !== err.PERMISSION_DENIED) setSinConexion(true);
      },
      { enableHighAccuracy: true, maximumAge: 2_000, timeout: 20_000 },
    );

    // Pantalla siempre encendida mientras se rastrea.
    let bloqueo: WakeLock | null = null;
    const pedirPantalla = async () => {
      try {
        const wl = (navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<WakeLock> } }).wakeLock;
        if (wl && document.visibilityState === "visible") bloqueo = await wl.request("screen");
      } catch {
        /* algunos navegadores no lo permiten: se sigue igual */
      }
    };
    pedirPantalla();
    document.addEventListener("visibilitychange", pedirPantalla);

    return () => {
      navigator.geolocation.clearWatch(id);
      document.removeEventListener("visibilitychange", pedirPantalla);
      bloqueo?.release().catch(() => undefined);
    };
  }, [codigo, activo]);

  return { permiso, punto, recorrido, ultimoEnvio, enviados, sinConexion, vencido };
}
