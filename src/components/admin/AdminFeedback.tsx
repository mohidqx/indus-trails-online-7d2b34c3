import { useState, useEffect } from 'react';
import { Check, X, Loader2, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    fetchFeedback();
    const channel = supabase
      .channel('feedback-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback' }, () => {
        fetchFeedback();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchFeedback = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setFeedback(data);
    }
    setIsLoading(false);
  };

  const updateFeedback = async (id: string, updates: Partial<Feedback>) => {
    const { error } = await supabase
      .from('feedback')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update feedback', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Feedback updated' });
    }
  };

  const deleteFeedback = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;

    const { error } = await supabase.from('feedback').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete feedback', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Feedback deleted' });
      fetchFeedback();
    }
  };

  const filteredFeedback = feedback.filter(fb => {
    if (filter === 'pending') return !fb.is_approved;
    if (filter === 'approved') return fb.is_approved;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'pending', 'approved'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f} {f === 'pending' && `(${feedback.filter(fb => !fb.is_approved).length})`}
          </Button>
        ))}
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 text-center text-muted-foreground">
            No feedback found
          </div>
        ) : (
          filteredFeedback.map((fb) => (
            <div key={fb.id} className="bg-card rounded-2xl p-6 shadow-card">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-foreground">{fb.name}</h3>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < fb.rating ? 'fill-accent text-accent' : 'text-muted-foreground'}`}
                        />
                      ))}
                    </div>
                    {fb.is_featured && (
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">Featured</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{fb.email}</p>
                  {fb.tour_name && (
                    <p className="text-sm text-primary mb-2">Tour: {fb.tour_name}</p>
                  )}
                  <p className="text-foreground">{fb.message}</p>
                  <p className="text-xs text-muted-foreground mt-3">
                    {new Date(fb.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!fb.is_approved ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateFeedback(fb.id, { is_approved: true })}
                      >
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteFeedback(fb.id)}
                      >
                        <X className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant={fb.is_featured ? 'default' : 'outline'}
                        onClick={() => updateFeedback(fb.id, { is_featured: !fb.is_featured })}
                      >
                        {fb.is_featured ? 'Unfeature' : 'Feature'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateFeedback(fb.id, { is_approved: false })}
                      >
                        Unapprove
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteFeedback(fb.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
