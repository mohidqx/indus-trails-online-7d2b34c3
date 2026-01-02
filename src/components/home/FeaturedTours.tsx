import { Link } from 'react-router-dom';
import { Calendar, Users, Clock, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

import hunzaImage from '@/assets/hero-hunza.jpg';
import fairyMeadows from '@/assets/fairy-meadows.jpg';
import skardu from '@/assets/skardu.jpg';

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
    highlights: ['Attabad Lake', 'Baltit Fort', 'Eagle\'s Nest', 'Passu Cones'],
    featured: true,
  },
  {
    id: 2,
    name: 'Fairy Meadows & Nanga Parbat',
    duration: '5 Days',
    groupSize: '6-10',
    startDate: 'Apr 1, 2026',
    price: 65000,
    originalPrice: 75000,
    rating: 4.8,
    reviews: 89,
    image: fairyMeadows,
    highlights: ['Base Camp Trek', 'Beyal Camp', 'Nanga Parbat View', 'Raikot Bridge'],
    featured: false,
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
    highlights: ['Shangrila', 'Deosai Plains', 'Satpara Lake', 'Cold Desert'],
    featured: true,
  },
];

export default function FeaturedTours() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-gold-light text-gold text-sm font-medium mb-4">
              Featured Tours
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Unforgettable
              <span className="text-gradient-gold"> Adventures</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Handcrafted journeys through Pakistan's most spectacular landscapes, led by
              experienced local guides.
            </p>
          </div>
          <Button variant="outline" size="lg" asChild className="w-fit">
            <Link to="/tours" className="flex items-center gap-2">
              View All Tours
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>

        {/* Tours Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {tours.map((tour, index) => (
            <div
              key={tour.id}
              className="group bg-card rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={tour.image}
                  alt={tour.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-mountain/60 to-transparent" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {tour.featured && (
                    <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                      Featured
                    </span>
                  )}
                  {tour.originalPrice > tour.price && (
                    <span className="px-3 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold">
                      {Math.round(((tour.originalPrice - tour.price) / tour.originalPrice) * 100)}%
                      OFF
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 glass-dark rounded-full px-3 py-1.5">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  <span className="text-snow text-sm font-medium">{tour.rating}</span>
                  <span className="text-snow/60 text-sm">({tour.reviews})</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">
                  {tour.name}
                </h3>

                {/* Meta */}
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

                {/* Highlights */}
                <div className="flex flex-wrap gap-2">
                  {tour.highlights.slice(0, 3).map((highlight) => (
                    <span
                      key={highlight}
                      className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs"
                    >
                      {highlight}
                    </span>
                  ))}
                  {tour.highlights.length > 3 && (
                    <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                      +{tour.highlights.length - 3} more
                    </span>
                  )}
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-foreground">
                        PKR {tour.price.toLocaleString()}
                      </span>
                      {tour.originalPrice > tour.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {tour.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">per person</p>
                  </div>
                  <Button variant="default" size="sm" asChild>
                    <Link to={`/tours/${tour.id}`}>Book Now</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
