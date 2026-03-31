import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Navigation, 
  Clock, 
  MapPin, 
  Zap, 
  AlertTriangle,
  CheckCircle2,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ETAValidator() {
  const [distance, setDistance] = useState('240'); // km
  const [speed, setSpeed] = useState('65'); // km/h
  const [trafficLevel, setTrafficLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<{
    hours: number;
    minutes: number;
    status: 'on_time' | 'delayed' | 'optimal';
    message: string;
  } | null>(null);

  const calculateETA = () => {
    setCalculating(true);
    
    // ZENTRA LOGISTICS LOGIC: Pure Efficiency
    setTimeout(() => {
      const baseTime = parseFloat(distance) / parseFloat(speed);
      const trafficMultiplier = trafficLevel === 'high' ? 1.4 : trafficLevel === 'medium' ? 1.15 : 1.0;
      const finalTime = baseTime * trafficMultiplier;
      
      const hours = Math.floor(finalTime);
      const minutes = Math.round((finalTime - hours) * 60);
      
      let status: 'on_time' | 'delayed' | 'optimal' = 'on_time';
      let message = "Arribo estimado dentro del margen operativo.";
      
      if (trafficLevel === 'high') {
        status = 'delayed';
        message = "Alerta: Tráfico denso detectado. Sugerimos ruta alterna vía Z-Transit.";
      } else if (trafficLevel === 'low' && parseFloat(speed) > 70) {
        status = 'optimal';
        message = "Rendimiento Óptimo: Flujo de aire y velocidad sincronizados.";
      }

      setResult({ hours, minutes, status, message });
      setCalculating(false);
      toast.success("Cálculo de Transito Zentra Finalizado");
    }, 1200);
  };

  return (
    <Card className="bg-[#060E20]/60 border-white/5 p-8 rounded-[40px] backdrop-blur-xl shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6">
        <Activity className="w-5 h-5 text-blue-500/30 group-hover:text-blue-500 transition-colors" />
      </div>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-500" /> validador de tránsito
          </h2>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">Sincronización de Flota en Tiempo Real</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1">Distancia (KM)</label>
            <Input 
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="bg-black/40 border-white/5 rounded-2xl h-12 text-white font-black italic focus:ring-blue-500/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1">Velocidad Promedio</label>
            <Input 
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
              className="bg-black/40 border-white/5 rounded-2xl h-12 text-white font-black italic focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1">Estado del Corredor Vial</p>
          <div className="flex gap-2">
            {['low', 'medium', 'high'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setTrafficLevel(lvl as any)}
                className={cn(
                  "flex-1 py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest transition-all border",
                  trafficLevel === lvl 
                    ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]" 
                    : "bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10"
                )}
              >
                {lvl === 'low' ? 'Fluido' : lvl === 'medium' ? 'Normal' : 'Pesado'}
              </button>
            ))}
          </div>
        </div>

        {!result ? (
          <Button 
            onClick={calculateETA}
            disabled={calculating}
            className="w-full h-14 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-xl"
          >
            {calculating ? "Procesando..." : "Calcular ETA Zentra"}
          </Button>
        ) : (
          <div className="animate-in slide-in-from-bottom-2 duration-500">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Arribo Estimado</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white italic">{result.hours}h</span>
                    <span className="text-2xl font-black text-blue-500 italic">{result.minutes}m</span>
                  </div>
                </div>
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center border",
                  result.status === 'delayed' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                  result.status === 'optimal' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                  "bg-blue-500/10 border-blue-500/20 text-blue-400"
                )}>
                  {result.status === 'delayed' ? <AlertTriangle className="w-6 h-6" /> :
                   result.status === 'optimal' ? <Zap className="w-6 h-6" /> :
                   <Clock className="w-6 h-6" />}
                </div>
              </div>
              
              <p className="text-[10px] font-bold text-zinc-400 leading-relaxed border-t border-white/5 pt-4">
                {result.message}
              </p>

              <Button 
                variant="ghost" 
                onClick={() => setResult(null)}
                className="w-full h-10 text-[8px] font-black text-zinc-600 hover:text-white uppercase tracking-widest"
              >
                Recalcular
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
