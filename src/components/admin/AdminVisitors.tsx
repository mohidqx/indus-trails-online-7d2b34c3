import { useState, useEffect } from 'react';
import { Loader2, Monitor, Smartphone, Tablet, Globe, Clock, MousePointer, ArrowDown, Eye, RefreshCw, Cpu, Palette, MapPin, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface VisitorLog {
  id: string;
  session_id: string;
  user_agent: string | null;
  browser: string | null;
  browser_version: string | null;
  os: string | null;
  platform: string | null;
  language: string | null;
  all_languages: string[] | null;
  timezone: string | null;
  tz_offset: number | null;
  cookies_enabled: boolean | null;
  online: boolean | null;
  pdf_viewer: boolean | null;
  screen_width: number | null;
  screen_height: number | null;
  available_width: number | null;
  available_height: number | null;
  viewport_width: number | null;
  viewport_height: number | null;
  pixel_ratio: number | null;
  color_depth: number | null;
  orientation: string | null;
  cpu_cores: number | null;
  max_touch_points: number | null;
  touch_support: boolean | null;
  gpu_vendor: string | null;
  gpu_renderer: string | null;
  time_on_page: number | null;
  mouse_moves: number | null;
  scroll_distance: number | null;
  max_scroll: number | null;
  sections_viewed: string[] | null;
  entry_url: string | null;
  nav_type: string | null;
  ip_address: string | null;
  country: string | null;
  city: string | null;
  device_type: string | null;
  created_at: string;
}

const DeviceIcon = ({ type }: { type: string | null }) => {
  switch (type) {
    case 'mobile': return <Smartphone className="w-4 h-4" />;
    case 'tablet': return <Tablet className="w-4 h-4" />;
    default: return <Monitor className="w-4 h-4" />;
  }
};

const InfoRow = ({ label, value, color }: { label: string; value: string | number | null | undefined; color?: string }) => (
  <div className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className={`text-xs font-medium ${color || 'text-foreground'}`}>{value ?? '—'}</span>
  </div>
);

const BoolBadge = ({ value, label }: { value: boolean | null; label: string }) => (
  <span className={`text-[10px] px-1.5 py-0.5 rounded ${value ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
    {label}: {value ? 'Yes' : 'No'}
  </span>
);

export default function AdminVisitors() {
  const [visitors, setVisitors] = useState<VisitorLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');

  useEffect(() => {
    fetchVisitors();
    const channel = supabase
      .channel('visitor-logs-admin')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visitor_logs' }, (payload) => {
        setVisitors(prev => [payload.new as VisitorLog, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchVisitors = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('visitor_logs' as any)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (data) setVisitors(data as unknown as VisitorLog[]);
    if (error) console.error('Error fetching visitors:', error);
    setIsLoading(false);
  };

  const filtered = visitors.filter(v => {
    const matchSearch = !search || 
      v.browser?.toLowerCase().includes(search.toLowerCase()) ||
      v.os?.toLowerCase().includes(search.toLowerCase()) ||
      v.ip_address?.includes(search) ||
      v.entry_url?.toLowerCase().includes(search.toLowerCase());
    const matchDevice = deviceFilter === 'all' || v.device_type === deviceFilter;
    return matchSearch && matchDevice;
  });

  const stats = {
    total: visitors.length,
    desktop: visitors.filter(v => v.device_type === 'desktop').length,
    mobile: visitors.filter(v => v.device_type === 'mobile').length,
    tablet: visitors.filter(v => v.device_type === 'tablet').length,
    avgTime: visitors.length > 0 ? Math.round(visitors.reduce((s, v) => s + (v.time_on_page || 0), 0) / visitors.length) : 0,
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Visitors', value: stats.total, icon: Eye, color: 'from-primary/10 to-primary/20' },
          { label: 'Desktop', value: stats.desktop, icon: Monitor, color: 'from-blue-500/10 to-blue-500/20' },
          { label: 'Mobile', value: stats.mobile, icon: Smartphone, color: 'from-emerald-500/10 to-emerald-500/20' },
          { label: 'Tablet', value: stats.tablet, icon: Tablet, color: 'from-purple-500/10 to-purple-500/20' },
          { label: 'Avg Time (s)', value: `${stats.avgTime}s`, icon: Clock, color: 'from-accent/10 to-accent/20' },
        ].map((s, i) => (
          <Card key={i} className={`border-0 shadow-card bg-gradient-to-br ${s.color}`}>
            <CardContent className="p-3 text-center">
              <s.icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by browser, OS, IP, URL..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <div className="flex gap-1">
          {['all', 'desktop', 'mobile', 'tablet'].map(d => (
            <Button key={d} variant={deviceFilter === d ? 'default' : 'outline'} size="sm" onClick={() => setDeviceFilter(d)} className="capitalize text-xs h-9">
              {d}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={fetchVisitors} className="h-9 gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* Visitor Cards */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No visitor logs found</div>
        ) : (
          filtered.map(v => {
            const isExpanded = expandedId === v.id;
            return (
              <div key={v.id} className="rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-lg">
                {/* Header Row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : v.id)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    v.device_type === 'mobile' ? 'bg-emerald-500/15 text-emerald-500' :
                    v.device_type === 'tablet' ? 'bg-purple-500/15 text-purple-500' :
                    'bg-blue-500/15 text-blue-500'
                  }`}>
                    <DeviceIcon type={v.device_type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">{v.browser} {v.browser_version}</span>
                      <Badge variant="outline" className="text-[9px] h-4 px-1.5">{v.os}</Badge>
                      <Badge variant="secondary" className="text-[9px] h-4 px-1.5 capitalize">{v.device_type}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {new Date(v.created_at).toLocaleString()}</span>
                      <span>{v.time_on_page || 0}s on page</span>
                      {v.ip_address && <span>{v.ip_address}</span>}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-border p-4 bg-muted/10 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      
                      {/* Browser & System */}
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-primary flex items-center gap-1.5 mb-2">
                          <Globe className="w-3.5 h-3.5" /> BROWSER & SYSTEM
                        </h4>
                        <InfoRow label="User Agent" value={v.user_agent ? (v.user_agent.length > 50 ? v.user_agent.slice(0, 47) + '...' : v.user_agent) : null} />
                        <InfoRow label="Browser" value={`${v.browser} ${v.browser_version}`} color="text-emerald-400" />
                        <InfoRow label="OS" value={v.os} color="text-blue-400" />
                        <InfoRow label="Platform" value={v.platform} color="text-accent" />
                        <InfoRow label="Language" value={v.language} color="text-emerald-400" />
                        <InfoRow label="All Languages" value={v.all_languages?.join(', ')} />
                        <InfoRow label="Timezone" value={v.timezone} color="text-purple-400" />
                        <InfoRow label="TZ Offset" value={v.tz_offset != null ? `${v.tz_offset} min` : null} />
                        <div className="flex flex-wrap gap-1 mt-2">
                          <BoolBadge value={v.cookies_enabled} label="Cookies" />
                          <BoolBadge value={v.online} label="Online" />
                          <BoolBadge value={v.pdf_viewer} label="PDF Viewer" />
                        </div>
                      </div>

                      {/* Screen & Display */}
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-blue-400 flex items-center gap-1.5 mb-2">
                          <Monitor className="w-3.5 h-3.5" /> SCREEN & DISPLAY
                        </h4>
                        <InfoRow label="Screen" value={v.screen_width && v.screen_height ? `${v.screen_width} × ${v.screen_height}` : null} color="text-foreground" />
                        <InfoRow label="Available" value={v.available_width && v.available_height ? `${v.available_width} × ${v.available_height}` : null} color="text-foreground" />
                        <InfoRow label="Viewport" value={v.viewport_width && v.viewport_height ? `${v.viewport_width} × ${v.viewport_height}` : null} color="text-foreground" />
                        <InfoRow label="Pixel Ratio" value={v.pixel_ratio ? `${v.pixel_ratio}x` : null} color="text-accent" />
                        <InfoRow label="Color Depth" value={v.color_depth ? `${v.color_depth}-bit` : null} color="text-foreground" />
                        <InfoRow label="Orientation" value={v.orientation} color="text-foreground" />
                      </div>

                      {/* Hardware */}
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mb-2">
                          <Cpu className="w-3.5 h-3.5" /> HARDWARE
                        </h4>
                        <InfoRow label="CPU Cores" value={v.cpu_cores} color="text-foreground" />
                        <InfoRow label="Max Touch Points" value={v.max_touch_points} color="text-foreground" />
                        <BoolBadge value={v.touch_support} label="Touch Support" />
                        <InfoRow label="GPU Vendor" value={v.gpu_vendor} color="text-foreground" />
                        <InfoRow label="GPU Renderer" value={v.gpu_renderer ? (v.gpu_renderer.length > 40 ? v.gpu_renderer.slice(0, 37) + '...' : v.gpu_renderer) : null} />
                      </div>

                      {/* Behavior */}
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-accent flex items-center gap-1.5 mb-2">
                          <MousePointer className="w-3.5 h-3.5" /> BEHAVIOR
                        </h4>
                        <InfoRow label="Time on Page" value={v.time_on_page != null ? `${v.time_on_page} seconds` : null} color="text-foreground" />
                        <InfoRow label="Mouse Moves" value={v.mouse_moves} color="text-foreground" />
                        <InfoRow label="Scroll Distance" value={v.scroll_distance ? `${v.scroll_distance}px` : null} color="text-foreground" />
                        <InfoRow label="Max Scroll" value={v.max_scroll != null ? `${v.max_scroll}%` : null} color="text-foreground" />
                        <InfoRow label="Sections Viewed" value={v.sections_viewed?.join(', ') || 'none'} />
                        <InfoRow label="Entry URL" value={v.entry_url ? new URL(v.entry_url).pathname : null} color="text-blue-400" />
                        <InfoRow label="Nav Type" value={v.nav_type} color="text-purple-400" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
