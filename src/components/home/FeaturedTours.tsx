import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, Star, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Tour {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  price: number;
  discount_price: number | null;
  max_group_size: number | null;
  difficulty: string | null;
  includes: string[] | null;
  image_url: string | null;
  is_featured: boolean;
}

export default function FeaturedTours() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      const { data } = await supabase
        .from('tours')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (data) setTours(data);
      setIsLoading(false);
    };
    
    fetchTours();
  }, []);

  if (isLoading) {
    return (
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-6 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (tours.length === 0) return null;

  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-gold-light text-gold text-sm font-medium mb-4">
              Featured Tours
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Unforgettable
              <span className="text-gradient-gold"> Adventures</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Handcrafted journeys through Pakistan's most spectacular landscapes, led by
              experienced local guides.
            </p>
          </div>
          <Button variant="outline" size="lg" asChild className="w-fit">
            <Link to="/tours" className="flex items-center gap-2">
              View All Tours
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>

        {/* Tours Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {tours.map((tour, index) => (
            <div
              key={tour.id}
              className="group bg-card rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                {tour.image_url ? (
                  <img
                    src={tour.image_url}
                    alt={tour.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-mountain/60 to-transparent" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                    Featured
                  </span>
                  {tour.discount_price && tour.discount_price < tour.price && (
                    <span className="px-3 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold">
                      {Math.round(((tour.price - tour.discount_price) / tour.price) * 100)}% OFF
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">
                  {tour.title}
                </h3>

                {/* Meta */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {tour.duration && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {tour.duration}
                    </span>
                  )}
                  {tour.max_group_size && (
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      Up to {tour.max_group_size}
                    </span>
                  )}
                  {tour.difficulty && (
                    <span className="flex items-center gap-1.5">
                      <Star className="w-4 h-4" />
                      {tour.difficulty}
                    </span>
                  )}
                </div>

                {/* Highlights */}
                {tour.includes && tour.includes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tour.includes.slice(0, 3).map((item) => (
                      <span
                        key={item}
                        className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs"
                      >
                        {item}
                      </span>
                    ))}
                    {tour.includes.length > 3 && (
                      <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                        +{tour.includes.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-foreground">
                        PKR {(tour.discount_price || tour.price).toLocaleString()}
                      </span>
                      {tour.discount_price && tour.discount_price < tour.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {tour.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">per person</p>
                  </div>
                  <Button variant="default" size="sm" asChild>
                    <Link to={`/booking?tour=${tour.id}`}>Book Now</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
