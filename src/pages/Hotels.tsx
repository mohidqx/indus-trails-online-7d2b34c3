import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Star, MapPin, Wifi, Utensils, Car, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  'Free WiFi': <Wifi className="w-4 h-4" />,
  'Restaurant': <Utensils className="w-4 h-4" />,
  'Parking': <Car className="w-4 h-4" />,
};

export default function Hotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('is_active', true)
      .order('star_rating', { ascending: false });

    if (!error && data) {
      setHotels(data);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-gradient-mountain">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-snow mb-6">
            Partner Hotels
          </h1>
          <p className="text-lg sm:text-xl text-snow/80 max-w-2xl mx-auto">
            Quality accommodations included in our tour packages
          </p>
        </div>
      </section>

      {/* Hotels Grid */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : hotels.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No hotels available at the moment.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="bg-card rounded-2xl sm:rounded-3xl overflow-hidden shadow-card hover:shadow-xl transition-all duration-300 group"
                >
                  {/* Image */}
                  <div className="relative h-48 sm:h-56 overflow-hidden">
                    <img
                      src={hotel.image_url || '/placeholder.svg'}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
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
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground mb-2">
                      {hotel.name}
                    </h3>
                    
                    {hotel.location && (
                      <div className="flex items-center gap-2 text-muted-foreground mb-3 text-sm">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{hotel.location}</span>
                      </div>
                    )}

                    {hotel.description && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {hotel.description}
                      </p>
                    )}

                    {/* Amenities */}
                    {hotel.amenities && hotel.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {hotel.amenities.slice(0, 4).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full"
                          >
                            {amenityIcons[amenity] || null}
                            {amenity}
                          </span>
                        ))}
                        {hotel.amenities.length > 4 && (
                          <span className="text-xs text-muted-foreground px-2 py-1">
                            +{hotel.amenities.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Banner */}
          <div className="mt-12 sm:mt-16 bg-primary/10 border border-primary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-3">
              Hotels Included in Tour Packages
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
              All our tour packages include comfortable accommodation at these partner hotels. 
              When you book a tour, your stay is arranged automatically – no extra booking needed!
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
