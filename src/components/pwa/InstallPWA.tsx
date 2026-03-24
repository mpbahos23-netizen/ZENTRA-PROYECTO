import { useState, useEffect } from 'react';
import { Download, X, Smartphone, ArrowBigDownDash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if it's iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Listen for the install prompt on Android/Chrome
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if not already in standalone mode
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // If it's iOS, show it once if not in standalone
    if (ios && !window.matchMedia('(display-mode: standalone)').matches) {
      // Suggest install after a small delay
      const hasSeenInstall = localStorage.getItem('pwa-prompt-seen');
      if (!hasSeenInstall) {
        setIsVisible(true);
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // iOS specific instructions showing
      alert('Para instalar ZENTRA:\n1. Toca el botón "Compartir" abajo.\n2. Busca "Agregar a Inicio".');
    }
  };

  const closePrompt = () => {
    setIsVisible(false);
    localStorage.setItem('pwa-prompt-seen', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[100] animate-in slide-in-from-bottom-5 duration-500 max-w-md mx-auto">
      <Card className="bg-[#060E20]/95 backdrop-blur-xl border border-blue-500/30 p-6 rounded-[32px] shadow-[0_20px_50px_rgba(59,130,246,0.2)] overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
        
        <button 
          onClick={closePrompt}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-zinc-500" />
        </button>

        <div className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            <Smartphone className="w-8 h-8 text-black" />
          </div>
          
          <div className="flex-1 pr-6">
            <h3 className="text-white font-black text-lg uppercase tracking-tight leading-none mb-1">
              Instalar ZENTRA
            </h3>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
              Descarga la app en tu celular para una mejor experiencia logística.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button 
            onClick={handleInstallClick}
            className="w-full bg-white text-black font-black uppercase tracking-widest rounded-2xl h-12 shadow-lg hover:bg-zinc-200 active:scale-95 transition-all text-xs"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar Ahora
          </Button>
          
          {isIOS && (
            <div className="text-zinc-600 text-[8px] font-black uppercase text-center flex items-center justify-center gap-1">
              <ArrowBigDownDash className="w-3 h-3" />
              Toca "Compartir" y luego "Agregar a Inicio"
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
