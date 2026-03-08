import { useState, useEffect } from 'react';
import { Loader2, Search, Shield, User, Mail, Calendar, RefreshCw, MoreVertical, UserPlus, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { usersApi } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const { data, error } = await usersApi.getAll();
    if (!error && data) setUsers(data as UserData[]);
    else if (error) toast({ title: 'Error', description: error, variant: 'destructive' });
    setIsLoading(false);
  };

  const toggleAdminRole = async (userId: string, currentlyAdmin: boolean) => {
    if (currentlyAdmin) {
      const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
      if (error) toast({ title: 'Error', description: 'Failed to remove admin role', variant: 'destructive' });
      else { toast({ title: 'Success', description: 'Admin role removed' }); fetchData(); }
    } else {
      const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
      if (error) toast({ title: 'Error', description: 'Failed to add admin role', variant: 'destructive' });
      else { toast({ title: 'Success', description: 'Admin role added' }); fetchData(); }
    }
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  const adminCount = users.filter(u => u.role === 'admin').length;

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-card bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{users.length}</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card bg-gradient-to-br from-accent/5 to-accent/10">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{adminCount}</p>
            <p className="text-xs text-muted-foreground">Admins</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-card bg-gradient-to-br from-emerald-500/5 to-emerald-500/10">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{users.length - adminCount}</p>
            <p className="text-xs text-muted-foreground">Regular Users</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Actions */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users by name, email, or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
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
            return (
              <Card key={user.id} className="border-0 shadow-card hover:shadow-lg transition-shadow group">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-primary">
                          {(user.full_name || user.email)?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-foreground truncate">{user.full_name || 'Unnamed'}</p>
                        <Badge variant={isAdmin ? 'default' : 'secondary'} className="text-[10px] h-5 flex-shrink-0">
                          {isAdmin ? <><Shield className="w-3 h-3 mr-0.5" /> Admin</> : 'User'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                      {user.phone && <p className="text-xs text-muted-foreground">{user.phone}</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="text-[11px] text-muted-foreground space-y-0.5">
                      <p className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined {new Date(user.created_at).toLocaleDateString()}</p>
                      {user.last_sign_in_at && (
                        <p>Last login: {new Date(user.last_sign_in_at).toLocaleDateString()}</p>
                      )}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant={isAdmin ? 'destructive' : 'outline'} size="sm" className="text-xs h-7 gap-1">
                          {isAdmin ? <><UserMinus className="w-3 h-3" /> Remove</> : <><UserPlus className="w-3 h-3" /> Make Admin</>}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{isAdmin ? 'Remove Admin Role?' : 'Grant Admin Role?'}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {isAdmin
                              ? `This will remove admin privileges from ${user.full_name || user.email}.`
                              : `This will grant full admin access to ${user.full_name || user.email}.`
                            }
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
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}