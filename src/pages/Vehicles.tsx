import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Users, Fuel, Snowflake, Wifi, Shield, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const vehicles = [
  {
    id: 1,
    name: 'Toyota Land Cruiser V8',
    category: 'Premium SUV',
    capacity: '6-7 Passengers',
    pricePerDay: 25000,
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
    features: ['4x4', 'AC', 'WiFi', 'GPS', 'First Aid'],
    rating: 4.9,
    available: true,
  },
  {
    id: 2,
    name: 'Toyota Prado',
    category: 'Luxury SUV',
    capacity: '5-6 Passengers',
    pricePerDay: 20000,
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
    features: ['4x4', 'AC', 'Leather Seats', 'GPS'],
    rating: 4.8,
    available: true,
  },
  {
    id: 3,
    name: 'Toyota Fortuner',
    category: 'SUV',
    capacity: '6-7 Passengers',
    pricePerDay: 15000,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80',
    features: ['4x4', 'AC', 'Spacious', 'GPS'],
    rating: 4.7,
    available: true,
  },
  {
    id: 4,
    name: 'Toyota Hiace',
    category: 'Van',
    capacity: '12-14 Passengers',
    pricePerDay: 18000,
    image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80',
    features: ['AC', 'Group Travel', 'Luggage Space'],
    rating: 4.6,
    available: true,
  },
  {
    id: 5,
    name: 'Toyota Coaster',
    category: 'Mini Bus',
    capacity: '20-25 Passengers',
    pricePerDay: 35000,
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80',
    features: ['AC', 'Large Groups', 'Entertainment System'],
    rating: 4.7,
    available: false,
  },
  {
    id: 6,
    name: 'Suzuki APV',
    category: 'Economy',
    capacity: '6-8 Passengers',
    pricePerDay: 10000,
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80',
    features: ['AC', 'Budget Friendly', 'City Tours'],
    rating: 4.5,
    available: true,
  },
];

const featureIcons: Record<string, React.ReactNode> = {
  '4x4': <Shield className="w-4 h-4" />,
  'AC': <Snowflake className="w-4 h-4" />,
  'WiFi': <Wifi className="w-4 h-4" />,
};

export default function Vehicles() {
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
              <p className="text-2xl font-bold text-primary">20+</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="group bg-card rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-mountain/40 to-transparent" />
                  
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      vehicle.available 
                        ? 'bg-emerald text-snow' 
                        : 'bg-destructive text-destructive-foreground'
                    }`}>
                      {vehicle.available ? 'Available' : 'Booked'}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 flex items-center gap-2 glass-dark rounded-full px-3 py-1.5">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="text-snow text-sm font-medium">{vehicle.rating}</span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <span className="text-sm text-primary font-medium">{vehicle.category}</span>
                    <h3 className="text-xl font-serif font-bold text-foreground mt-1">
                      {vehicle.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-5 h-5" />
                    <span>{vehicle.capacity}</span>
                  </div>

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

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <span className="text-2xl font-bold text-foreground">
                        PKR {vehicle.pricePerDay.toLocaleString()}
                      </span>
                      <p className="text-xs text-muted-foreground">per day</p>
                    </div>
                    <Button 
                      variant="default" 
                      size="sm" 
                      asChild
                      disabled={!vehicle.available}
                    >
                      <Link to="/booking">Book Now</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
