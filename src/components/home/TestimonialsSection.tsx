import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Feedback {
  id: string;
  name: string;
  email: string;
  message: string;
  rating: number;
  tour_name: string | null;
  is_featured: boolean;
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Feedback[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data } = await supabase
        .from('feedback')
        .select('*')
        .eq('is_approved', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data && data.length > 0) setTestimonials(data);
      setIsLoading(false);
    };
    
    fetchTestimonials();
  }, []);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (isLoading) {
    return (
      <section className="py-24 bg-secondary/30 overflow-hidden">
        <div className="container mx-auto px-6 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
                "{testimonials[currentIndex].message}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-4">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {getInitials(testimonials[currentIndex].name)}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    {testimonials[currentIndex].name}
                  </h4>
                  {testimonials[currentIndex].tour_name && (
                    <p className="text-sm text-primary font-medium mt-1">
                      {testimonials[currentIndex].tour_name}
                    </p>
                  )}
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
