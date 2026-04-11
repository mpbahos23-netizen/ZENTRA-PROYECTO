import { useRef, useState, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight, ChevronLeft, Zap, Truck, Cylinder, PackageCheck,
  Camera, Plus, Trash2, LayoutDashboard, CreditCard, Scan, X, ListChecks
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import MapPicker from "@/components/MapPicker";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import DigitalManifest from "@/components/tracking/DigitalManifest";

// ============================================
// ZENTRA OBSIDIAN: Advanced Quote & Booking Flow
// Reordered: Map First (Uber Style)
// ============================================

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
}

const units = [
  { id: 'light', label: 'Van Ligera', sub: 'Hasta 500kg', icon: Zap, multiplier: 1 },
  { id: 'medium', label: 'Camión Mediano', sub: 'Hasta 2 toneladas', icon: Truck, multiplier: 1.5 },
  { id: 'heavy', label: 'Camión Pesado', sub: 'Hasta 10 toneladas', icon: Cylinder, multiplier: 2.5 },
  { id: 'special', label: 'Camión Especializado', sub: 'Carga Frágil/Refrigerada', icon: PackageCheck, multiplier: 3 },
];

const services = [
  { id: 'mudanza_hogar', label: 'Mudanza de Hogar', sub: 'Casas y departamentos completos', multiplier: 1.2 },
  { id: 'mudanza_oficina', label: 'Mudanza de Oficina', sub: 'Equipos, cubículos y mobiliario', multiplier: 1.3 },
  { id: 'carga_pesada', label: 'Carga Pesada', sub: 'Materiales industriales o maquinaria', multiplier: 1.5 },
  { id: 'express', label: 'Envío Express', sub: 'Entrega prioritaria el mismo día', multiplier: 1.4 },
  { id: 'electrodomesticos', label: 'Transporte de Electrodomésticos', sub: 'Refrigeradoras, TV, lavadoras', multiplier: 1.1 },
  { id: 'material_construccion', label: 'Materiales de Construcción', sub: 'Cemento, varillas, ladrillos', multiplier: 1.2 },
  { id: 'distribucion_retail', label: 'Distribución Retail (B2B)', sub: 'Lotes hacia puntos de venta', multiplier: 1.1 },
  { id: 'carga_fragil', label: 'Carga Delicada / Frágil', sub: 'Cristalería, arte, equipos de precisión', multiplier: 1.6 },
  { id: 'cadena_frio', label: 'Cadena de Frío (Alimentos/Medicina)', sub: 'Transporte refrigerado exclusivo', multiplier: 1.8 },
  { id: 'desmonte', label: 'Recolección de Desmonte', sub: 'Escombros y residuos de construcción', multiplier: 1.2 },
  { id: 'remolque', label: 'Remolque de Vehículos', sub: 'Grúa para autos o motos', multiplier: 2.0 },
];

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const QuoteCalculator = () => {
  const navigate = useNavigate();
  // Step 1: Map/Route | Step 2: Units/Services | Step 3: Reservation
  const [step, setStep] = useState(1); 
  const [unitId, setUnitId] = useState("light");
  const [serviceId, setServiceId] = useState("carga_pesada");
  const [origin, setOrigin] = useState<LocationData | null>(null);
  const [destination, setDestination] = useState<LocationData | null>(null);
  const [weight, setWeight] = useState("100");
  const [isPrivate, setIsPrivate] = useState(true);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Camera State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{ volume: string; confidence: number; items?: number; recommendation?: string } | null>(null);

  // Tarifa Config
  const RATE_PER_KM = 50;
  const BASE_RATE = 150;

  const distanceKm = useMemo(() => {
    if (!origin || !destination) return 0;
    return Math.max(3, Math.round(haversineKm(origin.lat, origin.lng, destination.lat, destination.lng) * 1.3));
  }, [origin, destination]);

  const totalPrice = useMemo(() => {
    const unitMult = units.find(u => u.id === unitId)?.multiplier || 1;
    const servMult = services.find(s => s.id === serviceId)?.multiplier || 1;
    const weightSurcharge = parseInt(weight) > 200 ? (parseInt(weight) - 200) * 0.5 : 0;
    const distancePrice = Math.max(BASE_RATE, distanceKm * RATE_PER_KM);
    const modeMult = isPrivate ? 1.4 : 1; // Privado es más caro

    return Math.round((distancePrice * unitMult * servMult * modeMult) + weightSurcharge);
  }, [distanceKm, unitId, serviceId, weight, isPrivate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setIsScanning(true);
      
      setTimeout(() => {
        setIsScanning(false);
        setScanResult({ 
          volume: "1.25 m³", 
          confidence: 99.9,
          items: 4,
          recommendation: "Carga optimizada para Van Z-1"
        });
        toast.success("ZENTRA AI: Volumen Verificado");
      }, 3000);
    }
  };

  const addInventoryItem = () => {
    if (!newItemName) return;
    setInventory([...inventory, { id: Math.random().toString(), name: newItemName, quantity: 1 }]);
    setNewItemName("");
  };

  const removeInventoryItem = (id: string) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  const handleFinalBooking = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No session found");

      const tracking_id = `ZNT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const { error } = await supabase.from('shipments').insert({
        client_id: user.id,
        status: 'pending',
        origin: origin?.address || '',
        destination: destination?.address || '',
        distance: distanceKm,
        price: totalPrice,
        weight: parseInt(weight),
        cargo_type: `${units.find(u => u.id === unitId)?.label} - ${services.find(s => s.id === serviceId)?.label}`,
        is_shared: !isPrivate,
        items: inventory,
        delivery_pin: Math.floor(1000 + Math.random() * 9000).toString(),
        is_express: serviceId === 'express',
        has_insurance: false,
        load_optimization_data: scanResult
      });

      if (error) throw error;

      toast.success("¡Reserva creada con éxito!");
      navigate('/client');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="client">
      <div className="max-w-2xl mx-auto space-y-10 pb-32 animate-in fade-in duration-700 font-inter">

        {/* COMPACT HEADER */}
        <div className="flex items-center justify-between sticky top-0 bg-[#060E20]/50 backdrop-blur-3xl p-4 z-50 rounded-b-2xl border-b border-white/5">
          <Button variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : navigate('/client')} className="w-10 h-10 rounded-full bg-white/5 p-0 hover:bg-white/10">
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </Button>
          <div className="text-center">
            <h1 className="text-white font-black text-xs uppercase tracking-[0.3em]">Operación ZENTRA</h1>
            <div className="flex justify-center gap-1 mt-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className={cn(
                  "h-0.5 rounded-full transition-all duration-300",
                  step === s ? "w-6 bg-blue-500" : "w-1.5 bg-zinc-800"
                )} />
              ))}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
             <span className="text-[10px] font-black text-blue-500">{step}/3</span>
          </div>
        </div>

        {/* STEP 1: ROUTE & WEIGHT (UBER STYLE - MAP FIRST) */}
        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-right-5">
            <div className="space-y-1">
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Define la <span className="text-blue-500">Ruta</span></h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Google Maps Integration - Zentra OS</p>
            </div>

            <div className="space-y-6">
              <MapPicker
                label="📍 Origen de la carga"
                value={origin}
                onChange={setOrigin}
                placeholder="Ej. Av. Javier Prado Este..."
              />
              <MapPicker
                label="🏁 Destino final"
                value={destination}
                onChange={setDestination}
                placeholder="Ej. Miraflores, Lima..."
                color="#10B981"
              />
            </div>

            <div className="bg-white/5 border border-white/5 rounded-[32px] p-8 space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Masa Total Estimada</span>
                  <p className="text-white font-black text-4xl tracking-tighter italic">{weight} <span className="text-blue-500 text-xl font-black">KG</span></p>
                </div>
                {origin && destination && (
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Distancia Aprox</span>
                    <p className="text-zinc-300 font-black text-xl tracking-tighter italic">{distanceKm} KM</p>
                  </div>
                )}
              </div>
              <input
                type="range" min="10" max="5000" step="50"
                className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                value={weight} onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            <Button
              disabled={!origin || !destination}
              onClick={() => setStep(2)}
              className="w-full h-20 rounded-[32px] bg-blue-600 text-white font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-500 transition-all text-sm group"
            >
              Confirmar Ruta <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}

        {/* STEP 2: UNITS & SERVICES */}
        {step === 2 && (
          <div className="space-y-12 animate-in slide-in-from-right-5">
            {/* Units */}
            <div>
              <div className="space-y-1 mb-6">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Selecciona <span className="text-blue-500">Unidad</span></h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {units.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setUnitId(u.id)}
                    className={cn(
                      "flex items-center gap-5 p-6 rounded-[32px] border transition-all duration-300 relative overflow-hidden group text-left",
                      unitId === u.id ? "bg-blue-600 border-blue-400 shadow-[0_15px_40px_rgba(59,130,246,0.3)]" : "bg-[#060E20] border-white/5 hover:border-white/20"
                    )}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                      unitId === u.id ? "bg-white text-blue-600" : "bg-white/5 text-zinc-500"
                    )}>
                      <u.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className={cn("font-black text-base uppercase tracking-tight", unitId === u.id ? "text-white" : "text-zinc-200")}>{u.label}</h4>
                      <p className={cn("text-[9px] font-black uppercase tracking-widest", unitId === u.id ? "text-blue-200" : "text-zinc-600")}>{u.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <div className="space-y-1 mb-6">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Personaliza <span className="text-emerald-500">Servicio</span></h2>
              </div>
              <div className="max-w-md">
                <div className="relative group">
                  <select 
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    className="w-full bg-[#060E20] border-2 border-white/5 text-white font-black text-lg p-6 rounded-[32px] appearance-none focus:outline-none focus:border-emerald-500/50 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id} className="bg-[#060E20] text-zinc-300 font-bold">
                        {s.label} — {s.sub}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
                    <ChevronLeft className="w-6 h-6 text-emerald-500 -rotate-90 group-hover:translate-y-1 transition-transform" />
                  </div>
                </div>
                {/* Visual Indicator of current service */}
                <div className="mt-4 p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                     <PackageCheck className="w-5 h-5 text-emerald-400" />
                   </div>
                   <div>
                      <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Servicio Seleccionado</p>
                      <p className="text-white font-black text-sm uppercase">{services.find(s=>s.id === serviceId)?.label}</p>
                      <p className="text-[9px] text-zinc-400 font-bold">{services.find(s=>s.id === serviceId)?.sub}</p>
                   </div>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setStep(3)}
              className="w-full h-20 rounded-[32px] bg-white text-black font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-zinc-200 transition-all text-sm group"
            >
              Continuar a Reserva <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}

        {/* STEP 3: FINAL RESERVATION SCREEN */}
        {step === 3 && (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
             <div className="text-center space-y-2 mb-10">
                <h2 className="text-2xl font-black text-white uppercase tracking-[0.3em]">Reserva <span className="text-blue-500">Final</span></h2>
                <div className="flex items-center justify-center gap-3">
                  <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                    <CreditCard className="w-3 h-3 text-blue-500" />
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">PEN</span>
                  </div>
                </div>
             </div>

             {/* ROUTE CARD */}
             <Card className="bg-[#0b1325] border-white/5 rounded-[48px] p-8 relative overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between gap-6 relative z-10">
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Punto de Carga</span>
                    <h4 className="text-lg font-black text-white uppercase tracking-tighter italic text-center leading-tight overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">{origin?.address.split(',').slice(0,2).join(',')}</h4>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="h-0.5 flex-1 bg-zinc-800 rounded-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-blue-500/30 animate-pulse" />
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Destino</span>
                    <h4 className="text-lg font-black text-emerald-500 uppercase tracking-tighter italic leading-tight overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">{destination?.address.split(',').slice(0,2).join(',')}</h4>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Servicio</p>
                      <p className="text-[10px] font-bold text-white uppercase">{services.find(s => s.id === serviceId)?.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                      <PackageCheck className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Masa Total</p>
                      <p className="text-[10px] font-bold text-white uppercase">{weight} KG</p>
                    </div>
                  </div>
                </div>

                {/* Private vs Shared Selector */}
                <div className="mt-8 flex gap-2">
                  <button
                    onClick={() => setIsPrivate(true)}
                    className={cn(
                      "flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all",
                      isPrivate ? "bg-white text-black shadow-xl" : "bg-white/5 text-zinc-600 hover:bg-white/10"
                    )}
                  >
                    Privado
                  </button>
                  <button
                    onClick={() => setIsPrivate(false)}
                    className={cn(
                      "flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all",
                      !isPrivate ? "bg-white text-black shadow-xl" : "bg-white/5 text-zinc-600 hover:bg-white/10"
                    )}
                  >
                    Compartido
                  </button>
                </div>
             </Card>

             {/* VISUAL VERIFICATION */}
             <div className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 border border-white rounded-full" />
                  </div>
                  <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                     <Scan className="w-3.5 h-3.5 text-blue-500" /> Verificación Visual Zentra
                  </h3>
                </div>
                {!previewUrl ? (
                   <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="h-32 rounded-[32px] border-2 border-dashed border-white/5 bg-white/[0.02] flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors cursor-pointer group relative overflow-hidden"
                   >
                     <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                     <Camera className="w-8 h-8 text-zinc-700 group-hover:text-blue-500 transition-colors relative z-10" />
                     <p className="text-[9px] text-zinc-700 font-black uppercase tracking-widest relative z-10">Toca para capturar carga</p>
                   </div>
                ) : (
                   <div className="relative h-48 rounded-[32px] overflow-hidden border border-white/10 group shadow-2xl">
                       <img src={previewUrl} className="w-full h-full object-cover grayscale opacity-50 transition-all duration-700" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                       <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                          <div>
                             <p className="text-[8px] text-blue-400 font-black uppercase tracking-widest animate-pulse">
                                {isScanning ? 'ZENTRA AI SCANNING...' : (scanResult?.recommendation || 'VERIFICADO')}
                             </p>
                             <p className="text-white font-black text-2xl italic tracking-tighter uppercase">{isScanning ? '...' : (scanResult?.volume || '...')}</p>
                          </div>
                          <button onClick={() => {setPreviewUrl(null); setFile(null); setScanResult(null);}} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white backdrop-blur-md hover:bg-red-500 transition-colors">
                             <X className="w-4 h-4" />
                          </button>
                       </div>
                   </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
             </div>

             {/* Z-INVENTARIO */}
             <div className="space-y-4">
                <div className="flex items-center gap-3 px-2 mb-2">
                  <div className="w-4 h-4 rounded bg-[#00e5ff] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 border border-black rounded-full" />
                  </div>
                  <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                     <ListChecks className="w-3.5 h-3.5 text-[#00e5ff]" />
                     Desglose de items <span className="text-white text-[9px] font-bold">Z-INVENTARIO</span>
                  </h3>
                </div>
                <DigitalManifest items={inventory as any} onUpdate={setInventory as any} />
             </div>

             {/* FINAL PRICE & ACTION */}
             <div className="pt-10 flex flex-col items-center gap-8 text-center bg-gradient-to-t from-blue-600/10 to-transparent rounded-[64px] border border-blue-600/10 p-10">
                <div className="space-y-1">
                   <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em]">Monto final a liquidar</p>
                   <h2 className="text-7xl font-black text-white italic tracking-tighter leading-none">
                      S/{totalPrice.toLocaleString()}
                   </h2>
                   <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Soles Peruanos (PEN)</p>
                </div>

                <Button
                  onClick={handleFinalBooking}
                  disabled={isSubmitting}
                  className="w-full h-24 rounded-full bg-blue-600 text-white font-black uppercase tracking-[0.3em] text-lg shadow-[0_20px_50px_rgba(59,130,246,0.4)] hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-8 h-8" />
                      Liquidar Servicio
                    </>
                  )}
                </Button>
             </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default QuoteCalculator;
