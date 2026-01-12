import { useState, useEffect } from 'react';
import { Loader2, Clock, Activity, RefreshCw, Globe, Monitor, User, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { activityLogsApi } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ActivityLog {
  id: string;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  useEffect(() => {
    fetchLogs();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('activity-logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, (payload) => {
        setLogs(prev => [payload.new as ActivityLog, ...prev].slice(0, 100));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    const { data, error } = await activityLogsApi.getAll();

    if (!error && data) {
      setLogs(data as ActivityLog[]);
    }
    setIsLoading(false);
  };

  const getActionColor = (action: string) => {
    if (action.includes('delete')) return 'bg-destructive/10 text-destructive';
    if (action.includes('create') || action.includes('insert')) return 'bg-emerald-500/10 text-emerald-600';
    if (action.includes('update') || action.includes('restore')) return 'bg-primary/10 text-primary';
    return 'bg-muted text-muted-foreground';
  };

  const getEntityColor = (type: string) => {
    switch (type) {
      case 'booking': return 'bg-emerald-500/10 text-emerald-600';
      case 'tour': return 'bg-primary/10 text-primary';
      case 'deal': return 'bg-accent/10 text-accent';
      case 'vehicle': return 'bg-blue-500/10 text-blue-600';
      case 'user': return 'bg-purple-500/10 text-purple-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const parseUserAgent = (ua: string | null) => {
    if (!ua) return 'Unknown';
    
    // Simple parsing
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Browser';
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
          <span>{logs.length} activity logs</span>
          <Badge variant="outline" className="ml-2 animate-pulse">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
            Live
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Activity Timeline */}
      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No activity recorded yet</p>
            <p className="text-sm mt-2">User actions will appear here in real-time</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => setSelectedLog(log)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Activity className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground capitalize">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <Badge variant="outline" className={getEntityColor(log.entity_type)}>
                        {log.entity_type}
                      </Badge>
                      <Badge variant="outline" className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {log.ip_address && (
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {log.ip_address}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Monitor className="w-3 h-3" />
                        {parseUserAgent(log.user_agent)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>

                    {log.entity_id && (
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        ID: {log.entity_id.slice(0, 8)}...
                      </p>
                    )}
                  </div>
                  <Button size="icon" variant="ghost">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Activity Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Action</p>
                  <p className="font-medium capitalize">{selectedLog.action.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entity Type</p>
                  <p className="font-medium capitalize">{selectedLog.entity_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">IP Address</p>
                  <p className="font-medium font-mono">{selectedLog.ip_address || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timestamp</p>
                  <p className="font-medium">{new Date(selectedLog.created_at).toLocaleString()}</p>
                </div>
              </div>

              {selectedLog.entity_id && (
                <div>
                  <p className="text-sm text-muted-foreground">Entity ID</p>
                  <p className="font-medium font-mono">{selectedLog.entity_id}</p>
                </div>
              )}

              {selectedLog.user_id && (
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-medium font-mono">{selectedLog.user_id}</p>
                </div>
              )}

              {selectedLog.user_agent && (
                <div>
                  <p className="text-sm text-muted-foreground">User Agent</p>
                  <p className="font-medium text-xs break-all">{selectedLog.user_agent}</p>
                </div>
              )}

              {selectedLog.details && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Details</p>
                  <pre className="bg-muted p-3 rounded-lg text-xs overflow-auto max-h-40">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}