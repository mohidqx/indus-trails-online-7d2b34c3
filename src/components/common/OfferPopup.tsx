import { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface OfferPopupProps {
  show?: boolean;
  delay?: number;
}

export default function OfferPopup({ show = true, delay = 3000 }: OfferPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!show) return;
    
    const dismissed = localStorage.getItem('offerDismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const hoursPassed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      if (hoursPassed < 24) {
        setIsDismissed(true);
        return;
      }
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [show, delay]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('offerDismissed', Date.now().toString());
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-mountain/60 backdrop-blur-sm animate-fade-in"
        onClick={handleDismiss}
      />

      {/* Popup */}
      <div className="relative w-full max-w-lg bg-card rounded-3xl shadow-xl overflow-hidden animate-scale-in">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-background text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-primary to-emerald p-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-medium mb-3">
            <Sparkles className="w-4 h-4" />
            Limited Time Offer
          </div>
          <h3 className="text-3xl font-serif font-bold text-primary-foreground">
            Special Winter Deal!
          </h3>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <div className="mb-6">
            <p className="text-5xl font-serif font-bold text-primary mb-2">25% OFF</p>
            <p className="text-muted-foreground">On all Hunza Valley Tours</p>
          </div>

          <p className="text-foreground mb-6">
            Book your dream adventure now and save big! Experience the magical winter landscapes
            of Pakistan's northern areas.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="gold" size="lg" asChild onClick={handleDismiss}>
              <Link to="/deals" className="flex items-center gap-2">
                Claim Offer
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" onClick={handleDismiss}>
              Maybe Later
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            *Offer valid until March 31, 2026. Terms & conditions apply.
          </p>
        </div>
      </div>
    </div>
  );
}
