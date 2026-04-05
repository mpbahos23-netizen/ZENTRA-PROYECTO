import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LiveTrackingMap from '@/components/tracking/LiveTrackingMap';
import CarrierTripControls from '@/components/tracking/CarrierTripControls';
import { useShipperTracking } from '@/hooks/useLocationTracking';
import { useShipperJobStatus } from '@/hooks/useJobRequests';
import { Loader2, ShieldCheck, MapPin, Hash, Package, Clock, Navigation } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import DigitalManifest from '@/components/tracking/DigitalManifest';

// ============================================
// ZENTRA: Kinetic Tracking Terminal
// Mobile-first Fleet Visibility
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
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Conectando al satélite...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Build origin/destination stops from shipment data
  const stops = shipment?.origin && shipment?.destination
    ? [
        { lat: 19.4326, lng: -99.1332, type: 'pickup' as const, label: 'A' }, // Placeholder - would be geocoded
        { lat: 19.4284, lng: -99.1276, type: 'dropoff' as const, label: 'B' },
      ]
    : [];

  const etaFormatted = shipment?.estimated_arrival_time
    ? new Date(shipment.estimated_arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : undefined;

  return (
    <DashboardLayout role={isCarrier ? "carrier" : "client"}>
      <div className="max-w-2xl mx-auto space-y-6 pb-4 animate-in fade-in duration-500">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Tracking OS</h1>
            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">Monitoreo en Vivo</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 border ${
              shipment?.status === 'in_transit'
                ? 'bg-blue-500/10 border-blue-500/20'
                : 'bg-zinc-800/50 border-white/10'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${shipment?.status === 'in_transit' ? 'bg-blue-500 animate-pulse' : 'bg-zinc-500'}`} />
              <span className="text-[9px] font-black uppercase tracking-widest text-white">
                {shipment?.status?.replace(/_/g, ' ') || 'Cargando'}
              </span>
            </div>
          </div>
        </div>

        {/* MAP — takes 50% of viewport height on mobile, taller on desktop */}
        <div className="h-[50dvh] md:h-[60vh] min-h-[300px] -mx-4 md:mx-0 rounded-none md:rounded-[32px] overflow-hidden">
          <LiveTrackingMap
            locations={locations}
            latestLocation={latestLocation}
            carrierName={isCarrier ? undefined : carrierProfile?.full_name}
            carrierRating={isCarrier ? undefined : carrierProfile?.rating}
            carrierPhoto={shipment?.carrier_id ? `https://i.pravatar.cc/150?u=${shipment.carrier_id}` : undefined}
            eta={etaFormatted}
            stops={stops}
          />
        </div>

        {/* ROUTE INFO BAR */}
        {shipment && (
          <Card className="bg-[#060E20] border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <span className="text-xs font-bold text-white truncate">{shipment.origin}</span>
              </div>
              <Navigation className="w-4 h-4 text-zinc-600 shrink-0" />
              <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                <span className="text-xs font-bold text-white truncate text-right">{shipment.destination}</span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              </div>
            </div>
          </Card>
        )}

        {/* CARRIER CONTROLS (carrier only) */}
        {isCarrier && shipment && (
          <CarrierTripControls
            shipmentId={id}
            origin={shipment.origin}
            destination={shipment.destination}
            deliveryPin={shipment.delivery_pin || undefined}
          />
        )}

        {/* CLIENT VIEW: Security PIN + Driver card */}
        {!isCarrier && carrierProfile && (
          <div className="space-y-4">
            {shipment?.delivery_pin && shipment?.status !== 'delivered' && (
              <Card className="bg-[#060E20] border-blue-500/30 rounded-[32px] p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <ShieldCheck className="w-6 h-6 text-blue-500" />
                  </div>
                  <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em]">PIN de Seguridad</p>
                  <p className="text-5xl font-black text-white tracking-[0.4em]">{shipment.delivery_pin}</p>
                  <p className="text-[9px] text-zinc-700 font-black uppercase tracking-widest leading-relaxed px-6">
                    Confirma este código al recibir tu carga.
                  </p>
                </div>
              </Card>
            )}

            <Card className="bg-[#060E20] border-white/5 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden">
                  <img src={`https://i.pravatar.cc/150?u=${shipment?.carrier_id}`} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-0.5">Tu Piloto</p>
                  <h3 className="text-white font-black text-sm uppercase tracking-tight">{carrierProfile.full_name}</h3>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <span className="text-xs font-black text-emerald-400">{carrierProfile.rating?.toFixed(1)}</span>
                <StarIcon className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
              </div>
            </Card>
          </div>
        )}

        {/* DIGITAL MANIFEST */}
        {shipment?.items && (
          <DigitalManifest items={shipment.items as any[]} readOnly={true} />
        )}

        {/* SHIPMENT DETAILS */}
        <Card className="bg-[#060E20] border-white/5 rounded-[32px] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-white font-black text-xs uppercase tracking-[0.3em]">Manifiesto</h3>
            <Hash className="w-4 h-4 text-zinc-700" />
          </div>

          <div className="space-y-4">
            {[
              { label: 'Peso', value: `${shipment?.weight} KG`, icon: Package },
              { label: 'Tipo de Carga', value: shipment?.cargo_type, icon: ShieldCheck },
              { label: 'Valor del Servicio', value: `$${shipment?.price?.toLocaleString()}`, icon: Clock },
              ...(etaFormatted ? [{ label: 'ETA', value: etaFormatted, icon: MapPin }] : []),
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-zinc-600" />
                  </div>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{item.label}</p>
                </div>
                <p className="text-sm font-black text-white uppercase tracking-tight">{item.value}</p>
              </div>
            ))}
          </div>

          {shipment?.cargo_photo_url && (
            <div className="pt-4 border-t border-white/5">
              <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-3">Foto de Carga</p>
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <img
                  src={shipment.cargo_photo_url}
                  className="w-full h-36 object-cover"
                  alt="Cargo"
                />
              </div>
            </div>
          )}
        </Card>

      </div>
    </DashboardLayout>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
