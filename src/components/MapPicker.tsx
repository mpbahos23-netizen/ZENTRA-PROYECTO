import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Search, Loader2, X, Crosshair } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ============================================
// ZENTRA: MapPicker — Uber/inDrive-style
// Location selector with search + click-to-pin
// Uses OpenStreetMap (free, no API key needed)
// ============================================

const pinIcon = (color: string) => new L.DivIcon({
  html: `<div style="
    width: 36px; height: 36px;
    background: ${color};
    border-radius: 50% 50% 50% 4px;
    transform: rotate(-45deg);
    border: 3px solid rgba(255,255,255,0.4);
    box-shadow: 0 4px 20px ${color}88;
    display: flex; align-items: center; justify-content: center;
  "><span style="transform: rotate(45deg); font-size: 16px;">📍</span></div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

interface MapPickerProps {
  label?: string;
  color?: string;
  value?: { lat: number; lng: number; address: string } | null;
  onChange?: (location: { lat: number; lng: number; address: string }) => void;
  placeholder?: string;
}

// Geocoding de OpenStreetMap Nominatim (gratis)
async function searchAddress(query: string): Promise<Array<{ lat: number; lng: number; display_name: string }>> {
  if (!query || query.length < 3) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=pe`,
      { headers: { 'Accept-Language': 'es' } }
    );
    const data = await res.json();
    return data.map((item: { lat: string; lon: string; display_name: string }) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      display_name: item.display_name,
    }));
  } catch {
    return [];
  }
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept-Language': 'es' } }
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onMapClick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

function FlyToLocation({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 16, { animate: true, duration: 1 });
    }
  }, [position, map]);
  return null;
}

export default function MapPicker({
  label = "Selecciona ubicación",
  color = "#3B82F6",
  value,
  onChange,
  placeholder = "Buscar dirección...",
}: MapPickerProps) {
  const [query, setQuery] = useState(value?.address || "");
  const [suggestions, setSuggestions] = useState<Array<{ lat: number; lng: number; display_name: string }>>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPos, setSelectedPos] = useState<[number, number] | null>(
    value ? [value.lat, value.lng] : null
  );
  const [locating, setLocating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Lima, Perú como centro predeterminado
  const defaultCenter: [number, number] = [-12.0464, -77.0428];

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 3) { setSuggestions([]); return; }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const results = await searchAddress(query);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSearching(false);
    }, 400);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const handleSelectSuggestion = useCallback((item: { lat: number; lng: number; display_name: string }) => {
    setSelectedPos([item.lat, item.lng]);
    setQuery(item.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
    onChange?.({ lat: item.lat, lng: item.lng, address: item.display_name });
  }, [onChange]);

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setSelectedPos([lat, lng]);
    const address = await reverseGeocode(lat, lng);
    setQuery(address);
    onChange?.({ lat, lng, address });
  }, [onChange]);

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Tu navegador no soporta geolocalización");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setSelectedPos([latitude, longitude]);
        const address = await reverseGeocode(latitude, longitude);
        setQuery(address);
        onChange?.({ lat: latitude, lng: longitude, address });
        setLocating(false);
      },
      () => {
        toast.error("No se pudo obtener tu ubicación. Verifica los permisos.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onChange]);

  return (
    <div className="space-y-3 w-full">
      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1">{label}</p>

      {/* Search bar */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <Input
              className="bg-white/5 border-white/5 h-12 rounded-2xl pl-10 pr-10 text-white text-xs font-bold placeholder:text-zinc-700 focus:border-blue-500/50"
              placeholder={placeholder}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            />
            {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />}
            {query && !searching && (
              <button
                onClick={() => { setQuery(""); setSuggestions([]); setSelectedPos(null); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            type="button"
            onClick={handleUseMyLocation}
            disabled={locating}
            className="h-12 w-12 shrink-0 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white"
          >
            {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-5 h-5" />}
          </Button>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 mt-2 w-full bg-[#0b1325] border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-48 overflow-y-auto">
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSuggestion(item)}
                className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-none"
              >
                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span className="text-[10px] text-zinc-300 font-bold leading-relaxed line-clamp-2">{item.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="w-full h-48 md:h-64 rounded-[24px] overflow-hidden border border-white/10 relative shadow-xl">
        <MapContainer
          center={selectedPos || defaultCenter}
          zoom={selectedPos ? 16 : 12}
          className="w-full h-full"
          style={{ background: '#060E20' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com">CARTO</a>'
          />
          <ClickHandler onMapClick={handleMapClick} />
          <FlyToLocation position={selectedPos} />
          {selectedPos && (
            <Marker position={selectedPos} icon={pinIcon(color)} />
          )}
        </MapContainer>

        {/* Floating hint */}
        {!selectedPos && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[500]">
            <div className="bg-black/70 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10">
              <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Toca el mapa o busca una dirección</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
