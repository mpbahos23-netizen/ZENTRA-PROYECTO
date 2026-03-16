import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard, Shield, DollarSign, Loader2,
  CheckCircle2, Clock, Banknote
} from 'lucide-react';
import { useCreatePayment, usePaymentStatus } from '@/hooks/usePayments';

interface PaymentFormProps {
  shipmentId: string;
  totalAmount: number;
  onPaymentComplete?: () => void;
}

const COMMISSION_RATE = 0.08;

export default function PaymentForm({
  shipmentId,
  totalAmount,
  onPaymentComplete,
}: PaymentFormProps) {
  const [provider, setProvider] = useState<'stripe' | 'mercadopago'>('stripe');
  const { createPayment, processing } = useCreatePayment();
  const { payment } = usePaymentStatus(shipmentId);

  const commission = totalAmount * COMMISSION_RATE;
  const netAmount = totalAmount - commission;

  const handlePay = async () => {
    const result = await createPayment(shipmentId, provider);
    if (result) onPaymentComplete?.();
  };

  // If payment is already processed
  if (payment) {
    const statusLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      held: { label: 'Retenido', color: 'text-amber-400', icon: <Clock className="w-5 h-5" /> },
      released: { label: 'Liberado', color: 'text-emerald-400', icon: <CheckCircle2 className="w-5 h-5" /> },
      refunded: { label: 'Reembolsado', color: 'text-blue-400', icon: <Banknote className="w-5 h-5" /> },
      failed: { label: 'Fallido', color: 'text-red-400', icon: <Shield className="w-5 h-5" /> },
    };
    const status = statusLabels[payment.status] || statusLabels.held;

    return (
      <Card className="bg-[#111] border-white/10 rounded-2xl p-6">
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center ${status.color}`}>
            {status.icon}
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Pago {status.label}</h3>
          <p className="text-3xl font-black text-[#00e5ff]">${payment.amount.toFixed(2)}</p>
          <p className="text-xs text-zinc-500 mt-2">
            Comisión MOVIX: ${payment.commission.toFixed(2)} · Neto: ${payment.net_amount.toFixed(2)}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-[#111] border-white/10 rounded-2xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#00e5ff]/10 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-[#00e5ff]" />
        </div>
        <div>
          <h3 className="text-white font-bold">Método de Pago</h3>
          <p className="text-xs text-zinc-500">Selecciona cómo deseas pagar</p>
        </div>
      </div>

      {/* Provider Selection */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setProvider('stripe')}
          className={`p-4 rounded-xl border text-left transition-all ${
            provider === 'stripe'
              ? 'border-[#00e5ff]/50 bg-[#00e5ff]/5'
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className={`w-5 h-5 ${provider === 'stripe' ? 'text-[#00e5ff]' : 'text-zinc-500'}`} />
            <span className="text-sm font-bold text-white">Tarjeta</span>
          </div>
          <p className="text-[10px] text-zinc-500">Visa, Mastercard, AMEX</p>
        </button>

        <button
          onClick={() => setProvider('mercadopago')}
          className={`p-4 rounded-xl border text-left transition-all ${
            provider === 'mercadopago'
              ? 'border-[#00e5ff]/50 bg-[#00e5ff]/5'
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Banknote className={`w-5 h-5 ${provider === 'mercadopago' ? 'text-[#00e5ff]' : 'text-zinc-500'}`} />
            <span className="text-sm font-bold text-white">MercadoPago</span>
          </div>
          <p className="text-[10px] text-zinc-500">OXXO, SPEI, débito</p>
        </button>
      </div>

      {/* Amount Breakdown */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Monto del Envío</span>
          <span className="text-white font-medium">${totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Comisión MOVIX (8%)</span>
          <span className="text-white font-medium">${commission.toFixed(2)}</span>
        </div>
        <Separator className="bg-white/10" />
        <div className="flex justify-between">
          <span className="text-white font-bold">Pago al Transportista</span>
          <span className="text-[#00e5ff] font-bold">${netAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white font-bold text-lg">Total a Pagar</span>
          <span className="text-2xl font-black text-[#00e5ff]">${totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Security Badge */}
      <div className="flex items-center gap-2 bg-white/5 rounded-xl p-3 text-xs text-zinc-400">
        <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Tu pago se retiene hasta confirmar la entrega. Protección total.</span>
      </div>

      <Button
        onClick={handlePay}
        disabled={processing}
        className="w-full h-14 bg-[#00e5ff] hover:bg-[#00cce6] text-black font-bold text-base rounded-xl shadow-lg shadow-[#00e5ff]/20"
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <DollarSign className="w-5 h-5 mr-2" />
            Pagar ${totalAmount.toFixed(2)}
          </>
        )}
      </Button>
    </Card>
  );
}
