import { Shield, Users, MapPin, Headphones, Award, Heart } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Safety First',
    description:
      'Your safety is our priority. Experienced guides, well-maintained vehicles, and comprehensive travel insurance.',
  },
  {
    icon: Users,
    title: 'Expert Local Guides',
    description:
      'Our guides are locals who know every trail, story, and hidden gem in the northern regions.',
  },
  {
    icon: MapPin,
    title: 'Authentic Experiences',
    description:
      'Immerse yourself in local culture, cuisine, and traditions for an unforgettable journey.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description:
      'Round-the-clock assistance before, during, and after your trip for complete peace of mind.',
  },
  {
    icon: Award,
    title: 'Award Winning',
    description:
      'Recognized as one of Pakistan\'s top tour operators with years of excellence in service.',
  },
  {
    icon: Heart,
    title: 'Sustainable Tourism',
    description:
      'We are committed to preserving the natural beauty and supporting local communities.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Why Choose Us
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            Your Journey,
            <span className="text-gradient-primary"> Our Passion</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            With over a decade of experience, we've perfected the art of creating memorable
            adventures in Pakistan's most spectacular landscapes.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 group-hover:bg-primary flex items-center justify-center mb-6 transition-colors duration-300">
                <feature.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="text-xl font-serif font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Banner */}
        <div className="mt-20 p-8 md:p-12 rounded-3xl bg-gradient-mountain text-snow">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10+', label: 'Years of Excellence' },
              { value: '500+', label: 'Happy Travelers' },
              { value: '150+', label: 'Tours Completed' },
              { value: '15+', label: 'Destinations' },
            ].map((stat, index) => (
              <div key={index}>
                <p className="text-4xl md:text-5xl font-serif font-bold text-accent mb-2">
                  {stat.value}
                </p>
                <p className="text-snow/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
