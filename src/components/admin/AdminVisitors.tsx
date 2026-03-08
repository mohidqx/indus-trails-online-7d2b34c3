import { useState, useEffect } from 'react';
import { Loader2, Monitor, Smartphone, Tablet, Globe, Clock, MousePointer, Eye, RefreshCw, Cpu, ChevronDown, ChevronUp, Search, Wifi, WifiOff, Download, Filter, TrendingUp, MapPin, Fingerprint } from 'lucide-react';
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
  created_at: string;
}

const DeviceIcon = ({ type }: { type: string | null }) => {
  switch (type) {
    case 'mobile': return <Smartphone className="w-4 h-4" />;
    case 'tablet': return <Tablet className="w-4 h-4" />;
    default: return <Monitor className="w-4 h-4" />;
  }
};

const DetailItem = ({ label, value, icon: Icon, highlight }: { label: string; value: string | number | null | undefined; icon?: any; highlight?: boolean }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0">
    <span className="text-[11px] text-gray-500 flex items-center gap-1.5">
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </span>
    <span className={`text-[11px] font-medium ${highlight ? 'text-primary' : 'text-gray-300'}`}>
      {value ?? '—'}
    </span>
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
    const headers = ['Date', 'Browser', 'OS', 'Device', 'IP', 'Country', 'City', 'Screen', 'Time on Page', 'Max Scroll', 'Entry URL'];
    const rows = filtered.map(v => [
      new Date(v.created_at).toLocaleString(),
      `${v.browser} ${v.browser_version}`,
      v.os, v.device_type, v.ip_address, v.country, v.city,
      `${v.screen_width}x${v.screen_height}`,
      `${v.time_on_page}s`, `${v.max_scroll}%`, v.entry_url
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
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: Eye, gradient: 'from-primary/10 to-primary/5' },
          { label: 'Desktop', value: stats.desktop, icon: Monitor, gradient: 'from-blue-500/10 to-blue-500/5' },
          { label: 'Mobile', value: stats.mobile, icon: Smartphone, gradient: 'from-emerald-500/10 to-emerald-500/5' },
          { label: 'Tablet', value: stats.tablet, icon: Tablet, gradient: 'from-purple-500/10 to-purple-500/5' },
          { label: 'Avg Time', value: `${stats.avgTime}s`, icon: Clock, gradient: 'from-accent/10 to-accent/5' },
          { label: 'Avg Scroll', value: `${stats.avgScroll}%`, icon: TrendingUp, gradient: 'from-cyan-500/10 to-cyan-500/5' },
          { label: 'Browsers', value: stats.uniqueBrowsers, icon: Globe, gradient: 'from-orange-500/10 to-orange-500/5' },
          { label: 'Countries', value: stats.uniqueCountries, icon: MapPin, gradient: 'from-pink-500/10 to-pink-500/5' },
        ].map((s, i) => (
          <Card key={i} className={`border-0 admin-stat-card bg-gradient-to-br ${s.gradient}`}>
            <CardContent className="p-3 text-center">
              <s.icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
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
              {d === 'all' ? <Filter className="w-3.5 h-3.5 mr-1" /> : null}
              {d}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} className="h-9 gap-1.5">
          <Download className="w-3.5 h-3.5" /> CSV
        </Button>
        <Button variant="outline" size="sm" onClick={fetchVisitors} className="h-9 gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* Visitor Cards */}
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
              <div key={v.id} className="rounded-xl border border-border/50 bg-card/30 overflow-hidden transition-all hover:border-border admin-stat-card">
                {/* Summary Row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : v.id)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/[0.01] transition-colors"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    v.device_type === 'mobile' ? 'bg-emerald-500/10 text-emerald-400' :
                    v.device_type === 'tablet' ? 'bg-purple-500/10 text-purple-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    <DeviceIcon type={v.device_type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-foreground">{v.browser || 'Unknown'} {v.browser_version?.split('.')[0]}</span>
                      <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-white/10">{v.os}</Badge>
                      <Badge variant="secondary" className="text-[9px] h-4 px-1.5 capitalize bg-white/[0.04]">{v.device_type}</Badge>
                      {v.country && <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-primary/20 text-primary">{v.country}{v.city ? `, ${v.city}` : ''}</Badge>}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {new Date(v.created_at).toLocaleString()}</span>
                      <span>{v.time_on_page || 0}s</span>
                      <span>{v.max_scroll || 0}% scroll</span>
                      {v.ip_address && <span className="font-mono text-[9px]">{v.ip_address}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {v.online !== null && (
                      v.online ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-red-400" />
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {/* Expanded Full Details */}
                {isExpanded && (
                  <div className="border-t border-white/[0.03] p-4 bg-black/20 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                      
                      {/* Browser & System */}
                      <Card className="border-0 bg-white/[0.02]">
                        <CardHeader className="pb-2 pt-3 px-3">
                          <CardTitle className="text-[11px] font-semibold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                            <Globe className="w-3.5 h-3.5" /> Browser & System
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 pb-3">
                          <DetailItem label="Browser" value={`${v.browser} ${v.browser_version}`} highlight />
                          <DetailItem label="OS" value={v.os} highlight />
                          <DetailItem label="Platform" value={v.platform} />
                          <DetailItem label="Language" value={v.language} highlight />
                          <DetailItem label="All Languages" value={v.all_languages?.join(', ')} />
                          <DetailItem label="Timezone" value={v.timezone} />
                          <DetailItem label="TZ Offset" value={v.tz_offset != null ? `${v.tz_offset} min` : null} />
                          <DetailItem label="Nav Type" value={v.nav_type} />
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <StatusDot active={v.cookies_enabled} label="Cookies" />
                            <StatusDot active={v.online} label="Online" />
                            <StatusDot active={v.pdf_viewer} label="PDF" />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Screen & Display */}
                      <Card className="border-0 bg-white/[0.02]">
                        <CardHeader className="pb-2 pt-3 px-3">
                          <CardTitle className="text-[11px] font-semibold text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
                            <Monitor className="w-3.5 h-3.5" /> Screen & Display
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 pb-3">
                          <DetailItem label="Screen" value={v.screen_width && v.screen_height ? `${v.screen_width} × ${v.screen_height}` : null} highlight />
                          <DetailItem label="Available" value={v.available_width && v.available_height ? `${v.available_width} × ${v.available_height}` : null} />
                          <DetailItem label="Viewport" value={v.viewport_width && v.viewport_height ? `${v.viewport_width} × ${v.viewport_height}` : null} highlight />
                          <DetailItem label="Pixel Ratio" value={v.pixel_ratio ? `${v.pixel_ratio}x` : null} />
                          <DetailItem label="Color Depth" value={v.color_depth ? `${v.color_depth}-bit` : null} />
                          <DetailItem label="Orientation" value={v.orientation} />
                        </CardContent>
                      </Card>

                      {/* Hardware */}
                      <Card className="border-0 bg-white/[0.02]">
                        <CardHeader className="pb-2 pt-3 px-3">
                          <CardTitle className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                            <Cpu className="w-3.5 h-3.5" /> Hardware
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 pb-3">
                          <DetailItem label="CPU Cores" value={v.cpu_cores} highlight />
                          <DetailItem label="Touch Points" value={v.max_touch_points} />
                          <DetailItem label="GPU Vendor" value={v.gpu_vendor} />
                          <DetailItem label="GPU Renderer" value={v.gpu_renderer ? (v.gpu_renderer.length > 35 ? v.gpu_renderer.slice(0, 32) + '...' : v.gpu_renderer) : null} />
                          <div className="mt-2">
                            <StatusDot active={v.touch_support} label="Touch Support" />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Behavior & Location */}
                      <Card className="border-0 bg-white/[0.02]">
                        <CardHeader className="pb-2 pt-3 px-3">
                          <CardTitle className="text-[11px] font-semibold text-accent flex items-center gap-1.5 uppercase tracking-wider">
                            <MousePointer className="w-3.5 h-3.5" /> Behavior
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 pb-3">
                          <DetailItem label="Time on Page" value={v.time_on_page != null ? `${v.time_on_page}s` : null} highlight />
                          <DetailItem label="Mouse Moves" value={v.mouse_moves?.toLocaleString()} />
                          <DetailItem label="Scroll Distance" value={v.scroll_distance ? `${v.scroll_distance.toLocaleString()}px` : null} />
                          <DetailItem label="Max Scroll" value={v.max_scroll != null ? `${v.max_scroll}%` : null} highlight />
                          <DetailItem label="Sections Viewed" value={v.sections_viewed?.length ? v.sections_viewed.join(', ') : 'none'} />
                          <DetailItem label="Entry URL" value={v.entry_url ? (() => { try { return new URL(v.entry_url).pathname; } catch { return v.entry_url; } })() : null} highlight />
                          {(v.country || v.city) && (
                            <DetailItem icon={MapPin} label="Location" value={[v.city, v.country].filter(Boolean).join(', ')} highlight />
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Full User Agent */}
                    <div className="mt-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.03]">
                      <div className="flex items-center gap-2 mb-1">
                        <Fingerprint className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Full User Agent</span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-mono break-all leading-relaxed">{v.user_agent || '—'}</p>
                      <p className="text-[10px] text-gray-600 mt-2 font-mono">Session: {v.session_id}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer count */}
      <div className="text-center py-2">
        <p className="text-[11px] text-muted-foreground">
          Showing {filtered.length} of {visitors.length} visitor logs
        </p>
      </div>
    </div>
  );
}
