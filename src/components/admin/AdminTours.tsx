import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
};

export default function AdminTours() {
  const { toast } = useToast();
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTour, setEditingTour] = useState<typeof emptyTour & { id?: string }>(emptyTour);
  const [includeInput, setIncludeInput] = useState('');

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTours(data);
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
    };

    let error;
    if (editingTour.id) {
      ({ error } = await supabase.from('tours').update(tourData).eq('id', editingTour.id));
    } else {
      ({ error } = await supabase.from('tours').insert(tourData));
    }

    if (error) {
      toast({ title: 'Error', description: 'Failed to save tour', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Tour ${editingTour.id ? 'updated' : 'created'}` });
      setIsEditing(false);
      setEditingTour(emptyTour);
      fetchTours();
    }
  };

  const deleteTour = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tour?')) return;

    const { error } = await supabase.from('tours').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete tour', variant: 'destructive' });
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
            <div className="aspect-video bg-muted flex items-center justify-center">
              {tour.image_url ? (
                <img src={tour.image_url} alt={tour.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-muted-foreground">No image</span>
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
              <label className="text-sm font-medium">Image URL</label>
              <Input
                value={editingTour.image_url || ''}
                onChange={(e) => setEditingTour({ ...editingTour, image_url: e.target.value })}
                placeholder="https://..."
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
