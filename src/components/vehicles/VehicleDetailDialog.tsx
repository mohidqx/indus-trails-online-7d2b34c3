import { 
  Users, Shield, Fuel, Wrench, Gauge, Thermometer, Music2, 
  MapPin, CheckCircle2, AlertTriangle, Star, Mountain, Clock,
  Phone, Car, Settings, Sparkles, Eye
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { getVehicleImage } from '@/lib/vehicleImages';
import { useCurrency } from '@/hooks/useCurrency';

interface Vehicle {
  id: string;
  name: string;
  type: string;
  capacity: number;
  price_per_day: number;
  features: string[] | null;
  image_url: string | null;
  is_available: boolean;
}

const vehicleMeta: Record<string, {
  description: string;
  engine: string;
  transmission: string;
  fuelType: string;
  fuelEconomy: string;
  driveType: string;
  groundClearance: string;
  luggageCapacity: string;
  comfortFeatures: string[];
  safetyFeatures: string[];
  bestFor: string[];
  notIdealFor: string[];
  terrainCapability: string[];
  recommendedRoutes: string[];
  driverInfo: string;
  maintenanceNote: string;
}> = {
  'land cruiser': {
    description: 'The legendary Toyota Land Cruiser V8 — the undisputed king of northern Pakistan\'s mountain roads. With unmatched off-road capability, powerful V8 engine, and luxury interior, it conquers the most challenging terrains from Deosai to Fairy Meadows approach roads with absolute confidence.',
    engine: '4.6L V8 Petrol / 4.5L V8 Turbo Diesel',
    transmission: '6-Speed Automatic with Sequential Shift',
    fuelType: 'Petrol / Diesel',
    fuelEconomy: '8-12 km/L (highway) | 5-8 km/L (off-road)',
    driveType: 'Full-Time 4WD with Locking Center Differential',
    groundClearance: '230mm — excellent for rough mountain tracks',
    luggageCapacity: '5-6 large suitcases + gear in rear cargo area',
    comfortFeatures: ['Premium leather seats', 'Dual-zone climate control', 'JBL premium sound system', 'Heated & ventilated front seats', 'Rear passenger entertainment', 'Electric sunroof', 'Cruise control', 'Power adjustable seats', 'Multiple USB charging ports'],
    safetyFeatures: ['10 airbags', 'ABS with EBD', 'Vehicle Stability Control (VSC)', 'Hill Assist Control', 'Crawl Control for extreme terrain', 'Multi-terrain Select', 'Rear parking camera', 'Tire pressure monitoring'],
    bestFor: ['VIP & executive transfers', 'Families wanting premium comfort', 'Deosai National Park expeditions', 'Skardu & Gilgit long drives', 'Groups of 5-7 seeking luxury', 'Off-road adventures (Fairy Meadows, Babusar)'],
    notIdealFor: ['Budget-conscious travelers', 'Very narrow city streets', 'Solo travelers (oversized for one person)'],
    terrainCapability: ['Paved highways ✓✓✓', 'Gravel/dirt roads ✓✓✓', 'Mountain passes ✓✓✓', 'River crossings ✓✓✓', 'Snow & ice ✓✓✓', 'Rocky jeep tracks ✓✓✓'],
    recommendedRoutes: ['Islamabad → Skardu (KKH route)', 'Deosai National Park', 'Babusar Pass crossing', 'Fairy Meadows approach', 'Chitral via Lowari', 'Naltar Valley Gilgit'],
    driverInfo: 'Experienced mountain driver included. 10+ years of northern area driving. Trained in off-road recovery, first aid certified. Knows every route and shortcut.',
    maintenanceNote: 'All vehicles undergo 50-point inspection before each trip. Full service history maintained. Spare tire, jack, tow rope, and emergency toolkit always on board.',
  },
  'prado': {
    description: 'The Toyota Prado strikes the perfect balance between Land Cruiser luxury and practical mountain capability. A favorite among experienced northern Pakistan travelers, it offers excellent comfort for long KKH drives while handling rough terrain with confidence.',
    engine: '2.7L 4-Cylinder Petrol / 3.0L Turbo Diesel',
    transmission: '6-Speed Automatic',
    fuelType: 'Petrol / Diesel',
    fuelEconomy: '10-14 km/L (highway) | 7-10 km/L (off-road)',
    driveType: 'Full-Time 4WD with Multi-Terrain Select',
    groundClearance: '220mm — handles most mountain roads easily',
    luggageCapacity: '4-5 large suitcases in rear cargo',
    comfortFeatures: ['Leather seats', 'Dual-zone AC', 'Touchscreen infotainment', 'Power tailgate', 'Cruise control', 'Rear AC vents', 'USB charging ports', 'Comfortable 3rd-row seating option'],
    safetyFeatures: ['7 airbags', 'ABS with EBD', 'Vehicle Stability Control', 'Hill Assist Control', 'Downhill Assist Control', 'Rear camera', 'Blind spot monitor'],
    bestFor: ['Families of 4-6', 'Hunza & Skardu tours', 'Long-distance highway comfort', 'Moderate off-road adventures', 'Corporate group travel', 'Photography tours'],
    notIdealFor: ['Extreme off-road (Deosai in bad weather)', 'Groups larger than 6', 'Ultra-budget trips'],
    terrainCapability: ['Paved highways ✓✓✓', 'Gravel/dirt roads ✓✓✓', 'Mountain passes ✓✓', 'River crossings ✓✓', 'Snow & ice ✓✓', 'Rocky jeep tracks ✓✓'],
    recommendedRoutes: ['Islamabad → Hunza Valley', 'Islamabad → Naran/Kaghan', 'Swat Valley circuit', 'Islamabad → Skardu', 'Neelum Valley exploration', 'Murree & Galyat tours'],
    driverInfo: 'Professional driver with 8+ years mountain driving experience. Local area knowledge for all northern destinations. First aid trained.',
    maintenanceNote: 'Comprehensive pre-trip inspection. Regular servicing schedule. Emergency kit, first aid, and recovery gear standard.',
  },
  'fortuner': {
    description: 'The Toyota Fortuner is the smart choice for northern Pakistan travel — offering genuine SUV capability at a more accessible price point. Its robust frame, high ground clearance, and reliable engine make it perfectly suited for Kaghan, Swat, and Murree trips.',
    engine: '2.7L 4-Cylinder Petrol / 2.8L Turbo Diesel',
    transmission: '6-Speed Automatic / Manual',
    fuelType: 'Petrol / Diesel',
    fuelEconomy: '10-14 km/L (highway) | 8-11 km/L (mixed)',
    driveType: '4WD with Part-Time Engagement',
    groundClearance: '220mm — confident over rough patches',
    luggageCapacity: '3-4 large suitcases',
    comfortFeatures: ['Fabric/leather seats', 'Touchscreen head unit', 'Rear AC vents', 'Power windows all around', 'USB charging', 'Cruise control (select variants)', 'Comfortable second row'],
    safetyFeatures: ['6 airbags', 'ABS with EBD', 'Vehicle Stability Control', 'Hill Assist', 'Rear parking camera', 'ISOFIX child seat anchors'],
    bestFor: ['Small families (4-5 people)', 'Naran & Kaghan trips', 'Swat Valley tours', 'Murree & Galyat weekends', 'Budget-conscious SUV seekers', 'First-time northern visitors'],
    notIdealFor: ['Extreme off-road (Deosai, Fairy Meadows jeep road)', 'Large groups 7+', 'Ultra-luxury expectations'],
    terrainCapability: ['Paved highways ✓✓✓', 'Gravel/dirt roads ✓✓✓', 'Mountain passes ✓✓', 'Snow & ice ✓✓', 'Light off-road ✓✓'],
    recommendedRoutes: ['Islamabad → Naran/Kaghan', 'Swat Valley', 'Murree & Nathia Gali', 'Neelum Valley (main road)', 'Islamabad → Chilas'],
    driverInfo: 'Experienced driver familiar with all major northern routes. Professional and courteous service.',
    maintenanceNote: 'Regular maintenance schedule followed. Pre-trip checklist completed. Emergency toolkit and spare tire always available.',
  },
  'hiace': {
    description: 'The Toyota Hiace Grand Cabin is the ultimate group travel vehicle for northern Pakistan. Spacious, comfortable, and reliable, it comfortably seats up to 13 passengers with luggage. Perfect for corporate groups, large families, and tour groups exploring the north.',
    engine: '2.8L Turbo Diesel',
    transmission: '6-Speed Automatic',
    fuelType: 'Diesel',
    fuelEconomy: '10-13 km/L (highway) | 8-10 km/L (mountain roads)',
    driveType: 'Rear-Wheel Drive (RWD)',
    groundClearance: '185mm — suitable for paved and gravel roads',
    luggageCapacity: 'Generous rear cargo + roof rack for 10+ suitcases',
    comfortFeatures: ['Reclining individual seats', 'Powerful AC throughout', 'Curtained windows', 'Reading lights per seat', 'Ample legroom', 'USB charging points', 'PA system for guide announcements', 'Wide sliding doors for easy entry'],
    safetyFeatures: ['ABS brakes', 'Dual front airbags', 'Reinforced body structure', 'Wide-angle mirrors', 'Rear parking sensors', 'Emergency exits'],
    bestFor: ['Groups of 8-13', 'Corporate retreats', 'Family reunions', 'Tour groups with guide', 'Budget group travel (cost per person lower)', 'Wedding/event transportation'],
    notIdealFor: ['Off-road destinations (Deosai, Fairy Meadows, Kumrat)', 'Very narrow mountain roads', 'Solo or couple travelers', 'Snow/ice conditions'],
    terrainCapability: ['Paved highways ✓✓✓', 'Gravel roads ✓✓', 'Gentle mountain roads ✓✓', 'Steep passes ✓'],
    recommendedRoutes: ['Islamabad → Hunza (KKH - paved)', 'Islamabad → Naran', 'Swat Valley tour', 'Islamabad → Murree', 'Islamabad → Skardu (main road)'],
    driverInfo: 'Professional van driver with extensive KKH experience. Trained for large vehicle mountain driving. First aid certified.',
    maintenanceNote: 'Full mechanical inspection before every trip. AC system specifically checked for mountain altitude performance. Emergency equipment on board.',
  },
  'coaster': {
    description: 'The Toyota Coaster is the go-to choice for large tour groups exploring northern Pakistan. With seating for up to 29 passengers, full AC, and a robust diesel engine, it\'s ideal for organized tours, school trips, and corporate outings on major paved routes.',
    engine: '4.2L 6-Cylinder Diesel',
    transmission: '5-Speed Manual / Automatic',
    fuelType: 'Diesel',
    fuelEconomy: '6-9 km/L (highway) | 4-6 km/L (mountain)',
    driveType: 'Rear-Wheel Drive (RWD)',
    groundClearance: '200mm — designed for paved & semi-paved roads',
    luggageCapacity: 'Large underbody storage + roof rack for 25+ bags',
    comfortFeatures: ['Cushioned reclining seats', 'Powerful dual AC system', 'Curtains on all windows', 'PA/microphone system', 'Individual reading lights', 'Overhead luggage bins', 'Wide center aisle', 'TV/entertainment system (select units)'],
    safetyFeatures: ['Air brakes', 'ABS system', 'Reinforced steel body', 'Emergency exits (2)', 'Fire extinguisher', 'First aid kit', 'Wide mirrors with blind spot coverage'],
    bestFor: ['Tour groups 15-29 people', 'School/university trips', 'Corporate team outings', 'Wedding guest transport', 'Event shuttles', 'Large family gatherings'],
    notIdealFor: ['Any off-road destinations', 'Narrow mountain roads beyond Chilas', 'Small groups (expensive for few people)', 'Routes with tight hairpin turns (Babusar, Lowari old road)'],
    terrainCapability: ['Paved highways ✓✓✓', 'Wide gravel roads ✓✓', 'Mountain highways (KKH) ✓✓'],
    recommendedRoutes: ['Islamabad → Naran (main road)', 'Islamabad → Swat (motorway + main road)', 'Islamabad → Murree', 'KKH to Hunza (experienced driver required)', 'City transfers & airport shuttles'],
    driverInfo: 'Licensed commercial vehicle driver with heavy vehicle mountain experience. Mandatory rest stops followed for safety. Co-driver available for long routes.',
    maintenanceNote: 'Commercial vehicle maintenance standards followed. Brake inspection before every mountain trip. Emergency tools, fire extinguisher, and first aid standard equipment.',
  },
};

function getVehicleKey(name: string): string | undefined {
  const lower = name.toLowerCase();
  return Object.keys(vehicleMeta).find(k => lower.includes(k));
}

interface Props {
  vehicle: Vehicle | null;
  onClose: () => void;
}

export default function VehicleDetailDialog({ vehicle, onClose }: Props) {
  const { format } = useCurrency();

  if (!vehicle) return null;

  const key = getVehicleKey(vehicle.name);
  const meta = key ? vehicleMeta[key] : null;

  return (
    <Dialog open={!!vehicle} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">{vehicle.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {/* Hero Image */}
          <div className="relative rounded-xl overflow-hidden">
            <img src={getVehicleImage(vehicle.name, vehicle.image_url)} alt={vehicle.name} className="w-full h-52 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-3 left-3 flex gap-2">
              <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">{vehicle.type}</span>
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-semibold">Available</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-3 rounded-xl bg-muted/50 text-center">
              <Users className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground">Capacity</p>
              <p className="text-sm font-semibold text-foreground">{vehicle.capacity} pax</p>
            </div>
            <div className="p-3 rounded-xl bg-primary/10 text-center">
              <Star className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground">Daily Rate</p>
              <p className="text-sm font-bold text-primary">{format(vehicle.price_per_day)}</p>
            </div>
            {meta && (
              <>
                <div className="p-3 rounded-xl bg-muted/50 text-center">
                  <Settings className="w-4 h-4 text-primary mx-auto mb-1" />
                  <p className="text-[10px] text-muted-foreground">Drive</p>
                  <p className="text-sm font-semibold text-foreground truncate">{meta.driveType.split(' with')[0]}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50 text-center">
                  <Gauge className="w-4 h-4 text-primary mx-auto mb-1" />
                  <p className="text-[10px] text-muted-foreground">Clearance</p>
                  <p className="text-sm font-semibold text-foreground">{meta.groundClearance.split(' —')[0]}</p>
                </div>
              </>
            )}
          </div>

          {/* Description */}
          {meta && <p className="text-sm text-muted-foreground leading-relaxed">{meta.description}</p>}

          {/* Pricing Breakdown */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
              <p className="text-[10px] text-muted-foreground">1 Day</p>
              <p className="text-sm font-bold text-primary">{format(vehicle.price_per_day)}</p>
            </div>
            <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-center">
              <p className="text-[10px] text-muted-foreground">3 Days</p>
              <p className="text-sm font-bold text-accent">{format(Math.round(vehicle.price_per_day * 3 * 0.95))}</p>
              <p className="text-[9px] text-muted-foreground">5% off</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <p className="text-[10px] text-muted-foreground">7 Days</p>
              <p className="text-sm font-bold text-emerald-600">{format(Math.round(vehicle.price_per_day * 7 * 0.90))}</p>
              <p className="text-[9px] text-muted-foreground">10% off</p>
            </div>
          </div>

          {meta && (
            <>
              {/* Technical Specs */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-primary" /> Technical Specifications
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-background"><span className="text-muted-foreground">Engine:</span> <span className="text-foreground font-medium block">{meta.engine}</span></div>
                  <div className="p-2 rounded-lg bg-background"><span className="text-muted-foreground">Transmission:</span> <span className="text-foreground font-medium block">{meta.transmission}</span></div>
                  <div className="p-2 rounded-lg bg-background"><span className="text-muted-foreground">Fuel:</span> <span className="text-foreground font-medium block">{meta.fuelType}</span></div>
                  <div className="p-2 rounded-lg bg-background"><span className="text-muted-foreground">Economy:</span> <span className="text-foreground font-medium block">{meta.fuelEconomy}</span></div>
                  <div className="p-2 rounded-lg bg-background"><span className="text-muted-foreground">Drive Type:</span> <span className="text-foreground font-medium block">{meta.driveType}</span></div>
                  <div className="p-2 rounded-lg bg-background"><span className="text-muted-foreground">Luggage:</span> <span className="text-foreground font-medium block">{meta.luggageCapacity}</span></div>
                </div>
              </div>

              {/* Comfort Features */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Comfort & Convenience
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {meta.comfortFeatures.map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-primary/5">
                      <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
                      <span className="text-foreground">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-500" /> Safety Features
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {meta.safetyFeatures.map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-red-500/5">
                      <Shield className="w-3 h-3 text-red-500 flex-shrink-0" />
                      <span className="text-foreground">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terrain Capability */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Mountain className="w-4 h-4 text-primary" /> Terrain Capability
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {meta.terrainCapability.map(t => (
                    <p key={t} className="text-xs text-foreground p-1.5 rounded bg-background">{t}</p>
                  ))}
                </div>
              </div>

              {/* Best For / Not Ideal */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-green-600" /> Best For
                  </p>
                  <div className="space-y-1">
                    {meta.bestFor.map(item => (
                      <p key={item} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-green-600 mt-0.5">✓</span> {item}
                      </p>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-orange-500" /> Not Ideal For
                  </p>
                  <div className="space-y-1">
                    {meta.notIdealFor.map(item => (
                      <p key={item} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-orange-500 mt-0.5">✗</span> {item}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommended Routes */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Recommended Routes
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {meta.recommendedRoutes.map(r => (
                    <span key={r} className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">{r}</span>
                  ))}
                </div>
              </div>

              {/* Driver & Maintenance */}
              <div className="grid grid-cols-1 gap-3">
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                    <Car className="w-3 h-3 text-primary" /> Your Driver
                  </p>
                  <p className="text-[11px] text-muted-foreground">{meta.driverInfo}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                  <p className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                    <Wrench className="w-3 h-3 text-primary" /> Maintenance Guarantee
                  </p>
                  <p className="text-[11px] text-muted-foreground">{meta.maintenanceNote}</p>
                </div>
              </div>
            </>
          )}

          {/* Features from DB */}
          {vehicle.features && vehicle.features.length > 0 && !meta && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Features</p>
              <div className="flex flex-wrap gap-1.5">
                {vehicle.features.map(f => (
                  <span key={f} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">{f}</span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-2 pt-2">
            <Button variant="gold" className="flex-1" asChild>
              <Link to={`/booking?vehicle=${vehicle.id}`}>Book This Vehicle</Link>
            </Button>
            <Button variant="default" className="flex-1" asChild>
              <Link to="/contact">Ask a Question</Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}