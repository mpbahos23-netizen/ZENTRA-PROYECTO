import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';
import { Star, Clock, MapPin } from 'lucide-react';

// Custom icons
const truckIcon = new L.DivIcon({
  html: `<div style="
    width: 44px; height: 44px; 
    background: #00e5ff; 
    border-radius: 50%; 
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 25px rgba(0, 229, 255, 0.6);
    border: 3px solid rgba(255,255,255,0.4);
    font-size: 24px;
    z-index: 1000;
  ">🚛</div>`,
  className: '',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

const stopIcon = (color: string, label?: string) => new L.DivIcon({
  html: `<div style="
    width: 20px; height: 20px;
    background: ${color};
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 15px ${color}80;
    display: flex; align-items: center; justify-content: center;
    font-size: 9px; font-weight: 900; color: white;
  ">${label || ''}</div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function MapCenterUpdater({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.panTo(position, { animate: true, duration: 1.5 });
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
    <div className="relative w-full h-full min-h-[500px] rounded-[32px] overflow-hidden border border-white/5 shadow-2xl">
      <MapContainer
        center={center}
        zoom={13}
        className="w-full h-full"
        style={{ background: '#050505' }}
        ref={mapRef}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
        />

        {/* Multi-stop Route Polyline (Simplified - just connecting stops) */}
        {stops.length > 1 && (
            <Polyline 
                positions={stops.map(s => [s.lat, s.lng] as [number, number])}
                pathOptions={{ color: 'rgba(255,255,255,0.1)', weight: 2, dashArray: '10, 10' }}
            />
        )}

        {/* Live breadcrumbs */}
        {routePositions.length > 1 && (
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: '#00e5ff',
              weight: 5,
              opacity: 0.8,
              lineCap: 'round',
            }}
          />
        )}

        {/* Render Stops */}
        {stops.map((stop, idx) => (
            <Marker 
                key={idx} 
                position={[stop.lat, stop.lng]} 
                icon={stopIcon(stop.type === 'pickup' ? '#00e5ff' : '#10b981', stop.label)} 
            />
        ))}

        {/* Truck Marker */}
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

      {/* Overlays */}
      <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-3">
         <div className="flex items-center gap-2 bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Transmisión GPS Real</span>
         </div>
         {stops.length > 0 && (
            <div className="bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-xl space-y-2">
                <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Ruta Multi-Parada</p>
                <div className="flex -space-x-2">
                    {stops.map((_, i) => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-[8px] font-black text-white">
                            {i + 1}
                        </div>
                    ))}
                </div>
            </div>
         )}
      </div>

      {carrierName && (
        <Card className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 bg-[#0a0a0a]/95 backdrop-blur-xl border-white/10 rounded-3xl p-5 z-[1000] shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-[#00e5ff]/20 overflow-hidden shrink-0 shadow-lg">
              <img
                src={carrierPhoto || `https://i.pravatar.cc/150?u=${carrierName}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-black uppercase text-xs tracking-tight truncate">{carrierName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-sm text-white font-black">
                  {carrierRating?.toFixed(1) || '5.0'}
                </span>
              </div>
            </div>
            {eta && (
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-[#00e5ff]">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-sm font-black">{eta}</span>
                </div>
                <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">ETA</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
