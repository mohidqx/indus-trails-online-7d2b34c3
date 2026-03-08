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
    <section id="why-us" data-section className="py-16 md:py-28 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[180px] pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/3 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20 animate-fade-up">
          <span className="premium-badge mb-5 inline-flex">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 md:mb-6">
            Your Journey,
            <span className="text-gradient-primary"> Our Passion</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground px-4 leading-relaxed">
            With over a decade of experience, we've perfected the art of creating memorable
            adventures in Pakistan's most spectacular landscapes.
          </p>
          <div className="gold-divider mx-auto mt-6" />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`group p-6 md:p-8 rounded-2xl bg-gradient-to-br ${feature.gradient} border border-border/30 hover:border-primary/20 ultra-card animate-fade-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl ${feature.iconBg} group-hover:scale-110 flex items-center justify-center mb-5 transition-transform duration-300`}>
                <feature.icon className={`w-6 h-6 md:w-7 md:h-7 ${feature.iconColor}`} />
              </div>
              <h3 className="text-lg md:text-xl font-serif font-bold text-foreground mb-2 md:mb-3">{feature.title}</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Banner */}
        <div className="mt-14 md:mt-24 p-8 sm:p-10 md:p-14 rounded-2xl md:rounded-3xl bg-gradient-premium text-snow relative overflow-hidden animate-fade-up">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/30 rounded-full blur-[60px]" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center relative">
            {[
              { value: '10+', label: 'Years of Excellence' },
              { value: '500+', label: 'Happy Travelers' },
              { value: '150+', label: 'Tours Completed' },
              { value: '15+', label: 'Destinations' },
            ].map((stat, index) => (
              <div key={index} className="relative group">
                <p className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-accent mb-2 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-snow/70 tracking-wide uppercase">{stat.label}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-12 bg-gradient-to-b from-transparent via-snow/15 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
