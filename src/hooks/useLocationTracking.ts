import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: string;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

// ============================================
// Hook: Send GPS coordinates every 5s (Carrier side)
// Uses navigator.geolocation.watchPosition
// ============================================
export function useCarrierGPS(shipmentId: string | null, isActive: boolean) {
  const [currentPosition, setCurrentPosition] = useState<LocationPoint | null>(null);
  const [sending, setSending] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPositionRef = useRef<GeolocationPosition | null>(null);

  useEffect(() => {
    if (!isActive) return;

    if (!navigator.geolocation) {
      toast.error('GPS no disponible en este dispositivo');
      return;
    }

    // Watch GPS position continuously
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        lastPositionRef.current = position;
        setGpsAccuracy(position.coords.accuracy);
        setCurrentPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date().toISOString(),
          accuracy: position.coords.accuracy,
          speed: position.coords.speed ?? undefined,
          heading: position.coords.heading ?? undefined,
        });
      },
      (error) => {
        console.error('GPS error:', error);
        switch (error.code) {
          case 1:
            toast.error('GPS denegado', {
              description: 'Activa el permiso de ubicación en tu navegador para transmitir tu ruta.',
            });
            break;
          case 2:
            toast.error('Señal GPS no disponible. Intenta en exterior.');
            break;
          case 3:
            toast.error('Tiempo de espera GPS agotado. Reintentando...');
            break;
        }
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );

    // Send position to Supabase every 5 seconds
    intervalRef.current = setInterval(async () => {
      const lastPos = lastPositionRef.current;
      if (!lastPos) return;
      setSending(true);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const payload: Record<string, unknown> = {
          carrier_id: user.id,
          lat: lastPos.coords.latitude,
          lng: lastPos.coords.longitude,
          accuracy: lastPos.coords.accuracy,
          speed: lastPos.coords.speed,
          heading: lastPos.coords.heading,
        };

        if (shipmentId) {
          payload.shipment_id = shipmentId;
        }

        await supabase.from('location_updates').insert(payload);
      } catch (err) {
        console.error('Error sending location:', err);
      } finally {
        setSending(false);
      }
    }, 5000);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [shipmentId, isActive]);

  return { currentPosition, sending, gpsAccuracy };
}

// ============================================
// Hook: Subscribe to LIVE FLEET updates (Admin side)
// Merges multiple carrier updates
// ============================================
export function useFleetTracking() {
  const [carriers, setCarriers] = useState<Record<string, LocationPoint & { carrier_name?: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestPositions = async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'carrier');

      const profileMap: Record<string, string> = {};
      profiles?.forEach(p => { profileMap[p.id] = p.full_name || 'Carrier Desconocido'; });

      // Get the latest position update per carrier in the last 2 hours
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('location_updates')
        .select('*')
        .gte('timestamp', twoHoursAgo)
        .order('timestamp', { ascending: false })
        .limit(200);

      if (!error && data) {
        const latest: Record<string, LocationPoint & { carrier_name?: string }> = {};
        data.forEach((update: any) => {
          if (!latest[update.carrier_id]) {
            latest[update.carrier_id] = {
              lat: update.lat,
              lng: update.lng,
              timestamp: update.timestamp,
              accuracy: update.accuracy,
              speed: update.speed,
              heading: update.heading,
              carrier_name: profileMap[update.carrier_id],
            };
          }
        });
        setCarriers(latest);
      }
      setLoading(false);
    };

    fetchLatestPositions();

    const channel = supabase
      .channel('fleet-live-tracking')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'location_updates' },
        (payload) => {
          const newLoc = payload.new as any;
          setCarriers(prev => ({
            ...prev,
            [newLoc.carrier_id]: {
              lat: newLoc.lat,
              lng: newLoc.lng,
              timestamp: newLoc.timestamp,
              accuracy: newLoc.accuracy,
              speed: newLoc.speed,
              heading: newLoc.heading,
              carrier_name: prev[newLoc.carrier_id]?.carrier_name || 'Cargando...',
            }
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { carriers, loading };
}

// ============================================
// Hook: Subscribe to live location updates (Shipper/Client side)
// ============================================
export function useShipperTracking(shipmentId: string | null) {
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [latestLocation, setLatestLocation] = useState<LocationPoint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shipmentId) return;
    let isMounted = true;

    const fetchLocations = async () => {
      const { data, error } = await supabase
        .from('location_updates')
        .select('lat, lng, timestamp, accuracy, speed, heading')
        .eq('shipment_id', shipmentId)
        .order('timestamp', { ascending: true })
        .limit(500);

      if (error) {
        console.error('Error fetching locations:', error);
        setLoading(false);
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
          const newLoc = payload.new as any;
          const point: LocationPoint = {
            lat: newLoc.lat,
            lng: newLoc.lng,
            timestamp: newLoc.timestamp,
            accuracy: newLoc.accuracy,
            speed: newLoc.speed,
            heading: newLoc.heading,
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

// ============================================
// Hook: Update shipment ETA (Carrier side)
// ============================================
export function useUpdateShipmentETA() {
  const [updating, setUpdating] = useState(false);

  const updateETA = useCallback(async (
    shipmentId: string,
    estimatedArrivalTime: string
  ) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('shipments')
        .update({
          estimated_arrival_time: estimatedArrivalTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', shipmentId);

      if (error) throw error;
      return true;
    } catch (error: any) {
      toast.error('Error al actualizar ETA');
      return false;
    } finally {
      setUpdating(false);
    }
  }, []);

  return { updateETA, updating };
}
