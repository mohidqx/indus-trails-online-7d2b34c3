import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

import heroImage from '@/assets/hero-hunza.jpg';

export default function CTASection() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Mountains"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-snow mb-4 sm:mb-6">
            Ready for Your
            <span className="text-gradient-gold block mt-2">Next Adventure?</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-snow/80 mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
            Let us craft your perfect journey through Pakistan's northern paradise. Your dream
            adventure is just one click away.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button variant="hero" size="lg" asChild className="w-full sm:w-auto">
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
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-snow/20">
            {[
              { value: '100%', label: 'Satisfaction' },
              { value: 'Free', label: 'Cancellation' },
              { value: 'Secure', label: 'Payment' },
              { value: '24/7', label: 'Support' },
            ].map((badge, i) => (
              <div key={i} className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-accent">{badge.value}</p>
                <p className="text-xs sm:text-sm text-snow/70">{badge.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
