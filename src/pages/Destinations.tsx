import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { MapPin, ArrowRight, Loader2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

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
      <section className="relative pt-32 pb-20 bg-gradient-mountain">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-snow mb-6">
            Our Destinations
          </h1>
          <p className="text-xl text-snow/80 max-w-2xl mx-auto">
            Discover the most breathtaking locations in Pakistan's northern paradise
          </p>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : destinations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No destinations found</p>
            </div>
          ) : (
            <div className="grid gap-12">
              {destinations.map((dest, index) => (
                <div
                  key={dest.id}
                  className={`grid md:grid-cols-2 gap-8 items-center ${
                    index % 2 === 1 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                    <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-lg group">
                      {dest.image_url ? (
                        <img
                          src={dest.image_url}
                          alt={dest.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground">No image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-mountain/60 to-transparent" />
                      {dest.is_featured && (
                        <div className="absolute bottom-6 left-6">
                          <span className="px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                    {dest.location && (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                        <MapPin className="w-4 h-4" />
                        {dest.location}
                      </div>
                    )}
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
                      {dest.name}
                    </h2>
                    {dest.description && (
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {dest.description}
                      </p>
                    )}
                    
                    {dest.best_time && (
                      <div className="p-4 rounded-xl bg-secondary mb-6 inline-flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Best Time to Visit</p>
                          <p className="font-semibold text-foreground">{dest.best_time}</p>
                        </div>
                      </div>
                    )}

                    {dest.highlights && dest.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {dest.highlights.map((highlight) => (
                          <span
                            key={highlight}
                            className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    )}

                    <Button variant="default" asChild>
                      <Link to="/tours" className="flex items-center gap-2">
                        Explore Tours
                        <ArrowRight className="w-5 h-5" />
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
