import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Star, Edit, Trash2, Eye, EyeOff, Award } from 'lucide-react';

interface Feedback {
  id: string;
  name: string;
  email: string;
  message: string;
  rating: number;
  tour_name: string | null;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
}

export default function AdminTestimonials() {
  const { toast } = useToast();
  const [items, setItems] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editItem, setEditItem] = useState<Feedback | null>(null);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    if (data) setItems(data as Feedback[]);
    setIsLoading(false);
  };

  const toggleField = async (id: string, field: 'is_approved' | 'is_featured', value: boolean) => {
    await supabase.from('feedback').update({ [field]: value }).eq('id', id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
    toast({ title: 'Updated', description: `Review ${field === 'is_approved' ? (value ? 'approved' : 'hidden') : (value ? 'featured' : 'unfeatured')}` });
  };

  const updateItem = async () => {
    if (!editItem) return;
    const { error } = await supabase.from('feedback').update({
      name: editItem.name,
      message: editItem.message,
      rating: editItem.rating,
      tour_name: editItem.tour_name,
      is_approved: editItem.is_approved,
      is_featured: editItem.is_featured,
    }).eq('id', editItem.id);
    if (!error) {
      setItems(prev => prev.map(i => i.id === editItem.id ? editItem : i));
      setEditItem(null);
      toast({ title: 'Updated' });
    }
  };

  const deleteItem = async (id: string) => {
    await supabase.from('feedback').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
    toast({ title: 'Deleted' });
  };

  const featured = items.filter(i => i.is_featured && i.is_approved);
  const pending = items.filter(i => !i.is_approved);

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Star className="w-5 h-5 text-accent" /> Testimonials & Reviews ({items.length})</h2>

      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-card"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{items.length}</p><p className="text-xs text-muted-foreground">Total Reviews</p></CardContent></Card>
        <Card className="border-0 shadow-card"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-accent">{featured.length}</p><p className="text-xs text-muted-foreground">Featured</p></CardContent></Card>
        <Card className="border-0 shadow-card"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-amber-400">{pending.length}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
      </div>

      <Card className="border-0 shadow-card">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {items.map(item => (
              <div key={item.id} className="flex items-start gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {item.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                    <div className="flex gap-0.5">{Array.from({ length: item.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-accent text-accent" />)}</div>
                    {item.tour_name && <Badge variant="outline" className="text-[10px]">{item.tour_name}</Badge>}
                    {!item.is_approved && <Badge className="text-[10px] bg-amber-500/10 text-amber-400 border-0">Pending</Badge>}
                    {item.is_featured && <Badge className="text-[10px] bg-accent/10 text-accent border-0">⭐ Featured</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{item.email} · {new Date(item.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => toggleField(item.id, 'is_approved', !item.is_approved)} title={item.is_approved ? 'Hide' : 'Approve'}>
                    {item.is_approved ? <Eye className="w-4 h-4 text-emerald-500" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => toggleField(item.id, 'is_featured', !item.is_featured)} title={item.is_featured ? 'Unfeature' : 'Feature'}>
                    <Award className={`w-4 h-4 ${item.is_featured ? 'text-accent' : 'text-muted-foreground'}`} />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditItem(item)}><Edit className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteItem(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
            {items.length === 0 && <div className="text-center py-12 text-muted-foreground">No reviews yet</div>}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Review</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div><label className="text-sm font-medium">Name</label><Input value={editItem.name} onChange={e => setEditItem({ ...editItem, name: e.target.value })} /></div>
              <div><label className="text-sm font-medium">Tour Name</label><Input value={editItem.tour_name || ''} onChange={e => setEditItem({ ...editItem, tour_name: e.target.value || null })} /></div>
              <div><label className="text-sm font-medium">Rating</label><Input type="number" min="1" max="5" value={editItem.rating} onChange={e => setEditItem({ ...editItem, rating: Number(e.target.value) })} /></div>
              <div><label className="text-sm font-medium">Message</label><Textarea value={editItem.message} onChange={e => setEditItem({ ...editItem, message: e.target.value })} rows={4} /></div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2"><Switch checked={editItem.is_approved} onCheckedChange={v => setEditItem({ ...editItem, is_approved: v })} /><span className="text-sm">Approved</span></label>
                <label className="flex items-center gap-2"><Switch checked={editItem.is_featured} onCheckedChange={v => setEditItem({ ...editItem, is_featured: v })} /><span className="text-sm">Featured</span></label>
              </div>
              <div className="flex gap-2"><Button onClick={updateItem} className="flex-1">Save</Button><Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
