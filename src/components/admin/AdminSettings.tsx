import { useState } from 'react';
import { User, Lock, Loader2, Shield, Database, Globe, Zap, Server, HardDrive, Key, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });

  const changePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (passwords.new.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    setIsChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.new });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Success', description: 'Password updated successfully' }); setPasswords({ new: '', confirm: '' }); }
    setIsChangingPassword(false);
  };

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Account */}
      <Card className="border-0 admin-glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wider">Email</p>
              <p className="text-sm font-medium text-foreground">{user?.email}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wider">Role</p>
              <Badge variant="default" className="mt-0.5 bg-primary/20 text-primary border-primary/30"><Shield className="w-3 h-3 mr-1" /> Administrator</Badge>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] col-span-2">
              <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-wider">User ID</p>
              <p className="text-[11px] font-mono text-muted-foreground">{user?.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="border-0 admin-glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Key className="w-4 h-4 text-accent" />
            </div>
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">New Password</label>
              <Input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} placeholder="Min 6 characters" className="mt-1 bg-white/[0.02]" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Confirm Password</label>
              <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="Re-enter password" className="mt-1 bg-white/[0.02]" />
            </div>
          </div>
          <Button onClick={changePassword} disabled={isChangingPassword || !passwords.new || !passwords.confirm} size="sm" className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20">
            {isChangingPassword ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Updating...</> : <><Lock className="w-3.5 h-3.5 mr-1.5" /> Update Password</>}
          </Button>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card className="border-0 admin-glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Server className="w-4 h-4 text-blue-400" />
            </div>
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Platform', value: 'Lovable Cloud', icon: Zap, color: 'text-primary' },
              { label: 'Framework', value: 'React + Vite', icon: Globe, color: 'text-blue-400' },
              { label: 'Database', value: 'PostgreSQL', icon: Database, color: 'text-emerald-400' },
              { label: 'Storage', value: 'Cloud Storage', icon: HardDrive, color: 'text-purple-400' },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-medium text-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger */}
      <Card className="border border-destructive/10 bg-destructive/[0.02]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-destructive flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-destructive" />
            </div>
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[11px] text-muted-foreground mb-3">These actions are irreversible. Proceed with caution.</p>
          <Button variant="outline" className="border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground" size="sm">
            Export All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
