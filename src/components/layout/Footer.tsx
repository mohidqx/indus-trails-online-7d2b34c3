import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Youtube, ArrowRight } from 'lucide-react';
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
    <footer className="relative bg-gradient-to-b from-mountain to-[hsl(210_30%_16%)] text-snow overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[200px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Company Info */}
          <div className="space-y-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Indus Tours Logo" className="w-11 h-11 md:w-12 md:h-12 rounded-xl object-cover ring-2 ring-accent/20" />
              <div>
                <h3 className="font-serif font-bold text-lg md:text-xl">Indus Tours</h3>
                <p className="text-xs text-snow/50 tracking-wider uppercase">Pakistan</p>
              </div>
            </div>
            <p className="text-sm text-snow/60 leading-relaxed">
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
                  className="w-10 h-10 rounded-xl bg-snow/5 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-base font-semibold mb-5 text-snow/90">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-sm text-snow/50 hover:text-accent transition-colors flex items-center gap-1 group">
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Destinations */}
          <div>
            <h4 className="font-serif text-base font-semibold mb-5 text-snow/90">Destinations</h4>
            <ul className="space-y-2.5">
              {destinations.map((dest) => (
                <li key={dest}>
                  <Link to="/destinations" className="text-sm text-snow/50 hover:text-accent transition-colors flex items-center gap-1 group">
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {dest}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif text-base font-semibold mb-5 text-snow/90">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-accent" />
                </div>
                <span className="text-sm text-snow/60">{address}</span>
              </li>
              <li>
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-sm text-snow/60 hover:text-accent transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-accent" />
                  </div>
                  {phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`} className="flex items-center gap-3 text-sm text-snow/60 hover:text-accent transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
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
      <div className="border-t border-snow/6">
        <div className="container mx-auto px-4 sm:px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-snow/35 text-xs text-center md:text-left">
            © {new Date().getFullYear()} Indus Tours Pakistan. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs">
            {supportLinks.map((link) => (
              <Link key={link.path} to={link.path} className="text-snow/35 hover:text-accent transition-colors">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
