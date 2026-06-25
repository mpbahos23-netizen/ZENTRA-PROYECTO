import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Point {
  lat: number;
  lng: number;
}

// ============================================
// Hook: Reality Sim (Zentra Kinetic Engine)
// Interpolates path and pushes to Supabase
// ============================================
export function useTripSimulation() {
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startSimulation = useCallback(async (
    shipmentId: string,
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    steps: number = 20
  ) => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    let currentStep = 0;

    simulationRef.current = setInterval(async () => {
      if (currentStep > steps) {
        if (simulationRef.current) clearInterval(simulationRef.current);
        setIsSimulating(false);
        toast.success("SIMULACIÓN COMPLETADA");
        return;
      }

      const progress = currentStep / steps;
      const lat = originLat + (destLat - originLat) * progress;
      const lng = originLng + (destLng - originLng) * progress;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from('location_updates').insert({
          shipment_id: shipmentId,
          carrier_id: user.id,
          lat,
          lng,
          accuracy: 10,
          speed: 25,
          heading: 90,
          timestamp: new Date().toISOString()
        });

        currentStep++;
      } catch (err) {
        console.error("Simulation Error:", err);
      }
    }, 2000); // Pulse every 2 seconds
  }, [isSimulating]);

  const stopSimulation = useCallback(() => {
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
      simulationRef.current = null;
    }
    setIsSimulating(false);
  }, []);

  return { startSimulation, stopSimulation, isSimulating };
}
