import { useState, useEffect } from 'react';
import { 
  Loader2, Search, Shield, User, Mail, Calendar, RefreshCw, UserPlus, UserMinus,
  Ban, ShieldOff, Clock, Activity, AlertTriangle, Skull, Eye, LogOut, Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { usersApi } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { logAdminAction } from '@/lib/activityLogger';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  role: 'admin' | 'user';
}

interface UserBan {
  id: string;
  user_id: string;
  reason: string;
  ban_type: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [userBans, setUserBans] = useState<UserBan[]>([]);
  const [banReason, setBanReason] = useState('');
  const [banType, setBanType] = useState('suspended');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userSessions, setUserSessions] = useState<any[]>([]);
  const [userActivity, setUserActivity] = useState<any[]>([]);
  const [viewingUser, setViewingUser] = useState<UserData | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [usersRes, bansRes] = await Promise.all([
      usersApi.getAll(),
      supabase.from('user_bans').select('*').eq('is_active', true),
    ]);
    if (!usersRes.error && usersRes.data) setUsers(usersRes.data as UserData[]);
    if (bansRes.data) setUserBans(bansRes.data as UserBan[]);
    setIsLoading(false);
  };

  const toggleAdminRole = async (userId: string, currentlyAdmin: boolean) => {
    if (currentlyAdmin) {
      const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
      if (error) toast({ title: 'Error', description: 'Failed to remove admin role', variant: 'destructive' });
      else {
        logAdminAction('remove_admin', 'user_roles', userId);
        toast({ title: '⚡ Done', description: 'Admin role removed' });
        fetchData();
      }
    } else {
      const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
      if (error) toast({ title: 'Error', description: 'Failed to add admin role', variant: 'destructive' });
      else {
        logAdminAction('grant_admin', 'user_roles', userId);
        toast({ title: '⚡ Done', description: 'Admin role granted' });
        fetchData();
      }
    }
  };

  const banUser = async (userId: string) => {
    if (!banReason.trim()) {
      toast({ title: 'Error', description: 'Provide a reason for the ban', variant: 'destructive' });
      return;
    }
    const { error } = await supabase.from('user_bans').insert({
      user_id: userId,
      reason: banReason,
      ban_type: banType,
      is_active: true,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      logAdminAction('ban_user', 'user_bans', userId, { reason: banReason, type: banType });
      toast({ title: '🚫 User Banned', description: `User has been ${banType}` });
      setBanReason('');
      setSelectedUser(null);
      fetchData();
    }
  };

  const unbanUser = async (banId: string, userId: string) => {
    await supabase.from('user_bans').update({ is_active: false }).eq('id', banId);
    logAdminAction('unban_user', 'user_bans', userId);
    toast({ title: '✅ Ban Lifted', description: 'User ban removed' });
    fetchData();
  };

  const forceLogout = async (userId: string) => {
    await supabase.from('user_sessions').update({ is_active: false, ended_at: new Date().toISOString() }).eq('user_id', userId).eq('is_active', true);
    logAdminAction('force_logout', 'user_sessions', userId);
    toast({ title: '🔒 Force Logout', description: 'All user sessions terminated' });
  };

  const viewUserDetails = async (user: UserData) => {
    setViewingUser(user);
    const [sessionsRes, activityRes] = await Promise.all([
      supabase.from('user_sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('activity_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
    ]);
    if (sessionsRes.data) setUserSessions(sessionsRes.data);
    if (activityRes.data) setUserActivity(activityRes.data);
  };

  const isUserBanned = (userId: string) => userBans.some(b => b.user_id === userId && b.is_active);
  const getUserBan = (userId: string) => userBans.find(b => b.user_id === userId && b.is_active);

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  const adminCount = users.filter(u => u.role === 'admin').length;
  const bannedCount = users.filter(u => isUserBanned(u.id)).length;

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: users.length, color: 'from-primary/5 to-primary/10', icon: User },
          { label: 'Admins', value: adminCount, color: 'from-accent/5 to-accent/10', icon: Shield },
          { label: 'Regular', value: users.length - adminCount, color: 'from-emerald-500/5 to-emerald-500/10', icon: User },
          { label: 'Banned', value: bannedCount, color: 'from-red-500/5 to-red-500/10', icon: Ban },
        ].map((s, i) => (
          <Card key={i} className={`border-0 shadow-card bg-gradient-to-br ${s.color}`}>
            <CardContent className="p-4 text-center">
              <s.icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} className="h-9 gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* User Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">No users found</div>
        ) : (
          filteredUsers.map((user) => {
            const isAdmin = user.role === 'admin';
            const banned = isUserBanned(user.id);
            const ban = getUserBan(user.id);
            return (
              <Card key={user.id} className={`border-0 shadow-card hover:shadow-lg transition-shadow ${banned ? 'ring-1 ring-red-500/30 bg-red-500/[0.02]' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 ${
                      banned ? 'bg-red-500/20' : 'bg-gradient-to-br from-primary/20 to-primary/10'
                    }`}>
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : banned ? (
                        <Ban className="w-5 h-5 text-red-400" />
                      ) : (
                        <span className="text-sm font-bold text-primary">{(user.full_name || user.email)?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm text-foreground truncate">{user.full_name || 'Unnamed'}</p>
                        <Badge variant={isAdmin ? 'default' : 'secondary'} className="text-[10px] h-5 flex-shrink-0">
                          {isAdmin ? <><Shield className="w-3 h-3 mr-0.5" /> Admin</> : 'User'}
                        </Badge>
                        {banned && (
                          <Badge variant="destructive" className="text-[10px] h-5 animate-pulse">
                            <Ban className="w-3 h-3 mr-0.5" /> {ban?.ban_type}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                      {user.phone && <p className="text-xs text-muted-foreground">{user.phone}</p>}
                    </div>
                  </div>

                  {banned && ban && (
                    <div className="mt-2 p-2 rounded-lg bg-red-500/[0.05] border border-red-500/10">
                      <p className="text-[10px] text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {ban.reason}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="text-[11px] text-muted-foreground">
                      <p className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-1">
                      {/* View Details */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => viewUserDetails(user)}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Activity className="w-5 h-5 text-primary" />
                              User Intelligence: {viewingUser?.full_name || viewingUser?.email}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            {/* Sessions */}
                            <div>
                              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-cyan-400" /> Sessions ({userSessions.length})
                              </h4>
                              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                                {userSessions.map((s: any) => (
                                  <div key={s.id} className="flex items-center justify-between p-2 rounded bg-muted/30 text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className={`w-2 h-2 rounded-full ${s.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
                                      <span>{s.browser} / {s.os}</span>
                                      <span className="text-muted-foreground">{s.device_type}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      {s.country && <span>{s.country}</span>}
                                      <span className="font-mono text-[10px]">{s.ip_address}</span>
                                    </div>
                                  </div>
                                ))}
                                {userSessions.length === 0 && <p className="text-muted-foreground text-center py-4 text-sm">No sessions</p>}
                              </div>
                            </div>
                            {/* Activity */}
                            <div>
                              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-amber-400" /> Activity Log ({userActivity.length})
                              </h4>
                              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                                {userActivity.map((a: any) => (
                                  <div key={a.id} className="flex items-center justify-between p-2 rounded bg-muted/30 text-xs">
                                    <div>
                                      <span className="font-medium">{a.action}</span>
                                      <span className="text-muted-foreground ml-2">{a.entity_type}</span>
                                    </div>
                                    <span className="text-muted-foreground text-[10px]">{new Date(a.created_at).toLocaleString()}</span>
                                  </div>
                                ))}
                                {userActivity.length === 0 && <p className="text-muted-foreground text-center py-4 text-sm">No activity</p>}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* Force Logout */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-orange-400 hover:text-orange-300">
                            <LogOut className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>⚡ Force Logout?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Terminate all active sessions for {user.full_name || user.email}. They'll need to log in again.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => forceLogout(user.id)}>Force Logout</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {/* Ban / Unban */}
                      {banned ? (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-emerald-400" onClick={() => ban && unbanUser(ban.id, user.id)}>
                          Unban
                        </Button>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-300" onClick={() => setSelectedUser(user)}>
                              <Skull className="w-3.5 h-3.5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Ban className="w-5 h-5 text-red-400" /> Ban User: {user.full_name || user.email}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3 mt-2">
                              <Select value={banType} onValueChange={setBanType}>
                                <SelectTrigger className="h-9 text-sm">
                                  <SelectValue placeholder="Ban type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="suspended">⏸️ Suspended (Temporary)</SelectItem>
                                  <SelectItem value="banned">🚫 Banned (Permanent)</SelectItem>
                                  <SelectItem value="restricted">🔒 Restricted (Limited Access)</SelectItem>
                                </SelectContent>
                              </Select>
                              <Textarea 
                                placeholder="Reason for ban..." 
                                value={banReason} 
                                onChange={e => setBanReason(e.target.value)}
                                className="h-20"
                              />
                              <Button variant="destructive" className="w-full gap-2" onClick={() => banUser(user.id)}>
                                <Flame className="w-4 h-4" /> Execute Ban
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {/* Toggle Admin */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant={isAdmin ? 'destructive' : 'outline'} size="sm" className="text-xs h-7 gap-1">
                            {isAdmin ? <><UserMinus className="w-3 h-3" /></> : <><UserPlus className="w-3 h-3" /></>}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{isAdmin ? 'Remove Admin?' : 'Grant Admin?'}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {isAdmin ? `Remove admin privileges from ${user.full_name || user.email}.` : `Grant full admin access to ${user.full_name || user.email}.`}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => toggleAdminRole(user.id, isAdmin)}>
                              {isAdmin ? 'Remove' : 'Grant'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
