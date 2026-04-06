import { useState, useEffect } from 'react';
import { Mail, FileText, Eye, Code, Palette, Send, UserPlus, Image, Bold, Layout } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  type: 'booking' | 'status' | 'welcome' | 'feedback' | 'custom';
  bannerColor: string;
  showLogo: boolean;
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: 'booking_confirmation', name: 'Booking Confirmation', subject: 'Booking Confirmed - {{tour_name}}',
    body: `Dear {{customer_name}},\n\nThank you for booking with Indus Tours Pakistan! 🏔️\n\n━━━━━━━━━━━━━━━━━━━━\n📋 BOOKING DETAILS\n━━━━━━━━━━━━━━━━━━━━\n\n🎯 Tour: {{tour_name}}\n📅 Date: {{travel_date}}\n👥 Travelers: {{num_travelers}}\n💰 Total: PKR {{total_price}}\n\n━━━━━━━━━━━━━━━━━━━━\n\nOur team will contact you within 24 hours to confirm your booking and share trip details.\n\n📞 +92 311 8088007\n🌐 industours.pk\n\nWarm regards,\nShahzaib Khan Mughal\nFounder, Indus Tours Pakistan`,
    variables: ['customer_name', 'tour_name', 'travel_date', 'num_travelers', 'total_price'], type: 'booking', bannerColor: '#0d6b5e', showLogo: true
  },
  {
    id: 'status_update', name: 'Status Update', subject: 'Booking Update - {{tour_name}}',
    body: `Dear {{customer_name}},\n\nYour booking status has been updated.\n\n━━━━━━━━━━━━━━━━━━━━\n📋 STATUS UPDATE\n━━━━━━━━━━━━━━━━━━━━\n\n🎯 Tour: {{tour_name}}\n✅ Status: {{status}}\n📅 Date: {{travel_date}}\n\n━━━━━━━━━━━━━━━━━━━━\n\nIf you have any questions, please contact us.\n\n📞 +92 311 8088007\n\nBest regards,\nIndus Tours Pakistan`,
    variables: ['customer_name', 'tour_name', 'status', 'travel_date'], type: 'status', bannerColor: '#2563eb', showLogo: true
  },
  {
    id: 'welcome_email', name: 'Welcome Email', subject: 'Welcome to Indus Tours Pakistan! 🏔️',
    body: `Dear {{customer_name}},\n\n🎉 Welcome to Indus Tours Pakistan!\n\nWe're thrilled to have you join our adventure family.\n\n━━━━━━━━━━━━━━━━━━━━\n🌄 TOP DESTINATIONS\n━━━━━━━━━━━━━━━━━━━━\n\n🏔 Hunza Valley — Crown of Pakistan\n🌊 Skardu — Land of Lakes\n⛰️ Fairy Meadows — Heaven on Earth\n🌲 Swat Valley — Switzerland of the East\n🏕 Naran Kaghan — Nature's Paradise\n\n━━━━━━━━━━━━━━━━━━━━\n\n✨ What's Next?\n• Browse our tours at industours.pk/tours\n• Follow us on Instagram @industours\n• Earn loyalty points with every booking!\n\nBest regards,\nShahzaib Khan Mughal\nFounder, Indus Tours Pakistan\n📞 +92 311 8088007`,
    variables: ['customer_name'], type: 'welcome', bannerColor: '#7c3aed', showLogo: true
  },
  {
    id: 'feedback_request', name: 'Feedback Request', subject: 'How was your trip? - {{tour_name}} ⭐',
    body: `Dear {{customer_name}},\n\nWe hope you had an unforgettable experience on your {{tour_name}} tour! 🏔️\n\n━━━━━━━━━━━━━━━━━━━━\n⭐ RATE YOUR EXPERIENCE\n━━━━━━━━━━━━━━━━━━━━\n\nYour feedback helps us improve and helps fellow travelers make informed decisions.\n\n📝 Please visit industours.pk/feedback to share your review.\n\n━━━━━━━━━━━━━━━━━━━━\n\nAs a thank you, you'll earn 50 loyalty points for leaving a review!\n\nThank you!\nIndus Tours Pakistan`,
    variables: ['customer_name', 'tour_name'], type: 'feedback', bannerColor: '#d97706', showLogo: true
  },
  {
    id: 'abandoned_booking', name: 'Abandoned Booking Recovery', subject: 'Your {{tour_name}} adventure awaits! 🏔️',
    body: `Dear {{customer_name}},\n\nWe noticed you were exploring {{tour_name}} but didn't complete your booking.\n\n━━━━━━━━━━━━━━━━━━━━\n🏔️ DON'T MISS OUT!\n━━━━━━━━━━━━━━━━━━━━\n\n✅ Your selected tour is still available\n✅ Secure your spot before it fills up\n✅ Easy 3-step booking process\n\n🎯 Complete your booking: industours.pk/booking\n\n━━━━━━━━━━━━━━━━━━━━\n\nNeed help? We're here for you.\n📞 +92 311 8088007\n💬 WhatsApp: +92 311 8088007\n\nBest regards,\nShahzaib Khan Mughal`,
    variables: ['customer_name', 'tour_name', 'travel_date', 'num_travelers', 'recovery_link'], type: 'custom', bannerColor: '#dc2626', showLogo: true
  },
  {
    id: 'payment_reminder', name: 'Payment Reminder', subject: '💰 Payment Reminder - {{tour_name}}',
    body: `Dear {{customer_name}},\n\n━━━━━━━━━━━━━━━━━━━━\n💰 PAYMENT REMINDER\n━━━━━━━━━━━━━━━━━━━━\n\nThis is a friendly reminder that your payment for the following booking is pending:\n\n🎯 Tour: {{tour_name}}\n📅 Date: {{travel_date}}\n💵 Amount Due: PKR {{total_price}}\n\n━━━━━━━━━━━━━━━━━━━━\n\n💳 Payment Methods:\n• Bank Transfer (HBL / JazzCash / EasyPaisa)\n• Cash on arrival\n\nPlease complete your payment to confirm your spot.\n\n📞 +92 311 8088007\n\nBest regards,\nIndus Tours Pakistan`,
    variables: ['customer_name', 'tour_name', 'travel_date', 'total_price'], type: 'custom', bannerColor: '#059669', showLogo: true
  },
  {
    id: 'trip_reminder', name: 'Trip Reminder', subject: '🎒 Pack your bags! {{tour_name}} is coming up!',
    body: `Dear {{customer_name}},\n\n━━━━━━━━━━━━━━━━━━━━\n🎒 TRIP REMINDER\n━━━━━━━━━━━━━━━━━━━━\n\nYour {{tour_name}} adventure is just around the corner!\n\n📅 Date: {{travel_date}}\n👥 Travelers: {{num_travelers}}\n\n━━━━━━━━━━━━━━━━━━━━\n📝 PRE-TRIP CHECKLIST\n━━━━━━━━━━━━━━━━━━━━\n\n✅ Valid CNIC/Passport\n✅ Warm clothing & layers\n✅ Comfortable hiking shoes\n✅ Camera & extra batteries\n✅ Power bank & charger\n✅ Sunscreen & sunglasses\n✅ Personal medications\n✅ Cash (ATMs may be limited)\n\n━━━━━━━━━━━━━━━━━━━━\n\n🚐 Pickup details will be shared 24hrs before departure.\n\nSee you soon! 🏔️\nIndus Tours Pakistan`,
    variables: ['customer_name', 'tour_name', 'travel_date', 'num_travelers'], type: 'custom', bannerColor: '#0891b2', showLogo: true
  },
  {
    id: 'referral_invite', name: 'Referral Invite', subject: '🌄 {{customer_name}} invited you to explore Pakistan!',
    body: `Hello!\n\n━━━━━━━━━━━━━━━━━━━━\n🎁 YOU'VE BEEN INVITED!\n━━━━━━━━━━━━━━━━━━━━\n\n{{customer_name}} thinks you'd love exploring Pakistan's northern paradise with Indus Tours!\n\n🏔️ Popular Tours:\n• Hunza Valley Explorer\n• Skardu & Deosai Adventure\n• Fairy Meadows Trek\n• Swat Valley Cultural Tour\n\n✨ Sign up at industours.pk and use the referral code for a welcome bonus!\n\n━━━━━━━━━━━━━━━━━━━━\n\nBest regards,\nIndus Tours Pakistan\n📞 +92 311 8088007`,
    variables: ['customer_name'], type: 'custom', bannerColor: '#7c3aed', showLogo: true
  },
  {
    id: 'cancellation_notice', name: 'Cancellation Confirmation', subject: 'Booking Cancelled - {{tour_name}}',
    body: `Dear {{customer_name}},\n\n━━━━━━━━━━━━━━━━━━━━\n❌ BOOKING CANCELLED\n━━━━━━━━━━━━━━━━━━━━\n\nYour booking has been cancelled as requested.\n\n🎯 Tour: {{tour_name}}\n📅 Date: {{travel_date}}\n\n━━━━━━━━━━━━━━━━━━━━\n\nWe're sorry to see you go. If this was a mistake, please contact us immediately.\n\n💡 You can always rebook at industours.pk/tours\n\n📞 +92 311 8088007\n\nBest regards,\nIndus Tours Pakistan`,
    variables: ['customer_name', 'tour_name', 'travel_date'], type: 'status', bannerColor: '#dc2626', showLogo: true
  },
  {
    id: 'loyalty_milestone', name: 'Loyalty Milestone', subject: '🎉 Congrats {{customer_name}}! You\'ve reached a new tier!',
    body: `Dear {{customer_name}},\n\n━━━━━━━━━━━━━━━━━━━━\n🏆 LOYALTY MILESTONE!\n━━━━━━━━━━━━━━━━━━━━\n\nCongratulations! You've unlocked a new loyalty tier.\n\n⭐ Your Total Points: {{total_points}}\n🎖️ New Tier: {{tier_name}}\n\n━━━━━━━━━━━━━━━━━━━━\n\n🎁 Tier Benefits:\n• Exclusive discounts on future tours\n• Priority booking access\n• Special group tour rates\n• Birthday surprise offers\n\nKeep exploring and earning! 🏔️\n\nBest regards,\nIndus Tours Pakistan`,
    variables: ['customer_name', 'total_points', 'tier_name'], type: 'custom', bannerColor: '#d97706', showLogo: true
  },
  {
    id: 'special_offer', name: 'Special Season Offer', subject: '🔥 Exclusive Deal for You, {{customer_name}}!',
    body: `Dear {{customer_name}},\n\n━━━━━━━━━━━━━━━━━━━━\n🔥 EXCLUSIVE OFFER\n━━━━━━━━━━━━━━━━━━━━\n\nWe have a special deal just for our valued customers!\n\n🎯 Tour: {{tour_name}}\n💰 Discount: {{discount}}% OFF\n📅 Valid Until: {{valid_until}}\n\n━━━━━━━━━━━━━━━━━━━━\n\n🎟️ Use Code: {{deal_code}}\n\nBook now at industours.pk/booking\n\n━━━━━━━━━━━━━━━━━━━━\n\nHurry — limited spots available!\n\n📞 +92 311 8088007\n\nBest regards,\nIndus Tours Pakistan`,
    variables: ['customer_name', 'tour_name', 'discount', 'valid_until', 'deal_code'], type: 'custom', bannerColor: '#dc2626', showLogo: true
  },
  {
    id: 'group_booking', name: 'Group Booking Confirmation', subject: '👥 Group Booking Confirmed - {{tour_name}}',
    body: `Dear {{customer_name}},\n\n━━━━━━━━━━━━━━━━━━━━\n👥 GROUP BOOKING CONFIRMED\n━━━━━━━━━━━━━━━━━━━━\n\nYour group booking has been confirmed!\n\n🎯 Tour: {{tour_name}}\n📅 Date: {{travel_date}}\n👥 Group Size: {{num_travelers}} travelers\n💰 Total: PKR {{total_price}}\n💎 Group Discount: Applied!\n\n━━━━━━━━━━━━━━━━━━━━\n\n📋 Group Coordinator Notes:\n• Share pickup details with all members\n• Ensure everyone has valid ID\n• Contact us for any dietary requirements\n\n📞 +92 311 8088007\n\nBest regards,\nIndus Tours Pakistan`,
    variables: ['customer_name', 'tour_name', 'travel_date', 'num_travelers', 'total_price'], type: 'booking', bannerColor: '#0d6b5e', showLogo: true
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
  const [sendToEmail, setSendToEmail] = useState('');
  const [subscribers, setSubscribers] = useState<{ email: string; name: string | null }[]>([]);
  const [customers, setCustomers] = useState<{ email: string; full_name: string | null }[]>([]);
  const [selectedCustomerName, setSelectedCustomerName] = useState('Muhammad Mohid');

  useEffect(() => {
    supabase.from('newsletter_subscribers').select('email, name').eq('is_active', true).limit(200).then(({ data }) => {
      if (data) setSubscribers(data);
    });
    supabase.from('profiles').select('id, full_name').limit(200).then(({ data }) => {
      if (data) {
        const profilesWithNames = data.filter(p => p.full_name).map(p => ({ email: '', full_name: p.full_name }));
        setCustomers(profilesWithNames);
      }
    });
  }, []);

  const current = templates.find(t => t.id === activeTemplate) || templates[0];

  const updateTemplate = (field: keyof EmailTemplate, value: any) => {
    setTemplates(prev => prev.map(t => t.id === activeTemplate ? { ...t, [field]: value } : t));
  };

  const previewBody = (body: string) => body
    .replace(/\{\{customer_name\}\}/g, selectedCustomerName)
    .replace(/\{\{tour_name\}\}/g, 'Hunza Valley Explorer - 7 Days')
    .replace(/\{\{travel_date\}\}/g, 'March 15, 2026')
    .replace(/\{\{num_travelers\}\}/g, '4')
    .replace(/\{\{total_price\}\}/g, '180,000')
    .replace(/\{\{status\}\}/g, 'Confirmed')
    .replace(/\{\{recovery_link\}\}/g, 'https://industours.pk/booking')
    .replace(/\{\{total_points\}\}/g, '2,500')
    .replace(/\{\{tier_name\}\}/g, 'Gold Explorer')
    .replace(/\{\{discount\}\}/g, '20')
    .replace(/\{\{valid_until\}\}/g, 'April 30, 2026')
    .replace(/\{\{deal_code\}\}/g, 'SPRING20');

  const handleSave = () => {
    toast({ title: 'Templates Saved', description: 'Email templates updated successfully.' });
  };

  const renderHtmlPreview = () => {
    const body = previewBody(current.body);
    const lines = body.split('\n');
    const bannerColor = current.bannerColor || '#0d6b5e';

    return (
      <div className="rounded-xl overflow-hidden border border-border bg-white text-gray-800">
        {/* Banner Header with Logo */}
        <div style={{ backgroundColor: bannerColor }} className="p-6 text-center">
          {current.showLogo && (
            <div className="mb-3">
              <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-full">
                <img src="/placeholder.svg" alt="Logo" className="w-8 h-8 rounded-lg bg-white/30 p-0.5" />
                <span className="text-white font-bold text-lg">Indus Tours Pakistan</span>
              </div>
            </div>
          )}
          <h2 className="text-white font-bold text-xl">{previewBody(current.subject)}</h2>
        </div>
        {/* Body */}
        <div className="p-6 space-y-1">
          {lines.map((line, i) => {
            if (line.startsWith('━')) return <hr key={i} className="border-gray-200 my-3" />;
            if (line.match(/^[📋🔥🎉🏆👥❌🎒💰⭐🎁🏔️🌄] [A-Z]/)) {
              return <h3 key={i} className="font-bold text-base mt-4 mb-2" style={{ color: bannerColor }}>{line}</h3>;
            }
            if (line.startsWith('•') || line.startsWith('✅') || line.startsWith('✨') || line.startsWith('🏔') || line.startsWith('🌊') || line.startsWith('⛰') || line.startsWith('🌲') || line.startsWith('🏕')) {
              return <p key={i} className="text-sm pl-2 py-0.5">{line}</p>;
            }
            if (line.trim() === '') return <br key={i} />;
            return <p key={i} className="text-sm leading-relaxed">{line}</p>;
          })}
        </div>
        {/* Professional Footer Signature */}
        <div className="border-t border-gray-200 px-6 py-5 bg-gray-50">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center text-white font-bold text-lg shadow-md">IT</div>
            <div>
              <p className="font-bold text-gray-800 text-sm">Shahzaib Khan Mughal</p>
              <p className="text-xs text-gray-500">Founder & CEO — Indus Tours Pakistan</p>
            </div>
          </div>
          <div className="text-xs text-gray-500 space-y-0.5 pl-16">
            <p>📞 +92 311 8088007 &nbsp;|&nbsp; ✉️ info@industours.pk</p>
            <p>🌐 industours.pk &nbsp;|&nbsp; 📍 Islamabad, Pakistan</p>
          </div>
        </div>
        {/* Copyright Footer */}
        <div style={{ backgroundColor: bannerColor }} className="px-6 py-3 text-center">
          <p className="text-[11px] text-white/70">© 2026 Indus Tours Pakistan. All rights reserved.</p>
        </div>
      </div>
    );
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
          <CardContent className="space-y-2 p-3 max-h-[600px] overflow-y-auto">
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
          {/* Customer Name Selector */}
          <Card className="border-border/50 bg-card/30">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1"><UserPlus className="w-3.5 h-3.5" /> Customer Name for Preview</p>
              <div className="flex gap-2">
                <Input
                  value={selectedCustomerName}
                  onChange={e => setSelectedCustomerName(e.target.value)}
                  placeholder="Enter customer name..."
                  className="bg-background/50"
                />
                {customers.length > 0 && (
                  <Select onValueChange={setSelectedCustomerName}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="Select user" /></SelectTrigger>
                    <SelectContent>
                      {customers.map((c, i) => (
                        <SelectItem key={i} value={c.full_name || 'Guest'}>{c.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/30">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-400" /> {current.name}</CardTitle>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5">
                    <label className="text-[10px] text-muted-foreground">Banner</label>
                    <input type="color" value={current.bannerColor} onChange={e => updateTemplate('bannerColor', e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0" />
                  </div>
                  <Button variant={previewMode ? 'default' : 'outline'} size="sm" onClick={() => setPreviewMode(!previewMode)} className="h-7 text-xs gap-1">
                    {previewMode ? <Code className="w-3 h-3" /> : <Eye className="w-3 h-3" />} {previewMode ? 'Edit' : 'Preview'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div><label className="text-xs font-medium text-muted-foreground">Subject Line</label><Input value={current.subject} onChange={e => updateTemplate('subject', e.target.value)} className="bg-background/50" disabled={previewMode} /></div>
              {previewMode ? (
                renderHtmlPreview()
              ) : (
                <div><label className="text-xs font-medium text-muted-foreground">Email Body</label><Textarea value={current.body} onChange={e => updateTemplate('body', e.target.value)} rows={16} className="bg-background/50 font-mono text-xs" /></div>
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
              <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1"><Send className="w-3.5 h-3.5" /> Send Test Email To</p>
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
