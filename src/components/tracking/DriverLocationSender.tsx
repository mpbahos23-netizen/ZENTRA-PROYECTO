import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DriverLocationSender() {
  const [status, setStatus] = useState<"inactivo" | "enviando">("inactivo");
  const [coords, setCoords] = useState<{latitude: number, longitude: number} | null>(null);
  const watchRef = useRef<number | null>(null);

  const startSending = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta GPS");
      return;
    }

    setStatus("enviando");

    watchRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });

        // Actualiza la única fila existente en Supabase ("in-house" approach)
        // Eliminamos el eq id ya que solo queremos actualizar algo 
        // Si no funciona actualizar sin where, mejor filtramos todos los id no nulos.
        const { error } = await supabase
          .from("truck_location")
          .update({
            latitude,
            longitude,
            updated_at: new Date().toISOString(),
          })
          .neq("id", "00000000-0000-0000-0000-000000000000"); // actualiza la fila q existe

        if (error) console.error("Error GPS al actualizar en supabase:", error);
      },
      (err) => console.error("GPS error:", err),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );
  };

  const stopSending = () => {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    setStatus("inactivo");
  };

  useEffect(() => {
    return () => stopSending();
  }, []);

  return (
    <div className="bg-[#050505] p-6 max-w-[400px] mx-auto font-inter border border-white/10 rounded-[32px] mt-10 shadow-2xl">
      <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-6 flex items-center justify-center gap-2">
        🚛 ZENTRA <span className="text-emerald-500">Conductor</span>
      </h2>

      <div className="flex justify-center mb-6">
        <div className={`px-4 py-2 rounded-full font-black uppercase tracking-widest text-[10px] ${status === "enviando" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-white/10 text-zinc-400"}`}>
          {status === "enviando" ? "📡 Transmitiendo GPS" : "⏸️ GPS Inactivo"}
        </div>
      </div>

      {coords && (
        <div className="bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl mb-6 text-center space-y-2">
          <p className="text-xs font-bold text-zinc-300 font-mono">📍 Lat: <span className="text-blue-400">{coords.latitude.toFixed(6)}</span></p>
          <p className="text-xs font-bold text-zinc-300 font-mono">📍 Lng: <span className="text-blue-400">{coords.longitude.toFixed(6)}</span></p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={startSending}
          disabled={status === "enviando"}
          className="flex-1 py-4 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-[0_10px_20px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95"
        >
          ▶ Iniciar
        </button>
        <button
          onClick={stopSending}
          disabled={status === "inactivo"}
          className="flex-1 py-4 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-red-600 hover:bg-red-500 text-white shadow-[0_10px_20px_rgba(220,38,38,0.3)] hover:scale-105 active:scale-95"
        >
          ⏹ Detener
        </button>
      </div>
    </div>
  );
}
