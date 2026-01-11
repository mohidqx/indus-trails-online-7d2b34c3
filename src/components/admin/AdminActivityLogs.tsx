import { useState, useEffect } from 'react';
import { Loader2, Calendar, User, Clock, Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface ActivityLog {
  id: string;
  type: 'booking' | 'tour' | 'deal' | 'vehicle' | 'feedback';
  action: string;
  details: string;
  timestamp: string;
}

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);

    // Fetch recent activity from multiple tables
    const [bookingsRes, toursRes, feedbackRes] = await Promise.all([
      supabase.from('bookings').select('id, created_at, customer_name, status').order('created_at', { ascending: false }).limit(20),
      supabase.from('tours').select('id, created_at, updated_at, title').order('updated_at', { ascending: false }).limit(10),
      supabase.from('feedback').select('id, created_at, name, is_approved').order('created_at', { ascending: false }).limit(10),
    ]);

    const activities: ActivityLog[] = [];

    // Add booking activities
    bookingsRes.data?.forEach(b => {
      activities.push({
        id: `booking-${b.id}`,
        type: 'booking',
        action: b.status === 'cancelled' ? 'Booking Cancelled' : 'New Booking',
        details: `${b.customer_name} made a booking`,
        timestamp: b.created_at,
      });
    });

    // Add tour activities
    toursRes.data?.forEach(t => {
      const isNew = new Date(t.created_at).getTime() === new Date(t.updated_at).getTime();
      activities.push({
        id: `tour-${t.id}`,
        type: 'tour',
        action: isNew ? 'Tour Created' : 'Tour Updated',
        details: t.title,
        timestamp: t.updated_at,
      });
    });

    // Add feedback activities
    feedbackRes.data?.forEach(f => {
      activities.push({
        id: `feedback-${f.id}`,
        type: 'feedback',
        action: f.is_approved ? 'Feedback Approved' : 'New Feedback',
        details: `From ${f.name}`,
        timestamp: f.created_at,
      });
    });

    // Sort by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setLogs(activities.slice(0, 50));
    setIsLoading(false);
  };

  const getTypeBadgeColor = (type: ActivityLog['type']) => {
    switch (type) {
      case 'booking': return 'bg-emerald-500/10 text-emerald-600';
      case 'tour': return 'bg-primary/10 text-primary';
      case 'deal': return 'bg-accent/10 text-accent';
      case 'vehicle': return 'bg-blue-500/10 text-blue-600';
      case 'feedback': return 'bg-purple-500/10 text-purple-600';
      default: return 'bg-muted text-muted-foreground';
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Activity className="w-5 h-5" />
          <span>{logs.length} recent activities</span>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Activity Timeline */}
      <div className="bg-card rounded-2xl shadow-card p-6">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log, index) => (
              <div
                key={log.id}
                className={`flex gap-4 pb-4 ${index !== logs.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Activity className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">{log.action}</span>
                    <Badge variant="outline" className={getTypeBadgeColor(log.type)}>
                      {log.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 truncate">{log.details}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
