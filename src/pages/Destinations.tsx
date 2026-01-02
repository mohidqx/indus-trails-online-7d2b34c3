import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

import attabadLake from '@/assets/attabad-lake.jpg';
import fairyMeadows from '@/assets/fairy-meadows.jpg';
import swatValley from '@/assets/swat-valley.jpg';
import skardu from '@/assets/skardu.jpg';
import heroHunza from '@/assets/hero-hunza.jpg';

const destinations = [
  {
    id: 1,
    name: 'Hunza Valley',
    location: 'Gilgit-Baltistan',
    image: attabadLake,
    description: 'Home to the stunning Attabad Lake, ancient Baltit Fort, and the majestic Rakaposhi peak. Experience the legendary hospitality of Hunza people.',
    highlights: ['Attabad Lake', 'Baltit Fort', 'Passu Cones', 'Eagle\'s Nest'],
    tours: 12,
    altitude: '2,438m',
    bestTime: 'April - October',
  },
  {
    id: 2,
    name: 'Fairy Meadows',
    location: 'Diamer District',
    image: fairyMeadows,
    description: 'The gateway to Nanga Parbat, offering breathtaking views of the ninth highest mountain in the world. A paradise for trekkers and nature lovers.',
    highlights: ['Nanga Parbat View', 'Base Camp Trek', 'Beyal Camp', 'Raikot Bridge'],
    tours: 8,
    altitude: '3,300m',
    bestTime: 'May - September',
  },
  {
    id: 3,
    name: 'Swat Valley',
    location: 'Khyber Pakhtunkhwa',
    image: swatValley,
    description: 'Known as the Switzerland of Pakistan, Swat offers lush green valleys, ancient Buddhist ruins, and the beautiful Malam Jabba ski resort.',
    highlights: ['Malam Jabba', 'Mingora', 'Kalam', 'Mahodand Lake'],
    tours: 10,
    altitude: '980m',
    bestTime: 'March - November',
  },
  {
    id: 4,
    name: 'Skardu',
    location: 'Gilgit-Baltistan',
    image: skardu,
    description: 'Gateway to some of the world\'s highest peaks including K2. Home to Shangrila Resort and the stunning Deosai National Park.',
    highlights: ['Shangrila', 'Deosai Plains', 'Upper Kachura', 'Cold Desert'],
    tours: 15,
    altitude: '2,228m',
    bestTime: 'May - October',
  },
  {
    id: 5,
    name: 'Naran Kaghan',
    location: 'Khyber Pakhtunkhwa',
    image: heroHunza,
    description: 'A picturesque valley famous for Lake Saif ul Malook and Lulusar Lake. Perfect for summer retreats and adventure seekers.',
    highlights: ['Saif ul Malook', 'Lulusar Lake', 'Babusar Pass', 'Ansoo Lake'],
    tours: 9,
    altitude: '2,409m',
    bestTime: 'June - September',
  },
];

export default function Destinations() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-gradient-mountain">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-snow mb-6">
            Our Destinations
          </h1>
          <p className="text-xl text-snow/80 max-w-2xl mx-auto">
            Discover the most breathtaking locations in Pakistan's northern paradise
          </p>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid gap-12">
            {destinations.map((dest, index) => (
              <div
                key={dest.id}
                className={`grid md:grid-cols-2 gap-8 items-center ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                  <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-lg group">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-mountain/60 to-transparent" />
                    <div className="absolute bottom-6 left-6">
                      <span className="px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium">
                        {dest.tours} Tours Available
                      </span>
                    </div>
                  </div>
                </div>
                <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                    <MapPin className="w-4 h-4" />
                    {dest.location}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
                    {dest.name}
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {dest.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-secondary">
                      <p className="text-sm text-muted-foreground">Altitude</p>
                      <p className="font-semibold text-foreground">{dest.altitude}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary">
                      <p className="text-sm text-muted-foreground">Best Time</p>
                      <p className="font-semibold text-foreground">{dest.bestTime}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {dest.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>

                  <Button variant="default" asChild>
                    <Link to="/tours" className="flex items-center gap-2">
                      Explore Tours
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
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
