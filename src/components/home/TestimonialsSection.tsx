import { useState, useEffect, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { TestimonialSkeleton } from '@/components/common/LoadingSkeleton';

interface Feedback {
  id: string;
  name: string;
  message: string;
  rating: number;
  tour_name: string | null;
  is_featured: boolean;
  created_at: string;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 120 : -120,
    opacity: 0,
    scale: 0.92,
    rotateY: direction > 0 ? 8 : -8,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 120 : -120,
    opacity: 0,
    scale: 0.92,
    rotateY: direction < 0 ? 8 : -8,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

const staggerChildren = {
  center: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const childFade = {
  enter: { opacity: 0, y: 16 },
  center: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
};

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Feedback[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState(0);

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

  const navigate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      if (newDirection > 0) return (prev + 1) % testimonials.length;
      return (prev - 1 + testimonials.length) % testimonials.length;
    });
  }, [testimonials.length]);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const timer = setInterval(() => navigate(1), 6000);
    return () => clearInterval(timer);
  }, [testimonials.length, navigate]);

  if (isLoading) return <TestimonialSkeleton />;
  if (testimonials.length === 0) return null;

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const current = testimonials[currentIndex];

  return (
    <section id="testimonials" data-section className="py-20 md:py-32 bg-secondary/20 overflow-hidden luxury-section relative">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center max-w-3xl mx-auto mb-14 md:mb-20"
        >
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
        </motion.div>

        {/* Carousel */}
        <div className="relative max-w-4xl mx-auto" style={{ perspective: '1200px' }}>
          <div className="relative glass-ultra rounded-2xl sm:rounded-3xl p-8 sm:p-10 md:p-14 shadow-ultra min-h-[280px] sm:min-h-[320px]">
            {/* Decorative quote */}
            <motion.div
              className="absolute top-6 right-6 sm:top-8 sm:right-8"
              animate={{ opacity: [0.04, 0.08, 0.04], scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Quote className="w-16 h-16 sm:w-20 sm:h-20 text-primary" />
            </motion.div>
            <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
              <div className="w-12 h-px bg-gradient-to-r from-accent/30 to-transparent" />
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={{ ...slideVariants, ...staggerChildren }}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div className="flex gap-1.5">
                  {[...Array(current.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0, rotate: -30 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2 + i * 0.08, duration: 0.4, type: 'spring', stiffness: 200 }}
                    >
                      <Star className="w-5 h-5 fill-accent text-accent drop-shadow-sm" />
                    </motion.div>
                  ))}
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-foreground leading-relaxed font-serif italic"
                >
                  "{current.message}"
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.25 }}
                  className="flex items-center gap-4 pt-6 border-t border-border/30"
                >
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-teal ring-2 ring-primary/20"
                  >
                    {getInitials(current.name)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-base sm:text-lg">
                      {current.name}
                    </h4>
                    {current.tour_name && (
                      <p className="text-sm text-primary/70 font-medium mt-0.5 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-accent" />
                        {current.tour_name}
                      </p>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Nav */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center justify-center gap-5 mt-10"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full border-border/30 hover:border-primary/30 hover:bg-primary/5 hover:shadow-teal transition-all w-11 h-11"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex gap-2.5">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => { setDirection(index > currentIndex ? 1 : -1); setCurrentIndex(index); }}
                  className={`rounded-full transition-colors duration-300 ${
                    index === currentIndex
                      ? 'bg-primary shadow-teal'
                      : 'bg-muted-foreground/15 hover:bg-muted-foreground/30'
                  }`}
                  animate={{
                    width: index === currentIndex ? 40 : 10,
                    height: 10,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(1)}
              className="rounded-full border-border/30 hover:border-primary/30 hover:bg-primary/5 hover:shadow-teal transition-all w-11 h-11"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
