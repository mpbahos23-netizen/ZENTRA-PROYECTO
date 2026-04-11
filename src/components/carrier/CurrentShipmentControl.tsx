import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Truck, MapPin, Package, CheckCircle2, ChevronRight, Loader2, Navigation } from 'lucide-react';

const STATUS_FLOW = [
  { key: 'on_route', label: 'YENDO AL ORIGEN', icon: Navigation, color: 'text-blue-500', bg: 'bg-blue-500', border: 'border-blue-500', action: 'Iniciar Viaje' },
  { key: 'pickup', label: 'EN RECOJO', icon: Package, color: 'text-amber-500', bg: 'bg-amber-500', border: 'border-amber-500', action: 'Llegué al Origen' },
  { key: 'transit', label: 'EN TRÁNSITO', icon: Truck, color: 'text-purple-500', bg: 'bg-purple-500', border: 'border-purple-500', action: 'Carga Lista, Iniciando Ruta' },
  { key: 'delivered', label: 'ENTREGADO', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500', border: 'border-emerald-500', action: 'Confirmar Entrega Final' }
] as const;

export function CurrentShipmentControl({ isOnline }: { isOnline: boolean }) {
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShipment(null);
      setLoading(false);
      return;
    }

    const fetchCurrent = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('carrier_id', user.id)
        .in('status', ['on_route', 'pickup', 'transit', 'carrier_selected'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        // Map carrier_selected to on_route immediately visually if needed, but we keep DB status
        setShipment(data);
      }
      setLoading(false);
    };

    fetchCurrent();

    // Subscribe to new assignments
    const channel = supabase.channel('carrier-active-shipment')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shipments' },
        (payload) => {
          fetchCurrent();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOnline]);

  const advanceStatus = async () => {
    if (!shipment || updating) return;
    
    // Find next status
    let nextKey = 'on_route'; // Default if coming from searching/carrier_selected
    
    if (shipment.status === 'on_route') nextKey = 'pickup';
    else if (shipment.status === 'pickup') nextKey = 'transit';
    else if (shipment.status === 'transit') nextKey = 'delivered';
    else if (shipment.status === 'delivered') return;

    setUpdating(true);
    const { error } = await supabase
      .from('shipments')
      .update({ status: nextKey, updated_at: new Date().toISOString() })
      .eq('id', shipment.id);

    if (!error) {
       toast.success(`Estado actualizado a: ${nextKey.toUpperCase()}`, {
         className: "bg-[#060E20] border-emerald-500/30 text-white font-bold rounded-2xl"
       });
       setShipment({ ...shipment, status: nextKey });
    } else {
       toast.error("Hubo un error al actualizar el estado");
    }
    setUpdating(false);
  };

  if (!isOnline) return null;
  if (loading) return (
    <div className="bg-[#060E20] border border-white/5 p-8 rounded-[32px] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  if (!shipment) return (
    <div className="bg-[#060E20] border border-white/5 p-12 rounded-[32px] flex flex-col items-center justify-center text-center space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[50px] rounded-full" />
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-2">
           <MapPin className="w-8 h-8 text-zinc-500" />
        </div>
        <h3 className="text-xl font-black text-white uppercase tracking-widest">Esperando asignación...</h3>
        <p className="text-zinc-500 font-medium">Mantén la app abierta para recibir nuevas cargas de Zentra.</p>
    </div>
  );

  const getCurrentStepIndex = () => {
    const s = shipment.status === 'carrier_selected' ? 'on_route' : shipment.status;
    return STATUS_FLOW.findIndex(step => step.key === s) >= 0 ? STATUS_FLOW.findIndex(step => step.key === s) : 0;
  };

  const currentIndex = getCurrentStepIndex();
  const nextStep = STATUS_FLOW[currentIndex]; // The action button represents advancing to the NEXT logic state, wait, actually if currentIndex is 0, they are ALREADY on_route... The button should advance to the next state.
  
  // Let's configure the button to represent what they are doing NEXT.
  let actionLabel = "Incializando...";
  let buttonColor = "bg-blue-600 hover:bg-blue-500";
  let borderGlow = "border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]";
  
  if (shipment.status === 'carrier_selected') {
    actionLabel = "CONFIRMAR E IR AL ORIGEN";
    buttonColor = "bg-blue-600";
  } else if (shipment.status === 'on_route') {
    actionLabel = "🚚 LLEGUÉ AL PUNTO DE RECOJO";
    buttonColor = "bg-amber-600"; borderGlow = "border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]";
  } else if (shipment.status === 'pickup') {
    actionLabel = "📦 CARGA LISTA, INICIAR RUTA";
    buttonColor = "bg-purple-600"; borderGlow = "border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]";
  } else if (shipment.status === 'transit') {
    actionLabel = "✅ CONFIRMAR ENTREGA FINAL";
    buttonColor = "bg-emerald-600"; borderGlow = "border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]";
  } else if (shipment.status === 'delivered') {
    return (
        <div className="bg-emerald-950/20 border border-emerald-500/20 p-8 rounded-[32px] flex items-center justify-center text-center">
            <h3 className="text-xl font-black text-emerald-400 uppercase tracking-widest">¡Servicio Completado Exitosamente!</h3>
        </div>
    );
  }

  return (
    <div className="bg-[#060E20] border border-white/5 p-8 rounded-[32px] shadow-2xl relative overflow-hidden space-y-8">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none" />

      {/* Header Info */}
      <div className="flex justify-between items-start pb-6 border-b border-white/5">
        <div>
           <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-1">Carga Activa</p>
           <h2 className="text-2xl font-black text-white uppercase">{shipment.cargo_type}</h2>
           <p className="text-sm font-bold text-zinc-400 mt-1 uppercase">Tracking: {shipment.tracking_id.split('-')[0]}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-2">
            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest text-center">Tarifa Zentra</p>
            <p className="text-xl font-black text-emerald-400">S/{shipment.price}</p>
        </div>
      </div>

      {/* Route Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
           <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-1">Punto A / Origen</p>
           <p className="text-sm font-bold text-white leading-tight">{shipment.origin_address || shipment.origin}</p>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
           <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-1">Punto B / Destino</p>
           <p className="text-sm font-bold text-white leading-tight">{shipment.destination_address || shipment.destination}</p>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="py-2">
         <div className="flex justify-between relative">
            <div className="absolute inset-y-1/2 left-0 right-0 h-0.5 bg-white/5 -z-10 rounded-full" />
            {STATUS_FLOW.map((step, idx) => {
               const isActive = idx === currentIndex;
               const isPast = idx < currentIndex;
               const StepIcon = step.icon;
               
               return (
                   <div key={step.key} className="flex flex-col items-center gap-3">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                           isPast ? 'bg-emerald-500 border-emerald-500 text-white' : 
                           isActive ? `bg-[#060E20] ${step.border} ${step.color} shadow-[0_0_15px_currentColor]` : 
                           'bg-[#060E20] border-white/10 text-zinc-600'
                       }`}>
                          {isPast ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                       </div>
                       <span className={`text-[9px] font-black uppercase tracking-wider ${isActive ? 'text-white' : 'text-zinc-600'}`}>
                          {step.label}
                       </span>
                   </div>
               );
            })}
         </div>
      </div>

      {/* Main Action Button */}
      <button 
        onClick={advanceStatus}
        disabled={updating}
        className={`w-full py-5 rounded-2xl text-white font-black uppercase tracking-widest text-sm md:text-base cursor-pointer transition-all border ${buttonColor} ${borderGlow} disabled:opacity-50 flex items-center justify-center gap-3`}
      >
         {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
         {actionLabel}
         {!updating && <ChevronRight className="w-5 h-5" />}
      </button>

    </div>
  );
}
