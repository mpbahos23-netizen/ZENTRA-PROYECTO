import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LiveTrackingMap from '@/components/tracking/LiveTrackingMap';
import CarrierTripControls from '@/components/tracking/CarrierTripControls';
import { useShipperTracking } from '@/hooks/useLocationTracking';
import { useShipperJobStatus } from '@/hooks/useJobRequests';
import { Loader2, ShieldCheck, MapPin, Hash, Package, Clock, Navigation } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import DigitalManifest from '@/components/tracking/DigitalManifest';

// ============================================
// ZENTRA OBSIDIAN: Kinetic Tracking Terminal
// Ultra-Minimalist Fleet Visibility
// ============================================

export default function ShipmentTracking() {
  const { id } = useParams<{ id: string }>();
  const { shipment, carrierProfile, loading: shipmentLoading } = useShipperJobStatus(id || null);
  const { locations, latestLocation, loading: locationLoading } = useShipperTracking(id || null);
  const [isCarrier, setIsCarrier] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && shipment?.carrier_id === user.id) {
        setIsCarrier(true);
      }
    };
    if (shipment) checkRole();
  }, [shipment]);

  if (!id) {
    return (
      <DashboardLayout role="client">
        <div className="flex items-center justify-center min-h-[60vh] text-zinc-600 font-black uppercase text-[10px] tracking-widest">
          ERROR: ID_NOT_FOUND
        </div>
      </DashboardLayout>
    );
  }

  if (shipmentLoading || locationLoading) {
    return (
      <DashboardLayout role="client">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={isCarrier ? "carrier" : "client"}>
      <div className="max-w-md mx-auto space-y-8 pb-32 animate-in fade-in duration-700 font-inter">
        
        {/* HEADER: Dynamic Status */}
        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <div className="space-y-1">
                 <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter italic">Tracking OS</h1>
                 <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">Monitoreo de Carga en Vivo</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                 <Navigation className="w-6 h-6 text-blue-500" />
              </div>
           </div>

           <div className="flex gap-2">
              <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                 <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{shipment?.status.replace('_', ' ')}</span>
              </div>
              {shipment?.is_shared && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full flex items-center gap-2">
                   <Package className="w-3.5 h-3.5 text-emerald-500" />
                   <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Viaje Compartido</span>
                </div>
              )}
           </div>
        </div>

        {/* MAP: Kinetic Element */}
        <div className="h-[450px] -mx-6 md:mx-0 relative">
          <LiveTrackingMap
            locations={locations}
            latestLocation={latestLocation}
            carrierName={carrierProfile?.full_name}
            carrierRating={carrierProfile?.rating}
            carrierPhoto={shipment?.carrier_id ? `https://i.pravatar.cc/150?u=${shipment.carrier_id}` : undefined}
            eta={shipment?.estimated_arrival_time ? new Date(shipment.estimated_arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Calculando..."}
          />
        </div>

        {/* CARRIER ACTIONS / STATS */}
        <div className="space-y-6">
          {isCarrier && shipment && (
            <div className="px-2">
               <CarrierTripControls
                  shipmentId={id}
                  origin={shipment.origin}
                  destination={shipment.destination}
                  deliveryPin={shipment.delivery_pin || undefined}
               />
            </div>
          )}

          {!isCarrier && carrierProfile && (
            <div className="space-y-6">
               {/* Delivery PIN Code Display */}
               {shipment.delivery_pin && shipment.status !== 'delivered' && (
                <Card className="bg-[#060E20] border-blue-500/30 rounded-[40px] p-8 text-center shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                       <ShieldCheck className="w-6 h-6 text-blue-500" />
                    </div>
                    <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em]">PIN de Seguridad ZENTRA</p>
                    <p className="text-6xl font-black text-white tracking-[0.4em] italic font-inter">{shipment.delivery_pin}</p>
                    <p className="text-[8px] text-zinc-700 font-black uppercase tracking-widest leading-relaxed px-10">
                       Confirma este código con el piloto solo al recibir la carga satisfactoriamente.
                    </p>
                  </div>
                </Card>
              )}

              {/* Driver Summary */}
              <Card className="bg-[#060E20] border-white/5 rounded-[40px] p-8 flex items-center justify-between shadow-xl">
                 <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-[22px] bg-zinc-900 border border-white/5 overflow-hidden shadow-lg">
                       <img src={`https://i.pravatar.cc/150?u=${shipment?.carrier_id}`} className="w-full h-full object-cover" />
                    </div>
                    <div>
                       <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1">Tu Piloto ZENTRA</p>
                       <h3 className="text-white font-black text-lg uppercase italic tracking-tight">{carrierProfile.full_name}</h3>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                        <span className="text-xs font-black text-emerald-400">{carrierProfile.rating.toFixed(1)}</span>
                        <Star className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
                    </div>
                 </div>
              </Card>
            </div>
          )}

          {/* DIGITAL MANIFEST: Aurex Vital Control Reference */}
          {shipment?.items && (
            <DigitalManifest 
              items={shipment.items as any[]} 
              readOnly={true} 
            />
          )}

          {/* SHIPMENT DETAILS TICKET */}
          <Card className="bg-[#060E20] border-white/5 rounded-[40px] p-10 space-y-8 shadow-2xl relative overflow-hidden group">
             <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <h3 className="text-white font-black text-xs uppercase tracking-[0.3em]">Manifiesto de Carga</h3>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                   <Hash className="w-3.5 h-3.5 text-zinc-600" />
                </div>
             </div>
             
             <div className="space-y-6">
               {[
                 { label: 'Peso Registrado', value: `${shipment?.weight} KG`, icon: Package },
                 { label: 'Tipo de Carga', value: shipment?.cargo_type, icon: ShieldCheck },
                 { label: 'Inversión', value: `$${shipment?.price?.toLocaleString()}`, icon: Clock },
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between group/item">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover/item:bg-blue-600/10 transition-colors">
                          <item.icon className="w-4 h-4 text-zinc-600 group-hover/item:text-blue-500 transition-colors" />
                       </div>
                       <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{item.label}</p>
                    </div>
                    <p className="text-sm font-black text-white uppercase tracking-tight">{item.value}</p>
                 </div>
               ))}
             </div>

             {shipment?.cargo_photo_url && (
               <div className="pt-6 border-t border-white/5">
                 <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-4">Evidencia Digital (AI Scan)</p>
                 <div className="relative rounded-[32px] overflow-hidden border border-white/10 group-hover:scale-[1.02] transition-transform duration-500">
                    <img src={shipment.cargo_photo_url} className="w-full h-40 object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                    <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay" />
                 </div>
               </div>
             )}
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}

function Star({ className, fill }: { className?: string, fill?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={fill || "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
    );
}
