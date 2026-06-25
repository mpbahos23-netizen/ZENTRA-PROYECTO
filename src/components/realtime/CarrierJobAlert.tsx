import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MapPin, Package, Clock, CheckCircle2,
  XCircle, Truck, Weight, AlertTriangle, Send
} from 'lucide-react';
import { useCarrierJobRequests, useRejectJob } from '@/hooks/useJobRequests';
import type { JobRequest, Shipment } from '@/types/database';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

// ============================================
// CarrierJobAlert: Full-screen overlay with countdown
// Modified for Direct Assignment Acceptance (No bidding)
// ============================================

interface JobAlertCardProps {
  job: JobRequest & { shipment: Shipment };
  onAccepted: () => void;
  onRejected: () => void;
}

function JobAlertCard({ job, onAccepted, onRejected }: JobAlertCardProps) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [accepting, setAccepting] = useState(false);
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

  const handleAcceptJob = useCallback(async () => {
    setAccepting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      // 1. Update job_request → accepted
      const { error: jobError } = await supabase
        .from('job_requests')
        .update({ 
          status: 'accepted',
          responded_at: new Date().toISOString()
        })
        .eq('id', job.id);

      if (jobError) throw jobError;

      // 2. Update shipment → on_route & assign carrier
      const { error: shipmentError } = await supabase
        .from('shipments')
        .update({
          status: 'on_route',
          carrier_id: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', job.shipment_id);

      if (shipmentError) throw shipmentError;

      toast.success("¡Viaje Aceptado!", {
        description: "¡Viaje asignado con éxito! Dirígete al origen para recoger la carga. 🚛🔥",
        duration: 5000,
      });
      onAccepted();
    } catch (error: any) {
      toast.error(error.message || "Error al aceptar el viaje");
    } finally {
      setAccepting(false);
    }
  }, [job.id, job.shipment_id, onAccepted]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 font-inter">
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
          <h2 className="text-xl font-bold text-white mb-1">Nueva Asignación de Carga</h2>
          <div className={`inline-flex items-center gap-2 text-sm font-bold ${urgencyColor}`}>
            <Clock className="w-4 h-4" />
            <span>{timeLeft}s para aceptar viaje</span>
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
              <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Distancia</p>
              <p className="text-lg font-bold text-white">{shipment.distance || 0} KM</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Carga</p>
              <p className="text-lg font-bold text-white">{shipment.weight}kg · {cargoLabels[shipment.cargo_type] || shipment.cargo_type}</p>
            </div>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-3 bg-black/50">
          <Button
            onClick={handleAcceptJob}
            disabled={accepting || rejecting}
            className="w-full h-20 rounded-[32px] bg-[#00e5ff] hover:bg-cyan-400 text-black font-black text-2xl shadow-[0_20px_50px_rgba(0,229,255,0.3)] px-8 uppercase italic tracking-tighter"
          >
            {accepting ? <Clock className="w-8 h-8 animate-spin" /> : <Truck className="w-8 h-8 mr-3" />}
            ACEPTAR VIAJE (GO)
          </Button>
          
          <Button
            onClick={handleReject}
            disabled={rejecting || accepting}
            variant="ghost"
            className="w-full h-12 rounded-xl text-zinc-500 hover:text-red-400 font-bold uppercase text-[10px] tracking-widest"
          >
            RECHAZAR VIAJE
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
  
  useEffect(() => {
    if (activeJob && navigator.vibrate) {
       navigator.vibrate([200, 100, 200, 100, 400]);
    }
  }, [activeJob]);

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
