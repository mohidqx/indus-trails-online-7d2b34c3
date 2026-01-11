import { useState, useEffect } from 'react';
import { CalendarDays, Users, BarChart3, MessageSquare, TrendingUp, Loader2, Car, Tag, MapPin, DollarSign, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { statsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface Stats {
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    recent: number;
  };
  revenue: {
    total: number;
    monthly: number;
    average: number;
  };
  tours: {
    total: number;
    active: number;
  };
  deals: {
    total: number;
    active: number;
  };
  vehicles: {
    total: number;
    available: number;
  };
  feedback: {
    total: number;
    approved: number;
    averageRating: number | string;
  };
  users: {
    total: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
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
      // Fetch stats from API
      const { data: apiStats } = await statsApi.getDashboard();
      if (apiStats) {
        setStats(apiStats as Stats);
      }

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

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={fetchDashboardData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-card rounded-2xl p-4 lg:p-6 shadow-card">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
            </div>
            {stats.bookings.pending > 0 && (
              <span className="text-xs text-accent font-medium bg-accent/10 px-2 py-1 rounded-full">
                {stats.bookings.pending} pending
              </span>
            )}
          </div>
          <p className="text-xl lg:text-2xl font-bold text-foreground">{stats.bookings.total}</p>
          <p className="text-xs lg:text-sm text-muted-foreground">Total Bookings</p>
          <p className="text-xs text-emerald mt-1">{stats.bookings.recent} last 30 days</p>
        </div>

        <div className="bg-card rounded-2xl p-4 lg:p-6 shadow-card">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-emerald/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-emerald" />
            </div>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-foreground">
            PKR {stats.revenue.total.toLocaleString()}
          </p>
          <p className="text-xs lg:text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-xs text-accent mt-1">PKR {stats.revenue.monthly.toLocaleString()} this month</p>
        </div>

        <div className="bg-card rounded-2xl p-4 lg:p-6 shadow-card">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 lg:w-6 lg:h-6 text-accent" />
            </div>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-foreground">{stats.tours.active}</p>
          <p className="text-xs lg:text-sm text-muted-foreground">Active Tours</p>
          <p className="text-xs text-muted-foreground mt-1">{stats.tours.total} total</p>
        </div>

        <div className="bg-card rounded-2xl p-4 lg:p-6 shadow-card">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-lake/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 lg:w-6 lg:h-6 text-lake" />
            </div>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-foreground">{stats.feedback.averageRating} ★</p>
          <p className="text-xs lg:text-sm text-muted-foreground">Avg Rating</p>
          <p className="text-xs text-muted-foreground mt-1">{stats.feedback.approved}/{stats.feedback.total} approved</p>
        </div>

        <div className="bg-card rounded-2xl p-4 lg:p-6 shadow-card">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Tag className="w-5 h-5 lg:w-6 lg:h-6 text-purple-500" />
            </div>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-foreground">{stats.deals.active}</p>
          <p className="text-xs lg:text-sm text-muted-foreground">Active Deals</p>
          <p className="text-xs text-muted-foreground mt-1">{stats.deals.total} total</p>
        </div>

        <div className="bg-card rounded-2xl p-4 lg:p-6 shadow-card">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Car className="w-5 h-5 lg:w-6 lg:h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-foreground">{stats.vehicles.available}</p>
          <p className="text-xs lg:text-sm text-muted-foreground">Available Vehicles</p>
          <p className="text-xs text-muted-foreground mt-1">{stats.vehicles.total} total</p>
        </div>

        <div className="bg-card rounded-2xl p-4 lg:p-6 shadow-card">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-500" />
            </div>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-foreground">{stats.users.total}</p>
          <p className="text-xs lg:text-sm text-muted-foreground">Registered Users</p>
        </div>

        <div className="bg-card rounded-2xl p-4 lg:p-6 shadow-card">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-emerald/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-emerald" />
            </div>
          </div>
          <p className="text-xl lg:text-2xl font-bold text-foreground">{stats.bookings.completed}</p>
          <p className="text-xs lg:text-sm text-muted-foreground">Completed Trips</p>
          <p className="text-xs text-emerald mt-1">PKR {stats.revenue.average.toLocaleString()} avg value</p>
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
