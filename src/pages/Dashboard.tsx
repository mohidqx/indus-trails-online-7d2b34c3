import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  User, Calendar, MapPin, Loader2, LogOut,
  Clock, CheckCircle, XCircle, AlertCircle,
  Phone, Mail, Edit2, Save, X, Tag,
  Shield, Lock, Eye, EyeOff, Trash2,
  BarChart3, TrendingUp, Award,
  MessageSquare, HelpCircle, ChevronRight,
  Star, Plane, CreditCard, Bell, Settings,
  Globe, Activity, Heart
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Booking {
  id: string;
  travel_date: string;
  num_travelers: number;
  status: string | null;
  total_price: number | null;
  created_at: string;
  special_requests: string | null;
  tours?: { title: string } | null;
  deals?: { title: string; discount_percent: number | null } | null;
}

interface Profile {
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
}

interface Feedback {
  id: string;
  rating: number;
  message: string;
  tour_name: string | null;
  created_at: string;
  is_approved: boolean | null;
}

// ─── Booking Card ─────────────────────────────
function BookingCard({ booking, onCancel, onReschedule }: {
  booking: Booking;
  onCancel: (id: string) => void;
  onReschedule: (id: string, d: string) => void;
}) {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(booking.travel_date);
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
  const canReschedule = booking.status === 'pending';

  const statusConfig: Record<string, { bg: string; icon: JSX.Element }> = {
    confirmed: { bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: <CheckCircle className="w-3.5 h-3.5" /> },
    cancelled: { bg: 'bg-destructive/10 text-destructive border-destructive/20', icon: <XCircle className="w-3.5 h-3.5" /> },
    completed: { bg: 'bg-primary/10 text-primary border-primary/20', icon: <CheckCircle className="w-3.5 h-3.5" /> },
    pending: { bg: 'bg-accent/10 text-accent border-accent/20', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  };
  const status = statusConfig[booking.status || 'pending'] || statusConfig.pending;

  return (
    <div className="group glass-card rounded-2xl p-5 sm:p-6 hover:shadow-lg transition-all duration-500 ultra-card">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {booking.tours?.title || 'Custom Tour Request'}
            </h3>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${status.bg}`}>
              {status.icon}
              <span className="capitalize">{booking.status || 'pending'}</span>
            </span>
          </div>
          {booking.deals && (
            <div className="flex items-center gap-1.5 text-xs text-accent font-medium">
              <Tag className="w-3 h-3" />
              {booking.deals.title} — {booking.deals.discount_percent}% off applied
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary/50" />
            {new Date(booking.travel_date).toLocaleDateString('en-PK', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-primary/50" />
            {booking.num_travelers} traveler(s)
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-muted-foreground/50" />
            Booked {new Date(booking.created_at).toLocaleDateString()}
          </span>
        </div>
        {booking.special_requests && (
          <p className="text-sm text-muted-foreground/80 italic pl-1 border-l-2 border-accent/30">
            {booking.special_requests}
          </p>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border/40">
          <div>
            <p className="text-2xl font-bold text-primary">
              PKR {Number(booking.total_price || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-muted-foreground/70 tracking-wide uppercase">Total Amount</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canReschedule && (
              isRescheduling ? (
                <div className="flex items-center gap-2">
                  <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-auto h-8 text-sm" />
                  <Button size="sm" onClick={() => { if (newDate !== booking.travel_date) { onReschedule(booking.id, newDate); setIsRescheduling(false); } }}>
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsRescheduling(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsRescheduling(true)} className="border-border/40 hover:border-primary/30">
                  <Calendar className="w-4 h-4 mr-1.5" /> Reschedule
                </Button>
              )
            )}
            {canCancel && !isRescheduling && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/10">
                    <X className="w-4 h-4 mr-1.5" /> Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                    <AlertDialogDescription>This will cancel your booking for {booking.tours?.title || 'this tour'}.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onCancel(booking.id)} className="bg-destructive text-destructive-foreground">Yes, Cancel</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mini Stat ─────────────────────────────
function MiniStat({ icon: Icon, label, value, color, delay }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  delay?: string;
}) {
  return (
    <div className={`glass-card rounded-xl p-4 ultra-card animate-fade-up ${delay || ''}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} transition-transform duration-300`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{label}</p>
          <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut, isAdmin } = useAuth();
  const { toast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', phone: '' });

  // Security
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Notifications
  const [notifPrefs, setNotifPrefs] = useState({
    booking_updates: true,
    promotions: false,
    newsletter: true,
    sms_alerts: false,
  });

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchBookings();
      fetchProfile();
      fetchFeedbacks();
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;
    setIsLoadingBookings(true);
    const { data } = await supabase
      .from('bookings')
      .select('id, travel_date, num_travelers, status, total_price, created_at, special_requests, tours(title), deals(title, discount_percent)')
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
    if (data) setBookings(data);
    setIsLoadingBookings(false);
  };

  const fetchProfile = async () => {
    if (!user) return;
    setIsLoadingProfile(true);
    const { data } = await supabase.from('profiles').select('full_name, phone, avatar_url').eq('id', user.id).maybeSingle();
    if (data) {
      setProfile(data);
      setEditForm({ full_name: data.full_name || '', phone: data.phone || '' });
    } else {
      setEditForm({ full_name: user.user_metadata?.full_name || '', phone: '' });
    }
    setIsLoadingProfile(false);
  };

  const fetchFeedbacks = async () => {
    if (!user) return;
    const { data } = await supabase.from('feedback').select('id, rating, message, tour_name, created_at, is_approved').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setFeedbacks(data);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    const { error } = await supabase.from('profiles').upsert({ id: user.id, full_name: editForm.full_name, phone: editForm.phone, updated_at: new Date().toISOString() });
    if (error) {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    } else {
      toast({ title: 'Profile Updated', description: 'Your changes have been saved.' });
      setProfile({ ...profile, ...editForm, avatar_url: profile?.avatar_url || null });
      setIsEditingProfile(false);
    }
    setIsSavingProfile(false);
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (passwords.new.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    setIsChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.new });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Password Updated', description: 'Your password has been changed.' }); setPasswords({ new: '', confirm: '' }); }
    setIsChangingPassword(false);
  };

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const handleRescheduleBooking = async (id: string, newDate: string) => {
    const { error } = await supabase.from('bookings').update({ travel_date: newDate }).eq('id', id);
    if (error) toast({ title: 'Error', description: 'Failed to reschedule', variant: 'destructive' });
    else { toast({ title: 'Rescheduled', description: `Travel date updated.` }); fetchBookings(); }
  };

  const handleCancelBooking = async (id: string) => {
    const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
    if (error) toast({ title: 'Error', description: 'Failed to cancel', variant: 'destructive' });
    else { toast({ title: 'Cancelled', description: 'Booking cancelled successfully.' }); fetchBookings(); }
  };

  const stats = useMemo(() => {
    const totalSpent = bookings.reduce((s, b) => s + Number(b.total_price || 0), 0);
    const completed = bookings.filter(b => b.status === 'completed').length;
    const upcoming = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;
    const travelers = bookings.reduce((s, b) => s + b.num_travelers, 0);
    const avgRating = feedbacks.length > 0 ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1) : '—';
    return { totalSpent, completed, upcoming, travelers, total: bookings.length, avgRating, reviews: feedbacks.length };
  }, [bookings, feedbacks]);

  const tierLabel = stats.completed >= 10 ? 'Platinum Traveler' : stats.completed >= 5 ? 'Gold Traveler' : stats.completed >= 2 ? 'Silver Traveler' : 'Explorer';

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="page-hero relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.08),transparent_60%)]" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-fade-up">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-snow/10 backdrop-blur-md border border-snow/15 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-serif font-bold text-snow">
                    {(profile?.full_name || user.user_metadata?.full_name || 'T').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-snow/20 flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-snow" />
                </div>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-snow leading-tight">
                  Welcome back, {(profile?.full_name || user.user_metadata?.full_name || 'Traveler').split(' ')[0]}
                </h1>
                <p className="text-snow/60 flex items-center gap-2 mt-1 text-sm">
                  <Mail className="w-3.5 h-3.5" /> {user.email}
                </p>
                <div className="flex items-center gap-2 mt-2.5">
                  <span className="premium-badge !text-snow !border-snow/15 !bg-snow/[0.06]">
                    <Award className="w-3.5 h-3.5 text-accent" />
                    {tierLabel}
                  </span>
                  <span className="text-[11px] text-snow/40">
                    Since {new Date(user.created_at).toLocaleDateString('en-PK', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {isAdmin && (
                <Button variant="outline" asChild className="bg-snow/5 border-snow/15 text-snow hover:bg-snow/10 text-sm">
                  <Link to="/admin">
                    <Shield className="w-4 h-4 mr-2" /> Admin
                  </Link>
                </Button>
              )}
              <Button variant="outline" onClick={handleSignOut} className="bg-snow/5 border-snow/15 text-snow hover:bg-snow/10 text-sm">
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 animate-fade-up delay-200">
            {[
              { label: 'Total Trips', value: stats.total, icon: Plane, color: 'bg-snow/[0.08] text-snow' },
              { label: 'Upcoming', value: stats.upcoming, icon: Calendar, color: 'bg-emerald-500/15 text-emerald-300' },
              { label: 'Spent', value: `${(stats.totalSpent / 1000).toFixed(0)}K`, icon: CreditCard, color: 'bg-accent/15 text-accent' },
              { label: 'Reviews', value: stats.reviews, icon: Star, color: 'bg-yellow-500/15 text-yellow-300' },
            ].map((s, i) => (
              <div key={i} className="glass-premium rounded-xl p-3.5 group hover:bg-snow/[0.06] transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color} group-hover:scale-110 transition-transform`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-snow/40 uppercase tracking-widest">{s.label}</p>
                    <p className="text-base font-bold text-snow">{s.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CONTENT ═══ */}
      <section className="py-8 sm:py-10">
        <div className="container mx-auto px-4 sm:px-6">
          <Tabs defaultValue="bookings" className="space-y-8">
            <TabsList className="glass-card p-1 rounded-2xl h-auto flex-wrap gap-1 shadow-sm">
              {[
                { value: 'bookings', icon: Calendar, label: 'Bookings' },
                { value: 'profile', icon: User, label: 'Profile' },
                { value: 'security', icon: Shield, label: 'Security' },
                { value: 'reviews', icon: Star, label: 'Reviews' },
                { value: 'notifications', icon: Bell, label: 'Settings' },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="gap-2 rounded-xl text-sm px-4 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-teal transition-all duration-300"
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ─── BOOKINGS ─── */}
            <TabsContent value="bookings" className="space-y-6 animate-fade-up">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground">Your Bookings</h2>
                  <div className="gold-divider mt-2" />
                </div>
                <Button variant="gold" asChild className="shadow-gold">
                  <Link to="/booking">
                    <Plane className="w-4 h-4 mr-2" /> Book New Tour
                  </Link>
                </Button>
              </div>

              {isLoadingBookings ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : bookings.length === 0 ? (
                <div className="glass-card rounded-3xl p-12 sm:p-16 text-center">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
                    <MapPin className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-foreground mb-2">No Bookings Yet</h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">Start your adventure by booking your first tour to Pakistan's breathtaking northern regions!</p>
                  <Button variant="gold" asChild className="shadow-gold">
                    <Link to="/tours">Explore Tours</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {bookings.map((b) => (
                    <BookingCard key={b.id} booking={b} onCancel={handleCancelBooking} onReschedule={handleRescheduleBooking} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ─── PROFILE ─── */}
            <TabsContent value="profile" className="space-y-6 animate-fade-up">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground">Your Profile</h2>
                  <div className="gold-divider mt-2" />
                </div>
                {!isEditingProfile && (
                  <Button variant="outline" onClick={() => setIsEditingProfile(true)} className="border-border/40">
                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                  </Button>
                )}
              </div>

              {isLoadingProfile ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : (
                <div className="grid gap-6 max-w-3xl">
                  {/* Personal Info */}
                  <Card className="glass-card border-0 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isEditingProfile ? (
                        <div className="space-y-5">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                            <Input value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} placeholder="Enter your full name" className="premium-input" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                            <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} placeholder="+92 300 1234567" className="premium-input" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                            <Input value={user.email || ''} disabled className="bg-muted/50 opacity-60" />
                            <p className="text-[11px] text-muted-foreground mt-1.5">Email cannot be changed for security reasons</p>
                          </div>
                          <div className="flex gap-3 pt-2">
                            <Button onClick={handleSaveProfile} disabled={isSavingProfile} className="shadow-teal">
                              {isSavingProfile ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                              Save Changes
                            </Button>
                            <Button variant="outline" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          <div className="flex items-center gap-4 pb-5 border-b border-border/30">
                            <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center">
                              <span className="text-xl font-serif font-bold text-primary">
                                {(profile?.full_name || 'T').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-foreground">{profile?.full_name || 'Not set'}</h3>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {[
                              { icon: Phone, label: 'Phone', value: profile?.phone || 'Not provided' },
                              { icon: Mail, label: 'Email', value: user.email || '' },
                              { icon: Calendar, label: 'Member Since', value: new Date(user.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' }) },
                              { icon: Plane, label: 'Total Bookings', value: `${bookings.length} booking(s)` },
                            ].map((item, i) => (
                              <div key={i} className="p-3.5 rounded-xl bg-muted/25 border border-border/25 hover:border-primary/15 transition-colors">
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mb-1 uppercase tracking-widest">
                                  <item.icon className="w-3 h-3" />{item.label}
                                </p>
                                <p className="text-sm font-medium text-foreground">{item.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Travel Stats */}
                  <Card className="glass-card border-0 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                          <BarChart3 className="w-4 h-4 text-accent" />
                        </div>
                        Travel Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <MiniStat icon={Plane} label="Total Trips" value={stats.total} color="bg-primary/10 text-primary" />
                        <MiniStat icon={CheckCircle} label="Completed" value={stats.completed} color="bg-emerald-500/10 text-emerald-600" delay="delay-100" />
                        <MiniStat icon={TrendingUp} label="Upcoming" value={stats.upcoming} color="bg-blue-500/10 text-blue-600" delay="delay-200" />
                        <MiniStat icon={User} label="Travelers" value={stats.travelers} color="bg-purple-500/10 text-purple-600" delay="delay-300" />
                        <MiniStat icon={CreditCard} label="Total Spent" value={`PKR ${stats.totalSpent.toLocaleString()}`} color="bg-accent/10 text-accent" delay="delay-400" />
                        <MiniStat icon={Star} label="Avg Rating" value={stats.avgRating} color="bg-yellow-500/10 text-yellow-600" delay="delay-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* ─── SECURITY ─── */}
            <TabsContent value="security" className="space-y-6 animate-fade-up">
              <div>
                <h2 className="text-2xl font-serif font-bold text-foreground">Account Security</h2>
                <div className="gold-divider mt-2" />
              </div>

              <div className="grid gap-6 max-w-2xl">
                <Card className="glass-card border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-primary" />
                      </div>
                      Change Password
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(['new', 'confirm'] as const).map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          {field === 'new' ? 'New Password' : 'Confirm Password'}
                        </label>
                        <div className="relative premium-input rounded-md">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                          <Input
                            type={showPasswords[field] ? 'text' : 'password'}
                            value={passwords[field]}
                            onChange={(e) => setPasswords({ ...passwords, [field]: e.target.value })}
                            placeholder={field === 'new' ? 'Min 6 characters' : 'Re-enter password'}
                            className="pl-10 pr-10 border-0 bg-transparent"
                          />
                          <button type="button" onClick={() => setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors">
                            {showPasswords[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                    <Button onClick={handleChangePassword} disabled={isChangingPassword || !passwords.new || !passwords.confirm} className="mt-2 shadow-teal">
                      {isChangingPassword ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</> : <><Shield className="w-4 h-4 mr-2" /> Update Password</>}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="glass-card border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-blue-500" />
                      </div>
                      Session Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        { label: 'User ID', value: user.id.slice(0, 8) + '···' },
                        { label: 'Auth Provider', value: user.app_metadata?.provider || 'Email' },
                        { label: 'Last Sign In', value: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : '—' },
                        { label: 'Account Created', value: new Date(user.created_at).toLocaleDateString() },
                      ].map((item, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-muted/25 border border-border/25">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{item.label}</p>
                          <p className="text-sm font-medium text-foreground mt-0.5 font-mono">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-destructive/15 bg-destructive/[0.02]">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base text-destructive flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </div>
                      Danger Zone
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Sign out from all devices. To delete your account permanently, contact our support team.</p>
                    <Button variant="outline" onClick={handleSignOut} className="border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all">
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out All Devices
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ─── REVIEWS ─── */}
            <TabsContent value="reviews" className="space-y-6 animate-fade-up">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground">My Reviews</h2>
                  <div className="gold-divider mt-2" />
                </div>
                <Button variant="gold" asChild className="shadow-gold">
                  <Link to="/feedback">
                    <Heart className="w-4 h-4 mr-2" /> Write Review
                  </Link>
                </Button>
              </div>

              {feedbacks.length === 0 ? (
                <div className="glass-card rounded-3xl p-12 sm:p-16 text-center">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
                    <MessageSquare className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-foreground mb-2">No Reviews Yet</h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">Share your travel experiences and help other explorers!</p>
                  <Button variant="gold" asChild className="shadow-gold">
                    <Link to="/feedback">Write Your First Review</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 max-w-3xl">
                  {feedbacks.map((fb, i) => (
                    <Card key={fb.id} className="glass-card border-0 shadow-sm ultra-card" style={{ animationDelay: `${i * 80}ms` }}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2.5">
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, j) => (
                                  <Star key={j} className={`w-4 h-4 ${j < fb.rating ? 'text-accent fill-accent' : 'text-muted-foreground/20'}`} />
                                ))}
                              </div>
                              {fb.tour_name && (
                                <Badge variant="outline" className="text-xs font-normal">{fb.tour_name}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-foreground leading-relaxed">{fb.message}</p>
                            <p className="text-xs text-muted-foreground mt-2.5">{new Date(fb.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                          <Badge className={`shrink-0 ${fb.is_approved ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-accent/10 text-accent border-accent/20'}`}>
                            {fb.is_approved ? 'Published' : 'Pending'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ─── NOTIFICATIONS / SETTINGS ─── */}
            <TabsContent value="notifications" className="space-y-6 animate-fade-up">
              <div>
                <h2 className="text-2xl font-serif font-bold text-foreground">Preferences & Settings</h2>
                <div className="gold-divider mt-2" />
              </div>

              <div className="max-w-2xl grid gap-6">
                <Card className="glass-card border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Bell className="w-4 h-4 text-primary" />
                      </div>
                      Notification Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { key: 'booking_updates' as const, icon: Calendar, title: 'Booking Updates', desc: 'Confirmations, cancellations, and status changes' },
                      { key: 'promotions' as const, icon: Tag, title: 'Deals & Promotions', desc: 'Exclusive offers and limited-time deals' },
                      { key: 'newsletter' as const, icon: Globe, title: 'Newsletter', desc: 'Monthly travel tips and destination guides' },
                      { key: 'sms_alerts' as const, icon: Phone, title: 'SMS Alerts', desc: 'Important booking reminders via text' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-muted/15 border border-border/20 hover:border-primary/15 transition-all group">
                        <div className="flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center group-hover:bg-primary/12 transition-colors">
                            <item.icon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                        <Switch
                          checked={notifPrefs[item.key]}
                          onCheckedChange={(checked) => setNotifPrefs({ ...notifPrefs, [item.key]: checked })}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card className="glass-card border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
                        <HelpCircle className="w-4 h-4 text-accent" />
                      </div>
                      Quick Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {[
                      { label: 'Contact Support', href: '/contact', icon: MessageSquare },
                      { label: 'Give Feedback', href: '/feedback', icon: Star },
                      { label: 'Browse Tours', href: '/tours', icon: MapPin },
                      { label: 'View Deals', href: '/deals', icon: Tag },
                    ].map((link, i) => (
                      <Link key={i} to={link.href} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/20 transition-all duration-200 group">
                        <div className="flex items-center gap-3">
                          <link.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-sm text-foreground group-hover:text-primary transition-colors">{link.label}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}
