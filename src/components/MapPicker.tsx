import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Loader2, X, Crosshair } from 'lucide-react';
import { toast } from 'sonner';

declare global {
  interface Window {
    google: any;
  }
}

// ============================================
// ZENTRA: Official Google Maps Integration
// Uber/inDrive-style location selector
// ============================================

interface MapPickerProps {
  label?: string;
  color?: string;
  value?: { lat: number; lng: number; address: string } | null;
  onChange?: (location: { lat: number; lng: number; address: string }) => void;
  placeholder?: string;
}

export default function MapPicker({
  label = "Selecciona ubicación",
  color = "#3B82F6",
  value,
  onChange,
  placeholder = "Buscar dirección...",
}: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  const autocompleteInstance = useRef<any>(null);
  
  const [query, setQuery] = useState(value?.address || "");
  const [locating, setLocating] = useState(false);
  const defaultCenter = { lat: -12.0464, lng: -77.0428 }; // Lima

  const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
    return new Promise((resolve) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: string) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          resolve(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
      });
    });
  };

  useEffect(() => {
    if (!window.google) {
      toast.error("Google Maps no pudo cargarse.");
      return;
    }

    if (!mapRef.current) return;

    // Initialize Map
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: value ? { lat: value.lat, lng: value.lng } : defaultCenter,
      zoom: value ? 16 : 12,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }]
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#38414e" }]
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#212a37" }]
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9ca5b3" }]
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }]
        }
      ]
    });

    // Handle Map Clicks
    mapInstance.current.addListener('click', async (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      if (!markerInstance.current) {
        markerInstance.current = new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstance.current,
        });
      } else {
        markerInstance.current.setPosition({ lat, lng });
      }

      mapInstance.current.panTo({ lat, lng });
      const address = await getAddressFromCoords(lat, lng);
      setQuery(address);
      onChange?.({ lat, lng, address });
    });

    // Initialize initial marker if value exists
    if (value) {
      markerInstance.current = new window.google.maps.Marker({
        position: { lat: value.lat, lng: value.lng },
        map: mapInstance.current,
      });
    }

    // Initialize Autocomplete
    if (inputRef.current) {
      autocompleteInstance.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "pe" } // Restrict to Peru
      });

      autocompleteInstance.current.addListener('place_changed', () => {
        const place = autocompleteInstance.current.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address || place.name;

        mapInstance.current.setZoom(16);
        mapInstance.current.panTo({ lat, lng });

        if (!markerInstance.current) {
          markerInstance.current = new window.google.maps.Marker({
            position: { lat, lng },
            map: mapInstance.current,
          });
        } else {
          markerInstance.current.setPosition({ lat, lng });
        }

        setQuery(address);
        onChange?.({ lat, lng, address });
      });
    }
  }, []); // Run once on mount

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Tu navegador no soporta geolocalización");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        
        mapInstance.current?.setZoom(16);
        mapInstance.current?.panTo({ lat, lng });

        if (!markerInstance.current) {
          markerInstance.current = new window.google.maps.Marker({
            position: { lat, lng },
            map: mapInstance.current,
          });
        } else {
          markerInstance.current.setPosition({ lat, lng });
        }

        const address = await getAddressFromCoords(lat, lng);
        setQuery(address);
        onChange?.({ lat, lng, address });
        setLocating(false);
      },
      (err) => {
        toast.error("No se pudo obtener tu ubicación.");
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  }, [onChange]);

  return (
    <div className="space-y-3 w-full">
      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</p>

      {/* AutoComplete Search bar */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-[#060E20] border border-white/10 h-14 rounded-2xl pl-12 pr-10 text-white text-xs font-bold placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                if (inputRef.current) inputRef.current.value = "";
                markerInstance.current?.setMap(null);
                markerInstance.current = null;
                onChange?.(null as any);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          className="h-14 w-14 shrink-0 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-xl"
        >
          {locating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Crosshair className="w-6 h-6" />}
        </Button>
      </div>

      {/* Google Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-48 md:h-64 rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl bg-[#060E20]"
      />
    </div>
  );
}
