import { useState, useEffect, useRef } from 'react';
import { Check, X, Loader2, Eye, Search, Trash2, Download, Tag, Printer, Edit, Undo, CheckSquare, Square, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { bookingsApi } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  original_price: number | null;
  discount_applied: number | null;
  created_at: string;
  deal_id: string | null;
  is_deleted: boolean | null;
  tours?: { title: string; image_url: string | null } | null;
  deals?: { title: string; discount_percent: number | null; code: string | null } | null;
}

export default function AdminBookings() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [deletedBookings, setDeletedBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('active');
  const printRef = useRef<HTMLDivElement>(null);

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
    
    // Fetch active bookings
    const { data: activeData, error: activeError } = await bookingsApi.getAll();
    if (!activeError && activeData) {
      setBookings((activeData as Booking[]).filter(b => !b.is_deleted));
    }

    // Fetch deleted bookings
    const { data: deletedData, error: deletedError } = await bookingsApi.getAll({ includeDeleted: true });
    if (!deletedError && deletedData) {
      setDeletedBookings((deletedData as Booking[]).filter(b => b.is_deleted));
    }

    setIsLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await bookingsApi.update(id, { status });

    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Booking ${status}` });
      fetchBookings();
    }
  };

  const updateBooking = async () => {
    if (!editingBooking) return;
    
    const { error } = await bookingsApi.update(editingBooking.id, {
      customer_name: editingBooking.customer_name,
      customer_email: editingBooking.customer_email,
      customer_phone: editingBooking.customer_phone,
      travel_date: editingBooking.travel_date,
      num_travelers: editingBooking.num_travelers,
      total_price: editingBooking.total_price,
      special_requests: editingBooking.special_requests,
    });

    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Booking updated' });
      setEditingBooking(null);
      fetchBookings();
    }
  };

  const deleteBooking = async (id: string) => {
    const { error } = await bookingsApi.delete(id);

    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Booking moved to archive' });
      setSelectedBooking(null);
      fetchBookings();
    }
  };

  const restoreBooking = async (id: string) => {
    const { error } = await bookingsApi.restore(id);

    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Booking restored' });
      fetchBookings();
    }
  };

  // Bulk actions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredBookings.map(b => b.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const bulkUpdateStatus = async (status: string) => {
    if (selectedIds.size === 0) return;
    
    const { error } = await bookingsApi.bulkUpdate(Array.from(selectedIds), { status });
    
    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `${selectedIds.size} bookings updated to ${status}` });
      setSelectedIds(new Set());
      fetchBookings();
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    const { error } = await bookingsApi.bulkDelete(Array.from(selectedIds));
    
    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `${selectedIds.size} bookings moved to archive` });
      setSelectedIds(new Set());
      fetchBookings();
    }
  };

  const printBookingSlip = (booking: Booking) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Booking Slip - ${booking.id.slice(0, 8).toUpperCase()}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #1e40af; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: bold; color: #333; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .label { color: #666; }
          .value { font-weight: 500; }
          .total { font-size: 20px; color: #1e40af; text-align: right; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          @media print { body { print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Indus Tours</div>
          <p>Booking Confirmation</p>
        </div>
        
        <div class="section">
          <div class="section-title">Booking Information</div>
          <div class="row"><span class="label">Booking ID:</span><span class="value">${booking.id.slice(0, 8).toUpperCase()}</span></div>
          <div class="row"><span class="label">Status:</span><span class="value">${booking.status?.toUpperCase()}</span></div>
          <div class="row"><span class="label">Date Created:</span><span class="value">${new Date(booking.created_at).toLocaleDateString()}</span></div>
        </div>

        <div class="section">
          <div class="section-title">Customer Details</div>
          <div class="row"><span class="label">Name:</span><span class="value">${booking.customer_name}</span></div>
          <div class="row"><span class="label">Email:</span><span class="value">${booking.customer_email}</span></div>
          <div class="row"><span class="label">Phone:</span><span class="value">${booking.customer_phone}</span></div>
          ${booking.customer_nationality ? `<div class="row"><span class="label">Nationality:</span><span class="value">${booking.customer_nationality}</span></div>` : ''}
          ${booking.customer_cnic ? `<div class="row"><span class="label">CNIC:</span><span class="value">${booking.customer_cnic}</span></div>` : ''}
        </div>

        <div class="section">
          <div class="section-title">Tour Details</div>
          <div class="row"><span class="label">Tour:</span><span class="value">${booking.tours?.title || 'Custom Request'}</span></div>
          <div class="row"><span class="label">Travel Date:</span><span class="value">${new Date(booking.travel_date).toLocaleDateString()}</span></div>
          <div class="row"><span class="label">Travelers:</span><span class="value">${booking.num_travelers} person(s)</span></div>
          ${booking.deals ? `<div class="row"><span class="label">Deal Applied:</span><span class="value">${booking.deals.title} (${booking.deals.discount_percent}% off)</span></div>` : ''}
        </div>

        ${booking.special_requests ? `
        <div class="section">
          <div class="section-title">Special Requests</div>
          <p>${booking.special_requests}</p>
        </div>
        ` : ''}

        <div class="total">
          Total Amount: PKR ${Number(booking.total_price || 0).toLocaleString()}
        </div>

        <div class="footer">
          <p>Thank you for booking with Indus Tours!</p>
          <p>Contact: info@industours.pk | +92 300 1234567</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      b.customer_email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ['Customer Name', 'Email', 'Phone', 'Tour', 'Date', 'Travelers', 'Amount', 'Status', 'Created At'];
    const csvData = filteredBookings.map(b => [
      b.customer_name,
      b.customer_email,
      b.customer_phone,
      b.tours?.title || 'Custom Request',
      new Date(b.travel_date).toLocaleDateString(),
      b.num_travelers,
      b.total_price,
      b.status,
      new Date(b.created_at).toLocaleString()
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: 'Success', description: 'Bookings exported to CSV' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const BookingsTable = ({ data, isArchive = false }: { data: Booking[], isArchive?: boolean }) => (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {!isArchive && (
                <th className="p-4 w-12">
                  <Checkbox
                    checked={selectedIds.size === data.length && data.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
              )}
              <th className="text-left p-4 font-medium text-foreground">Customer</th>
              <th className="text-left p-4 font-medium text-foreground">Tour / Deal</th>
              <th className="text-left p-4 font-medium text-foreground">Date</th>
              <th className="text-left p-4 font-medium text-foreground">Amount</th>
              <th className="text-left p-4 font-medium text-foreground">Status</th>
              <th className="text-left p-4 font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={isArchive ? 6 : 7} className="p-8 text-center text-muted-foreground">
                  No bookings found
                </td>
              </tr>
            ) : (
              data.map((booking) => (
                <tr key={booking.id} className="border-t border-border">
                  {!isArchive && (
                    <td className="p-4">
                      <Checkbox
                        checked={selectedIds.has(booking.id)}
                        onCheckedChange={(checked) => handleSelectOne(booking.id, checked as boolean)}
                      />
                    </td>
                  )}
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-foreground">{booking.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{booking.customer_email}</p>
                    </div>
                  </td>
                  <td className="p-4 text-foreground">
                    <div>
                      <p>{booking.tours?.title || 'Custom Request'}</p>
                      {booking.deals && (
                        <span className="text-xs text-accent flex items-center gap-1 mt-1">
                          <Tag className="w-3 h-3" />
                          {booking.deals.title} ({booking.deals.discount_percent}% off)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-foreground">
                    {new Date(booking.travel_date).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-foreground font-medium">
                    PKR {Number(booking.total_price || 0).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-600' :
                      booking.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                      booking.status === 'completed' ? 'bg-primary/10 text-primary' :
                      'bg-accent/10 text-accent'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setSelectedBooking(booking)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {isArchive ? (
                        <Button size="icon" variant="ghost" onClick={() => restoreBooking(booking.id)}>
                          <Undo className="w-4 h-4 text-primary" />
                        </Button>
                      ) : (
                        <>
                          <Button size="icon" variant="ghost" onClick={() => setEditingBooking(booking)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => printBookingSlip(booking)}>
                            <Printer className="w-4 h-4" />
                          </Button>
                          {booking.status === 'pending' && (
                            <>
                              <Button size="icon" variant="ghost" onClick={() => updateStatus(booking.id, 'confirmed')}>
                                <Check className="w-4 h-4 text-emerald-600" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => updateStatus(booking.id, 'cancelled')}>
                                <X className="w-4 h-4 text-destructive" />
                              </Button>
                            </>
                          )}
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
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active Bookings ({bookings.length})</TabsTrigger>
          <TabsTrigger value="archive">
            <Archive className="w-4 h-4 mr-1" />
            Archive ({deletedBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {/* Filters & Bulk Actions */}
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
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
                {selectedIds.size > 0 && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => bulkUpdateStatus('confirmed')}>
                      <Check className="w-4 h-4 mr-1" /> Confirm ({selectedIds.size})
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => bulkUpdateStatus('cancelled')}>
                      <X className="w-4 h-4 mr-1" /> Cancel ({selectedIds.size})
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4 mr-1" /> Delete ({selectedIds.size})
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {selectedIds.size} bookings?</AlertDialogTitle>
                          <AlertDialogDescription>
                            These bookings will be moved to the archive.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={bulkDelete} className="bg-destructive text-destructive-foreground">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Export</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={exportToCSV}>
                      Export as CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="capitalize text-xs sm:text-sm"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <BookingsTable data={filteredBookings} />
          </div>
        </TabsContent>

        <TabsContent value="archive">
          <div className="mt-4">
            <BookingsTable data={deletedBookings} isArchive />
          </div>
        </TabsContent>
      </Tabs>

      {/* Booking Details Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              {/* Tour Image */}
              {selectedBooking.tours?.image_url && (
                <img 
                  src={selectedBooking.tours.image_url} 
                  alt={selectedBooking.tours.title}
                  className="w-full h-40 object-cover rounded-lg"
                />
              )}

              {/* Customer Information */}
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold text-foreground mb-3">👤 Customer Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Full Name</p>
                    <p className="font-medium">{selectedBooking.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedBooking.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedBooking.customer_phone}</p>
                  </div>
                  {selectedBooking.customer_nationality && (
                    <div>
                      <p className="text-muted-foreground">Nationality</p>
                      <p className="font-medium">{selectedBooking.customer_nationality}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tour Details */}
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold text-foreground mb-3">🗺️ Tour Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Tour</p>
                    <p className="font-medium">{selectedBooking.tours?.title || 'Custom Request'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Travel Date</p>
                    <p className="font-medium">{new Date(selectedBooking.travel_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Travelers</p>
                    <p className="font-medium">{selectedBooking.num_travelers}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-medium text-primary">PKR {Number(selectedBooking.total_price || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <Button onClick={() => printBookingSlip(selectedBooking)}>
                  <Printer className="w-4 h-4 mr-2" /> Print Slip
                </Button>
                <Button variant="outline" onClick={() => { setEditingBooking(selectedBooking); setSelectedBooking(null); }}>
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Booking Modal */}
      <Dialog open={!!editingBooking} onOpenChange={() => setEditingBooking(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          {editingBooking && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Customer Name</label>
                <Input
                  value={editingBooking.customer_name}
                  onChange={(e) => setEditingBooking({ ...editingBooking, customer_name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    value={editingBooking.customer_email}
                    onChange={(e) => setEditingBooking({ ...editingBooking, customer_email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={editingBooking.customer_phone}
                    onChange={(e) => setEditingBooking({ ...editingBooking, customer_phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Travel Date</label>
                  <Input
                    type="date"
                    value={editingBooking.travel_date}
                    onChange={(e) => setEditingBooking({ ...editingBooking, travel_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Travelers</label>
                  <Input
                    type="number"
                    value={editingBooking.num_travelers}
                    onChange={(e) => setEditingBooking({ ...editingBooking, num_travelers: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Total Price (PKR)</label>
                <Input
                  type="number"
                  value={editingBooking.total_price}
                  onChange={(e) => setEditingBooking({ ...editingBooking, total_price: Number(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground mt-1">Modify to apply special offer/discount</p>
              </div>
              <div>
                <label className="text-sm font-medium">Special Requests</label>
                <Input
                  value={editingBooking.special_requests || ''}
                  onChange={(e) => setEditingBooking({ ...editingBooking, special_requests: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={updateBooking}>Save Changes</Button>
                <Button variant="outline" onClick={() => setEditingBooking(null)}>Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}