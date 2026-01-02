import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

import attabadLake from '@/assets/attabad-lake.jpg';
import fairyMeadows from '@/assets/fairy-meadows.jpg';
import swatValley from '@/assets/swat-valley.jpg';
import skardu from '@/assets/skardu.jpg';

const destinations = [
  {
    id: 1,
    name: 'Hunza Valley',
    location: 'Gilgit-Baltistan',
    image: attabadLake,
    description: 'Crystal-clear Attabad Lake and ancient Baltit Fort',
    tours: 12,
  },
  {
    id: 2,
    name: 'Fairy Meadows',
    location: 'Diamer District',
    image: fairyMeadows,
    description: 'Gateway to Nanga Parbat, the Killer Mountain',
    tours: 8,
  },
  {
    id: 3,
    name: 'Swat Valley',
    location: 'Khyber Pakhtunkhwa',
    image: swatValley,
    description: 'The Switzerland of Pakistan with lush green valleys',
    tours: 10,
  },
  {
    id: 4,
    name: 'Skardu',
    location: 'Gilgit-Baltistan',
    image: skardu,
    description: 'Shangrila Resort and the majestic Deosai Plains',
    tours: 15,
  },
];

export default function DestinationsSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-light text-emerald text-sm font-medium mb-4">
            Popular Destinations
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            Discover Pakistan's
            <span className="text-gradient-primary"> Hidden Gems</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From the ancient Silk Road to the roof of the world, explore destinations that will
            leave you breathless.
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((dest, index) => (
            <Link
              key={dest.id}
              to={`/destinations/${dest.id}`}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] shadow-card hover:shadow-card-hover transition-all duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <img
                src={dest.image}
                alt={dest.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-mountain via-mountain/30 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="transform transition-all duration-500 group-hover:translate-y-0 translate-y-4">
                  <div className="flex items-center gap-2 text-snow/80 text-sm mb-2">
                    <MapPin className="w-4 h-4" />
                    {dest.location}
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-snow mb-2">{dest.name}</h3>
                  <p className="text-snow/70 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {dest.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-accent text-sm font-medium">{dest.tours} Tours</span>
                    <span className="w-10 h-10 rounded-full bg-snow/20 flex items-center justify-center group-hover:bg-accent transition-colors">
                      <ArrowRight className="w-5 h-5 text-snow group-hover:text-accent-foreground" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link to="/destinations" className="flex items-center gap-2">
              View All Destinations
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
