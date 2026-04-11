import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// Usando API Key nativa de Google Maps
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyA1_oNuxXIfykDRQk-7xf6AmFx-00A4ANs";

// Fórmula Haversine — distancia en metros entre 2 coordenadas
function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Carga el script de Google Maps dinámicamente
function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve) => {
    if ((window as any).google?.maps) return resolve();
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry`;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

interface ClientMapTrackerProps {
  destinationLat?: number;
  destinationLng?: number;
}

export default function ClientMapTracker({ destinationLat, destinationLng }: ClientMapTrackerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const alarmPlayedRef = useRef(false);

  const [truckPos, setTruckPos] = useState<{lat: number, lng: number} | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [alarmActive, setAlarmActive] = useState(false);
  const [mapsReady, setMapsReady] = useState(false);

  // Destino por defecto si no se pasa como prop
  const destLat = destinationLat ?? -14.0677;
  const destLng = destinationLng ?? -75.7286;

  // 1. Inicializar Google Maps
  useEffect(() => {
    loadGoogleMaps().then(() => {
      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat: destLat, lng: destLng },
        zoom: 15,
        mapTypeId: "roadmap",
        disableDefaultUI: false,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
          { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
          { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
          { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
          { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
          { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
          { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
          { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
          { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
          { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
          { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
        ]
      });

      // Marcador destino (bandera roja)
      new (window as any).google.maps.Marker({
        position: { lat: destLat, lng: destLng },
        map,
        title: "Destino",
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        },
      });

      // Marcador camión (emoji de camión como SVG)
      const truckMarker = new (window as any).google.maps.Marker({
        position: { lat: destLat, lng: destLng },
        map,
        title: "Camión",
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                <text y="32" font-size="30">🚛</text>
              </svg>
            `),
          scaledSize: new (window as any).google.maps.Size(40, 40),
          anchor: new (window as any).google.maps.Point(20, 20),
        },
      });

      googleMapRef.current = map;
      markerRef.current = truckMarker;
      setMapsReady(true);
    });
  }, [destLat, destLng]);

  // 2. Animar marcador suavemente entre posiciones
  const animateMarker = useCallback((from: {lat: number, lng: number}, to: {lat: number, lng: number}) => {
    if (!markerRef.current || !(window as any).google) return;
    const frames = 30;
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const lat = from.lat + (to.lat - from.lat) * (frame / frames);
      const lng = from.lng + (to.lng - from.lng) * (frame / frames);
      markerRef.current.setPosition({ lat, lng });
      if (frame >= frames) clearInterval(interval);
    }, 50); // 50ms * 30 frames = 1.5s de animación suave
  }, []);

  // 3. Suscribirse a Supabase Realtime
  useEffect(() => {
    if (!mapsReady) return;

    const channel = supabase
      .channel("truck-location-channel")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "truck_location" },
        (payload) => {
          const { latitude, longitude } = payload.new;
          const newPos = { lat: latitude, lng: longitude };

          // Animar desde posición actual
          const currentPos = markerRef.current?.getPosition();
          if (currentPos) {
            animateMarker(
              { lat: currentPos.lat(), lng: currentPos.lng() },
              newPos
            );
          } else {
            markerRef.current?.setPosition(newPos);
          }

          // Centrar mapa en el camión
          googleMapRef.current?.panTo(newPos);
          setTruckPos(newPos);

          // Calcular distancia al destino
          const dist = haversineMeters(latitude, longitude, destLat, destLng);
          setDistance(Math.round(dist));

          // 🚨 Alarma de proximidad a ≤200 metros
          if (dist <= 200 && !alarmPlayedRef.current) {
            alarmPlayedRef.current = true;
            setAlarmActive(true);
            playAlarmSound();
            setTimeout(() => setAlarmActive(false), 8000);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [mapsReady, animateMarker, destLat, destLng]);

  // 4. Sonido de alarma tipo Rappi (Web Audio API, sin archivos externos)
  function playAlarmSound() {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const playBeep = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.8, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + start + duration
        );
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };
      // Secuencia de beeps ascendentes tipo Rappi
      playBeep(880, 0.0, 0.15);
      playBeep(988, 0.2, 0.15);
      playBeep(1109, 0.4, 0.15);
      playBeep(1319, 0.6, 0.3);
      playBeep(1319, 1.0, 0.15);
      playBeep(1319, 1.2, 0.3);
    } catch (e) {
      console.warn("Audio no disponible:", e);
    }
  }

  return (
    <div className={`relative overflow-hidden transition-all duration-300 rounded-3xl mt-6 ${alarmActive ? 'border-4 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 'border border-white/10'}`}>
      {/* Banner de alarma */}
      {alarmActive && (
        <div className="bg-red-500 text-white font-black text-sm uppercase tracking-widest text-center p-3 animate-pulse">
          🚨 ¡EL CAMIÓN ESTÁ A MENOS DE 200 METROS! 🚨
        </div>
      )}

      {/* Indicador de distancia */}
      {distance !== null && (
        <div className={`absolute left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full font-black text-sm uppercase whitespace-nowrap shadow-xl transition-all ${distance <= 200 ? 'top-14 bg-red-600 text-white' : 'top-4 bg-blue-600/90 text-white backdrop-blur-md'}`}>
          {distance <= 200
            ? `🔴 A ${distance}m — ¡Casi llega!`
            : `📍 Camión a ${distance}m del destino`}
        </div>
      )}

      {/* El mapa */}
      <div ref={mapRef} className="w-full h-[400px]" />

      {!mapsReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a] text-zinc-500 font-bold uppercase tracking-widest text-sm">
          📍 Cargando vista satelital...
        </div>
      )}
    </div>
  );
}
