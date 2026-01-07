import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Users, Clock, Star, Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export default function Tours() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  useEffect(() => {
    const fetchTours = async () => {
      const { data } = await supabase
        .from('tours')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (data) setTours(data);
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
      <section className="relative pt-32 pb-20 bg-gradient-mountain">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-snow mb-6">
            Our Tours
          </h1>
          <p className="text-xl text-snow/80 max-w-2xl mx-auto">
            Handcrafted journeys through Pakistan's most spectacular landscapes
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff as string)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedDifficulty === diff
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search tours..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tours Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredTours.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tours found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTours.map((tour) => (
                <div
                  key={tour.id}
                  className="group bg-card rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500"
                >
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
                    
                    <div className="absolute top-4 left-4 flex gap-2">
                      {tour.difficulty && (
                        <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                          {tour.difficulty}
                        </span>
                      )}
                      {tour.discount_price && tour.discount_price < tour.price && (
                        <span className="px-3 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold">
                          {Math.round(((tour.price - tour.discount_price) / tour.price) * 100)}% OFF
                        </span>
                      )}
                    </div>

                    {tour.is_featured && (
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 glass-dark rounded-full px-3 py-1.5">
                        <Star className="w-4 h-4 fill-accent text-accent" />
                        <span className="text-snow text-sm font-medium">Featured</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-serif font-bold text-foreground">
                      {tour.title}
                    </h3>

                    {tour.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {tour.description}
                      </p>
                    )}

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
                    </div>

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
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
