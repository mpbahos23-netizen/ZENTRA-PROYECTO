import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  MapPin, Package, Clock, DollarSign, CheckCircle2,
  XCircle, Truck, Weight, AlertTriangle, Send
} from 'lucide-react';
import { useCarrierJobRequests, useSubmitBid, useRejectJob } from '@/hooks/useJobRequests';
import type { JobRequest, Shipment } from '@/types/database';
import { toast } from 'sonner';

// ============================================
// CarrierJobAlert: Full-screen overlay with countdown
// Modified for the new Auction System (Bidding)
// ============================================

interface JobAlertCardProps {
  job: JobRequest & { shipment: Shipment };
  onAccepted: () => void;
  onRejected: () => void;
}

function JobAlertCard({ job, onAccepted, onRejected }: JobAlertCardProps) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [bidAmount, setBidAmount] = useState<string>(job.shipment.price?.toString() || "");
  const [bidMessage, setBidMessage] = useState("");
  const { submitBid, submitting } = useSubmitBid();
  const { rejectJob, rejecting } = useRejectJob();

  useEffect(() => {
    const expiresAt = new Date(job.expires_at).getTime();
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((expiresAt - now) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        onRejected();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [job.expires_at, onRejected]);

  const handleSubmitBid = useCallback(async () => {
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    const success = await submitBid(job.id, job.shipment_id, amount, bidMessage);
    if (success) {
      onAccepted();
      toast.success("¡Oferta Enviada!", {
        description: "Eres el motor de la industria. Confía en tu profesionalismo, ¡este viaje puede ser tuyo! 🚛✨",
        duration: 5000,
      });
    }
  }, [submitBid, job.id, job.shipment_id, bidAmount, bidMessage, onAccepted]);

  const handleReject = useCallback(async () => {
    const success = await rejectJob(job.id);
    if (success) onRejected();
  }, [rejectJob, job.id, onRejected]);

  const { shipment } = job;
  const urgencyColor = timeLeft <= 10 ? 'text-red-400' : timeLeft <= 20 ? 'text-amber-400' : 'text-[#00e5ff]';
  const progressPercent = (timeLeft / 30) * 100;

  const cargoLabels: Record<string, string> = {
    standard: 'Estándar',
    fragile: 'Frágil',
    perishable: 'Perecedero',
    hazardous: 'Peligroso',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <Card className="w-full max-w-lg mx-4 bg-[#0a0a0a] border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="h-1.5 bg-white/5">
          <div
            className={`h-full transition-all duration-1000 ease-linear rounded-full ${
              timeLeft <= 10 ? 'bg-red-500' : timeLeft <= 20 ? 'bg-amber-500' : 'bg-[#00e5ff]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="p-6 pb-4 text-center border-b border-white/5">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-teal-gradient flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Truck className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Subasta de Carga en Vivo</h2>
          <div className={`inline-flex items-center gap-2 text-sm font-bold ${urgencyColor}`}>
            <Clock className="w-4 h-4" />
            <span>{timeLeft}s para enviar oferta</span>
          </div>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Route Info */}
          <div className="bg-white/5 rounded-2xl p-4 space-y-3">
             <div className="flex items-center gap-3">
               <div className="w-2.5 h-2.5 rounded-full bg-[#00e5ff]" />
               <p className="text-sm font-medium text-white">{shipment.origin}</p>
             </div>
             <div className="w-px h-4 bg-white/20 ml-[5px]" />
             <div className="flex items-center gap-3">
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
               <p className="text-sm font-medium text-white">{shipment.destination}</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Presupuesto Sugerido</p>
              <p className="text-lg font-bold text-white">${shipment.price?.toFixed(0)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Carga</p>
              <p className="text-lg font-bold text-white">{shipment.weight}kg · {cargoLabels[shipment.cargo_type] || shipment.cargo_type}</p>
            </div>
          </div>

          {/* Bid Form */}
          <div className="space-y-4 border-t border-white/5 pt-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Tu Oferta de Precio ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input 
                  type="number"
                  className="bg-black border-white/10 pl-9 h-12 text-white font-bold"
                  value={bidAmount}
                  onChange={e => setBidAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Mensaje (Opcional)</label>
              <Textarea 
                placeholder="Ej: Camión disponible ahora mismo..."
                className="bg-black border-white/10 text-white min-h-[80px]"
                value={bidMessage}
                onChange={e => setBidMessage(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="p-6 flex gap-3 bg-black/50">
          <Button
            onClick={handleReject}
            disabled={rejecting || submitting}
            variant="outline"
            className="flex-1 h-14 rounded-xl border-white/10 bg-white/5 text-zinc-300 hover:bg-red-500/10 hover:text-red-400 font-bold"
          >
            <XCircle className="w-5 h-5 mr-2" />
            Pasar
          </Button>
          <Button
            onClick={handleSubmitBid}
            disabled={submitting || rejecting || !bidAmount}
            className="flex-2 h-14 rounded-xl bg-teal-gradient hover:opacity-90 text-black font-bold text-base shadow-lg shadow-teal-500/20 px-8"
          >
            {submitting ? <Clock className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
            Enviar Oferta
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function CarrierJobAlert() {
  const { pendingJobs } = useCarrierJobRequests();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const activeJob = pendingJobs.find(j => !dismissed.has(j.id));
  if (!activeJob) return null;

  return (
    <JobAlertCard
      key={activeJob.id}
      job={activeJob}
      onAccepted={() => setDismissed(prev => new Set(prev).add(activeJob.id))}
      onRejected={() => setDismissed(prev => new Set(prev).add(activeJob.id))}
    />
  );
}
