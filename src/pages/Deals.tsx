import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Calendar, ArrowRight, Sparkles, Loader2, Tag, Clock, Percent, Search, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

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

const fallbackImages = [
  'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800',
  'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=800',
  'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
];

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      };
    };
    setTimeLeft(calc());
    const t = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  return (
    <div className="flex gap-2">
      {Object.entries(timeLeft).map(([key, val]) => (
        <div key={key} className="text-center">
          <div className="bg-mountain/80 backdrop-blur-sm text-snow px-2 py-1 rounded-lg min-w-[2.5rem]">
            <span className="text-lg font-bold">{String(val).padStart(2, '0')}</span>
          </div>
          <span className="text-[10px] text-muted-foreground mt-0.5 block capitalize">{key}</span>
        </div>
      ))}
    </div>
  );
}

export default function Deals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'discount' | 'ending'>('discount');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Code "${code}" copied!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredDeals = useMemo(() => {
    let result = deals.filter((d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    if (sortBy === 'ending') {
      result.sort((a, b) => {
        if (!a.valid_until) return 1;
        if (!b.valid_until) return -1;
        return new Date(a.valid_until).getTime() - new Date(b.valid_until).getTime();
      });
    }
    return result;
  }, [deals, searchQuery, sortBy]);

  const getDealImage = (deal: Deal, index: number) => {
    if (deal.image_url) return deal.image_url;
    if (deal.tours?.image_url) return deal.tours.image_url;
    return fallbackImages[index % fallbackImages.length];
  };

  const featuredDeal = filteredDeals[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-36 sm:pt-40 pb-12 sm:pb-20 bg-gradient-mountain overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--accent)/0.1),transparent_60%)]" />
        <div className="container mx-auto px-4 sm:px-6 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="premium-badge !text-snow !border-snow/15 !bg-snow/[0.06] mb-4 inline-flex">
              <Sparkles className="w-4 h-4 text-accent" />
              Limited Time Offers
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-snow mb-4 sm:mb-6 no-select">
              Special Deals
            </h1>
            <p className="text-base sm:text-xl text-snow/80 max-w-2xl mx-auto">
              Exclusive discounts and packages for your dream adventure
            </p>
            <div className="gold-divider mx-auto mt-6" />
          </motion.div>
        </div>

        {/* Stats in hero */}
        <div className="container mx-auto px-4 sm:px-6 mt-10">
          <motion.div
            className="flex justify-center gap-6 sm:gap-10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          >
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">{deals.length}</p>
              <p className="text-xs text-snow/60">Active Deals</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">
                {deals.reduce((max, d) => Math.max(max, d.discount_percent || 0), 0)}%
              </p>
              <p className="text-xs text-snow/60">Max Discount</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search & Sort */}
      <section className="py-5 bg-secondary/30 border-b border-border sticky top-16 z-30 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            <div className="flex gap-2">
              {[
                { key: 'discount' as const, label: 'Biggest Discount', icon: Percent },
                { key: 'ending' as const, label: 'Ending Soon', icon: Clock },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    sortBy === key
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-card text-muted-foreground hover:bg-secondary border border-border'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredDeals.length === 0 ? (
        <div className="text-center py-24 px-4">
          <Tag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">No deals found</p>
        </div>
      ) : (
        <>
          {/* Featured Deal */}
          {featuredDeal && (
            <section className="py-8 sm:py-16 bg-secondary/30">
              <div className="container mx-auto px-4 sm:px-6">
                <motion.div
                  className="relative bg-card rounded-2xl sm:rounded-3xl overflow-hidden shadow-premium ultra-card"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                >
                  <div className="grid md:grid-cols-2">
                    <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[400px] overflow-hidden">
                      <img
                        src={getDealImage(featuredDeal, 0)}
                        alt={featuredDeal.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = fallbackImages[0]; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-mountain/20 to-transparent" />
                      <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
                        <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-destructive text-destructive-foreground font-bold text-sm sm:text-lg shadow-lg">
                          {featuredDeal.discount_percent}% OFF
                        </span>
                      </div>
                    </div>
                    <div className="p-6 sm:p-8 md:p-12 flex flex-col justify-center">
                      <span className="premium-badge mb-3 inline-flex w-fit">Featured Deal</span>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground mb-3 sm:mb-4 no-select">
                        {featuredDeal.title}
                      </h2>
                      <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                        {featuredDeal.description}
                      </p>

                      {/* Countdown */}
                      {featuredDeal.valid_until && (
                        <div className="mb-6">
                          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Expires in:
                          </p>
                          <CountdownTimer targetDate={featuredDeal.valid_until} />
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6">
                        {featuredDeal.code && (
                          <button
                            onClick={() => copyCode(featuredDeal.code!)}
                            className="flex items-center gap-2 font-mono bg-primary/10 px-4 py-2 rounded-lg text-primary font-bold text-sm border border-primary/20 hover:bg-primary/20 transition-colors"
                          >
                            {featuredDeal.code}
                            {copiedCode === featuredDeal.code ? (
                              <Check className="w-4 h-4 text-emerald" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
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
                </motion.div>
              </div>
            </section>
          )}

          {/* All Deals */}
          {filteredDeals.length > 1 && (
            <section className="py-8 sm:py-16">
              <div className="container mx-auto px-4 sm:px-6">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-6 sm:mb-8 text-center no-select">
                  All Current Offers
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  <AnimatePresence mode="popLayout">
                    {filteredDeals.slice(1).map((deal, index) => (
                      <motion.div
                        key={deal.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="group bg-card rounded-2xl sm:rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500 ultra-card"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={getDealImage(deal, index + 1)}
                            alt={deal.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => { e.currentTarget.src = fallbackImages[(index + 1) % fallbackImages.length]; }}
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
                          <p className="text-sm text-muted-foreground line-clamp-2">{deal.description}</p>

                          {/* Countdown for each deal */}
                          {deal.valid_until && (
                            <div>
                              <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Ends in:
                              </p>
                              <CountdownTimer targetDate={deal.valid_until} />
                            </div>
                          )}

                          <div className="flex items-center flex-wrap gap-2 sm:gap-4 text-sm text-muted-foreground">
                            {deal.code && (
                              <button
                                onClick={() => copyCode(deal.code!)}
                                className="flex items-center gap-1.5 font-mono bg-primary/10 px-2 py-1 rounded text-primary font-bold text-xs border border-primary/20 hover:bg-primary/20 transition-colors"
                              >
                                {deal.code}
                                {copiedCode === deal.code ? <Check className="w-3 h-3 text-emerald" /> : <Copy className="w-3 h-3" />}
                              </button>
                            )}
                          </div>

                          <div className="pt-3 sm:pt-4 border-t border-border">
                            <Button variant="default" size="sm" asChild className="w-full">
                              <Link to={`/booking?deal=${deal.id}`}>Claim Deal</Link>
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      <Footer />
    </div>
  );
}
