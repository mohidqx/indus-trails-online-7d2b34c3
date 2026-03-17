import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Plus, Calendar, Edit, Trash2, RefreshCw } from 'lucide-react';

interface Availability {
  id: string;
  tour_id: string;
  available_date: string;
  slots_total: number;
  slots_booked: number;
  price_override: number | null;
  is_available: boolean;
  created_at: string;
}

interface Tour { id: string; title: string; }

export default function AdminAvailability() {
  const { toast } = useToast();
  const [items, setItems] = useState<Availability[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTour, setSelectedTour] = useState('all');
  const [form, setForm] = useState({
    tour_id: '',
    available_date: '',
    slots_total: 10,
    slots_booked: 0,
    price_override: null as number | null,
    is_available: true,
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    const [avRes, tourRes] = await Promise.all([
      supabase.from('tour_availability').select('*').order('available_date', { ascending: true }),
      supabase.from('tours').select('id, title').eq('is_active', true).order('title'),
    ]);
    if (avRes.data) setItems(avRes.data as Availability[]);
    if (tourRes.data) setTours(tourRes.data);
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!form.tour_id || !form.available_date) { toast({ title: 'Error', description: 'Tour and date required', variant: 'destructive' }); return; }
    const payload = { ...form, price_override: form.price_override || null };

    if (editingId) {
      const { error } = await supabase.from('tour_availability').update(payload).eq('id', editingId);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Updated' });
    } else {
      const { error } = await supabase.from('tour_availability').insert(payload);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Created' });
    }
    setShowForm(false);
    setEditingId(null);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('tour_availability').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
    toast({ title: 'Deleted' });
  };

  const toggleAvailable = async (id: string, v: boolean) => {
    await supabase.from('tour_availability').update({ is_available: v }).eq('id', id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, is_available: v } : i));
  };

  const filtered = selectedTour === 'all' ? items : items.filter(i => i.tour_id === selectedTour);
  const today = new Date().toISOString().split('T')[0];

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> Tour Availability ({items.length})</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={fetchAll}><RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh</Button>
          <Button size="sm" onClick={() => { setForm({ tour_id: '', available_date: '', slots_total: 10, slots_booked: 0, price_override: null, is_available: true }); setEditingId(null); setShowForm(true); }}><Plus className="w-4 h-4 mr-1" /> Add Date</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={selectedTour === 'all' ? 'default' : 'outline'} onClick={() => setSelectedTour('all')}>All Tours</Button>
        {tours.map(t => (
          <Button key={t.id} size="sm" variant={selectedTour === t.id ? 'default' : 'outline'} onClick={() => setSelectedTour(t.id)} className="text-xs">{t.title.slice(0, 25)}</Button>
        ))}
      </div>

      <Card className="border-0 shadow-card">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No availability dates set</p></div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map(item => {
                const tourName = tours.find(t => t.id === item.tour_id)?.title || 'Unknown';
                const isPast = item.available_date < today;
                const slotsLeft = item.slots_total - item.slots_booked;
                return (
                  <div key={item.id} className={`flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors ${isPast ? 'opacity-50' : ''}`}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.is_available ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                      <Calendar className={`w-4 h-4 ${item.is_available ? 'text-emerald-400' : 'text-red-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{new Date(item.available_date + 'T00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <Badge variant="outline" className="text-[10px]">{tourName.slice(0, 20)}</Badge>
                        {isPast && <Badge className="text-[10px] bg-muted text-muted-foreground border-0">Past</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span>🎫 {slotsLeft}/{item.slots_total} slots</span>
                        <span>📊 {item.slots_booked} booked</span>
                        {item.price_override && <span>💰 PKR {item.price_override.toLocaleString()}</span>}
                      </div>
                    </div>
                    <Switch checked={item.is_available} onCheckedChange={v => toggleAvailable(item.id, v)} />
                    <Button size="icon" variant="ghost" onClick={() => { setForm({ tour_id: item.tour_id, available_date: item.available_date, slots_total: item.slots_total, slots_booked: item.slots_booked, price_override: item.price_override, is_available: item.is_available }); setEditingId(item.id); setShowForm(true); }}><Edit className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingId ? 'Edit' : 'Add'} Availability</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tour *</label>
              <select value={form.tour_id} onChange={e => setForm({ ...form, tour_id: e.target.value })} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                <option value="">Select tour...</option>
                {tours.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Date *</label>
              <Input type="date" value={form.available_date} onChange={e => setForm({ ...form, available_date: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Total Slots</label><Input type="number" min="1" value={form.slots_total} onChange={e => setForm({ ...form, slots_total: Number(e.target.value) })} /></div>
              <div><label className="text-sm font-medium">Already Booked</label><Input type="number" min="0" value={form.slots_booked} onChange={e => setForm({ ...form, slots_booked: Number(e.target.value) })} /></div>
            </div>
            <div>
              <label className="text-sm font-medium">Price Override (PKR)</label>
              <Input type="number" value={form.price_override || ''} onChange={e => setForm({ ...form, price_override: Number(e.target.value) || null })} placeholder="Leave empty for default price" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_available} onCheckedChange={v => setForm({ ...form, is_available: v })} />
              <span className="text-sm">Available for booking</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">{editingId ? 'Update' : 'Create'}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
