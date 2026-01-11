import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  CalendarDays, 
  Car, 
  Tag, 
  MessageSquare, 
  Settings,
  LogOut,
  FileText,
  Bell,
  BarChart3,
  Loader2,
  Menu,
  Hotel,
  Home,
  Users,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAdminSession } from '@/hooks/useAdminSession';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

// Admin Components
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

const menuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'bookings', icon: CalendarDays, label: 'Bookings' },
  { id: 'tours', icon: MapPin, label: 'Tours' },
  { id: 'vehicles', icon: Car, label: 'Vehicles' },
  { id: 'hotels', icon: Hotel, label: 'Hotels' },
  { id: 'deals', icon: Tag, label: 'Deals & Offers' },
  { id: 'feedback', icon: MessageSquare, label: 'Feedback' },
  { id: 'users', icon: Users, label: 'Users' },
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
  
  // Initialize admin session auto-logout
  useAdminSession();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully.',
    });
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'bookings':
        return <AdminBookings />;
      case 'tours':
        return <AdminTours />;
      case 'vehicles':
        return <AdminVehicles />;
      case 'hotels':
        return <AdminHotels />;
      case 'deals':
        return <AdminDeals />;
      case 'feedback':
        return <AdminFeedback />;
      case 'users':
        return <AdminUsers />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'activity':
        return <AdminActivityLogs />;
      case 'content':
        return <AdminContent />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card rounded-3xl p-8 md:p-12 shadow-xl text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have admin permissions. Please contact the administrator.
          </p>
          <Button variant="outline" onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold">
          IT
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Admin Panel</h2>
          <p className="text-xs text-muted-foreground">Indus Tours</p>
        </div>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveMenu(item.id);
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
              activeMenu === item.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-8 pt-8 border-t border-border space-y-3">
        <Button
          variant="secondary"
          className="w-full"
          asChild
        >
          <Link to="/">
            <Home className="w-4 h-4 mr-2" />
            View Website
          </Link>
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-6 hidden lg:block fixed h-full overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            IT
          </div>
          <span className="font-semibold text-foreground">Admin</span>
        </div>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-6">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-foreground capitalize">
              {activeMenu === 'content' ? 'Content Management' : activeMenu}
            </h1>
            <p className="text-muted-foreground text-sm">
              {user.email}
            </p>
          </div>
          <Button variant="outline" size="icon" className="hidden lg:flex">
            <Bell className="w-5 h-5" />
          </Button>
        </div>

        {renderContent()}
      </main>
    </div>
  );
}
