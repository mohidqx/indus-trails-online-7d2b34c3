import { Link } from 'react-router-dom';
import { ChevronDown, Play, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSiteContent } from '@/hooks/useSiteContent';
import heroImage from '@/assets/hero-hunza.jpg';
import logo from '@/assets/indus-tours-logo.jpeg';

export default function HeroSection() {
  const { data: content } = useSiteContent();
  const heroTitle = (content?.hero_title as string) || 'Explore the Northern Paradise';
  const heroSubtitle = (content?.hero_subtitle as string) || "Journey through the breathtaking valleys, majestic mountains, and ancient Silk Road heritage of Pakistan's northern regions.";

  return (
    <section id="hero" data-section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Hunza Valley Pakistan" className="w-full h-full object-cover scale-105" />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-gradient-to-t from-mountain/90 via-mountain/20 to-mountain/40" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/8 rounded-full blur-[100px] pointer-events-none animate-pulse-soft delay-500" />
      </div>

      {/* Floating Cards */}
      <div className="absolute top-1/4 right-10 hidden xl:block animate-float">
        <div className="glass-premium rounded-2xl px-6 py-4 text-snow ultra-card">
          <div className="flex items-center gap-2 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-accent text-accent" />
            ))}
          </div>
          <p className="text-sm font-medium">Rated 4.9 by 500+ travelers</p>
        </div>
      </div>

      <div className="absolute bottom-1/3 left-10 hidden xl:block animate-float delay-300">
        <div className="glass-premium rounded-2xl px-6 py-4 text-snow ultra-card">
          <p className="text-3xl font-serif font-bold text-accent">150+</p>
          <p className="text-sm text-snow/80">Tours Completed</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative container mx-auto px-4 sm:px-6 pt-28 md:pt-32 pb-16 md:pb-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 sm:gap-3 rounded-full glass-premium text-snow animate-fade-up px-3 sm:px-5 py-2 sm:py-2.5">
            <img src={logo} alt="Indus Tours Logo" className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-accent/50" />
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-xs sm:text-sm font-medium tracking-wide">Pakistan Is Calling</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif font-bold text-snow leading-tight animate-fade-up delay-100">
            {heroTitle.split(' ').slice(0, 2).join(' ')}
            <span className="block text-gradient-gold mt-2">
              {heroTitle.split(' ').slice(2).join(' ') || 'Northern Paradise'}
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-snow/75 max-w-2xl mx-auto leading-relaxed animate-fade-up delay-200 px-2">
            {heroSubtitle}
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 md:pt-6 animate-fade-up delay-300">
            <Button variant="hero" size="lg" className="w-full sm:w-auto animate-glow shadow-gold" asChild>
              <Link to="/tours">Explore Tours</Link>
            </Button>
            <Button variant="heroOutline" size="lg" className="group w-full sm:w-auto" asChild>
              <Link to="/about" className="flex items-center justify-center gap-2 sm:gap-3">
                <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-snow/10 group-hover:bg-snow/20 flex items-center justify-center transition-all duration-300 backdrop-blur-sm">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-snow text-snow ml-0.5" />
                </span>
                <span>Watch Our Story</span>
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 lg:gap-16 pt-10 md:pt-16 animate-fade-up delay-400">
            {[
              { value: '15+', label: 'Destinations' },
              { value: '500+', label: 'Happy Travelers' },
              { value: '10+', label: 'Years Experience' },
              { value: '24/7', label: 'Support' },
            ].map((stat, index) => (
              <div key={index} className="text-center relative group">
                <p className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-accent drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </p>
                <p className="text-snow/60 text-xs sm:text-sm mt-1 tracking-wide uppercase">{stat.label}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-10 bg-gradient-to-b from-transparent via-snow/20 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center gap-2">
          <span className="text-snow/40 text-[10px] tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-5 h-5 text-snow/40" />
        </div>
      </div>
    </section>
  );
}
