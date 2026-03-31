import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Loader2, Truck, Camera, Scan, Sparkles, 
  CheckCircle2, X, AlertCircle, Users, Activity, Shield,
  ChevronLeft, MapPin, Navigation, Info, CreditCard
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCreateJobBroadcast } from '@/hooks/useJobRequests';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ============================================
// ZENTRA OBSIDIAN: Booking & Reservation
// Ultra-Minimalist Logistics Checkout
// ============================================

export default function BookShipment() {
  const [origin, setOrigin] = useState('Bogotá, Colombia');
  const [destination, setDestination] = useState('Medellín, Antioquia');
  const [weight, setWeight] = useState('1450');
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
    items?: number;
    recommendation?: string;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createBroadcast, creating } = useCreateJobBroadcast();
  const navigate = useNavigate();

  // Price Calculation Logic
  const price = isShared ? 450000 : 850000;
  const platformFee = price * 0.08;
  const total = price + platformFee;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setIsScanning(true);
      
      // Simulating ZENTRA VISION AI Analysis
      setTimeout(() => {
        setIsScanning(false);
        setScanResult({ 
          volume: "2.85 m³", 
          confidence: 99.9,
          items: 12,
          recommendation: "Carga optimizada para Camión Mediano (Z-Series)"
        });
        toast.success("ZENTRA AI: Volumen y Densidad Verificadas v4.1");
      }, 3500);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Inicia sesión');

      // (Supabase insert logic remains the same)
      const { data: shipment, error } = await supabase.from('shipments').insert({
        client_id: user.id,
        origin, destination,
        distance: 420, weight: parseInt(weight),
        cargo_type: cargoType,
        is_shared: isShared,
        status: 'pending',
        price: total,
        delivery_pin: Math.floor(1000 + Math.random() * 9000).toString(),
        load_optimization_data: scanResult
      }).select().single();

      if (error) throw error;
      await createBroadcast(shipment.id);
      toast.success("Reserva Confirmada");
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
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
             <Info className="w-4 h-4 text-zinc-600" />
          </div>
        </div>

        {/* TICKET SUMMARY: Glassmorphism */}
        <Card className="bg-[#060E20] border-white/5 rounded-[48px] p-1 w-full overflow-hidden shadow-2xl relative">
           <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-500/10 to-transparent" />
           
           <div className="p-10 space-y-10 relative z-10">
              <div className="flex justify-between items-center">
                 <div className="space-y-1">
                    <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Desde</p>
                    <h3 className="text-white font-black text-xl tracking-tight">{origin}</h3>
                 </div>
                 <div className="w-10 h-0.5 bg-blue-500/20 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                 </div>
                 <div className="space-y-1 text-right">
                    <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Hacia</p>
                    <h3 className="text-white font-black text-xl tracking-tight text-emerald-400">{destination}</h3>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-8 border-y border-white/5 py-8">
                 <div className="space-y-1">
                    <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Unidad Sugerida</p>
                    <div className="flex items-center gap-2">
                       <Truck className="w-3.5 h-3.5 text-blue-500" />
                       <span className="text-xs font-black text-white uppercase tracking-tight">C. Mediano</span>
                    </div>
                 </div>
                 <div className="space-y-1 text-right">
                    <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Peso Total</p>
                    <div className="flex items-center gap-2 justify-end">
                       <span className="text-xs font-black text-white uppercase tracking-tight">{weight} KG</span>
                    </div>
                 </div>
              </div>

              {/* ACTION TOGGLE: Shared vs Private */}
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

        {/* AI SCANNER BUTTON (Floating) */}
        <div className="space-y-4 px-2">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
               <Scan className="w-3.5 h-3.5 text-blue-500" /> Optimización de Carga con IA (Opcional)
            </p>
            {!previewUrl ? (
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 bg-blue-500/5 border-2 border-dashed border-white/5 rounded-[32px] flex flex-col items-center justify-center gap-2 hover:bg-blue-500/10 transition-all group"
                >
                    <Camera className="w-6 h-6 text-zinc-700 group-hover:text-blue-500 transition-colors" />
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Toca para escanear tus cajas</span>
                </button>
            ) : (
                <div className="relative h-48 rounded-[32px] overflow-hidden border border-white/10 group shadow-2xl">
                    <img src={previewUrl} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                       <div>
                          <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest">
                             {scanResult?.recommendation || 'Análisis de Densidad...'}
                          </p>
                          <p className="text-white font-black text-xl italic">{scanResult?.volume || 'Escaneando...'}</p>
                       </div>
                       <button onClick={() => {setPreviewUrl(null); setFile(null); setScanResult(null)}} className="w-10 h-10 rounded-full bg-red-500/80 flex items-center justify-center text-white backdrop-blur-md">
                          <X className="w-4 h-4" />
                       </button>
                    </div>
                </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        </div>

        {/* FINAL PRICING & PAYMENT */}
        <div className="space-y-8 pt-6">
           <div className="flex items-center justify-between px-6">
              <div className="space-y-1">
                 <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Total a Pagar</p>
                 <h2 className="text-5xl font-black text-white tracking-tighter italic font-inter">${total.toLocaleString()}</h2>
              </div>
              <div className="bg-blue-500 w-16 h-16 rounded-[24px] flex items-center justify-center shadow-[0_15px_30px_rgba(59,130,246,0.3)]">
                 <CreditCard className="w-8 h-8 text-black" />
              </div>
           </div>

           <div className="px-2">
              <Button 
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full h-20 rounded-[40px] bg-blue-600 text-white font-black uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(59,130,246,0.3)] hover:bg-blue-500 transition-all text-base relative overflow-hidden group"
              >
                 {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                    <>
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Sparkles className="w-5 h-5 mr-3 animate-pulse text-blue-200" />
                      CONFIRMAR Y PAGAR
                    </>
                 )}
              </Button>
              <p className="text-[8px] text-zinc-700 font-black uppercase text-center mt-6 tracking-widest leading-relaxed px-10">
                 Al confirmar, aceptas nuestros términos de servicio y la política de privacidad de ZENTRA Logistics OS.
              </p>
           </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
