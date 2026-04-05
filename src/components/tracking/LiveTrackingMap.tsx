import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Clock, Navigation, Maximize2, Minimize2, Crosshair, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// ZENTRA OBSIDIAN: Kinetic Tracking Map
// Mobile-first, GPS-aware Fleet Visibility
// ============================================

function getTruckIcon(heading?: number) {
  const rotation = heading != null ? heading : 0;
  return new L.DivIcon({
    html: `<div style="
      width: 52px; height: 52px;
      display: flex; align-items: center; justify-content: center;
      transform: rotate(${rotation}deg);
      filter: drop-shadow(0 0 12px rgba(59,130,246,0.9));
    ">
      <div style="
        width: 44px; height: 44px;
        background: linear-gradient(135deg, #3B82F6, #1d4ed8);
        border-radius: 50% 50% 50% 10%;
        transform: rotate(45deg);
        border: 3px solid rgba(255,255,255,0.3);
        display: flex; align-items: center; justify-content: center;
      ">
        <span style="transform: rotate(-45deg); font-size: 22px; display:block;">🚛</span>
      </div>
    </div>`,
    className: '',
    iconSize: [52, 52],
    iconAnchor: [26, 26],
  });
}

const stopIcon = (color: string, label?: string) => new L.DivIcon({
  html: `<div style="
    width: 28px; height: 28px;
    background: ${color};
    border-radius: 50%;
    border: 3px solid #060E20;
    box-shadow: 0 0 20px ${color}99;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 900; color: white;
  ">${label || ''}</div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function MapController({ position, shouldCenter }: { position: [number, number] | null; shouldCenter: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (position && shouldCenter) {
      map.panTo(position, { animate: true, duration: 1.5 });
    }
  }, [position, shouldCenter, map]);
  return null;
}

function RecenterButton({ position }: { position: [number, number] | null }) {
  const map = useMap();
  const handleClick = useCallback(() => {
    if (position) map.flyTo(position, 15, { animate: true, duration: 1.2 });
  }, [map, position]);

  if (!position) return null;
  return (
    <button
      onClick={handleClick}
      className="absolute bottom-[200px] right-4 z-[1000] w-12 h-12 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-white hover:border-blue-500/50 transition-all shadow-2xl"
      title="Centrar en el camión"
    >
      <Crosshair className="w-5 h-5" />
    </button>
  );
}

interface Stop {
  lat: number;
  lng: number;
  label?: string;
  type: 'pickup' | 'dropoff';
}

interface LiveTrackingMapProps {
  locations: { lat: number; lng: number; timestamp: string; accuracy?: number; heading?: number; speed?: number }[];
  latestLocation: { lat: number; lng: number; accuracy?: number; heading?: number; speed?: number } | null;
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
  stops = [],
}: LiveTrackingMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoCenter, setAutoCenter] = useState(true);

  const routePositions = useMemo(
    () => locations.map(l => [l.lat, l.lng] as [number, number]),
    [locations]
  );

  const center: [number, number] = latestLocation
    ? [latestLocation.lat, latestLocation.lng]
    : stops.length > 0 ? [stops[0].lat, stops[0].lng] : [19.4326, -99.1332];

  const truckPosition: [number, number] | null = latestLocation
    ? [latestLocation.lat, latestLocation.lng]
    : null;

  const heading = latestLocation?.heading ??
    (locations.length >= 2 ? calculateBearing(
      locations[locations.length - 2].lat, locations[locations.length - 2].lng,
      locations[locations.length - 1].lat, locations[locations.length - 1].lng,
    ) : 0);

  const speedKmh = latestLocation?.speed != null
    ? Math.round(latestLocation.speed * 3.6)
    : null;

  const accuracy = latestLocation?.accuracy;
  const isGpsActive = locations.length > 0;

  return (
    <div className={cn(
      "relative w-full rounded-[32px] overflow-hidden border border-white/5 shadow-2xl transition-all duration-300",
      isFullscreen
        ? "fixed inset-0 z-[9999] rounded-none h-[100dvh]"
        : "h-full"
    )}>
      <MapContainer
        center={center}
        zoom={14}
        className="w-full h-full"
        style={{ background: '#060E20' }}
        ref={mapRef}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
        />

        {/* Planned route (dashed line between stops) */}
        {stops.length > 1 && (
          <Polyline
            positions={stops.map(s => [s.lat, s.lng] as [number, number])}
            pathOptions={{ color: 'rgba(59,130,246,0.25)', weight: 3, dashArray: '12,12' }}
          />
        )}

        {/* Traveled route (solid blue line) */}
        {routePositions.length > 1 && (
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: '#3B82F6',
              weight: 5,
              opacity: 0.95,
              lineCap: 'round',
              lineJoin: 'round',
            } as any}
          />
        )}

        {/* GPS accuracy circle */}
        {truckPosition && accuracy && accuracy < 500 && (
          <Circle
            center={truckPosition}
            radius={accuracy}
            pathOptions={{
              color: '#3B82F6',
              fillColor: '#3B82F6',
              fillOpacity: 0.06,
              weight: 1,
              opacity: 0.3,
            }}
          />
        )}

        {/* Stop markers */}
        {stops.map((stop, idx) => (
          <Marker
            key={idx}
            position={[stop.lat, stop.lng]}
            icon={stopIcon(stop.type === 'pickup' ? '#3B82F6' : '#10B981', stop.label || String(idx + 1))}
          />
        ))}

        {/* Truck marker with heading rotation */}
        {truckPosition && (
          <Marker
            position={truckPosition}
            icon={getTruckIcon(heading)}
          />
        )}

        <MapController
          position={truckPosition}
          shouldCenter={autoCenter}
        />

        <RecenterButton position={truckPosition} />
      </MapContainer>

      {/* Top-left: Status badge */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 shadow-xl">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isGpsActive ? "bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" : "bg-zinc-600"
          )} />
          <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">
            {isGpsActive ? "ZENTRA LIVE" : "SIN SEÑAL"}
          </span>
          {isGpsActive ? <Wifi className="w-3 h-3 text-blue-400" /> : <WifiOff className="w-3 h-3 text-zinc-600" />}
        </div>

        {speedKmh !== null && (
          <div className="flex items-center gap-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 shadow-xl">
            <span className="text-[11px] font-black text-emerald-400">{speedKmh}</span>
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">km/h</span>
          </div>
        )}
      </div>

      {/* Top-right: Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => setIsFullscreen(f => !f)}
          className="w-10 h-10 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-all shadow-xl"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setAutoCenter(v => !v)}
          className={cn(
            "w-10 h-10 backdrop-blur-xl border rounded-xl flex items-center justify-center transition-all shadow-xl",
            autoCenter
              ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
              : "bg-black/80 border-white/10 text-zinc-600"
          )}
          title={autoCenter ? "Auto-centrado activo" : "Auto-centrado inactivo"}
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom: Carrier info card */}
      {carrierName && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000]">
          <Card className="bg-black/90 backdrop-blur-2xl border border-white/10 rounded-[28px] p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 overflow-hidden shadow-lg shrink-0">
                  <img
                    src={carrierPhoto || `https://i.pravatar.cc/150?u=${carrierName}`}
                    className="w-full h-full object-cover"
                    alt={carrierName}
                  />
                </div>
                <div>
                  <h3 className="text-white font-black uppercase text-sm tracking-tight">{carrierName}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <StarIcon className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
                    <span className="text-xs text-emerald-400 font-black">
                      {carrierRating?.toFixed(1) || '5.0'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right space-y-1">
                <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">ETA</p>
                <div className="flex items-center gap-1.5 justify-end">
                  <Clock className="w-3 h-3 text-emerald-500" />
                  <span className="text-xs font-black text-emerald-400">{eta || 'Calculando...'}</span>
                </div>
              </div>
            </div>

            {accuracy && (
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Precisión GPS</span>
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    accuracy < 15 ? "bg-emerald-500" : accuracy < 50 ? "bg-yellow-500" : "bg-red-500"
                  )} />
                  <span className="text-[9px] font-black text-zinc-400">
                    {accuracy < 15 ? 'Alta' : accuracy < 50 ? 'Media' : 'Baja'} ±{Math.round(accuracy)}m
                  </span>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Fullscreen close button */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-white transition-all"
        >
          Cerrar mapa
        </button>
      )}
    </div>
  );
}

// Calculate compass bearing between two GPS points
function calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const lat1R = lat1 * (Math.PI / 180);
  const lat2R = lat2 * (Math.PI / 180);
  const y = Math.sin(dLng) * Math.cos(lat2R);
  const x = Math.cos(lat1R) * Math.sin(lat2R) - Math.sin(lat1R) * Math.cos(lat2R) * Math.cos(dLng);
  return (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360;
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
