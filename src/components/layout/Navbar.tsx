import { useState, useEffect, forwardRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, MapPin, User, LogIn, ChevronRight, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSiteContent } from '@/hooks/useSiteContent';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import logo from '@/assets/indus-tours-logo.jpeg';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Destinations', path: '/destinations' },
  { name: 'Tours', path: '/tours' },
  { name: 'Vehicles', path: '/vehicles' },
  { name: 'Hotels', path: '/hotels' },
  { name: 'Deals', path: '/deals' },
  { name: 'Blog', path: '/blog' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const Navbar = forwardRef<HTMLElement>(function Navbar(_, ref) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { data: content } = useSiteContent();
  const { user, isLoading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const phone = (content?.phone as string) || '+92 300 1234567';
  const address = (content?.address as string) || 'Islamabad, Pakistan';
  const announcementText = content?.announcement_text as string;
  const announcementActive = content?.announcement_active === true || content?.announcement_active === 'true';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrolledOrNotHome = isScrolled || !isHomePage;

  return (
    <header ref={ref} className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-700',
      scrolledOrNotHome
        ? 'bg-background/85 backdrop-blur-2xl shadow-lg border-b border-border/20'
        : 'bg-transparent'
    )}>
      {/* Announcement Banner */}
      {announcementActive && announcementText && (
        <div className="bg-gradient-to-r from-accent via-accent/90 to-accent text-accent-foreground text-center py-2 px-4 text-sm font-semibold tracking-wide">
          <p className="truncate">{announcementText}</p>
        </div>
      )}

      {/* Top Bar */}
      <div className={cn(
        'hidden md:block border-b transition-all duration-500',
        scrolledOrNotHome ? 'border-border/20 bg-muted/20' : 'border-snow/5 bg-mountain/20'
      )}>
        <div className="container mx-auto px-4 sm:px-6 py-2 flex justify-between items-center text-sm">
          <div className="flex items-center gap-5 lg:gap-6">
            <a href={`tel:${phone.replace(/\s/g, '')}`} className={cn(
              'flex items-center gap-2 hover:text-accent transition-colors duration-300',
              scrolledOrNotHome ? 'text-muted-foreground' : 'text-snow/60'
            )}>
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate text-xs font-medium">{phone}</span>
            </a>
            <span className={cn(
              'hidden lg:flex items-center gap-2 text-xs font-medium',
              scrolledOrNotHome ? 'text-muted-foreground' : 'text-snow/60'
            )}>
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              {address}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="container mx-auto px-4 sm:px-6 py-3 lg:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="relative">
              <img src={logo} alt="Indus Tours Logo" className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover ring-2 ring-accent/20 group-hover:ring-accent/50 transition-all duration-500 shadow-sm" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald border-2 border-background" />
            </div>
            <div>
              <h1 className={cn(
                'font-serif font-bold text-lg sm:text-xl transition-colors duration-300 leading-tight',
                scrolledOrNotHome ? 'text-foreground' : 'text-snow'
              )}>
                Indus Tours
              </h1>
              <p className={cn(
                'text-[10px] font-semibold tracking-[0.15em] uppercase transition-colors duration-300',
                scrolledOrNotHome ? 'text-muted-foreground' : 'text-snow/40'
              )}>
                & Tourism
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'relative px-3 xl:px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm',
                  location.pathname === link.path
                    ? scrolledOrNotHome
                      ? 'text-primary bg-primary/5'
                      : 'text-accent bg-snow/5'
                    : scrolledOrNotHome
                      ? 'text-foreground/70 hover:text-foreground hover:bg-muted/50'
                      : 'text-snow/70 hover:text-snow hover:bg-snow/5',
                  'after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:bg-accent after:transition-all after:duration-300 after:rounded-full',
                  location.pathname === link.path ? 'after:w-6' : 'after:w-0 hover:after:w-4'
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={cn(
                'p-2.5 rounded-xl transition-all duration-500',
                scrolledOrNotHome ? 'text-foreground hover:bg-muted' : 'text-snow/70 hover:bg-snow/10'
              )}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {!authLoading && (
              user ? (
                <Button variant="ghost" asChild className={cn(
                  'text-sm rounded-xl',
                  scrolledOrNotHome ? 'text-foreground hover:bg-muted' : 'text-snow/80 hover:bg-snow/10'
                )}>
                  <Link to="/dashboard" className="gap-2">
                    <User className="w-4 h-4" />
                    My Account
                  </Link>
                </Button>
              ) : (
                <Button variant="ghost" asChild className={cn(
                  'text-sm rounded-xl',
                  scrolledOrNotHome ? 'text-foreground hover:bg-muted' : 'text-snow/80 hover:bg-snow/10'
                )}>
                  <Link to="/auth" className="gap-2">
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                </Button>
              )
            )}
            <Button variant={scrolledOrNotHome ? 'default' : 'hero'} size="sm" asChild className="shadow-lg rounded-xl">
              <Link to="/booking">Book Now</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              'lg:hidden p-2.5 rounded-xl transition-all duration-300',
              scrolledOrNotHome ? 'text-foreground hover:bg-muted' : 'text-snow hover:bg-snow/10',
              isMobileMenuOpen && 'bg-muted/50'
            )}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={cn(
        'lg:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-2xl border-b border-border/20 shadow-xl transition-all duration-500 overflow-hidden',
        isMobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                'py-3 px-4 rounded-xl font-medium transition-all duration-300 text-base flex items-center justify-between',
                location.pathname === link.path
                  ? 'bg-primary/8 text-primary'
                  : 'text-foreground hover:bg-muted/50'
              )}
            >
              {link.name}
              <ChevronRight className={cn('w-4 h-4 transition-colors', location.pathname === link.path ? 'text-primary' : 'text-muted-foreground/30')} />
            </Link>
          ))}
          <div className="flex flex-col gap-2.5 mt-4 pt-4 border-t border-border/30">
            <button
              onClick={toggleTheme}
              className="py-3 px-4 rounded-xl font-medium text-base flex items-center justify-between text-foreground hover:bg-muted/50 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
            {!authLoading && (
              user ? (
                <Button variant="outline" asChild className="rounded-xl border-primary/20">
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="gap-2">
                    <User className="w-4 h-4" /> My Account
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" asChild className="rounded-xl border-primary/20">
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} className="gap-2">
                    <LogIn className="w-4 h-4" /> Login / Sign Up
                  </Link>
                </Button>
              )
            )}
            <Button variant="gold" asChild className="rounded-xl">
              <Link to="/booking" onClick={() => setIsMobileMenuOpen(false)}>Book Your Adventure</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
});

export default Navbar;
