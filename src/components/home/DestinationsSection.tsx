import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Loader2, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { getDestinationImage } from '@/lib/destinationImages';

interface Destination {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
  image_url: string | null;
  is_featured: boolean;
}

export default function DestinationsSection() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      const { data } = await supabase
        .from('destinations')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(4);
      if (data) setDestinations(data);
      setIsLoading(false);
    };
    fetchDestinations();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (destinations.length === 0) return null;

  return (
    <section id="destinations" data-section className="py-16 md:py-28 bg-background relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/3 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 text-primary text-sm font-medium mb-5">
            <Compass className="w-4 h-4" />
            Popular Destinations
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 md:mb-6">
            Discover Pakistan's
            <span className="text-gradient-primary block sm:inline"> Hidden Gems</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground px-4 leading-relaxed">
            From the ancient Silk Road to the roof of the world, explore destinations that will
            leave you breathless.
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {destinations.map((dest, index) => (
            <Link
              key={dest.id}
              to="/destinations"
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] premium-card"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <img
                src={getDestinationImage(dest.name, dest.image_url)}
                alt={dest.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-mountain via-mountain/20 to-transparent" />
              
              {/* Premium border glow on hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ring-1 ring-inset ring-accent/30" />

              <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end">
                <div className="transform transition-all duration-500 group-hover:translate-y-0 translate-y-2">
                  {dest.location && (
                    <div className="flex items-center gap-2 text-snow/70 text-xs md:text-sm mb-2">
                      <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                      <span className="truncate">{dest.location}</span>
                    </div>
                  )}
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-snow mb-2">{dest.name}</h3>
                  {dest.description && (
                    <p className="text-snow/60 text-xs md:text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                      {dest.description}
                    </p>
                  )}
                  <div className="flex items-center justify-end">
                    <span className="w-9 h-9 rounded-full bg-snow/10 group-hover:bg-accent flex items-center justify-center transition-all duration-300 backdrop-blur-sm">
                      <ArrowRight className="w-4 h-4 text-snow group-hover:text-accent-foreground transition-colors" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10 md:mt-14">
          <Button variant="outline" size="lg" asChild className="group">
            <Link to="/destinations" className="flex items-center gap-2">
              View All Destinations
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
