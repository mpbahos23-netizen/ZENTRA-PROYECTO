import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Payment {
  id: string;
  shipment_id: string;
  amount: number;
  commission: number;
  net_amount: number;
  provider: 'stripe' | 'mercadopago';
  status: 'pending' | 'held' | 'released' | 'refunded' | 'failed';
  created_at: string;
}

// ============================================
// Hook: Create a payment hold via Edge Function
// ============================================
export function useCreatePayment() {
  const [processing, setProcessing] = useState(false);

  const createPayment = useCallback(async (
    shipmentId: string,
    provider: 'stripe' | 'mercadopago' = 'stripe'
  ): Promise<Payment | null> => {
    setProcessing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No autenticado');

      const response = await supabase.functions.invoke('process-payment', {
        body: { shipment_id: shipmentId, provider },
      });

      if (response.error) throw response.error;
      if (!response.data.success) throw new Error(response.data.error);

      toast.success('💳 Pago retenido exitosamente');
      return response.data.payment as Payment;
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar pago');
      return null;
    } finally {
      setProcessing(false);
    }
  }, []);

  return { createPayment, processing };
}

// ============================================
// Hook: Subscribe to payment status (Realtime)
// ============================================
export function usePaymentStatus(shipmentId: string | null) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shipmentId) return;
    let isMounted = true;

    const fetchPayment = async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('shipment_id', shipmentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data && isMounted) {
        setPayment(data as Payment);
      }
      setLoading(false);
    };

    fetchPayment();

    const channel = supabase
      .channel(`payment-status-${shipmentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `shipment_id=eq.${shipmentId}`,
        },
        (payload) => {
          if (isMounted) {
            setPayment(payload.new as Payment);
            if ((payload.new as Payment).status === 'released') {
              toast.success('💰 ¡Pago liberado al transportista!');
            }
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [shipmentId]);

  return { payment, loading };
}
