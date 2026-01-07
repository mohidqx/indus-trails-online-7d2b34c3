import { Link } from 'react-router-dom';
import { ChevronDown, Play, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSiteContent } from '@/hooks/useSiteContent';
import heroImage from '@/assets/hero-hunza.jpg';
import logo from '@/assets/indus-tours-logo.jpeg';
export default function HeroSection() {
  const {
    data: content
  } = useSiteContent();
  const heroTitle = content?.hero_title as string || 'Explore the Northern Paradise';
  const heroSubtitle = content?.hero_subtitle as string || 'Journey through the breathtaking valleys, majestic mountains, and ancient Silk Road heritage of Pakistan\'s northern regions.';
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Hunza Valley Pakistan" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-gradient-to-t from-mountain/80 via-transparent to-mountain/30" />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 right-10 hidden lg:block animate-float">
        <div className="glass-dark rounded-2xl px-6 py-4 text-snow">
          <div className="flex items-center gap-2 mb-2">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-accent text-accent" />)}
          </div>
          <p className="text-sm font-medium">Rated 4.9 by 500+ travelers</p>
        </div>
      </div>

      <div className="absolute bottom-1/3 left-10 hidden lg:block animate-float delay-300">
        <div className="glass-dark rounded-2xl px-6 py-4 text-snow">
          <p className="text-3xl font-serif font-bold text-accent">150+</p>
          <p className="text-sm">Tours Completed</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative container mx-auto px-6 pt-32 pb-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Logo Badge */}
          <div className="inline-flex items-center gap-3 rounded-full glass-dark text-snow animate-fade-up px-[15px] py-[10px]">
            <img src={logo} alt="Indus Tours Logo" className="w-14 h-14 rounded-full object-cover border-2 border-accent" />
            <span className="text-sm font-medium">Pakistan Is Calling</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-snow leading-tight animate-fade-up delay-100">
            {heroTitle.split(' ').slice(0, 2).join(' ')}
            <span className="block text-gradient-gold">
              {heroTitle.split(' ').slice(2).join(' ') || 'Northern Paradise'}
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-snow/80 max-w-2xl mx-auto leading-relaxed animate-fade-up delay-200">
            {heroSubtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-fade-up delay-300">
            <Button variant="hero" size="xl" asChild>
              <Link to="/tours">Explore Tours</Link>
            </Button>
            <Button variant="heroOutline" size="xl" className="group" asChild>
              <Link to="/about" className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-full bg-snow/20 group-hover:bg-snow/30 flex items-center justify-center transition-colors">
                  <Play className="w-5 h-5 fill-snow text-snow ml-1" />
                </span>
                Watch Our Story
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 pt-12 animate-fade-up delay-400">
            {[{
            value: '15+',
            label: 'Destinations'
          }, {
            value: '500+',
            label: 'Happy Travelers'
          }, {
            value: '10+',
            label: 'Years Experience'
          }, {
            value: '24/7',
            label: 'Support'
          }].map((stat, index) => <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-serif font-bold text-accent">
                  {stat.value}
                </p>
                <p className="text-snow/70 text-sm mt-1">{stat.label}</p>
              </div>)}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-8 h-8 text-snow/60" />
      </div>
    </section>;
}