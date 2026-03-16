import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { JobRequest, Shipment } from '@/types/database';
import { toast } from 'sonner';

// ============================================
// Hook: Listen for incoming job requests (Carrier side)
// ============================================
export function useCarrierJobRequests() {
  const [pendingJobs, setPendingJobs] = useState<(JobRequest & { shipment: Shipment })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchInitialJobs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('job_requests')
        .select('*, shipment:shipments(*)')
        .or(`carrier_id.is.null,carrier_id.eq.${user.id}`)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching job requests:', error);
        return;
      }

      if (isMounted && data) {
        setPendingJobs(data as (JobRequest & { shipment: Shipment })[]);
      }
      setLoading(false);
    };

    fetchInitialJobs();

    const channel = supabase
      .channel('carrier-job-requests')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'job_requests',
        },
        async (payload) => {
          const newJob = payload.new as JobRequest;
          const { data: shipment } = await supabase
            .from('shipments')
            .select('*')
            .eq('id', newJob.shipment_id)
            .single();

          if (shipment && isMounted) {
            setPendingJobs(prev => [
              { ...newJob, shipment: shipment as Shipment },
              ...prev,
            ]);
            toast.info('🚛 ¡Nueva solicitud de viaje!');
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'job_requests',
        },
        (payload) => {
          const updated = payload.new as JobRequest;
          if (isMounted) {
            setPendingJobs(prev =>
              prev
                .map(j => (j.id === updated.id ? { ...j, ...updated } : j))
                .filter(j => j.status === 'pending')
            );
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { pendingJobs, loading };
}

// ============================================
// Hook: Submit a bid for a job (Carrier side)
// ============================================
export function useSubmitBid() {
  const [submitting, setSubmitting] = useState(false);

  const submitBid = useCallback(async (jobId: string, shipmentId: string, amount: number, message: string) => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      // 1. Update job_request → bid_submitted
      const { error: jobError } = await supabase
        .from('job_requests')
        .update({
          status: 'bid_submitted',
          carrier_id: user.id,
          bid_amount: amount,
          bid_message: message,
          responded_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      if (jobError) throw jobError;

      // 2. Update shipment → bidding (if it was searching)
      await supabase
        .from('shipments')
        .update({ status: 'bidding' })
        .eq('id', shipmentId)
        .eq('status', 'searching');

      toast.success('✅ ¡Oferta enviada! Esperando respuesta del cliente.');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar la oferta');
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { submitBid, submitting };
}

// ============================================
// Hook: Fetch and listen for bids (Shipper side)
// ============================================
export function useShipmentBids(shipmentId: string | null) {
  const [bids, setBids] = useState<(JobRequest & { profile: any })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shipmentId) return;
    let isMounted = true;

    const fetchBids = async () => {
      const { data, error } = await supabase
        .from('job_requests')
        .select('*, profile:profiles!job_requests_carrier_id_fkey(full_name, rating)')
        .eq('shipment_id', shipmentId)
        .eq('status', 'bid_submitted');

      if (error) {
        console.error('Error fetching bids:', error);
        return;
      }

      if (isMounted && data) {
        setBids(data as any[]);
      }
      setLoading(false);
    };

    fetchBids();

    const channel = supabase
      .channel(`shipment-bids-${shipmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'job_requests',
          filter: `shipment_id=eq.${shipmentId}`,
        },
        async (payload) => {
          const updated = payload.new as JobRequest;
          if (updated.status === 'bid_submitted') {
            // Fetch profile for the new bid
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, rating')
              .eq('id', updated.carrier_id!)
              .single();

            if (isMounted) {
              setBids(prev => {
                const exists = prev.find(b => b.id === updated.id);
                if (exists) {
                  return prev.map(b => b.id === updated.id ? { ...updated, profile } : b);
                }
                return [...prev, { ...updated, profile }];
              });
              toast.info('💰 ¡Nueva oferta recibida!');
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

  return { bids, loading };
}

// ============================================
// Hook: Select a winning bid (Shipper side)
// ============================================
export function useSelectWinner() {
  const [selecting, setSelecting] = useState(false);

  const selectWinner = useCallback(async (jobId: string, shipmentId: string, carrierId: string, finalPrice: number) => {
    setSelecting(true);
    try {
      // 1. Update winning job_request → accepted
      const { error: jobError } = await supabase
        .from('job_requests')
        .update({ status: 'accepted' })
        .eq('id', jobId);

      if (jobError) throw jobError;

      // 2. Update shipment → carrier_selected + assign carrier + final price
      const { error: shipmentError } = await supabase
        .from('shipments')
        .update({
          status: 'carrier_selected',
          carrier_id: carrierId,
          price: finalPrice,
          updated_at: new Date().toISOString(),
        })
        .eq('id', shipmentId);

      if (shipmentError) throw shipmentError;

      // 3. Update all other bids for this shipment → rejected
      await supabase
        .from('job_requests')
        .update({ status: 'rejected' })
        .eq('shipment_id', shipmentId)
        .neq('id', jobId)
        .eq('status', 'bid_submitted');

      toast.success('✅ Transportista seleccionado con éxito.');
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Error al seleccionar transportista');
      return false;
    } finally {
      setSelecting(false);
    }
  }, []);

  return { selectWinner, selecting };
}

// ============================================
// Legacy compatibility
// ============================================
export function useAcceptJob() {
  const { submitBid, submitting } = useSubmitBid();
  return { acceptJob: submitBid, accepting: submitting };
}

export function useRejectJob() {
  const [rejecting, setRejecting] = useState(false);

  const rejectJob = useCallback(async (jobId: string) => {
    setRejecting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const { error } = await supabase
        .from('job_requests')
        .update({
          status: 'rejected',
          carrier_id: user.id,
          responded_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      if (error) throw error;

      toast('Solicitud rechazada', { description: 'No te preocupes, habrá más viajes.' });
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Error al rechazar la solicitud');
      return false;
    } finally {
      setRejecting(false);
    }
  }, []);

  return { rejectJob, rejecting };
}

export function useShipperJobStatus(shipmentId: string | null) {
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [carrierProfile, setCarrierProfile] = useState<{
    full_name: string;
    rating: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shipmentId) return;
    let isMounted = true;

    const fetchShipment = async () => {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('id', shipmentId)
        .single();

      if (error) {
        console.error('Error fetching shipment:', error);
        return;
      }

      if (isMounted && data) {
        setShipment(data as Shipment);

        if (data.carrier_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, rating')
            .eq('id', data.carrier_id)
            .single();

          if (profile && isMounted) {
            setCarrierProfile(profile);
          }
        }
      }
      setLoading(false);
    };

    fetchShipment();

    const channel = supabase
      .channel(`shipment-status-${shipmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shipments',
          filter: `id=eq.${shipmentId}`,
        },
        async (payload) => {
          const updated = payload.new as Shipment;
          if (isMounted) {
            setShipment(updated);

            if (updated.carrier_id && !carrierProfile) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, rating')
                .eq('id', updated.carrier_id)
                .single();

              if (profile && isMounted) {
                setCarrierProfile(profile);
              }
            }

            if (updated.status === 'carrier_selected' || updated.status === 'accepted') {
              toast.success('🎉 ¡Conductor asignado! Tu envío está en camino.');
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

  return { shipment, carrierProfile, loading };
}

export function useCreateJobBroadcast() {
  const [creating, setCreating] = useState(false);

  const createBroadcast = useCallback(async (shipmentId: string): Promise<string | null> => {
    setCreating(true);
    try {
      const { error: shipmentError } = await supabase
        .from('shipments')
        .update({ status: 'searching', updated_at: new Date().toISOString() })
        .eq('id', shipmentId);

      if (shipmentError) throw shipmentError;

      const { data, error } = await supabase
        .from('job_requests')
        .insert({
          shipment_id: shipmentId,
          carrier_id: null,
          status: 'pending',
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Increased for auctions
        })
        .select()
        .single();

      if (error) throw error;

      return data?.id || null;
    } catch (error: any) {
      toast.error(error.message || 'Error al buscar conductores');
      return null;
    } finally {
      setCreating(false);
    }
  }, []);

  return { createBroadcast, creating };
}
