import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Calendar, ArrowRight, Sparkles, Loader2, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Deal {
  id: string;
  title: string;
  description: string | null;
  discount_percent: number | null;
  code: string | null;
  valid_from: string | null;
  valid_until: string | null;
  image_url: string | null;
  is_active: boolean;
  tour_id: string | null;
  tours?: { title: string; image_url: string | null } | null;
}

// Fallback images for deals without images
const fallbackImages = [
  'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800',
  'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=800',
  'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
];

export default function Deals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      const { data } = await supabase
        .from('deals')
        .select('*, tours(title, image_url)')
        .eq('is_active', true)
        .order('discount_percent', { ascending: false });
      
      if (data) setDeals(data);
      setIsLoading(false);
    };
    
    fetchDeals();
  }, []);

  const getDealImage = (deal: Deal, index: number) => {
    if (deal.image_url) return deal.image_url;
    if (deal.tours?.image_url) return deal.tours.image_url;
    return fallbackImages[index % fallbackImages.length];
  };

  const featuredDeal = deals[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 bg-gradient-to-r from-primary to-emerald">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-accent/20 text-accent text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <Sparkles className="w-4 h-4" />
            Limited Time Offers
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-snow mb-4 sm:mb-6 no-select">
            Special Deals
          </h1>
          <p className="text-base sm:text-xl text-snow/80 max-w-2xl mx-auto">
            Exclusive discounts and packages for your dream adventure
          </p>
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-24 px-4">
          <Tag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">No active deals at the moment</p>
          <p className="text-sm text-muted-foreground mt-2">Check back soon for exciting offers!</p>
        </div>
      ) : (
        <>
          {/* Featured Deal */}
          {featuredDeal && (
            <section className="py-8 sm:py-16 bg-secondary/30">
              <div className="container mx-auto px-4 sm:px-6">
                <div className="relative bg-card rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
                  <div className="grid md:grid-cols-2">
                    <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[400px]">
                      <img
                        src={getDealImage(featuredDeal, 0)}
                        alt={featuredDeal.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = fallbackImages[0];
                        }}
                      />
                      <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
                        <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-destructive text-destructive-foreground font-bold text-sm sm:text-lg">
                          {featuredDeal.discount_percent}% OFF
                        </span>
                      </div>
                    </div>
                    <div className="p-6 sm:p-8 md:p-12 flex flex-col justify-center">
                      <span className="text-sm text-primary font-medium mb-2">Featured Deal</span>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground mb-3 sm:mb-4 no-select">
                        {featuredDeal.title}
                      </h2>
                      <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                        {featuredDeal.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6">
                        {featuredDeal.code && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="font-mono bg-primary/10 px-3 py-1 rounded text-primary font-bold text-sm sm:text-base">
                              {featuredDeal.code}
                            </span>
                          </div>
                        )}
                        {featuredDeal.valid_until && (
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                            Valid until {new Date(featuredDeal.valid_until).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <Button variant="gold" size="lg" asChild className="w-full sm:w-fit">
                        <Link to={`/booking?deal=${featuredDeal.id}`} className="flex items-center justify-center gap-2">
                          Claim This Deal
                          <ArrowRight className="w-5 h-5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* All Deals */}
          <section className="py-8 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-6 sm:mb-8 text-center no-select">
                All Current Offers
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {deals.map((deal, index) => (
                  <div
                    key={deal.id}
                    className="group bg-card rounded-2xl sm:rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={getDealImage(deal, index)}
                        alt={deal.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = fallbackImages[index % fallbackImages.length];
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-mountain/60 to-transparent" />
                      
                      <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                        <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-destructive text-destructive-foreground font-bold text-sm">
                          {deal.discount_percent}% OFF
                        </span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                      <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground no-select">
                        {deal.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {deal.description}
                      </p>

                      <div className="flex items-center flex-wrap gap-2 sm:gap-4 text-sm text-muted-foreground">
                        {deal.code && (
                          <span className="font-mono bg-primary/10 px-2 py-1 rounded text-primary font-bold text-xs">
                            {deal.code}
                          </span>
                        )}
                        {deal.valid_until && (
                          <span className="flex items-center gap-1 text-xs sm:text-sm">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            {new Date(deal.valid_until).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="pt-3 sm:pt-4 border-t border-border">
                        <Button variant="default" size="sm" asChild className="w-full">
                          <Link to={`/booking?deal=${deal.id}`}>Claim Deal</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
}