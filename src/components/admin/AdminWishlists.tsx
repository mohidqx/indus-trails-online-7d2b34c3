import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Heart, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Wishlist {
  id: string;
  user_id: string;
  tour_id: string | null;
  destination_id: string | null;
  created_at: string;
  tours?: { title: string } | null;
  destinations?: { name: string } | null;
}

export default function AdminWishlists() {
  const [items, setItems] = useState<Wishlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchItems();
    const channel = supabase.channel('wishlists-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishlists' }, () => fetchItems())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('wishlists').select('*, tours(title), destinations(name)').order('created_at', { ascending: false }).limit(200);
    if (data) setItems(data as Wishlist[]);
    setIsLoading(false);
  };

  // Aggregate
  const tourCounts: Record<string, { name: string; count: number }> = {};
  items.forEach(i => {
    if (i.tours?.title) {
      const key = i.tour_id!;
      if (!tourCounts[key]) tourCounts[key] = { name: i.tours.title, count: 0 };
      tourCounts[key].count++;
    }
  });
  const topTours = Object.values(tourCounts).sort((a, b) => b.count - a.count).slice(0, 10);
  const uniqueUsers = new Set(items.map(i => i.user_id)).size;

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Heart className="w-5 h-5 text-red-400" /> User Wishlists ({items.length})</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="animate-pulse h-7"><span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5" /> Live</Badge>
          <Button size="sm" variant="outline" onClick={fetchItems}><RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-card"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{items.length}</p><p className="text-xs text-muted-foreground">Total Wishlist Items</p></CardContent></Card>
        <Card className="border-0 shadow-card"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-primary">{uniqueUsers}</p><p className="text-xs text-muted-foreground">Unique Users</p></CardContent></Card>
        <Card className="border-0 shadow-card"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-400">{topTours[0]?.count || 0}</p><p className="text-xs text-muted-foreground">Most Wishlisted</p></CardContent></Card>
      </div>

      {topTours.length > 0 && (
        <Card className="border-0 shadow-card">
          <CardContent className="p-4">
            <h3 className="font-bold text-sm text-foreground mb-3">🔥 Most Wishlisted Tours</h3>
            <div className="space-y-2">
              {topTours.map((t, i) => (
                <div key={i} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground'}`}>{i + 1}</span>
                    <span className="text-sm text-foreground">{t.name}</span>
                  </div>
                  <Badge className="bg-red-500/10 text-red-400 border-0 text-xs">❤️ {t.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-card">
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-border/30"><th className="text-left p-3 text-muted-foreground">User</th><th className="text-left p-3 text-muted-foreground">Item</th><th className="text-left p-3 text-muted-foreground">Type</th><th className="text-left p-3 text-muted-foreground">Date</th></tr></thead>
            <tbody>
              {items.slice(0, 50).map(item => (
                <tr key={item.id} className="border-b border-border/10 hover:bg-muted/10">
                  <td className="p-3 font-mono text-muted-foreground">{item.user_id.slice(0, 12)}...</td>
                  <td className="p-3 text-foreground">{item.tours?.title || item.destinations?.name || '—'}</td>
                  <td className="p-3"><Badge variant="outline" className="text-[10px]">{item.tour_id ? 'Tour' : 'Destination'}</Badge></td>
                  <td className="p-3 text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
