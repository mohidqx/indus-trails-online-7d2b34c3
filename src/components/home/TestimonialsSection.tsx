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

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  if (isLoading) {
    return (
      <section className="py-20 md:py-28 bg-secondary/20 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <section id="testimonials" data-section className="py-20 md:py-32 bg-secondary/20 overflow-hidden luxury-section relative">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-20 animate-fade-up">
          <span className="premium-badge mb-6 inline-flex">
            <MessageCircle className="w-4 h-4" />
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-4 md:mb-6">
            What Our Travelers
            <span className="text-gradient-gold"> Say</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground px-4 leading-relaxed max-w-2xl mx-auto">
            Real stories from real travelers who experienced the magic of Pakistan's north with us.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-primary/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-gold" />
            <div className="gold-divider" />
            <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-gold" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-primary/30" />
          </div>
        </div>

        {/* Carousel */}
        <div className="relative max-w-4xl mx-auto animate-fade-up delay-200">
          <div className="relative glass-ultra rounded-2xl sm:rounded-3xl p-8 sm:p-10 md:p-14 shadow-ultra">
            {/* Decorative quote */}
            <div className="absolute top-6 right-6 sm:top-8 sm:right-8">
              <Quote className="w-16 h-16 sm:w-20 sm:h-20 text-primary/6" />
            </div>
            <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
              <div className="w-12 h-px bg-gradient-to-r from-accent/30 to-transparent" />
            </div>

            <div className="space-y-6">
              <div className="flex gap-1.5">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent drop-shadow-sm" />
                ))}
              </div>

              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-foreground leading-relaxed font-serif italic">
                "{testimonials[currentIndex].message}"
              </p>

              <div className="flex items-center gap-4 pt-6 border-t border-border/30">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-teal ring-2 ring-primary/20">
                  {getInitials(testimonials[currentIndex].name)}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-base sm:text-lg">
                    {testimonials[currentIndex].name}
                  </h4>
                  {testimonials[currentIndex].tour_name && (
                    <p className="text-sm text-primary/70 font-medium mt-0.5 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-accent" />
                      {testimonials[currentIndex].tour_name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <div className="flex items-center justify-center gap-5 mt-10">
            <Button variant="outline" size="icon" onClick={prev} className="rounded-full border-border/30 hover:border-primary/30 hover:bg-primary/5 hover:shadow-teal transition-all w-11 h-11">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex gap-2.5">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`rounded-full transition-all duration-500 ${
                    index === currentIndex
                      ? 'w-10 h-2.5 bg-primary shadow-teal'
                      : 'w-2.5 h-2.5 bg-muted-foreground/15 hover:bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={next} className="rounded-full border-border/30 hover:border-primary/30 hover:bg-primary/5 hover:shadow-teal transition-all w-11 h-11">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
