import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Users, Clock, Star, Search, Loader2, Hotel, CalendarDays } from 'lucide-react';
import TourComparison from '@/components/tours/TourComparison';
import TourAvailabilityCalendar from '@/components/tours/TourAvailabilityCalendar';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { getTourImage } from '@/lib/tourImages';
import { useCurrency } from '@/hooks/useCurrency';

interface HotelInfo {
  id: string;
  name: string;
  star_rating: number | null;
}

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
  hotel_id: string | null;
  hotels: HotelInfo | null;
}

export default function Tours() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [expandedCalendar, setExpandedCalendar] = useState<string | null>(null);
  const { format } = useCurrency();

  useEffect(() => {
    const fetchTours = async () => {
      const { data } = await supabase
        .from('tours')
        .select('*, hotels(id, name, star_rating)')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });
      if (data) setTours(data as Tour[]);
      setIsLoading(false);
    };
    fetchTours();
  }, []);

  const difficulties = ['All', ...new Set(tours.map(t => t.difficulty).filter(Boolean))];

  const filteredTours = tours.filter((tour) => {
    const matchesDifficulty = selectedDifficulty === 'All' || tour.difficulty === selectedDifficulty;
    const matchesSearch = tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDifficulty && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="page-hero">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.1),transparent_60%)]" />
        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10 animate-fade-up">
          <span className="premium-badge !text-snow !border-snow/15 !bg-snow/[0.06] mb-4 inline-flex">
            <Star className="w-4 h-4 text-accent" />
            Curated Adventures
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-snow mb-4 md:mb-6">
            Our Tours
          </h1>
          <p className="text-base md:text-xl text-snow/80 max-w-2xl mx-auto px-4">
            Handcrafted journeys through Pakistan's most spectacular landscapes
          </p>
          <div className="gold-divider mx-auto mt-6" />
        </div>
      </section>

      {/* Comparison Tool */}
      <section className="py-4 border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6">
          <TourComparison />
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 md:py-8 border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff as string)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ${
                    selectedDifficulty === diff
                      ? 'bg-primary text-primary-foreground shadow-teal'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-80 premium-input rounded-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
              <Input
                placeholder="Search tours..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 md:pl-10 text-sm md:text-base border-0 bg-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tours Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredTours.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tours found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredTours.map((tour, index) => (
                <div
                  key={tour.id}
                  className="group bg-card rounded-2xl md:rounded-3xl overflow-hidden ultra-card animate-fade-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={getTourImage(tour.title, tour.image_url)}
                      alt={tour.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-mountain/60 to-transparent" />

                    <div className="absolute top-3 md:top-4 left-3 md:left-4 flex gap-2">
                      {tour.difficulty && (
                        <span className="px-2 md:px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-teal">
                          {tour.difficulty}
                        </span>
                      )}
                      {tour.discount_price && tour.discount_price < tour.price && (
                        <span className="px-2 md:px-3 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold">
                          {Math.round(((tour.price - tour.discount_price) / tour.price) * 100)}% OFF
                        </span>
                      )}
                    </div>

                    {tour.is_featured && (
                      <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 flex items-center gap-2 glass-dark rounded-full px-2.5 md:px-3 py-1 md:py-1.5">
                        <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-accent text-accent" />
                        <span className="text-snow text-xs md:text-sm font-medium">Featured</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                    <h3 className="text-lg md:text-xl font-serif font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {tour.title}
                    </h3>

                    {tour.description && (
                      <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{tour.description}</p>
                    )}

                    <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
                      {tour.duration && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary/50" />
                          {tour.duration}
                        </span>
                      )}
                      {tour.max_group_size && (
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary/50" />
                          Up to {tour.max_group_size}
                        </span>
                      )}
                    </div>

                    {tour.hotels && (
                      <div className="flex items-center gap-2 p-2.5 md:p-3 rounded-xl bg-primary/5 border border-primary/10">
                        <Hotel className="w-4 h-4 text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">Stay: {tour.hotels.name}</p>
                          {tour.hotels.star_rating && (
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: tour.hotels.star_rating }).map((_, i) => (
                                <Star key={i} className="w-2.5 h-2.5 fill-accent text-accent" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-border/40">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl md:text-2xl font-bold text-foreground">
                            {format(tour.discount_price || tour.price)}
                          </span>
                          {tour.discount_price && tour.discount_price < tour.price && (
                            <span className="text-xs md:text-sm text-muted-foreground line-through">
                              {format(tour.price)}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground/70">per person</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedCalendar(expandedCalendar === tour.id ? null : tour.id)}
                          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                          title="Check availability"
                        >
                          <CalendarDays className="w-4 h-4" />
                        </button>
                        <Button variant="default" size="sm" asChild className="shadow-teal hover:shadow-lg transition-shadow">
                          <Link to={`/booking?tour=${tour.id}`}>Book Now</Link>
                        </Button>
                      </div>
                    </div>

                    {expandedCalendar === tour.id && (
                      <div className="mt-3 animate-fade-up">
                        <TourAvailabilityCalendar tourId={tour.id} />
                      </div>
                    )}
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
