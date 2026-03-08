import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { getDestinationImage } from '@/lib/destinationImages';
import { CardSkeleton } from '@/components/common/LoadingSkeleton';

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
      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-14 space-y-4">
            <div className="h-6 w-40 mx-auto rounded-full bg-muted animate-pulse" />
            <div className="h-12 w-[55%] mx-auto rounded bg-muted animate-pulse" />
            <div className="h-5 w-[40%] mx-auto rounded bg-muted animate-pulse" />
          </div>
          <CardSkeleton count={4} aspect="aspect-[3/4]" />
        </div>
      </section>
    );
  }

  if (destinations.length === 0) return null;

  return (
    <section id="destinations" data-section className="py-20 md:py-32 bg-background luxury-section relative">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-20 animate-fade-up">
          <span className="premium-badge mb-6 inline-flex">
            <Compass className="w-4 h-4" />
            Popular Destinations
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-4 md:mb-6">
            Discover Pakistan's
            <span className="text-gradient-primary block sm:inline"> Hidden Gems</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground px-4 leading-relaxed max-w-2xl mx-auto">
            From the ancient Silk Road to the roof of the world, explore destinations that will leave you breathless.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-primary/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-gold" />
            <div className="gold-divider" />
            <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-gold" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-primary/30" />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {destinations.map((dest, index) => (
            <Link
              key={dest.id}
              to="/destinations"
              className="group relative rounded-2xl md:rounded-3xl overflow-hidden aspect-[3/4] ultra-card animate-fade-up"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="absolute inset-0 image-shine">
                <img
                  src={getDestinationImage(dest.name, dest.image_url)}
                  alt={dest.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-mountain via-mountain/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-mountain/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-end">
                <div className="transform transition-all duration-500 group-hover:translate-y-0 translate-y-2">
                  {dest.location && (
                    <div className="flex items-center gap-2 text-snow/60 text-xs mb-2">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-accent/70" />
                      <span className="truncate font-medium tracking-wide">{dest.location}</span>
                    </div>
                  )}
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-snow mb-2 drop-shadow-lg">{dest.name}</h3>
                  {dest.description && (
                    <p className="text-snow/50 text-xs md:text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 line-clamp-2 leading-relaxed">
                      {dest.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-px bg-gradient-to-r from-accent/40 to-transparent" />
                    <span className="w-10 h-10 rounded-full bg-snow/10 group-hover:bg-accent flex items-center justify-center transition-all duration-500 backdrop-blur-sm group-hover:scale-110 group-hover:shadow-gold border border-snow/10 group-hover:border-accent">
                      <ArrowRight className="w-4 h-4 text-snow group-hover:text-accent-foreground transition-colors" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 md:mt-16 animate-fade-up delay-500">
          <Button variant="outline" size="lg" asChild className="group shadow-sm hover:shadow-teal transition-all border-primary/20 hover:border-primary/40">
            <Link to="/destinations" className="flex items-center gap-2">
              View All Destinations
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
