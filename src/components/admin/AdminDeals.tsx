import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
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

interface Deal {
  id: string;
  title: string;
  description: string | null;
  discount_percent: number | null;
  code: string | null;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  is_popup: boolean;
  image_url: string | null;
}

const emptyDeal = {
  title: '',
  description: '',
  discount_percent: 10,
  code: '',
  valid_from: '',
  valid_until: '',
  is_active: true,
  is_popup: false,
  image_url: '',
};

export default function AdminDeals() {
  const { toast } = useToast();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDeal, setEditingDeal] = useState<typeof emptyDeal & { id?: string }>(emptyDeal);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDeals(data);
    }
    setIsLoading(false);
  };

  const saveDeal = async () => {
    const dealData = {
      title: editingDeal.title,
      description: editingDeal.description || null,
      discount_percent: editingDeal.discount_percent || null,
      code: editingDeal.code || null,
      valid_from: editingDeal.valid_from || null,
      valid_until: editingDeal.valid_until || null,
      is_active: editingDeal.is_active,
      is_popup: editingDeal.is_popup,
      image_url: editingDeal.image_url || null,
    };

    let error;
    if (editingDeal.id) {
      ({ error } = await supabase.from('deals').update(dealData).eq('id', editingDeal.id));
    } else {
      ({ error } = await supabase.from('deals').insert(dealData));
    }

    if (error) {
      toast({ title: 'Error', description: 'Failed to save deal', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Deal ${editingDeal.id ? 'updated' : 'created'}` });
      setIsEditing(false);
      setEditingDeal(emptyDeal);
      fetchDeals();
    }
  };

  const deleteDeal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;

    const { error } = await supabase.from('deals').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete deal', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Deal deleted' });
      fetchDeals();
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
        <p className="text-muted-foreground">{deals.length} deals</p>
        <Button onClick={() => { setEditingDeal(emptyDeal); setIsEditing(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Deal
        </Button>
      </div>

      {/* Deals Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deals.map((deal) => (
          <div key={deal.id} className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-start justify-between gap-2 mb-4">
              <div>
                <h3 className="font-semibold text-foreground">{deal.title}</h3>
                {deal.code && <p className="text-sm text-primary font-mono">Code: {deal.code}</p>}
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => { setEditingDeal(deal); setIsEditing(true); }}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => deleteDeal(deal.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{deal.description}</p>
            <div className="flex flex-wrap gap-2">
              {deal.discount_percent && (
                <span className="px-2 py-1 rounded bg-destructive/10 text-destructive text-sm font-semibold">
                  {deal.discount_percent}% OFF
                </span>
              )}
              <span className={`px-2 py-1 rounded text-sm ${deal.is_active ? 'bg-emerald/10 text-emerald' : 'bg-muted text-muted-foreground'}`}>
                {deal.is_active ? 'Active' : 'Inactive'}
              </span>
              {deal.is_popup && (
                <span className="px-2 py-1 rounded bg-accent/10 text-accent text-sm">Popup</span>
              )}
            </div>
            {deal.valid_until && (
              <p className="text-xs text-muted-foreground mt-3">
                Valid until: {new Date(deal.valid_until).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingDeal.id ? 'Edit Deal' : 'Add New Deal'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={editingDeal.title}
                onChange={(e) => setEditingDeal({ ...editingDeal, title: e.target.value })}
                placeholder="Deal title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editingDeal.description || ''}
                onChange={(e) => setEditingDeal({ ...editingDeal, description: e.target.value })}
                placeholder="Deal description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Discount %</label>
                <Input
                  type="number"
                  value={editingDeal.discount_percent || ''}
                  onChange={(e) => setEditingDeal({ ...editingDeal, discount_percent: Number(e.target.value) })}
                  placeholder="e.g., 25"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Promo Code</label>
                <Input
                  value={editingDeal.code || ''}
                  onChange={(e) => setEditingDeal({ ...editingDeal, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., SUMMER25"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Valid From</label>
                <Input
                  type="date"
                  value={editingDeal.valid_from || ''}
                  onChange={(e) => setEditingDeal({ ...editingDeal, valid_from: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Valid Until</label>
                <Input
                  type="date"
                  value={editingDeal.valid_until || ''}
                  onChange={(e) => setEditingDeal({ ...editingDeal, valid_until: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Image URL</label>
              <Input
                value={editingDeal.image_url || ''}
                onChange={(e) => setEditingDeal({ ...editingDeal, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingDeal.is_active}
                  onChange={(e) => setEditingDeal({ ...editingDeal, is_active: e.target.checked })}
                />
                Active
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingDeal.is_popup}
                  onChange={(e) => setEditingDeal({ ...editingDeal, is_popup: e.target.checked })}
                />
                Show as Popup
              </label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={saveDeal} disabled={!editingDeal.title}>
                {editingDeal.id ? 'Update' : 'Create'} Deal
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
