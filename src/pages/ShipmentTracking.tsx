import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LiveTrackingMap from '@/components/tracking/LiveTrackingMap';
import CarrierTripControls from '@/components/tracking/CarrierTripControls';
import { useShipperTracking } from '@/hooks/useLocationTracking';
import { useShipperJobStatus } from '@/hooks/useJobRequests';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// ============================================
// ShipmentTracking: Full tracking page for a shipment
// Shows map for shippers, trip controls for carriers
// ============================================
export default function ShipmentTracking() {
  const { id } = useParams<{ id: string }>();
  const { shipment, carrierProfile, loading: shipmentLoading } = useShipperJobStatus(id || null);
  const { locations, latestLocation, loading: locationLoading } = useShipperTracking(id || null);
  const [isCarrier, setIsCarrier] = useState(false);

  // Check if current user is the assigned carrier
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
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh] text-white">
          ID de envío no encontrado
        </div>
      </DashboardLayout>
    );
  }

  if (shipmentLoading || locationLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-[#00e5ff]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white">
              Seguimiento en Tiempo Real
            </h1>
            {shipment?.is_shared && (
              <span className="bg-[#00e5ff]/10 text-[#00e5ff] text-[10px] font-black uppercase px-2 py-1 rounded-md border border-[#00e5ff]/20">
                Viaje Compartido (LTL)
              </span>
            )}
          </div>
          <p className="text-zinc-400 text-sm">
            {shipment?.origin} → {shipment?.destination}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 h-[600px] rounded-2xl overflow-hidden border border-white/10">
            <LiveTrackingMap
              locations={locations}
              latestLocation={latestLocation}
              carrierName={carrierProfile?.full_name}
              carrierRating={carrierProfile?.rating}
              carrierPhoto={shipment?.carrier_id ? `https://i.pravatar.cc/150?u=${shipment.carrier_id}` : undefined}
            />
          </div>

          {/* Controls / Info */}
          <div className="space-y-4">
            {isCarrier && shipment && (
              <CarrierTripControls
                shipmentId={id}
                origin={shipment.origin}
                destination={shipment.destination}
                deliveryPin={shipment.delivery_pin || undefined}
              />
            )}

            {!isCarrier && carrierProfile && (
              <>
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4">
                  <h3 className="text-white font-bold">Tu Conductor</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-[#00e5ff]/30 overflow-hidden">
                      <img
                        src={`https://i.pravatar.cc/150?u=${shipment?.carrier_id}`}
                        alt={carrierProfile.full_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-white font-bold">{carrierProfile.full_name}</p>
                      <p className="text-sm text-zinc-400">⭐ {carrierProfile.rating.toFixed(1)}</p>
                    </div>
                  </div>
                </div>

                {/* Delivery PIN Code Display */}
                {shipment.delivery_pin && shipment.status !== 'delivered' && (
                  <div className="bg-[#00e5ff]/10 border border-[#00e5ff]/30 rounded-2xl p-6 text-center">
                    <p className="text-xs text-[#00e5ff] font-bold uppercase mb-2">PIN de Seguridad para Entrega</p>
                    <p className="text-4xl font-black text-white tracking-widest">{shipment.delivery_pin}</p>
                    <p className="text-xs text-zinc-400 mt-2">Dile este código al conductor cuando reciba la carga.</p>
                  </div>
                )}
              </>
            )}

            {/* Shipment Details */}
            {shipment && (
              <div className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-3">
                <h3 className="text-white font-bold">Detalles del Envío</h3>
                {[
                  { label: 'Estado', value: shipment.status.replace('_', ' '), highlight: true },
                  { label: 'Peso', value: `${shipment.weight} kg` },
                  { label: 'Tipo', value: shipment.cargo_type },
                  { label: 'Precio', value: `$${shipment.price?.toFixed(2)}` },
                  { label: 'Distancia', value: shipment.distance ? `${shipment.distance} km` : 'N/A' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400">{item.label}</span>
                    <span className={item.highlight ? 'text-[#00e5ff] font-bold capitalize' : 'text-white font-medium'}>
                      {item.value}
                    </span>
                  </div>
                ))}
                {shipment.cargo_photo_url && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase mb-2">Imagen de la Carga (AI Scan)</p>
                    <img 
                      src={shipment.cargo_photo_url} 
                      className="w-full h-32 object-cover rounded-xl border border-white/10"
                      alt="Carga"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
