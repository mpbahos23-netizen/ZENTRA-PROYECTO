import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Calculator, 
  ArrowRight, 
  Truck, 
  MapPin, 
  ChevronLeft, 
  Zap, 
  Cylinder, 
  Box, 
  PackageCheck,
  Navigation,
  Sparkles
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

// ============================================
// ZENTRA OBSIDIAN: Smart Quote Calculator
// Ultra-Minimalist Quoting Terminal
// ============================================

const vehicles = [
  { id: 'light', label: 'Van Ligera', sub: 'Hasta 500kg', icon: Zap, multiplier: 1 },
  { id: 'medium', label: 'Camión Mediano', sub: 'Hasta 2t', icon: Truck, multiplier: 1.5 },
  { id: 'heavy', label: 'Carga Pesada', sub: 'Hasta 10t', icon: Cylinder, multiplier: 2.5 },
  { id: 'special', label: 'Especializado', sub: 'Carga Frágil', icon: PackageCheck, multiplier: 3 },
];

const QuoteCalculator = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicleId, setVehicleId] = useState("light");
  const [weight, setWeight] = useState("100");
  
  // Internal logic for mockup price
  const calculatePrice = () => {
    const dist = (origin.length + destination.length) * 15;
    const vehicleMult = vehicles.find(v => v.id === vehicleId)?.multiplier || 1;
    const base = 50000;
    return (base + (dist * 1000 * vehicleMult) + (parseInt(weight) * 50));
  };

  const totalPrice = calculatePrice();

  return (
    <DashboardLayout role="client">
      <div className="max-w-md mx-auto space-y-10 pb-32 animate-in fade-in duration-700 font-inter">
        
        {/* HEADER: Minimalist Title */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/client')}
            className="w-10 h-10 rounded-full bg-white/5 p-0 hover:bg-white/10"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </Button>
          <div className="text-center">
            <h1 className="text-white font-black text-xs uppercase tracking-[0.3em]">Cotización Inteligente</h1>
            <div className="flex justify-center gap-1 mt-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className={cn(
                  "h-0.5 rounded-full transition-all duration-300",
                  step === s ? "w-6 bg-blue-500" : "w-2 bg-zinc-800"
                )} />
              ))}
            </div>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* STEP 1: VEHICLE SELECTION */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-5">
            <div className="space-y-1">
               <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Selecciona tu <span className="text-blue-500">Unidad</span></h2>
               <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Optimizado por Zentra AI</p>
            </div>

            <div className="grid gap-4">
              {vehicles.map((v) => (
                <button 
                  key={v.id}
                  onClick={() => { setVehicleId(v.id); setStep(2); }}
                  className={cn(
                    "flex items-center gap-5 p-6 rounded-[32px] border transition-all duration-300 relative overflow-hidden group text-left",
                    vehicleId === v.id ? "bg-blue-600 border-blue-400 shadow-[0_15px_40px_rgba(59,130,246,0.3)]" : "bg-[#060E20] border-white/5 hover:border-white/20"
                  )}
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                    vehicleId === v.id ? "bg-white text-blue-600" : "bg-white/5 text-zinc-500"
                  )}>
                    <v.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className={cn("font-black text-base uppercase tracking-tight", vehicleId === v.id ? "text-white" : "text-zinc-200")}>{v.label}</h4>
                    <p className={cn("text-[9px] font-black uppercase tracking-widest", vehicleId === v.id ? "text-blue-200" : "text-zinc-600")}>{v.sub}</p>
                  </div>
                  {vehicleId === v.id && (
                    <div className="ml-auto w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: ORIGIN & DESTINATION */}
        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right-5">
            <div className="space-y-1">
               <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Define la <span className="text-blue-500">Ruta</span></h2>
               <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Terminal de Posicionamiento</p>
            </div>

            <div className="space-y-4 relative">
              <div className="absolute left-7 top-10 bottom-10 w-0.5 bg-zinc-800 z-0" />
              
              <div className="bg-[#060E20] border border-white/5 rounded-[32px] p-2 pr-6 flex items-center gap-6 relative z-10 transition-all focus-within:border-blue-500/50">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                   <Navigation className="w-5 h-5" />
                </div>
                <div className="flex-1">
                   <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1">Punto de Carga</p>
                   <input 
                    className="bg-transparent border-none p-0 text-white font-black placeholder:text-zinc-800 focus:ring-0 w-full uppercase tracking-tight"
                    placeholder="Escribre origen..."
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                   />
                </div>
              </div>

              <div className="bg-[#060E20] border border-white/5 rounded-[32px] p-2 pr-6 flex items-center gap-6 relative z-10 transition-all focus-within:border-emerald-500/50">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                   <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                   <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1">Destino Final</p>
                   <input 
                    className="bg-transparent border-none p-0 text-white font-black placeholder:text-zinc-800 focus:ring-0 w-full uppercase tracking-tight"
                    placeholder="Escribre destino..."
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                   />
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-[32px] p-6 space-y-4">
               <div className="flex justify-between items-center">
                  <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Peso Estimado (kg)</span>
                  <span className="text-white font-black">{weight} KG</span>
               </div>
               <input 
                type="range" 
                min="10" 
                max="5000" 
                step="50"
                className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
               />
            </div>

            <Button 
               disabled={!origin || !destination}
               onClick={() => setStep(3)}
               className="w-full h-16 rounded-[28px] bg-white text-black font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-zinc-200 transition-all text-xs"
            >
               Calcular Presupuesto AI
            </Button>
          </div>
        )}

        {/* STEP 3: FINAL SUMMARY */}
        {step === 3 && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <Card className="bg-[#060E20] border-white/5 rounded-[48px] p-10 shadow-2xl relative overflow-hidden text-center">
               <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
               <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 blur-3xl rounded-full -ml-16 -mb-16" />
               
               <div className="relative z-10 space-y-8">
                  <div className="flex flex-col items-center gap-3">
                     <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                        <Sparkles className="w-8 h-8 text-blue-500" />
                     </div>
                     <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Zentra AI Quote</span>
                  </div>

                  <div>
                     <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-2">Presupuesto Sugerido</p>
                     <h2 className="text-6xl font-black text-white tracking-tighter italic">
                       ${totalPrice.toLocaleString()}
                     </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-8">
                     <div className="text-left space-y-1">
                        <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Unidad</p>
                        <p className="text-xs font-black text-zinc-300 uppercase">{vehicles.find(v => v.id === vehicleId)?.label}</p>
                     </div>
                     <div className="text-right space-y-1">
                        <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Distancia Est.</p>
                        <p className="text-xs font-black text-zinc-300 uppercase">342 KM</p>
                     </div>
                  </div>

                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-3xl">
                     <p className="text-[10px] text-emerald-400 font-black uppercase leading-relaxed tracking-wider">
                        Estás ahorrando un <span className="underline">12%</span> comparado con tarifas de mercado hoy.
                     </p>
                  </div>
               </div>
            </Card>

            <div className="space-y-3">
               <Button asChild className="w-full h-16 rounded-[28px] bg-blue-600 text-white font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-500 transition-all text-sm">
                  <Link to="/client/book">Confirmar y Reservar</Link>
               </Button>
               <Button 
                variant="ghost" 
                onClick={() => setStep(1)}
                className="w-full h-14 rounded-[28px] text-zinc-600 font-black uppercase tracking-widest hover:text-white"
               >
                  Recalcular Todo
               </Button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default QuoteCalculator;
