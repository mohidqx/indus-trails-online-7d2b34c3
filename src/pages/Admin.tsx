import { useState } from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  CalendarDays, 
  Car, 
  Tag, 
  MessageSquare, 
  Users, 
  Settings,
  LogIn,
  Lock,
  Eye,
  EyeOff,
  FileText,
  Bell,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

// Simulated admin password - In production, this would use proper authentication
const ADMIN_PASSWORD = 'indus2026';

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

const recentBookings = [
  { id: 1, name: 'Ahmed Hassan', tour: 'Hunza Valley Explorer', date: '2026-03-15', status: 'confirmed', amount: 170000 },
  { id: 2, name: 'Sarah Mitchell', tour: 'Fairy Meadows Trek', date: '2026-04-01', status: 'pending', amount: 65000 },
  { id: 3, name: 'Michael Chen', tour: 'Skardu Adventure', date: '2026-05-10', status: 'confirmed', amount: 285000 },
  { id: 4, name: 'Emma Thompson', tour: 'Swat Valley Retreat', date: '2026-03-20', status: 'pending', amount: 90000 },
];

const recentFeedback = [
  { id: 1, name: 'John Doe', rating: 5, message: 'Absolutely amazing experience! The guides were fantastic.', date: '2026-01-01' },
  { id: 2, name: 'Maria Garcia', rating: 4, message: 'Great tour, beautiful locations. Would recommend!', date: '2025-12-28' },
  { id: 3, name: 'David Lee', rating: 5, message: 'Best tour company in Pakistan. Will definitely book again.', date: '2025-12-25' },
];

export default function Admin() {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setLoginError('');
      toast({
        title: 'Welcome, Admin!',
        description: 'You have successfully logged in.',
      });
    } else {
      setLoginError('Invalid password. Please try again.');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-mountain flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-3xl p-8 md:p-12 shadow-xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Admin Portal</h1>
              <p className="text-muted-foreground mt-2">Indus Tours Pakistan</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Admin Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {loginError && (
                  <p className="text-sm text-destructive mt-2">{loginError}</p>
                )}
              </div>

              <Button type="submit" variant="gold" size="lg" className="w-full">
                <LogIn className="w-5 h-5 mr-2" />
                Login
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              For demo: Password is "indus2026"
            </p>
          </div>
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
            onClick={() => setIsLoggedIn(false)}
          >
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
            <p className="text-muted-foreground">Welcome back, Admin</p>
          </div>
          <Button variant="outline" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs text-emerald font-medium bg-emerald/10 px-2 py-1 rounded-full">
                +12%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">24</p>
            <p className="text-sm text-muted-foreground">Active Bookings</p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <span className="text-xs text-emerald font-medium bg-emerald/10 px-2 py-1 rounded-full">
                +8%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">156</p>
            <p className="text-sm text-muted-foreground">Total Customers</p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-emerald" />
              </div>
              <span className="text-xs text-emerald font-medium bg-emerald/10 px-2 py-1 rounded-full">
                +23%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">PKR 2.4M</p>
            <p className="text-sm text-muted-foreground">This Month Revenue</p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-lake/20 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-lake" />
              </div>
              <span className="text-xs text-accent font-medium bg-accent/10 px-2 py-1 rounded-full">
                3 new
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">4.9</p>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Recent Bookings</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-foreground">{booking.name}</p>
                    <p className="text-sm text-muted-foreground">{booking.tour}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      PKR {booking.amount.toLocaleString()}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-emerald/10 text-emerald'
                          : 'bg-accent/10 text-accent'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Feedback */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Recent Feedback</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="space-y-4">
              {recentFeedback.map((feedback) => (
                <div
                  key={feedback.id}
                  className="p-4 rounded-xl bg-muted/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-foreground">{feedback.name}</p>
                    <div className="flex gap-0.5">
                      {[...Array(feedback.rating)].map((_, i) => (
                        <span key={i} className="text-accent">★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{feedback.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 p-6 bg-card rounded-2xl shadow-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline">
              <MapPin className="w-4 h-4 mr-2" />
              Add New Tour
            </Button>
            <Button variant="outline">
              <Tag className="w-4 h-4 mr-2" />
              Create Offer
            </Button>
            <Button variant="outline">
              <Car className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Edit Content
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
