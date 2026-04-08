import { useState, useEffect } from 'react';
import { MapPin, Navigation, Mountain, Users, User, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import WeatherWidget from '@/components/common/WeatherWidget';
import { getDestinationImage } from '@/lib/destinationImages';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/hooks/useCurrency';

interface Destination {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
  image_url: string | null;
  highlights: string[] | null;
  best_time: string | null;
  is_featured: boolean;
}

interface Tour {
  id: string;
  title: string;
  price: number;
  discount_price: number | null;
  max_group_size: number | null;
}

// Famous places data for northern Pakistan destinations
const famousPlaces: Record<string, string[]> = {
  'hunza': ['Karimabad', 'Eagle\'s Nest', 'Baltit Fort', 'Altit Fort', 'Attabad Lake', 'Passu Cones', 'Borith Lake'],
  'skardu': ['Shangrila Resort', 'Upper Kachura Lake', 'Lower Kachura Lake', 'Deosai Plains', 'Satpara Lake', 'Skardu Fort'],
  'fairy meadows': ['Nanga Parbat Base Camp', 'Beyal Camp', 'Raikot Bridge', 'Tattu Village'],
  'swat': ['Malam Jabba', 'Fizagat Park', 'Mingora Bazaar', 'Swat Museum', 'Mahodand Lake', 'Ushu Forest'],
  'naran': ['Saif ul Malook Lake', 'Lulusar Lake', 'Babusar Pass', 'Ansoo Lake', 'Lalazar Plateau'],
  'kaghan': ['Shogran', 'Siri Paye', 'Payee Meadows', 'Dudipatsar Lake'],
  'chitral': ['Kalash Valley', 'Shandur Pass', 'Garam Chashma', 'Chitral Fort', 'Shahi Mosque'],
  'gilgit': ['Naltar Valley', 'Kargah Buddha', 'Gilgit River', 'Phander Lake'],
  'neelum': ['Sharda', 'Kel', 'Arang Kel', 'Ratti Gali Lake', 'Shounter Lake'],
  'murree': ['Mall Road', 'Pindi Point', 'Kashmir Point', 'Patriata (New Murree)', 'Ayubia National Park'],
  'nathia gali': ['Mushkpuri Top', 'Miranjani Top', 'Ayubia National Park', 'Pipeline Track'],
  'kumrat': ['Jahaz Banda', 'Katora Lake', 'Do Kala Chashma', 'Kumrat Waterfall'],
  'deosai': ['Sheosar Lake', 'Bara Pani', 'Kala Pani', 'Deosai Wildlife'],
  'astore': ['Rama Lake', 'Rama Meadows', 'Rupal Valley', 'Nanga Parbat South Face', 'Gudai Waterfall', 'Rattu Fort', 'Minimarg'],
  'khunjerab': ['Khunjerab Pass (4,693m)', 'Pakistan-China Border', 'Marco Polo Sheep', 'Snow Leopard Territory', 'Khunjerab National Park', 'Dih Village'],
  'naltar': ['Satrangi Lake', 'Pari Lake', 'Naltar Ski Resort', 'Naltar Pine Forest', 'Bashkiri Lake', 'Naltar Meadows'],
  'islamabad': ['Faisal Mosque', 'Margalla Hills', 'Trail 5', 'Daman-e-Koh', 'Pakistan Monument', 'Lok Virsa Museum', 'Centaurus Mall', 'Saidpur Village', 'Rawal Lake'],
  'ayubia': ['Ayubia National Park', 'Pipeline Track', 'Dunga Gali', 'Mushkpuri Top', 'Miranjani Top', 'Nathia Gali Church', 'Khanspur'],
};

// Approximate distances from Islamabad (km)
const distancesFromIslamabad: Record<string, number> = {
  'hunza': 610,
  'skardu': 620,
  'fairy meadows': 510,
  'swat': 270,
  'naran': 275,
  'kaghan': 250,
  'chitral': 465,
  'gilgit': 550,
  'neelum': 230,
  'murree': 65,
  'nathia gali': 85,
  'kumrat': 350,
  'deosai': 560,
  'astore': 520,
  'khunjerab': 810,
  'naltar': 580,
  'islamabad': 0,
  'ayubia': 80,
};

function getDestKey(name: string): string | undefined {
  const lower = name.toLowerCase();
  return Object.keys(famousPlaces).find(k => lower.includes(k));
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Rough lat/lng for destinations
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
  'murree': [33.908, 73.392],
  'nathia gali': [34.073, 73.385],
  'kumrat': [35.524, 72.227],
  'deosai': [35.088, 75.491],
  'astore': [35.366, 74.856],
  'khunjerab': [36.850, 75.423],
  'naltar': [36.167, 74.175],
  'islamabad': [33.684, 73.048],
  'ayubia': [34.060, 73.395],
};

const ISLAMABAD_COORDS: [number, number] = [33.6844, 73.0479];

interface Props {
  dest: Destination | null;
  onClose: () => void;
}

export default function DestinationDetailDialog({ dest, onClose }: Props) {
  const { format } = useCurrency();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loadingTours, setLoadingTours] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  useEffect(() => {
    if (!dest) return;
    // Fetch tours for this destination
    setLoadingTours(true);
    supabase
      .from('tours')
      .select('id, title, price, discount_price, max_group_size')
      .eq('destination_id', dest.id)
      .eq('is_active', true)
      .then(({ data }) => {
        setTours(data || []);
        setLoadingTours(false);
      });

    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => setLocationDenied(true),
        { timeout: 5000 }
      );
    } else {
      setLocationDenied(true);
    }
  }, [dest]);

  if (!dest) return null;

  const key = getDestKey(dest.name);
  const places = key ? famousPlaces[key] : null;
  const destCoord = key ? destCoords[key] : null;

  let distanceKm: number | null = null;
  let distanceFrom = 'Islamabad';

  if (destCoord) {
    if (userLocation && !locationDenied) {
      distanceKm = Math.round(calculateDistance(userLocation[0], userLocation[1], destCoord[0], destCoord[1]));
      distanceFrom = 'your location';
    } else if (key && distancesFromIslamabad[key]) {
      distanceKm = distancesFromIslamabad[key];
      distanceFrom = 'Islamabad';
    }
  }

  return (
    <Dialog open={!!dest} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">{dest.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <img
            src={getDestinationImage(dest.name, dest.image_url)}
            alt={dest.name}
            className="w-full h-48 object-cover rounded-xl"
          />

          {dest.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              {dest.location}
            </div>
          )}

          {/* Distance */}
          {distanceKm !== null && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <Navigation className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Distance from {distanceFrom}</p>
                <p className="font-semibold text-foreground">~{distanceKm.toLocaleString()} km</p>
              </div>
            </div>
          )}

          {dest.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{dest.description}</p>
          )}

          {dest.best_time && (
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground">Best Time to Visit</p>
              <p className="font-medium text-foreground">{dest.best_time}</p>
            </div>
          )}

          {/* Famous Places */}
          {places && places.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Mountain className="w-4 h-4 text-primary" />
                Famous Visiting Places
              </p>
              <div className="flex flex-wrap gap-1.5">
                {places.map((p) => (
                  <span key={p} className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {dest.highlights && dest.highlights.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Highlights</p>
              <div className="flex flex-wrap gap-1.5">
                {dest.highlights.map((h) => (
                  <span key={h} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tour Prices */}
          {loadingTours ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : tours.length > 0 ? (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Tour Packages & Pricing</p>
              <div className="space-y-2">
                {tours.map((tour) => {
                  const price = tour.discount_price || tour.price;
                  const groupSize = tour.max_group_size || 10;
                  return (
                    <div key={tour.id} className="p-3 rounded-xl bg-secondary/50 border border-border/30">
                      <p className="text-sm font-medium text-foreground mb-2">{tour.title}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5">
                          <User className="w-3.5 h-3.5 text-primary" />
                          <div>
                            <p className="text-[10px] text-muted-foreground">Per Person</p>
                            <p className="text-sm font-bold text-primary">{format(price)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/5">
                          <Users className="w-3.5 h-3.5 text-accent" />
                          <div>
                            <p className="text-[10px] text-muted-foreground">Group ({groupSize} pax)</p>
                            <p className="text-sm font-bold text-accent">
                              {format(Math.round(price * groupSize * 0.85))}
                            </p>
                          </div>
                        </div>
                      </div>
                      {tour.discount_price && (
                        <p className="text-[10px] text-muted-foreground mt-1 line-through">
                          Original: {format(tour.price)}/person
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">No tours currently linked to this destination</p>
            </div>
          )}

          <WeatherWidget location={dest.name} />

          <div className="flex gap-2">
            <Button variant="gold" className="flex-1" asChild>
              <Link to={`/tours`}>Browse Tours in {dest.name}</Link>
            </Button>
            <Button variant="default" className="flex-1" asChild>
              <Link to={`/booking`}>Book Now</Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
