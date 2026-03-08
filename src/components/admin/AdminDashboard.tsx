import { useState, useEffect } from 'react';
import { CalendarDays, Users, MessageSquare, TrendingUp, Loader2, Car, Tag, MapPin, DollarSign, RefreshCw, ArrowUpRight, Clock, Eye, Hotel, Activity, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { statsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [visitorCount, setVisitorCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const cleanup = setupRealtimeSubscription();
    return cleanup;
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [apiRes, bookingsRes, feedbackRes, visitorsRes] = await Promise.all([
        statsApi.getDashboard(),
        supabase.from('bookings').select('*, tours(title)').order('created_at', { ascending: false }).limit(5),
        supabase.from('feedback').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('visitor_logs' as any).select('id', { count: 'exact', head: true }),
      ]);

      if (apiRes.data) {
        const s = apiRes.data as Record<string, any>;
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
      if (bookingsRes.data) setRecentBookings(bookingsRes.data);
      if (feedbackRes.data) setRecentFeedback(feedbackRes.data);
      if (visitorsRes.count != null) setVisitorCount(visitorsRes.count);
    } catch (error) {
      console.error('Dashboard error:', error);
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
        <div className="relative">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: DollarSign, label: 'Revenue', value: `PKR ${(stats.revenue.total / 1000).toFixed(0)}K`, sub: `PKR ${stats.revenue.average.toLocaleString()} avg`, gradient: 'from-emerald-500/15 to-emerald-500/5', iconColor: 'text-emerald-400', glowColor: 'shadow-emerald-500/10' },
    { icon: CalendarDays, label: 'Bookings', value: stats.bookings.total, sub: `${stats.bookings.pending} pending`, gradient: 'from-primary/15 to-primary/5', iconColor: 'text-primary', badge: stats.bookings.pending > 0 ? stats.bookings.pending : undefined, glowColor: 'shadow-primary/10' },
    { icon: TrendingUp, label: 'Completed', value: stats.bookings.completed, sub: `${stats.bookings.confirmed} confirmed`, gradient: 'from-cyan-500/15 to-cyan-500/5', iconColor: 'text-cyan-400', glowColor: 'shadow-cyan-500/10' },
    { icon: MapPin, label: 'Active Tours', value: stats.tours.active, sub: `${stats.tours.total} total`, gradient: 'from-accent/15 to-accent/5', iconColor: 'text-accent', glowColor: 'shadow-accent/10' },
    { icon: MessageSquare, label: 'Avg Rating', value: `${stats.feedback.averageRating} ★`, sub: `${stats.feedback.approved}/${stats.feedback.total} approved`, gradient: 'from-orange-500/15 to-orange-500/5', iconColor: 'text-orange-400', glowColor: 'shadow-orange-500/10' },
    { icon: Tag, label: 'Active Deals', value: stats.deals.active, sub: `${stats.deals.total} total`, gradient: 'from-purple-500/15 to-purple-500/5', iconColor: 'text-purple-400', glowColor: 'shadow-purple-500/10' },
    { icon: Car, label: 'Vehicles', value: stats.vehicles.available, sub: `${stats.vehicles.total} total`, gradient: 'from-blue-500/15 to-blue-500/5', iconColor: 'text-blue-400', glowColor: 'shadow-blue-500/10' },
    { icon: Eye, label: 'Visitors', value: visitorCount, sub: 'total tracked', gradient: 'from-pink-500/15 to-pink-500/5', iconColor: 'text-pink-400', glowColor: 'shadow-pink-500/10' },
    { icon: Users, label: 'Users', value: stats.users.total, sub: 'registered', gradient: 'from-indigo-500/15 to-indigo-500/5', iconColor: 'text-indigo-400', glowColor: 'shadow-indigo-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-500/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-foreground font-medium">Business Overview</p>
            <p className="text-[11px] text-muted-foreground">Real-time data across all channels</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDashboardData} className="gap-2 bg-white/[0.02] border-white/10 hover:bg-white/[0.05]">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
        {statCards.map((stat, i) => (
          <Card key={i} className={`border-0 admin-stat-card bg-gradient-to-br ${stat.gradient} overflow-hidden relative group`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center ${stat.glowColor}`}>
                  <stat.icon className={`w-4.5 h-4.5 ${stat.iconColor}`} />
                </div>
                {stat.badge && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5 animate-pulse">
                    {stat.badge} new
                  </Badge>
                )}
              </div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">{stat.sub}</p>
              <div className="absolute -right-3 -bottom-3 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                <stat.icon className="w-20 h-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Booking Pipeline */}
      <Card className="border-0 admin-glass">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Booking Pipeline</h3>
            <Badge variant="outline" className="text-[10px] border-white/10">{stats.bookings.total} total</Badge>
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden bg-white/[0.04]">
            {stats.bookings.total > 0 && (
              <>
                {stats.bookings.completed > 0 && <div className="bg-emerald-500 transition-all" style={{ width: `${(stats.bookings.completed / stats.bookings.total) * 100}%` }} />}
                {stats.bookings.confirmed > 0 && <div className="bg-primary transition-all" style={{ width: `${(stats.bookings.confirmed / stats.bookings.total) * 100}%` }} />}
                {stats.bookings.pending > 0 && <div className="bg-accent transition-all" style={{ width: `${(stats.bookings.pending / stats.bookings.total) * 100}%` }} />}
                {stats.bookings.cancelled > 0 && <div className="bg-destructive transition-all" style={{ width: `${(stats.bookings.cancelled / stats.bookings.total) * 100}%` }} />}
              </>
            )}
          </div>
          <div className="flex gap-5 mt-2.5 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Completed ({stats.bookings.completed})</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /> Confirmed ({stats.bookings.confirmed})</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent" /> Pending ({stats.bookings.pending})</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-destructive" /> Cancelled ({stats.bookings.cancelled})</span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="border-0 admin-glass">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" /> Recent Bookings
              </h3>
              <Badge variant="outline" className="text-[10px] border-white/10">{recentBookings.length}</Badge>
            </div>
            <div className="space-y-2">
              {recentBookings.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-sm">No bookings yet</p>
              ) : (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors group border border-white/[0.03]">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground text-sm truncate">{booking.customer_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11px] text-muted-foreground truncate">{booking.tours?.title || 'Custom'}</p>
                        <span className="text-muted-foreground/30">•</span>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(booking.travel_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' :
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

        <Card className="border-0 admin-glass">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-accent" /> Recent Feedback
              </h3>
              <Badge variant="outline" className="text-[10px] border-white/10">{recentFeedback.length}</Badge>
            </div>
            <div className="space-y-2">
              {recentFeedback.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-sm">No feedback yet</p>
              ) : (
                recentFeedback.map((fb) => (
                  <div key={fb.id} className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/[0.03]">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="font-medium text-foreground text-sm">{fb.name}</p>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-xs ${i < fb.rating ? 'text-accent' : 'text-white/10'}`}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{fb.message}</p>
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
