import { useState, useEffect } from 'react';
import { Bell, Mail, Phone, MessageSquare, Loader2, Save, Trash2, Plus, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NotificationSettings {
  booking_email_enabled: boolean;
  booking_sms_enabled: boolean;
  booking_whatsapp_enabled: boolean;
  admin_emails: string[];
  admin_phone: string;
  new_booking_notify: boolean;
  booking_status_notify: boolean;
  new_feedback_notify: boolean;
  low_availability_notify: boolean;
  daily_summary_enabled: boolean;
}

const defaultSettings: NotificationSettings = {
  booking_email_enabled: true,
  booking_sms_enabled: false,
  booking_whatsapp_enabled: true,
  admin_emails: ['admin@industours.pk'],
  admin_phone: '+923118088007',
  new_booking_notify: true,
  booking_status_notify: true,
  new_feedback_notify: true,
  low_availability_notify: false,
  daily_summary_enabled: false,
};

export default function AdminNotifications() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('site_content').select('key, value');
    if (data) {
      const obj = { ...defaultSettings };
      data.forEach(item => {
        if (item.key === 'notification_settings' && typeof item.value === 'object') {
          Object.assign(obj, item.value);
        }
      });
      setSettings(obj);
    }
    setIsLoading(false);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('site_content').upsert({
        key: 'notification_settings',
        value: settings as any,
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' });
      toast({ title: 'Success', description: 'Notification settings saved' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' });
    } finally { setIsSaving(false); }
  };

  const addEmail = () => {
    if (newEmail && newEmail.includes('@') && !settings.admin_emails.includes(newEmail)) {
      setSettings({ ...settings, admin_emails: [...settings.admin_emails, newEmail] });
      setNewEmail('');
    }
  };

  const removeEmail = (email: string) => {
    setSettings({ ...settings, admin_emails: settings.admin_emails.filter(e => e !== email) });
  };

  const Toggle = ({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) => (
    <button onClick={() => onChange(!value)} className="w-full flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] transition-all">
      <span className="text-sm text-foreground">{label}</span>
      {value ? <ToggleRight className="w-6 h-6 text-primary" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
    </button>
  );

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="channels" className="space-y-6">
        <TabsList className="bg-card/50 border border-border/50">
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="recipients">Recipients</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-4">
          <Card className="border-border/50 bg-card/30">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Bell className="w-4 h-4 text-primary" /> Notification Channels</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Toggle value={settings.booking_email_enabled} onChange={v => setSettings({...settings, booking_email_enabled: v})} label="📧 Email Notifications" />
              <Toggle value={settings.booking_sms_enabled} onChange={v => setSettings({...settings, booking_sms_enabled: v})} label="📱 SMS Notifications" />
              <Toggle value={settings.booking_whatsapp_enabled} onChange={v => setSettings({...settings, booking_whatsapp_enabled: v})} label="💬 WhatsApp Notifications" />
              <Toggle value={settings.daily_summary_enabled} onChange={v => setSettings({...settings, daily_summary_enabled: v})} label="📊 Daily Summary Report" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card className="border-border/50 bg-card/30">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="w-4 h-4 text-emerald-400" /> Event Triggers</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Toggle value={settings.new_booking_notify} onChange={v => setSettings({...settings, new_booking_notify: v})} label="🎫 New Booking Received" />
              <Toggle value={settings.booking_status_notify} onChange={v => setSettings({...settings, booking_status_notify: v})} label="🔄 Booking Status Changed" />
              <Toggle value={settings.new_feedback_notify} onChange={v => setSettings({...settings, new_feedback_notify: v})} label="⭐ New Feedback Submitted" />
              <Toggle value={settings.low_availability_notify} onChange={v => setSettings({...settings, low_availability_notify: v})} label="⚠️ Low Tour Availability" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recipients" className="space-y-4">
          <Card className="border-border/50 bg-card/30">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Mail className="w-4 h-4 text-blue-400" /> Admin Emails</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Add admin email..." className="bg-background/50" onKeyDown={e => e.key === 'Enter' && addEmail()} />
                <Button onClick={addEmail} size="sm" className="shrink-0"><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-2">
                {settings.admin_emails.map(email => (
                  <div key={email} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm font-mono">{email}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeEmail(email)} className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/30">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-400" /> Phone</CardTitle></CardHeader>
            <CardContent>
              <Input value={settings.admin_phone} onChange={e => setSettings({...settings, admin_phone: e.target.value})} placeholder="+92..." className="bg-background/50" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={isSaving} size="lg">
          {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Settings</>}
        </Button>
      </div>
    </div>
  );
}
