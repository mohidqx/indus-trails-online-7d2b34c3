import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, Mountain, Locate } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Fix default marker icons for Leaflet + Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const destPinIcon = new L.DivIcon({
  html: `<div style="background:hsl(173,58%,39%);width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><div style="transform:rotate(45deg);color:white;font-size:12px;font-weight:bold">⛰</div></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
  className: '',
});

const featuredPinIcon = new L.DivIcon({
  html: `<div style="background:hsl(36,76%,52%);width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><div style="transform:rotate(45deg);color:white;font-size:14px;font-weight:bold">★</div></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: '',
});

const userPinIcon = new L.DivIcon({
  html: `<div style="background:#3b82f6;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px rgba(59,130,246,0.3),0 2px 8px rgba(0,0,0,0.3)"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
  className: '',
});

interface Destination {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
  is_featured: boolean;
}

// Destination coordinates
const destCoords: Record<string, [number, number]> = {
  'hunza': [36.316, 74.649],
  'skardu': [35.297, 75.633],
  'fairy meadows': [35.375, 74.588],
  'swat': [35.222, 72.362],
  'naran': [34.909, 73.651],
  'kaghan': [34.801, 73.512],
  'chitral': [35.852, 71.782],
  'gilgit': [35.920, 74.308],
  'neelum': [34.753, 73.909],
  'neelam': [34.753, 73.909],
  'kashmir': [34.753, 73.909],
  'murree': [33.908, 73.392],
  'nathia gali': [34.073, 73.385],
  'kumrat': [35.524, 72.227],
  'deosai': [35.088, 75.491],
  'astore': [35.366, 74.856],
  'khunjerab': [36.850, 75.423],
  'naltar': [36.167, 74.175],
  'islamabad': [33.684, 73.048],
  'ayubia': [34.060, 73.395],
  'malam jabba': [34.812, 72.573],
  'kalam': [35.484, 72.584],
};

function getCoords(name: string): [number, number] | null {
  const lower = name.toLowerCase();
  for (const key of Object.keys(destCoords)) {
    if (lower.includes(key)) return destCoords[key];
  }
  return null;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(positions.map(p => [p[0], p[1]] as [number, number]), { padding: [30, 30] });
    }
  }, []);
  return null;
}

interface Props {
  destinations: Destination[];
  onSelectDestination?: (dest: Destination) => void;
}

export default function DestinationMap({ destinations, onSelectDestination }: Props) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [selectedDest, setSelectedDest] = useState<string | null>(null);

  const mappedDests = destinations
    .map(d => ({ ...d, coords: getCoords(d.name) }))
    .filter(d => d.coords !== null) as (Destination & { coords: [number, number] })[];

  const allPositions = mappedDests.map(d => d.coords);

  const handleLocate = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  };

  const getDistance = (coords: [number, number]) => {
    if (!userLocation) return null;
    return Math.round(haversine(userLocation[0], userLocation[1], coords[0], coords[1]));
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-lg">
      {/* Controls overlay */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        <Button
          size="sm"
          variant="secondary"
          className="shadow-md backdrop-blur-sm bg-background/90 text-xs"
          onClick={handleLocate}
          disabled={locating}
        >
          <Locate className="w-3.5 h-3.5 mr-1.5" />
          {locating ? 'Locating...' : userLocation ? 'Update Location' : 'My Location'}
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] p-2.5 rounded-xl bg-background/90 backdrop-blur-sm border border-border/50 shadow-md">
        <div className="flex flex-col gap-1.5 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-accent border-2 border-white shadow-sm" />
            <span className="text-muted-foreground">Featured</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-primary border-2 border-white shadow-sm" />
            <span className="text-muted-foreground">Destination</span>
          </div>
          {userLocation && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
              <span className="text-muted-foreground">You</span>
            </div>
          )}
        </div>
      </div>

      <MapContainer
        center={[35.0, 74.0]}
        zoom={6}
        scrollWheelZoom={true}
        style={{ height: '450px', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds positions={allPositions} />

        {mappedDests.map(dest => {
          const dist = getDistance(dest.coords);
          return (
            <Marker
              key={dest.id}
              position={dest.coords}
              icon={dest.is_featured ? featuredPinIcon : destPinIcon}
              eventHandlers={{
                click: () => setSelectedDest(dest.id),
              }}
            >
              <Popup>
                <div className="min-w-[180px] p-1">
                  <h3 className="font-bold text-sm mb-1">{dest.name}</h3>
                  {dest.location && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-1.5">
                      <MapPin className="w-3 h-3" /> {dest.location}
                    </p>
                  )}
                  {dist !== null && (
                    <p className="text-xs font-medium text-blue-600 flex items-center gap-1 mb-2">
                      <Navigation className="w-3 h-3" /> ~{dist.toLocaleString()} km from you
                    </p>
                  )}
                  {dest.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{dest.description}</p>
                  )}
                  {onSelectDestination && (
                    <button
                      onClick={() => onSelectDestination(dest)}
                      className="text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-lg transition-colors w-full"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {userLocation && (
          <Marker position={userLocation} icon={userPinIcon}>
            <Popup>
              <div className="text-sm font-medium">📍 Your Location</div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Distance cards below map when user location is available */}
      {userLocation && (
        <div className="p-3 bg-secondary/30 border-t border-border/30">
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-primary" />
            Distances from your location
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {mappedDests
              .map(d => ({ ...d, dist: getDistance(d.coords)! }))
              .sort((a, b) => a.dist - b.dist)
              .map(d => (
                <div
                  key={d.id}
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-background border border-border/50 cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => onSelectDestination?.(d)}
                >
                  <p className="text-xs font-medium text-foreground whitespace-nowrap">{d.name}</p>
                  <p className="text-[10px] text-primary font-semibold">~{d.dist.toLocaleString()} km</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
