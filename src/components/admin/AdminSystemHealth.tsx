import { useState, useEffect } from 'react';
import { Server, Zap, Database, Clock, AlertCircle, CheckCircle, Activity, Wifi, HardDrive, RefreshCw, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const TABLES = ['tours', 'bookings', 'destinations', 'vehicles', 'hotels', 'deals', 'feedback', 'profiles', 'visitor_logs', 'activity_logs', 'login_attempts', 'user_sessions', 'wishlists', 'user_notifications', 'contact_messages', 'loyalty_points', 'referrals', 'pricing_rules', 'abandoned_bookings'] as const;
const EDGE_FNS = ['api-tours', 'api-deals', 'api-destinations', 'api-vehicles', 'api-bookings', 'api-stats', 'track-visitor', 'create-booking', 'ai-chatbot'];

export default function AdminSystemHealth() {
  const [isLoading, setIsLoading] = useState(true);
  const [dbResponseTime, setDbResponseTime] = useState(0);
  const [rowCounts, setRowCounts] = useState<Record<string, number>>({});
  const [fnStatus, setFnStatus] = useState<Record<string, 'healthy' | 'error' | 'unknown'>>({});
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [startTime] = useState(new Date());

  useEffect(() => { fetchMetrics(); }, []);

  const fetchMetrics = async () => {
    setIsLoading(true);
    const start = performance.now();

    const counts: Record<string, number> = {};
    await Promise.all(
      TABLES.map(async (table) => {
        try {
          const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
          counts[table] = count || 0;
        } catch { counts[table] = -1; }
      })
    );
    setRowCounts(counts);
    setDbResponseTime(Math.round(performance.now() - start));

    const status: Record<string, 'healthy' | 'error' | 'unknown'> = {};
    await Promise.all(
      EDGE_FNS.map(async (fn) => {
        try {
          const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${fn}`;
          const res = await fetch(url, {
            method: 'GET',
            headers: { 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
            signal: AbortSignal.timeout(5000),
          });
          status[fn] = res.ok || res.status === 401 || res.status === 400 ? 'healthy' : 'error';
        } catch { status[fn] = 'unknown'; }
      })
    );
    setFnStatus(status);
    setLastRefresh(new Date());
    setIsLoading(false);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const errorTables = Object.entries(rowCounts).filter(([, c]) => c < 0);
  const healthyFns = Object.values(fnStatus).filter(s => s === 'healthy').length;
  const totalRecords = Object.values(rowCounts).reduce((s, c) => s + (c > 0 ? c : 0), 0);
  const healthScore = Math.max(0, 100 - (errorTables.length * 10) - (dbResponseTime > 2000 ? 20 : dbResponseTime > 1000 ? 10 : 0) - ((EDGE_FNS.length - healthyFns) * 5));
  const healthColor = healthScore >= 80 ? 'text-emerald-400' : healthScore >= 50 ? 'text-yellow-400' : 'text-red-400';
  const sessionMinutes = Math.round((Date.now() - startTime.getTime()) / 60000);

  return (
    <div className="space-y-5">
      {/* Health Score */}
      <Card className="border-0 shadow-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${healthScore >= 80 ? 'bg-emerald-500/10' : healthScore >= 50 ? 'bg-yellow-500/10' : 'bg-red-500/10'}`}>
                <Server className={`w-7 h-7 ${healthColor}`} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">System Health Score</h3>
                <p className="text-[11px] text-muted-foreground">Last checked: {lastRefresh.toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-4xl font-bold font-mono ${healthColor}`}>{healthScore}%</span>
              <Button size="sm" variant="outline" onClick={fetchMetrics} className="h-8 text-xs gap-1">
                <RefreshCw className="w-3 h-3" /> Refresh
              </Button>
            </div>
          </div>
          <Progress value={healthScore} className="h-2" />
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'DB Response', value: `${dbResponseTime}ms`, icon: Zap, color: dbResponseTime < 1000 ? 'text-emerald-400' : 'text-yellow-400' },
          { label: 'Total Records', value: totalRecords.toLocaleString(), icon: Database, color: 'text-blue-400' },
          { label: 'Edge Functions', value: `${healthyFns}/${EDGE_FNS.length} OK`, icon: Globe, color: 'text-primary' },
          { label: 'Session', value: `${sessionMinutes}m active`, icon: Activity, color: 'text-emerald-400' },
        ].map((stat, i) => (
          <Card key={i} className="border-0 shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edge Functions & Table Stats */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Wifi className="w-4 h-4 text-primary" /> Backend Functions Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {Object.entries(fnStatus).map(([fn, status]) => (
              <div key={fn} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/30 transition-colors">
                <code className="text-xs text-foreground font-mono">{fn}</code>
                {status === 'healthy' ? (
                  <Badge className="text-[10px] h-5 bg-emerald-500/10 text-emerald-400 border-0 gap-1"><CheckCircle className="w-3 h-3" /> Healthy</Badge>
                ) : status === 'error' ? (
                  <Badge className="text-[10px] h-5 bg-red-500/10 text-red-400 border-0 gap-1"><AlertCircle className="w-3 h-3" /> Error</Badge>
                ) : (
                  <Badge className="text-[10px] h-5 bg-yellow-500/10 text-yellow-400 border-0 gap-1"><Clock className="w-3 h-3" /> Unknown</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-400" /> Database Tables ({TABLES.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-1.5 max-h-[350px] overflow-y-auto">
              {Object.entries(rowCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([table, count]) => (
                  <div key={table} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <code className="text-xs text-foreground font-mono">{table}</code>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{count >= 0 ? count.toLocaleString() : '—'} rows</span>
                      {count < 0 && <AlertCircle className="w-3 h-3 text-red-400" />}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" /> Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          {dbResponseTime > 1000 && (
            <div className="flex items-start gap-2 p-2 rounded-lg bg-yellow-500/5">
              <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">Database response time is {dbResponseTime}ms. Consider optimizing queries.</p>
            </div>
          )}
          {Object.entries(rowCounts).filter(([, c]) => c > 800).map(([table, count]) => (
            <div key={table} className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/5">
              <Database className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground"><code className="font-mono">{table}</code> has {count.toLocaleString()} rows. Monitor for performance.</p>
            </div>
          ))}
          {errorTables.length > 0 && errorTables.map(([table]) => (
            <div key={table} className="flex items-start gap-2 p-2 rounded-lg bg-red-500/5">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground"><code className="font-mono">{table}</code> could not be queried. Check RLS policies.</p>
            </div>
          ))}
          {errorTables.length === 0 && dbResponseTime < 1000 && (
            <div className="flex items-start gap-2 p-2 rounded-lg bg-emerald-500/5">
              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">All systems operating normally. No performance issues detected.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
