import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Hotel {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
  star_rating: number | null;
  amenities: string[] | null;
  image_url: string | null;
  is_active: boolean;
}

export default function AdminHotels() {
  const { toast } = useToast();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    star_rating: 3,
    amenities: '',
    image_url: '',
    is_active: true,
  });

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setHotels(data.map(h => ({ ...h, is_active: h.is_active ?? true })));
    }
    setIsLoading(false);
  };

  const openDialog = (hotel?: Hotel) => {
    if (hotel) {
      setEditingHotel(hotel);
      setFormData({
        name: hotel.name,
        location: hotel.location || '',
        description: hotel.description || '',
        star_rating: hotel.star_rating || 3,
        amenities: hotel.amenities?.join(', ') || '',
        image_url: hotel.image_url || '',
        is_active: hotel.is_active,
      });
    } else {
      setEditingHotel(null);
      setFormData({
        name: '',
        location: '',
        description: '',
        star_rating: 3,
        amenities: '',
        image_url: '',
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hotelData = {
      name: formData.name,
      location: formData.location || null,
      description: formData.description || null,
      star_rating: formData.star_rating,
      amenities: formData.amenities
        ? formData.amenities.split(',').map((a) => a.trim()).filter(Boolean)
        : null,
      image_url: formData.image_url || null,
      is_active: formData.is_active,
    };

    if (editingHotel) {
      const { error } = await supabase
        .from('hotels')
        .update(hotelData)
        .eq('id', editingHotel.id);

      if (error) {
        toast({ title: 'Error', description: 'Failed to update hotel', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Hotel updated successfully' });
        fetchHotels();
        setIsDialogOpen(false);
      }
    } else {
      const { error } = await supabase.from('hotels').insert(hotelData);

      if (error) {
        toast({ title: 'Error', description: 'Failed to create hotel', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Hotel created successfully' });
        fetchHotels();
        setIsDialogOpen(false);
      }
    }
  };

  const deleteHotel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hotel?')) return;

    const { error } = await supabase.from('hotels').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete hotel', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Hotel deleted' });
      fetchHotels();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Manage partner hotels for tour packages</p>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" /> Add Hotel
        </Button>
      </div>

      {/* Hotels Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <div
            key={hotel.id}
            className={`bg-card rounded-2xl overflow-hidden shadow-card ${
              !hotel.is_active ? 'opacity-60' : ''
            }`}
          >
            <div className="relative h-40 overflow-hidden">
              <img
                src={hotel.image_url || '/placeholder.svg'}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
              {hotel.star_rating && (
                <div className="absolute top-3 right-3 bg-background/90 px-2 py-1 rounded-full flex items-center gap-1">
                  {Array.from({ length: hotel.star_rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                  ))}
                </div>
              )}
              {!hotel.is_active && (
                <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
                  Inactive
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-foreground mb-1">{hotel.name}</h3>
              {hotel.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <MapPin className="w-3 h-3" />
                  {hotel.location}
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => openDialog(hotel)}>
                  <Pencil className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteHotel(hotel.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hotels.length === 0 && (
        <div className="text-center py-12 bg-card rounded-2xl">
          <p className="text-muted-foreground">No hotels yet. Add your first hotel!</p>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingHotel ? 'Edit Hotel' : 'Add New Hotel'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Hotel Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Serena Hotel Hunza"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Karimabad, Hunza"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the hotel..."
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Star Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, star_rating: star })}
                    className="p-1"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= formData.star_rating
                          ? 'fill-accent text-accent'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Amenities (comma-separated)
              </label>
              <Input
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                placeholder="Free WiFi, Restaurant, Parking, Heating"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <label className="text-sm">Active (visible to users)</label>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingHotel ? 'Update' : 'Create'} Hotel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
