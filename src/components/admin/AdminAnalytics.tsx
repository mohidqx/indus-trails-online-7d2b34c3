import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, TrendingDown, Calendar, DollarSign, MapPin, Users, BarChart3, PieChart as PieIcon, Activity, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { bookingsApi } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend } from 'recharts';

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  travel_date: string;
  num_travelers: number;
  total_price: number;
  original_price: number | null;
  discount_applied: number | null;
  deal_id: string | null;
  status: string;
  created_at: string;
  tours?: { title: string; image_url: string | null } | null;
  deals?: { title: string; discount_percent: number | null } | null;
}

const COLORS = [
  'hsl(175, 45%, 35%)', 'hsl(38, 85%, 55%)', 'hsl(195, 70%, 45%)', 
  'hsl(160, 50%, 35%)', 'hsl(0, 72%, 51%)', 'hsl(270, 60%, 55%)'
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'hsl(38, 85%, 55%)',
  confirmed: 'hsl(175, 45%, 35%)',
  completed: 'hsl(160, 50%, 35%)',
  cancelled: 'hsl(0, 72%, 51%)',
};

export default function AdminAnalytics() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [feedbackData, setFeedbackData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [bookingsRes, feedbackRes] = await Promise.all([
      bookingsApi.getAll(),
      supabase.from('feedback').select('*').order('created_at', { ascending: false }),
    ]);

    if (bookingsRes.data) setBookings(bookingsRes.data as Booking[]);
    if (feedbackRes.data) setFeedbackData(feedbackRes.data);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculations
  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
  const totalBookings = bookings.length;
  const avgBookingValue = totalBookings > 0 ? totalRevenue / bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length : 0;
  const totalTravelers = bookings.reduce((sum, b) => sum + (b.num_travelers || 0), 0);
  const conversionRate = totalBookings > 0 ? ((bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length / totalBookings) * 100) : 0;
  const totalDiscountSaved = bookings.reduce((sum, b) => {
    if (b.original_price && b.discount_applied) {
      return sum + (Number(b.original_price) - Number(b.total_price));
    }
    return sum;
  }, 0);

  // Monthly revenue & bookings trend
  const monthlyData: Record<string, { bookings: number; revenue: number; travelers: number }> = {};
  bookings.forEach(b => {
    const date = new Date(b.created_at);
    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    if (!monthlyData[monthKey]) monthlyData[monthKey] = { bookings: 0, revenue: 0, travelers: 0 };
    monthlyData[monthKey].bookings++;
    if (b.status === 'confirmed' || b.status === 'completed') {
      monthlyData[monthKey].revenue += Number(b.total_price) || 0;
    }
    monthlyData[monthKey].travelers += b.num_travelers || 0;
  });
  const monthlyTrend = Object.entries(monthlyData)
    .map(([month, data]) => ({ month, ...data }))
    .slice(-12);

  // Top tours by bookings
  const tourCounts: Record<string, { bookings: number; revenue: number }> = {};
  bookings.forEach(b => {
    const tourName = b.tours?.title || 'Custom Request';
    if (!tourCounts[tourName]) tourCounts[tourName] = { bookings: 0, revenue: 0 };
    tourCounts[tourName].bookings++;
    tourCounts[tourName].revenue += Number(b.total_price) || 0;
  });
  const topTours = Object.entries(tourCounts)
    .map(([name, data]) => ({ name: name.length > 25 ? name.slice(0, 22) + '...' : name, fullName: name, ...data }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 6);

  // Bookings by status
  const statusCounts: Record<string, number> = {};
  bookings.forEach(b => {
    const status = b.status || 'pending';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  const bookingsByStatus = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: STATUS_COLORS[name] || COLORS[0],
  }));

  // Revenue by tour
  const revenueByTour = Object.entries(tourCounts)
    .map(([name, data]) => ({ name: name.length > 20 ? name.slice(0, 17) + '...' : name, revenue: data.revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Travelers per month
  const travelersPerMonth = monthlyTrend.map(m => ({ month: m.month, travelers: m.travelers }));

  // Feedback rating distribution
  const ratingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  feedbackData.forEach(f => {
    if (f.rating >= 1 && f.rating <= 5) ratingDist[f.rating]++;
  });
  const ratingDistData = Object.entries(ratingDist).map(([rating, count]) => ({
    rating: `${rating} ★`,
    count,
  }));

  const avgRating = feedbackData.length > 0 ? (feedbackData.reduce((s, f) => s + f.rating, 0) / feedbackData.length).toFixed(1) : '0';

  // Daily bookings (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dailyBookings: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dailyBookings[d.toISOString().split('T')[0]] = 0;
  }
  bookings.forEach(b => {
    const date = new Date(b.created_at).toISOString().split('T')[0];
    if (dailyBookings[date] !== undefined) dailyBookings[date]++;
  });
  const dailyTrend = Object.entries(dailyBookings)
    .map(([date, count]) => ({ date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), bookings: count }))
    .reverse();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-xl p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} className="text-sm" style={{ color: p.color }}>
              {p.name}: {p.name.toLowerCase().includes('revenue') ? `PKR ${Number(p.value).toLocaleString()}` : p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Real-time business insights from your bookings</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="border-0 shadow-card bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-xl font-bold text-foreground">PKR {(totalRevenue / 1000).toFixed(0)}K</p>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card bg-gradient-to-br from-accent/5 to-accent/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-accent" />
              </div>
            </div>
            <p className="text-xl font-bold text-foreground">{totalBookings}</p>
            <p className="text-xs text-muted-foreground">Total Bookings</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card bg-gradient-to-br from-emerald-500/5 to-emerald-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-foreground">PKR {Math.round(avgBookingValue).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Avg. Booking</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card bg-gradient-to-br from-blue-500/5 to-blue-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-foreground">{totalTravelers}</p>
            <p className="text-xs text-muted-foreground">Total Travelers</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card bg-gradient-to-br from-purple-500/5 to-purple-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-foreground">{conversionRate.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Conversion Rate</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card bg-gradient-to-br from-orange-500/5 to-orange-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-orange-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-foreground">{avgRating} ★</p>
            <p className="text-xs text-muted-foreground">Avg. Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Revenue Trend</CardTitle>
              <Badge variant="outline" className="text-xs">Monthly</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(175, 45%, 35%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(175, 45%, 35%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 15%, 88%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(175, 45%, 35%)" fill="url(#revenueGrad)" strokeWidth={2.5} name="Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bookings by Status */}
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Bookings by Status</CardTitle>
              <Badge variant="outline" className="text-xs">{totalBookings} total</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={{ strokeWidth: 1 }}
                  >
                    {bookingsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Bookings */}
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Daily Bookings</CardTitle>
              <Badge variant="outline" className="text-xs">Last 30 Days</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 15%, 88%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={4} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="bookings" fill="hsl(195, 70%, 45%)" radius={[3, 3, 0, 0]} name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Tours */}
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Top Tours by Bookings</CardTitle>
              <Badge variant="outline" className="text-xs">{topTours.length} tours</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topTours} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 15%, 88%)" />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="bookings" fill="hsl(38, 85%, 55%)" radius={[0, 4, 4, 0]} name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bookings vs Travelers */}
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Bookings & Travelers</CardTitle>
              <Badge variant="outline" className="text-xs">Monthly</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 15%, 88%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} />
                  <Line type="monotone" dataKey="bookings" stroke="hsl(175, 45%, 35%)" strokeWidth={2} name="Bookings" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="travelers" stroke="hsl(38, 85%, 55%)" strokeWidth={2} name="Travelers" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Rating Distribution</CardTitle>
              <Badge variant="outline" className="text-xs">{feedbackData.length} reviews</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingDistData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 15%, 88%)" />
                  <XAxis dataKey="rating" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Reviews">
                    {ratingDistData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Tour */}
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Revenue by Tour</CardTitle>
            <Badge variant="outline" className="text-xs">Top 5</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByTour}>
                <defs>
                  <linearGradient id="revBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(175, 45%, 35%)" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="hsl(175, 45%, 35%)" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 15%, 88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="url(#revBarGrad)" radius={[6, 6, 0, 0]} name="Revenue (PKR)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats Table */}
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Quick Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-muted/50 text-center">
              <p className="text-2xl font-bold text-primary">{bookings.filter(b => b.status === 'completed').length}</p>
              <p className="text-xs text-muted-foreground mt-1">Completed Trips</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 text-center">
              <p className="text-2xl font-bold text-accent">{bookings.filter(b => b.status === 'pending').length}</p>
              <p className="text-xs text-muted-foreground mt-1">Pending Bookings</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 text-center">
              <p className="text-2xl font-bold text-foreground">PKR {totalDiscountSaved.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Discounts Given</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 text-center">
              <p className="text-2xl font-bold text-foreground">{bookings.filter(b => b.deal_id).length}</p>
              <p className="text-xs text-muted-foreground mt-1">Deal Bookings</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
