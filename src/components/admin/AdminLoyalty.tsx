import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Gift, Award, TrendingUp, Users, Plus, ArrowUpCircle, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { logAdminAction } from '@/lib/activityLogger';

const TIERS = [
  { name: 'Explorer', min: 0, max: 199, color: 'text-muted-foreground', bg: 'bg-muted' },
  { name: 'Bronze', min: 200, max: 499, color: 'text-amber-700', bg: 'bg-amber-700/10' },
  { name: 'Silver', min: 500, max: 999, color: 'text-gray-400', bg: 'bg-gray-400/10' },
  { name: 'Gold', min: 1000, max: 1999, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { name: 'Platinum', min: 2000, max: Infinity, color: 'text-primary', bg: 'bg-primary/10' },
];

function getTier(pts: number) {
  return TIERS.find(t => pts >= t.min && pts <= t.max) || TIERS[0];
}

export default function AdminLoyalty() {
  const { toast } = useToast();
  const [points, setPoints] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgrader, setShowUpgrader] = useState(false);
  const [upgradeUserId, setUpgradeUserId] = useState('');
  const [upgradePoints, setUpgradePoints] = useState('100');
  const [upgradeReason, setUpgradeReason] = useState('admin_bonus');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    const [pointsRes, referralsRes, profilesRes] = await Promise.all([
      supabase.from('loyalty_points').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('referrals').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('profiles').select('id, full_name'),
    ]);
    if (pointsRes.data) setPoints(pointsRes.data);
    if (referralsRes.data) setReferrals(referralsRes.data);
    if (profilesRes.data) {
      const map: Record<string, string> = {};
      profilesRes.data.forEach((p: any) => { map[p.id] = p.full_name || p.id.slice(0, 12); });
      setProfiles(map);
    }
    setIsLoading(false);
  };

  const userPoints: Record<string, number> = {};
  points.forEach(p => { userPoints[p.user_id] = (userPoints[p.user_id] || 0) + p.points; });
  const topUsers = Object.entries(userPoints).sort(([, a], [, b]) => b - a).slice(0, 10);
  const totalPointsIssued = points.reduce((sum, p) => sum + p.points, 0);
  const completedReferrals = referrals.filter(r => r.status === 'completed').length;

  const handleAddPoints = async () => {
    if (!upgradeUserId.trim() || !upgradePoints) return;
    setIsAdding(true);
    const { error } = await supabase.from('loyalty_points').insert({
      user_id: upgradeUserId.trim(),
      points: parseInt(upgradePoints),
      action: upgradeReason,
      description: `Admin awarded ${upgradePoints} points (${upgradeReason})`,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Points Added!', description: `${upgradePoints} pts awarded` });
      logAdminAction('add_points', 'loyalty', upgradeUserId, { points: upgradePoints, reason: upgradeReason });
      setShowUpgrader(false);
      setUpgradeUserId('');
      fetchAll();
    }
    setIsAdding(false);
  };

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-5">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2"><Gift className="w-5 h-5 text-primary" /> Loyalty & Referrals</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={fetchAll}><RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh</Button>
          <Button size="sm" onClick={() => setShowUpgrader(true)}><ArrowUpCircle className="w-3.5 h-3.5 mr-1" /> Award Points</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Points Issued', value: totalPointsIssued.toLocaleString(), icon: Award, color: 'text-primary' },
          { label: 'Active Members', value: Object.keys(userPoints).length, icon: Users, color: 'text-blue-400' },
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
        {/* Top Loyalty Users with Tiers */}
        <Card className="border-0 shadow-card">
          <CardContent className="p-4">
            <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-primary" /> Top Members & Tiers</h3>
            {topUsers.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No loyalty data yet</p>
            ) : (
              <div className="space-y-2">
                {topUsers.map(([userId, pts], i) => {
                  const tier = getTier(pts);
                  return (
                    <div key={userId} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-500 text-white' : i === 1 ? 'bg-gray-400 text-white' : i === 2 ? 'bg-amber-700 text-white' : 'bg-muted text-muted-foreground'}`}>{i + 1}</span>
                        <span className="text-xs text-foreground">{profiles[userId] || userId.slice(0, 12)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${tier.bg} ${tier.color} border-0 text-[10px]`}>{tier.name}</Badge>
                        <Badge className="bg-primary/10 text-primary border-0 text-xs">{pts} pts</Badge>
                      </div>
                    </div>
                  );
                })}
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
                      <p className="text-[10px] text-muted-foreground">By: {profiles[r.referrer_id] || r.referrer_id.slice(0, 12)} • Code: {r.referral_code}</p>
                    </div>
                    <Badge className={`text-[10px] border-0 ${r.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
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
                  <th className="text-left p-2 text-muted-foreground">Description</th>
                  <th className="text-left p-2 text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {points.slice(0, 20).map(p => (
                  <tr key={p.id} className="border-b border-border/10 hover:bg-muted/10">
                    <td className="p-2 text-foreground">{profiles[p.user_id] || p.user_id.slice(0, 12)}</td>
                    <td className="p-2 text-foreground capitalize">{p.action.replace(/_/g, ' ')}</td>
                    <td className="p-2"><Badge className="bg-primary/10 text-primary border-0 text-[10px]">+{p.points}</Badge></td>
                    <td className="p-2 text-muted-foreground max-w-[200px] truncate">{p.description || '—'}</td>
                    <td className="p-2 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Award Points Dialog */}
      <Dialog open={showUpgrader} onOpenChange={setShowUpgrader}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><ArrowUpCircle className="w-5 h-5 text-primary" /> Award Loyalty Points</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Select User</label>
              <select value={upgradeUserId} onChange={e => setUpgradeUserId(e.target.value)} className="w-full mt-1 h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm">
                <option value="">Select a user...</option>
                {Object.entries(profiles).map(([id, name]) => (
                  <option key={id} value={id}>{name} ({id.slice(0, 8)})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Points to Award</label>
              <Input type="number" min="1" max="10000" value={upgradePoints} onChange={e => setUpgradePoints(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Reason</label>
              <select value={upgradeReason} onChange={e => setUpgradeReason(e.target.value)} className="w-full mt-1 h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm">
                <option value="admin_bonus">Admin Bonus</option>
                <option value="tier_upgrade">Tier Upgrade</option>
                <option value="compensation">Compensation</option>
                <option value="promotion">Promotional Reward</option>
                <option value="referral_bonus">Referral Bonus</option>
              </select>
            </div>
            {upgradeUserId && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Current: <strong className="text-foreground">{userPoints[upgradeUserId] || 0} pts</strong> ({getTier(userPoints[upgradeUserId] || 0).name})</p>
                <p className="text-xs text-muted-foreground">After: <strong className="text-primary">{(userPoints[upgradeUserId] || 0) + parseInt(upgradePoints || '0')} pts</strong> ({getTier((userPoints[upgradeUserId] || 0) + parseInt(upgradePoints || '0')).name})</p>
              </div>
            )}
            <Button className="w-full" onClick={handleAddPoints} disabled={!upgradeUserId || isAdding}>
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Award {upgradePoints} Points
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
