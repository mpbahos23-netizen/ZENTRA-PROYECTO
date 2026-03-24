import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Truck, 
  MapPin, 
  Star, 
  ArrowRight, 
  Loader2, 
  DollarSign, 
  MessageSquare, 
  Check, 
  Wifi, 
  Sparkles,
  Zap,
  ChevronRight,
  ShieldCheck,
  Package
} from 'lucide-react';
import { useShipperJobStatus, useShipmentBids, useSelectWinner } from '@/hooks/useJobRequests';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { cn } from '@/lib/utils';

// ============================================
// ZENTRA OBSIDIAN: Live Auction Terminal
// Ultra-Minimalist Matching Experience
// ============================================

interface ShipperSearchingProps {
  shipmentId: string;
}

export default function ShipperSearching({ shipmentId }: ShipperSearchingProps) {
  const { shipment, carrierProfile, loading: statusLoading } = useShipperJobStatus(shipmentId);
  const { bids, loading: bidsLoading } = useShipmentBids(shipmentId);
  const { selectWinner, selecting } = useSelectWinner();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<string[]>(["[AI] Inicializando protocolos Zentra OS...", "[AI] Escaneando red de transportistas..."]);

  useEffect(() => {
    const newLogs = [
      "[AI] Analizando rutas óptimas...",
      "[AI] 14 transportistas detectados a menos de 10km.",
      "[AI] Esperando ofertas competitivas...",
      "[AI] Encriptación de datos segura activa.",
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < newLogs.length) {
        setLogs(prev => [...prev.slice(-3), newLogs[i]]);
        i++;
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const isBiddingPhase = shipment?.status === 'searching' || shipment?.status === 'bidding';
  const isAssigned = shipment?.status === 'carrier_selected' || shipment?.status === 'accepted' || shipment?.status === 'in_transit';

  if (statusLoading) {
    return (
      <DashboardLayout role="client">
        <div className="flex items-center justify-center min-vh-100">
           <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="client">
      <div className="max-w-md mx-auto space-y-10 pb-32 animate-in fade-in duration-1000 font-inter">
        
        {/* HEADER: Live Status */}
        <div className="space-y-6 text-center">
            <div className="inline-flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 px-6 py-2 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.1)]">
               <Wifi className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
               <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Subasta ZENTRA en Vivo</span>
            </div>
            
            <div className="space-y-2">
                <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                    {isBiddingPhase ? 'Buscando Piloto' : 'Trato Cerrado'}
                </h1>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                    {isBiddingPhase ? 'Analizando ofertas en tiempo real' : 'Transportista asignado correctamente'}
                </p>
            </div>
        </div>

        {/* TACTICAL LOGS (AI TERMINAL) */}
        {isBiddingPhase && (
            <div className="bg-black/40 border border-white/5 rounded-[32px] p-6 font-mono text-[9px] space-y-2 shadow-2xl overflow-hidden relative group">
               <div className="absolute top-0 right-0 p-4">
                  <Sparkles className="w-3 h-3 text-blue-500/40" />
               </div>
               {logs.map((log, i) => (
                  <div key={i} className={cn(
                    "flex gap-3 transition-all duration-500",
                    i === logs.length - 1 ? "text-blue-500 opacity-100" : "text-zinc-700 opacity-40"
                  )}>
                     <span className="shrink-0">{">"}</span>
                     <p className="uppercase tracking-widest">{log}</p>
                  </div>
               ))}
               <div className="w-full h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 mt-4 animate-pulse" />
            </div>
        )}

        {/* SHIPMENT SUMMARY TICKET */}
        <Card className="bg-[#060E20] border-white/5 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
            <div className="flex justify-between items-center mb-8">
               <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Package className="w-6 h-6 text-zinc-500" />
               </div>
               <div className="text-right">
                  <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">ID de Envío</p>
                  <p className="text-xs font-black text-white uppercase font-mono tracking-tighter">{shipmentId.slice(0, 12)}</p>
               </div>
            </div>
            <div className="flex items-center gap-6">
               <div className="flex-1 space-y-1">
                  <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest leading-none">Origen</p>
                  <h3 className="text-white font-black text-sm tracking-tight line-clamp-1">{shipment?.origin}</h3>
               </div>
               <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <ArrowRight className="w-4 h-4 text-blue-500" />
               </div>
               <div className="flex-1 space-y-1 text-right">
                  <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest leading-none">Destino</p>
                  <h3 className="text-emerald-400 font-black text-sm tracking-tight line-clamp-1">{shipment?.destination}</h3>
               </div>
            </div>
        </Card>

        {/* BIDS SECTION */}
        <div className="space-y-6">
            <div className="flex justify-between items-center px-4">
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ofertas Recibidas ({bids.length})</p>
               <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-blue-500" />
                  <div className="w-1 h-1 rounded-full bg-blue-500/40" />
                  <div className="w-1 h-1 rounded-full bg-blue-500/20" />
               </div>
            </div>

            {isBiddingPhase && bids.length === 0 ? (
               <div className="text-center py-20 px-10 space-y-4 bg-white/5 border border-dashed border-white/5 rounded-[48px]">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500/20" />
                  <p className="text-[10px] text-zinc-700 font-black uppercase tracking-widest leading-relaxed">
                     Zentra AI está filtrando los mejores pilotos activos cerca de ti.
                  </p>
               </div>
            ) : isBiddingPhase ? (
               <div className="space-y-4">
                  {bids.map((bid) => (
                    <button 
                      key={bid.id}
                      onClick={() => selectWinner(bid.id, shipmentId, bid.carrier_id!, bid.bid_amount!)}
                      disabled={selecting}
                      className="w-full bg-[#060E20] border border-white/5 rounded-[48px] p-8 hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden group text-left shadow-2xl hover:scale-[1.02] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 rounded-[28px] bg-zinc-900 border border-white/5 overflow-hidden shadow-xl ring-2 ring-blue-500/10 group-hover:ring-blue-500/30 transition-all">
                            <img src={`https://i.pravatar.cc/150?u=${bid.carrier_id}`} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                         </div>
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <h4 className="text-white font-black text-lg tracking-tight uppercase italic">{bid.profile?.full_name}</h4>
                               {bid.profile?.rating && (
                                  <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                     <Star className="w-2.5 h-2.5 text-emerald-500 fill-emerald-500" />
                                     <span className="text-[9px] font-black text-emerald-400 tracking-tighter">{bid.profile.rating.toFixed(1)}</span>
                                  </div>
                               )}
                            </div>
                            <div className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                               <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                               <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Piloto Verificado</span>
                            </div>
                         </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-3">
                         <div className="bg-white text-black px-6 py-3 rounded-[24px] font-black text-lg italic shadow-[0_10px_20px_rgba(255,255,255,0.05)] group-hover:scale-110 transition-transform">
                            ${bid.bid_amount?.toLocaleString()}
                         </div>
                         <div className="flex items-center gap-2 text-zinc-700 group-hover:text-blue-500 transition-colors uppercase font-black text-[9px] tracking-widest">
                            Aceptar <ChevronRight className="w-3 h-3" />
                         </div>
                      </div>
                    </button>
                  ))}
               </div>
            ) : isAssigned && carrierProfile && (
               <Card className="bg-[#060E20] border-emerald-500/30 rounded-[48px] p-10 text-center animate-in zoom-in duration-500 shadow-2xl group border-l-4 border-l-emerald-500">
                  <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                      <Check className="w-10 h-10 text-emerald-400" strokeWidth={3} />
                  </div>
                  <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">¡Unidad Asignada!</h2>
                  <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-10 leading-relaxed px-6">
                    El transportista ha sido confirmado para tu carga.
                  </p>

                  <div className="bg-white/5 border border-white/5 rounded-[40px] p-8 mb-10 overflow-hidden relative">
                      <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-[28px] bg-zinc-900 border border-white/5 overflow-hidden shadow-xl ring-2 ring-emerald-500/20">
                              <img src={`https://i.pravatar.cc/150?u=${shipment?.carrier_id}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="text-left">
                              <h3 className="text-lg font-black text-white uppercase italic tracking-tight">{carrierProfile.full_name}</h3>
                              <div className="flex items-center gap-2 mt-2">
                                  <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                     <Star className="w-2.5 h-2.5 text-emerald-500 fill-emerald-500" />
                                     <span className="text-[9px] font-black text-emerald-400 tracking-tighter">{carrierProfile.rating.toFixed(1)}</span>
                                  </div>
                                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Unidad Z-904</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  <Button
                      onClick={() => navigate(`/shipment/${shipmentId}/tracking`)}
                      className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] text-xs rounded-[32px] shadow-[0_15px_40px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-3"
                  >
                      Rastrear Unidad <Navigation className="w-4 h-4 fill-white" />
                  </Button>
               </Card>
            )}
        </div>

      </div>
    </DashboardLayout>
  );
}
