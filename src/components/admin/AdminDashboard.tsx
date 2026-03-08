import { useState, useEffect } from 'react';
import { CalendarDays, Users, MessageSquare, TrendingUp, Loader2, Car, Tag, MapPin, DollarSign, RefreshCw, ArrowUpRight, Clock, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { statsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Stats {
  bookings: { total: number; pending: number; confirmed: number; completed: number; cancelled: number; recent: number };
  revenue: { total: number; monthly: number; average: number };
  tours: { total: number; active: number };
  deals: { total: number; active: number };
  vehicles: { total: number; available: number };
  feedback: { total: number; approved: number; averageRating: number | string };
  users: { total: number };
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
      const { data: apiStats } = await statsApi.getDashboard();
      if (apiStats) {
        const s = apiStats as Record<string, any>;
        setStats({
          bookings: {
            total: s.totalBookings || 0, pending: s.pendingBookings || 0,
            confirmed: s.confirmedBookings || 0, completed: s.completedBookings || 0,
            cancelled: s.cancelledBookings || 0,
            recent: (Object.values(s.bookingsByDate || {}) as number[]).reduce((a, b) => a + b, 0),
          },
          revenue: {
            total: s.totalRevenue || 0, monthly: s.totalRevenue || 0,
            average: s.totalBookings > 0 ? Math.round(s.totalRevenue / s.totalBookings) : 0,
          },
          tours: { total: s.totalTours || 0, active: s.activeTours || 0 },
          deals: { total: s.totalDeals || 0, active: s.activeDeals || 0 },
          vehicles: { total: s.totalVehicles || 0, available: s.availableVehicles || 0 },
          feedback: { total: s.totalFeedback || 0, approved: s.approvedFeedback || 0, averageRating: s.avgRating || 0 },
          users: { total: s.totalUsers || 0 },
        });
      }

      const { data: bookingsData } = await supabase
        .from('bookings').select('*, tours(title)')
        .order('created_at', { ascending: false }).limit(5);
      if (bookingsData) setRecentBookings(bookingsData);

      const { data: feedbackData } = await supabase
        .from('feedback').select('*')
        .order('created_at', { ascending: false }).limit(5);
      if (feedbackData) setRecentFeedback(feedbackData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase.channel('dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback' }, fetchDashboardData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  };

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      icon: DollarSign, label: 'Total Revenue', value: `PKR ${stats.revenue.total.toLocaleString()}`,
      sub: `PKR ${stats.revenue.average.toLocaleString()} avg`, color: 'from-emerald-500/10 to-emerald-500/5',
      iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-600',
    },
    {
      icon: CalendarDays, label: 'Total Bookings', value: stats.bookings.total,
      sub: `${stats.bookings.pending} pending`, color: 'from-primary/10 to-primary/5',
      iconBg: 'bg-primary/15', iconColor: 'text-primary', badge: stats.bookings.pending > 0 ? `${stats.bookings.pending} new` : undefined,
    },
    {
      icon: TrendingUp, label: 'Completed', value: stats.bookings.completed,
      sub: `${stats.bookings.confirmed} confirmed`, color: 'from-lake/10 to-lake/5',
      iconBg: 'bg-lake/15', iconColor: 'text-lake',
    },
    {
      icon: MapPin, label: 'Active Tours', value: stats.tours.active,
      sub: `${stats.tours.total} total`, color: 'from-accent/10 to-accent/5',
      iconBg: 'bg-accent/15', iconColor: 'text-accent',
    },
    {
      icon: MessageSquare, label: 'Avg Rating', value: `${stats.feedback.averageRating} ★`,
      sub: `${stats.feedback.approved}/${stats.feedback.total} approved`, color: 'from-sunset/10 to-sunset/5',
      iconBg: 'bg-sunset/15', iconColor: 'text-sunset',
    },
    {
      icon: Tag, label: 'Active Deals', value: stats.deals.active,
      sub: `${stats.deals.total} total`, color: 'from-purple-500/10 to-purple-500/5',
      iconBg: 'bg-purple-500/15', iconColor: 'text-purple-600',
    },
    {
      icon: Car, label: 'Vehicles', value: stats.vehicles.available,
      sub: `${stats.vehicles.total} total`, color: 'from-blue-500/10 to-blue-500/5',
      iconBg: 'bg-blue-500/15', iconColor: 'text-blue-600',
    },
    {
      icon: Users, label: 'Users', value: stats.users.total,
      sub: 'registered', color: 'from-indigo-500/10 to-indigo-500/5',
      iconBg: 'bg-indigo-500/15', iconColor: 'text-indigo-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back! Here's your business overview.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDashboardData} className="gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className={`border-0 shadow-card bg-gradient-to-br ${stat.color} overflow-hidden relative group hover:shadow-lg transition-shadow`}>
            <CardContent className="p-4 lg:p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                {stat.badge && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5 animate-pulse">
                    {stat.badge}
                  </Badge>
                )}
              </div>
              <p className="text-xl lg:text-2xl font-bold text-foreground font-sans">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              <p className="text-[11px] text-muted-foreground/70 mt-1">{stat.sub}</p>
              <div className="absolute -right-4 -bottom-4 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity">
                <stat.icon className="w-24 h-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Booking Status Bar */}
      <Card className="border-0 shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-sm font-semibold text-foreground">Booking Pipeline</h3>
            <Badge variant="outline" className="text-[10px]">{stats.bookings.total} total</Badge>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden bg-muted">
            {stats.bookings.completed > 0 && (
              <div className="bg-emerald-500 transition-all" style={{ width: `${(stats.bookings.completed / stats.bookings.total) * 100}%` }} title={`${stats.bookings.completed} completed`} />
            )}
            {stats.bookings.confirmed > 0 && (
              <div className="bg-primary transition-all" style={{ width: `${(stats.bookings.confirmed / stats.bookings.total) * 100}%` }} title={`${stats.bookings.confirmed} confirmed`} />
            )}
            {stats.bookings.pending > 0 && (
              <div className="bg-accent transition-all" style={{ width: `${(stats.bookings.pending / stats.bookings.total) * 100}%` }} title={`${stats.bookings.pending} pending`} />
            )}
            {stats.bookings.cancelled > 0 && (
              <div className="bg-destructive transition-all" style={{ width: `${(stats.bookings.cancelled / stats.bookings.total) * 100}%` }} title={`${stats.bookings.cancelled} cancelled`} />
            )}
          </div>
          <div className="flex gap-4 mt-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Completed ({stats.bookings.completed})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Confirmed ({stats.bookings.confirmed})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent" /> Pending ({stats.bookings.pending})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> Cancelled ({stats.bookings.cancelled})</span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="border-0 shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" /> Recent Bookings
              </h3>
              <Badge variant="outline" className="text-[10px]">{recentBookings.length}</Badge>
            </div>
            <div className="space-y-3">
              {recentBookings.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-sm">No bookings yet</p>
              ) : (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors group">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground text-sm truncate">{booking.customer_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-muted-foreground truncate">{booking.tours?.title || 'Custom'}</p>
                        <span className="text-[10px] text-muted-foreground/60">•</span>
                        <p className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(booking.travel_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-600' :
                        booking.status === 'completed' ? 'bg-primary/10 text-primary' :
                        booking.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                        'bg-accent/10 text-accent'
                      }`}>
                        {booking.status}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-accent" /> Recent Feedback
              </h3>
              <Badge variant="outline" className="text-[10px]">{recentFeedback.length}</Badge>
            </div>
            <div className="space-y-3">
              {recentFeedback.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-sm">No feedback yet</p>
              ) : (
                recentFeedback.map((fb) => (
                  <div key={fb.id} className="p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="font-medium text-foreground text-sm">{fb.name}</p>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-xs ${i < fb.rating ? 'text-accent' : 'text-muted-foreground/30'}`}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{fb.message}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}