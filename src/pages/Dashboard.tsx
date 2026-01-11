import { useState, useEffect } from 'react';
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
  Phone, Mail, Edit2, Save, X
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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
}

interface Profile {
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
}

interface BookingCardProps {
  booking: Booking;
  getStatusColor: (status: string | null) => string;
  getStatusIcon: (status: string | null) => JSX.Element;
  onCancel: (id: string) => void;
}

function BookingCard({ booking, getStatusColor, getStatusIcon, onCancel }: BookingCardProps) {
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
  
  return (
    <div className="bg-card rounded-2xl p-6 shadow-card hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-lg font-semibold text-foreground">
              {booking.tours?.title || 'Custom Tour Request'}
            </h3>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
              {getStatusIcon(booking.status)}
              {booking.status || 'pending'}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(booking.travel_date).toLocaleDateString('en-PK', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {booking.num_travelers} traveler(s)
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Booked {new Date(booking.created_at).toLocaleDateString()}
            </span>
          </div>
          {booking.special_requests && (
            <p className="text-sm text-muted-foreground italic">
              Note: {booking.special_requests}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="text-2xl font-bold text-primary">
            PKR {Number(booking.total_price || 0).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Total Amount</p>
          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                  <X className="w-4 h-4 mr-1" /> Cancel Booking
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel your booking for {booking.tours?.title || 'this tour'}? This action will notify the tour operator.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onCancel(booking.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Yes, Cancel
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', phone: '' });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchBookings();
      fetchProfile();
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;
    
    setIsLoadingBookings(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('id, travel_date, num_travelers, status, total_price, created_at, special_requests, tours(title)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBookings(data);
    }
    setIsLoadingBookings(false);
  };

  const fetchProfile = async () => {
    if (!user) return;
    
    setIsLoadingProfile(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, phone, avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    if (!error && data) {
      setProfile(data);
      setEditForm({ 
        full_name: data.full_name || '', 
        phone: data.phone || '' 
      });
    } else {
      // Create profile if doesn't exist
      setEditForm({ 
        full_name: user.user_metadata?.full_name || '', 
        phone: '' 
      });
    }
    setIsLoadingProfile(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSavingProfile(true);
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: editForm.full_name,
        phone: editForm.phone,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      setProfile({ ...profile, ...editForm, avatar_url: profile?.avatar_url || null });
      setIsEditingProfile(false);
    }
    setIsSavingProfile(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleCancelBooking = async (id: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to cancel booking', 
        variant: 'destructive' 
      });
    } else {
      toast({ 
        title: 'Booking Cancelled', 
        description: 'Your booking has been cancelled successfully' 
      });
      fetchBookings();
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-primary" />;
      default:
        return <AlertCircle className="w-4 h-4 text-accent" />;
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'completed':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-accent/10 text-accent border-accent/20';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-gradient-mountain">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-snow mb-2">
                Welcome, {profile?.full_name || user.user_metadata?.full_name || 'Traveler'}!
              </h1>
              <p className="text-snow/80">
                <Mail className="w-4 h-4 inline mr-2" />
                {user.email}
              </p>
            </div>
            <div className="flex gap-3">
              {isAdmin && (
                <Button variant="outline" asChild className="bg-snow/10 border-snow/20 text-snow hover:bg-snow/20">
                  <Link to="/admin">Admin Panel</Link>
                </Button>
              )}
              <Button variant="outline" onClick={handleSignOut} className="bg-snow/10 border-snow/20 text-snow hover:bg-snow/20">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <Tabs defaultValue="bookings" className="space-y-8">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="bookings" className="gap-2">
                <Calendar className="w-4 h-4" />
                My Bookings
              </TabsTrigger>
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
            </TabsList>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold text-foreground">Your Bookings</h2>
                <Button variant="gold" asChild>
                  <Link to="/booking">Book New Tour</Link>
                </Button>
              </div>

              {isLoadingBookings ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="bg-card rounded-2xl p-12 text-center shadow-card">
                  <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Bookings Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start your adventure by booking your first tour to Pakistan's beautiful north!
                  </p>
                  <Button variant="gold" asChild>
                    <Link to="/tours">Explore Tours</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {bookings.map((booking) => (
                    <BookingCard 
                      key={booking.id} 
                      booking={booking} 
                      getStatusColor={getStatusColor}
                      getStatusIcon={getStatusIcon}
                      onCancel={handleCancelBooking}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold text-foreground">Your Profile</h2>
                {!isEditingProfile && (
                  <Button variant="outline" onClick={() => setIsEditingProfile(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>

              {isLoadingProfile ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="bg-card rounded-2xl p-8 shadow-card max-w-2xl">
                  {isEditingProfile ? (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                        <Input
                          value={editForm.full_name}
                          onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                        <Input
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          placeholder="+92 300 1234567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                        <Input
                          value={user.email || ''}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                          {isSavingProfile ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-10 h-10 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-foreground">
                            {profile?.full_name || user.user_metadata?.full_name || 'Not set'}
                          </h3>
                          <p className="text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            <Phone className="w-4 h-4 inline mr-2" />
                            Phone Number
                          </p>
                          <p className="font-medium text-foreground">
                            {profile?.phone || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            <Mail className="w-4 h-4 inline mr-2" />
                            Email Address
                          </p>
                          <p className="font-medium text-foreground">{user.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Member Since
                          </p>
                          <p className="font-medium text-foreground">
                            {new Date(user.created_at).toLocaleDateString('en-PK', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            <MapPin className="w-4 h-4 inline mr-2" />
                            Total Bookings
                          </p>
                          <p className="font-medium text-foreground">{bookings.length} booking(s)</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}