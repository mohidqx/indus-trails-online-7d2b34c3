import { useState, useEffect, useRef, useCallback } from 'react';
import logo from '@/assets/indus-tours-logo.jpeg';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, MapPin, CalendarDays, Car, Tag, MessageSquare, Settings,
  LogOut, FileText, Bell, BarChart3, Loader2, Menu, Hotel, Home, Users, Activity, Eye,
  ChevronRight, Zap, Search, Mail, MessageCircle, Shield, Server, FileCheck, Monitor,
  Skull, BookOpen, Image, Gift, AlertTriangle, X, Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAdminSession } from '@/hooks/useAdminSession';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminBookings from '@/components/admin/AdminBookings';
import AdminTours from '@/components/admin/AdminTours';
import AdminVehicles from '@/components/admin/AdminVehicles';
import AdminHotels from '@/components/admin/AdminHotels';
import AdminDeals from '@/components/admin/AdminDeals';
import AdminFeedback from '@/components/admin/AdminFeedback';
import AdminContent from '@/components/admin/AdminContent';
import AdminCMS from '@/components/admin/AdminCMS';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminActivityLogs from '@/components/admin/AdminActivityLogs';
import AdminVisitors from '@/components/admin/AdminVisitors';
import AdminDestinations from '@/components/admin/AdminDestinations';
import AdminSEO from '@/components/admin/AdminSEO';
import AdminEmailTemplates from '@/components/admin/AdminEmailTemplates';
import AdminNotifications from '@/components/admin/AdminNotifications';
import AdminContactMessages from '@/components/admin/AdminContactMessages';
import AdminSecurityDashboard from '@/components/admin/AdminSecurityDashboard';
import AdminSystemHealth from '@/components/admin/AdminSystemHealth';
import AdminAuditTrail from '@/components/admin/AdminAuditTrail';
import AdminPricingRules from '@/components/admin/AdminPricingRules';
import AdminAvailability from '@/components/admin/AdminAvailability';
import AdminWishlists from '@/components/admin/AdminWishlists';
import AdminTestimonials from '@/components/admin/AdminTestimonials';
import AdminSiteControl from '@/components/admin/AdminSiteControl';
import AdminBlog from '@/components/admin/AdminBlog';
import AdminGallery from '@/components/admin/AdminGallery';
import AdminNewsletter from '@/components/admin/AdminNewsletter';
import AdminLoyalty from '@/components/admin/AdminLoyalty';
import AdminAbandonedBookings from '@/components/admin/AdminAbandonedBookings';
import { logAdminAction } from '@/lib/activityLogger';

const menuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', group: 'Overview' },
  { id: 'bookings', icon: CalendarDays, label: 'Bookings', group: 'Overview' },
  { id: 'tours', icon: MapPin, label: 'Tours', group: 'Manage' },
  { id: 'destinations', icon: MapPin, label: 'Destinations', group: 'Manage' },
  { id: 'vehicles', icon: Car, label: 'Vehicles', group: 'Manage' },
  { id: 'hotels', icon: Hotel, label: 'Hotels', group: 'Manage' },
  { id: 'deals', icon: Tag, label: 'Deals & Offers', group: 'Manage' },
  { id: 'cms', icon: Palette, label: 'CMS', group: 'Content' },
  { id: 'blog', icon: BookOpen, label: 'Blog Posts', group: 'Content' },
  { id: 'gallery', icon: Image, label: 'Photo Gallery', group: 'Content' },
  { id: 'feedback', icon: MessageSquare, label: 'Feedback', group: 'Engagement' },
  { id: 'contact', icon: MessageCircle, label: 'Contact Messages', group: 'Engagement' },
  { id: 'users', icon: Users, label: 'Users', group: 'Engagement' },
  { id: 'notifications', icon: Bell, label: 'Notifications', group: 'Engagement' },
  { id: 'newsletter', icon: Mail, label: 'Newsletter', group: 'Engagement' },
  { id: 'pricing-rules', icon: Tag, label: 'Dynamic Pricing', group: 'Revenue' },
  { id: 'loyalty', icon: Gift, label: 'Loyalty & Referrals', group: 'Revenue' },
  { id: 'abandoned', icon: AlertTriangle, label: 'Abandoned Bookings', group: 'Revenue' },
  { id: 'wishlists', icon: Eye, label: 'Wishlists', group: 'Revenue' },
  { id: 'availability', icon: CalendarDays, label: 'Availability', group: 'Manage' },
  { id: 'testimonials', icon: MessageSquare, label: 'Testimonials', group: 'Engagement' },
  { id: 'visitors', icon: Eye, label: 'Visitor Logs', group: 'Intelligence' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics', group: 'Intelligence' },
  { id: 'activity', icon: Activity, label: 'Activity Logs', group: 'Intelligence' },
  { id: 'security', icon: Shield, label: 'Security Threats', group: 'Security' },
  { id: 'audit-trail', icon: FileCheck, label: 'Audit Trail', group: 'Security' },
  { id: 'system-health', icon: Server, label: 'System Health', group: 'Security' },
  { id: 'god-mode', icon: Skull, label: 'God Mode', group: 'Control' },
  { id: 'content', icon: FileText, label: 'Content Editor', group: 'System' },
  { id: 'seo', icon: Search, label: 'SEO Settings', group: 'System' },
  { id: 'email-templates', icon: Mail, label: 'Email Templates', group: 'System' },
  { id: 'settings', icon: Settings, label: 'Settings', group: 'System' },
];

const groups = ['Overview', 'Manage', 'Content', 'Engagement', 'Revenue', 'Intelligence', 'Security', 'Control', 'System'];

const pageTitle: Record<string, string> = {
  content: 'Content Editor',
  cms: 'Content Management System',
  activity: 'Activity Logs',
  visitors: 'Visitor Logs',
  seo: 'SEO Settings',
  'email-templates': 'Email Templates',
  notifications: 'Notifications',
  contact: 'Contact Messages',
  'god-mode': '☠️ God Mode',
  'audit-trail': 'Audit Trail',
  'system-health': 'System Health',
  'pricing-rules': 'Dynamic Pricing',
  availability: 'Tour Availability',
  wishlists: 'User Wishlists',
  testimonials: 'Testimonials',
};

// Swipe hook for mobile sidebar — only triggers on strong horizontal gestures from screen edge
function useSwipeGesture(onSwipeRight: () => void, onSwipeLeft: () => void) {
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const swiping = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() };
    swiping.current = false;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStart.current) return;
    const deltaX = Math.abs(e.touches[0].clientX - touchStart.current.x);
    const deltaY = Math.abs(e.touches[0].clientY - touchStart.current.y);
    // If moving more vertically than horizontally, cancel swipe detection
    if (deltaY > 15 && deltaY > deltaX) {
      touchStart.current = null;
      return;
    }
    if (deltaX > 20 && deltaX > deltaY * 1.5) {
      swiping.current = true;
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStart.current || !swiping.current) {
      touchStart.current = null;
      return;
    }
    const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
    const elapsed = Date.now() - touchStart.current.time;
    // Must complete within 400ms and travel 80px+
    if (elapsed < 400 && Math.abs(deltaX) > 80) {
      if (deltaX > 0 && touchStart.current.x < 30) {
        onSwipeRight();
      } else if (deltaX < -80) {
        onSwipeLeft();
      }
    }
    touchStart.current = null;
    swiping.current = false;
  }, [onSwipeRight, onSwipeLeft]);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
}

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  useAdminSession();

  // Swipe gestures
  useSwipeGesture(
    useCallback(() => setMobileMenuOpen(true), []),
    useCallback(() => setMobileMenuOpen(false), [])
  );

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (user && isAdmin) {
      logAdminAction('page_visit', 'admin', undefined, { section: activeMenu });
    }
  }, [activeMenu, user, isAdmin]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    toast({ title: 'Logged out', description: 'You have been logged out successfully.' });
  };

  const handleMenuClick = (id: string) => {
    setActiveMenu(id);
    setMobileMenuOpen(false);
    setSearchQuery('');
  };

  // Filter menu items based on search
  const filteredMenuItems = searchQuery.trim()
    ? menuItems.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : menuItems;

  const filteredGroups = groups.filter(group =>
    filteredMenuItems.some(item => item.group === group)
  );

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard': return <AdminDashboard />;
      case 'bookings': return <AdminBookings />;
      case 'tours': return <AdminTours />;
      case 'destinations': return <AdminDestinations />;
      case 'vehicles': return <AdminVehicles />;
      case 'hotels': return <AdminHotels />;
      case 'deals': return <AdminDeals />;
      case 'cms': return <AdminCMS />;
      case 'blog': return <AdminBlog />;
      case 'gallery': return <AdminGallery />;
      case 'feedback': return <AdminFeedback />;
      case 'contact': return <AdminContactMessages />;
      case 'users': return <AdminUsers />;
      case 'notifications': return <AdminNotifications />;
      case 'newsletter': return <AdminNewsletter />;
      case 'loyalty': return <AdminLoyalty />;
      case 'abandoned': return <AdminAbandonedBookings />;
      case 'visitors': return <AdminVisitors />;
      case 'analytics': return <AdminAnalytics />;
      case 'pricing-rules': return <AdminPricingRules />;
      case 'availability': return <AdminAvailability />;
      case 'wishlists': return <AdminWishlists />;
      case 'testimonials': return <AdminTestimonials />;
      case 'activity': return <AdminActivityLogs />;
      case 'security': return <AdminSecurityDashboard />;
      case 'audit-trail': return <AdminAuditTrail />;
      case 'system-health': return <AdminSystemHealth />;
      case 'god-mode': return <AdminSiteControl />;
      case 'content': return <AdminContent />;
      case 'seo': return <AdminSEO />;
      case 'email-templates': return <AdminEmailTemplates />;
      case 'settings': return <AdminSettings />;
      default: return <AdminDashboard />;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#030508] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
            <div className="absolute inset-0 w-10 h-10 mx-auto rounded-full bg-primary/10 animate-ping" />
          </div>
          <p className="text-sm text-gray-500">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#030508] flex items-center justify-center p-6">
        <div className="admin-glass rounded-3xl p-8 md:p-12 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">You don't have admin permissions.</p>
          <Button variant="outline" onClick={() => navigate('/')} className="border-white/10 text-white hover:bg-white/5">Return to Home</Button>
        </div>
      </div>
    );
  }

  const SearchBar = () => (
    <div className="relative flex-shrink-0 px-1 mb-3">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
      <Input
        placeholder="Search sections..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className="h-8 pl-8 pr-8 text-[12px] bg-white/[0.03] border-white/[0.06] text-gray-300 placeholder:text-gray-600 focus:border-primary/30 focus:bg-white/[0.05] rounded-lg"
      />
      {searchQuery && (
        <button 
          onClick={() => setSearchQuery('')}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );

  const SidebarNav = () => (
    <ScrollArea className="flex-1">
      <nav className="space-y-5 pr-1 pb-4">
        {filteredGroups.map(group => {
          const items = filteredMenuItems.filter(i => i.group === group);
          return (
            <div key={group}>
              <p className="text-[9px] uppercase tracking-[0.2em] text-gray-600 font-semibold px-3 mb-2">{group}</p>
              <div className="space-y-0.5">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 lg:py-2 rounded-lg text-left text-[13px] transition-all duration-200 group active:scale-[0.98] ${
                      activeMenu === item.id
                        ? 'admin-nav-active text-primary font-medium'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 flex-shrink-0 transition-colors ${activeMenu === item.id ? 'text-primary' : 'text-gray-600 group-hover:text-gray-400'}`} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {activeMenu === item.id && <ChevronRight className="w-3 h-3 text-primary/50" />}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {filteredMenuItems.length === 0 && (
          <p className="text-center text-gray-600 text-xs py-8">No sections found</p>
        )}
      </nav>
    </ScrollArea>
  );

  return (
    <div className="min-h-screen admin-dark flex">
      {/* Desktop Sidebar */}
      <aside className="w-56 admin-sidebar hidden lg:flex flex-col fixed h-full z-30">
        <div className="flex flex-col h-full p-3">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-4 px-2 pt-1 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20 relative border-2 border-primary/30">
              <img src={logo} alt="Indus Tours" className="w-full h-full object-cover" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#060a16] animate-pulse" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-sm tracking-wide">Indus Tours</h2>
              <div className="flex items-center gap-1.5">
                <Zap className="w-2.5 h-2.5 text-primary" />
                <p className="text-[9px] text-primary uppercase tracking-[0.2em] font-medium">Admin Panel</p>
              </div>
            </div>
          </div>

          <SearchBar />
          <SidebarNav />

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-white/[0.04] space-y-0.5 flex-shrink-0">
            <Button variant="ghost" className="w-full justify-start text-[13px] h-9 text-gray-500 hover:text-white hover:bg-white/[0.03]" asChild>
              <Link to="/">
                <Home className="w-4 h-4 mr-2" /> View Website
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-[13px] h-9 text-gray-500 hover:text-red-400 hover:bg-red-500/[0.06]" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay Sidebar */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          {/* Panel */}
          <div className="absolute inset-y-0 left-0 w-[280px] admin-mobile-sidebar flex flex-col animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-primary/30 shadow-lg shadow-primary/20">
                  <img src={logo} alt="Indus Tours" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="font-semibold text-white text-sm">Indus Tours</h2>
                  <div className="flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 text-primary" />
                    <p className="text-[9px] text-primary uppercase tracking-[0.15em] font-medium">Admin</p>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Search */}
            <div className="px-3 pt-3">
              <SearchBar />
            </div>

            {/* Scrollable Nav */}
            <div className="flex-1 overflow-hidden px-2">
              <SidebarNav />
            </div>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-white/[0.06] space-y-1 flex-shrink-0">
              <Button variant="ghost" className="w-full justify-start text-[13px] h-10 text-gray-500 hover:text-white hover:bg-white/[0.05] rounded-lg" asChild>
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  <Home className="w-4 h-4 mr-2" /> View Website
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start text-[13px] h-10 text-gray-500 hover:text-red-400 hover:bg-red-500/[0.08] rounded-lg" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 admin-header px-4 py-3 flex items-center justify-between safe-area-top">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div>
            <span className="font-semibold text-white text-sm">Admin</span>
            <span className="text-[11px] text-gray-500 ml-2 capitalize">
              {pageTitle[activeMenu] || activeMenu}
            </span>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-emerald-500/20 text-emerald-400 bg-emerald-500/[0.05]">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1 animate-pulse" />
          Live
        </Badge>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-56 min-h-screen">
        <div className="p-3 sm:p-4 lg:p-6 pt-16 lg:pt-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-serif font-bold text-foreground capitalize truncate">
                {pageTitle[activeMenu] || activeMenu}
              </h1>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 font-mono truncate">{user.email}</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-[10px] px-2.5 py-0.5 border-emerald-500/20 text-emerald-400 bg-emerald-500/[0.05]">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse" />
                Online
              </Badge>
            </div>
          </div>

          {renderContent()}
        </div>
      </main>
    </div>
  );
}
