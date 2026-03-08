import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Award, Heart, Target, Shield, Star } from 'lucide-react';
import heroImage from '@/assets/hero-hunza.jpg';
import founderImage from '@/assets/founder-shahzaib.jpeg';

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Northern Pakistan" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.1),transparent_60%)]" />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 text-center animate-fade-up">
          <span className="premium-badge !text-snow !border-snow/15 !bg-snow/[0.06] mb-4 inline-flex">
            <Star className="w-4 h-4 text-accent" />
            Our Story
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-snow mb-4 sm:mb-6">About Us</h1>
          <p className="text-base sm:text-xl text-snow/80 max-w-2xl mx-auto">
            Crafting unforgettable journeys through Pakistan's northern paradise since 2015
          </p>
          <div className="gold-divider mx-auto mt-6" />
        </div>
      </section>

      {/* Our Story */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="animate-fade-up">
              <span className="premium-badge mb-4 inline-flex">Our Story</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground mb-4 sm:mb-6">
                Passion for Pakistan's Beauty
              </h2>
              <div className="gold-divider mb-6" />
              <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                <p>
                  Indus Tours Pakistan was founded in 2015 by{' '}
                  <strong className="text-foreground">Shahzaib Khan Mughal</strong>, a passionate traveler and native of
                  Islamabad who wanted to share the incredible beauty of Pakistan's northern regions with the world.
                </p>
                <p>
                  What started as a small venture with a single vehicle has grown into one of the most trusted tour
                  operators in the region, serving hundreds of travelers from around the globe.
                </p>
                <p>
                  Our team consists of experienced local guides, professional drivers, and hospitality experts who are
                  dedicated to providing you with safe, comfortable, and memorable adventures.
                </p>
              </div>
            </div>
            <div className="relative animate-fade-up delay-200">
              <div className="aspect-square rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl ultra-card">
                <img src={founderImage} alt="Shahzaib Khan Mughal - Founder" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="absolute -bottom-4 sm:-bottom-6 -left-2 sm:-left-6 p-4 sm:p-6 glass-card rounded-xl sm:rounded-2xl shadow-premium">
                <p className="text-3xl sm:text-4xl font-serif font-bold text-primary">10+</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Years of Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-12 sm:py-20 bg-secondary/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            {[
              { icon: Target, title: 'Our Mission', color: 'primary', desc: 'To showcase the breathtaking beauty of Pakistan\'s northern regions while providing exceptional travel experiences that create lasting memories.' },
              { icon: Heart, title: 'Our Values', color: 'accent', desc: 'Safety, authenticity, and sustainability guide everything we do. We believe in responsible tourism that benefits local communities.' },
              { icon: Shield, title: 'Our Promise', color: 'primary', desc: 'Your safety and satisfaction are our top priorities. We promise transparent pricing, reliable service, and 24/7 support.' },
            ].map(({ icon: Icon, title, color, desc }, i) => (
              <div key={title} className={`text-center p-6 sm:p-8 glass-card rounded-2xl sm:rounded-3xl ultra-card animate-fade-up`} style={{ animationDelay: `${i * 120}ms` }}>
                <div className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-2xl bg-${color}/10 flex items-center justify-center`}>
                  <Icon className={`w-7 h-7 sm:w-8 sm:h-8 text-${color}`} />
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground mb-3 sm:mb-4">{title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="p-8 sm:p-12 rounded-2xl md:rounded-3xl bg-gradient-premium text-snow relative overflow-hidden animate-fade-up">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/30 rounded-full blur-[60px]" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center relative">
              {[
                { value: '500+', label: 'Happy Travelers' },
                { value: '150+', label: 'Tours Completed' },
                { value: '15+', label: 'Destinations' },
                { value: '4.9', label: 'Average Rating' },
              ].map((stat, i) => (
                <div key={i} className="group">
                  <p className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-accent mb-2 group-hover:scale-110 transition-transform duration-300">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-snow/70 tracking-wide uppercase">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-12 sm:py-20 bg-secondary/30 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/3 rounded-full blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-8 sm:mb-12 animate-fade-up">
            <span className="premium-badge mb-4 inline-flex">Meet The Team</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground">The People Behind Your Adventures</h2>
            <div className="gold-divider mx-auto mt-5" />
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {[
              { name: 'Shahzaib Khan Mughal', role: 'Founder & CEO', img: founderImage, initials: '', desc: 'Visionary leader with a passion for showcasing Pakistan\'s beauty' },
              { name: 'Ahmed Raza', role: 'Head of Operations', img: null, initials: 'AR', desc: 'Ensuring smooth operations and customer satisfaction' },
              { name: 'Fatima Ali', role: 'Customer Relations', img: null, initials: 'FA', desc: 'Dedicated to making every traveler feel at home' },
            ].map((member, i) => (
              <div key={member.name} className={`text-center ultra-card p-6 rounded-2xl bg-card animate-fade-up`} style={{ animationDelay: `${i * 120}ms` }}>
                <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4 rounded-2xl overflow-hidden border-3 border-primary/20 shadow-lg">
                  {member.img ? (
                    <img src={member.img} alt={member.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-snow text-2xl sm:text-3xl font-serif font-bold">
                      {member.initials}
                    </div>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">{member.name}</h3>
                <p className="text-primary font-medium text-sm sm:text-base">{member.role}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
