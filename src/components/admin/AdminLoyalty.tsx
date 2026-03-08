import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Gift, Award, TrendingUp, Users } from 'lucide-react';

export default function AdminLoyalty() {
  const [points, setPoints] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('loyalty_points').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('referrals').select('*').order('created_at', { ascending: false }).limit(100),
    ]).then(([pointsRes, referralsRes]) => {
      if (pointsRes.data) setPoints(pointsRes.data);
      if (referralsRes.data) setReferrals(referralsRes.data);
      setIsLoading(false);
    });
  }, []);

  // Aggregate points per user
  const userPoints: Record<string, number> = {};
  points.forEach(p => { userPoints[p.user_id] = (userPoints[p.user_id] || 0) + p.points; });
  const topUsers = Object.entries(userPoints).sort(([, a], [, b]) => b - a).slice(0, 10);
  const totalPointsIssued = points.reduce((sum, p) => sum + p.points, 0);
  const completedReferrals = referrals.filter(r => r.status === 'completed').length;

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Points Issued', value: totalPointsIssued.toLocaleString(), icon: Award, color: 'text-primary' },
          { label: 'Active Users', value: Object.keys(userPoints).length, icon: Users, color: 'text-blue-400' },
          { label: 'Total Referrals', value: referrals.length, icon: Gift, color: 'text-accent' },
          { label: 'Completed Referrals', value: completedReferrals, icon: TrendingUp, color: 'text-emerald-400' },
        ].map((s, i) => (
          <Card key={i} className="border-0 shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <s.icon className={`w-5 h-5 ${s.color}`} />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top Loyalty Users */}
        <Card className="border-0 shadow-card">
          <CardContent className="p-4">
            <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-primary" /> Top Loyalty Members</h3>
            {topUsers.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No loyalty data yet</p>
            ) : (
              <div className="space-y-2">
                {topUsers.map(([userId, pts], i) => (
                  <div key={userId} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-500 text-white' : i === 1 ? 'bg-gray-400 text-white' : i === 2 ? 'bg-amber-700 text-white' : 'bg-muted text-muted-foreground'}`}>{i + 1}</span>
                      <span className="text-xs text-muted-foreground font-mono">{userId.slice(0, 12)}...</span>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-0 text-xs">{pts} pts</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Referrals */}
        <Card className="border-0 shadow-card">
          <CardContent className="p-4">
            <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2"><Gift className="w-4 h-4 text-accent" /> Recent Referrals</h3>
            {referrals.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No referrals yet</p>
            ) : (
              <div className="space-y-2">
                {referrals.slice(0, 10).map(r => (
                  <div key={r.id} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-xs text-foreground">{r.referred_email}</p>
                      <p className="text-[10px] text-muted-foreground">Code: {r.referral_code}</p>
                    </div>
                    <Badge className={`text-[10px] border-0 ${r.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : r.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-muted text-muted-foreground'}`}>
                      {r.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-card">
        <CardContent className="p-4">
          <h3 className="font-bold text-sm text-foreground mb-3">Recent Points Activity</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left p-2 text-muted-foreground">User</th>
                  <th className="text-left p-2 text-muted-foreground">Action</th>
                  <th className="text-left p-2 text-muted-foreground">Points</th>
                  <th className="text-left p-2 text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {points.slice(0, 20).map(p => (
                  <tr key={p.id} className="border-b border-border/10">
                    <td className="p-2 font-mono text-muted-foreground">{p.user_id.slice(0, 12)}...</td>
                    <td className="p-2 text-foreground">{p.action}</td>
                    <td className="p-2"><Badge className="bg-primary/10 text-primary border-0 text-[10px]">+{p.points}</Badge></td>
                    <td className="p-2 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
