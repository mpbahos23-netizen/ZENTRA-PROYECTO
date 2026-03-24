import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';
import { Star, Clock, MapPin, Navigation, Zap, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// ZENTRA OBSIDIAN: Kinetic Tracking Map
// Ultra-Minimalist Fleet Visibility
// ============================================

const truckIcon = new L.DivIcon({
  html: `<div style="
    width: 48px; height: 48px; 
    background: #3B82F6; 
    border-radius: 20px; 
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 10px 30px rgba(59, 130, 246, 0.5);
    border: 3px solid rgba(255,255,255,0.2);
    font-size: 26px;
    z-index: 1000;
  ">🚛</div>`,
  className: '',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

const stopIcon = (color: string, label?: string) => new L.DivIcon({
  html: `<div style="
    width: 24px; height: 24px;
    background: ${color};
    border-radius: 50%;
    border: 3px solid #060E20;
    box-shadow: 0 0 20px ${color}80;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 900; color: white;
  ">${label || ''}</div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapCenterUpdater({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.panTo(position, { animate: true, duration: 2 });
  }, [position, map]);
  return null;
}

interface Stop {
    lat: number;
    lng: number;
    label?: string;
    type: 'pickup' | 'dropoff';
}

interface LiveTrackingMapProps {
  locations: { lat: number; lng: number; timestamp: string }[];
  latestLocation: { lat: number; lng: number } | null;
  carrierName?: string;
  carrierRating?: number;
  carrierPhoto?: string;
  eta?: string;
  stops?: Stop[];
}

export default function LiveTrackingMap({
  locations,
  latestLocation,
  carrierName,
  carrierRating,
  carrierPhoto,
  eta,
  stops = []
}: LiveTrackingMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  const routePositions = useMemo(
    () => locations.map(l => [l.lat, l.lng] as [number, number]),
    [locations]
  );

  const center: [number, number] = latestLocation
    ? [latestLocation.lat, latestLocation.lng]
    : stops.length > 0 ? [stops[0].lat, stops[0].lng] : [19.4326, -99.1332];

  return (
    <div className="relative w-full h-full min-h-[600px] rounded-[48px] overflow-hidden border border-white/5 shadow-2xl group">
      <MapContainer
        center={center}
        zoom={14}
        className="w-full h-full grayscale brightness-75 contrast-125"
        style={{ background: '#060E20' }}
        ref={mapRef}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
        />

        {stops.length > 1 && (
            <Polyline 
                positions={stops.map(s => [s.lat, s.lng] as [number, number])}
                pathOptions={{ color: 'rgba(59, 130, 246, 0.2)', weight: 3, dashArray: '15, 15' }}
            />
        )}

        {routePositions.length > 1 && (
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: '#3B82F6',
              weight: 6,
              opacity: 0.9,
              lineCap: 'round',
              shadowBlur: 10,
              shadowColor: '#3B82F6'
            } as any}
          />
        )}

        {stops.map((stop, idx) => (
            <Marker 
                key={idx} 
                position={[stop.lat, stop.lng]} 
                icon={stopIcon(stop.type === 'pickup' ? '#3B82F6' : '#10B981', stop.label)} 
            />
        ))}

        {latestLocation && (
          <Marker
            position={[latestLocation.lat, latestLocation.lng]}
            icon={truckIcon}
          />
        )}

        <MapCenterUpdater
          position={latestLocation ? [latestLocation.lat, latestLocation.lng] : null}
        />
      </MapContainer>

      {/* OVERLAY: Status Badge */}
      <div className="absolute top-8 left-8 z-[1000] flex flex-col gap-4">
         <div className="flex items-center gap-3 bg-[#060E20]/90 backdrop-blur-xl border border-white/5 rounded-full px-5 py-2.5 shadow-2xl">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">ZENTRA LIVE FEED</span>
         </div>
         
         {stops.length > 0 && (
            <div className="bg-[#060E20]/90 backdrop-blur-xl border border-white/5 rounded-[32px] p-4 shadow-2xl space-y-3">
                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest px-1">Ruta Multi-OS</p>
                <div className="flex -space-x-2.5">
                    {stops.map((_, i) => (
                        <div key={i} className={cn(
                          "w-8 h-8 rounded-full border-[3px] border-[#060E20] flex items-center justify-center text-[10px] font-black text-white shadow-xl transition-all hover:scale-110 cursor-pointer",
                          i === 0 ? "bg-blue-600" : "bg-zinc-800"
                        )}>
                            {i + 1}
                        </div>
                    ))}
                </div>
            </div>
         )}
      </div>

      {/* OVERLAY: Tracking Info Card */}
      <div className="absolute bottom-8 left-8 right-8 md:bottom-12 md:left-auto md:right-12 md:w-96 z-[1000] animate-in slide-in-from-bottom-5 duration-700">
        <Card className="bg-[#060E20]/95 backdrop-blur-2xl border border-white/5 rounded-[48px] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
          
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-[24px] bg-zinc-900 border border-white/5 overflow-hidden shadow-xl group-hover:scale-105 transition-transform">
                    <img
                      src={carrierPhoto || `https://i.pravatar.cc/150?u=${carrierName}`}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-black uppercase text-sm tracking-tight italic">{carrierName || 'Unidad Z-904'}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                      <span className="text-sm text-emerald-400 font-black tracking-tighter">
                        {carrierRating?.toFixed(1) || '5.0'}
                      </span>
                    </div>
                  </div>
               </div>
               
               <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Navigation className="w-5 h-5 text-zinc-500" />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
               <div className="space-y-1">
                  <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Estado</p>
                  <div className="flex items-center gap-2">
                     <Zap className="w-3.5 h-3.5 text-blue-500" />
                     <span className="text-xs font-black text-white uppercase tracking-tight">Carga Segura</span>
                  </div>
               </div>
               <div className="space-y-1 text-right">
                  <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Llegada Est.</p>
                  <div className="flex items-center gap-2 justify-end">
                     <Clock className="w-3.5 h-3.5 text-emerald-500" />
                     <span className="text-xs font-black text-emerald-400 uppercase tracking-tight">18:45 PM</span>
                  </div>
               </div>
            </div>

            <Button className="w-full h-14 rounded-full bg-white text-black font-black uppercase tracking-[0.2em] transform active:scale-95 transition-all text-[10px]">
               Contactar Transportista
            </Button>
          </div>
        </Card>
      </div>

    </div>
  );
}
