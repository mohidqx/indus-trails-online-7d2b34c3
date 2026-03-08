import { useState } from 'react';
import { Mail, FileText, Eye, Code, Palette, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  type: 'booking' | 'status' | 'welcome' | 'feedback' | 'custom';
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: 'booking_confirmation',
    name: 'Booking Confirmation',
    subject: 'Booking Confirmed - {{tour_name}}',
    body: `Dear {{customer_name}},\n\nThank you for booking with Indus Tours Pakistan!\n\n📋 Booking Details:\n• Tour: {{tour_name}}\n• Date: {{travel_date}}\n• Travelers: {{num_travelers}}\n• Total: PKR {{total_price}}\n\nOur team will contact you shortly with further details.\n\nBest regards,\nIndus Tours Pakistan\n📞 +92 311 8088007`,
    variables: ['customer_name', 'tour_name', 'travel_date', 'num_travelers', 'total_price'],
    type: 'booking',
  },
  {
    id: 'status_update',
    name: 'Status Update',
    subject: 'Booking Status Updated - {{tour_name}}',
    body: `Dear {{customer_name}},\n\nYour booking status has been updated.\n\n📋 Details:\n• Tour: {{tour_name}}\n• New Status: {{status}}\n• Date: {{travel_date}}\n\nIf you have any questions, please contact us.\n\nBest regards,\nIndus Tours Pakistan`,
    variables: ['customer_name', 'tour_name', 'status', 'travel_date'],
    type: 'status',
  },
  {
    id: 'welcome_email',
    name: 'Welcome Email',
    subject: 'Welcome to Indus Tours Pakistan! 🏔️',
    body: `Dear {{customer_name}},\n\nWelcome to Indus Tours Pakistan!\n\nWe're thrilled to have you join our community of adventurers. Explore our tours to the stunning northern regions of Pakistan.\n\n🌄 Popular Destinations:\n• Hunza Valley\n• Skardu & Deosai\n• Fairy Meadows\n• Swat Valley\n\nVisit our website to browse tours and book your next adventure!\n\nBest regards,\nShahzaib Khan Mughal\nFounder, Indus Tours Pakistan`,
    variables: ['customer_name'],
    type: 'welcome',
  },
  {
    id: 'feedback_request',
    name: 'Feedback Request',
    subject: 'How was your trip? - {{tour_name}}',
    body: `Dear {{customer_name}},\n\nWe hope you enjoyed your {{tour_name}} tour!\n\nWe'd love to hear about your experience. Your feedback helps us improve our services.\n\nPlease visit our website to leave a review.\n\nThank you!\nIndus Tours Pakistan`,
    variables: ['customer_name', 'tour_name'],
    type: 'feedback',
  },
  {
    id: 'abandoned_booking',
    name: 'Abandoned Booking Recovery',
    subject: 'You left something behind! Complete your {{tour_name}} booking 🏔️',
    body: `Dear {{customer_name}},\n\nWe noticed you started booking the {{tour_name}} tour but didn't complete it.\n\nDon't miss out on this incredible adventure! Your spot is still available.\n\n📋 Your Booking Details:\n• Tour: {{tour_name}}\n• Date: {{travel_date}}\n• Travelers: {{num_travelers}}\n\n🎁 Complete your booking now and get a special discount!\n\n👉 Click here to resume your booking: {{recovery_link}}\n\nIf you faced any issues or have questions, feel free to reach out to us:\n📞 +92 311 8088007\n💬 WhatsApp: +92 311 8088007\n\nWe'd love to help you plan your dream trip!\n\nBest regards,\nShahzaib Khan Mughal\nFounder, Indus Tours Pakistan`,
    variables: ['customer_name', 'tour_name', 'travel_date', 'num_travelers', 'recovery_link'],
    type: 'custom',
  },
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

  const current = templates.find(t => t.id === activeTemplate) || templates[0];

  const updateTemplate = (field: keyof EmailTemplate, value: string) => {
    setTemplates(prev => prev.map(t => t.id === activeTemplate ? { ...t, [field]: value } : t));
  };

  const previewBody = (body: string) => {
    return body
      .replace(/\{\{customer_name\}\}/g, 'Muhammad Mohid')
      .replace(/\{\{tour_name\}\}/g, 'Hunza Valley Explorer - 7 Days')
      .replace(/\{\{travel_date\}\}/g, 'March 15, 2026')
      .replace(/\{\{num_travelers\}\}/g, '4')
      .replace(/\{\{total_price\}\}/g, '180,000')
      .replace(/\{\{status\}\}/g, 'Confirmed');
  };

  const handleSave = () => {
    toast({ title: 'Templates Saved', description: 'Email templates have been updated successfully.' });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <Card className="border-border/50 bg-card/30">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-3">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTemplate(t.id)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  activeTemplate === t.id ? 'bg-primary/10 border border-primary/20' : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{t.name}</span>
                  <Badge variant="outline" className={`text-[9px] ${typeColors[t.type]}`}>{t.type}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground truncate">{t.subject}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Editor */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/50 bg-card/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" /> {current.name}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant={previewMode ? 'default' : 'outline'} size="sm" onClick={() => setPreviewMode(!previewMode)} className="h-7 text-xs gap-1">
                    {previewMode ? <Code className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {previewMode ? 'Edit' : 'Preview'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Subject Line</label>
                <Input value={current.subject} onChange={e => updateTemplate('subject', e.target.value)} className="bg-background/50" disabled={previewMode} />
              </div>

              {previewMode ? (
                <div className="p-6 rounded-xl bg-white/[0.03] border border-white/[0.05] whitespace-pre-wrap text-sm text-gray-300 font-mono leading-relaxed">
                  {previewBody(current.body)}
                </div>
              ) : (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Email Body</label>
                  <Textarea value={current.body} onChange={e => updateTemplate('body', e.target.value)} rows={14} className="bg-background/50 font-mono text-xs" />
                </div>
              )}

              {/* Variables */}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Available Variables</p>
                <div className="flex flex-wrap gap-1.5">
                  {current.variables.map(v => (
                    <Badge key={v} variant="outline" className="text-[10px] px-2 py-0.5 border-primary/20 text-primary font-mono cursor-pointer hover:bg-primary/10" onClick={() => { if (!previewMode) { navigator.clipboard.writeText(`{{${v}}}`); toast({ title: 'Copied', description: `{{${v}}} copied to clipboard` }); } }}>
                      {`{{${v}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" size="lg" className="gap-2">
              <Send className="w-4 h-4" /> Send Test Email
            </Button>
            <Button onClick={handleSave} size="lg" className="gap-2">
              <Palette className="w-4 h-4" /> Save Templates
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
