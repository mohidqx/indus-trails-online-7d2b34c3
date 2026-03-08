import { useState, useEffect } from 'react';
import { Loader2, Monitor, Smartphone, Tablet, Globe, Clock, MousePointer, Eye, RefreshCw, Cpu, ChevronDown, ChevronUp, Search, Wifi, WifiOff, Download, Filter, TrendingUp, MapPin, Battery, Gauge, Zap, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

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
  device_memory: number | null;
  connection_type: string | null;
  downlink: number | null;
  battery_level: number | null;
  battery_charging: boolean | null;
  page_load_time: number | null;
  dom_load_time: number | null;
  created_at: string;
}

const DeviceIcon = ({ type }: { type: string | null }) => {
  switch (type) {
    case 'mobile': return <Smartphone className="w-4 h-4" />;
    case 'tablet': return <Tablet className="w-4 h-4" />;
    default: return <Monitor className="w-4 h-4" />;
  }
};

const SectionLabel = ({ icon: Icon, label, color }: { icon: any; label: string; color: string }) => (
  <div className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider ${color} mb-2`}>
    <Icon className="w-3.5 h-3.5" /> {label}
  </div>
);

const DetailRow = ({ label, value, highlight }: { label: string; value: string | number | null | undefined; highlight?: boolean }) => (
  <div className="flex items-center justify-between py-1 border-b border-white/[0.03] last:border-0">
    <span className="text-[11px] text-gray-500">{label}</span>
    <span className={`text-[11px] font-medium ${highlight ? 'text-primary' : 'text-gray-300'}`}>{value ?? '—'}</span>
  </div>
);

const StatusDot = ({ active, label }: { active: boolean | null; label: string }) => (
  <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${
    active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-red-400'}`} />
    {label}
  </span>
);

function formatTime(seconds: number | null) {
  if (!seconds) return '0s';
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

export default function AdminVisitors() {
  const { toast } = useToast();
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
      .limit(300);
    if (data) setVisitors(data as unknown as VisitorLog[]);
    if (error) console.error('Error fetching visitors:', error);
    setIsLoading(false);
  };

  const filtered = visitors.filter(v => {
    const matchSearch = !search || 
      v.browser?.toLowerCase().includes(search.toLowerCase()) ||
      v.os?.toLowerCase().includes(search.toLowerCase()) ||
      v.ip_address?.includes(search) ||
      v.country?.toLowerCase().includes(search.toLowerCase()) ||
      v.city?.toLowerCase().includes(search.toLowerCase()) ||
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
    avgScroll: visitors.length > 0 ? Math.round(visitors.reduce((s, v) => s + (v.max_scroll || 0), 0) / visitors.length) : 0,
    uniqueBrowsers: new Set(visitors.map(v => v.browser).filter(Boolean)).size,
    uniqueCountries: new Set(visitors.map(v => v.country).filter(Boolean)).size,
  };

  const exportCSV = () => {
    const headers = ['Date', 'Browser', 'OS', 'Device', 'IP', 'Country', 'City', 'Screen', 'Time on Page', 'Max Scroll', 'Connection', 'Battery', 'Page Load', 'Entry URL'];
    const rows = filtered.map(v => [
      new Date(v.created_at).toLocaleString(),
      `${v.browser} ${v.browser_version}`, v.os, v.device_type, v.ip_address, v.country, v.city,
      `${v.screen_width}x${v.screen_height}`, `${v.time_on_page}s`, `${v.max_scroll}%`,
      v.connection_type, v.battery_level != null ? `${v.battery_level}%` : '', 
      v.page_load_time ? `${v.page_load_time}ms` : '', v.entry_url
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c || ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `visitors-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: 'Exported', description: `${filtered.length} visitor logs exported` });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: Eye, color: 'text-primary' },
          { label: 'Desktop', value: stats.desktop, icon: Monitor, color: 'text-blue-400' },
          { label: 'Mobile', value: stats.mobile, icon: Smartphone, color: 'text-emerald-400' },
          { label: 'Tablet', value: stats.tablet, icon: Tablet, color: 'text-purple-400' },
          { label: 'Avg Time', value: formatTime(stats.avgTime), icon: Clock, color: 'text-amber-400' },
          { label: 'Avg Scroll', value: `${stats.avgScroll}%`, icon: TrendingUp, color: 'text-cyan-400' },
          { label: 'Browsers', value: stats.uniqueBrowsers, icon: Globe, color: 'text-orange-400' },
          { label: 'Countries', value: stats.uniqueCountries, icon: MapPin, color: 'text-pink-400' },
        ].map((s, i) => (
          <Card key={i} className="border-0 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
            <CardContent className="p-3 text-center">
              <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search browser, OS, IP, country, URL..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-card/50" />
        </div>
        <div className="flex gap-1">
          {['all', 'desktop', 'mobile', 'tablet'].map(d => (
            <Button key={d} variant={deviceFilter === d ? 'default' : 'outline'} size="sm" onClick={() => setDeviceFilter(d)} className="capitalize text-xs h-9">
              {d === 'all' ? <Filter className="w-3.5 h-3.5 mr-1" /> : null}{d}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} className="h-9 gap-1.5"><Download className="w-3.5 h-3.5" /> CSV</Button>
        <Button variant="outline" size="sm" onClick={fetchVisitors} className="h-9 gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Refresh</Button>
      </div>

      {/* Visitor List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Eye className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No visitor logs found</p>
          </div>
        ) : (
          filtered.map(v => {
            const isExpanded = expandedId === v.id;
            return (
              <div key={v.id} className="rounded-xl border border-border/50 bg-card/30 overflow-hidden transition-all hover:border-border/80">
                {/* Summary */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : v.id)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/[0.01] transition-colors"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    v.device_type === 'mobile' ? 'bg-emerald-500/10 text-emerald-400' :
                    v.device_type === 'tablet' ? 'bg-purple-500/10 text-purple-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    <DeviceIcon type={v.device_type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-foreground">{v.browser || 'Unknown'} {v.browser_version?.split('.')[0]}</span>
                      <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-border/50">{v.os}</Badge>
                      <Badge variant="secondary" className="text-[9px] h-4 px-1.5 capitalize bg-white/[0.04]">{v.device_type}</Badge>
                      {v.country && <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-primary/20 text-primary">{v.country}{v.city ? `, ${v.city}` : ''}</Badge>}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {new Date(v.created_at).toLocaleString()}</span>
                      <span>{formatTime(v.time_on_page)}</span>
                      <span>{v.max_scroll || 0}% scroll</span>
                      {v.page_load_time && <span className="flex items-center gap-0.5"><Zap className="w-3 h-3" /> {v.page_load_time}ms</span>}
                      {v.ip_address && <span className="font-mono text-[9px]">{v.ip_address}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {v.battery_level != null && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Battery className="w-3.5 h-3.5" /> {v.battery_level}%
                      </span>
                    )}
                    {v.online !== null && (
                      v.online ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-red-400" />
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {/* Expanded Details - Reference-style layout */}
                {isExpanded && (
                  <div className="border-t border-white/[0.03] p-4 bg-black/20 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      
                      {/* Browser & System */}
                      <div className="space-y-1 p-3 rounded-lg bg-white/[0.02]">
                        <SectionLabel icon={Globe} label="Browser & System" color="text-primary" />
                        <DetailRow label="User Agent" value={v.user_agent ? (v.user_agent.length > 60 ? v.user_agent.slice(0, 57) + '...' : v.user_agent) : null} />
                        <DetailRow label="Browser" value={`${v.browser} ${v.browser_version}`} highlight />
                        <DetailRow label="OS" value={v.os} highlight />
                        <DetailRow label="Platform" value={v.platform} />
                        <DetailRow label="Language" value={v.language} highlight />
                        <DetailRow label="All Languages" value={v.all_languages?.join(', ')} />
                        <DetailRow label="Timezone" value={v.timezone} />
                        <DetailRow label="TZ Offset" value={v.tz_offset != null ? `${v.tz_offset} min` : null} />
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <StatusDot active={v.cookies_enabled} label="Cookies" />
                          <StatusDot active={v.online} label="Online" />
                          <StatusDot active={v.pdf_viewer} label="PDF" />
                        </div>
                      </div>

                      {/* Screen & Display */}
                      <div className="space-y-1 p-3 rounded-lg bg-white/[0.02]">
                        <SectionLabel icon={Monitor} label="Screen & Display" color="text-blue-400" />
                        <DetailRow label="Screen" value={v.screen_width && v.screen_height ? `${v.screen_width} × ${v.screen_height}` : null} highlight />
                        <DetailRow label="Available" value={v.available_width && v.available_height ? `${v.available_width} × ${v.available_height}` : null} />
                        <DetailRow label="Viewport" value={v.viewport_width && v.viewport_height ? `${v.viewport_width} × ${v.viewport_height}` : null} highlight />
                        <DetailRow label="Pixel Ratio" value={v.pixel_ratio ? `${v.pixel_ratio}x` : null} />
                        <DetailRow label="Color Depth" value={v.color_depth ? `${v.color_depth}-bit` : null} />
                        <DetailRow label="Orientation" value={v.orientation} />
                      </div>

                      {/* Hardware */}
                      <div className="space-y-1 p-3 rounded-lg bg-white/[0.02]">
                        <SectionLabel icon={Cpu} label="Hardware" color="text-emerald-400" />
                        <DetailRow label="Device Memory" value={v.device_memory ? `${v.device_memory} GB` : null} highlight />
                        <DetailRow label="CPU Cores" value={v.cpu_cores} highlight />
                        <DetailRow label="Touch Points" value={v.max_touch_points} />
                        <DetailRow label="GPU Vendor" value={v.gpu_vendor} />
                        <DetailRow label="GPU Renderer" value={v.gpu_renderer ? (v.gpu_renderer.length > 45 ? v.gpu_renderer.slice(0, 42) + '...' : v.gpu_renderer) : null} />
                        <div className="mt-2"><StatusDot active={v.touch_support} label="Touch Support" /></div>
                      </div>

                      {/* Network & Battery */}
                      <div className="space-y-1 p-3 rounded-lg bg-white/[0.02]">
                        <SectionLabel icon={Wifi} label="Network & Battery" color="text-cyan-400" />
                        <DetailRow label="Connection" value={v.connection_type} highlight />
                        <DetailRow label="Downlink" value={v.downlink ? `${v.downlink} Mbps` : null} />
                        <DetailRow label="Battery" value={v.battery_level != null ? `${v.battery_level}%` : null} highlight />
                        <DetailRow label="Charging" value={v.battery_charging != null ? (v.battery_charging ? 'Yes' : 'No') : null} />
                      </div>

                      {/* Performance */}
                      <div className="space-y-1 p-3 rounded-lg bg-white/[0.02]">
                        <SectionLabel icon={Gauge} label="Performance" color="text-amber-400" />
                        <DetailRow label="Page Load" value={v.page_load_time ? `${v.page_load_time} ms` : null} highlight />
                        <DetailRow label="DOM Loaded" value={v.dom_load_time ? `${v.dom_load_time} ms` : null} highlight />
                        <DetailRow label="Nav Type" value={v.nav_type} />
                        <DetailRow label="Entry URL" value={v.entry_url ? (() => { try { return new URL(v.entry_url).pathname; } catch { return v.entry_url; } })() : null} highlight />
                      </div>

                      {/* Behavior */}
                      <div className="space-y-1 p-3 rounded-lg bg-white/[0.02]">
                        <SectionLabel icon={Activity} label="Behavior" color="text-pink-400" />
                        <DetailRow label="Time on Page" value={formatTime(v.time_on_page)} highlight />
                        <DetailRow label="Mouse Moves" value={v.mouse_moves?.toLocaleString()} />
                        <DetailRow label="Scroll Distance" value={v.scroll_distance ? `${v.scroll_distance.toLocaleString()}px` : null} />
                        <DetailRow label="Max Scroll" value={v.max_scroll != null ? `${v.max_scroll}%` : null} highlight />
                        <DetailRow label="Sections" value={v.sections_viewed?.length ? v.sections_viewed.join(', ') : 'none'} />
                        {(v.country || v.city) && <DetailRow label="Location" value={[v.city, v.country].filter(Boolean).join(', ')} highlight />}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-center text-[10px] text-muted-foreground py-2">
          Showing {filtered.length} of {visitors.length} visitors
        </p>
      )}
    </div>
  );
}
