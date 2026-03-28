import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, MapPin, Package, CheckCircle2, Loader2, Navigation, ShieldCheck, Clock } from 'lucide-react';
import { useCarrierGPS, useUpdateShipmentStatus, useUpdateShipmentETA } from '@/hooks/useLocationTracking';
import { toast } from 'sonner';

// ============================================
// CarrierTripControls: Carrier-side trip management
// - Start trip (begins GPS broadcasting)
// - Trip progress indicator
// - Confirm delivery with PIN
// ============================================

type TripPhase = 'ready' | 'heading_to_pickup' | 'picked_up' | 'in_transit' | 'delivered';

const phases: { key: TripPhase; label: string; icon: React.ReactNode }[] = [
  { key: 'ready', label: 'Listo', icon: <Play className="w-4 h-4" /> },
  { key: 'heading_to_pickup', label: 'Hacia recogida', icon: <Navigation className="w-4 h-4" /> },
  { key: 'picked_up', label: 'Carga recogida', icon: <Package className="w-4 h-4" /> },
  { key: 'in_transit', label: 'En ruta', icon: <MapPin className="w-4 h-4" /> },
  { key: 'delivered', label: 'Entregado', icon: <CheckCircle2 className="w-4 h-4" /> },
];

interface CarrierTripControlsProps {
  shipmentId: string;
  origin: string;
  destination: string;
  deliveryPin?: string;
  onDelivered?: () => void;
}

export default function CarrierTripControls({
  shipmentId,
  origin,
  destination,
  deliveryPin,
  onDelivered,
}: CarrierTripControlsProps) {
  const [phase, setPhase] = useState<TripPhase>('ready');
  const [showPinInput, setShowPinInput] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [etaTime, setEtaTime] = useState('');
  const { updateStatus, updating } = useUpdateShipmentStatus();
  const { updateETA, updating: updatingETA } = useUpdateShipmentETA();

  const isGpsActive = phase !== 'ready' && phase !== 'delivered';
  const { currentPosition, sending } = useCarrierGPS(shipmentId, isGpsActive);

  const currentPhaseIndex = phases.findIndex(p => p.key === phase);

  const handleStartTrip = async () => {
    const success = await updateStatus(shipmentId, 'in_transit');
    if (success) {
      setPhase('heading_to_pickup');
    }
  };

  const handleNextPhase = () => {
    const nextPhases: Record<string, TripPhase> = {
      heading_to_pickup: 'picked_up',
      picked_up: 'in_transit',
    };
    const next = nextPhases[phase];
    if (next) setPhase(next);
  };

  const handleConfirmClick = () => {
    if (deliveryPin) {
      setShowPinInput(true);
    } else {
      // Legacy shipments without PIN
      submitDelivery();
    }
  };

  const submitDelivery = async () => {
    if (deliveryPin && enteredPin !== deliveryPin) {
      toast.error('PIN incorrecto', { description: 'Pídele al cliente el PIN de 4 dígitos.' });
      return;
    }

    const success = await updateStatus(shipmentId, 'delivered');
    if (success) {
      setPhase('delivered');
      setShowPinInput(false);
      onDelivered?.();
    }
  };

  const handleSetETA = async () => {
    if (!etaTime) return;
    const now = new Date();
    const [hours, minutes] = etaTime.split(':');
    const arrival = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours), parseInt(minutes));
    
    // If arrival is before now, assume it's for tomorrow
    if (arrival < now) arrival.setDate(arrival.getDate() + 1);

    const success = await updateETA(shipmentId, arrival.toISOString());
    if (success) {
      toast.success('⌛ ETA actualizado', { description: 'El cliente ha sido notificado.' });
      setEtaTime('');
    }
  };

  return (
    <Card className="bg-[#111] border-white/10 rounded-2xl overflow-hidden">
      {/* Progress Bar */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          {phases.map((p, i) => (
            <div key={p.key} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                  i <= currentPhaseIndex
                    ? 'bg-[#00e5ff] text-black'
                    : 'bg-white/5 text-zinc-500'
                }`}
              >
                {p.icon}
              </div>
              {i < phases.length - 1 && (
                <div
                  className={`w-8 sm:w-14 h-0.5 mx-1 transition-all ${
                    i < currentPhaseIndex ? 'bg-[#00e5ff]' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-center text-zinc-400">
          {phases[currentPhaseIndex]?.label}
        </p>
      </div>

      {/* Route Info */}
      <div className="px-6 pb-4">
        <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00e5ff]" />
            <span className="text-white font-medium">{origin}</span>
          </div>
          <span className="text-zinc-500">→</span>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-white font-medium">{destination}</span>
          </div>
        </div>
      </div>

      {/* GPS Status */}
      {isGpsActive && (
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className={`w-2 h-2 rounded-full ${sending ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span>
              {currentPosition
                ? `GPS: ${currentPosition.lat.toFixed(4)}, ${currentPosition.lng.toFixed(4)}`
                : 'Esperando señal GPS...'}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-6 pt-2">
        {phase === 'ready' && (
          <Button
            onClick={handleStartTrip}
            disabled={updating}
            className="w-full h-14 bg-[#00e5ff] hover:bg-[#00cce6] text-black font-bold text-base rounded-xl shadow-lg shadow-[#00e5ff]/20"
          >
            {updating ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Play className="w-5 h-5 mr-2" />
            )}
            Iniciar Viaje
          </Button>
        )}

        {(phase === 'heading_to_pickup' || phase === 'picked_up') && (
          <Button
            onClick={handleNextPhase}
            className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white font-bold text-base rounded-xl"
          >
            {phase === 'heading_to_pickup' ? (
              <>
                <Package className="w-5 h-5 mr-2" />
                Confirmar Recogida
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5 mr-2" />
                En Ruta al Destino
              </>
            )}
          </Button>
        )}

        {(phase === 'picked_up' || phase === 'in_transit') && (
          <div className="mt-4 p-4 bg-white/5 border border-white/5 rounded-xl border-dashed">
             <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-500" /> Estimar tiempo de arribo
             </p>
             <div className="flex gap-2">
                <Input 
                  type="time" 
                  value={etaTime}
                  onChange={(e) => setEtaTime(e.target.value)}
                  className="bg-black border-white/10 text-white h-12 rounded-xl text-sm"
                />
                <Button 
                  onClick={handleSetETA}
                  disabled={updatingETA || !etaTime}
                  className="bg-blue-600/20 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest px-4 h-12 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                >
                   Definir
                </Button>
             </div>
          </div>
        )}

        {phase === 'in_transit' && !showPinInput && (
          <Button
            onClick={handleConfirmClick}
            disabled={updating}
            className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base rounded-xl"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Confirmar Entrega
          </Button>
        )}

        {/* PIN Input Stage */}
        {phase === 'in_transit' && showPinInput && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-[#00e5ff]/10 border border-[#00e5ff]/30 rounded-xl p-4 text-center">
              <ShieldCheck className="w-6 h-6 text-[#00e5ff] mx-auto mb-2" />
              <p className="text-sm text-white font-medium mb-1">Verificación de PIN</p>
              <p className="text-xs text-zinc-400 mb-4">Pídele al cliente el código de 4 dígitos para liberar el pago.</p>
              
              <Input
                type="text"
                maxLength={4}
                placeholder="0000"
                className="bg-black border-white/20 text-center text-2xl tracking-widest h-14 font-black mb-3 text-white focus:border-[#00e5ff]"
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
              />
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
                  onClick={() => setShowPinInput(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={submitDelivery}
                  disabled={updating || enteredPin.length !== 4}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                >
                  {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Verificar'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {phase === 'delivered' && (
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white">¡Entrega Completada!</h3>
            <p className="text-sm text-zinc-400 mt-1">Gracias por tu servicio profesional.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
