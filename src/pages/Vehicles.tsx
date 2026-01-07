import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Users, Star, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

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

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-gradient-mountain">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-snow mb-6">
            Our Fleet
          </h1>
          <p className="text-xl text-snow/80 max-w-2xl mx-auto">
            Comfortable, well-maintained vehicles for your mountain adventures
          </p>
        </div>
      </section>

      {/* Info Banner */}
      <section className="py-8 bg-primary/10 border-b border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{vehicles.length}+</p>
              <p className="text-sm text-muted-foreground">Vehicles</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">Expert</p>
              <p className="text-sm text-muted-foreground">Drivers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">24/7</p>
              <p className="text-sm text-muted-foreground">Support</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">Insured</p>
              <p className="text-sm text-muted-foreground">All Vehicles</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicles Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No vehicles available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="group bg-card rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {vehicle.image_url ? (
                      <img
                        src={vehicle.image_url}
                        alt={vehicle.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-mountain/40 to-transparent" />
                    
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-emerald text-snow text-xs font-semibold">
                        Available
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <span className="text-sm text-primary font-medium">{vehicle.type}</span>
                      <h3 className="text-xl font-serif font-bold text-foreground mt-1">
                        {vehicle.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-5 h-5" />
                      <span>{vehicle.capacity} Passengers</span>
                    </div>

                    {vehicle.features && vehicle.features.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {vehicle.features.map((feature) => (
                          <span
                            key={feature}
                            className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <span className="text-2xl font-bold text-foreground">
                          PKR {vehicle.price_per_day.toLocaleString()}
                        </span>
                        <p className="text-xs text-muted-foreground">per day</p>
                      </div>
                      <Button variant="default" size="sm" asChild>
                        <Link to={`/booking?vehicle=${vehicle.id}`}>Book Now</Link>
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
