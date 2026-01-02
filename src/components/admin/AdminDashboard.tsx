import { useState, useEffect } from 'react';
import { CalendarDays, Users, BarChart3, MessageSquare, TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  avgRating: number;
  totalFeedback: number;
  totalTours: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    avgRating: 0,
    totalFeedback: 0,
    totalTours: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const cleanup = setupRealtimeSubscription();
    return cleanup;
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch recent bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*, tours(title)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (bookingsData) setRecentBookings(bookingsData);

      // Fetch recent feedback
      const { data: feedbackData } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (feedbackData) setRecentFeedback(feedbackData);

      // Stats
      const { count: bookingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

      const { count: pendingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

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

      const { count: feedbackCount } = await supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true });

      const { count: tourCount } = await supabase
        .from('tours')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalBookings: bookingCount || 0,
        pendingBookings: pendingCount || 0,
        totalRevenue,
        avgRating: Math.round(avgRating * 10) / 10,
        totalFeedback: feedbackCount || 0,
        totalTours: tourCount || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback' }, fetchDashboardData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-primary" />
            </div>
            {stats.pendingBookings > 0 && (
              <span className="text-xs text-accent font-medium bg-accent/10 px-2 py-1 rounded-full">
                {stats.pendingBookings} pending
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.totalBookings}</p>
          <p className="text-sm text-muted-foreground">Total Bookings</p>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">
            PKR {stats.totalRevenue.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Total Revenue</p>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-accent" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.totalTours}</p>
          <p className="text-sm text-muted-foreground">Active Tours</p>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-lake/20 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-lake" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.avgRating || 'N/A'} ★</p>
          <p className="text-sm text-muted-foreground">Avg Rating ({stats.totalFeedback} reviews)</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h2 className="text-lg font-semibold text-foreground mb-6">Recent Bookings</h2>
          <div className="space-y-4">
            {recentBookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No bookings yet</p>
            ) : (
              recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">{booking.customer_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.tours?.title || 'Custom'} • {new Date(booking.travel_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    booking.status === 'confirmed' ? 'bg-emerald/10 text-emerald' :
                    booking.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                    'bg-accent/10 text-accent'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-card">
          <h2 className="text-lg font-semibold text-foreground mb-6">Recent Feedback</h2>
          <div className="space-y-4">
            {recentFeedback.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No feedback yet</p>
            ) : (
              recentFeedback.map((fb) => (
                <div key={fb.id} className="p-4 rounded-xl bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-foreground">{fb.name}</p>
                    <div className="flex gap-0.5">
                      {[...Array(fb.rating)].map((_, i) => (
                        <span key={i} className="text-accent text-sm">★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{fb.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
