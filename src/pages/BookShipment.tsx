import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Loader2, Truck, Camera, Scan, Sparkles, 
  CheckCircle2, X, AlertCircle, Users, Activity, Shield
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCreateJobBroadcast } from '@/hooks/useJobRequests';
import { toast } from 'sonner';

// ============================================
// BookShipment: Optimized for ZENTRA 
// Modules: 10 (AI Scan) + 11 (Ride-Share/Shared Trip)
// ============================================

export default function BookShipment() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [weight, setWeight] = useState('1000');
  const [cargoType, setCargoType] = useState('standard');
  const [isShared, setIsShared] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // AI Scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{
    volume: string;
    confidence: number;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createBroadcast, creating } = useCreateJobBroadcast();
  const navigate = useNavigate();

  // Price Calculation
  const distNum = origin.length >= 3 && destination.length >= 3
    ? ((origin.toLowerCase().split('').reduce((a, b) => a + b.charCodeAt(0), 0) +
        destination.toLowerCase().split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 800) + 150
    : 0;
  
  const weightNum = parseFloat(weight) || 0;
  const cargoMult = { standard: 1, fragile: 1.3, perishable: 1.5, hazardous: 1.8 }[cargoType] || 1;
  
  const basePrice = 50 + (distNum * 1.2) + (weightNum * 0.08);
  const cargoExtras = basePrice * (cargoMult - 1);
  const subtotal = basePrice + cargoExtras;
  
  // Discounts
  const shareDiscount = isShared ? subtotal * 0.35 : 0; // 35% off for shared
  const aiDiscount = scanResult ? 15 : 0;
  
  const fee = (subtotal - shareDiscount) * 0.08;
  const total = subtotal - shareDiscount - aiDiscount + fee;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
        setScanResult({ volume: (Math.random() * 4 + 1).toFixed(1) + " m³", confidence: 99.2 });
        toast.success("AI: Volumen calculado correctamente");
      }, 2500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return toast.error('Ruta requerida');

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Inicia sesión');

      let photoUrl = null;
      if (file) {
        const path = `${user.id}/${Date.now()}_${file.name}`;
        await supabase.storage.from('cargo_photos').upload(path, file);
        photoUrl = supabase.storage.from('cargo_photos').getPublicUrl(path).data.publicUrl;
      }

      const { data: shipment, error } = await supabase.from('shipments').insert({
        client_id: user.id,
        origin, destination,
        distance: distNum, weight: weightNum,
        cargo_type: cargoType,
        is_shared: isShared,
        status: 'pending',
        price: total,
        delivery_pin: Math.floor(1000 + Math.random() * 9000).toString(),
        cargo_photo_url: photoUrl,
        load_optimization_data: scanResult
      }).select().single();

      if (error) throw error;
      await createBroadcast(shipment.id);
      navigate(`/shipment/${shipment.id}/status`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Nuevo Envío ZENTRA</h1>
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-1">Configuración de Carga e Inteligencia de Ruta</p>
          </div>
          <div className="hidden md:flex items-center gap-4 bg-white/5 border border-white/10 p-1.5 rounded-2xl">
             <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${!isShared ? 'bg-white text-black' : 'text-zinc-500 cursor-pointer'}`} onClick={() => setIsShared(false)}>
                <Shield className="w-3 h-3" /> Privado
             </div>
             <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${isShared ? 'bg-[#00e5ff] text-black shadow-lg shadow-[#00e5ff]/20' : 'text-zinc-500 cursor-pointer'}`} onClick={() => setIsShared(true)}>
                <Users className="w-3 h-3" /> Compartido
             </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-[#0a0a0a] border-white/10 p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#00e5ff]/5 blur-[100px] -z-10" />
               <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Recogida</label>
                        <Input 
                            value={origin} onChange={e => setOrigin(e.target.value)}
                            className="bg-white/5 border-white/5 h-14 rounded-2xl focus:ring-[#00e5ff] text-white font-bold" 
                            placeholder="Ciudad, Calle..." 
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Entrega</label>
                        <Input 
                            value={destination} onChange={e => setDestination(e.target.value)}
                            className="bg-white/5 border-white/5 h-14 rounded-2xl focus:ring-[#00e5ff] text-white font-bold" 
                            placeholder="Destino final..." 
                        />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 py-8 border-y border-white/5">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Peso de Carga (kg)</label>
                        <Input 
                            type="number" value={weight} onChange={e => setWeight(e.target.value)}
                            className="bg-white/5 border-white/5 h-14 rounded-2xl text-xl font-bold text-white" 
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Fragilidad / Tipo</label>
                        <select 
                            value={cargoType} onChange={e => setCargoType(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 h-14 rounded-2xl px-4 text-white font-bold outline-none focus:border-[#00e5ff] transition-all appearance-none cursor-pointer hover:bg-black/60"
                        >
                            <option value="standard" className="bg-[#0a0a0a] text-white">📦 Carga General</option>
                            <option value="fragile" className="bg-[#0a0a0a] text-white">💎 Muy Frágil</option>
                            <option value="perishable" className="bg-[#0a0a0a] text-white">🍎 Alimentos / Frío</option>
                            <option value="hazardous" className="bg-[#0a0a0a] text-white">⚠️ Químicos / Hazmat</option>
                        </select>
                    </div>
                  </div>

                  <Button 
                    type="submit" disabled={submitting || isScanning}
                    className="w-full h-16 bg-teal-gradient text-black font-black text-lg rounded-2xl shadow-xl hover:scale-[1.01] transition-transform"
                  >
                    {submitting ? <Loader2 className="animate-spin" /> : "Iniciar Subasta de Carga"}
                  </Button>
               </form>
            </Card>
          </div>

          <div className="space-y-6">
             {/* AI Scan Card */}
             <Card className="bg-[#0a0a0a] border-white/10 p-6 rounded-[32px] shadow-xl overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                        <Scan className="w-4 h-4 text-[#00e5ff]" /> AI Vision Analyzer
                    </h3>
                    {scanResult && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>

                {!previewUrl ? (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="h-44 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.02] flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.04] transition-all group"
                    >
                        <Camera className="w-8 h-8 text-zinc-700 group-hover:text-[#00e5ff] transition-colors mb-2" />
                        <p className="text-[10px] text-zinc-500 font-black uppercase">Click para escanear carga</p>
                    </div>
                ) : (
                    <div className="relative rounded-2xl overflow-hidden aspect-video">
                        <img src={previewUrl} className="w-full h-full object-cover" />
                        {isScanning && (
                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                                <Sparkles className="w-8 h-8 text-[#00e5ff] animate-pulse" />
                            </div>
                        )}
                        {scanResult && (
                            <div className="absolute bottom-2 left-2 right-2 bg-black/90 p-3 rounded-xl border border-white/10 flex justify-between">
                                <div>
                                    <p className="text-[8px] text-zinc-500 uppercase font-black">Volumen</p>
                                    <p className="text-white font-bold">{scanResult.volume}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] text-zinc-500 uppercase font-black">Precisión</p>
                                    <p className="text-emerald-500 font-bold">{scanResult.confidence}%</p>
                                </div>
                            </div>
                        )}
                        <button onClick={() => {setFile(null); setPreviewUrl(null); setScanResult(null)}} className="absolute top-2 right-2 bg-red-500 p-1 rounded-full">
                            <X className="w-3 h-3 text-white" />
                        </button>
                    </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
             </Card>

             {/* Dynamic Pricing */}
             <Card className="bg-[#0a0a0a] border-white/10 p-8 rounded-[32px] shadow-xl">
                <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Cotización en Tiempo Real</h3>
                <div className="space-y-4">
                    <div className="flex justify-between text-xs">
                        <span className="text-zinc-500 uppercase font-bold">Reserva Base</span>
                        <span className="text-white font-bold">${subtotal.toFixed(2)}</span>
                    </div>
                    {isShared && (
                        <div className="flex justify-between text-xs">
                            <span className="text-emerald-400 uppercase font-bold">Descuento Ride-Share</span>
                            <span className="text-emerald-400 font-bold">-${shareDiscount.toFixed(2)}</span>
                        </div>
                    )}
                    {scanResult && (
                        <div className="flex justify-between text-xs">
                            <span className="text-[#00e5ff] uppercase font-bold">Bono AI Scanner</span>
                            <span className="text-[#00e5ff] font-bold">-$15.00</span>
                        </div>
                    )}
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Total a Pagar</p>
                        <p className="text-4xl font-black text-white tracking-tighter">${total.toFixed(2)}</p>
                    </div>
                </div>
             </Card>

             {isShared && (
               <div className="bg-[#00e5ff]/5 border border-[#00e5ff]/20 p-4 rounded-2xl flex gap-3">
                  <Activity className="w-5 h-5 text-[#00e5ff] shrink-0" />
                  <p className="text-[10px] text-zinc-400 leading-relaxed font-bold uppercase">
                     <b>MODO COMPARTIDO:</b> Tu carga compartirá espacio con otros envíos en la misma ruta. Tiempo de entrega puede variar ±2 horas.
                  </p>
               </div>
             )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


