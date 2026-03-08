import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Youtube, ArrowRight, Heart, Sparkles } from 'lucide-react';
import { useSiteContent } from '@/hooks/useSiteContent';
import logo from '@/assets/indus-tours-logo.jpeg';

const quickLinks = [
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '/about' },
  { name: 'Destinations', path: '/destinations' },
  { name: 'Tours', path: '/tours' },
  { name: 'Hotels', path: '/hotels' },
  { name: 'Vehicles', path: '/vehicles' },
  { name: 'Deals', path: '/deals' },
];

const supportLinks = [
  { name: 'Book Now', path: '/booking' },
  { name: 'Contact', path: '/contact' },
  { name: 'Feedback', path: '/feedback' },
  { name: 'My Account', path: '/dashboard' },
];

const destinations = ['Hunza Valley', 'Skardu', 'Fairy Meadows', 'Swat Valley', 'Naran Kaghan', 'Chitral'];

export default function Footer() {
  const { data: content } = useSiteContent();
  const phone = (content?.phone as string) || '+92 300 1234567';
  const email = (content?.email as string) || 'info@industours.pk';
  const address = (content?.address as string) || 'Blue Area, F-7 Markaz, Islamabad, Pakistan';
  const facebookUrl = (content?.facebook_url as string) || '#';
  const instagramUrl = (content?.instagram_url as string) || '#';

  const socialLinks = [
    { Icon: Facebook, url: facebookUrl },
    { Icon: Instagram, url: instagramUrl },
    { Icon: Twitter, url: '#' },
    { Icon: Youtube, url: '#' },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-mountain via-[hsl(210_28%_18%)] to-[hsl(210_30%_14%)] text-snow overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[200px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[150px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      {/* Newsletter Section */}
      <div className="container mx-auto px-4 sm:px-6 pt-14 md:pt-20 relative">
        <div className="glass-premium rounded-2xl md:rounded-3xl p-8 md:p-12 text-center mb-14 md:mb-20 shadow-ultra relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-[60px] pointer-events-none" />
          <div className="relative">
            <Sparkles className="w-6 h-6 text-accent mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-snow mb-3">Stay Updated</h3>
            <p className="text-sm text-snow/50 mb-6 max-w-md mx-auto">Get exclusive deals and travel inspiration delivered to your inbox.</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 rounded-xl bg-snow/5 border border-snow/10 text-snow placeholder:text-snow/30 text-sm focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all"
              />
              <button className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm hover:bg-accent/90 transition-all shadow-gold hover:shadow-xl">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 pb-8 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
          {/* Company Info */}
          <div className="space-y-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Indus Tours Logo" className="w-12 h-12 rounded-xl object-cover ring-2 ring-accent/20 shadow-gold" />
              <div>
                <h3 className="font-serif font-bold text-xl">Indus Tours</h3>
                <p className="text-[10px] text-snow/40 tracking-[0.2em] uppercase font-semibold">Pakistan</p>
              </div>
            </div>
            <p className="text-sm text-snow/50 leading-relaxed">
              Experience the breathtaking beauty of Pakistan's northern areas with our expertly
              curated tours. Founded by Shahzaib Khan Mughal.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ Icon, url }, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-snow/5 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-all duration-500 hover:scale-110 hover:shadow-gold border border-snow/5 hover:border-accent"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-base font-semibold mb-5 text-snow/90">Quick Links</h4>
            <div className="w-8 h-0.5 bg-gradient-to-r from-accent to-transparent rounded mb-5" />
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-snow/45 hover:text-accent transition-all duration-300 flex items-center gap-1.5 group">
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Destinations */}
          <div>
            <h4 className="font-serif text-base font-semibold mb-5 text-snow/90">Destinations</h4>
            <div className="w-8 h-0.5 bg-gradient-to-r from-accent to-transparent rounded mb-5" />
            <ul className="space-y-3">
              {destinations.map((dest) => (
                <li key={dest}>
                  <Link to="/destinations" className="text-sm text-snow/45 hover:text-accent transition-all duration-300 flex items-center gap-1.5 group">
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    <span>{dest}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif text-base font-semibold mb-5 text-snow/90">Contact Us</h4>
            <div className="w-8 h-0.5 bg-gradient-to-r from-accent to-transparent rounded mb-5" />
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-accent/10">
                  <MapPin className="w-4 h-4 text-accent" />
                </div>
                <span className="text-sm text-snow/50 leading-relaxed">{address}</span>
              </li>
              <li>
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-sm text-snow/50 hover:text-accent transition-all duration-300">
                  <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 border border-accent/10">
                    <Phone className="w-4 h-4 text-accent" />
                  </div>
                  {phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`} className="flex items-center gap-3 text-sm text-snow/50 hover:text-accent transition-all duration-300">
                  <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 border border-accent/10">
                    <Mail className="w-4 h-4 text-accent" />
                  </div>
                  <span className="truncate">{email}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-snow/5">
        <div className="container mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-snow/30 text-xs text-center md:text-left flex items-center gap-1.5">
            © {new Date().getFullYear()} Indus Tours Pakistan. Crafted with <Heart className="w-3 h-3 text-destructive inline" /> in Pakistan
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs">
            {supportLinks.map((link) => (
              <Link key={link.path} to={link.path} className="text-snow/30 hover:text-accent transition-all duration-300">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
