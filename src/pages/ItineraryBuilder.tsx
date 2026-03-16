import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Plus, X, Save, Loader2, GripVertical, Calendar, DollarSign, Sparkles, LogIn } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';

interface Tour {
  id: string;
  title: string;
  price: number;
  discount_price: number | null;
  duration: string | null;
  image_url: string | null;
}

interface Destination {
  id: string;
  name: string;
  image_url: string | null;
}

interface ItineraryItem {
  id: string;
  type: 'tour' | 'destination';
  itemId: string;
  name: string;
  price: number;
}

export default function ItineraryBuilder() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { format } = useCurrency();

  const [tours, setTours] = useState<Tour[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [title, setTitle] = useState('My Custom Itinerary');
  const [notes, setNotes] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [{ data: t }, { data: d }] = await Promise.all([
        supabase.from('tours').select('id, title, price, discount_price, duration, image_url').eq('is_active', true),
        supabase.from('destinations').select('id, name, image_url'),
      ]);
      if (t) setTours(t);
      if (d) setDestinations(d);
      setIsLoading(false);
    };
    fetch();
  }, []);

  const addTour = (tour: Tour) => {
    setItems((prev) => [...prev, {
      id: `${tour.id}-${Date.now()}`,
      type: 'tour',
      itemId: tour.id,
      name: tour.title,
      price: tour.discount_price || tour.price,
    }]);
  };

  const addDestination = (dest: Destination) => {
    setItems((prev) => [...prev, {
      id: `${dest.id}-${Date.now()}`,
      type: 'destination',
      itemId: dest.id,
      name: dest.name,
      price: 0,
    }]);
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const totalEstimate = items.reduce((s, i) => s + i.price, 0);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    const tourIds = items.filter((i) => i.type === 'tour').map((i) => i.itemId);
    const destIds = items.filter((i) => i.type === 'destination').map((i) => i.itemId);

    const { error } = await supabase.from('itineraries').insert({
      user_id: user.id,
      title,
      notes: notes || null,
      tour_ids: tourIds,
      destinations: destIds,
      start_date: startDate || null,
      end_date: endDate || null,
      total_estimate: totalEstimate,
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to save itinerary.', variant: 'destructive' });
    } else {
      toast({ title: 'Saved!', description: 'Your itinerary has been saved to your dashboard.' });
      navigate('/dashboard');
    }
    setIsSaving(false);
  };

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border border-border bg-card shadow-lg">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground">Login Required</h2>
            <p className="text-muted-foreground text-sm">Sign in to create and save custom itineraries.</p>
            <Button onClick={() => navigate('/auth')} className="gap-2">
              <LogIn className="w-4 h-4" /> Sign In
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="page-hero">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.1),transparent_60%)]" />
        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10 animate-fade-up">
          <span className="premium-badge !text-snow !border-snow/15 !bg-snow/[0.06] mb-4 inline-flex">
            <Sparkles className="w-4 h-4 text-accent" />
            Plan Your Trip
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-snow mb-4">
            Itinerary Builder
          </h1>
          <p className="text-base md:text-xl text-snow/80 max-w-2xl mx-auto">
            Drag, drop, and customize your perfect trip through Pakistan
          </p>
          <div className="gold-divider mx-auto mt-6" />
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Sidebar — Available Items */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-card rounded-2xl p-5 border border-border/40 shadow-sm">
                <h3 className="font-serif font-bold text-foreground mb-3">Add Tours</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {tours.map((tour) => (
                    <button
                      key={tour.id}
                      onClick={() => addTour(tour)}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{tour.title}</p>
                        <p className="text-xs text-muted-foreground">{tour.duration || 'Flexible'}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-bold text-primary">{format(tour.discount_price || tour.price)}</span>
                        <Plus className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-2xl p-5 border border-border/40 shadow-sm">
                <h3 className="font-serif font-bold text-foreground mb-3">Add Destinations</h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {destinations.map((dest) => (
                    <button
                      key={dest.id}
                      onClick={() => addDestination(dest)}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
                    >
                      <span className="text-sm font-medium text-foreground flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-primary" /> {dest.name}
                      </span>
                      <Plus className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main — Itinerary */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-card rounded-2xl p-5 border border-border/40 shadow-sm">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xl font-serif font-bold border-0 bg-transparent px-0 focus-visible:ring-0 h-auto"
                  placeholder="Itinerary Title"
                />
                <div className="grid sm:grid-cols-2 gap-3 mt-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
              </div>

              {items.length === 0 ? (
                <div className="bg-card rounded-2xl p-12 border border-dashed border-border text-center">
                  <MapPin className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">Add tours and destinations from the sidebar to build your itinerary</p>
                </div>
              ) : (
                <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
                  {items.map((item, index) => (
                    <Reorder.Item key={item.id} value={item}>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-card rounded-xl p-4 border border-border/40 flex items-center gap-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow"
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                          <p className="text-[11px] text-muted-foreground capitalize">{item.type}</p>
                        </div>
                        {item.price > 0 && (
                          <span className="text-sm font-bold text-primary flex-shrink-0">{format(item.price)}</span>
                        )}
                        <button onClick={() => removeItem(item.id)} className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex-shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              )}

              {items.length > 0 && (
                <>
                  <div className="bg-card rounded-2xl p-5 border border-border/40 shadow-sm">
                    <label className="text-sm font-medium text-foreground mb-2 block">Notes</label>
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes about your trip..." rows={3} />
                  </div>

                  <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground font-medium">Estimated Total</p>
                      <p className="text-2xl font-bold text-primary">{format(totalEstimate)}</p>
                    </div>
                    <Button variant="gold" onClick={handleSave} disabled={isSaving} className="gap-2">
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Itinerary
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
