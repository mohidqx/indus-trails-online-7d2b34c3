import { useState, useEffect } from 'react';
import { 
  Shield, Power, AlertTriangle, Bell, Lock, Unlock, RefreshCw, Loader2, 
  Skull, Zap, Eye, EyeOff, Globe, Ban, ToggleLeft, ToggleRight,
  Volume2, VolumeX, UserX, Wifi, WifiOff, Settings, Flame, Terminal
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { logAdminAction } from '@/lib/activityLogger';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface SiteSettingValue {
  enabled: boolean;
  message?: string;
  password?: string;
  type?: string;
  dismissible?: boolean;
}

interface BannedIP {
  id: string;
  ip_address: string;
  reason: string | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface UserBan {
  id: string;
  user_id: string;
  reason: string;
  ban_type: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export default function AdminSiteControl() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<Record<string, SiteSettingValue>>({});
  const [bannedIPs, setBannedIPs] = useState<BannedIP[]>([]);
  const [userBans, setUserBans] = useState<UserBan[]>([]);
  const [newIP, setNewIP] = useState('');
  const [newIPReason, setNewIPReason] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [announcementType, setAnnouncementType] = useState('info');
  const [maintenanceMsg, setMaintenanceMsg] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    const [settingsRes, ipsRes, bansRes] = await Promise.all([
      supabase.from('site_settings').select('*'),
      supabase.from('banned_ips').select('*').order('created_at', { ascending: false }),
      supabase.from('user_bans').select('*').eq('is_active', true).order('created_at', { ascending: false }),
    ]);

    if (settingsRes.data) {
      const s: Record<string, SiteSettingValue> = {};
      settingsRes.data.forEach((row: any) => {
        s[row.key] = row.value as SiteSettingValue;
      });
      setSettings(s);
      setAnnouncementMsg(s.announcement_banner?.message || '');
      setAnnouncementType(s.announcement_banner?.type || 'info');
      setMaintenanceMsg(s.maintenance_mode?.message || '');
    }
    if (ipsRes.data) setBannedIPs(ipsRes.data as BannedIP[]);
    if (bansRes.data) setUserBans(bansRes.data as UserBan[]);
    setIsLoading(false);
  };

  const updateSetting = async (key: string, value: SiteSettingValue) => {
    const { error } = await supabase
      .from('site_settings')
      .update({ value: value as any, updated_at: new Date().toISOString() })
      .eq('key', key);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setSettings(prev => ({ ...prev, [key]: value }));
      logAdminAction('update_setting', 'site_settings', undefined, { key, value });
      toast({ title: '⚡ Setting Updated', description: `${key} has been updated` });
    }
  };

  const toggleMaintenance = () => {
    const current = settings.maintenance_mode || { enabled: false, message: '' };
    updateSetting('maintenance_mode', { ...current, enabled: !current.enabled, message: maintenanceMsg });
  };

  const toggleLockdown = () => {
    const current = settings.site_lockdown || { enabled: false, password: '' };
    updateSetting('site_lockdown', { ...current, enabled: !current.enabled });
  };

  const toggleRegistration = () => {
    const current = settings.registration_enabled || { enabled: true };
    updateSetting('registration_enabled', { enabled: !current.enabled });
  };

  const saveAnnouncement = () => {
    updateSetting('announcement_banner', {
      enabled: settings.announcement_banner?.enabled || false,
      message: announcementMsg,
      type: announcementType,
      dismissible: true,
    });
  };

  const toggleAnnouncement = () => {
    const current = settings.announcement_banner || { enabled: false, message: '', type: 'info', dismissible: true };
    updateSetting('announcement_banner', { ...current, enabled: !current.enabled, message: announcementMsg, type: announcementType });
  };

  const banIP = async () => {
    if (!newIP.trim()) return;
    const { error } = await supabase.from('banned_ips').insert({
      ip_address: newIP.trim(),
      reason: newIPReason || 'Blocked by admin',
      is_active: true,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      logAdminAction('ban_ip', 'banned_ips', undefined, { ip: newIP, reason: newIPReason });
      toast({ title: '🚫 IP Blocked', description: `${newIP} has been blacklisted` });
      setNewIP('');
      setNewIPReason('');
      fetchAll();
    }
  };

  const unbanIP = async (id: string, ip: string) => {
    await supabase.from('banned_ips').update({ is_active: false }).eq('id', id);
    logAdminAction('unban_ip', 'banned_ips', id, { ip });
    toast({ title: 'IP Unblocked', description: `${ip} removed from blacklist` });
    fetchAll();
  };

  const liftUserBan = async (id: string) => {
    await supabase.from('user_bans').update({ is_active: false }).eq('id', id);
    toast({ title: 'Ban Lifted', description: 'User ban has been removed' });
    fetchAll();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const isMaintenanceOn = settings.maintenance_mode?.enabled || false;
  const isLockdownOn = settings.site_lockdown?.enabled || false;
  const isRegistrationOn = settings.registration_enabled?.enabled !== false;
  const isAnnouncementOn = settings.announcement_banner?.enabled || false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/10 flex items-center justify-center">
          <Skull className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            God Mode <Badge className="bg-red-500/20 text-red-400 text-[10px]">ULTRA</Badge>
          </h2>
          <p className="text-xs text-muted-foreground">Full site control. Use with extreme caution.</p>
        </div>
        <div className="ml-auto">
          <Button variant="outline" size="sm" onClick={fetchAll} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Reload
          </Button>
        </div>
      </div>

      {/* Kill Switches */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Maintenance Mode */}
        <Card className={`border-0 ${isMaintenanceOn ? 'bg-gradient-to-br from-red-500/10 to-red-500/5 ring-1 ring-red-500/30' : 'bg-white/[0.02]'}`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isMaintenanceOn ? 'bg-red-500/20' : 'bg-white/[0.05]'}`}>
                  <Power className={`w-5 h-5 ${isMaintenanceOn ? 'text-red-400' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Maintenance Mode</p>
                  <p className="text-[10px] text-muted-foreground">Kill switch — takes site offline</p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant={isMaintenanceOn ? 'destructive' : 'outline'} size="sm" className="gap-1.5">
                    {isMaintenanceOn ? <><WifiOff className="w-3.5 h-3.5" /> ACTIVE</> : <><Wifi className="w-3.5 h-3.5" /> OFF</>}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      {isMaintenanceOn ? 'Disable Maintenance?' : '⚠️ Enable Maintenance Mode?'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {isMaintenanceOn 
                        ? 'This will bring the site back online for all visitors.' 
                        : 'This will immediately take the site offline. All visitors will see the maintenance page.'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={toggleMaintenance}>
                      {isMaintenanceOn ? 'Bring Online' : 'Take Offline'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <Textarea 
              placeholder="Maintenance message shown to visitors..." 
              value={maintenanceMsg} 
              onChange={e => setMaintenanceMsg(e.target.value)}
              className="text-xs h-16 bg-black/20 border-white/10"
            />
            {isMaintenanceOn && (
              <div className="mt-2 flex items-center gap-2 text-[10px] text-red-400 animate-pulse">
                <Flame className="w-3 h-3" /> SITE IS CURRENTLY OFFLINE
              </div>
            )}
          </CardContent>
        </Card>

        {/* Site Lockdown */}
        <Card className={`border-0 ${isLockdownOn ? 'bg-gradient-to-br from-orange-500/10 to-orange-500/5 ring-1 ring-orange-500/30' : 'bg-white/[0.02]'}`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isLockdownOn ? 'bg-orange-500/20' : 'bg-white/[0.05]'}`}>
                  {isLockdownOn ? <Lock className="w-5 h-5 text-orange-400" /> : <Unlock className="w-5 h-5 text-muted-foreground" />}
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Site Lockdown</p>
                  <p className="text-[10px] text-muted-foreground">Password-protect entire site</p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant={isLockdownOn ? 'destructive' : 'outline'} size="sm" className="gap-1.5">
                    {isLockdownOn ? <><Lock className="w-3.5 h-3.5" /> LOCKED</> : <><Unlock className="w-3.5 h-3.5" /> OPEN</>}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{isLockdownOn ? 'Unlock Site?' : '🔒 Lock Down Site?'}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {isLockdownOn ? 'Site will be accessible to everyone again.' : 'Only authenticated admins can access the site.'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={toggleLockdown}>
                      {isLockdownOn ? 'Unlock' : 'Lock Down'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            {isLockdownOn && (
              <div className="flex items-center gap-2 text-[10px] text-orange-400 animate-pulse">
                <Shield className="w-3 h-3" /> SITE IS LOCKED — Only admins can enter
              </div>
            )}
          </CardContent>
        </Card>

        {/* Registration Control */}
        <Card className={`border-0 ${!isRegistrationOn ? 'bg-gradient-to-br from-purple-500/10 to-purple-500/5 ring-1 ring-purple-500/30' : 'bg-white/[0.02]'}`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${!isRegistrationOn ? 'bg-purple-500/20' : 'bg-white/[0.05]'}`}>
                  <UserX className={`w-5 h-5 ${!isRegistrationOn ? 'text-purple-400' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">User Registration</p>
                  <p className="text-[10px] text-muted-foreground">
                    {isRegistrationOn ? 'New users can sign up' : 'Registration is CLOSED'}
                  </p>
                </div>
              </div>
              <Button variant={!isRegistrationOn ? 'destructive' : 'outline'} size="sm" onClick={toggleRegistration} className="gap-1.5">
                {isRegistrationOn ? <><ToggleRight className="w-4 h-4" /> ON</> : <><ToggleLeft className="w-4 h-4" /> OFF</>}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Announcement Banner */}
        <Card className={`border-0 ${isAnnouncementOn ? 'bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 ring-1 ring-cyan-500/30' : 'bg-white/[0.02]'}`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isAnnouncementOn ? 'bg-cyan-500/20' : 'bg-white/[0.05]'}`}>
                  {isAnnouncementOn ? <Volume2 className="w-5 h-5 text-cyan-400" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Announcement</p>
                  <p className="text-[10px] text-muted-foreground">Show banner on all pages</p>
                </div>
              </div>
              <Button variant={isAnnouncementOn ? 'default' : 'outline'} size="sm" onClick={toggleAnnouncement} className="gap-1.5">
                {isAnnouncementOn ? <><Bell className="w-3.5 h-3.5" /> LIVE</> : <><Bell className="w-3.5 h-3.5" /> OFF</>}
              </Button>
            </div>
            <div className="space-y-2">
              <Input 
                placeholder="Announcement message..." 
                value={announcementMsg} 
                onChange={e => setAnnouncementMsg(e.target.value)}
                className="text-xs h-9 bg-black/20 border-white/10"
              />
              <div className="flex gap-2">
                <Select value={announcementType} onValueChange={setAnnouncementType}>
                  <SelectTrigger className="h-8 text-xs bg-black/20 border-white/10 flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">ℹ️ Info</SelectItem>
                    <SelectItem value="warning">⚠️ Warning</SelectItem>
                    <SelectItem value="success">✅ Success</SelectItem>
                    <SelectItem value="danger">🔴 Danger</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" onClick={saveAnnouncement} className="h-8 text-xs">Save</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IP Blacklist */}
      <Card className="border-0 bg-white/[0.02]">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Ban className="w-5 h-5 text-red-400" />
            <div>
              <p className="font-semibold text-sm text-foreground">IP Blacklist</p>
              <p className="text-[10px] text-muted-foreground">Block suspicious IP addresses from accessing the site</p>
            </div>
            <Badge variant="outline" className="ml-auto text-[10px] border-red-500/20 text-red-400">
              {bannedIPs.filter(ip => ip.is_active).length} blocked
            </Badge>
          </div>

          <div className="flex gap-2 mb-4">
            <Input 
              placeholder="Enter IP address (e.g. 192.168.1.1)" 
              value={newIP} 
              onChange={e => setNewIP(e.target.value)}
              className="text-xs h-9 bg-black/20 border-white/10 font-mono flex-1"
            />
            <Input 
              placeholder="Reason..." 
              value={newIPReason} 
              onChange={e => setNewIPReason(e.target.value)}
              className="text-xs h-9 bg-black/20 border-white/10 flex-1"
            />
            <Button size="sm" variant="destructive" onClick={banIP} className="h-9 gap-1.5">
              <Ban className="w-3.5 h-3.5" /> Block
            </Button>
          </div>

          <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
            {bannedIPs.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-6">No blocked IPs</p>
            ) : (
              bannedIPs.map(ip => (
                <div key={ip.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                  ip.is_active ? 'border-red-500/20 bg-red-500/[0.03]' : 'border-white/[0.03] bg-white/[0.01] opacity-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${ip.is_active ? 'bg-red-400 animate-pulse' : 'bg-gray-600'}`} />
                    <div>
                      <span className="font-mono text-sm text-foreground">{ip.ip_address}</span>
                      {ip.reason && <p className="text-[10px] text-muted-foreground">{ip.reason}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{new Date(ip.created_at).toLocaleDateString()}</span>
                    {ip.is_active && (
                      <Button size="sm" variant="ghost" onClick={() => unbanIP(ip.id, ip.ip_address)} className="h-7 text-xs text-emerald-400 hover:text-emerald-300">
                        Unblock
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active User Bans */}
      <Card className="border-0 bg-white/[0.02]">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <UserX className="w-5 h-5 text-orange-400" />
            <div>
              <p className="font-semibold text-sm text-foreground">Active User Bans</p>
              <p className="text-[10px] text-muted-foreground">Currently suspended or banned users</p>
            </div>
            <Badge variant="outline" className="ml-auto text-[10px] border-orange-500/20 text-orange-400">
              {userBans.length} active
            </Badge>
          </div>
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
            {userBans.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-6">No active bans — all clear 🟢</p>
            ) : (
              userBans.map(ban => (
                <div key={ban.id} className="flex items-center justify-between p-3 rounded-lg border border-orange-500/20 bg-orange-500/[0.03]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-foreground">{ban.user_id.slice(0, 8)}...</span>
                      <Badge variant="destructive" className="text-[9px] h-4">{ban.ban_type}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{ban.reason}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => liftUserBan(ban.id)} className="h-7 text-xs text-emerald-400">
                    Lift Ban
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Status Footer */}
      <div className="flex items-center gap-4 p-3 rounded-lg bg-black/30 border border-white/[0.03]">
        <Terminal className="w-4 h-4 text-emerald-400" />
        <div className="flex gap-4 text-[10px] text-muted-foreground font-mono">
          <span>MAINTENANCE: <span className={isMaintenanceOn ? 'text-red-400' : 'text-emerald-400'}>{isMaintenanceOn ? 'ON' : 'OFF'}</span></span>
          <span>LOCKDOWN: <span className={isLockdownOn ? 'text-red-400' : 'text-emerald-400'}>{isLockdownOn ? 'ON' : 'OFF'}</span></span>
          <span>REGISTRATION: <span className={isRegistrationOn ? 'text-emerald-400' : 'text-red-400'}>{isRegistrationOn ? 'OPEN' : 'CLOSED'}</span></span>
          <span>BANNED IPs: <span className="text-orange-400">{bannedIPs.filter(i => i.is_active).length}</span></span>
          <span>USER BANS: <span className="text-orange-400">{userBans.length}</span></span>
        </div>
      </div>
    </div>
  );
}
