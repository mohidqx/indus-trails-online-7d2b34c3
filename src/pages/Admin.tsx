import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  CalendarDays, 
  Car, 
  Tag, 
  MessageSquare, 
  Users, 
  Settings,
  LogOut,
  FileText,
  Bell,
  BarChart3,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const menuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'bookings', icon: CalendarDays, label: 'Bookings' },
  { id: 'tours', icon: MapPin, label: 'Tours' },
  { id: 'vehicles', icon: Car, label: 'Vehicles' },
  { id: 'deals', icon: Tag, label: 'Deals & Offers' },
  { id: 'feedback', icon: MessageSquare, label: 'Feedback' },
  { id: 'content', icon: FileText, label: 'Content' },
  { id: 'users', icon: Users, label: 'Customers' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  travel_date: string;
  status: string;
  total_price: number;
  created_at: string;
  tours?: { title: string } | null;
}

interface Feedback {
  id: string;
  name: string;
  rating: number;
  message: string;
  is_approved: boolean;
  created_at: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    avgRating: 0,
  });
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchDashboardData();
      setupRealtimeSubscription();
    }
  }, [user, isAdmin]);

  const fetchDashboardData = async () => {
    setIsLoadingData(true);
    try {
      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*, tours(title)')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!bookingsError && bookingsData) {
        setBookings(bookingsData);
      }

      // Fetch feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!feedbackError && feedbackData) {
        setFeedback(feedbackData);
      }

      // Calculate stats
      const { count: bookingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

      const { data: revenueData } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('status', 'confirmed');

      const totalRevenue = revenueData?.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0) || 0;

      const { data: ratingData } = await supabase
        .from('feedback')
        .select('rating');

      const avgRating = ratingData && ratingData.length > 0
        ? ratingData.reduce((sum, f) => sum + f.rating, 0) / ratingData.length
        : 0;

      setStats({
        totalBookings: bookingCount || 0,
        totalCustomers: bookingCount || 0,
        totalRevenue,
        avgRating: Math.round(avgRating * 10) / 10,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const bookingsChannel = supabase
      .channel('bookings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    const feedbackChannel = supabase
      .channel('feedback-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(feedbackChannel);
    };
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update booking status',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: `Booking ${status}`,
      });
      fetchDashboardData();
    }
  };

  const approveFeedback = async (feedbackId: string, approved: boolean) => {
    const { error } = await supabase
      .from('feedback')
      .update({ is_approved: approved })
      .eq('id', feedbackId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update feedback',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: approved ? 'Feedback approved' : 'Feedback rejected',
      });
      fetchDashboardData();
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully.',
    });
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
            <X className="w-8 h-8 text-destructive" />
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

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border p-6 hidden lg:block">
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
              onClick={() => setActiveMenu(item.id)}
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

        <div className="mt-8 pt-8 border-t border-border">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.email}</p>
          </div>
          <Button variant="outline" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
        </div>

        {isLoadingData ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CalendarDays className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.totalBookings}</p>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.totalCustomers}</p>
                <p className="text-sm text-muted-foreground">Total Customers</p>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald/20 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-emerald" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  PKR {stats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-lake/20 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-lake" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.avgRating || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
            </div>

            {/* Recent Bookings & Feedback */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Recent Bookings</h2>
                </div>
                <div className="space-y-4">
                  {bookings.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No bookings yet</p>
                  ) : (
                    bookings.slice(0, 5).map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                      >
                        <div>
                          <p className="font-medium text-foreground">{booking.customer_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.tours?.title || 'Custom Booking'} • {new Date(booking.travel_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              booking.status === 'confirmed'
                                ? 'bg-emerald/10 text-emerald'
                                : booking.status === 'cancelled'
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-accent/10 text-accent'
                            }`}
                          >
                            {booking.status}
                          </span>
                          {booking.status === 'pending' && (
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                              >
                                <Check className="w-4 h-4 text-emerald" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              >
                                <X className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Recent Feedback</h2>
                </div>
                <div className="space-y-4">
                  {feedback.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No feedback yet</p>
                  ) : (
                    feedback.slice(0, 5).map((fb) => (
                      <div
                        key={fb.id}
                        className="p-4 rounded-xl bg-muted/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-foreground">{fb.name}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {[...Array(fb.rating)].map((_, i) => (
                                <span key={i} className="text-accent">★</span>
                              ))}
                            </div>
                            {!fb.is_approved && (
                              <div className="flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => approveFeedback(fb.id, true)}
                                >
                                  <Check className="w-3 h-3 text-emerald" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => approveFeedback(fb.id, false)}
                                >
                                  <X className="w-3 h-3 text-destructive" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{fb.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
