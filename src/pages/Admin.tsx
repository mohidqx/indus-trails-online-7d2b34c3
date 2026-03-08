import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, MapPin, CalendarDays, Car, Tag, MessageSquare, Settings,
  LogOut, FileText, Bell, BarChart3, Loader2, Menu, Hotel, Home, Users, Activity, Eye,
  ChevronRight, Zap, Search, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAdminSession } from '@/hooks/useAdminSession';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminBookings from '@/components/admin/AdminBookings';
import AdminTours from '@/components/admin/AdminTours';
import AdminVehicles from '@/components/admin/AdminVehicles';
import AdminHotels from '@/components/admin/AdminHotels';
import AdminDeals from '@/components/admin/AdminDeals';
import AdminFeedback from '@/components/admin/AdminFeedback';
import AdminContent from '@/components/admin/AdminContent';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminActivityLogs from '@/components/admin/AdminActivityLogs';
import AdminVisitors from '@/components/admin/AdminVisitors';
import AdminDestinations from '@/components/admin/AdminDestinations';
import AdminSEO from '@/components/admin/AdminSEO';
import AdminEmailTemplates from '@/components/admin/AdminEmailTemplates';
import AdminNotifications from '@/components/admin/AdminNotifications';
import { logAdminAction } from '@/lib/activityLogger';

const menuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', group: 'Overview' },
  { id: 'bookings', icon: CalendarDays, label: 'Bookings', group: 'Overview' },
  { id: 'tours', icon: MapPin, label: 'Tours', group: 'Manage' },
  { id: 'destinations', icon: MapPin, label: 'Destinations', group: 'Manage' },
  { id: 'vehicles', icon: Car, label: 'Vehicles', group: 'Manage' },
  { id: 'hotels', icon: Hotel, label: 'Hotels', group: 'Manage' },
  { id: 'deals', icon: Tag, label: 'Deals & Offers', group: 'Manage' },
  { id: 'feedback', icon: MessageSquare, label: 'Feedback', group: 'Engagement' },
  { id: 'users', icon: Users, label: 'Users', group: 'Engagement' },
  { id: 'notifications', icon: Bell, label: 'Notifications', group: 'Engagement' },
  { id: 'visitors', icon: Eye, label: 'Visitor Logs', group: 'Intelligence' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics', group: 'Intelligence' },
  { id: 'activity', icon: Activity, label: 'Activity Logs', group: 'Intelligence' },
  { id: 'content', icon: FileText, label: 'Content Editor', group: 'System' },
  { id: 'seo', icon: Search, label: 'SEO Settings', group: 'System' },
  { id: 'email-templates', icon: Mail, label: 'Email Templates', group: 'System' },
  { id: 'settings', icon: Settings, label: 'Settings', group: 'System' },
];

const groups = ['Overview', 'Manage', 'Engagement', 'Intelligence', 'System'];

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useAdminSession();

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

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard': return <AdminDashboard />;
      case 'bookings': return <AdminBookings />;
      case 'tours': return <AdminTours />;
      case 'destinations': return <AdminDestinations />;
      case 'vehicles': return <AdminVehicles />;
      case 'hotels': return <AdminHotels />;
      case 'deals': return <AdminDeals />;
      case 'feedback': return <AdminFeedback />;
      case 'users': return <AdminUsers />;
      case 'notifications': return <AdminNotifications />;
      case 'visitors': return <AdminVisitors />;
      case 'analytics': return <AdminAnalytics />;
      case 'activity': return <AdminActivityLogs />;
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

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-6 px-2 pt-1">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 relative">
          IT
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

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto space-y-4 pr-1">
        {groups.map(group => {
          const items = menuItems.filter(i => i.group === group);
          return (
            <div key={group}>
              <p className="text-[9px] uppercase tracking-[0.2em] text-gray-600 font-semibold px-3 mb-1.5">{group}</p>
              <div className="space-y-0.5">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveMenu(item.id); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[13px] transition-all duration-200 group ${
                      activeMenu === item.id
                        ? 'admin-nav-active text-primary font-medium'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 flex-shrink-0 transition-colors ${activeMenu === item.id ? 'text-primary' : 'text-gray-600 group-hover:text-gray-400'}`} />
                    <span className="flex-1">{item.label}</span>
                    {activeMenu === item.id && <ChevronRight className="w-3 h-3 text-primary/50" />}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="pt-4 border-t border-white/[0.04] space-y-0.5">
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
  );

  return (
    <div className="min-h-screen admin-dark flex">
      {/* Desktop Sidebar */}
      <aside className="w-56 admin-sidebar p-3 hidden lg:flex flex-col fixed h-full overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 admin-header px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white font-bold text-xs">
            IT
          </div>
          <div>
            <span className="font-semibold text-white text-sm">Admin</span>
            <span className="text-xs text-gray-500 ml-2 capitalize">{activeMenu}</span>
          </div>
        </div>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-3 admin-sidebar border-r-white/[0.04]">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-56 p-4 lg:p-6 pt-16 lg:pt-6 min-h-screen">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl lg:text-2xl font-serif font-bold text-foreground capitalize">
              {activeMenu === 'content' ? 'Content Editor' : activeMenu === 'activity' ? 'Activity Logs' : activeMenu === 'visitors' ? 'Visitor Logs' : activeMenu === 'seo' ? 'SEO Settings' : activeMenu === 'email-templates' ? 'Email Templates' : activeMenu === 'notifications' ? 'Notifications' : activeMenu}
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] px-2.5 py-0.5 hidden sm:flex border-emerald-500/20 text-emerald-400 bg-emerald-500/[0.05]">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse" />
              Online
            </Badge>
          </div>
        </div>

        {renderContent()}
      </main>
    </div>
  );
}
