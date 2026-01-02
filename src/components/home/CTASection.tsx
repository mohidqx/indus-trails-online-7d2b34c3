import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

import heroImage from '@/assets/hero-hunza.jpg';

export default function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Mountains"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-snow mb-6">
            Ready for Your
            <span className="text-gradient-gold block mt-2">Next Adventure?</span>
          </h2>
          <p className="text-xl text-snow/80 mb-10 max-w-2xl mx-auto">
            Let us craft your perfect journey through Pakistan's northern paradise. Your dream
            adventure is just one click away.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" asChild>
              <Link to="/booking" className="flex items-center gap-2">
                Start Planning
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <a href="tel:+923001234567" className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Call Us Now
              </a>
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-12 pt-8 border-t border-snow/20">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">100%</p>
              <p className="text-sm text-snow/70">Satisfaction</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">Free</p>
              <p className="text-sm text-snow/70">Cancellation</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">Secure</p>
              <p className="text-sm text-snow/70">Payment</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">24/7</p>
              <p className="text-sm text-snow/70">Support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
