import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Star, MapPin, Wifi, Utensils, Car, Loader2, Search, SlidersHorizontal, Building2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

interface Hotel {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
  star_rating: number | null;
  amenities: string[] | null;
  image_url: string | null;
}

const amenityIcons: Record<string, React.ReactNode> = {
  'Free WiFi': <Wifi className="w-3.5 h-3.5" />,
  'Restaurant': <Utensils className="w-3.5 h-3.5" />,
  'Parking': <Car className="w-3.5 h-3.5" />,
};

const starFilters = [0, 3, 4, 5];

export default function Hotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [minStars, setMinStars] = useState(0);
  const [expandedHotel, setExpandedHotel] = useState<string | null>(null);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('is_active', true)
      .order('star_rating', { ascending: false });
    if (!error && data) setHotels(data);
    setIsLoading(false);
  };

  const filteredHotels = useMemo(() => {
    return hotels.filter((h) => {
      const matchSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (h.location && h.location.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchStars = minStars === 0 || (h.star_rating && h.star_rating >= minStars);
      return matchSearch && matchStars;
    });
  }, [hotels, searchQuery, minStars]);

  const locations = useMemo(() => {
    const locs = hotels.map((h) => h.location).filter(Boolean);
    return [...new Set(locs)];
  }, [hotels]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-36 sm:pt-40 pb-20 bg-gradient-mountain overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.08),transparent_60%)]" />
        <div className="container mx-auto px-4 sm:px-6 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="premium-badge !text-snow !border-snow/15 !bg-snow/[0.06] mb-4 inline-flex">
              <Building2 className="w-4 h-4 text-accent" />
              Handpicked Stays
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-snow mb-6 no-select">
              Partner Hotels
            </h1>
            <p className="text-lg sm:text-xl text-snow/80 max-w-2xl mx-auto">
              Quality accommodations included in our tour packages
            </p>
            <div className="gold-divider mx-auto mt-6" />
          </motion.div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-6 bg-card border-b border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div className="flex flex-wrap justify-center gap-8 md:gap-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{hotels.length}</p>
              <p className="text-xs text-muted-foreground">Partner Hotels</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{locations.length}</p>
              <p className="text-xs text-muted-foreground">Locations</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {hotels.filter((h) => h.star_rating && h.star_rating >= 4).length}
              </p>
              <p className="text-xs text-muted-foreground">4+ Star Hotels</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-5 bg-secondary/30 border-b border-border sticky top-16 z-30 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search hotels or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              {starFilters.map((s) => (
                <button
                  key={s}
                  onClick={() => setMinStars(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    minStars === s
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-card text-muted-foreground hover:bg-secondary border border-border'
                  }`}
                >
                  {s === 0 ? 'All' : `${s}+ ★`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hotels Grid */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredHotels.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No hotels match your search.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <AnimatePresence mode="popLayout">
                {filteredHotels.map((hotel, i) => (
                  <motion.div
                    key={hotel.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="bg-card rounded-2xl sm:rounded-3xl overflow-hidden shadow-card hover:shadow-xl transition-all duration-300 group ultra-card cursor-pointer"
                    onClick={() => setExpandedHotel(expandedHotel === hotel.id ? null : hotel.id)}
                  >
                    {/* Image */}
                    <div className="relative h-48 sm:h-56 overflow-hidden">
                      <img
                        src={hotel.image_url || '/placeholder.svg'}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-mountain/30 to-transparent" />
                      {hotel.star_rating && (
                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-background/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full flex items-center gap-1">
                          {Array.from({ length: hotel.star_rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-accent text-accent" />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground mb-2 no-select">
                        {hotel.name}
                      </h3>

                      {hotel.location && (
                        <div className="flex items-center gap-2 text-muted-foreground mb-3 text-sm">
                          <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>{hotel.location}</span>
                        </div>
                      )}

                      {hotel.description && (
                        <p className={`text-muted-foreground text-sm mb-4 ${expandedHotel === hotel.id ? '' : 'line-clamp-3'}`}>
                          {hotel.description}
                        </p>
                      )}

                      {/* Amenities */}
                      {hotel.amenities && hotel.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {(expandedHotel === hotel.id ? hotel.amenities : hotel.amenities.slice(0, 4)).map((amenity, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full"
                            >
                              {amenityIcons[amenity] || <Sparkles className="w-3 h-3" />}
                              {amenity}
                            </span>
                          ))}
                          {expandedHotel !== hotel.id && hotel.amenities.length > 4 && (
                            <span className="text-xs text-primary font-medium px-2 py-1">
                              +{hotel.amenities.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Info Banner */}
          <motion.div
            className="mt-12 sm:mt-16 bg-gradient-premium text-snow rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px]" />
            <h3 className="text-xl sm:text-2xl font-serif font-bold mb-3 relative">
              Hotels Included in Tour Packages
            </h3>
            <p className="text-snow/70 max-w-2xl mx-auto text-sm sm:text-base relative">
              All our tour packages include comfortable accommodation at these partner hotels.
              When you book a tour, your stay is arranged automatically – no extra booking needed!
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
