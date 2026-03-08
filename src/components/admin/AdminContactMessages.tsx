import { useState, useEffect } from 'react';
import { Loader2, Mail, MailOpen, Trash2, Search, Inbox, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminContactMessages() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    fetchMessages();
    const channel = supabase.channel('contact-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, () => fetchMessages())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchMessages = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (!error && data) setMessages(data as ContactMessage[]);
    setIsLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase.from('contact_messages').update({ is_read: true } as Record<string, unknown>).eq('id', id);
    toast({ title: 'Marked as read' });
  };

  const deleteMessage = async (id: string) => {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    else { toast({ title: 'Deleted' }); fetchMessages(); }
  };

  const openMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (!msg.is_read) {
      await markAsRead(msg.id);
    }
  };

  const filtered = messages.filter(m => {
    const matchFilter = filter === 'all' || (filter === 'unread' && !m.is_read) || (filter === 'read' && m.is_read);
    const matchSearch = search === '' || m.name.toLowerCase().includes(search.toLowerCase()) || m.subject.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const unreadCount = messages.filter(m => !m.is_read).length;

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: messages.length, color: 'from-primary/5 to-primary/10' },
          { label: 'Unread', value: unreadCount, color: 'from-accent/5 to-accent/10' },
          { label: 'Read', value: messages.length - unreadCount, color: 'from-emerald-500/5 to-emerald-500/10' },
        ].map((stat, i) => (
          <Card key={i} className={`border-0 shadow-card bg-gradient-to-br ${stat.color}`}>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search messages..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'unread', 'read'] as const).map((f) => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)} className="capitalize text-xs h-8">
              {f} {f === 'unread' && unreadCount > 0 && `(${unreadCount})`}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card className="border-0 shadow-card">
            <CardContent className="p-12 text-center text-muted-foreground">
              <Inbox className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No messages found</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((msg) => (
            <Card key={msg.id} className={`border-0 shadow-card hover:shadow-lg transition-shadow cursor-pointer ${!msg.is_read ? 'ring-1 ring-primary/20 bg-primary/[0.02]' : ''}`}>
              <CardContent className="p-4" onClick={() => openMessage(msg)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${!msg.is_read ? 'bg-primary/10' : 'bg-muted'}`}>
                      {!msg.is_read ? <Mail className="w-4 h-4 text-primary" /> : <MailOpen className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className={`text-sm truncate ${!msg.is_read ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>{msg.subject}</h3>
                        {!msg.is_read && <Badge className="text-[9px] h-4 bg-primary/10 text-primary border-0">New</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{msg.name} • {msg.email}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1">{msg.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(msg.created_at).toLocaleDateString()}</span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this message?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMessage(msg.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">{selectedMessage?.subject}</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">From:</span> <span className="font-medium">{selectedMessage.name}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <a href={`mailto:${selectedMessage.email}`} className="font-medium text-primary hover:underline">{selectedMessage.email}</a></div>
                {selectedMessage.phone && <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{selectedMessage.phone}</span></div>}
                <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{new Date(selectedMessage.created_at).toLocaleString()}</span></div>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" asChild>
                  <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}>Reply via Email</a>
                </Button>
                {selectedMessage.phone && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={`https://wa.me/${selectedMessage.phone.replace(/\s/g, '').replace('+', '')}`} target="_blank">WhatsApp</a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
