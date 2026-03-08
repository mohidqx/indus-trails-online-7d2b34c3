import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, Mail, RefreshCw, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AbandonedBooking {
  id: string;
  email: string | null;
  user_id: string | null;
  tour_id: string | null;
  form_data: any;
  recovery_sent: boolean | null;
  recovered: boolean | null;
  created_at: string;
}

export default function AdminAbandonedBookings() {
  const [items, setItems] = useState<AbandonedBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('abandoned_bookings').select('*').order('created_at', { ascending: false }).limit(100);
    if (data) setItems(data);
    setIsLoading(false);
  };

  const markRecoverySent = async (id: string) => {
    await supabase.from('abandoned_bookings').update({ recovery_sent: true }).eq('id', id);
    toast({ title: "Marked as recovery sent" });
    fetchItems();
  };

  const notRecovered = items.filter(i => !i.recovered);
  const recovered = items.filter(i => i.recovered);
  const recoveryRate = items.length > 0 ? Math.round((recovered.length / items.length) * 100) : 0;

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-400" /> Abandoned Bookings ({items.length})
      </h2>

      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-card"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{notRecovered.length}</p>
          <p className="text-xs text-muted-foreground">Abandoned</p>
        </CardContent></Card>
        <Card className="border-0 shadow-card"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{recovered.length}</p>
          <p className="text-xs text-muted-foreground">Recovered</p>
        </CardContent></Card>
        <Card className="border-0 shadow-card"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{recoveryRate}%</p>
          <p className="text-xs text-muted-foreground">Recovery Rate</p>
        </CardContent></Card>
      </div>

      <Card className="border-0 shadow-card">
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left p-3 text-muted-foreground">Email / User</th>
                <th className="text-left p-3 text-muted-foreground">Date</th>
                <th className="text-left p-3 text-muted-foreground">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-border/10 hover:bg-muted/10">
                  <td className="p-3 text-foreground">{item.email || item.user_id?.slice(0, 12) || '—'}</td>
                  <td className="p-3 text-muted-foreground">{new Date(item.created_at).toLocaleString()}</td>
                  <td className="p-3">
                    {item.recovered ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[10px]">Recovered</Badge>
                    ) : item.recovery_sent ? (
                      <Badge className="bg-blue-500/10 text-blue-400 border-0 text-[10px]">Email Sent</Badge>
                    ) : (
                      <Badge className="bg-amber-500/10 text-amber-400 border-0 text-[10px]">Pending</Badge>
                    )}
                  </td>
                  <td className="p-3">
                    {!item.recovery_sent && !item.recovered && (
                      <button onClick={() => markRecoverySent(item.id)} className="p-1 hover:bg-muted rounded" title="Mark recovery sent">
                        <Mail className="w-3 h-3 text-primary" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
