import { Link } from 'react-router-dom';
import { ArrowRight, Phone, Shield, Clock, CreditCard, Headphones, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-hunza.jpg';

export default function CTASection() {
  return (
    <section id="cta" data-section className="relative py-24 md:py-36 overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImage} alt="Mountains" className="w-full h-full object-cover scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-br from-mountain/95 via-mountain/85 to-primary/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-mountain/60 via-transparent to-mountain/40" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[150px] pointer-events-none animate-pulse-soft" />
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/8 rounded-full blur-[120px] pointer-events-none animate-pulse-soft delay-500" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[100px] pointer-events-none animate-spotlight" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center animate-fade-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full glass-premium text-snow px-4 py-2 mb-8 shadow-ultra">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold tracking-widest uppercase">Start Your Journey</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-snow mb-6 leading-tight">
            Ready for Your
            <span className="text-gradient-gold block mt-2">Next Adventure?</span>
          </h2>

          {/* Ornamental divider */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-accent/30" />
            <div className="w-2 h-2 rounded-full bg-accent/50 shadow-gold" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-accent/30" />
          </div>

          <p className="text-base sm:text-lg md:text-xl text-snow/65 mb-12 max-w-2xl mx-auto px-4 leading-relaxed font-light">
            Let us craft your perfect journey through Pakistan's northern paradise. Your dream
            adventure is just one click away.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <Button variant="hero" size="lg" asChild className="w-full sm:w-auto animate-glow shadow-gold text-base">
              <Link to="/booking" className="flex items-center justify-center gap-2">
                Start Planning
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="heroOutline" size="lg" asChild className="w-full sm:w-auto">
              <a href="tel:+923001234567" className="flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" />
                Call Us Now
              </a>
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mt-16 pt-10 border-t border-snow/8">
            {[
              { icon: Shield, value: '100%', label: 'Satisfaction' },
              { icon: Clock, value: 'Free', label: 'Cancellation' },
              { icon: CreditCard, value: 'Secure', label: 'Payment' },
              { icon: Headphones, value: '24/7', label: 'Support' },
            ].map((badge, i) => (
              <div key={i} className="text-center group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-snow/5 flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/15 group-hover:scale-110 transition-all duration-500 border border-snow/5">
                  <badge.icon className="w-5 h-5 text-accent/60 group-hover:text-accent transition-colors" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-accent stat-highlight">{badge.value}</p>
                <p className="text-[10px] text-snow/40 mt-1 tracking-[0.15em] uppercase font-medium">{badge.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
