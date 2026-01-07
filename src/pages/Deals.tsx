import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Clock, Calendar, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
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
}

export default function Deals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      const { data } = await supabase
        .from('deals')
        .select('*')
        .eq('is_active', true)
        .order('discount_percent', { ascending: false });
      
      if (data) setDeals(data);
      setIsLoading(false);
    };
    
    fetchDeals();
  }, []);

  const featuredDeal = deals[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-gradient-to-r from-primary to-emerald">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Limited Time Offers
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-snow mb-6">
            Special Deals
          </h1>
          <p className="text-xl text-snow/80 max-w-2xl mx-auto">
            Exclusive discounts and packages for your dream adventure
          </p>
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-muted-foreground">No active deals at the moment</p>
        </div>
      ) : (
        <>
          {/* Featured Deal */}
          {featuredDeal && (
            <section className="py-16 bg-secondary/30">
              <div className="container mx-auto px-6">
                <div className="relative bg-card rounded-3xl overflow-hidden shadow-xl">
                  <div className="grid md:grid-cols-2">
                    <div className="relative aspect-[4/3] md:aspect-auto">
                      {featuredDeal.image_url ? (
                        <img
                          src={featuredDeal.image_url}
                          alt={featuredDeal.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center min-h-[300px]">
                          <span className="text-muted-foreground">No image</span>
                        </div>
                      )}
                      <div className="absolute top-6 left-6">
                        <span className="px-4 py-2 rounded-full bg-destructive text-destructive-foreground font-bold text-lg">
                          {featuredDeal.discount_percent}% OFF
                        </span>
                      </div>
                    </div>
                    <div className="p-8 md:p-12 flex flex-col justify-center">
                      <span className="text-sm text-primary font-medium mb-2">Featured Deal</span>
                      <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
                        {featuredDeal.title}
                      </h2>
                      <p className="text-muted-foreground mb-6">
                        {featuredDeal.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 mb-6">
                        {featuredDeal.code && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="font-mono bg-primary/10 px-3 py-1 rounded text-primary font-bold">
                              {featuredDeal.code}
                            </span>
                          </div>
                        )}
                        {featuredDeal.valid_until && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-5 h-5" />
                            Valid until {new Date(featuredDeal.valid_until).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <Button variant="gold" size="lg" asChild className="w-fit">
                        <Link to="/booking" className="flex items-center gap-2">
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
          <section className="py-16">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-serif font-bold text-foreground mb-8 text-center">
                All Current Offers
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="group bg-card rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {deal.image_url ? (
                        <img
                          src={deal.image_url}
                          alt={deal.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground">No image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-mountain/60 to-transparent" />
                      
                      <div className="absolute top-4 left-4">
                        <span className="px-4 py-2 rounded-full bg-destructive text-destructive-foreground font-bold">
                          {deal.discount_percent}% OFF
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <h3 className="text-xl font-serif font-bold text-foreground">
                        {deal.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {deal.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {deal.code && (
                          <span className="font-mono bg-primary/10 px-2 py-1 rounded text-primary font-bold text-xs">
                            {deal.code}
                          </span>
                        )}
                        {deal.valid_until && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(deal.valid_until).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="pt-4 border-t border-border">
                        <Button variant="default" size="sm" asChild className="w-full">
                          <Link to="/booking">Claim Deal</Link>
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
