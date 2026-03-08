import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, Trash2, Download, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean | null;
  source: string | null;
  created_at: string;
}

export default function AdminNewsletter() {
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchSubs(); }, []);

  const fetchSubs = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
    if (data) setSubs(data);
    setIsLoading(false);
  };

  const deleteSub = async (id: string) => {
    await supabase.from('newsletter_subscribers').delete().eq('id', id);
    toast({ title: "Subscriber removed" });
    fetchSubs();
  };

  const exportCSV = () => {
    const csv = ['Email,Name,Source,Date\n', ...subs.map(s => `${s.email},${s.name || ''},${s.source || ''},${s.created_at}\n`)].join('');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter-subscribers.csv';
    a.click();
  };

  const active = subs.filter(s => s.is_active);

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" /> Newsletter ({active.length} active)
        </h2>
        <button onClick={exportCSV} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 shadow-card">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{active.length}</p>
            <p className="text-xs text-muted-foreground">Active Subscribers</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card">
          <CardContent className="p-4 text-center">
            <Mail className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{subs.length}</p>
            <p className="text-xs text-muted-foreground">Total Signups</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left p-3 text-muted-foreground font-medium">Email</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Source</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Date</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {subs.map(s => (
                  <tr key={s.id} className="border-b border-border/10 hover:bg-muted/10">
                    <td className="p-3 text-foreground">{s.email}</td>
                    <td className="p-3 text-muted-foreground">{s.source || '—'}</td>
                    <td className="p-3 text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</td>
                    <td className="p-3">
                      <Badge className={`text-[10px] ${s.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'} border-0`}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <button onClick={() => deleteSub(s.id)} className="p-1 hover:bg-muted rounded"><Trash2 className="w-3 h-3 text-red-400" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
