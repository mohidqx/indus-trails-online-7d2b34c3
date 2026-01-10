import { useState, useEffect } from 'react';
import { Check, X, Loader2, Eye, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_nationality: string | null;
  customer_cnic: string | null;
  customer_address: string | null;
  travel_date: string;
  num_travelers: number;
  special_requests: string | null;
  status: string;
  total_price: number;
  created_at: string;
  tours?: { title: string } | null;
}

export default function AdminBookings() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
    const channel = supabase
      .channel('bookings-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchBookings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*, tours(title)')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Unable to load bookings',
        description: error.message,
        variant: 'destructive',
      });
      setBookings([]);
    } else {
      setBookings(data || []);
    }

    setIsLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Booking ${status}` });
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      b.customer_email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium text-foreground">Customer</th>
                <th className="text-left p-4 font-medium text-foreground">Tour</th>
                <th className="text-left p-4 font-medium text-foreground">Date</th>
                <th className="text-left p-4 font-medium text-foreground">Amount</th>
                <th className="text-left p-4 font-medium text-foreground">Status</th>
                <th className="text-left p-4 font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No bookings found
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-t border-border">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{booking.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{booking.customer_email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-foreground">
                      {booking.tours?.title || 'Custom Request'}
                    </td>
                    <td className="p-4 text-foreground">
                      {new Date(booking.travel_date).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-foreground font-medium">
                      PKR {Number(booking.total_price || 0).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'confirmed' ? 'bg-emerald/10 text-emerald' :
                        booking.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                        booking.status === 'completed' ? 'bg-primary/10 text-primary' :
                        'bg-accent/10 text-accent'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => setSelectedBooking(booking)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {booking.status === 'pending' && (
                          <>
                            <Button size="icon" variant="ghost" onClick={() => updateStatus(booking.id, 'confirmed')}>
                              <Check className="w-4 h-4 text-emerald" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => updateStatus(booking.id, 'cancelled')}>
                              <X className="w-4 h-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Customer Information */}
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  👤 Customer Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Full Name</p>
                    <p className="font-medium">{selectedBooking.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                    <p className="font-medium">{selectedBooking.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Phone Number</p>
                    <p className="font-medium">{selectedBooking.customer_phone}</p>
                  </div>
                  {selectedBooking.customer_nationality && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Nationality</p>
                      <p className="font-medium">{selectedBooking.customer_nationality}</p>
                    </div>
                  )}
                  {selectedBooking.customer_cnic && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">CNIC</p>
                      <p className="font-medium">{selectedBooking.customer_cnic}</p>
                    </div>
                  )}
                </div>
                {selectedBooking.customer_address && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Full Address</p>
                    <p className="font-medium">{selectedBooking.customer_address}</p>
                  </div>
                )}
              </div>

              {/* Tour Details */}
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  🗺️ Tour Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Tour Package</p>
                    <p className="font-medium">{selectedBooking.tours?.title || 'Custom Request'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Travel Date</p>
                    <p className="font-medium">{new Date(selectedBooking.travel_date).toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Number of Travelers</p>
                    <p className="font-medium">{selectedBooking.num_travelers} person(s)</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Amount</p>
                    <p className="font-medium text-primary text-lg">PKR {Number(selectedBooking.total_price || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.special_requests && (
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    📝 Special Requests
                  </h4>
                  <p className="text-foreground">{selectedBooking.special_requests}</p>
                </div>
              )}

              {/* Booking Meta */}
              <div className="p-4 rounded-lg bg-muted/30 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Booking ID:</span>
                  <span className="font-mono">{selectedBooking.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-muted-foreground">Submitted:</span>
                  <span>{new Date(selectedBooking.created_at).toLocaleString('en-PK')}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium ${
                    selectedBooking.status === 'confirmed' ? 'text-emerald-600' :
                    selectedBooking.status === 'cancelled' ? 'text-destructive' :
                    selectedBooking.status === 'completed' ? 'text-primary' :
                    'text-accent'
                  }`}>{selectedBooking.status?.toUpperCase()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-border">
                {selectedBooking.status === 'pending' && (
                  <>
                    <Button onClick={() => { updateStatus(selectedBooking.id, 'confirmed'); setSelectedBooking(null); }}>
                      <Check className="w-4 h-4 mr-2" /> Confirm
                    </Button>
                    <Button variant="destructive" onClick={() => { updateStatus(selectedBooking.id, 'cancelled'); setSelectedBooking(null); }}>
                      <X className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                  </>
                )}
                {selectedBooking.status === 'confirmed' && (
                  <Button onClick={() => { updateStatus(selectedBooking.id, 'completed'); setSelectedBooking(null); }}>
                    Mark as Completed
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
