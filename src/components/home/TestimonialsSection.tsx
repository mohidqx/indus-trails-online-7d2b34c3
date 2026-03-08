import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Feedback {
  id: string;
  name: string;
  message: string;
  rating: number;
  tour_name: string | null;
  is_featured: boolean;
  created_at: string;
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Feedback[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data } = await supabase
        .from('feedback_public')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(10);
      if (data && data.length > 0) setTestimonials(data as Feedback[]);
      setIsLoading(false);
    };
    fetchTestimonials();
  }, []);

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-secondary/20 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <section id="testimonials" data-section className="py-16 md:py-28 bg-secondary/20 overflow-hidden relative">
      <div className="absolute top-0 left-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px] pointer-events-none -translate-x-1/2" />
      
      <div className="container mx-auto px-4 sm:px-6 relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-18">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-5">
            <MessageCircle className="w-4 h-4" />
            Testimonials
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 md:mb-6">
            What Our Travelers
            <span className="text-gradient-gold"> Say</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground px-4 leading-relaxed">
            Real stories from real travelers who experienced the magic of Pakistan's north with us.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="relative bg-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-premium shimmer-border">
            <Quote className="absolute top-6 right-6 sm:top-8 sm:right-8 w-12 h-12 sm:w-16 sm:h-16 text-primary/8" />

            <div className="space-y-5 sm:space-y-6">
              <div className="flex gap-1">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-accent text-accent" />
                ))}
              </div>

              <p className="text-lg sm:text-xl md:text-2xl text-foreground leading-relaxed font-serif italic">
                "{testimonials[currentIndex].message}"
              </p>

              <div className="flex items-center gap-3 sm:gap-4 pt-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-base sm:text-lg shadow-teal">
                  {getInitials(testimonials[currentIndex].name)}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm sm:text-base">
                    {testimonials[currentIndex].name}
                  </h4>
                  {testimonials[currentIndex].tour_name && (
                    <p className="text-xs sm:text-sm text-primary/80 font-medium mt-0.5">
                      {testimonials[currentIndex].tour_name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button variant="outline" size="icon" onClick={prev} className="rounded-full border-border/50 hover:border-primary/30 hover:bg-primary/5">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/20 hover:bg-muted-foreground/40'
                  }`}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={next} className="rounded-full border-border/50 hover:border-primary/30 hover:bg-primary/5">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
