import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { MapPin, ArrowRight, Loader2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { getDestinationImage } from '@/lib/destinationImages';

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

export default function Destinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      const { data } = await supabase
        .from('destinations')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (data) setDestinations(data);
      setIsLoading(false);
    };
    
    fetchDestinations();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="relative pt-28 md:pt-32 pb-16 md:pb-20 bg-gradient-mountain">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-snow mb-4 md:mb-6">
            Our Destinations
          </h1>
          <p className="text-base md:text-xl text-snow/80 max-w-2xl mx-auto px-4">
            Discover the most breathtaking locations in Pakistan's northern paradise
          </p>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : destinations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No destinations found</p>
            </div>
          ) : (
            <div className="grid gap-8 md:gap-12">
              {destinations.map((dest, index) => (
                <div
                  key={dest.id}
                  className={`grid md:grid-cols-2 gap-6 md:gap-8 items-center ${
                    index % 2 === 1 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                    <div className="relative rounded-2xl md:rounded-3xl overflow-hidden aspect-[4/3] shadow-lg group">
                      <img
                        src={getDestinationImage(dest.name, dest.image_url)}
                        alt={dest.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-mountain/60 to-transparent" />
                      {dest.is_featured && (
                        <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6">
                          <span className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-accent text-accent-foreground text-xs md:text-sm font-medium">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                    {dest.location && (
                      <div className="flex items-center gap-2 text-muted-foreground text-xs md:text-sm mb-2 md:mb-3">
                        <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        {dest.location}
                      </div>
                    )}
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground mb-3 md:mb-4">
                      {dest.name}
                    </h2>
                    {dest.description && (
                      <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                        {dest.description}
                      </p>
                    )}
                    
                    {dest.best_time && (
                      <div className="p-3 md:p-4 rounded-xl bg-secondary mb-4 md:mb-6 inline-flex items-center gap-2">
                        <Calendar className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-xs md:text-sm text-muted-foreground">Best Time to Visit</p>
                          <p className="text-sm md:text-base font-semibold text-foreground">{dest.best_time}</p>
                        </div>
                      </div>
                    )}

                    {dest.highlights && dest.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 md:gap-2 mb-4 md:mb-6">
                        {dest.highlights.map((highlight) => (
                          <span
                            key={highlight}
                            className="px-2.5 md:px-3 py-1 md:py-1.5 rounded-full bg-primary/10 text-primary text-xs md:text-sm"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    )}

                    <Button variant="default" asChild>
                      <Link to="/tours" className="flex items-center gap-2">
                        Explore Tours
                        <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
