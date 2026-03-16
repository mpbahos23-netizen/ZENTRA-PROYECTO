import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: string;
}

// ============================================
// Hook: Send GPS coordinates every 5s (Carrier side)
// Uses navigator.geolocation.watchPosition
// ============================================
export function useCarrierGPS(shipmentId: string | null, isActive: boolean) {
  const [currentPosition, setCurrentPosition] = useState<LocationPoint | null>(null);
  const [sending, setSending] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!shipmentId || !isActive) return;

    let lastPosition: GeolocationPosition | null = null;

    // Watch GPS position
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          lastPosition = position;
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: new Date().toISOString(),
          });
        },
        (error) => {
          console.error('GPS error:', error);
          toast.error('No se pudo acceder a la ubicación GPS');
        },
        { enableHighAccuracy: true, maximumAge: 3000 }
      );

      // Send position to Supabase every 5 seconds
      intervalRef.current = setInterval(async () => {
        if (!lastPosition) return;
        setSending(true);

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          await supabase.from('location_updates').insert({
            shipment_id: shipmentId,
            carrier_id: user.id,
            lat: lastPosition.coords.latitude,
            lng: lastPosition.coords.longitude,
          });
        } catch (err) {
          console.error('Error sending location:', err);
        } finally {
          setSending(false);
        }
      }, 5000);
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [shipmentId, isActive]);

  return { currentPosition, sending };
}

// ============================================
// Hook: Subscribe to live location updates (Shipper side)
// ============================================
export function useShipperTracking(shipmentId: string | null) {
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [latestLocation, setLatestLocation] = useState<LocationPoint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shipmentId) return;
    let isMounted = true;

    // Fetch historical locations
    const fetchLocations = async () => {
      const { data, error } = await supabase
        .from('location_updates')
        .select('lat, lng, timestamp')
        .eq('shipment_id', shipmentId)
        .order('timestamp', { ascending: true })
        .limit(100);

      if (error) {
        console.error('Error fetching locations:', error);
        return;
      }

      if (isMounted && data) {
        const points = data as LocationPoint[];
        setLocations(points);
        if (points.length > 0) {
          setLatestLocation(points[points.length - 1]);
        }
      }
      setLoading(false);
    };

    fetchLocations();

    // Subscribe to realtime location updates
    const channel = supabase
      .channel(`location-tracking-${shipmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'location_updates',
          filter: `shipment_id=eq.${shipmentId}`,
        },
        (payload) => {
          const newLoc = payload.new as { lat: number; lng: number; timestamp: string };
          const point: LocationPoint = {
            lat: newLoc.lat,
            lng: newLoc.lng,
            timestamp: newLoc.timestamp,
          };
          if (isMounted) {
            setLocations(prev => [...prev, point]);
            setLatestLocation(point);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [shipmentId]);

  return { locations, latestLocation, loading };
}

// ============================================
// Hook: Update shipment status (Carrier side)
// ============================================
export function useUpdateShipmentStatus() {
  const [updating, setUpdating] = useState(false);

  const updateStatus = useCallback(async (
    shipmentId: string,
    status: 'in_transit' | 'delivered'
  ) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('shipments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', shipmentId);

      if (error) throw error;

      if (status === 'in_transit') {
        toast.success('🚛 Viaje iniciado — transmitiendo ubicación en tiempo real');
      } else if (status === 'delivered') {
        toast.success('✅ ¡Entrega confirmada!');
      }
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar estado');
      return false;
    } finally {
      setUpdating(false);
    }
  }, []);

  return { updateStatus, updating };
}
