import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    location: 'London, UK',
    avatar: 'SM',
    rating: 5,
    text: 'The Hunza Valley tour was absolutely magical! Shahzaib and his team went above and beyond to make our trip unforgettable. The landscapes were breathtaking, and the local hospitality was heartwarming.',
    tour: 'Hunza Valley Explorer',
  },
  {
    id: 2,
    name: 'Ahmed Hassan',
    location: 'Dubai, UAE',
    avatar: 'AH',
    rating: 5,
    text: 'As a Pakistani living abroad, I wanted to show my family the beauty of northern Pakistan. Indus Tours made it so easy and memorable. Professional service, great vehicles, and knowledgeable guides.',
    tour: 'Skardu & Deosai Adventure',
  },
  {
    id: 3,
    name: 'Emma Thompson',
    location: 'Sydney, Australia',
    avatar: 'ET',
    rating: 5,
    text: 'Fairy Meadows exceeded all expectations! The trek to Nanga Parbat base camp was challenging but so rewarding. The team took care of everything - accommodation, meals, and safety.',
    tour: 'Fairy Meadows Trek',
  },
  {
    id: 4,
    name: 'Michael Chen',
    location: 'Singapore',
    avatar: 'MC',
    rating: 5,
    text: 'I\'ve traveled to many countries, but Pakistan\'s northern areas stand out as one of the most beautiful places I\'ve ever seen. Indus Tours provided an exceptional experience from start to finish.',
    tour: 'Complete North Pakistan',
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-24 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold-light text-gold text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            What Our Travelers
            <span className="text-gradient-gold"> Say</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Real stories from real travelers who experienced the magic of Pakistan's north with us.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main Card */}
          <div className="relative bg-card rounded-3xl p-8 md:p-12 shadow-lg">
            <Quote className="absolute top-8 right-8 w-16 h-16 text-primary/10" />

            <div className="space-y-6">
              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>

              {/* Text */}
              <p className="text-xl md:text-2xl text-foreground leading-relaxed font-serif italic">
                "{testimonials[currentIndex].text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-4">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {testimonials[currentIndex].avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    {testimonials[currentIndex].name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonials[currentIndex].location}
                  </p>
                  <p className="text-sm text-primary font-medium mt-1">
                    {testimonials[currentIndex].tour}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button variant="outline" size="icon" onClick={prev} className="rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === currentIndex ? 'w-8 bg-primary' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>

            <Button variant="outline" size="icon" onClick={next} className="rounded-full">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
