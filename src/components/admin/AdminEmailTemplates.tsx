import { useState, useEffect } from 'react';
import { Mail, FileText, Eye, Code, Palette, Send, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  type: 'booking' | 'status' | 'welcome' | 'feedback' | 'custom';
}

const defaultTemplates: EmailTemplate[] = [
  { id: 'booking_confirmation', name: 'Booking Confirmation', subject: 'Booking Confirmed - {{tour_name}}', body: `Dear {{customer_name}},\n\nThank you for booking with Indus Tours Pakistan!\n\n📋 Booking Details:\n• Tour: {{tour_name}}\n• Date: {{travel_date}}\n• Travelers: {{num_travelers}}\n• Total: PKR {{total_price}}\n\nOur team will contact you shortly.\n\nBest regards,\nIndus Tours Pakistan\n📞 +92 311 8088007`, variables: ['customer_name', 'tour_name', 'travel_date', 'num_travelers', 'total_price'], type: 'booking' },
  { id: 'status_update', name: 'Status Update', subject: 'Booking Status Updated - {{tour_name}}', body: `Dear {{customer_name}},\n\nYour booking status has been updated.\n\n• Tour: {{tour_name}}\n• New Status: {{status}}\n• Date: {{travel_date}}\n\nBest regards,\nIndus Tours Pakistan`, variables: ['customer_name', 'tour_name', 'status', 'travel_date'], type: 'status' },
  { id: 'welcome_email', name: 'Welcome Email', subject: 'Welcome to Indus Tours Pakistan! 🏔️', body: `Dear {{customer_name}},\n\nWelcome to Indus Tours Pakistan!\n\nExplore our tours to the stunning northern regions.\n\n🌄 Popular Destinations:\n• Hunza Valley\n• Skardu & Deosai\n• Fairy Meadows\n• Swat Valley\n\nBest regards,\nShahzaib Khan Mughal\nFounder, Indus Tours Pakistan`, variables: ['customer_name'], type: 'welcome' },
  { id: 'feedback_request', name: 'Feedback Request', subject: 'How was your trip? - {{tour_name}}', body: `Dear {{customer_name}},\n\nWe hope you enjoyed your {{tour_name}} tour!\n\nPlease visit our website to leave a review.\n\nThank you!\nIndus Tours Pakistan`, variables: ['customer_name', 'tour_name'], type: 'feedback' },
  { id: 'abandoned_booking', name: 'Abandoned Booking Recovery', subject: 'Complete your {{tour_name}} booking 🏔️', body: `Dear {{customer_name}},\n\nWe noticed you started booking {{tour_name}} but didn't complete it.\n\nYour spot is still available!\n\n📞 +92 311 8088007\n\nBest regards,\nShahzaib Khan Mughal`, variables: ['customer_name', 'tour_name', 'travel_date', 'num_travelers', 'recovery_link'], type: 'custom' },
  { id: 'payment_reminder', name: 'Payment Reminder', subject: 'Payment Reminder - {{tour_name}}', body: `Dear {{customer_name}},\n\nThis is a reminder that your payment for {{tour_name}} is pending.\n\nAmount Due: PKR {{total_price}}\n\n📞 +92 311 8088007\n\nBest regards,\nIndus Tours Pakistan`, variables: ['customer_name', 'tour_name', 'travel_date', 'total_price'], type: 'custom' },
  { id: 'trip_reminder', name: 'Trip Reminder', subject: 'Your {{tour_name}} trip is coming up! 🏔️', body: `Dear {{customer_name}},\n\nYour {{tour_name}} tour is just around the corner!\n\nDate: {{travel_date}}\n\n📝 Pre-Trip Checklist:\n✅ Valid CNIC/Passport\n✅ Warm clothing\n✅ Camera & power bank\n\nSee you soon!\nIndus Tours Pakistan`, variables: ['customer_name', 'tour_name', 'travel_date', 'num_travelers'], type: 'custom' },
  { id: 'referral_invite', name: 'Referral Invite', subject: '{{customer_name}} invited you to explore Pakistan! 🌄', body: `Hello!\n\n{{customer_name}} thinks you'd love exploring Pakistan with Indus Tours!\n\nUse their referral code for a welcome bonus.\n\nBest regards,\nIndus Tours Pakistan`, variables: ['customer_name'], type: 'custom' },
];

const typeColors: Record<string, string> = {
  booking: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  status: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  welcome: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  feedback: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  custom: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

export default function AdminEmailTemplates() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
  const [activeTemplate, setActiveTemplate] = useState<string>(templates[0].id);
  const [previewMode, setPreviewMode] = useState(false);
  const [sendToEmail, setSendToEmail] = useState('');
  const [subscribers, setSubscribers] = useState<{ email: string; name: string | null }[]>([]);

  useEffect(() => {
    supabase.from('newsletter_subscribers').select('email, name').eq('is_active', true).limit(200).then(({ data }) => {
      if (data) setSubscribers(data);
    });
  }, []);

  const current = templates.find(t => t.id === activeTemplate) || templates[0];

  const updateTemplate = (field: keyof EmailTemplate, value: string) => {
    setTemplates(prev => prev.map(t => t.id === activeTemplate ? { ...t, [field]: value } : t));
  };

  const previewBody = (body: string) => body
    .replace(/\{\{customer_name\}\}/g, 'Muhammad Mohid')
    .replace(/\{\{tour_name\}\}/g, 'Hunza Valley Explorer - 7 Days')
    .replace(/\{\{travel_date\}\}/g, 'March 15, 2026')
    .replace(/\{\{num_travelers\}\}/g, '4')
    .replace(/\{\{total_price\}\}/g, '180,000')
    .replace(/\{\{status\}\}/g, 'Confirmed')
    .replace(/\{\{recovery_link\}\}/g, 'https://industours.pk/booking');

  const handleSave = () => {
    toast({ title: 'Templates Saved', description: 'Email templates updated successfully.' });
  };

  const handleSendTest = () => {
    const email = sendToEmail.trim();
    if (!email) { toast({ title: 'Enter email', variant: 'destructive' }); return; }
    const subject = encodeURIComponent(previewBody(current.subject));
    const body = encodeURIComponent(previewBody(current.body) + '\n\n---\nSent from Indus Tours Pakistan\nShahzaib Khan Mughal | Founder\n📞 +92 311 8088007\n🌐 industours.pk');
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
    toast({ title: 'Email Client Opened', description: `Compose window opened for ${email}` });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-border/50 bg-card/30">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> Templates ({templates.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2 p-3 max-h-[500px] overflow-y-auto">
            {templates.map(t => (
              <button key={t.id} onClick={() => setActiveTemplate(t.id)} className={`w-full text-left p-3 rounded-lg transition-all ${activeTemplate === t.id ? 'bg-primary/10 border border-primary/20' : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.04]'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{t.name}</span>
                  <Badge variant="outline" className={`text-[9px] ${typeColors[t.type]}`}>{t.type}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground truncate">{t.subject}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/50 bg-card/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-400" /> {current.name}</CardTitle>
                <Button variant={previewMode ? 'default' : 'outline'} size="sm" onClick={() => setPreviewMode(!previewMode)} className="h-7 text-xs gap-1">
                  {previewMode ? <Code className="w-3 h-3" /> : <Eye className="w-3 h-3" />} {previewMode ? 'Edit' : 'Preview'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div><label className="text-xs font-medium text-muted-foreground">Subject Line</label><Input value={current.subject} onChange={e => updateTemplate('subject', e.target.value)} className="bg-background/50" disabled={previewMode} /></div>
              {previewMode ? (
                <div className="p-6 rounded-xl bg-white/[0.03] border border-white/[0.05] whitespace-pre-wrap text-sm text-gray-300 font-mono leading-relaxed">{previewBody(current.body)}</div>
              ) : (
                <div><label className="text-xs font-medium text-muted-foreground">Email Body</label><Textarea value={current.body} onChange={e => updateTemplate('body', e.target.value)} rows={14} className="bg-background/50 font-mono text-xs" /></div>
              )}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Available Variables</p>
                <div className="flex flex-wrap gap-1.5">
                  {current.variables.map(v => (
                    <Badge key={v} variant="outline" className="text-[10px] px-2 py-0.5 border-primary/20 text-primary font-mono cursor-pointer hover:bg-primary/10" onClick={() => { if (!previewMode) { navigator.clipboard.writeText(`{{${v}}}`); toast({ title: 'Copied', description: `{{${v}}} copied` }); } }}>{`{{${v}}}`}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/30">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1"><UserPlus className="w-3.5 h-3.5" /> Send Test Email To</p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input value={sendToEmail} onChange={e => setSendToEmail(e.target.value)} placeholder="Enter email or select subscriber..." list="subscriber-list" className="bg-background/50" />
                  <datalist id="subscriber-list">{subscribers.map(s => <option key={s.email} value={s.email}>{s.name || s.email}</option>)}</datalist>
                </div>
                <Button onClick={handleSendTest} className="gap-1"><Send className="w-4 h-4" /> Open in Mail</Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">Opens your default email app with template + Indus Tours signature</p>
            </CardContent>
          </Card>

          <div className="flex justify-end"><Button onClick={handleSave} size="lg" className="gap-2"><Palette className="w-4 h-4" /> Save Templates</Button></div>
        </div>
      </div>
    </div>
  );
}
