import { 
  Star, MapPin, Wifi, Utensils, Car, Mountain, Clock, Phone, 
  CheckCircle2, AlertTriangle, Thermometer, Shield, Sparkles,
  Coffee, Bath, Tv, Users, Bed, Sun, Moon, Building2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Hotel {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
  star_rating: number | null;
  amenities: string[] | null;
  image_url: string | null;
}

const hotelMeta: Record<string, {
  fullDescription: string;
  roomTypes: { name: string; desc: string; capacity: string }[];
  checkIn: string;
  checkOut: string;
  diningOptions: string[];
  nearbyAttractions: { name: string; distance: string }[];
  policies: string[];
  specialFeatures: string[];
  bestFor: string[];
  altitude: string;
  temperature: string;
  contactNote: string;
}> = {
  'serena': {
    fullDescription: 'The Serena Hotels chain represents the pinnacle of hospitality in northern Pakistan. Whether in Gilgit, Hunza, or Chitral, Serena properties offer international-standard luxury amidst breathtaking mountain settings. Impeccable service, traditional architectural design blending with modern amenities, and world-class dining make every stay memorable.',
    roomTypes: [
      { name: 'Deluxe Room', desc: 'Spacious room with mountain/garden views, premium bedding, and traditional décor accents', capacity: '2 adults + 1 child' },
      { name: 'Executive Suite', desc: 'Separate living area, panoramic mountain views, complimentary minibar, and butler service', capacity: '2 adults + 2 children' },
      { name: 'Presidential Suite', desc: 'Luxury suite with private terrace, jacuzzi, dining area, and dedicated staff', capacity: '2 adults + 2 children' },
    ],
    checkIn: '2:00 PM',
    checkOut: '12:00 PM',
    diningOptions: ['All-day dining restaurant (Pakistani, Continental, Chinese)', 'Mountain View Café (light meals & high tea)', 'Room service available 6 AM - 11 PM', 'Special BBQ nights (seasonal)', 'Packed lunch available for day trips'],
    nearbyAttractions: [{ name: 'Local Bazaar', distance: '5 min walk' }, { name: 'River viewpoint', distance: '10 min walk' }, { name: 'Mountain trails', distance: '15 min drive' }],
    policies: ['Free cancellation up to 48 hours before check-in', 'Children under 6 stay free', 'Extra bed available on request (charges apply)', 'No pets allowed', 'Complimentary airport/helipad transfer'],
    specialFeatures: ['Traditional architecture with modern luxury', 'Organic herb garden', 'Cultural evening programs', 'In-house travel desk for excursions', 'Heated rooms (essential in winter)', 'Generator backup (24/7 power)', 'Laundry & dry cleaning', 'Currency exchange available'],
    bestFor: ['Luxury seekers', 'Honeymooners', 'Corporate retreats', 'International tourists', 'Special occasions'],
    altitude: 'Varies by location (1,500m - 2,500m)',
    temperature: 'Rooms climate-controlled year-round. Heated in winter, cooled in summer.',
    contactNote: 'Concierge available 24/7 for local recommendations, tour arrangements, and emergency assistance.',
  },
  'shangrila': {
    fullDescription: 'Shangrila Resort in Skardu, famously known as "Heaven on Earth," is one of Pakistan\'s most iconic hotels. Built around the stunning Lower Kachura Lake, this resort offers a fairy-tale setting with wooden chalets, the famous plane-shaped restaurant on the lake, and panoramic views of the Karakoram range. A destination in itself.',
    roomTypes: [
      { name: 'Standard Chalet', desc: 'Cozy wooden chalet with mountain views, traditional furnishings, and modern bathroom', capacity: '2 adults' },
      { name: 'Deluxe Lake View Room', desc: 'Premium room overlooking Kachura Lake, balcony, upgraded amenities', capacity: '2 adults + 1 child' },
      { name: 'VIP Suite', desc: 'Luxurious suite with private sitting area, lake & mountain panorama, premium service', capacity: '2 adults + 2 children' },
    ],
    checkIn: '1:00 PM',
    checkOut: '11:00 AM',
    diningOptions: ['Plane Restaurant on the lake (iconic dining experience)', 'Main Dining Hall (buffet & à la carte)', 'Lakeside BBQ (seasonal evenings)', 'Packed breakfast for early departures', 'Trout fish fresh from the lake'],
    nearbyAttractions: [{ name: 'Lower Kachura Lake', distance: 'On-site' }, { name: 'Upper Kachura Lake', distance: '20 min drive' }, { name: 'Skardu Fort', distance: '25 min drive' }, { name: 'Deosai Plains', distance: '2.5 hr drive' }, { name: 'Satpara Lake', distance: '30 min drive' }],
    policies: ['Advance booking recommended (sells out quickly)', 'Free cancellation 72 hours before check-in', 'Children under 5 stay free', 'Boat rides available at extra charge', 'No outside food in restaurant areas'],
    specialFeatures: ['Iconic plane restaurant on the lake', 'Private lake access for guests', 'Boat rides on Kachura Lake', 'Traditional Balti cultural shows', 'Campfire evenings', 'Garden walking paths', 'Souvenir shop with local crafts', 'Travel desk for Deosai & K2 base camp tours'],
    bestFor: ['Honeymooners', 'Instagram/photography lovers', 'Nature enthusiasts', 'History buffs', 'Families seeking unique stays'],
    altitude: '2,500m — mild altitude, most people adjust easily',
    temperature: 'Summer: 15-28°C (pleasant). Winter: -5 to 10°C (heating available). Lake freezes in Dec-Feb (stunning sight).',
    contactNote: 'Resort reception assists with all local tour arrangements, vehicle booking, and emergency services.',
  },
  'pearl continental': {
    fullDescription: 'Pearl Continental Hotels bring reliable 5-star hospitality to northern Pakistan. With properties in Muzaffarabad and connections to Bhurban, PC hotels offer familiar luxury standards with well-appointed rooms, multiple dining options, fitness facilities, and professional conference setups. Ideal for both leisure and business travelers.',
    roomTypes: [
      { name: 'Superior Room', desc: 'Well-appointed room with all modern amenities, work desk, and valley/city views', capacity: '2 adults' },
      { name: 'Deluxe Room', desc: 'Larger room with premium bedding, sitting area, and enhanced views', capacity: '2 adults + 1 child' },
      { name: 'Junior Suite', desc: 'Separate sitting area, premium minibar, and panoramic views', capacity: '2 adults + 2 children' },
    ],
    checkIn: '2:00 PM',
    checkOut: '12:00 PM',
    diningOptions: ['Marco Polo Restaurant (multi-cuisine)', 'Tea Lounge', 'Pool-side dining (seasonal)', 'Room service 24/7', 'Buffet breakfast included'],
    nearbyAttractions: [{ name: 'City center', distance: '5 min drive' }, { name: 'Local market', distance: '10 min walk' }, { name: 'Scenic viewpoints', distance: '20 min drive' }],
    policies: ['Free cancellation 24 hours before check-in', 'Children under 8 stay free', 'Swimming pool access included', 'Gym & fitness center included', 'Conference rooms available'],
    specialFeatures: ['Swimming pool', 'Fitness center', 'Business center', 'Conference & banquet halls', 'Spa & massage services', '24/7 room service', 'Valet parking', 'Airport transfers'],
    bestFor: ['Business travelers', 'Conference groups', 'Families wanting familiar luxury', 'International tourists', 'Wedding functions'],
    altitude: 'Varies by location',
    temperature: 'Fully climate-controlled year-round.',
    contactNote: '24/7 front desk and concierge. Travel desk for local excursion bookings.',
  },
  'ptdc': {
    fullDescription: 'PTDC (Pakistan Tourism Development Corporation) Motels are the government\'s tourism hospitality chain, located at key tourist destinations across northern Pakistan. While not luxury properties, they offer clean, comfortable accommodation at scenic locations often unmatched by private hotels. Budget-friendly with basic but adequate facilities.',
    roomTypes: [
      { name: 'Standard Room', desc: 'Clean, functional room with basic amenities, hot water, and adequate heating', capacity: '2 adults' },
      { name: 'Family Room', desc: 'Larger room with extra beds, suitable for families, garden or mountain views', capacity: '2 adults + 2 children' },
      { name: 'VIP Room', desc: 'Best room in the property with premium views and upgraded furnishings', capacity: '2 adults + 1 child' },
    ],
    checkIn: '12:00 PM',
    checkOut: '10:00 AM',
    diningOptions: ['In-house restaurant (Pakistani cuisine)', 'Room service (limited hours)', 'Packed meals for excursions on request', 'Tea/coffee available throughout the day'],
    nearbyAttractions: [{ name: 'Located at prime tourist spots', distance: 'Varies' }, { name: 'Usually walkable to main attractions', distance: '5-15 min walk' }],
    policies: ['Advance booking recommended in peak season', 'Government rates for civil servants', 'Children under 5 stay free', 'Limited cancellation flexibility', 'Cash payment preferred at remote locations'],
    specialFeatures: ['Prime tourist locations', 'Budget-friendly rates', 'Government-maintained standards', 'Local cuisine specialties', 'Travel information desk', 'Garden/lawn areas', 'Safe & secure premises'],
    bestFor: ['Budget travelers', 'Backpackers', 'Government employees', 'Adventure seekers prioritizing location over luxury', 'Students & youth groups'],
    altitude: 'Varies — properties at Naran (2,400m), Kalam, Chilas, etc.',
    temperature: 'Heating available in winter. Basic AC/fans in summer. Mountain locations are naturally cool.',
    contactNote: 'Front desk available during business hours. Limited staff at remote locations — be prepared for basic service.',
  },
};

function getHotelKey(name: string): string | undefined {
  const lower = name.toLowerCase();
  return Object.keys(hotelMeta).find(k => lower.includes(k));
}

// Default meta for hotels without specific data
const defaultHotelMeta = {
  roomTypes: [
    { name: 'Standard Room', desc: 'Comfortable room with essential amenities and mountain views', capacity: '2 adults' },
    { name: 'Family Room', desc: 'Spacious room suitable for families with extra bedding options', capacity: '2 adults + 2 children' },
  ],
  checkIn: '2:00 PM',
  checkOut: '11:00 AM',
  diningOptions: ['In-house restaurant', 'Room service available', 'Packed meals for day trips on request'],
  policies: ['Advance booking recommended in peak season', 'Children under 5 stay free', 'Free cancellation up to 24 hours'],
  specialFeatures: ['Mountain/valley views', 'Hot water available', 'Heating in rooms', 'Local cuisine', 'Travel assistance'],
  bestFor: ['Tour package guests', 'Nature lovers', 'Families'],
};

interface Props {
  hotel: Hotel | null;
  onClose: () => void;
}

export default function HotelDetailDialog({ hotel, onClose }: Props) {
  if (!hotel) return null;

  const key = getHotelKey(hotel.name);
  const meta = key ? hotelMeta[key] : null;
  const roomTypes = meta?.roomTypes || defaultHotelMeta.roomTypes;
  const checkIn = meta?.checkIn || defaultHotelMeta.checkIn;
  const checkOut = meta?.checkOut || defaultHotelMeta.checkOut;
  const dining = meta?.diningOptions || defaultHotelMeta.diningOptions;
  const policies = meta?.policies || defaultHotelMeta.policies;
  const features = meta?.specialFeatures || defaultHotelMeta.specialFeatures;
  const bestFor = meta?.bestFor || defaultHotelMeta.bestFor;

  return (
    <Dialog open={!!hotel} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">{hotel.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {/* Hero Image */}
          <div className="relative rounded-xl overflow-hidden">
            <img src={hotel.image_url || '/placeholder.svg'} alt={hotel.name} className="w-full h-52 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-3 left-3 flex gap-2">
              {hotel.star_rating && (
                <span className="px-3 py-1 rounded-full bg-background/90 backdrop-blur-sm text-xs font-semibold flex items-center gap-1">
                  {Array.from({ length: hotel.star_rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                  ))}
                </span>
              )}
              {hotel.location && (
                <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {hotel.location}
                </span>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-3 rounded-xl bg-muted/50 text-center">
              <Sun className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground">Check-in</p>
              <p className="text-sm font-semibold text-foreground">{checkIn}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/50 text-center">
              <Moon className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground">Check-out</p>
              <p className="text-sm font-semibold text-foreground">{checkOut}</p>
            </div>
            {meta?.altitude && (
              <div className="p-3 rounded-xl bg-muted/50 text-center">
                <Mountain className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground">Altitude</p>
                <p className="text-sm font-semibold text-foreground truncate">{meta.altitude.split(' —')[0]}</p>
              </div>
            )}
            <div className="p-3 rounded-xl bg-muted/50 text-center">
              <Star className="w-4 h-4 text-accent mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground">Rating</p>
              <p className="text-sm font-semibold text-foreground">{hotel.star_rating || 3} Star</p>
            </div>
          </div>

          {/* Description */}
          {meta?.fullDescription ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{meta.fullDescription}</p>
          ) : hotel.description ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{hotel.description}</p>
          ) : null}

          {/* Room Types */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Bed className="w-4 h-4 text-primary" /> Room Types
            </p>
            <div className="space-y-2">
              {roomTypes.map((room, i) => (
                <div key={i} className="p-3 rounded-xl bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground">{room.name}</p>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" /> {room.capacity}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{room.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Dining */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-primary" /> Dining Options
            </p>
            <div className="space-y-1.5">
              {dining.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-primary/5">
                  <Coffee className="w-3 h-3 text-primary flex-shrink-0" />
                  <span className="text-foreground">{d}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nearby Attractions */}
          {meta?.nearbyAttractions && (
            <div>
              <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Nearby Attractions
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {meta.nearbyAttractions.map((a, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-accent/5 border border-accent/10">
                    <span className="text-foreground font-medium">{a.name}</span>
                    <span className="text-muted-foreground">{a.distance}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amenities from DB */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Amenities
              </p>
              <div className="flex flex-wrap gap-1.5">
                {hotel.amenities.map((a, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-primary" /> {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Special Features */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Special Features
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {features.map(f => (
                <div key={f} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-primary/5">
                  <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0" />
                  <span className="text-foreground">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Best For */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-green-600" /> Best For
              </p>
              <div className="space-y-1">
                {bestFor.map(item => (
                  <p key={item} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="text-green-600 mt-0.5">✓</span> {item}
                  </p>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-primary" /> Policies
              </p>
              <div className="space-y-1">
                {policies.slice(0, 4).map(p => (
                  <p key={p} className="text-xs text-muted-foreground">• {p}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Temperature & Contact */}
          {meta && (
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                <p className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                  <Thermometer className="w-3 h-3 text-primary" /> Climate
                </p>
                <p className="text-[11px] text-muted-foreground">{meta.temperature}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-primary" /> Guest Services
                </p>
                <p className="text-[11px] text-muted-foreground">{meta.contactNote}</p>
              </div>
            </div>
          )}

          {/* Info Banner */}
          <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 text-center">
            <p className="text-xs text-muted-foreground">
              🏨 This hotel is included in our tour packages. When you book a tour, your accommodation is arranged automatically — no separate hotel booking needed!
            </p>
          </div>

          {/* CTA */}
          <div className="flex gap-2 pt-2">
            <Button variant="gold" className="flex-1" asChild>
              <Link to="/tours">Browse Tours with This Hotel</Link>
            </Button>
            <Button variant="default" className="flex-1" asChild>
              <Link to="/contact">Inquire About This Hotel</Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}