import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, Users, Calendar, DollarSign, MapPin, Car } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface AnalyticsData {
  totalRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  topTours: { name: string; bookings: number }[];
  bookingsByStatus: { name: string; value: number }[];
  monthlyBookings: { month: string; bookings: number; revenue: number }[];
}

const COLORS = ['#16a34a', '#f59e0b', '#ef4444', '#6366f1'];

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);

    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, tours(title)');

    if (bookings) {
      // Calculate metrics
      const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
      const totalBookings = bookings.length;
      const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      // Top tours
      const tourCounts: Record<string, number> = {};
      bookings.forEach(b => {
        const tourName = b.tours?.title || 'Custom Request';
        tourCounts[tourName] = (tourCounts[tourName] || 0) + 1;
      });
      const topTours = Object.entries(tourCounts)
        .map(([name, bookings]) => ({ name, bookings }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 5);

      // Bookings by status
      const statusCounts: Record<string, number> = {};
      bookings.forEach(b => {
        const status = b.status || 'pending';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      const bookingsByStatus = Object.entries(statusCounts)
        .map(([name, value]) => ({ name, value }));

      // Monthly bookings (last 6 months)
      const monthlyData: Record<string, { bookings: number; revenue: number }> = {};
      bookings.forEach(b => {
        const date = new Date(b.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { bookings: 0, revenue: 0 };
        }
        monthlyData[monthKey].bookings++;
        monthlyData[monthKey].revenue += b.total_price || 0;
      });
      const monthlyBookings = Object.entries(monthlyData)
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6);

      setData({
        totalRevenue,
        totalBookings,
        averageBookingValue,
        topTours,
        bookingsByStatus,
        monthlyBookings,
      });
    }

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">PKR {data.totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{data.totalBookings}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Avg. Booking Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">PKR {Math.round(data.averageBookingValue).toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Top Tours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{data.topTours.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bookings Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Bookings & Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthlyBookings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#16a34a" strokeWidth={2} name="Bookings" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} name="Revenue (PKR)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bookings by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bookings by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.bookingsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {data.bookingsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Tours */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Top Tours by Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topTours} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#16a34a" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
