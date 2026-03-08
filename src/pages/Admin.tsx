import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, MapPin, CalendarDays, Car, Tag, MessageSquare, Settings,
  LogOut, FileText, Bell, BarChart3, Loader2, Menu, Hotel, Home, Users, Activity, Eye
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
import { logAdminAction } from '@/lib/activityLogger';

const menuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'bookings', icon: CalendarDays, label: 'Bookings' },
  { id: 'tours', icon: MapPin, label: 'Tours' },
  { id: 'vehicles', icon: Car, label: 'Vehicles' },
  { id: 'hotels', icon: Hotel, label: 'Hotels' },
  { id: 'deals', icon: Tag, label: 'Deals & Offers' },
  { id: 'feedback', icon: MessageSquare, label: 'Feedback' },
  { id: 'users', icon: Users, label: 'Users' },
  { id: 'visitors', icon: Eye, label: 'Visitor Logs' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'activity', icon: Activity, label: 'Activity Logs' },
  { id: 'content', icon: FileText, label: 'Content' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

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
      case 'vehicles': return <AdminVehicles />;
      case 'hotels': return <AdminHotels />;
      case 'deals': return <AdminDeals />;
      case 'feedback': return <AdminFeedback />;
      case 'users': return <AdminUsers />;
      case 'visitors': return <AdminVisitors />;
      case 'analytics': return <AdminAnalytics />;
      case 'activity': return <AdminActivityLogs />;
      case 'content': return <AdminContent />;
      case 'settings': return <AdminSettings />;
      default: return <AdminDashboard />;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-sm text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-6">
        <div className="bg-[#111827] rounded-3xl p-8 md:p-12 shadow-xl text-center max-w-md border border-white/10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">You don't have admin permissions.</p>
          <Button variant="outline" onClick={() => navigate('/')} className="border-white/20 text-white hover:bg-white/10">Return to Home</Button>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/30">
          IT
        </div>
        <div>
          <h2 className="font-semibold text-white text-sm">Indus Tours</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="space-y-0.5 flex-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveMenu(item.id); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-all duration-200 ${
              activeMenu === item.id
                ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-primary border-l-2 border-primary font-medium'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="pt-4 border-t border-white/10 space-y-1">
        <Button variant="ghost" className="w-full justify-start text-sm h-9 text-gray-400 hover:text-white hover:bg-white/5" asChild>
          <Link to="/">
            <Home className="w-4 h-4 mr-2" /> View Website
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start text-sm h-9 text-gray-400 hover:text-red-400 hover:bg-red-500/10" onClick={handleLogout}>
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
            <span className="text-xs text-gray-400 ml-2 capitalize">{activeMenu}</span>
          </div>
        </div>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300 hover:text-white hover:bg-white/10">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-3 admin-sidebar border-r-white/10">
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
              {activeMenu === 'content' ? 'Content Management' : activeMenu === 'activity' ? 'Activity Logs' : activeMenu === 'visitors' ? 'Visitor Logs' : activeMenu}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 hidden sm:flex border-emerald-500/30 text-emerald-400">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
              Online
            </Badge>
          </div>
        </div>

        {renderContent()}
      </main>
    </div>
  );
}
