import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Award, Users, MapPin, Heart, Target, Shield } from 'lucide-react';
import heroImage from '@/assets/hero-hunza.jpg';
import founderImage from '@/assets/founder-shahzaib.jpeg';

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Northern Pakistan" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>
        <div className="relative container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-snow mb-6">About Us</h1>
          <p className="text-xl text-snow/80 max-w-2xl mx-auto">
            Crafting unforgettable journeys through Pakistan's northern paradise since 2015
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Our Story
              </span>
              <h2 className="text-4xl font-serif font-bold text-foreground mb-6">Passion for Pakistan's Beauty</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
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
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-xl">
                <img
                  src={founderImage}
                  alt="Shahzaib Khan Mughal - Founder"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 p-6 bg-card rounded-2xl shadow-lg">
                <p className="text-4xl font-serif font-bold text-primary">10+</p>
                <p className="text-muted-foreground">Years of Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-card rounded-3xl shadow-card">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-bold text-foreground mb-4">Our Mission</h3>
              <p className="text-muted-foreground">
                To showcase the breathtaking beauty of Pakistan's northern regions while providing exceptional travel
                experiences that create lasting memories.
              </p>
            </div>
            <div className="text-center p-8 bg-card rounded-3xl shadow-card">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-accent/20 flex items-center justify-center">
                <Heart className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-serif font-bold text-foreground mb-4">Our Values</h3>
              <p className="text-muted-foreground">
                Safety, authenticity, and sustainability guide everything we do. We believe in responsible tourism
                that benefits local communities.
              </p>
            </div>
            <div className="text-center p-8 bg-card rounded-3xl shadow-card">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald/20 flex items-center justify-center">
                <Shield className="w-8 h-8 text-emerald" />
              </div>
              <h3 className="text-xl font-serif font-bold text-foreground mb-4">Our Promise</h3>
              <p className="text-muted-foreground">
                Your safety and satisfaction are our top priorities. We promise transparent pricing, reliable service,
                and 24/7 support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-5xl font-serif font-bold text-primary mb-2">500+</p>
              <p className="text-muted-foreground">Happy Travelers</p>
            </div>
            <div>
              <p className="text-5xl font-serif font-bold text-primary mb-2">150+</p>
              <p className="text-muted-foreground">Tours Completed</p>
            </div>
            <div>
              <p className="text-5xl font-serif font-bold text-primary mb-2">15+</p>
              <p className="text-muted-foreground">Destinations</p>
            </div>
            <div>
              <p className="text-5xl font-serif font-bold text-primary mb-2">4.9</p>
              <p className="text-muted-foreground">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Meet The Team
            </span>
            <h2 className="text-4xl font-serif font-bold text-foreground">The People Behind Your Adventures</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-primary">
                <img
                  src={founderImage}
                  alt="Shahzaib Khan Mughal"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Shahzaib Khan Mughal</h3>
              <p className="text-primary font-medium">Founder & CEO</p>
              <p className="text-sm text-muted-foreground mt-2">
                Visionary leader with a passion for showcasing Pakistan's beauty
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-emerald flex items-center justify-center text-snow text-3xl font-serif font-bold">
                AR
              </div>
              <h3 className="text-xl font-semibold text-foreground">Ahmed Raza</h3>
              <p className="text-primary font-medium">Head of Operations</p>
              <p className="text-sm text-muted-foreground mt-2">Ensuring smooth operations and customer satisfaction</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-3xl font-serif font-bold">
                FA
              </div>
              <h3 className="text-xl font-semibold text-foreground">Fatima Ali</h3>
              <p className="text-primary font-medium">Customer Relations</p>
              <p className="text-sm text-muted-foreground mt-2">Dedicated to making every traveler feel at home</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
