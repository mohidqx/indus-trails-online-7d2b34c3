import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Award, Heart, Target, Shield, Star, MapPin, Users, Calendar, ChevronRight } from 'lucide-react';
import heroImage from '@/assets/hero-hunza.jpg';
import founderImage from '@/assets/founder-shahzaib.jpeg';
import { motion, useInView } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const timeline = [
  { year: '2015', title: 'Founded', desc: 'Started with a single vehicle and a dream to showcase Pakistan' },
  { year: '2017', title: 'Fleet Expansion', desc: 'Grew to 5 vehicles and launched first group tours' },
  { year: '2019', title: 'Hotel Partnerships', desc: 'Partnered with 10+ hotels across northern Pakistan' },
  { year: '2021', title: 'Digital Platform', desc: 'Launched online booking system for seamless travel planning' },
  { year: '2023', title: '500+ Travelers', desc: 'Crossed 500 happy travelers milestone' },
  { year: '2025', title: 'Premium Tours', desc: 'Introduced luxury & adventure tour categories' },
];

export default function About() {
  const [teamMembers, setTeamMembers] = useState([
    { name: 'Shahzaib Khan Mughal', role: 'Founder & CEO', img: founderImage, initials: '', desc: 'Visionary leader with a passion for showcasing Pakistan\'s beauty' },
    { name: 'Mohid Mughal', role: 'Head of Operations', img: null as string | null, initials: 'MM', desc: 'Ensuring smooth operations and customer satisfaction' },
  ]);

  useEffect(() => {
    const fetchTeam = async () => {
      const { data } = await supabase.from('site_content').select('key, value').in('key', ['team_members']);
      if (data && data.length > 0) {
        const teamData = data.find(d => d.key === 'team_members');
        if (teamData && Array.isArray(teamData.value)) {
          setTeamMembers(teamData.value.map((m: any) => ({
            name: m.name || '',
            role: m.role || '',
            img: m.img || null,
            initials: m.initials || m.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || '',
            desc: m.desc || '',
          })));
        }
      }
    };
    fetchTeam();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero with Parallax */}
      <section className="page-hero">
        <div className="absolute inset-0">
          <motion.img
            src={heroImage}
            alt="Northern Pakistan"
            className="w-full h-full object-cover"
            loading="lazy"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
          />
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="absolute inset-0 bg-gradient-to-t from-mountain/90 via-mountain/40 to-mountain/60" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.1),transparent_60%)]" />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 text-center z-10 animate-fade-up">
          <span className="premium-badge !text-snow !border-snow/15 !bg-snow/[0.06] mb-4 inline-flex">
            <Star className="w-4 h-4 text-accent" />
            Our Story
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-snow mb-4 sm:mb-6 no-select">About Us</h1>
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
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}
            >
              <span className="premium-badge mb-4 inline-flex">Our Story</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground mb-4 sm:mb-6 no-select">
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
            </motion.div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="aspect-square rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl ultra-card group">
                <img
                  src={founderImage}
                  alt="Shahzaib Khan Mughal - Founder"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-4 sm:-bottom-6 -left-2 sm:-left-6 p-4 sm:p-6 glass-card rounded-xl sm:rounded-2xl shadow-premium">
                <p className="text-3xl sm:text-4xl font-serif font-bold text-primary">10+</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Years of Excellence</p>
              </div>
              <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 p-3 sm:p-4 glass-card rounded-xl shadow-premium">
                <p className="text-xl sm:text-2xl font-serif font-bold text-accent">4.9</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Avg Rating</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-12 sm:py-20 bg-secondary/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <span className="premium-badge mb-4 inline-flex">
              <Calendar className="w-4 h-4" />
              Our Journey
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground no-select">A Decade of Adventures</h2>
            <div className="gold-divider mx-auto mt-5" />
          </motion.div>

          <div className="relative max-w-3xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-border sm:-translate-x-px" />

            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                className={`relative flex items-start gap-4 sm:gap-8 mb-8 ${i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`hidden sm:block flex-1 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                  <div className="bg-card p-5 rounded-2xl shadow-card ultra-card inline-block max-w-sm">
                    <p className="text-sm font-bold text-primary mb-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-md">
                    {item.year.slice(2)}
                  </div>
                </div>
                <div className={`flex-1 sm:hidden`}>
                  <div className="bg-card p-4 rounded-xl shadow-card">
                    <p className="text-xs font-bold text-primary mb-1">{item.year} — {item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <div className="hidden sm:block flex-1">
                  {i % 2 !== 0 ? null : <span className="text-lg font-serif font-bold text-foreground">{item.year}</span>}
                  {i % 2 === 0 ? null : (
                    <div className="bg-card p-5 rounded-2xl shadow-card ultra-card inline-block max-w-sm">
                      <p className="text-sm font-bold text-primary mb-1">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <span className="premium-badge mb-4 inline-flex">What Drives Us</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground no-select">Mission & Values</h2>
            <div className="gold-divider mx-auto mt-5" />
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            {[
              { icon: Target, title: 'Our Mission', color: 'primary', desc: 'To showcase the breathtaking beauty of Pakistan\'s northern regions while providing exceptional travel experiences that create lasting memories.' },
              { icon: Heart, title: 'Our Values', color: 'accent', desc: 'Safety, authenticity, and sustainability guide everything we do. We believe in responsible tourism that benefits local communities.' },
              { icon: Shield, title: 'Our Promise', color: 'primary', desc: 'Your safety and satisfaction are our top priorities. We promise transparent pricing, reliable service, and 24/7 support.' },
            ].map(({ icon: Icon, title, color, desc }, i) => (
              <motion.div
                key={title}
                className="text-center p-6 sm:p-8 glass-card rounded-2xl sm:rounded-3xl ultra-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-2xl bg-${color}/10 flex items-center justify-center`}>
                  <Icon className={`w-7 h-7 sm:w-8 sm:h-8 text-${color}`} />
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground mb-3 sm:mb-4 no-select">{title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats with Animated Counters */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            className="p-8 sm:p-12 rounded-2xl md:rounded-3xl bg-gradient-premium text-snow relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/30 rounded-full blur-[60px]" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center relative">
              {[
                { value: 500, suffix: '+', label: 'Happy Travelers' },
                { value: 150, suffix: '+', label: 'Tours Completed' },
                { value: 15, suffix: '+', label: 'Destinations' },
                { value: 4.9, suffix: '', label: 'Average Rating' },
              ].map((stat, i) => (
                <div key={i} className="group">
                  <p className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-accent mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.value === 4.9 ? '4.9' : <AnimatedCounter target={stat.value} suffix={stat.suffix} />}
                  </p>
                  <p className="text-xs sm:text-sm text-snow/70 tracking-wide uppercase">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section className="py-12 sm:py-20 bg-secondary/30 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/3 rounded-full blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <motion.div
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <span className="premium-badge mb-4 inline-flex">
              <Users className="w-4 h-4" />
              Meet The Team
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground no-select">The People Behind Your Adventures</h2>
            <div className="gold-divider mx-auto mt-5" />
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.name}
                className="text-center ultra-card p-6 rounded-2xl bg-card group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4 rounded-2xl overflow-hidden border-3 border-primary/20 shadow-lg group-hover:scale-105 transition-transform duration-500">
                  {member.img ? (
                    <img src={member.img} alt={member.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-snow text-2xl sm:text-3xl font-serif font-bold">
                      {member.initials}
                    </div>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground no-select">{member.name}</h3>
                <p className="text-primary font-medium text-sm sm:text-base">{member.role}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">{member.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
