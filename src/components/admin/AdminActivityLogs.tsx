import { useState, useEffect } from 'react';
import { Loader2, Clock, Activity, RefreshCw, Globe, Monitor, Eye, Search, Download, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { activityLogsApi } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchLogs();
    fetchProfiles();
    const channel = supabase
      .channel('activity-logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, (payload) => {
        setLogs(prev => [payload.new as ActivityLog, ...prev].slice(0, 200));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    const { data, error } = await activityLogsApi.getAll();
    if (!error && data) setLogs(data as ActivityLog[]);
    setIsLoading(false);
  };

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('id, full_name');
    if (data) {
      const map: Record<string, string> = {};
      data.forEach((p: any) => { map[p.id] = p.full_name || 'Unknown'; });
      setProfiles(map);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('delete')) return '🗑️';
    if (action.includes('create') || action.includes('insert') || action.includes('add')) return '✨';
    if (action.includes('update') || action.includes('restore')) return '✏️';
    if (action.includes('visit') || action.includes('page_visit')) return '👁️';
    if (action.includes('login') || action.includes('logout')) return '🔑';
    if (action.includes('export')) return '📥';
    if (action.includes('send')) return '📧';
    if (action.includes('ban') || action.includes('block')) return '🚫';
    return '📋';
  };

  const getActionColor = (action: string) => {
    if (action.includes('delete') || action.includes('ban')) return 'bg-destructive/10 text-destructive border-destructive/20';
    if (action.includes('create') || action.includes('insert') || action.includes('add')) return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    if (action.includes('update') || action.includes('restore')) return 'bg-primary/10 text-primary border-primary/20';
    if (action.includes('visit') || action.includes('page_visit')) return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    if (action.includes('send')) return 'bg-violet-500/10 text-violet-600 border-violet-500/20';
    return 'bg-muted text-muted-foreground border-border';
  };

  const parseUserAgent = (ua: string | null) => {
    if (!ua) return { browser: 'Unknown', os: 'Unknown', device: 'Unknown' };
    const browser = ua.includes('Firefox') ? 'Firefox' : ua.includes('Edg') ? 'Edge' : ua.includes('Chrome') ? 'Chrome' : ua.includes('Safari') ? 'Safari' : 'Browser';
    const os = ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'macOS' : ua.includes('Linux') ? 'Linux' : ua.includes('Android') ? 'Android' : ua.includes('iPhone') ? 'iOS' : 'Unknown';
    const device = ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone') ? 'Mobile' : 'Desktop';
    return { browser, os, device };
  };

  const entityTypes = ['all', ...new Set(logs.map(l => l.entity_type))];
  
  const filteredLogs = logs.filter(l => {
    const matchesSearch = search === '' || 
      l.action.includes(search.toLowerCase()) || 
      l.entity_type.includes(search.toLowerCase()) ||
      l.ip_address?.includes(search) ||
      (l.user_id && profiles[l.user_id]?.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filterType === 'all' || l.entity_type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Stats
  const today = new Date().toDateString();
  const todayLogs = logs.filter(l => new Date(l.created_at).toDateString() === today);
  const uniqueUsers = new Set(logs.filter(l => l.user_id).map(l => l.user_id)).size;
  const topAction = logs.reduce((acc, l) => { acc[l.action] = (acc[l.action] || 0) + 1; return acc; }, {} as Record<string, number>);
  const mostCommon = Object.entries(topAction).sort(([,a],[,b]) => b - a)[0];

  const exportLogs = () => {
    const csv = [
      ['Time', 'User', 'Action', 'Entity', 'Entity ID', 'IP', 'Browser', 'OS', 'Details'],
      ...filteredLogs.map(l => {
        const ua = parseUserAgent(l.user_agent);
        return [
          new Date(l.created_at).toLocaleString(),
          l.user_id ? (profiles[l.user_id] || l.user_id.slice(0, 12)) : 'System',
          l.action, l.entity_type, l.entity_id || '',
          l.ip_address || '', ua.browser, ua.os,
          JSON.stringify(l.details || {}),
        ];
      })
    ].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-0 shadow-card"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{logs.length}</p>
          <p className="text-xs text-muted-foreground">Total Logs</p>
        </CardContent></Card>
        <Card className="border-0 shadow-card"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{todayLogs.length}</p>
          <p className="text-xs text-muted-foreground">Today's Activity</p>
        </CardContent></Card>
        <Card className="border-0 shadow-card"><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{uniqueUsers}</p>
          <p className="text-xs text-muted-foreground">Unique Users</p>
        </CardContent></Card>
        <Card className="border-0 shadow-card"><CardContent className="p-4 text-center">
          <p className="text-lg font-bold text-accent truncate">{mostCommon ? mostCommon[0].replace(/_/g, ' ') : '—'}</p>
          <p className="text-xs text-muted-foreground">Most Common ({mostCommon?.[1] || 0}x)</p>
        </CardContent></Card>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search logs, users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto max-w-[400px]">
            {entityTypes.slice(0, 8).map(type => (
              <Button key={type} variant={filterType === type ? 'default' : 'outline'} size="sm" onClick={() => setFilterType(type)} className="capitalize text-xs h-8 whitespace-nowrap">
                {type}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="animate-pulse h-7">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5" /> Live
          </Badge>
          <span className="text-xs text-muted-foreground">{filteredLogs.length} logs</span>
          <Button variant="outline" size="sm" onClick={exportLogs} className="h-8 gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={fetchLogs} className="h-8 gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <Card className="border-0 shadow-card">
        <CardContent className="p-0">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No activity recorded yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredLogs.map((log) => {
                const ua = parseUserAgent(log.user_agent);
                return (
                  <div
                    key={log.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 cursor-pointer transition-all group"
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="text-lg flex-shrink-0 w-8 text-center">{getActionIcon(log.action)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground capitalize">{log.action.replace(/_/g, ' ')}</span>
                        <Badge variant="outline" className={`text-[10px] h-5 ${getActionColor(log.action)}`}>{log.entity_type}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {log.user_id && (
                          <span className="flex items-center gap-1"><User className="w-3 h-3" />{profiles[log.user_id] || log.user_id.slice(0, 10)}</span>
                        )}
                        {log.ip_address && (
                          <span className="flex items-center gap-1 truncate max-w-[120px]"><Globe className="w-3 h-3 flex-shrink-0" />{log.ip_address.split(',')[0]}</span>
                        )}
                        <span className="flex items-center gap-1"><Monitor className="w-3 h-3" />{ua.browser} / {ua.os}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <Eye className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedLog && getActionIcon(selectedLog.action)} Activity Details
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (() => {
            const ua = parseUserAgent(selectedLog.user_agent);
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Action', value: selectedLog.action.replace(/_/g, ' ') },
                    { label: 'Entity', value: selectedLog.entity_type },
                    { label: 'User', value: selectedLog.user_id ? (profiles[selectedLog.user_id] || selectedLog.user_id.slice(0, 12)) : 'System' },
                    { label: 'Time', value: new Date(selectedLog.created_at).toLocaleString() },
                    { label: 'IP Address', value: selectedLog.ip_address?.split(',')[0] || 'Unknown', mono: true },
                    { label: 'Browser', value: ua.browser },
                    { label: 'OS', value: ua.os },
                    { label: 'Device', value: ua.device },
                  ].map((item, i) => (
                    <div key={i}>
                      <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                      <p className={`text-sm font-medium capitalize ${'mono' in item && item.mono ? 'font-mono' : ''}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
                {selectedLog.entity_id && (
                  <div><p className="text-xs text-muted-foreground mb-0.5">Entity ID</p><p className="text-sm font-mono">{selectedLog.entity_id}</p></div>
                )}
                {selectedLog.user_agent && (
                  <div><p className="text-xs text-muted-foreground mb-0.5">Full User Agent</p><p className="text-xs break-all text-muted-foreground bg-muted p-2 rounded">{selectedLog.user_agent}</p></div>
                )}
                {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Details</p>
                    <pre className="bg-muted p-3 rounded-lg text-xs overflow-auto max-h-40 font-mono">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
