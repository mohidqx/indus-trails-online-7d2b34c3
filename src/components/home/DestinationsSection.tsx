import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

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
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (destinations.length === 0) return null;

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-light text-emerald text-sm font-medium mb-4">
            Popular Destinations
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            Discover Pakistan's
            <span className="text-gradient-primary"> Hidden Gems</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From the ancient Silk Road to the roof of the world, explore destinations that will
            leave you breathless.
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((dest, index) => (
            <Link
              key={dest.id}
              to={`/destinations`}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] shadow-card hover:shadow-card-hover transition-all duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              {dest.image_url ? (
                <img
                  src={dest.image_url}
                  alt={dest.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 w-full h-full bg-muted" />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-mountain via-mountain/30 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="transform transition-all duration-500 group-hover:translate-y-0 translate-y-4">
                  {dest.location && (
                    <div className="flex items-center gap-2 text-snow/80 text-sm mb-2">
                      <MapPin className="w-4 h-4" />
                      {dest.location}
                    </div>
                  )}
                  <h3 className="text-2xl font-serif font-bold text-snow mb-2">{dest.name}</h3>
                  {dest.description && (
                    <p className="text-snow/70 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                      {dest.description}
                    </p>
                  )}
                  <div className="flex items-center justify-end">
                    <span className="w-10 h-10 rounded-full bg-snow/20 flex items-center justify-center group-hover:bg-accent transition-colors">
                      <ArrowRight className="w-5 h-5 text-snow group-hover:text-accent-foreground" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link to="/destinations" className="flex items-center gap-2">
              View All Destinations
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
