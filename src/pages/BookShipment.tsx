import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Loader2, Truck, Camera, Scan, Sparkles, 
  CheckCircle2, X, AlertCircle, Users, Activity, Shield,
  ChevronLeft, MapPin, Navigation, Info, CreditCard, ListChecks,
  Coins
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCreateJobBroadcast } from '@/hooks/useJobRequests';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import DigitalManifest from '@/components/tracking/DigitalManifest';

// ============================================
// ZENTRA OBSIDIAN: Booking & Reservation
// Checkout en SOLES (S/.)
// ============================================

export default function BookShipment() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Try to get data from navigation state (if coming from QuoteCalculator)
  const queryParams = new URLSearchParams(location.search);
  
  const [origin, setOrigin] = useState(queryParams.get('origin') || 'Lima, PE');
  const [destination, setDestination] = useState(queryParams.get('destination') || 'Cusco, PE');
  const [weight, setWeight] = useState(queryParams.get('weight') || '150');
  const [cargoType, setCargoType] = useState('standard');
  const [isShared, setIsShared] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  
  // AI Scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{
    volume: string;
    confidence: number;
    items?: number;
    recommendation?: string;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createBroadcast, creating } = useCreateJobBroadcast();

  // Price Calculation Logic (Now in Soles S/.)
  // Base 150 soles per 3km -> 50 soles per km
  const estimatedDist = 420; // Default distance
  const basePrice = isShared ? 450 : 1350; // Reference values in Soles
  const platformFee = basePrice * 0.10;
  const total = basePrice + platformFee;

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

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Inicia sesión');

      const { data: shipment, error } = await supabase.from('shipments').insert({
        client_id: user.id,
        origin, destination,
        distance: estimatedDist, 
        weight: parseInt(weight),
        cargo_type: cargoType,
        is_shared: isShared,
        status: 'pending',
        price: total,
        currency: 'PEN',
        delivery_pin: Math.floor(1000 + Math.random() * 9000).toString(),
        load_optimization_data: scanResult,
        items
      }).select().single();

      if (error) throw error;
      await createBroadcast(shipment.id);
      toast.success("Reserva Confirmada en Soles");
      navigate(`/shipment/${shipment.id}/status`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="client">
      <div className="max-w-md mx-auto space-y-10 pb-32 animate-in fade-in duration-700 font-inter">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/5 p-0">
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </Button>
          <h1 className="text-white font-black text-xs uppercase tracking-[0.3em]">Reserva Final</h1>
          <div className="inline-flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
             <Coins className="w-3 h-3 text-blue-500" />
             <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest leading-none">PEN</span>
          </div>
        </div>

        {/* TICKET SUMMARY */}
        <Card className="bg-[#060E20] border-white/5 rounded-[48px] p-1 w-full overflow-hidden shadow-2xl relative">
           <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-500/10 to-transparent" />
           
           <div className="p-10 space-y-10 relative z-10">
              <div className="flex justify-between items-center">
                 <div className="space-y-1">
                    <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Punto de Carga</p>
                    <h3 className="text-white font-black text-xl tracking-tight uppercase italic">{origin}</h3>
                 </div>
                 <div className="w-10 h-0.5 bg-blue-500/20 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,1)] border-2 border-[#060E20]" />
                 </div>
                 <div className="space-y-1 text-right">
                    <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Destino</p>
                    <h3 className="text-emerald-400 font-black text-xl tracking-tight uppercase italic">{destination}</h3>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-8 border-y border-white/5 py-8">
                 <div className="space-y-1">
                    <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Servicio</p>
                    <div className="flex items-center gap-2">
                       <Truck className="w-3.5 h-3.5 text-blue-500" />
                       <span className="text-[10px] font-black text-white uppercase tracking-tight">Carga Pesada</span>
                    </div>
                 </div>
                 <div className="space-y-1 text-right">
                    <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Masa Total</p>
                    <div className="flex items-center gap-2 justify-end">
                       <span className="text-[10px] font-black text-white uppercase tracking-tight italic underline decoration-blue-500/50">{weight} KG</span>
                    </div>
                 </div>
              </div>

              <div className="bg-black/40 p-2 rounded-[28px] flex gap-2 border border-white/5">
                 <button 
                  onClick={() => setIsShared(false)}
                  className={cn(
                    "flex-1 h-12 rounded-[22px] text-[9px] font-black uppercase tracking-widest transition-all",
                    !isShared ? "bg-white text-black shadow-lg" : "text-zinc-600 hover:text-white"
                  )}
                 >
                    Privado
                 </button>
                 <button 
                  onClick={() => setIsShared(true)}
                  className={cn(
                    "flex-1 h-12 rounded-[22px] text-[9px] font-black uppercase tracking-widest transition-all",
                    isShared ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-zinc-600 hover:text-white"
                  )}
                 >
                    Compartido
                 </button>
              </div>
           </div>
        </Card>

        {/* AI SCANNER */}
        <div className="space-y-4 px-2">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2 opacity-60">
               <Scan className="w-3.5 h-3.5 text-blue-500" /> Verificación Visual Zentra
            </p>
            {!previewUrl ? (
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 bg-blue-500/5 border-2 border-dashed border-white/5 rounded-[32px] flex flex-col items-center justify-center gap-2 hover:bg-blue-500/10 transition-all group overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Camera className="w-6 h-6 text-zinc-700 group-hover:text-blue-500 transition-colors relative z-10" />
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest relative z-10">Toca para capturar carga</span>
                </button>
            ) : (
                <div className="relative h-48 rounded-[32px] overflow-hidden border border-white/10 group shadow-2xl">
                    <img src={previewUrl} className="w-full h-full object-cover grayscale opacity-50 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                       <div>
                          <p className="text-[8px] text-blue-400 font-black uppercase tracking-widest animate-pulse">
                             {scanResult?.recommendation || 'ZENTRA AI SCANNING...'}
                          </p>
                          <p className="text-white font-black text-2xl italic tracking-tighter uppercase">{scanResult?.volume || '...'}</p>
                       </div>
                       <button onClick={() => {setPreviewUrl(null); setFile(null); setScanResult(null)}} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white backdrop-blur-md hover:bg-red-500 transition-colors">
                          <X className="w-4 h-4" />
                       </button>
                    </div>
                </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        </div>

        {/* DIGITAL MANIFEST */}
        <div className="space-y-4">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2 opacity-60 px-2">
               <ListChecks className="w-3.5 h-3.5 text-blue-500" /> Desglose de Items <span className="text-zinc-800 text-[8px] font-bold">Z-INVENTARIO</span>
            </p>
            <DigitalManifest 
                items={items} 
                onUpdate={setItems} 
            />
        </div>

        {/* FINAL PRICING & PAYMENT: Fixed Symbol & Calculation */}
        <div className="space-y-8 pt-10">
           <div className="flex items-center justify-between px-6 border border-white/5 bg-white/[0.01] p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl -mr-10 -mt-10" />
              <div className="space-y-1">
                 <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Monto Final a Liquidar</p>
                 <h2 className="text-5xl font-black text-white tracking-tighter italic font-inter leading-none">S/{total.toLocaleString()}</h2>
                 <p className="text-[8px] text-zinc-800 font-black uppercase tracking-widest pt-1">Soles Peruanos (PEN)</p>
              </div>
              <div className="bg-blue-600 w-16 h-16 rounded-[28px] flex items-center justify-center shadow-[0_15px_40px_rgba(59,130,246,0.4)]">
                 <CreditCard className="w-8 h-8 text-white" />
              </div>
           </div>

           <div className="px-2 pb-10">
              <Button 
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full h-20 rounded-[40px] bg-white text-black font-black uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(255,255,255,0.05)] hover:bg-zinc-200 transition-all text-sm relative group overflow-hidden"
              >
                 {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                    <>
                      <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Sparkles className="w-5 h-5 mr-3 animate-pulse text-blue-600" />
                      LIQUIDAR Y CONFIRMAR
                    </>
                 )}
              </Button>
              <p className="text-[8px] text-zinc-800 font-black uppercase text-center mt-8 tracking-[0.2em] leading-relaxed px-10 italic">
                 Confirmación Segura vía ZENTRA Secure Pay Protocol v2.5.1
              </p>
           </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
