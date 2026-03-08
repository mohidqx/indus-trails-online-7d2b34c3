import { Link } from 'react-router-dom';
import { ArrowRight, Phone, Shield, Clock, CreditCard, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-hunza.jpg';

export default function CTASection() {
  return (
    <section id="cta" data-section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImage} alt="Mountains" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-br from-mountain/95 via-mountain/85 to-primary/70" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[150px] pointer-events-none animate-pulse-soft" />
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/8 rounded-full blur-[120px] pointer-events-none animate-pulse-soft delay-500" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center animate-fade-up">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-snow mb-5 sm:mb-6 leading-tight">
            Ready for Your
            <span className="text-gradient-gold block mt-2">Next Adventure?</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-snow/70 mb-10 max-w-2xl mx-auto px-4 leading-relaxed">
            Let us craft your perfect journey through Pakistan's northern paradise. Your dream
            adventure is just one click away.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button variant="hero" size="lg" asChild className="w-full sm:w-auto animate-glow shadow-gold">
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-14 pt-8 border-t border-snow/10">
            {[
              { icon: Shield, value: '100%', label: 'Satisfaction' },
              { icon: Clock, value: 'Free', label: 'Cancellation' },
              { icon: CreditCard, value: 'Secure', label: 'Payment' },
              { icon: Headphones, value: '24/7', label: 'Support' },
            ].map((badge, i) => (
              <div key={i} className="text-center group">
                <badge.icon className="w-5 h-5 text-accent/60 mx-auto mb-2 group-hover:text-accent group-hover:scale-110 transition-all duration-300" />
                <p className="text-xl sm:text-2xl font-bold text-accent">{badge.value}</p>
                <p className="text-xs text-snow/50 mt-0.5 tracking-wide uppercase">{badge.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
