import { useState, useEffect } from 'react';
import { 
  Loader2, Monitor, Smartphone, Tablet, Globe, Clock, Eye, RefreshCw, Cpu, 
  ChevronDown, ChevronUp, Search, Wifi, WifiOff, Download, Filter, TrendingUp, 
  MapPin, Battery, Gauge, Zap, Activity, Ban, Shield, MousePointer, Link2,
  Fingerprint, EyeOff, Copy, MousePointerClick, Timer, Navigation, Layers,
  AlertTriangle, Flame, Video, Mic, HardDrive, RotateCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
  // New fields
  referrer: string | null;
  referrer_domain: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  canvas_fingerprint: string | null;
  audio_fingerprint: string | null;
  webgl_fingerprint: string | null;
  total_clicks: number | null;
  rage_clicks: number | null;
  tab_switches: number | null;
  tab_hidden_time: number | null;
  ad_blocker_detected: boolean | null;
  incognito_detected: boolean | null;
  do_not_track: boolean | null;
  pages_visited: string[] | null;
  exit_url: string | null;
  form_interactions: number | null;
  form_abandons: number | null;
  copy_events: number | null;
  right_click_events: number | null;
  storage_quota: number | null;
  service_worker_support: boolean | null;
  webgl_extensions: number | null;
  has_camera: boolean | null;
  has_microphone: boolean | null;
  installed_plugins: string[] | null;
  screen_orientation_changes: number | null;
  js_heap_size: number | null;
  idle_time: number | null;
  engagement_score: number | null;
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
    <span className={`text-[11px] font-medium ${highlight ? 'text-primary' : 'text-gray-300'} max-w-[200px] truncate text-right`}>{value ?? '—'}</span>
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

const ThreatBadge = ({ active, label }: { active: boolean | null | undefined; label: string }) => {
  if (!active) return null;
  return (
    <Badge variant="destructive" className="text-[9px] h-4 px-1.5 animate-pulse gap-0.5">
      <AlertTriangle className="w-2.5 h-2.5" /> {label}
    </Badge>
  );
};

function formatTime(seconds: number | null) {
  if (!seconds) return '0s';
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function getEngagementColor(score: number | null) {
  if (!score) return 'text-gray-500';
  if (score >= 70) return 'text-emerald-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-400';
}

function getEngagementLabel(score: number | null) {
  if (!score) return 'None';
  if (score >= 80) return 'Hot 🔥';
  if (score >= 60) return 'Engaged';
  if (score >= 40) return 'Warm';
  if (score >= 20) return 'Cool';
  return 'Cold ❄️';
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
      .limit(500);
    if (data) setVisitors(data as unknown as VisitorLog[]);
    if (error) console.error('Error fetching visitors:', error);
    setIsLoading(false);
  };

  const blockIP = async (ip: string) => {
    const { error } = await supabase.from('banned_ips').insert({
      ip_address: ip,
      reason: 'Blocked from visitor logs',
      is_active: true,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '🚫 IP Blocked', description: `${ip} has been blacklisted` });
    }
  };

  const filtered = visitors.filter(v => {
    const matchSearch = !search || 
      v.browser?.toLowerCase().includes(search.toLowerCase()) ||
      v.os?.toLowerCase().includes(search.toLowerCase()) ||
      v.ip_address?.includes(search) ||
      v.country?.toLowerCase().includes(search.toLowerCase()) ||
      v.city?.toLowerCase().includes(search.toLowerCase()) ||
      v.entry_url?.toLowerCase().includes(search.toLowerCase()) ||
      v.referrer_domain?.toLowerCase().includes(search.toLowerCase()) ||
      v.canvas_fingerprint?.includes(search);
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
    avgEngagement: visitors.length > 0 ? Math.round(visitors.reduce((s, v) => s + (v.engagement_score || 0), 0) / visitors.length) : 0,
    uniqueCountries: new Set(visitors.map(v => v.country).filter(Boolean)).size,
    adBlockers: visitors.filter(v => v.ad_blocker_detected).length,
    incognito: visitors.filter(v => v.incognito_detected).length,
    rageClickers: visitors.filter(v => (v.rage_clicks || 0) > 0).length,
    withReferrer: visitors.filter(v => v.referrer_domain).length,
  };

  const exportCSV = () => {
    const headers = ['Date', 'Browser', 'OS', 'Device', 'IP', 'Country', 'City', 'Screen', 'Time', 'Scroll%', 'Engagement', 'Clicks', 'Rage', 'Tab Switches', 'AdBlock', 'Incognito', 'Referrer', 'UTM Source', 'Fingerprint', 'Pages', 'Entry', 'Exit'];
    const rows = filtered.map(v => [
      new Date(v.created_at).toLocaleString(),
      `${v.browser} ${v.browser_version}`, v.os, v.device_type, v.ip_address, v.country, v.city,
      `${v.screen_width}x${v.screen_height}`, `${v.time_on_page}s`, `${v.max_scroll}%`,
      v.engagement_score, v.total_clicks, v.rage_clicks, v.tab_switches,
      v.ad_blocker_detected ? 'Yes' : 'No', v.incognito_detected ? 'Yes' : 'No',
      v.referrer_domain, v.utm_source, v.canvas_fingerprint,
      v.pages_visited?.join(' > '), v.entry_url, v.exit_url,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c || ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `visitors-intelligence-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: 'Exported', description: `${filtered.length} visitor logs exported` });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Stats Row 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: Eye, color: 'text-primary' },
          { label: 'Desktop', value: stats.desktop, icon: Monitor, color: 'text-blue-400' },
          { label: 'Mobile', value: stats.mobile, icon: Smartphone, color: 'text-emerald-400' },
          { label: 'Avg Time', value: formatTime(stats.avgTime), icon: Clock, color: 'text-amber-400' },
          { label: 'Avg Engage', value: `${stats.avgEngagement}%`, icon: Flame, color: 'text-orange-400' },
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

      {/* Threat Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Ad Blockers', value: stats.adBlockers, pct: stats.total > 0 ? Math.round(stats.adBlockers / stats.total * 100) : 0, icon: Shield, color: 'text-red-400' },
          { label: 'Incognito', value: stats.incognito, pct: stats.total > 0 ? Math.round(stats.incognito / stats.total * 100) : 0, icon: EyeOff, color: 'text-purple-400' },
          { label: 'Rage Clickers', value: stats.rageClickers, pct: stats.total > 0 ? Math.round(stats.rageClickers / stats.total * 100) : 0, icon: AlertTriangle, color: 'text-orange-400' },
          { label: 'From Referrer', value: stats.withReferrer, pct: stats.total > 0 ? Math.round(stats.withReferrer / stats.total * 100) : 0, icon: Link2, color: 'text-cyan-400' },
        ].map((s, i) => (
          <Card key={i} className="border-0 bg-white/[0.02]">
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{s.value} <span className="text-[10px] text-muted-foreground font-normal">({s.pct}%)</span></p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search browser, OS, IP, country, referrer, fingerprint..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 bg-card/50" />
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
            const hasThreat = v.ad_blocker_detected || v.incognito_detected || (v.rage_clicks || 0) > 2;
            return (
              <div key={v.id} className={`rounded-xl border overflow-hidden transition-all hover:border-border/80 ${
                hasThreat ? 'border-orange-500/30 bg-orange-500/[0.02]' : 'border-border/50 bg-card/30'
              }`}>
                {/* Summary */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : v.id)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/[0.01] transition-colors group"
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
                      {v.engagement_score != null && (
                        <Badge variant="outline" className={`text-[9px] h-4 px-1.5 ${getEngagementColor(v.engagement_score)}`}>
                          {v.engagement_score}% {getEngagementLabel(v.engagement_score)}
                        </Badge>
                      )}
                      <ThreatBadge active={v.ad_blocker_detected} label="AdBlock" />
                      <ThreatBadge active={v.incognito_detected} label="Incognito" />
                      <ThreatBadge active={(v.rage_clicks || 0) > 2} label="Rage" />
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {new Date(v.created_at).toLocaleString()}</span>
                      <span>{formatTime(v.time_on_page)}</span>
                      <span>{v.max_scroll || 0}% scroll</span>
                      {v.total_clicks ? <span>{v.total_clicks} clicks</span> : null}
                      {v.referrer_domain && <span className="text-cyan-400">via {v.referrer_domain}</span>}
                      {v.utm_source && <span className="text-amber-400">utm:{v.utm_source}</span>}
                      {v.canvas_fingerprint && <span className="font-mono text-[9px]">FP:{v.canvas_fingerprint.slice(0, 8)}</span>}
                      {v.ip_address && <span className="font-mono text-[9px]">{v.ip_address}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {v.ip_address && (
                      <Button 
                        variant="ghost" size="sm" 
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); blockIP(v.ip_address!); }}
                        title="Block IP"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </Button>
                    )}
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

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-white/[0.03] p-4 bg-black/20 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      
                      {/* Traffic Source */}
                      <div className="space-y-1 p-3 rounded-lg bg-white/[0.02]">
                        <SectionLabel icon={Link2} label="Traffic Source" color="text-cyan-400" />
                        <DetailRow label="Referrer" value={v.referrer ? (v.referrer.length > 50 ? v.referrer.slice(0, 47) + '...' : v.referrer) : 'Direct'} highlight />
                        <DetailRow label="Referrer Domain" value={v.referrer_domain || 'Direct'} highlight />
                        <DetailRow label="UTM Source" value={v.utm_source} highlight />
                        <DetailRow label="UTM Medium" value={v.utm_medium} />
                        <DetailRow label="UTM Campaign" value={v.utm_campaign} />
                        <DetailRow label="UTM Term" value={v.utm_term} />
                        <DetailRow label="UTM Content" value={v.utm_content} />
                      </div>

                      {/* Fingerprinting */}
                      <div className="space-y-1 p-3 rounded-lg bg-white/[0.02]">
                        <SectionLabel icon={Fingerprint} label="Fingerprinting" color="text-purple-400" />
                        <DetailRow label="Canvas FP" value={v.canvas_fingerprint} highlight />
                        <DetailRow label="Audio FP" value={v.audio_fingerprint} />
                        <DetailRow label="WebGL FP" value={v.webgl_fingerprint ? (v.webgl_fingerprint.length > 40 ? v.webgl_fingerprint.slice(0, 37) + '...' : v.webgl_fingerprint) : null} />
                        <DetailRow label="WebGL Extensions" value={v.webgl_extensions} />
                        <DetailRow label="Plugins" value={v.installed_plugins?.length ? `${v.installed_plugins.length} found` : '0'} />
                        {v.installed_plugins && v.installed_plugins.length > 0 && (
                          <p className="text-[9px] text-muted-foreground mt-1">{v.installed_plugins.join(', ')}</p>
                        )}
                      </div>

                      {/* Behavior & Engagement */}
                      <div className="space-y-1 p-3 rounded-lg bg-white/[0.02]">
                        <SectionLabel icon={Activity} label="Behavior" color="text-pink-400" />
                        <DetailRow label="Engagement Score" value={v.engagement_score != null ? `${v.engagement_score}% — ${getEngagementLabel(v.engagement_score)}` : null} highlight />
                        <DetailRow label="Time on Page" value={formatTime(v.time_on_page)} highlight />
                        <DetailRow label="Idle Time" value={formatTime(v.idle_time)} />
                        <DetailRow label="Total Clicks" value={v.total_clicks} highlight />
                        <DetailRow label="Rage Clicks" value={v.rage_clicks} highlight={!!(v.rage_clicks && v.rage_clicks > 0)} />
                        <DetailRow label="Mouse Moves" value={v.mouse_moves?.toLocaleString()} />
                        <DetailRow label="Scroll Distance" value={v.scroll_distance ? `${v.scroll_distance.toLocaleString()}px` : null} />
                        <DetailRow label="Max Scroll" value={v.max_scroll != null ? `${v.max_scroll}%` : null} highlight />
                        <DetailRow label="Sections Viewed" value={v.sections_viewed?.length ? v.sections_viewed.join(', ') : 'none'} />
                      </div>

                      {/* Privacy & Security */}
                      <div className="space-y-1 p-3 rounded-lg bg-white/[0.02]">
                        <SectionLabel icon={Shield} label="Privacy & Security" color="text-red-400" />
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          <StatusDot active={!v.ad_blocker_detected} label={v.ad_blocker_detected ? 'Ad Blocker ON' : 'No AdBlock'} />
                          <StatusDot active={!v.incognito_detected} label={v.incognito_detected ? 'Incognito' : 'Normal'} />
                          <StatusDot active={!v.do_not_track} label={v.do_not_track ? 'DNT ON' : 'DNT OFF'} />
                          <StatusDot active={v.cookies_enabled} label="Cookies" />
                          <StatusDot active={v.online} label="Online" />
                        </div>
                        <DetailRow label="Tab Switches" value={v.tab_switches} highlight={!!(v.tab_switches && v.tab_switches > 3)} />
                        <DetailRow label="Tab Hidden Time" value={formatTime(v.tab_hidden_time)} />
                        <DetailRow label="Copy Events" value={v.copy_events} />
                        <DetailRow label="Right Clicks" value={v.right_click_events} />
                        <DetailRow label="Form Interactions" value={v.form_interactions} />
                      </div>

                      {/* Navigation */}
                      <div className="space-y-1 p-3 rounded-lg bg-white/[0.02]">
                        <SectionLabel icon={Navigation} label="Navigation" color="text-amber-400" />
                        <DetailRow label="Entry URL" value={v.entry_url ? (() => { try { return new URL(v.entry_url).pathname; } catch { return v.entry_url; } })() : null} highlight />
                        <DetailRow label="Exit URL" value={v.exit_url ? (() => { try { return new URL(v.exit_url).pathname; } catch { return v.exit_url; } })() : null} highlight />
                        <DetailRow label="Nav Type" value={v.nav_type} />
                        <DetailRow label="Pages Visited" value={v.pages_visited?.length || 0} highlight />
                        {v.pages_visited && v.pages_visited.length > 0 && (
                          <div className="mt-1 text-[10px] text-muted-foreground">
                            {v.pages_visited.map((p, i) => (
                              <span key={i}>
                                <span className="text-primary">{p}</span>
                                {i < v.pages_visited!.length - 1 && <span className="mx-1 text-gray-600">→</span>}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Browser & System */}
                      <div className="space-y-1 p-3 rounded-lg bg-white/[0.02]">
                        <SectionLabel icon={Globe} label="Browser & System" color="text-primary" />
                        <DetailRow label="Browser" value={`${v.browser} ${v.browser_version}`} highlight />
                        <DetailRow label="OS" value={v.os} highlight />
                        <DetailRow label="Platform" value={v.platform} />
                        <DetailRow label="Language" value={v.language} highlight />
                        <DetailRow label="All Languages" value={v.all_languages?.join(', ')} />
                        <DetailRow label="Timezone" value={v.timezone} />
                        <DetailRow label="TZ Offset" value={v.tz_offset != null ? `${v.tz_offset} min` : null} />
                        <StatusDot active={v.pdf_viewer} label="PDF Viewer" />
                        <StatusDot active={v.service_worker_support} label="Service Worker" />
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
                        <DetailRow label="Orient. Changes" value={v.screen_orientation_changes} />
                      </div>

                      {/* Hardware */}
                      <div className="space-y-1 p-3 rounded-lg bg-white/[0.02]">
                        <SectionLabel icon={Cpu} label="Hardware" color="text-emerald-400" />
                        <DetailRow label="Device Memory" value={v.device_memory ? `${v.device_memory} GB` : null} highlight />
                        <DetailRow label="CPU Cores" value={v.cpu_cores} highlight />
                        <DetailRow label="Touch Points" value={v.max_touch_points} />
                        <DetailRow label="GPU Vendor" value={v.gpu_vendor} />
                        <DetailRow label="GPU Renderer" value={v.gpu_renderer ? (v.gpu_renderer.length > 45 ? v.gpu_renderer.slice(0, 42) + '...' : v.gpu_renderer) : null} />
                        <DetailRow label="JS Heap" value={v.js_heap_size ? `${v.js_heap_size} MB` : null} />
                        <DetailRow label="Storage Quota" value={v.storage_quota ? `${Math.round(v.storage_quota / 1024 / 1024)} MB` : null} />
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <StatusDot active={v.touch_support} label="Touch" />
                          <StatusDot active={v.has_camera} label="Camera" />
                          <StatusDot active={v.has_microphone} label="Mic" />
                        </div>
                      </div>

                      {/* Network & Battery */}
                      <div className="space-y-1 p-3 rounded-lg bg-white/[0.02]">
                        <SectionLabel icon={Wifi} label="Network & Power" color="text-cyan-400" />
                        <DetailRow label="Connection" value={v.connection_type} highlight />
                        <DetailRow label="Downlink" value={v.downlink ? `${v.downlink} Mbps` : null} />
                        <DetailRow label="Battery" value={v.battery_level != null ? `${v.battery_level}%` : null} highlight />
                        <DetailRow label="Charging" value={v.battery_charging != null ? (v.battery_charging ? 'Yes ⚡' : 'No') : null} />
                        <DetailRow label="Page Load" value={v.page_load_time ? `${v.page_load_time} ms` : null} highlight />
                        <DetailRow label="DOM Loaded" value={v.dom_load_time ? `${v.dom_load_time} ms` : null} />
                        {(v.country || v.city) && <DetailRow label="Location" value={[v.city, v.country].filter(Boolean).join(', ')} highlight />}
                        <DetailRow label="IP Address" value={v.ip_address} highlight />
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
