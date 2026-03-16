import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, MapPin, Star, ArrowRight, Loader2, DollarSign, MessageSquare, Check } from 'lucide-react';
import { useShipperJobStatus, useShipmentBids, useSelectWinner } from '@/hooks/useJobRequests';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

// ============================================
// ShipperSearching: Modified for Auctions
// Shippers wait for bids and choose a carrier
// ============================================

interface ShipperSearchingProps {
  shipmentId: string;
}

export default function ShipperSearching({ shipmentId }: ShipperSearchingProps) {
  const { shipment, carrierProfile, loading: statusLoading } = useShipperJobStatus(shipmentId);
  const { bids, loading: bidsLoading } = useShipmentBids(shipmentId);
  const { selectWinner, selecting } = useSelectWinner();
  const navigate = useNavigate();
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const isBiddingPhase = shipment?.status === 'searching' || shipment?.status === 'bidding';
  const isAssigned = shipment?.status === 'carrier_selected' || shipment?.status === 'accepted' || shipment?.status === 'in_transit';

  if (statusLoading) {
    return (
      <DashboardLayout role="client">
        <div className="flex items-center justify-center min-vh-100">
          <Loader2 className="w-10 h-10 animate-spin text-[#00e5ff]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="client">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header Summary */}
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
                {isBiddingPhase ? `Subasta en Vivo${dots}` : '¡Conductor Seleccionado!'}
            </h1>
            <p className="text-zinc-400">
                {isBiddingPhase 
                    ? 'Los transportistas están enviando sus mejores ofertas para tu envío.'
                    : 'Tu envío ya tiene un transportista asignado y está listo para empezar.'}
            </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            {/* Left: Shipment Info */}
            <div className="md:col-span-1 space-y-6">
                <Card className="bg-[#111] border-white/10 rounded-2xl p-6">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#00e5ff]" />
                        Detalles del Envío
                    </h3>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <div className="w-2 h-2 rounded-full bg-[#00e5ff]" />
                                <div className="w-px h-6 bg-white/10" />
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            </div>
                            <div className="space-y-3">
                                <p className="text-sm text-zinc-300 line-clamp-1">{shipment?.origin}</p>
                                <p className="text-sm text-zinc-300 line-clamp-1">{shipment?.destination}</p>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-white/5 space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-zinc-500">PRESUPUESTO</span>
                                <span className="text-white font-bold">${shipment?.price}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-zinc-500">PESO</span>
                                <span className="text-white font-bold">{shipment?.weight}kg</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {isBiddingPhase && (
                    <div className="bg-[#00e5ff]/5 border border-[#00e5ff]/20 rounded-2xl p-6 text-center">
                        <div className="relative w-16 h-16 mx-auto mb-4">
                            <div className="absolute inset-0 bg-[#00e5ff]/20 animate-ping rounded-full" />
                            <div className="relative w-16 h-16 bg-[#0a0a0a] border border-[#00e5ff]/30 rounded-full flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-[#00e5ff] animate-spin" />
                            </div>
                        </div>
                        <p className="text-sm text-white font-medium">Esperando más ofertas</p>
                        <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold">Tiempo real activo</p>
                    </div>
                )}
            </div>

            {/* Main: Bids or Assigned Carrier */}
            <div className="md:col-span-2 space-y-4">
                {isBiddingPhase && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-bold text-white">Ofertas Recibidas ({bids.length})</h2>
                            <span className="text-xs text-zinc-500">Licitación competitiva</span>
                        </div>

                        {bids.length === 0 ? (
                            <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-12 text-center text-zinc-500">
                                <p>Aún no hay ofertas. Mantén esta pantalla abierta.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {bids.map((bid) => (
                                    <Card key={bid.id} className="bg-[#111] border-white/10 hover:border-[#00e5ff]/30 transition-all rounded-3xl p-6">
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-white/10 overflow-hidden ring-2 ring-[#00e5ff]/20">
                                                    <img 
                                                        src={`https://i.pravatar.cc/150?u=${bid.carrier_id}`} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold text-lg">{bid.profile?.full_name}</h4>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                        <span className="text-sm font-semibold text-white">{bid.profile?.rating.toFixed(1)}</span>
                                                        <span className="text-[10px] text-zinc-500 ml-2 bg-white/5 px-2 py-0.5 rounded uppercase font-bold">Verificado</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-2xl font-black text-[#00e5ff] tracking-tight">${bid.bid_amount}</p>
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase">Precio Ofertado</p>
                                            </div>
                                        </div>

                                        {bid.bid_message && (
                                            <div className="mt-4 bg-white/5 rounded-xl p-3 flex gap-2">
                                                <MessageSquare className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                                                <p className="text-sm text-zinc-400 italic">"{bid.bid_message}"</p>
                                            </div>
                                        )}

                                        <Button 
                                            onClick={() => selectWinner(bid.id, shipmentId, bid.carrier_id!, bid.bid_amount!)}
                                            disabled={selecting}
                                            className="w-full mt-6 h-12 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl"
                                        >
                                            {selecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5 mr-2" />}
                                            Aceptar Oferta
                                        </Button>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {isAssigned && carrierProfile && (
                    <Card className="bg-[#111] border-[#00e5ff]/20 rounded-3xl p-10 text-center animate-in zoom-in duration-500">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                            <Check className="w-10 h-10 text-emerald-400" strokeWidth={3} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">¡Trato Cerrado!</h2>
                        <p className="text-zinc-400 mb-8">El transportista ha sido confirmado y está listo para la carga.</p>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-[#00e5ff]/30 overflow-hidden">
                                    <img
                                        src={`https://i.pravatar.cc/150?u=${shipment?.carrier_id}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-lg font-bold text-white">{carrierProfile.full_name}</h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                        <span className="text-sm font-semibold text-white">{carrierProfile.rating.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={() => navigate(`/shipment/${shipmentId}/tracking`)}
                            className="w-full h-14 bg-teal-gradient hover:opacity-90 text-black font-bold text-base rounded-xl shadow-lg"
                        >
                            <ArrowRight className="w-5 h-5 mr-2" />
                            Ir al Seguimiento en Tiempo Real
                        </Button>
                    </Card>
                )}
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
