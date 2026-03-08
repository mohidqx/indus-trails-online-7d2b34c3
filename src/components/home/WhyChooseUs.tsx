import { Shield, Users, MapPin, Headphones, Award, Heart } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Safety First',
    description: 'Your safety is our priority. Experienced guides, well-maintained vehicles, and comprehensive travel insurance.',
    gradient: 'from-primary/10 to-primary/5',
    iconBg: 'bg-primary/15',
    iconColor: 'text-primary',
  },
  {
    icon: Users,
    title: 'Expert Local Guides',
    description: 'Our guides are locals who know every trail, story, and hidden gem in the northern regions.',
    gradient: 'from-accent/10 to-accent/5',
    iconBg: 'bg-accent/15',
    iconColor: 'text-accent',
  },
  {
    icon: MapPin,
    title: 'Authentic Experiences',
    description: 'Immerse yourself in local culture, cuisine, and traditions for an unforgettable journey.',
    gradient: 'from-emerald/10 to-emerald/5',
    iconBg: 'bg-emerald/15',
    iconColor: 'text-emerald',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Round-the-clock assistance before, during, and after your trip for complete peace of mind.',
    gradient: 'from-lake/10 to-lake/5',
    iconBg: 'bg-lake/15',
    iconColor: 'text-lake',
  },
  {
    icon: Award,
    title: 'Award Winning',
    description: 'Recognized as one of Pakistan\'s top tour operators with years of excellence in service.',
    gradient: 'from-sunset/10 to-sunset/5',
    iconBg: 'bg-sunset/15',
    iconColor: 'text-sunset',
  },
  {
    icon: Heart,
    title: 'Sustainable Tourism',
    description: 'We are committed to preserving the natural beauty and supporting local communities.',
    gradient: 'from-destructive/8 to-destructive/3',
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
  },
];

export default function WhyChooseUs() {
  return (
    <section id="why-us" data-section className="py-20 md:py-32 bg-background luxury-section texture-noise relative">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-20 animate-fade-up">
          <span className="premium-badge mb-6 inline-flex">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-4 md:mb-6">
            Your Journey,
            <span className="text-gradient-primary"> Our Passion</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground px-4 leading-relaxed max-w-2xl mx-auto">
            With over a decade of experience, we've perfected the art of creating memorable
            adventures in Pakistan's most spectacular landscapes.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-primary/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-gold" />
            <div className="gold-divider" />
            <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-gold" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-primary/30" />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`group p-7 md:p-9 rounded-2xl md:rounded-3xl bg-gradient-to-br ${feature.gradient} border border-border/20 hover:border-primary/15 ultra-card-glow animate-fade-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${feature.iconBg} group-hover:scale-110 flex items-center justify-center mb-6 transition-all duration-500 shadow-sm`}>
                <feature.icon className={`w-7 h-7 md:w-8 md:h-8 ${feature.iconColor} transition-transform duration-300`} />
              </div>
              <h3 className="text-lg md:text-xl font-serif font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Banner */}
        <div className="mt-16 md:mt-28 p-10 sm:p-12 md:p-16 rounded-2xl md:rounded-3xl bg-gradient-premium text-snow relative overflow-hidden animate-fade-up shadow-ultra">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-72 h-72 bg-accent/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-primary/30 rounded-full blur-[80px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-snow/5 rounded-full blur-[60px]" />
          </div>

          {/* Decorative lines */}
          <div className="absolute top-8 left-8 w-20 h-px bg-gradient-to-r from-accent/30 to-transparent" />
          <div className="absolute bottom-8 right-8 w-20 h-px bg-gradient-to-l from-accent/30 to-transparent" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 text-center relative">
            {[
              { value: '10+', label: 'Years of Excellence' },
              { value: '500+', label: 'Happy Travelers' },
              { value: '150+', label: 'Tours Completed' },
              { value: '15+', label: 'Destinations' },
            ].map((stat, index) => (
              <div key={index} className="relative group cursor-default">
                <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-accent mb-2 drop-shadow-lg group-hover:scale-110 transition-transform duration-500 stat-highlight">
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-xs text-snow/60 tracking-[0.15em] uppercase font-medium">{stat.label}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-14 bg-gradient-to-b from-transparent via-snow/12 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
