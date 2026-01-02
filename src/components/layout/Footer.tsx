import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const quickLinks = [
  { name: 'Home', path: '/' },
  { name: 'Destinations', path: '/destinations' },
  { name: 'Tours', path: '/tours' },
  { name: 'Vehicles', path: '/vehicles' },
  { name: 'Deals', path: '/deals' },
];

const supportLinks = [
  { name: 'About Us', path: '/about' },
  { name: 'Contact', path: '/contact' },
  { name: 'FAQ', path: '/faq' },
  { name: 'Feedback', path: '/feedback' },
  { name: 'Privacy Policy', path: '/privacy' },
];

const destinations = [
  'Hunza Valley',
  'Skardu',
  'Fairy Meadows',
  'Swat Valley',
  'Naran Kaghan',
  'Chitral',
];

export default function Footer() {
  return (
    <footer className="bg-mountain text-snow">
      {/* Main Footer */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center font-serif font-bold text-xl text-accent-foreground">
                IT
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl">Indus Tours</h3>
                <p className="text-sm text-snow/70">Pakistan</p>
              </div>
            </div>
            <p className="text-snow/80 leading-relaxed">
              Experience the breathtaking beauty of Pakistan's northern areas with our expertly
              curated tours. Founded by Shahzaib Khan Mughal, we bring you unforgettable adventures.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 rounded-full bg-snow/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-all duration-300"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-snow/80 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Destinations */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6">Destinations</h4>
            <ul className="space-y-3">
              {destinations.map((dest) => (
                <li key={dest}>
                  <Link
                    to="/destinations"
                    className="text-snow/80 hover:text-accent transition-colors"
                  >
                    {dest}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 text-accent flex-shrink-0" />
                <span className="text-snow/80">
                  Blue Area, F-7 Markaz
                  <br />
                  Islamabad, Pakistan
                </span>
              </li>
              <li>
                <a
                  href="tel:+923001234567"
                  className="flex items-center gap-3 text-snow/80 hover:text-accent transition-colors"
                >
                  <Phone className="w-5 h-5 text-accent" />
                  +92 300 1234567
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@industours.pk"
                  className="flex items-center gap-3 text-snow/80 hover:text-accent transition-colors"
                >
                  <Mail className="w-5 h-5 text-accent" />
                  info@industours.pk
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-snow/10">
        <div className="container mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-snow/60 text-sm text-center md:text-left">
            © {new Date().getFullYear()} Indus Tours Pakistan. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            {supportLinks.slice(2).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-snow/60 hover:text-accent transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
