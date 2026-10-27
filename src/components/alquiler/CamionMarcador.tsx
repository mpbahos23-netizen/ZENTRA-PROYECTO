import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { interpolar, rumboEntre, distanciaM, type Punto } from "@/lib/alquiler";

// ============================================
// El camión en 3D sobre el mapa.
// Se arma con cajas CSS (cabina + furgón) inclinadas en perspectiva y
// giradas con el rumbo, como el carrito de Uber. El marcador se crea UNA
// vez y se mueve a mano, deslizándose entre un punto GPS y el siguiente.
// ============================================

/** Una caja con techo y cuatro lados. Medidas en px sobre el piso: x, y (adelante = arriba), ancho, largo, alto. */
function caja(x: number, y: number, w: number, l: number, h: number, c: { techo: string; frente: string; lado: string; atras: string }, extraFrente = "") {
  const base = `left:${x}px;top:${y}px;`;
  return `
    <div style="${base}width:${w}px;height:${l}px;background:${c.techo};transform:translateZ(${h}px);border-radius:2px"></div>
    <div style="${base}width:${w}px;height:${h}px;background:${c.frente};transform-origin:top;transform:translateZ(${h}px) rotateX(-90deg)">${extraFrente}</div>
    <div style="left:${x}px;top:${y + l}px;width:${w}px;height:${h}px;background:${c.atras};transform-origin:top;transform:translateZ(${h}px) rotateX(-90deg)"></div>
    <div style="${base}width:${h}px;height:${l}px;background:${c.lado};transform-origin:left;transform:translateZ(${h}px) rotateY(90deg)"></div>
    <div style="left:${x + w}px;top:${y}px;width:${h}px;height:${l}px;background:${c.lado};transform-origin:left;transform:translateZ(${h}px) rotateY(90deg)"></div>`;
}

function htmlCamion3D(color: string, etiqueta?: string) {
  const cabina = caja(1, 0, 16, 13, 15, {
    techo: `linear-gradient(180deg, ${color}, #1e3a8a)`,
    frente: "#0f172a",
    lado: `linear-gradient(90deg, #1e3a8a, ${color})`,
    atras: "#1e293b",
  }, `<div style="position:absolute;inset:2px 2px 6px;background:linear-gradient(180deg,#93c5fd,#1e40af);border-radius:2px"></div>
      <div style="position:absolute;left:1px;right:1px;bottom:1px;height:3px;display:flex;justify-content:space-between"><i style="width:3px;background:#fde68a"></i><i style="width:3px;background:#fde68a"></i></div>`);
  const furgon = caja(0, 15, 18, 35, 20, {
    techo: "linear-gradient(180deg, #f8fafc, #cbd5e1)",
    frente: "#94a3b8",
    lado: `linear-gradient(180deg, #e2e8f0 0 40%, ${color} 40% 55%, #e2e8f0 55%)`,
    atras: "linear-gradient(90deg, #cbd5e1 0 49%, #64748b 49% 51%, #cbd5e1 51%)",
  });
  return `
    <div class="camion3d">
      <span class="camion3d-pulso"></span>
      <span class="camion3d-sombra"></span>
      <div class="camion3d-escena">${cabina}${furgon}</div>
      ${etiqueta ? `<span class="camion3d-etiqueta">${etiqueta.replace(/[&<>"']/g, "")}</span>` : ""}
    </div>`;
}

interface Props {
  posicion: Punto;
  /** Rumbo del GPS en grados; si no viene, se calcula con el punto anterior. */
  rumbo?: number | null;
  color?: string;
  etiqueta?: string;
  enVivo?: boolean;
  /** El mapa acompaña al camión mientras avanza. */
  seguir?: boolean;
  alTocar?: () => void;
}

const DURACION_MS = 1200;

export default function CamionMarcador({ posicion, rumbo, color = "#3B82F6", etiqueta, enVivo = true, seguir = false, alTocar }: Props) {
  const map = useMap();
  const marcador = useRef<L.Marker | null>(null);
  const actual = useRef<Punto>(posicion);
  const rumboActual = useRef(0);
  const animacion = useRef<number | null>(null);
  const alTocarRef = useRef(alTocar);
  alTocarRef.current = alTocar;

  // Crear el marcador una sola vez.
  useEffect(() => {
    const m = L.marker([posicion.lat, posicion.lng], {
      icon: L.divIcon({ html: htmlCamion3D(color, etiqueta), className: "", iconSize: [64, 64], iconAnchor: [32, 32] }),
      zIndexOffset: 1000,
    }).addTo(map);
    m.on("click", () => alTocarRef.current?.());
    marcador.current = m;
    return () => {
      if (animacion.current) cancelAnimationFrame(animacion.current);
      m.remove();
      marcador.current = null;
    };
    // El ícono se rehace abajo si cambian color o etiqueta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    marcador.current?.setIcon(L.divIcon({ html: htmlCamion3D(color, etiqueta), className: "", iconSize: [64, 64], iconAnchor: [32, 32] }));
    girar(rumboActual.current);
  }, [color, etiqueta]);

  useEffect(() => {
    marcador.current?.getElement()?.querySelector(".camion3d")?.classList.toggle("apagado", !enVivo);
  }, [enVivo, color, etiqueta]);

  function girar(grados: number) {
    rumboActual.current = grados;
    const el = marcador.current?.getElement()?.querySelector<HTMLElement>(".camion3d");
    el?.style.setProperty("--rumbo", `${grados}deg`);
  }

  // Deslizar hasta la posición nueva y girar hacia donde va.
  useEffect(() => {
    const desde = actual.current;
    const hasta = posicion;
    if (rumbo != null && Number.isFinite(rumbo)) girar(rumbo);
    else if (distanciaM(desde, hasta) > 3) girar(rumboEntre(desde, hasta));

    if (animacion.current) cancelAnimationFrame(animacion.current);
    const inicio = performance.now();
    const paso = (ahora: number) => {
      const t = (ahora - inicio) / DURACION_MS;
      const p = interpolar(desde, hasta, t);
      actual.current = p;
      marcador.current?.setLatLng([p.lat, p.lng]);
      if (seguir) map.panTo([p.lat, p.lng], { animate: false });
      if (t < 1) animacion.current = requestAnimationFrame(paso);
    };
    animacion.current = requestAnimationFrame(paso);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posicion.lat, posicion.lng, rumbo]);

  return null;
}
