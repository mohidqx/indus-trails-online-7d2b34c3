import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Plus, Edit, Trash2, Tag, Calendar, Users, Clock, Zap } from 'lucide-react';

interface PricingRule {
  id: string;
  tour_id: string | null;
  rule_type: string;
  name: string;
  discount_percent: number;
  surcharge_percent: number;
  min_group_size: number | null;
  max_group_size: number | null;
  start_date: string | null;
  end_date: string | null;
  days_before_travel: number | null;
  is_active: boolean;
  created_at: string;
}

interface Tour { id: string; title: string; }

const ruleTypes = [
  { value: 'seasonal', label: 'Seasonal', icon: Calendar, color: 'text-blue-400' },
  { value: 'early_bird', label: 'Early Bird', icon: Clock, color: 'text-emerald-400' },
  { value: 'group_size', label: 'Group Size', icon: Users, color: 'text-purple-400' },
  { value: 'last_minute', label: 'Last Minute', icon: Zap, color: 'text-amber-400' },
];

const emptyRule = {
  tour_id: null as string | null,
  rule_type: 'seasonal',
  name: '',
  discount_percent: 0,
  surcharge_percent: 0,
  min_group_size: null as number | null,
  max_group_size: null as number | null,
  start_date: null as string | null,
  end_date: null as string | null,
  days_before_travel: null as number | null,
  is_active: true,
};

export default function AdminPricingRules() {
  const { toast } = useToast();
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyRule);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    Promise.all([
      supabase.from('pricing_rules').select('*').order('created_at', { ascending: false }),
      supabase.from('tours').select('id, title').eq('is_active', true).order('title'),
    ]).then(([rulesRes, toursRes]) => {
      if (rulesRes.data) setRules(rulesRes.data as PricingRule[]);
      if (toursRes.data) setTours(toursRes.data);
      setIsLoading(false);
    });
  }, []);

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: 'Error', description: 'Name is required', variant: 'destructive' }); return; }

    const payload = {
      ...form,
      discount_percent: form.discount_percent || 0,
      surcharge_percent: form.surcharge_percent || 0,
    };

    if (editingId) {
      const { error } = await supabase.from('pricing_rules').update(payload).eq('id', editingId);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      setRules(prev => prev.map(r => r.id === editingId ? { ...r, ...payload } : r));
      toast({ title: 'Updated', description: 'Pricing rule updated' });
    } else {
      const { data, error } = await supabase.from('pricing_rules').insert(payload).select().single();
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
      setRules(prev => [data as PricingRule, ...prev]);
      toast({ title: 'Created', description: 'Pricing rule created' });
    }
    setShowForm(false);
    setEditingId(null);
    setForm(emptyRule);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('pricing_rules').delete().eq('id', id);
    if (!error) {
      setRules(prev => prev.filter(r => r.id !== id));
      toast({ title: 'Deleted', description: 'Pricing rule deleted' });
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('pricing_rules').update({ is_active: active }).eq('id', id);
    setRules(prev => prev.map(r => r.id === id ? { ...r, is_active: active } : r));
  };

  const openEdit = (rule: PricingRule) => {
    setForm({
      tour_id: rule.tour_id,
      rule_type: rule.rule_type,
      name: rule.name,
      discount_percent: rule.discount_percent,
      surcharge_percent: rule.surcharge_percent,
      min_group_size: rule.min_group_size,
      max_group_size: rule.max_group_size,
      start_date: rule.start_date,
      end_date: rule.end_date,
      days_before_travel: rule.days_before_travel,
      is_active: rule.is_active,
    });
    setEditingId(rule.id);
    setShowForm(true);
  };

  const filtered = filterType === 'all' ? rules : rules.filter(r => r.rule_type === filterType);
  const getRuleIcon = (type: string) => ruleTypes.find(r => r.value === type);

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Tag className="w-5 h-5 text-primary" /> Dynamic Pricing Rules ({rules.length})</h2>
        <Button size="sm" onClick={() => { setForm(emptyRule); setEditingId(null); setShowForm(true); }} className="gap-1"><Plus className="w-4 h-4" /> Add Rule</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ruleTypes.map(rt => {
          const count = rules.filter(r => r.rule_type === rt.value).length;
          const active = rules.filter(r => r.rule_type === rt.value && r.is_active).length;
          return (
            <Card key={rt.value} className="border-0 shadow-card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilterType(filterType === rt.value ? 'all' : rt.value)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <rt.icon className={`w-5 h-5 ${rt.color}`} />
                  <Badge variant="outline" className={`text-[10px] ${filterType === rt.value ? 'bg-primary/10 text-primary' : ''}`}>{rt.label}</Badge>
                </div>
                <p className="text-2xl font-bold text-foreground">{count}</p>
                <p className="text-[10px] text-muted-foreground">{active} active</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Rules List */}
      <Card className="border-0 shadow-card">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No pricing rules found</p>
              <p className="text-xs mt-1">Create dynamic pricing rules to auto-adjust tour prices</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map(rule => {
                const rt = getRuleIcon(rule.rule_type);
                const tourName = rule.tour_id ? tours.find(t => t.id === rule.tour_id)?.title : 'All Tours';
                return (
                  <div key={rule.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${rule.is_active ? 'bg-primary/10' : 'bg-muted/50'}`}>
                      {rt && <rt.icon className={`w-4 h-4 ${rule.is_active ? rt.color : 'text-muted-foreground'}`} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${rule.is_active ? 'text-foreground' : 'text-muted-foreground'}`}>{rule.name}</span>
                        <Badge variant="outline" className="text-[10px]">{rt?.label}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span>📦 {tourName}</span>
                        {rule.discount_percent > 0 && <span className="text-emerald-500">-{rule.discount_percent}%</span>}
                        {rule.surcharge_percent > 0 && <span className="text-red-400">+{rule.surcharge_percent}%</span>}
                        {rule.min_group_size && <span>👥 {rule.min_group_size}{rule.max_group_size ? `-${rule.max_group_size}` : '+'} pax</span>}
                        {rule.days_before_travel && <span>⏱️ {rule.days_before_travel} days</span>}
                        {rule.start_date && <span>📅 {rule.start_date} → {rule.end_date}</span>}
                      </div>
                    </div>
                    <Switch checked={rule.is_active} onCheckedChange={(v) => toggleActive(rule.id, v)} />
                    <Button size="icon" variant="ghost" onClick={() => openEdit(rule)}><Edit className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(rule.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit' : 'Create'} Pricing Rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Rule Name *</label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Summer Peak Season" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Rule Type</label>
                <select value={form.rule_type} onChange={e => setForm({ ...form, rule_type: e.target.value })} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  {ruleTypes.map(rt => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Tour (optional)</label>
                <select value={form.tour_id || ''} onChange={e => setForm({ ...form, tour_id: e.target.value || null })} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="">All Tours</option>
                  {tours.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Discount %</label>
                <Input type="number" min="0" max="100" value={form.discount_percent} onChange={e => setForm({ ...form, discount_percent: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm font-medium">Surcharge %</label>
                <Input type="number" min="0" max="100" value={form.surcharge_percent} onChange={e => setForm({ ...form, surcharge_percent: Number(e.target.value) })} />
              </div>
            </div>

            {(form.rule_type === 'seasonal') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input type="date" value={form.start_date || ''} onChange={e => setForm({ ...form, start_date: e.target.value || null })} />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input type="date" value={form.end_date || ''} onChange={e => setForm({ ...form, end_date: e.target.value || null })} />
                </div>
              </div>
            )}

            {(form.rule_type === 'group_size') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Min Group Size</label>
                  <Input type="number" min="1" value={form.min_group_size || ''} onChange={e => setForm({ ...form, min_group_size: Number(e.target.value) || null })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Group Size</label>
                  <Input type="number" min="1" value={form.max_group_size || ''} onChange={e => setForm({ ...form, max_group_size: Number(e.target.value) || null })} />
                </div>
              </div>
            )}

            {(form.rule_type === 'early_bird' || form.rule_type === 'last_minute') && (
              <div>
                <label className="text-sm font-medium">Days Before Travel</label>
                <Input type="number" min="0" value={form.days_before_travel || ''} onChange={e => setForm({ ...form, days_before_travel: Number(e.target.value) || null })} placeholder={form.rule_type === 'early_bird' ? 'e.g. 30 (book 30+ days early)' : 'e.g. 7 (within 7 days)'} />
              </div>
            )}

            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
              <span className="text-sm text-muted-foreground">Active</span>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} className="flex-1">{editingId ? 'Update' : 'Create'} Rule</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
