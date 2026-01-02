import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Clock, Percent, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

import hunzaImage from '@/assets/hero-hunza.jpg';
import fairyMeadows from '@/assets/fairy-meadows.jpg';
import skardu from '@/assets/skardu.jpg';
import swatValley from '@/assets/swat-valley.jpg';

const deals = [
  {
    id: 1,
    title: 'Winter Wonderland Hunza',
    description: 'Experience the magical snow-covered landscapes of Hunza Valley with 25% discount on all bookings.',
    discount: 25,
    originalPrice: 95000,
    discountedPrice: 71250,
    image: hunzaImage,
    validUntil: 'March 31, 2026',
    duration: '7 Days',
    featured: true,
  },
  {
    id: 2,
    title: 'Early Bird Fairy Meadows',
    description: 'Book your summer adventure early and save 20% on the spectacular Fairy Meadows trek.',
    discount: 20,
    originalPrice: 75000,
    discountedPrice: 60000,
    image: fairyMeadows,
    validUntil: 'April 15, 2026',
    duration: '5 Days',
    featured: false,
  },
  {
    id: 3,
    title: 'Skardu Group Discount',
    description: 'Travel with friends and family! Groups of 6+ get 30% off on our premium Skardu package.',
    discount: 30,
    originalPrice: 110000,
    discountedPrice: 77000,
    image: skardu,
    validUntil: 'May 31, 2026',
    duration: '8 Days',
    featured: true,
  },
  {
    id: 4,
    title: 'Weekend Swat Getaway',
    description: 'Perfect for a quick escape! 15% off on our popular Swat Valley weekend package.',
    discount: 15,
    originalPrice: 50000,
    discountedPrice: 42500,
    image: swatValley,
    validUntil: 'Ongoing',
    duration: '3 Days',
    featured: false,
  },
];

export default function Deals() {
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

      {/* Featured Deal */}
      {deals.filter(d => d.featured)[0] && (
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-6">
            <div className="relative bg-card rounded-3xl overflow-hidden shadow-xl">
              <div className="grid md:grid-cols-2">
                <div className="relative aspect-[4/3] md:aspect-auto">
                  <img
                    src={deals.filter(d => d.featured)[0].image}
                    alt={deals.filter(d => d.featured)[0].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-2 rounded-full bg-destructive text-destructive-foreground font-bold text-lg">
                      {deals.filter(d => d.featured)[0].discount}% OFF
                    </span>
                  </div>
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <span className="text-sm text-primary font-medium mb-2">Featured Deal</span>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
                    {deals.filter(d => d.featured)[0].title}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {deals.filter(d => d.featured)[0].description}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-5 h-5" />
                      {deals.filter(d => d.featured)[0].duration}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-5 h-5" />
                      Valid until {deals.filter(d => d.featured)[0].validUntil}
                    </div>
                  </div>

                  <div className="flex items-baseline gap-4 mb-8">
                    <span className="text-4xl font-bold text-primary">
                      PKR {deals.filter(d => d.featured)[0].discountedPrice.toLocaleString()}
                    </span>
                    <span className="text-xl text-muted-foreground line-through">
                      PKR {deals.filter(d => d.featured)[0].originalPrice.toLocaleString()}
                    </span>
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
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-mountain/60 to-transparent" />
                  
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-2 rounded-full bg-destructive text-destructive-foreground font-bold">
                      {deal.discount}% OFF
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
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {deal.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {deal.validUntil}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <span className="text-2xl font-bold text-primary">
                        PKR {deal.discountedPrice.toLocaleString()}
                      </span>
                      <p className="text-sm text-muted-foreground line-through">
                        PKR {deal.originalPrice.toLocaleString()}
                      </p>
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
