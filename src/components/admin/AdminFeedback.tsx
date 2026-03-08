import { useState, useEffect } from 'react';
import { Check, X, Loader2, Star, Trash2, Search, MessageSquare, RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Feedback {
  id: string;
  name: string;
  email: string;
  rating: number;
  message: string;
  tour_name: string | null;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
}

export default function AdminFeedback() {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'featured'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchFeedback();
    const channel = supabase.channel('feedback-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback' }, () => fetchFeedback())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchFeedback = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    if (!error && data) setFeedback(data);
    setIsLoading(false);
  };

  const updateFeedback = async (id: string, updates: Partial<Feedback>) => {
    const { error } = await supabase.from('feedback').update(updates).eq('id', id);
    if (error) toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' });
    else toast({ title: 'Success', description: 'Feedback updated' });
  };

  const deleteFeedback = async (id: string) => {
    const { error } = await supabase.from('feedback').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    else { toast({ title: 'Deleted' }); fetchFeedback(); }
  };

  const filteredFeedback = feedback.filter(fb => {
    const matchesFilter = filter === 'all' || 
      (filter === 'pending' && !fb.is_approved) || 
      (filter === 'approved' && fb.is_approved) ||
      (filter === 'featured' && fb.is_featured);
    const matchesSearch = search === '' || 
      fb.name.toLowerCase().includes(search.toLowerCase()) || 
      fb.message.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const avgRating = feedback.length > 0 ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1) : '0';
  const pendingCount = feedback.filter(f => !f.is_approved).length;

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: feedback.length, color: 'from-primary/5 to-primary/10' },
          { label: 'Pending', value: pendingCount, color: 'from-accent/5 to-accent/10' },
          { label: 'Approved', value: feedback.filter(f => f.is_approved).length, color: 'from-emerald-500/5 to-emerald-500/10' },
          { label: 'Avg Rating', value: `${avgRating} ★`, color: 'from-sunset/5 to-sunset/10' },
        ].map((stat, i) => (
          <Card key={i} className={`border-0 shadow-card bg-gradient-to-br ${stat.color}`}>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search feedback..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'pending', 'approved', 'featured'] as const).map((f) => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)} className="capitalize text-xs h-8">
              {f} {f === 'pending' && pendingCount > 0 && `(${pendingCount})`}
            </Button>
          ))}
        </div>
      </div>

      {/* Feedback Grid */}
      <div className="grid md:grid-cols-2 gap-3">
        {filteredFeedback.length === 0 ? (
          <div className="col-span-full">
            <Card className="border-0 shadow-card">
              <CardContent className="p-12 text-center text-muted-foreground">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No feedback found</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredFeedback.map((fb) => (
            <Card key={fb.id} className={`border-0 shadow-card hover:shadow-lg transition-shadow ${!fb.is_approved ? 'ring-1 ring-accent/30' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-foreground">{fb.name}</h3>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < fb.rating ? 'fill-accent text-accent' : 'text-muted-foreground/20'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{fb.email}</p>
                  </div>
                  <div className="flex gap-1">
                    {fb.is_featured && <Badge className="text-[10px] h-5 bg-primary/10 text-primary border-0">Featured</Badge>}
                    {!fb.is_approved && <Badge variant="outline" className="text-[10px] h-5 border-accent/30 text-accent">Pending</Badge>}
                  </div>
                </div>

                {fb.tour_name && (
                  <p className="text-xs text-primary mb-1.5">🗺️ {fb.tour_name}</p>
                )}

                <p className="text-sm text-foreground/80 line-clamp-3 mb-3">{fb.message}</p>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(fb.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-1.5">
                    {!fb.is_approved ? (
                      <>
                        <Button size="sm" className="h-7 text-xs gap-1" onClick={() => updateFeedback(fb.id, { is_approved: true })}>
                          <Check className="w-3 h-3" /> Approve
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" className="h-7 text-xs gap-1">
                              <X className="w-3 h-3" /> Reject
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this feedback?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteFeedback(fb.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant={fb.is_featured ? 'default' : 'outline'} className="h-7 text-xs"
                          onClick={() => updateFeedback(fb.id, { is_featured: !fb.is_featured })}>
                          {fb.is_featured ? '★ Unfeature' : '☆ Feature'}
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs"
                          onClick={() => updateFeedback(fb.id, { is_approved: false })}>
                          Unapprove
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-7 w-7">
                              <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this feedback?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteFeedback(fb.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}