import { useState } from 'react';
import { User, Lock, Loader2, Shield, Database, Bell, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

export default function AdminSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
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
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/40">
              <p className="text-xs text-muted-foreground mb-0.5">Email</p>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40">
              <p className="text-xs text-muted-foreground mb-0.5">Role</p>
              <Badge variant="default" className="mt-0.5"><Shield className="w-3 h-3 mr-1" /> Administrator</Badge>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 col-span-2">
              <p className="text-xs text-muted-foreground mb-0.5">User ID</p>
              <p className="text-xs font-mono text-muted-foreground">{user?.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Lock className="w-4 h-4 text-accent" />
            </div>
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">New Password</label>
              <Input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} placeholder="Min 6 characters" className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Confirm Password</label>
              <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="Re-enter password" className="mt-1" />
            </div>
          </div>
          <Button onClick={changePassword} disabled={isChangingPassword || !passwords.new || !passwords.confirm} size="sm">
            {isChangingPassword ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Updating...</> : 'Update Password'}
          </Button>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-lake/10 flex items-center justify-center">
              <Database className="w-4 h-4 text-lake" />
            </div>
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Platform', value: 'Lovable Cloud' },
              { label: 'Framework', value: 'React + Vite' },
              { label: 'Database', value: 'PostgreSQL' },
              { label: 'Auth', value: 'Email + Password' },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/40">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger */}
      <Card className="border border-destructive/20 bg-destructive/5 shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-destructive">⚠️ Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">These actions are irreversible. Proceed with caution.</p>
          <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground" size="sm">
            Export All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}