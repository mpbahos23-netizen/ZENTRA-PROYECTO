import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function RealtimeUpdateMonitor() {
  const [hasUpdates, setHasUpdates] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Escuchar cambios globales en envíos y perfiles relacionados con el usuario actual
    const channel = supabase.channel('global-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          console.log('Cambio detectado en tiempo real:', payload);
          setHasUpdates(true);
          setIsVisible(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRefresh = () => {
    setIsVisible(false);
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-8 duration-500">
      <Button
        onClick={handleRefresh}
        className={cn(
          "bg-[#00e5ff] hover:bg-[#00cce6] text-black font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-full shadow-[0_0_30px_rgba(0,229,255,0.4)] flex items-center gap-3 border border-white/20",
          hasUpdates && "animate-pulse"
        )}
      >
        <RefreshCw className="w-4 h-4 animate-spin-slow" />
        Nuevos Datos Disponibles
        <Zap className="w-3 h-3 fill-current" />
      </Button>
    </div>
  );
}
