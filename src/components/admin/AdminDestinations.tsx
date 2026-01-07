import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ImageUpload from '@/components/common/ImageUpload';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Destination {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
  image_url: string | null;
  highlights: string[] | null;
  best_time: string | null;
  is_featured: boolean;
}

const emptyDestination = {
  name: '',
  location: '',
  description: '',
  image_url: '',
  highlights: [] as string[],
  best_time: '',
  is_featured: false,
};

export default function AdminDestinations() {
  const { toast } = useToast();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDest, setEditingDest] = useState<typeof emptyDestination & { id?: string }>(emptyDestination);
  const [highlightInput, setHighlightInput] = useState('');

  useEffect(() => { fetchDestinations(); }, []);

  const fetchDestinations = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('destinations').select('*').order('created_at', { ascending: false });
    if (data) setDestinations(data);
    setIsLoading(false);
  };

  const saveDestination = async () => {
    const destData = {
      name: editingDest.name,
      location: editingDest.location || null,
      description: editingDest.description || null,
      image_url: editingDest.image_url || null,
      highlights: editingDest.highlights || [],
      best_time: editingDest.best_time || null,
      is_featured: editingDest.is_featured,
    };

    let error;
    if (editingDest.id) {
      ({ error } = await supabase.from('destinations').update(destData).eq('id', editingDest.id));
    } else {
      ({ error } = await supabase.from('destinations').insert(destData));
    }

    if (error) {
      toast({ title: 'Error', description: 'Failed to save destination', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Destination ${editingDest.id ? 'updated' : 'created'}` });
      setIsEditing(false);
      setEditingDest(emptyDestination);
      fetchDestinations();
    }
  };

  const deleteDestination = async (id: string) => {
    if (!confirm('Delete this destination?')) return;
    const { error } = await supabase.from('destinations').delete().eq('id', id);
    if (!error) { toast({ title: 'Deleted' }); fetchDestinations(); }
  };

  const addHighlight = () => {
    if (highlightInput.trim()) {
      setEditingDest({ ...editingDest, highlights: [...(editingDest.highlights || []), highlightInput.trim()] });
      setHighlightInput('');
    }
  };

  if (isLoading) return <div className="flex justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">{destinations.length} destinations</p>
        <Button onClick={() => { setEditingDest(emptyDestination); setIsEditing(true); }}><Plus className="w-4 h-4 mr-2" /> Add Destination</Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((dest) => (
          <div key={dest.id} className="bg-card rounded-2xl overflow-hidden shadow-card">
            <div className="aspect-video bg-muted flex items-center justify-center">
              {dest.image_url ? <img src={dest.image_url} alt={dest.name} className="w-full h-full object-cover" /> : <span className="text-muted-foreground">No image</span>}
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between">
                <h3 className="font-semibold">{dest.name}</h3>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditingDest(dest); setIsEditing(true); }}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteDestination(dest.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{dest.location}</p>
              {dest.is_featured && <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs">Featured</span>}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingDest.id ? 'Edit' : 'Add'} Destination</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium">Name *</label><Input value={editingDest.name} onChange={(e) => setEditingDest({ ...editingDest, name: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Location</label><Input value={editingDest.location || ''} onChange={(e) => setEditingDest({ ...editingDest, location: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Description</label><Textarea value={editingDest.description || ''} onChange={(e) => setEditingDest({ ...editingDest, description: e.target.value })} rows={3} /></div>
            <div><label className="text-sm font-medium">Best Time to Visit</label><Input value={editingDest.best_time || ''} onChange={(e) => setEditingDest({ ...editingDest, best_time: e.target.value })} placeholder="e.g., April - October" /></div>
            <div><label className="text-sm font-medium">Image</label><ImageUpload value={editingDest.image_url || null} onChange={(url) => setEditingDest({ ...editingDest, image_url: url || '' })} folder="destinations" /></div>
            <div>
              <label className="text-sm font-medium">Highlights</label>
              <div className="flex gap-2 mb-2"><Input value={highlightInput} onChange={(e) => setHighlightInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())} /><Button type="button" onClick={addHighlight}>Add</Button></div>
              <div className="flex flex-wrap gap-2">{editingDest.highlights?.map((h, i) => <span key={i} className="flex items-center gap-1 px-2 py-1 rounded bg-muted text-sm">{h}<button onClick={() => setEditingDest({ ...editingDest, highlights: editingDest.highlights?.filter((_, idx) => idx !== i) })}><X className="w-3 h-3" /></button></span>)}</div>
            </div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={editingDest.is_featured} onChange={(e) => setEditingDest({ ...editingDest, is_featured: e.target.checked })} /> Featured</label>
            <div className="flex gap-2 pt-4"><Button onClick={saveDestination} disabled={!editingDest.name}>{editingDest.id ? 'Update' : 'Create'}</Button><Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
