import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Calendar, Users, Clock, Star, MapPin, Filter, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import hunzaImage from '@/assets/hero-hunza.jpg';
import fairyMeadows from '@/assets/fairy-meadows.jpg';
import skardu from '@/assets/skardu.jpg';
import swatValley from '@/assets/swat-valley.jpg';
import attabadLake from '@/assets/attabad-lake.jpg';

const tours = [
  {
    id: 1,
    name: 'Hunza Valley Explorer',
    duration: '7 Days',
    groupSize: '8-12',
    startDate: 'Mar 15, 2026',
    price: 85000,
    originalPrice: 95000,
    rating: 4.9,
    reviews: 124,
    image: hunzaImage,
    destination: 'Hunza',
    highlights: ['Attabad Lake', 'Baltit Fort', 'Eagle\'s Nest', 'Passu Cones'],
    category: 'Adventure',
  },
  {
    id: 2,
    name: 'Fairy Meadows Trek',
    duration: '5 Days',
    groupSize: '6-10',
    startDate: 'Apr 1, 2026',
    price: 65000,
    originalPrice: 75000,
    rating: 4.8,
    reviews: 89,
    image: fairyMeadows,
    destination: 'Diamer',
    highlights: ['Base Camp Trek', 'Beyal Camp', 'Nanga Parbat View'],
    category: 'Trekking',
  },
  {
    id: 3,
    name: 'Skardu & Deosai Adventure',
    duration: '8 Days',
    groupSize: '10-15',
    startDate: 'May 10, 2026',
    price: 95000,
    originalPrice: 110000,
    rating: 4.9,
    reviews: 156,
    image: skardu,
    destination: 'Skardu',
    highlights: ['Shangrila', 'Deosai Plains', 'Satpara Lake'],
    category: 'Adventure',
  },
  {
    id: 4,
    name: 'Swat Valley Retreat',
    duration: '4 Days',
    groupSize: '8-12',
    startDate: 'Mar 20, 2026',
    price: 45000,
    originalPrice: 50000,
    rating: 4.7,
    reviews: 78,
    image: swatValley,
    destination: 'Swat',
    highlights: ['Malam Jabba', 'Kalam', 'Mahodand Lake'],
    category: 'Family',
  },
  {
    id: 5,
    name: 'Complete North Pakistan',
    duration: '14 Days',
    groupSize: '6-8',
    startDate: 'Jun 1, 2026',
    price: 180000,
    originalPrice: 220000,
    rating: 5.0,
    reviews: 45,
    image: attabadLake,
    destination: 'Multiple',
    highlights: ['Hunza', 'Skardu', 'Fairy Meadows', 'Naltar'],
    category: 'Premium',
  },
];

const categories = ['All', 'Adventure', 'Trekking', 'Family', 'Premium'];

export default function Tours() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTours = tours.filter((tour) => {
    const matchesCategory = selectedCategory === 'All' || tour.category === selectedCategory;
    const matchesSearch = tour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.destination.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {cat}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTours.map((tour) => (
              <div
                key={tour.id}
                className="group bg-card rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={tour.image}
                    alt={tour.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-mountain/60 to-transparent" />
                  
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                      {tour.category}
                    </span>
                    {tour.originalPrice > tour.price && (
                      <span className="px-3 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold">
                        {Math.round(((tour.originalPrice - tour.price) / tour.originalPrice) * 100)}% OFF
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-4 left-4 flex items-center gap-2 glass-dark rounded-full px-3 py-1.5">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="text-snow text-sm font-medium">{tour.rating}</span>
                    <span className="text-snow/60 text-sm">({tour.reviews})</span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {tour.destination}
                  </div>
                  
                  <h3 className="text-xl font-serif font-bold text-foreground">
                    {tour.name}
                  </h3>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {tour.duration}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      {tour.groupSize}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {tour.startDate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">
                          PKR {tour.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">per person</p>
                    </div>
                    <Button variant="default" size="sm" asChild>
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
