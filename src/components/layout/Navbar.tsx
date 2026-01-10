import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, MapPin, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSiteContent } from '@/hooks/useSiteContent';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/indus-tours-logo.jpeg';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Destinations', path: '/destinations' },
  { name: 'Tours', path: '/tours' },
  { name: 'Vehicles', path: '/vehicles' },
  { name: 'Hotels', path: '/hotels' },
  { name: 'Deals', path: '/deals' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { data: content } = useSiteContent();
  const { user, isLoading: authLoading } = useAuth();
  
  const phone = (content?.phone as string) || '+92 300 1234567';
  const address = (content?.address as string) || 'Islamabad, Pakistan';
  const announcementText = content?.announcement_text as string;
  const announcementActive = content?.announcement_active === true || content?.announcement_active === 'true';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
      isScrolled || !isHomePage ? 'bg-background/95 backdrop-blur-md shadow-md' : 'bg-transparent'
    )}>
      {/* Announcement Banner */}
      {announcementActive && announcementText && (
        <div className="bg-accent text-accent-foreground text-center py-2 px-4 text-sm font-medium">
          <p className="truncate">{announcementText}</p>
        </div>
      )}

      {/* Top Bar */}
      <div className={cn(
        'hidden md:block border-b transition-all duration-300',
        isScrolled || !isHomePage ? 'border-border bg-muted/50' : 'border-snow/10 bg-mountain/30'
      )}>
        <div className="container mx-auto px-4 sm:px-6 py-2 flex justify-between items-center text-sm">
          <div className="flex items-center gap-4 lg:gap-6">
            <a 
              href={`tel:${phone.replace(/\s/g, '')}`} 
              className={cn(
                'flex items-center gap-2 hover:text-accent transition-colors',
                isScrolled || !isHomePage ? 'text-muted-foreground' : 'text-snow/80'
              )}
            >
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{phone}</span>
            </a>
            <span className={cn(
              'hidden lg:flex items-center gap-2',
              isScrolled || !isHomePage ? 'text-muted-foreground' : 'text-snow/80'
            )}>
              <MapPin className="w-4 h-4 flex-shrink-0" />
              {address}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="container mx-auto px-4 sm:px-6 py-3 lg:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <img 
              src={logo} 
              alt="Indus Tours Logo" 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover" 
            />
            <div>
              <h1 className={cn(
                'font-serif font-bold text-lg sm:text-xl transition-colors',
                isScrolled || !isHomePage ? 'text-foreground' : 'text-snow'
              )}>
                Indus Tours
              </h1>
              <p className={cn(
                'text-xs font-medium tracking-wider uppercase transition-colors',
                isScrolled || !isHomePage ? 'text-muted-foreground' : 'text-snow/70'
              )}>
                Pakistan
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'relative font-medium transition-colors hover:text-accent text-sm xl:text-base',
                  location.pathname === link.path
                    ? isScrolled || !isHomePage ? 'text-primary' : 'text-accent'
                    : isScrolled || !isHomePage ? 'text-foreground' : 'text-snow',
                  'after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:bg-accent after:transition-all after:duration-300',
                  location.pathname === link.path ? 'after:w-full' : 'after:w-0 hover:after:w-full'
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {!authLoading && (
              user ? (
                <Button variant="ghost" asChild className={cn(
                  isScrolled || !isHomePage ? 'text-foreground hover:bg-muted' : 'text-snow hover:bg-snow/10'
                )}>
                  <Link to="/dashboard" className="gap-2">
                    <User className="w-4 h-4" />
                    My Account
                  </Link>
                </Button>
              ) : (
                <Button variant="ghost" asChild className={cn(
                  isScrolled || !isHomePage ? 'text-foreground hover:bg-muted' : 'text-snow hover:bg-snow/10'
                )}>
                  <Link to="/auth" className="gap-2">
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                </Button>
              )
            )}
            <Button variant={isScrolled || !isHomePage ? 'default' : 'hero'} asChild>
              <Link to="/booking">Book Now</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              'lg:hidden p-2 rounded-lg transition-colors',
              isScrolled || !isHomePage ? 'text-foreground hover:bg-muted' : 'text-snow hover:bg-snow/10'
            )}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={cn(
        'lg:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-lg border-b border-border shadow-lg transition-all duration-300 overflow-hidden',
        isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                'py-3 px-4 rounded-lg font-medium transition-colors text-base',
                location.pathname === link.path
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
            {!authLoading && (
              user ? (
                <Button variant="outline" asChild>
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="gap-2">
                    <User className="w-4 h-4" />
                    My Account
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" asChild>
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} className="gap-2">
                    <LogIn className="w-4 h-4" />
                    Login / Sign Up
                  </Link>
                </Button>
              )
            )}
            <Button variant="gold" asChild>
              <Link to="/booking" onClick={() => setIsMobileMenuOpen(false)}>
                Book Your Adventure
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}