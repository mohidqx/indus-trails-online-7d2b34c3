import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Users, Loader2, Star, Filter, Search, Shield, Clock, Fuel, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { getVehicleImage } from '@/lib/vehicleImages';
import { motion, AnimatePresence } from 'framer-motion';

interface Vehicle {
  id: string;
  name: string;
  type: string;
  capacity: number;
  price_per_day: number;
  features: string[] | null;
  image_url: string | null;
  is_available: boolean;
}

const typeFilters = ['All', 'SUV', 'Van', 'Bus', 'Sedan'];

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'capacity'>('price-asc');
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      const { data } = await supabase
        .from('vehicles')
        .select('*')
        .eq('is_available', true)
        .order('price_per_day', { ascending: true });
      if (data) setVehicles(data);
      setIsLoading(false);
    };
    fetchVehicles();
  }, []);

  const filteredVehicles = useMemo(() => {
    let result = vehicles.filter((v) => {
      const matchSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = selectedType === 'All' || v.type.toLowerCase() === selectedType.toLowerCase();
      return matchSearch && matchType;
    });

    if (sortBy === 'price-asc') result.sort((a, b) => a.price_per_day - b.price_per_day);
    else if (sortBy === 'price-desc') result.sort((a, b) => b.price_per_day - a.price_per_day);
    else result.sort((a, b) => b.capacity - a.capacity);

    return result;
  }, [vehicles, searchQuery, selectedType, sortBy]);

  const toggleCompare = (id: string) => {
    setCompareList((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const compareVehicles = vehicles.filter((v) => compareList.includes(v.id));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-36 sm:pt-40 pb-16 md:pb-24 bg-gradient-mountain overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--accent)/0.08),transparent_60%)]" />
        <div className="container mx-auto px-4 sm:px-6 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="premium-badge !text-snow !border-snow/15 !bg-snow/[0.06] mb-4 inline-flex">
              <Star className="w-4 h-4 text-accent" />
              Premium Fleet
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-snow mb-4 md:mb-6 no-select">
              Our Fleet
            </h1>
            <p className="text-base md:text-xl text-snow/80 max-w-2xl mx-auto px-4">
              Comfortable, well-maintained vehicles for your mountain adventures
            </p>
            <div className="gold-divider mx-auto mt-6" />
          </motion.div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-6 md:py-8 bg-card border-b border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            className="flex flex-wrap justify-center gap-8 md:gap-12 text-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          >
            {[
              { icon: Shield, value: 'Insured', label: 'All Vehicles' },
              { icon: Users, value: `${vehicles.length}+`, label: 'Vehicles Ready' },
              { icon: Clock, value: '24/7', label: 'Road Support' },
              { icon: Fuel, value: 'Expert', label: 'Drivers' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="py-6 bg-secondary/30 border-b border-border sticky top-16 z-30 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {typeFilters.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                    selectedType === type
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-card text-muted-foreground hover:bg-secondary border border-border'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-medium bg-card border border-border text-foreground cursor-pointer"
              >
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="capacity">Most Capacity</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Compare Bar */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border border-border shadow-premium rounded-2xl px-6 py-3 flex items-center gap-4"
          >
            <span className="text-sm text-foreground font-medium">{compareList.length}/3 selected</span>
            <Button size="sm" onClick={() => setShowCompare(true)} disabled={compareList.length < 2}>
              Compare
            </Button>
            <button onClick={() => setCompareList([])} className="text-xs text-muted-foreground hover:text-foreground">
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compare Modal */}
      <AnimatePresence>
        {showCompare && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-mountain/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowCompare(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[80vh] overflow-auto shadow-premium border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-serif font-bold text-foreground mb-6">Vehicle Comparison</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {compareVehicles.map((v) => (
                  <div key={v.id} className="text-center space-y-3">
                    <img src={getVehicleImage(v.name, v.image_url)} alt={v.name} className="w-full aspect-[4/3] object-cover rounded-xl" />
                    <h4 className="font-serif font-bold text-foreground">{v.name}</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Type: <span className="text-foreground">{v.type}</span></p>
                      <p>Capacity: <span className="text-foreground">{v.capacity} pax</span></p>
                      <p>Price: <span className="text-primary font-bold">PKR {v.price_per_day.toLocaleString()}/day</span></p>
                    </div>
                    {v.features && (
                      <div className="flex flex-wrap gap-1 justify-center">
                        {v.features.map((f) => (
                          <span key={f} className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Button variant="outline" onClick={() => setShowCompare(false)}>Close</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vehicles Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No vehicles match your filters</p>
              <Button variant="link" onClick={() => { setSearchQuery(''); setSelectedType('All'); }}>Clear filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <AnimatePresence mode="popLayout">
                {filteredVehicles.map((vehicle, i) => (
                  <motion.div
                    key={vehicle.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="group bg-card rounded-2xl md:rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500 ultra-card"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={getVehicleImage(vehicle.name, vehicle.image_url)}
                        alt={vehicle.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-mountain/40 to-transparent" />
                      <div className="absolute top-3 md:top-4 left-3 md:left-4">
                        <span className="px-2.5 md:px-3 py-1 rounded-full bg-emerald text-snow text-xs font-semibold">
                          Available
                        </span>
                      </div>
                      <button
                        onClick={() => toggleCompare(vehicle.id)}
                        className={`absolute top-3 md:top-4 right-3 md:right-4 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          compareList.includes(vehicle.id)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background/80 backdrop-blur-sm text-foreground hover:bg-primary hover:text-primary-foreground'
                        }`}
                      >
                        {compareList.includes(vehicle.id) ? '✓' : 'VS'}
                      </button>
                    </div>

                    <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                      <div>
                        <span className="text-xs md:text-sm text-primary font-medium">{vehicle.type}</span>
                        <h3 className="text-lg md:text-xl font-serif font-bold text-foreground mt-1 no-select">
                          {vehicle.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                        <Users className="w-4 h-4 md:w-5 md:h-5" />
                        <span>{vehicle.capacity} Passengers</span>
                      </div>

                      {vehicle.features && vehicle.features.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                          {vehicle.features.map((feature) => (
                            <span
                              key={feature}
                              className="flex items-center gap-1 px-2 md:px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-border">
                        <div>
                          <span className="text-xl md:text-2xl font-bold text-foreground">
                            PKR {vehicle.price_per_day.toLocaleString()}
                          </span>
                          <p className="text-xs text-muted-foreground">per day</p>
                        </div>
                        <Button variant="default" size="sm" asChild>
                          <Link to={`/booking?vehicle=${vehicle.id}`}>Book Now</Link>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
