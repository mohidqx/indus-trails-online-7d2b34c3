import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { toursApi } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import ImageUpload from '@/components/common/ImageUpload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface HotelOption {
  id: string;
  name: string;
  location: string | null;
  star_rating: number | null;
}

interface Tour {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  price: number;
  discount_price: number | null;
  max_group_size: number | null;
  difficulty: string | null;
  includes: string[] | null;
  image_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  hotel_id: string | null;
  hotels?: HotelOption | null;
}

const emptyTour = {
  title: '',
  description: '',
  duration: '',
  price: 0,
  discount_price: null as number | null,
  max_group_size: 10,
  difficulty: 'Moderate',
  includes: [] as string[],
  image_url: '',
  is_featured: false,
  is_active: true,
  hotel_id: null as string | null,
};

export default function AdminTours() {
  const { toast } = useToast();
  const [tours, setTours] = useState<Tour[]>([]);
  const [hotels, setHotels] = useState<HotelOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTour, setEditingTour] = useState<typeof emptyTour & { id?: string }>(emptyTour);
  const [includeInput, setIncludeInput] = useState('');

  useEffect(() => {
    fetchTours();
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    const { data } = await supabase
      .from('hotels')
      .select('id, name, location, star_rating')
      .eq('is_active', true)
      .order('name');
    if (data) setHotels(data);
  };

  const fetchTours = async () => {
    setIsLoading(true);
    const { data, error } = await toursApi.getAll();

    if (!error && data) {
      setTours(data as Tour[]);
    } else if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const saveTour = async () => {
    const tourData = {
      title: editingTour.title,
      description: editingTour.description || null,
      duration: editingTour.duration || null,
      price: editingTour.price,
      discount_price: editingTour.discount_price || null,
      max_group_size: editingTour.max_group_size || 10,
      difficulty: editingTour.difficulty || 'Moderate',
      includes: editingTour.includes || [],
      image_url: editingTour.image_url || null,
      is_featured: editingTour.is_featured,
      is_active: editingTour.is_active,
      hotel_id: editingTour.hotel_id || null,
    };

    let result;
    if (editingTour.id) {
      result = await toursApi.update(editingTour.id, tourData);
    } else {
      result = await toursApi.create(tourData);
    }

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Tour ${editingTour.id ? 'updated' : 'created'}` });
      setIsEditing(false);
      setEditingTour(emptyTour);
      fetchTours();
    }
  };

  const deleteTour = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tour?')) return;

    const { error } = await toursApi.delete(id);

    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Tour deleted' });
      fetchTours();
    }
  };

  const addInclude = () => {
    if (includeInput.trim()) {
      setEditingTour({
        ...editingTour,
        includes: [...(editingTour.includes || []), includeInput.trim()],
      });
      setIncludeInput('');
    }
  };

  const removeInclude = (index: number) => {
    setEditingTour({
      ...editingTour,
      includes: editingTour.includes?.filter((_, i) => i !== index) || [],
    });
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
        <p className="text-muted-foreground">{tours.length} tours</p>
        <Button onClick={() => { setEditingTour(emptyTour); setIsEditing(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Tour
        </Button>
      </div>

      {/* Tours Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tours.map((tour) => (
          <div key={tour.id} className="bg-card rounded-2xl overflow-hidden shadow-card">
            <div className="aspect-video bg-muted flex items-center justify-center relative">
              {tour.image_url ? (
                <img src={tour.image_url} alt={tour.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <ImageIcon className="w-8 h-8 mb-1" />
                  <span className="text-sm">No image</span>
                </div>
              )}
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-foreground">{tour.title}</h3>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditingTour(tour); setIsEditing(true); }}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteTour(tour.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="px-2 py-1 rounded bg-muted">{tour.duration}</span>
                <span className="px-2 py-1 rounded bg-muted">{tour.difficulty}</span>
                {!tour.is_active && <span className="px-2 py-1 rounded bg-destructive/10 text-destructive">Inactive</span>}
                {tour.is_featured && <span className="px-2 py-1 rounded bg-primary/10 text-primary">Featured</span>}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-foreground">PKR {tour.price.toLocaleString()}</span>
                {tour.discount_price && (
                  <span className="text-sm text-muted-foreground line-through">
                    PKR {tour.discount_price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTour.id ? 'Edit Tour' : 'Add New Tour'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={editingTour.title}
                onChange={(e) => setEditingTour({ ...editingTour, title: e.target.value })}
                placeholder="Tour title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editingTour.description || ''}
                onChange={(e) => setEditingTour({ ...editingTour, description: e.target.value })}
                placeholder="Tour description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Duration</label>
                <Input
                  value={editingTour.duration || ''}
                  onChange={(e) => setEditingTour({ ...editingTour, duration: e.target.value })}
                  placeholder="e.g., 7 Days"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Difficulty</label>
                <select
                  value={editingTour.difficulty || 'Moderate'}
                  onChange={(e) => setEditingTour({ ...editingTour, difficulty: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option>Easy</option>
                  <option>Moderate</option>
                  <option>Challenging</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Price (PKR) *</label>
                <Input
                  type="number"
                  value={editingTour.price}
                  onChange={(e) => setEditingTour({ ...editingTour, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Discount Price (PKR)</label>
                <Input
                  type="number"
                  value={editingTour.discount_price || ''}
                  onChange={(e) => setEditingTour({ ...editingTour, discount_price: e.target.value ? Number(e.target.value) : null })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Max Group Size</label>
              <Input
                type="number"
                value={editingTour.max_group_size || 10}
                onChange={(e) => setEditingTour({ ...editingTour, max_group_size: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Partner Hotel (Stay Included)</label>
              <select
                value={editingTour.hotel_id || ''}
                onChange={(e) => setEditingTour({ ...editingTour, hotel_id: e.target.value || null })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="">No hotel included</option>
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name} {hotel.location ? `- ${hotel.location}` : ''} {hotel.star_rating ? `(${hotel.star_rating}★)` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Image</label>
              <ImageUpload
                value={editingTour.image_url || null}
                onChange={(url) => setEditingTour({ ...editingTour, image_url: url || '' })}
                folder="tours"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Includes</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={includeInput}
                  onChange={(e) => setIncludeInput(e.target.value)}
                  placeholder="e.g., Accommodation"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInclude())}
                />
                <Button type="button" onClick={addInclude}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editingTour.includes?.map((item, i) => (
                  <span key={i} className="flex items-center gap-1 px-2 py-1 rounded bg-muted text-sm">
                    {item}
                    <button onClick={() => removeInclude(i)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingTour.is_active}
                  onChange={(e) => setEditingTour({ ...editingTour, is_active: e.target.checked })}
                />
                Active
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingTour.is_featured}
                  onChange={(e) => setEditingTour({ ...editingTour, is_featured: e.target.checked })}
                />
                Featured
              </label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={saveTour} disabled={!editingTour.title || !editingTour.price}>
                {editingTour.id ? 'Update' : 'Create'} Tour
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}