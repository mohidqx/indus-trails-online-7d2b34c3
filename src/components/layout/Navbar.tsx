import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSiteContent } from '@/hooks/useSiteContent';
import logo from '@/assets/indus-tours-logo.jpeg';
const navLinks = [{
  name: 'Home',
  path: '/'
}, {
  name: 'Destinations',
  path: '/destinations'
}, {
  name: 'Tours',
  path: '/tours'
}, {
  name: 'Vehicles',
  path: '/vehicles'
}, {
  name: 'Deals',
  path: '/deals'
}, {
  name: 'About',
  path: '/about'
}, {
  name: 'Contact',
  path: '/contact'
}];
export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const {
    data: content
  } = useSiteContent();
  const phone = content?.phone as string || '+92 300 1234567';
  const address = content?.address as string || 'Islamabad, Pakistan';
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return <header className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-500', isScrolled || !isHomePage ? 'bg-background/95 backdrop-blur-md shadow-md' : 'bg-transparent')}>
      {/* Top Bar */}
      <div className={cn('hidden md:block border-b transition-all duration-300', isScrolled || !isHomePage ? 'border-border bg-muted/50' : 'border-snow/10 bg-mountain/30')}>
        <div className="container mx-auto px-6 py-2 flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <a href={`tel:${phone.replace(/\s/g, '')}`} className={cn('flex items-center gap-2 hover:text-accent transition-colors', isScrolled || !isHomePage ? 'text-muted-foreground' : 'text-snow/80')}>
              <Phone className="w-4 h-4" />
              {phone}
            </a>
            <span className={cn('flex items-center gap-2', isScrolled || !isHomePage ? 'text-muted-foreground' : 'text-snow/80')}>
              <MapPin className="w-4 h-4" />
              {address}
            </span>
          </div>
          {/* Admin link hidden from public navbar; access via /auth */}
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Indus Tours Logo" className="w-12 h-12 rounded-xl object-cover" />
            <div>
              <h1 className={cn('font-serif font-bold text-xl transition-colors', isScrolled || !isHomePage ? 'text-foreground' : 'text-snow')}>Indus Tours</h1>
              <p className={cn('text-xs font-medium tracking-wider uppercase transition-colors', isScrolled || !isHomePage ? 'text-muted-foreground' : 'text-snow/70')}>
                Pakistan
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => <Link key={link.path} to={link.path} className={cn('relative font-medium transition-colors hover:text-accent', location.pathname === link.path ? isScrolled || !isHomePage ? 'text-primary' : 'text-accent' : isScrolled || !isHomePage ? 'text-foreground' : 'text-snow', 'after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:bg-accent after:transition-all after:duration-300', location.pathname === link.path ? 'after:w-full' : 'after:w-0 hover:after:w-full')}>
                {link.name}
              </Link>)}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-4">
            <Button variant={isScrolled || !isHomePage ? 'default' : 'hero'} asChild>
              <Link to="/booking">Book Now</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={cn('lg:hidden p-2 rounded-lg transition-colors', isScrolled || !isHomePage ? 'text-foreground hover:bg-muted' : 'text-snow hover:bg-snow/10')}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={cn('lg:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-lg border-b border-border shadow-lg transition-all duration-300 overflow-hidden', isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0')}>
        <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
          {navLinks.map(link => <Link key={link.path} to={link.path} onClick={() => setIsMobileMenuOpen(false)} className={cn('py-3 px-4 rounded-lg font-medium transition-colors', location.pathname === link.path ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted')}>
              {link.name}
            </Link>)}
          <Button variant="gold" className="mt-4" asChild>
            <Link to="/booking" onClick={() => setIsMobileMenuOpen(false)}>
              Book Your Adventure
            </Link>
          </Button>
        </div>
      </div>
    </header>;
}